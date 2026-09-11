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
];

export function getStoreBySlug(slug: string) {
  return stores.find((s) => s.slug === slug);
}

export function getStoreById(id: string) {
  return stores.find((s) => s.id === id);
}

export function formatPrice(amount: number) {
  return `${amount.toFixed(amount % 1 === 0 ? 0 : 2)} ₪`;
}

export function itemPriceRange(item: {
  price?: number;
  sizes?: { price: number }[];
}) {
  if (item.sizes?.length) {
    const prices = item.sizes.map((s) => s.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? formatPrice(min) : `من ${formatPrice(min)}`;
  }
  if (typeof item.price === "number") return formatPrice(item.price);
  return "—";
}
