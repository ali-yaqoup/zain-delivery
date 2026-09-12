import type { MenuItem, MenuSize, Store } from "./types";
import {
  DEFAULT_DELIVERY_ZONES,
  feeForVillage,
  type VillageName,
} from "./site-settings";

export {
  DEFAULT_DELIVERY_ZONES,
  feeForVillage,
  type VillageName,
} from "./site-settings";

/** @deprecated Prefer live zones from SiteSettings — kept as defaults */
export const DELIVERY_ZONES = DEFAULT_DELIVERY_ZONES;

export const VILLAGES = DEFAULT_DELIVERY_ZONES.map((z) => z.name);

export const DEFAULT_VILLAGE: VillageName = "كفل حارس";

export function getDeliveryFee(village: string) {
  return feeForVillage(village);
}

export function minDeliveryFee() {
  return Math.min(...DEFAULT_DELIVERY_ZONES.map((z) => z.fee));
}

const KP = "https://king-pizza-menu.vercel.app";

function pizzaSizes(s: number, m: number, l: number, xl: number): MenuSize[] {
  return [
    { id: "s", label: "Small", labelAr: "صغير", price: s },
    { id: "m", label: "Medium", labelAr: "وسط", price: m },
    { id: "l", label: "Large", labelAr: "كبير", price: l },
    { id: "xl", label: "Extra Large", labelAr: "كبير جداً", price: xl },
  ];
}

