export interface Product {
  id: string
  slug: string
  name: string
  price: number
  comparePrice?: number
  description: string
  details: string[]
  category: string
  images: string[]
  variants: Variant[]
  isNew?: boolean
  isFeatured?: boolean
  rating: number
  reviewCount: number
  stock: number
}

export interface Variant {
  id: string
  type: "size" | "color"
  label: string
  value: string
  stock: number
}

export interface Review {
  id: string
  author: string
  rating: number
  date: string
  text: string
  productId: string
}

export interface CartItem {
  product: Product
  quantity: number
  selectedSize: string
  selectedColor: string
}

export const categories = [
  { name: "Hoodies", slug: "hoodies", image: "/images/categories/hoodies.jpg", count: 12 },
  { name: "Playeras", slug: "tees", image: "/images/categories/tees.jpg", count: 18 },
  { name: "Pantalones", slug: "pants", image: "/images/categories/pants.jpg", count: 8 },
  { name: "Accesorios", slug: "accessories", image: "/images/categories/accessories.jpg", count: 15 },
]

export const products: Product[] = [
  {
    id: "1",
    slug: "hoodie-esencial-negro",
    name: "Hoodie Esencial Negro",
    price: 1299,
    comparePrice: 1599,
    description: "Hoodie oversize de algod\u00f3n premium con logo Cherry Twins bordado en el pecho. Corte relajado y ajuste perfecto para el d\u00eda a d\u00eda.",
    details: ["100% algod\u00f3n org\u00e1nico 380gsm", "Bordado en el pecho", "Bolsillo canguro", "Capucha doble capa", "Lavar a m\u00e1quina en fr\u00edo"],
    category: "hoodies",
    images: ["/images/products/hoodie-black.jpg", "/images/products/hoodie-black.jpg"],
    variants: [
      { id: "v1", type: "size", label: "S", value: "s", stock: 5 },
      { id: "v2", type: "size", label: "M", value: "m", stock: 8 },
      { id: "v3", type: "size", label: "L", value: "l", stock: 3 },
      { id: "v4", type: "size", label: "XL", value: "xl", stock: 0 },
      { id: "v5", type: "color", label: "Negro", value: "negro", stock: 16 },
      { id: "v6", type: "color", label: "Gris", value: "gris", stock: 10 },
    ],
    isNew: false,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 47,
    stock: 16,
  },
  {
    id: "2",
    slug: "hoodie-cherry-rojo",
    name: "Hoodie Cherry Rojo",
    price: 1399,
    description: "Hoodie oversize en rojo intenso con logo Cherry Twins estampado en grande. La pieza statement de la colecci\u00f3n.",
    details: ["100% algod\u00f3n org\u00e1nico 380gsm", "Estampado de alta calidad", "Bolsillo canguro", "Capucha doble capa", "Lavar a m\u00e1quina en fr\u00edo"],
    category: "hoodies",
    images: ["/images/products/hoodie-red.jpg", "/images/products/hoodie-red.jpg"],
    variants: [
      { id: "v7", type: "size", label: "S", value: "s", stock: 3 },
      { id: "v8", type: "size", label: "M", value: "m", stock: 6 },
      { id: "v9", type: "size", label: "L", value: "l", stock: 2 },
      { id: "v10", type: "size", label: "XL", value: "xl", stock: 4 },
      { id: "v11", type: "color", label: "Rojo", value: "rojo", stock: 15 },
    ],
    isNew: true,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 23,
    stock: 15,
  },
  {
    id: "3",
    slug: "playera-grafica-blanca",
    name: "Playera Gr\u00e1fica Blanca",
    price: 699,
    description: "Playera oversize de algod\u00f3n con estampado gr\u00e1fico Cherry Twins en el frente. Corte boxy y acabado premium.",
    details: ["100% algod\u00f3n peinado 220gsm", "Estampado serigrafiado", "Corte boxy oversize", "Cuello reforzado", "Lavar a m\u00e1quina en fr\u00edo"],
    category: "tees",
    images: ["/images/products/tee-white.jpg", "/images/products/tee-white.jpg"],
    variants: [
      { id: "v12", type: "size", label: "S", value: "s", stock: 10 },
      { id: "v13", type: "size", label: "M", value: "m", stock: 15 },
      { id: "v14", type: "size", label: "L", value: "l", stock: 8 },
      { id: "v15", type: "size", label: "XL", value: "xl", stock: 5 },
      { id: "v16", type: "color", label: "Blanco", value: "blanco", stock: 38 },
    ],
    isNew: false,
    isFeatured: true,
    rating: 4.7,
    reviewCount: 62,
    stock: 38,
  },
  {
    id: "4",
    slug: "playera-logo-negra",
    name: "Playera Logo Negra",
    price: 649,
    description: "Playera b\u00e1sica negra con logo Cherry Twins minimalista en el pecho. El esencial de todo closet.",
    details: ["100% algod\u00f3n peinado 220gsm", "Logo bordado", "Corte regular", "Cuello reforzado", "Lavar a m\u00e1quina en fr\u00edo"],
    category: "tees",
    images: ["/images/products/tee-black.jpg", "/images/products/tee-black.jpg"],
    variants: [
      { id: "v17", type: "size", label: "S", value: "s", stock: 12 },
      { id: "v18", type: "size", label: "M", value: "m", stock: 20 },
      { id: "v19", type: "size", label: "L", value: "l", stock: 15 },
      { id: "v20", type: "size", label: "XL", value: "xl", stock: 8 },
      { id: "v21", type: "color", label: "Negro", value: "negro", stock: 55 },
    ],
    isNew: true,
    isFeatured: true,
    rating: 4.6,
    reviewCount: 89,
    stock: 55,
  },
  {
    id: "5",
    slug: "gorra-cherry-negra",
    name: "Gorra Cherry Negra",
    price: 499,
    description: "Gorra dad hat con logo Cherry Twins bordado en el frente. Ajustable con hebilla met\u00e1lica.",
    details: ["100% algod\u00f3n", "Logo bordado", "Ajustable con hebilla", "Talla \u00fanica", "Lavar a mano"],
    category: "accessories",
    images: ["/images/products/cap-black.jpg", "/images/products/cap-black.jpg"],
    variants: [
      { id: "v22", type: "size", label: "\u00danica", value: "unica", stock: 25 },
      { id: "v23", type: "color", label: "Negro", value: "negro", stock: 25 },
    ],
    isNew: false,
    isFeatured: true,
    rating: 4.5,
    reviewCount: 34,
    stock: 25,
  },
  {
    id: "6",
    slug: "joggers-cargo-negro",
    name: "Joggers Cargo Negro",
    price: 999,
    description: "Joggers cargo con bolsillos laterales y parche Cherry Twins. Tela resistente con acabado suave por dentro.",
    details: ["95% algod\u00f3n 5% spandex", "Bolsillos cargo laterales", "Cintura el\u00e1stica con cord\u00f3n", "Pu\u00f1os el\u00e1sticos", "Lavar a m\u00e1quina en fr\u00edo"],
    category: "pants",
    images: ["/images/products/joggers-black.jpg", "/images/products/joggers-black.jpg"],
    variants: [
      { id: "v24", type: "size", label: "S", value: "s", stock: 4 },
      { id: "v25", type: "size", label: "M", value: "m", stock: 7 },
      { id: "v26", type: "size", label: "L", value: "l", stock: 5 },
      { id: "v27", type: "size", label: "XL", value: "xl", stock: 2 },
      { id: "v28", type: "color", label: "Negro", value: "negro", stock: 18 },
    ],
    isNew: true,
    isFeatured: false,
    rating: 4.7,
    reviewCount: 19,
    stock: 18,
  },
  {
    id: "7",
    slug: "tote-bag-cherry",
    name: "Tote Bag Cherry",
    price: 399,
    description: "Tote bag de lona resistente con estampado gr\u00e1fico Cherry Twins. Ideal para el d\u00eda a d\u00eda.",
    details: ["100% lona de algod\u00f3n 12oz", "Estampado serigrafiado", "Asas reforzadas", "Bolsillo interior", "Lavar a mano"],
    category: "accessories",
    images: ["/images/products/tote-black.jpg", "/images/products/tote-black.jpg"],
    variants: [
      { id: "v29", type: "size", label: "\u00danica", value: "unica", stock: 30 },
      { id: "v30", type: "color", label: "Negro", value: "negro", stock: 30 },
    ],
    isNew: false,
    isFeatured: false,
    rating: 4.4,
    reviewCount: 28,
    stock: 30,
  },
  {
    id: "8",
    slug: "pack-calcetines-cherry",
    name: "Pack Calcetines Cherry x3",
    price: 349,
    description: "Pack de 3 pares de calcetines con patr\u00f3n Cherry Twins. Algod\u00f3n premium con refuerzo en punta y tal\u00f3n.",
    details: ["80% algod\u00f3n 20% poli\u00e9ster", "3 pares por pack", "Refuerzo en punta y tal\u00f3n", "Talla \u00fanica (25\u201329cm)", "Lavar a m\u00e1quina"],
    category: "accessories",
    images: ["/images/products/socks-pack.jpg", "/images/products/socks-pack.jpg"],
    variants: [
      { id: "v31", type: "size", label: "\u00danica", value: "unica", stock: 0 },
      { id: "v32", type: "color", label: "Negro/Rojo", value: "negro-rojo", stock: 0 },
    ],
    isNew: true,
    isFeatured: false,
    rating: 4.3,
    reviewCount: 15,
    stock: 0,
  },
]

