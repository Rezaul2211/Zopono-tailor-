import { Product, CartItem, Order, MeasurementProfile } from '../types';
import { INITIAL_PRODUCTS } from '../data/defaultProducts';

const KEYS = {
  PRODUCTS: 'zopono_products_v1',
  CART: 'zopono_cart_v1',
  ORDERS: 'zopono_orders_v1',
  PROFILES: 'zopono_measurement_profiles_v1',
};

// INITIAL SAMPLE ORDERS
const INITIAL_ORDERS: Order[] = [
  {
    id: 'ZP-98210',
    date: '2026-07-20',
    customerName: 'Tanvir Hossain',
    phone: '01711223344',
    address: 'House 42, Road 11, Banani',
    district: 'Dhaka',
    paymentMethod: 'bKash',
    paymentStatus: 'Paid',
    items: [
      {
        cartId: 'item-101',
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        isCustomTailored: true,
        selectedSize: 'Custom Tailored',
        customMeasurements: {
          length: 42,
          chest: 38,
          waist: 34,
          shoulder: 17.5,
          sleeve: 24.5,
          neck: 15.5,
          armhole: 18.5,
          hip: 40,
        },
        customDesign: {
          collarStyle: 'Mandarin',
          pocketOption: 'Double Side Pocket',
          fitPreference: 'Slim Fit',
          sleeveStyle: 'Cuff',
          buttonType: 'Metal Gold',
          specialInstructions: 'Please add double stitching along side seams.',
        },
        customProfileName: 'My Eid Panjabi Size',
        totalUnitPrice: INITIAL_PRODUCTS[0].basePrice + INITIAL_PRODUCTS[0].stitchingCharge,
      }
    ],
    subtotal: 3450,
    stitchingTotal: 750,
    deliveryCharge: 70,
    discount: 0,
    totalAmount: 4270,
    status: 'Stitching',
    estimatedDelivery: '2026-07-26',
    masterTailorNotes: 'Fabric cut completed. Master Kabir assigned for gold placket stitching.'
  },
  {
    id: 'ZP-98211',
    date: '2026-07-22',
    customerName: 'Nusrat Jahan',
    phone: '01899887766',
    address: 'Flat 4B, Green Road, Dhanmondi',
    district: 'Dhaka',
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'COD',
    items: [
      {
        cartId: 'item-102',
        product: INITIAL_PRODUCTS[1],
        quantity: 1,
        isCustomTailored: true,
        selectedSize: 'Custom Tailored',
        customMeasurements: {
          length: 54,
          chest: 36,
          waist: 32,
          shoulder: 15,
          sleeve: 22,
          neck: 14,
          armhole: 16.5,
          hip: 38,
        },
        customDesign: {
          collarStyle: 'V-Neck',
          pocketOption: 'Hidden Pocket',
          fitPreference: 'Loose Fit',
          sleeveStyle: 'Embroidered Cuff',
          buttonType: 'Concealed Zip',
        },
        customProfileName: 'Standard Abaya Fit',
        totalUnitPrice: INITIAL_PRODUCTS[1].basePrice + INITIAL_PRODUCTS[1].stitchingCharge,
      }
    ],
    subtotal: 4850,
    stitchingTotal: 950,
    deliveryCharge: 70,
    discount: 200,
    totalAmount: 5670,
    status: 'Fabric Cut',
    estimatedDelivery: '2026-07-28',
    masterTailorNotes: 'Nida fabric inspected and pre-shrunk. Cut according to pattern profile.'
  }
];

const INITIAL_PROFILES: MeasurementProfile[] = [
  {
    id: 'prof-1',
    profileName: 'Standard Panjabi (Slim Fit)',
    customerName: 'Tanvir Hossain',
    garmentType: 'Panjabi',
    measurements: {
      length: 42,
      chest: 38,
      waist: 34,
      shoulder: 17.5,
      sleeve: 24.5,
      neck: 15.5,
      armhole: 18.5,
      hip: 40,
    },
    design: {
      collarStyle: 'Mandarin',
      pocketOption: 'Double Side Pocket',
      fitPreference: 'Slim Fit',
      sleeveStyle: 'Cuff',
      buttonType: 'Metal Gold',
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prof-2',
    profileName: 'My Executive Suit Fit',
    customerName: 'Tanvir Hossain',
    garmentType: 'Suits',
    measurements: {
      length: 29.5,
      chest: 40,
      waist: 34,
      shoulder: 18,
      sleeve: 25,
      neck: 16,
      armhole: 19,
      hip: 40,
    },
    design: {
      collarStyle: 'Regular',
      pocketOption: 'Chest Pocket',
      fitPreference: 'Tailored Fitting',
      sleeveStyle: 'Cuff',
      buttonType: 'Horn',
    },
    updatedAt: new Date().toISOString(),
  }
];

// PRODUCTS
export const getStoredProducts = (): Product[] => {
  try {
    const data = localStorage.getItem(KEYS.PRODUCTS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading stored products:', err);
  }
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
};

export const saveProducts = (products: Product[]) => {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
};

export const resetProductsToDefault = (): Product[] => {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
};

// CART
export const getStoredCart = (): CartItem[] => {
  try {
    const data = localStorage.getItem(KEYS.CART);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.error('Error reading cart:', err);
  }
  return [];
};

export const saveCart = (cart: CartItem[]) => {
  localStorage.setItem(KEYS.CART, JSON.stringify(cart));
};

// ORDERS
export const getStoredOrders = (): Order[] => {
  try {
    const data = localStorage.getItem(KEYS.ORDERS);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.error('Error reading orders:', err);
  }
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  return INITIAL_ORDERS;
};

export const saveOrders = (orders: Order[]) => {
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
};

export const addOrder = (order: Order): Order[] => {
  const current = getStoredOrders();
  const updated = [order, ...current];
  saveOrders(updated);
  return updated;
};

// MEASUREMENT PROFILES
export const getStoredProfiles = (): MeasurementProfile[] => {
  try {
    const data = localStorage.getItem(KEYS.PROFILES);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.error('Error reading profiles:', err);
  }
  localStorage.setItem(KEYS.PROFILES, JSON.stringify(INITIAL_PROFILES));
  return INITIAL_PROFILES;
};

export const saveProfile = (profile: MeasurementProfile): MeasurementProfile[] => {
  const current = getStoredProfiles();
  const index = current.findIndex((p) => p.id === profile.id || p.profileName === profile.profileName);
  let updated: MeasurementProfile[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = profile;
  } else {
    updated = [profile, ...current];
  }
  localStorage.setItem(KEYS.PROFILES, JSON.stringify(updated));
  return updated;
};

export const deleteProfile = (id: string): MeasurementProfile[] => {
  const current = getStoredProfiles();
  const updated = current.filter((p) => p.id !== id);
  localStorage.setItem(KEYS.PROFILES, JSON.stringify(updated));
  return updated;
};