export const stores: Store[] = [
  {
    id: "king-pizza",
    slug: "king-pizza",
    name: "كينج بيتزا",
    nameEn: "King Pizza",
    category: "restaurant",
    tagline: "بيتزا · ساندويشات · مقبلات",
    description:
      "مطعم كينج بيتزا في كفل حارس — بيتزا بأحجام متعددة، ساندويشات، ومقبلات مع توصيل.",
    rating: 4.8,
    deliveryMinutes: "25–40",
    deliveryFee: 5,
    minOrder: 20,
    openHours: "يومياً من ٤ العصر حتى ٢ بالليل",
    opensAt: "16:00",
    closesAt: "02:00",
    phones: ["0569 686 229", "0512 045 991"],
    coverImage: "/king-cover.jpg",
    tags: ["بيتزا", "ساندويشات", "مقبلات"],
    menu: [
      {
        id: "kp-veggie",
        name: "بيتزا خضار",
        description: "فلفل ملون، زيتون، ذرة، فلفل أخضر، بندورة، موزاريلا",
        category: "البيتزا",
        sizes: pizzaSizes(15, 25, 35, 50),
        image: `${KP}/images/pizza-veggie.jpg`,
      },
      {
        id: "kp-margherita",
        name: "بيتزا مارجريتا",
        description: "صلصة بندورة وموزاريلا فقط",
        category: "البيتزا",
        sizes: pizzaSizes(15, 25, 35, 50),
        image: `${KP}/images/pizza-margherita.jpg`,
        popular: true,
      },
      {
        id: "kp-italian",
        name: "بيتزا ايطالي",
        description: "موزاريلا وشرائح بندورة",
        category: "البيتزا",
        sizes: pizzaSizes(15, 25, 35, 50),
        image: `${KP}/images/pizza-italian.jpg`,
      },
      {
        id: "kp-pepperoni",
        name: "بيتزا ببروني",
        description: "صلصة، موزاريلا، شرائح ببروني",
        category: "البيتزا",
        sizes: pizzaSizes(15, 25, 35, 50),
        image: `${KP}/images/pizza-pepperoni.jpg`,
        popular: true,
      },
      {
        id: "kp-sausage",
        name: "بيتزا نقانق",
        description: "صلصة، موزاريلا، شرائح نقانق",
        category: "البيتزا",
        sizes: pizzaSizes(15, 25, 35, 50),
        image: `${KP}/images/pizza-sausage.jpg?v=hotdog`,
      },
      {
        id: "kp-bbq",
        name: "بيتزا باربيكيو",
        description: "صوص باربيكيو، دجاج، موزاريلا",
        category: "البيتزا",
        sizes: pizzaSizes(20, 30, 40, 55),
        image: `${KP}/images/pizza-bbq.jpg`,
      },
      {
        id: "kp-mexican",
        name: "بيتزا مكسيكي",
        description: "صوص باربيكيو، دجاج، فلفل حار",
        category: "البيتزا",
        sizes: pizzaSizes(20, 30, 40, 55),
        image: `${KP}/images/pizza-mexican.jpg`,
      },
      {
        id: "kp-tuna",
        name: "بيتزا تونا",
        description: "تونا، زيتون أسود، موزاريلا",
        category: "البيتزا",
        sizes: pizzaSizes(20, 30, 40, 55),
        image: `${KP}/images/pizza-tuna.jpg`,
      },
      {
        id: "kp-four-seasons",
        name: "بيتزا الفصول الأربعة",
        description: "أربع أقسام: خضار، دجاج، سلامي، مارجريتا",
        category: "البيتزا",
        sizes: pizzaSizes(20, 30, 40, 55),
        image: `${KP}/images/pizza-four-seasons.jpg?v=box`,
        popular: true,
      },
      {
        id: "kp-crispy-sandwich",
        name: "كرسبي ساندويش",
        description: "",
        price: 15,
        category: "الساندويشات",
        image: `${KP}/images/crispy-sandwich.jpg?v=fly`,
      },
      {
        id: "kp-crispy-meal",
        name: "كرسبي وجبة",
        description: "وجبة بدون مشروب",
        price: 22,
        category: "الساندويشات",
        image: `${KP}/images/crispy-meal.jpg?v=fly`,
        popular: true,
      },
      {
        id: "kp-burger-fries",
        name: "برجر طازج + بطاطا",
        description: "",
        price: 25,
        category: "الساندويشات",
        image: `${KP}/images/burger-fries.jpg`,
      },
      {
        id: "kp-burger-meal",
        name: "برجر عادي وجبة",
        description: "",
        price: 20,
        category: "الساندويشات",
        image: `${KP}/images/burger-regular.jpg?v=fries`,
      },
      {
        id: "kp-hotdog-cheese",
        name: "نقانق مع جبنة",
        description: "",
        price: 10,
        category: "الساندويشات",
        image: `${KP}/images/hotdog-cheese.jpg`,
      },
      {
        id: "kp-hotdog",
        name: "نقانق",
        description: "",
        price: 8,
        category: "الساندويشات",
        image: `${KP}/images/hotdog.jpg?v=veg`,
      },
      {
        id: "kp-crispy-box",
        name: "بوكس كرسبي",
        description: "بطاطا وفوقها قطع كرسبي وصوص",
        price: 15,
        category: "مقبلات",
        image: `${KP}/images/crispy-box.jpg`,
        popular: true,
      },
      {
        id: "kp-fries-large",
        name: "بطاطا كبير",
        description: "",
        price: 10,
        category: "مقبلات",
        image: `${KP}/images/fries-large.jpg`,
      },
      {
        id: "kp-fries-small",
        name: "بطاطا صغير",
        description: "",
        price: 5,
        category: "مقبلات",
        image: `${KP}/images/fries-small.jpg`,
      },
      {
        id: "kp-wings",
        name: "اجنحة",
        description: "10 أجنحة",
        price: 20,
        category: "مقبلات",
        image: `${KP}/images/wings.jpg?v=crispy`,
      },
    ],
  },
  {
    id: "mutawa-market",
    slug: "mutawa-market",
    name: "ميني ماركت",
    nameEn: "Mini Market",
    category: "market",
    tagline: "كل احتياجات البيت قريبة منك",
    description:
      "ميني ماركت — آلاف الأصناف: بقالة، مشروبات، منظفات، ومنتجات يومية بتوصيل لكفل حارس والقرى المجاورة.",
    rating: 4.7,
    deliveryMinutes: "20–35",
    deliveryFee: 5,
    minOrder: 20,
    openHours: "يومياً من ٨ الصبح حتى ١ بعد منتصف الليل",
    opensAt: "08:00",
    closesAt: "01:00",
    coverImage:
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1200&q=80",
    tags: ["بقالة", "مشروبات", "منتجات منزلية"],
    /** Full catalog is loaded on-demand via /api/catalog/mutawa */
    menu: [] as MenuItem[],
    catalogId: "mutawa",
  },
  {
    id: "vegetables",
    slug: "vegetables",
    name: "خضراوات وفواكه",
    nameEn: "Produce",
    category: "market",
    tagline: "خضار وفاكهة — كمية أو بمبلغ عند التوصيل",
    description:
      "خضراوات وفواكه طازجة بالتوصيل. اختَر الصنف وكمية تقريبية أو بمبلغ معيّن، والسعر النهائي حسب السوق يوم التوصيل.",
    rating: 4.6,
    deliveryMinutes: "25–45",
    deliveryFee: 5,
    minOrder: 0,
    openHours: "يومياً من ٨ الصبح حتى ٨ المسا",
    opensAt: "08:00",
    closesAt: "20:00",
    coverImage:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
    tags: ["خضار", "فواكه", "طازج", "بالكمية"],
    menu: [
      // خضراوات
      produce("tomato", "بندورة", "طازجة حسب الموسم", "كيلو", "خضراوات", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80"),
      produce("cucumber", "خيار", "خيار طازج", "كيلو", "خضراوات", "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=400&q=80"),
      produce("potato", "بطاطا", "بطاطا للطبخ والقلي", "كيلو", "خضراوات", "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80"),
      produce("onion", "بصل", "بصل أحمر أو أبيض حسب المتوفر", "كيلو", "خضراوات", "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80"),
      produce("garlic", "ثوم", "ثوم بلدي", "رأس", "خضراوات", "https://images.unsplash.com/photo-1628998092164-4365d9ed0d29?auto=format&fit=crop&w=400&q=80"),
      produce("pepper", "فلفل", "فلفل حلو أو حار", "كيلو", "خضراوات", "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=400&q=80"),
      produce("zucchini", "كوسا", "كوسا طازجة", "كيلو", "خضراوات", "https://images.unsplash.com/photo-1768405741410-71317eceb565?auto=format&fit=crop&w=400&q=80"),
      produce("eggplant", "باذنجان", "باذنجان للطبخ", "كيلو", "خضراوات", "https://images.unsplash.com/photo-1533213520888-6aa83d71cc24?auto=format&fit=crop&w=400&q=80"),
      produce("lettuce", "خس", "خس طازج", "ربطة", "خضراوات", "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=400&q=80"),
      produce("carrot", "جزر", "جزر طازج", "كيلو", "خضراوات", "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=400&q=80"),
      produce("cabbage", "ملفوف", "ملفوف", "رأس", "خضراوات", "https://images.unsplash.com/photo-1581592705138-6f4c1a493cec?auto=format&fit=crop&w=400&q=80"),
      produce("cauliflower", "زهرة", "قرنبيط / زهرة", "رأس", "خضراوات", "https://images.unsplash.com/photo-1566842600175-97dca489844f?auto=format&fit=crop&w=400&q=80"),
      produce("parsley", "بقدونس", "بقدونس أخضر", "ربطة", "خضراوات", "https://images.unsplash.com/photo-1535189487909-a262ad10c165?auto=format&fit=crop&w=400&q=80"),
      produce("mint", "نعناع", "نعناع طازج", "ربطة", "خضراوات", "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=400&q=80"),
      produce("spinach", "سبانخ", "سبانخ طازجة", "ربطة", "خضراوات", "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80"),
      // فواكه
      produce("apple", "تفاح", "تفاح حسب المتوفر", "كيلو", "فواكه", "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80"),
      produce("banana", "موز", "موز طازج", "كيلو", "فواكه", "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80"),
      produce("orange", "برتقال", "برتقال عصير أو أكل", "كيلو", "فواكه", "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=400&q=80"),
      produce("clementine", "يوسف أفندي", "يوسف أفندي / كلمنتين", "كيلو", "فواكه", "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=400&q=80"),
      produce("lemon", "ليمون", "ليمون حامض", "كيلو", "فواكه", "https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=400&q=80"),
      produce("grape", "عنب", "عنب حسب الموسم", "كيلو", "فواكه", "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=400&q=80"),
      produce("watermelon", "بطيخ", "بطيخ طازج", "قطعة", "فواكه", "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80"),
      produce("strawberry", "فراولة", "فراولة حسب الموسم", "علبة", "فواكه", "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80"),
      produce("mango", "مانجا", "مانجا حسب الموسم", "كيلو", "فواكه", "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=400&q=80"),
      produce("pear", "إجاص", "إجاص طازج", "كيلو", "فواكه", "https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?auto=format&fit=crop&w=400&q=80"),
      produce("avocado", "أفوكادو", "أفوكادو حسب المتوفر", "حبة", "فواكه", "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80"),
      produce("pineapple", "أناناس", "أناناس طازج", "حبة", "فواكه", "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=400&q=80"),
    ],
  },
];

function produce(
  id: string,
  name: string,
  description: string,
  unit: string,
  category: string,
  image: string
): MenuItem {
  return {
    id: `veg-${id}`,
    name,
    description,
    category,
    image,
    unit,
    priceAtDelivery: true,
  };
}

export function getStoreBySlug(slug: string) {
  return stores.find((s) => s.slug === slug);
}

export function getStoreById(id: string) {
  return stores.find((s) => s.id === id);
}

export function formatPrice(amount: number) {
  return `${amount.toFixed(amount % 1 === 0 ? 0 : 2)} ₪`;
}

export function isPriceAtDelivery(item: {
  priceAtDelivery?: boolean;
  price?: number;
  sizes?: { price: number }[];
}) {
  if (item.priceAtDelivery) return true;
  if (item.sizes?.length) return false;
  return typeof item.price !== "number";
}

export function itemPriceRange(item: {
  price?: number;
  sizes?: { price: number }[];
  priceAtDelivery?: boolean;
  unit?: string;
}) {
  if (isPriceAtDelivery(item)) {
    return "كمية أو بمبلغ · عند التوصيل";
  }
  if (item.sizes?.length) {
    const prices = item.sizes.map((s) => s.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? formatPrice(min) : `من ${formatPrice(min)}`;
  }
  if (typeof item.price === "number") return formatPrice(item.price);
  return "—";
}

export function formatQty(amount: number) {
  if (!Number.isFinite(amount)) return "0";
  const rounded = Math.round(amount * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

export function formatCartLineRequest(line: {
  quantity: number;
  priceAtDelivery?: boolean;
  unit?: string;
  orderMode?: "quantity" | "budget";
  budgetAmount?: number;
  requestNote?: string;
}) {
  if (!line.priceAtDelivery) {
    return `${formatQty(line.quantity)}×`;
  }
  if (line.orderMode === "budget" && line.budgetAmount) {
    const base = `بمبلغ ≈ ${formatPrice(line.budgetAmount)}`;
    return line.requestNote ? `${base} · ${line.requestNote}` : base;
  }
  const qty = formatQty(line.quantity);
  const unit = line.unit ? ` ${line.unit}` : "";
  const base = `${qty}${unit} تقريباً`;
  return line.requestNote ? `${base} · ${line.requestNote}` : base;
}

export function formatCartLinePrice(line: {
  price: number;
  quantity: number;
  priceAtDelivery?: boolean;
  unit?: string;
  orderMode?: "quantity" | "budget";
  budgetAmount?: number;
  requestNote?: string;
}) {
  if (line.priceAtDelivery) {
    return `${formatCartLineRequest(line)} · عند التوصيل`;
  }
  return formatPrice(line.price * line.quantity);
}