export const reviews: Review[] = [
  { id: "r1", author: "Carlos M.", rating: 5, date: "2026-02-15", text: "La calidad del hoodie es incre\u00edble, se nota que es algod\u00f3n premium. El bordado est\u00e1 perfecto.", productId: "1" },
  { id: "r2", author: "Andrea L.", rating: 5, date: "2026-02-10", text: "Me encant\u00f3 la playera, el estampado no se descolora y el corte oversize queda genial.", productId: "3" },
  { id: "r3", author: "Miguel R.", rating: 4, date: "2026-01-28", text: "La gorra es muy c\u00f3moda y el ajuste es perfecto. El bordado se ve premium.", productId: "5" },
  { id: "r4", author: "Sof\u00eda G.", rating: 5, date: "2026-02-20", text: "El hoodie rojo es una pieza de arte. Lo uso todos los d\u00edas y recibo muchos halagos.", productId: "2" },
  { id: "r5", author: "Diego H.", rating: 5, date: "2026-01-15", text: "Los joggers son muy c\u00f3modos y se ven incre\u00edbles. Los bolsillos cargo son s\u00faper funcionales.", productId: "6" },
  { id: "r6", author: "Valentina P.", rating: 4, date: "2026-02-05", text: "El tote bag es resistente y el dise\u00f1o es genial. Lo uso para todo.", productId: "7" },
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category)
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.isFeatured)
}

export function getNewProducts(): Product[] {
  return products.filter((p) => p.isNew)
}

export function getProductReviews(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId)
}

export function formatPrice(price: number): string {
  return `$${price.toLocaleString("es-MX")} MXN`
}
