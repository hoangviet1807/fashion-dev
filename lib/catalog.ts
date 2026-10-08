export type DressStyleId = "casual" | "formal" | "party" | "gym";
export type CategoryId = "t-shirts" | "shorts" | "shirts" | "hoodie" | "jeans";

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "t-shirts", label: "Áo thun" },
  { id: "shorts", label: "Quần short" },
  { id: "shirts", label: "Áo sơ mi" },
  { id: "hoodie", label: "Áo hoodie" },
  { id: "jeans", label: "Quần jeans" },
];

export const DRESS_STYLES: { id: DressStyleId; label: string }[] = [
  { id: "casual", label: "Thường ngày" },
  { id: "formal", label: "Công sở" },
  { id: "party", label: "Dự tiệc" },
  { id: "gym", label: "Thể thao" },
];

export const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"] as const;

/** Size names used before the switch to short codes; old orders and links may still carry them. */
export const LEGACY_SIZES: Record<string, (typeof SIZES)[number]> = {
  "XX-Small": "XXS",
  "X-Small": "XS",
  Small: "S",
  Medium: "M",
  Large: "L",
  "X-Large": "XL",
  "XX-Large": "2XL",
  "3X-Large": "3XL",
  "4X-Large": "4XL",
};

export function normalizeSize(size: string) {
  return LEGACY_SIZES[size] ?? size;
}

export type ColorSwatch = { id: string; hex: string; check: "white" | "black" };

/** Colors offered in the shop filter panel. */
export const COLORS: ColorSwatch[] = [
  { id: "green", hex: "#00C12B", check: "white" },
  { id: "red", hex: "#F50606", check: "white" },
  { id: "yellow", hex: "#F5DD06", check: "black" },
  { id: "orange", hex: "#F57906", check: "white" },
  { id: "cyan", hex: "#06CAF5", check: "black" },
  { id: "blue", hex: "#063AF5", check: "white" },
  { id: "purple", hex: "#7D06F5", check: "white" },
  { id: "pink", hex: "#F506A4", check: "white" },
  { id: "white", hex: "#FFFFFF", check: "black" },
  { id: "black", hex: "#000000", check: "white" },
];

const EXTRA_SWATCHES: ColorSwatch[] = [
  { id: "olive", hex: "#4F4631", check: "white" },
  { id: "forest", hex: "#314F4A", check: "white" },
  { id: "navy", hex: "#31344F", check: "white" },
];

const SWATCHES = new Map(
  [...COLORS, ...EXTRA_SWATCHES].map((swatch) => [swatch.id, swatch]),
);

/** Every color a product variant may use (filter colors plus extras). */
export const PRODUCT_COLOR_IDS = [...SWATCHES.keys()];

export function colorSwatch(id: string): ColorSwatch {
  return SWATCHES.get(id) ?? { id, hex: "#000000", check: "white" };
}

export const COLOR_LABELS: Record<string, string> = {
  green: "Xanh lá",
  red: "Đỏ",
  yellow: "Vàng",
  orange: "Cam",
  cyan: "Xanh ngọc",
  blue: "Xanh dương",
  purple: "Tím",
  pink: "Hồng",
  white: "Trắng",
  black: "Đen",
  olive: "Xanh rêu",
  forest: "Xanh rừng",
  navy: "Xanh navy",
};

export function colorLabel(id: string) {
  return COLOR_LABELS[id] ?? id.charAt(0).toUpperCase() + id.slice(1);
}

/** Price filter range in VND. */
export const PRICE_BOUNDS = { min: 0, max: 250000, step: 10000 } as const;
export const DEFAULT_PRICE: [number, number] = [50000, 200000];
export const DEFAULT_COLOR = "black";
export const DEFAULT_SIZE = "M";

export function isDressStyle(value: string | undefined): value is DressStyleId {
  return DRESS_STYLES.some((style) => style.id === value);
}

export function isCategory(value: string | undefined): value is CategoryId {
  return CATEGORIES.some((category) => category.id === value);
}

export function styleLabel(style: DressStyleId) {
  return DRESS_STYLES.find((item) => item.id === style)?.label ?? "Thường ngày";
}

export function categoryLabel(category: CategoryId) {
  return CATEGORIES.find((item) => item.id === category)?.label ?? category;
}
