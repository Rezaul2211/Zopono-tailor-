import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  getDocFromServer,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Product, Order, MeasurementProfile, ProductReview } from './types';
import { INITIAL_PRODUCTS } from './data/defaultProducts';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Firestore with auto long-polling fallback for iframe/sandbox environments
const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, databaseId);

// Test connection on boot gracefully
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn('Firestore operating in offline mode or awaiting connection.');
    }
  }
}
testConnection();

// DEFAULT SUPER ADMIN EMAIL
export const SUPER_ADMIN_EMAIL = 'xmrezaul.karim998@gmail.com';

// Google Sign In
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          lastLogin: new Date().toISOString(),
        },
        { merge: true }
      );
    }
    return user;
  } catch (error: any) {
    console.error('Google Auth Popup Error:', error);
    throw error;
  }
};

// Sign Out
export const logoutUser = async () => {
  return await signOut(auth);
};

// Auth State Subscriber
export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ADMIN PERMISSION MANAGEMENT
export const subscribeToAdmins = (callback: (adminsList: string[]) => void) => {
  const adminsCol = collection(db, 'admins');
  return onSnapshot(
    adminsCol,
    (snapshot) => {
      const list: string[] = [SUPER_ADMIN_EMAIL.toLowerCase()];
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.email) {
          const lower = data.email.toLowerCase().trim();
          if (!list.includes(lower)) {
            list.push(lower);
          }
        }
      });
      callback(list);
    },
    (err) => {
      console.warn('Firestore Admins listener fallback:', err);
      // Fallback to default admin email
      callback([SUPER_ADMIN_EMAIL.toLowerCase()]);
    }
  );
};

export const addAdminEmailToFirestore = async (email: string) => {
  const sanitized = email.toLowerCase().trim();
  if (!sanitized) return;
  const docId = sanitized.replace(/[^a-zA-Z0-9]/g, '_');
  const adminRef = doc(db, 'admins', docId);
  await setDoc(adminRef, {
    email: sanitized,
    addedAt: new Date().toISOString(),
  });
};

export const removeAdminEmailFromFirestore = async (email: string) => {
  const sanitized = email.toLowerCase().trim();
  if (sanitized === SUPER_ADMIN_EMAIL.toLowerCase()) {
    throw new Error('Super Admin cannot be removed.');
  }
  const docId = sanitized.replace(/[^a-zA-Z0-9]/g, '_');
  const adminRef = doc(db, 'admins', docId);
  await deleteDoc(adminRef);
};

export const checkIsAdmin = (userEmail: string | null | undefined, adminList: string[]) => {
  if (!userEmail) return false;
  const lower = userEmail.toLowerCase().trim();
  if (lower === SUPER_ADMIN_EMAIL.toLowerCase()) return true;
  return adminList.some((adm) => adm.toLowerCase().trim() === lower);
};

// FIRESTORE PRODUCT HELPERS
export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  const productsCol = collection(db, 'products');
  return onSnapshot(
    productsCol,
    async (snapshot) => {
      if (snapshot.empty) {
        console.log('Seeding initial products to Firestore...');
        await seedDefaultProducts();
        return;
      }
      const prods: Product[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Product, 'id'>),
      }));
      callback(prods);
    },
    (err) => {
      console.warn('Firestore Products listener fallback (using default products catalog):', err);
      // Fallback immediately to initial static products so catalog is always populated
      callback(INITIAL_PRODUCTS);
    }
  );
};

export const seedDefaultProducts = async () => {
  try {
    const batchPromises = INITIAL_PRODUCTS.map((prod) => {
      const prodRef = doc(db, 'products', prod.id);
      return setDoc(prodRef, prod);
    });
    await Promise.all(batchPromises);
  } catch (err) {
    console.error('Failed to seed default products:', err);
  }
};

export const saveProductToFirestore = async (product: Product) => {
  const prodRef = doc(db, 'products', product.id);
  await setDoc(prodRef, product, { merge: true });
};

export const deleteProductFromFirestore = async (productId: string) => {
  const prodRef = doc(db, 'products', productId);
  await deleteDoc(prodRef);
};

// FIRESTORE ORDER HELPERS
export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  const ordersCol = collection(db, 'orders');
  return onSnapshot(
    ordersCol,
    (snapshot) => {
      const ords: Order[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Order, 'id'>),
      }));
      ords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      callback(ords);
    },
    (err) => {
      console.warn('Firestore Orders listener fallback:', err);
      callback([]);
    }
  );
};

export const saveOrderToFirestore = async (order: Order) => {
  const orderRef = doc(db, 'orders', order.id);
  await setDoc(orderRef, order, { merge: true });
};

export const updateOrderStatusInFirestore = async (
  orderId: string,
  status: Order['status'],
  notes?: string
) => {
  const orderRef = doc(db, 'orders', orderId);
  const updateData: any = { status };
  if (notes !== undefined) updateData.masterTailorNotes = notes;
  await setDoc(orderRef, updateData, { merge: true });
};

// FIRESTORE MEASUREMENT PROFILES
export const subscribeToUserProfiles = (
  userId: string,
  callback: (profiles: MeasurementProfile[]) => void
) => {
  const q = query(collection(db, 'measurementProfiles'), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const profs: MeasurementProfile[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<MeasurementProfile, 'id'>),
      }));
      callback(profs);
    },
    (err) => {
      console.warn('Firestore UserProfiles listener fallback:', err);
      callback([]);
    }
  );
};

export const saveUserProfileToFirestore = async (
  userId: string,
  profile: MeasurementProfile
) => {
  const profileRef = doc(db, 'measurementProfiles', profile.id);
  await setDoc(profileRef, { ...profile, userId }, { merge: true });
};

export const deleteUserProfileFromFirestore = async (profileId: string) => {
  const profileRef = doc(db, 'measurementProfiles', profileId);
  await deleteDoc(profileRef);
};

// FIRESTORE PRODUCT REVIEWS
export const subscribeToProductReviews = (
  productId: string,
  callback: (reviews: ProductReview[]) => void
) => {
  const q = query(collection(db, 'productReviews'), where('productId', '==', productId));
  return onSnapshot(
    q,
    (snapshot) => {
      const revs: ProductReview[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ProductReview, 'id'>),
      }));
      revs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(revs);
    },
    (err) => {
      console.warn('Firestore ProductReviews listener fallback:', err);
      callback([]);
    }
  );
};

export const addProductReviewToFirestore = async (review: Omit<ProductReview, 'id'>) => {
  const reviewRef = doc(collection(db, 'productReviews'));
  const newReview: ProductReview = {
    ...review,
    id: reviewRef.id,
  };
  await setDoc(reviewRef, newReview);
  return newReview;
};
