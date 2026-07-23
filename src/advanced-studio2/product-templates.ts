export type ProductTemplateId =
  | "obsidian"
  | "gallery"
  | "kinetic"
  | "aura"
  | "editorial"
  | "precision"
  | "monument"
  | "chromatic"
  | "launch"
  | "essential";

export type ProductTemplate = {
  id: ProductTemplateId;
  name: string;
  category: string;
  description: string;
  accent: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  layout:
    | "split"
    | "center"
    | "poster"
    | "editorial"
    | "technical";
  imageFit: "contain" | "cover";
  imageScale: number;
  eyebrow: string;
  headline: string;
  subheadline: string;
  cta: string;
};

export const productTemplates: ProductTemplate[] = [
  {
    id: "obsidian",
    name: "Obsidian Reveal",
    category: "Luxury",
    description: "Dark cinematic launch with a focused product reveal.",
    accent: "#d8ad55",
    background: "#090909",
    surface: "#141414",
    foreground: "#f7f3ea",
    muted: "#aaa49a",
    layout: "split",
    imageFit: "contain",
    imageScale: 0.92,
    eyebrow: "THE NEW STANDARD",
    headline: "Designed to be unforgettable.",
    subheadline: "Precision, presence, and performance in one defining product.",
    cta: "Discover now",
  },
  {
    id: "gallery",
    name: "Gallery White",
    category: "Minimal",
    description: "Museum-clean composition for premium consumer products.",
    accent: "#111111",
    background: "#f3f0e9",
    surface: "#ffffff",
    foreground: "#111111",
    muted: "#6e6a62",
    layout: "center",
    imageFit: "contain",
    imageScale: 0.88,
    eyebrow: "INTRODUCING",
    headline: "Less noise. More product.",
    subheadline: "A refined object deserves a clear stage.",
    cta: "See the details",
  },
  {
    id: "kinetic",
    name: "Kinetic Grid",
    category: "Technology",
    description: "High-energy modular system for devices and innovation.",
    accent: "#7c5cff",
    background: "#0b0c12",
    surface: "#171924",
    foreground: "#ffffff",
    muted: "#a9abc0",
    layout: "technical",
    imageFit: "contain",
    imageScale: 0.9,
    eyebrow: "ENGINEERED FOR MORE",
    headline: "Power, precisely placed.",
    subheadline: "Every detail calibrated for speed and control.",
    cta: "Explore performance",
  },
  {
    id: "aura",
    name: "Aura Bloom",
    category: "Beauty",
    description: "Soft luminous launch for skincare, fragrance, and wellness.",
    accent: "#ff7ca8",
    background: "#220f1d",
    surface: "#38182e",
    foreground: "#fff5f8",
    muted: "#dfb8c8",
    layout: "center",
    imageFit: "contain",
    imageScale: 0.9,
    eyebrow: "MEET YOUR NEW RITUAL",
    headline: "A glow that starts within.",
    subheadline: "An elevated essential made for everyday radiance.",
    cta: "Experience the ritual",
  },
  {
    id: "editorial",
    name: "Editorial Cut",
    category: "Fashion",
    description: "Bold magazine typography with an art-directed product crop.",
    accent: "#f04424",
    background: "#e8e1d4",
    surface: "#d4c8b6",
    foreground: "#15130f",
    muted: "#625c53",
    layout: "editorial",
    imageFit: "cover",
    imageScale: 1,
    eyebrow: "THE EDIT",
    headline: "Made to move differently.",
    subheadline: "A new silhouette for the moments that matter.",
    cta: "Shop the edit",
  },
  {
    id: "precision",
    name: "Precision Lab",
    category: "Performance",
    description: "Technical storytelling for engineered and performance goods.",
    accent: "#9ef01a",
    background: "#08100c",
    surface: "#111d16",
    foreground: "#ecf7ef",
    muted: "#9bad9f",
    layout: "technical",
    imageFit: "contain",
    imageScale: 0.86,
    eyebrow: "BUILT WITHOUT COMPROMISE",
    headline: "Performance you can measure.",
    subheadline: "Advanced materials. Purposeful geometry. Proven results.",
    cta: "View specifications",
  },
  {
    id: "monument",
    name: "Monument",
    category: "Iconic",
    description: "Heroic centered composition that makes one object feel iconic.",
    accent: "#ffcf33",
    background: "#15110b",
    surface: "#241d12",
    foreground: "#fff8e8",
    muted: "#c9bfa9",
    layout: "poster",
    imageFit: "contain",
    imageScale: 1,
    eyebrow: "ONE OBJECT. TOTAL PRESENCE.",
    headline: "Meet the icon.",
    subheadline: "Created for those who recognize the exceptional.",
    cta: "Own the moment",
  },
  {
    id: "chromatic",
    name: "Chromatic Pop",
    category: "Social",
    description: "Bold color, oversized type, and playful product movement.",
    accent: "#081018",
    background: "#35e0ff",
    surface: "#f8ff46",
    foreground: "#081018",
    muted: "#254551",
    layout: "poster",
    imageFit: "contain",
    imageScale: 0.88,
    eyebrow: "JUST DROPPED",
    headline: "Make ordinary impossible.",
    subheadline: "The product built to stand out everywhere.",
    cta: "Get yours",
  },
  {
    id: "launch",
    name: "Launch Signal",
    category: "Campaign",
    description: "Conversion-focused launch narrative with proof-point pacing.",
    accent: "#ff5b3d",
    background: "#0e1118",
    surface: "#1a1f2b",
    foreground: "#ffffff",
    muted: "#a9b0c1",
    layout: "split",
    imageFit: "contain",
    imageScale: 0.88,
    eyebrow: "AVAILABLE NOW",
    headline: "The wait is over.",
    subheadline: "A breakthrough product, ready for its first impression.",
    cta: "Launch your order",
  },
  {
    id: "essential",
    name: "Everyday Essential",
    category: "Lifestyle",
    description: "Warm, approachable product storytelling for everyday goods.",
    accent: "#1d5d4d",
    background: "#eee6d8",
    surface: "#fbf7ef",
    foreground: "#18352e",
    muted: "#647d75",
    layout: "editorial",
    imageFit: "contain",
    imageScale: 0.88,
    eyebrow: "BETTER BY DESIGN",
    headline: "Made for every day.",
    subheadline: "Thoughtful details that make the familiar feel exceptional.",
    cta: "Find your essential",
  },
];

export const getProductTemplate = (id: ProductTemplateId) => {
  const template = productTemplates.find((item) => item.id === id);
  if (!template) throw new Error(`Unknown product template: ${id}`);
  return template;
};
