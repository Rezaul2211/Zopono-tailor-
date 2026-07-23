export type MainCategory = 'Men' | 'Women';

export type SubCategory =
  | 'Panjabi'
  | 'Pajama'
  | 'Suits'
  | 'Formal Shirts'
  | 'Waistcoats'
  | 'Kurta'
  | 'Borka'
  | 'Abaya'
  | 'Salwar Kameez'
  | 'Designer Gowns'
  | 'Kurtis'
  | 'Unstitched Fabrics';

export interface Measurements {
  length: number; // ঝুল
  chest: number; // ছাতি
  waist: number; // কোমর
  shoulder: number; // কাঁধ
  sleeve: number; // হাতা
  neck: number; // গলা
  armhole?: number; // আরমহোল
  hip?: number; // হিপ
  bottomLength?: number; // পায়জামা/স্যালোয়ার ঝুল
  bottomOpening?: number; // মোহড়া
}

export interface DesignCustomization {
  collarStyle: 'Mandarin' | 'Regular' | 'Shirt Collar' | 'V-Neck' | 'Band Collar' | 'Designer Notch';
  pocketOption: 'Single Pocket' | 'Double Side Pocket' | 'Hidden Pocket' | 'Chest Pocket' | 'No Pocket';
  fitPreference: 'Slim Fit' | 'Regular Fit' | 'Loose Fit' | 'Tailored Fitting';
  sleeveStyle: 'Cuff' | 'Open Straight' | 'Elasticated' | 'Embroidered Cuff';
  buttonType?: 'Metal Gold' | 'Horn' | 'Pearl' | 'Concealed Zip' | 'Fabric Covered';
  embroideryNote?: string;
  specialInstructions?: string;
}

export interface UserAccount {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role?: 'admin' | 'customer';
}

export interface MeasurementProfile {
  id: string;
  profileName: string;
  customerName: string;
  garmentType: SubCategory | string;
  measurements: Measurements;
  design: DesignCustomization;
  updatedAt: string;
}

export interface Product {
  id: string;
  title: string;
  category: MainCategory;
  subCategory: SubCategory;
  basePrice: number;
  stitchingCharge: number;
  description: string;
  fabricType: string;
  imageUrl: string;
  isCustomizable: boolean;
  isFeatured?: boolean;
  stockStatus: 'In Stock' | 'Pre-Order' | 'Out of Stock';
  tags?: string[];
}

export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  userEmail?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface CartItem {
  cartId: string;
  product: Product;
  quantity: number;
  selectedSize?: string; // Standard S/M/L/XL or 'Custom Tailored'
  isCustomTailored: boolean;
  customMeasurements?: Measurements;
  customDesign?: DesignCustomization;
  customProfileName?: string;
  totalUnitPrice: number; // basePrice + (isCustomTailored ? stitchingCharge : 0)
}

export type OrderStatus =
  | 'Order Placed'
  | 'Order Confirmed'
  | 'Fabric Cut'
  | 'Stitching'
  | 'Quality Check'
  | 'Ready for Delivery'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface Order {
  id: string;
  date: string;
  customerName: string;
  phone: string;
  address: string;
  district: string;
  paymentMethod: 'bKash' | 'Nagad' | 'Cash on Delivery';
  paymentStatus: 'Pending' | 'Paid' | 'COD';
  senderPhone?: string;
  transactionId?: string;
  codPhone?: string;
  items: CartItem[];
  subtotal: number;
  stitchingTotal: number;
  deliveryCharge: number;
  discount: number;
  totalAmount: number;
  status: OrderStatus;
  estimatedDelivery: string;
  masterTailorNotes?: string;
}
