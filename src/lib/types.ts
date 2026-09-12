export type StoreCategory = "restaurant" | "market";

export type MenuSize = {
  id: string;
  label: string;
  labelAr: string;
  price: number;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  /** Fixed price for non-sized items */
  price?: number;
  sizes?: MenuSize[];
  category: string;
  image: string;
  popular?: boolean;
  /** Price decided at delivery (quantity-only ordering) */
  priceAtDelivery?: boolean;
  /** Unit label shown with quantity, e.g. كيلو / ربطة */
  unit?: string;
};

export type Store = {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  category: StoreCategory;
  tagline: string;
  description: string;
  rating: number;
  deliveryMinutes: string;
  deliveryFee: number;
  minOrder: number;
  openHours: string;
  /** HH:mm local (Asia/Jerusalem) */
  opensAt?: string;
  /** HH:mm local; may be earlier than opensAt for overnight (e.g. 02:00) */
  closesAt?: string;
  phones?: string[];
  coverImage: string;
  tags: string[];
  menu: MenuItem[];
  /** When set, menu is fetched from API instead of bundled data */
  catalogId?: "mutawa";
};

/** How the customer asks for a price-at-delivery item */
export type FlexibleOrderMode = "quantity" | "budget";

export type CartLine = {
  /** Unique key in cart (itemId + optional size) */
  lineId: string;
  itemId: string;
  storeId: string;
  name: string;
  sizeLabel?: string;
  price: number;
  quantity: number;
  image: string;
  priceAtDelivery?: boolean;
  unit?: string;
  /** quantity = approximate amount; budget = spend up to X ₪ */
  orderMode?: FlexibleOrderMode;
  /** Target spend in ₪ when orderMode is budget */
  budgetAmount?: number;
  /** Extra note e.g. "كبار" / "نص كيلو تقريباً" */
  requestNote?: string;
};

export type OrderStatus =
  | "new"
  | "confirmed"
  | "preparing"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  storeId: string;
  storeName: string;
  customerName: string;
  phone: string;
  village: string;
  address: string;
  notes: string;
  items: CartLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: "cash";
};
