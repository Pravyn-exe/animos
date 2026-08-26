import type { TextOverlay } from "./text";

export type FrameRatio = "16:9" | "4:3" | "1:1" | "4:5" | "9:16";

export const FRAME_RATIOS: { id: FrameRatio; label: string; w: number; h: number }[] = [
  { id: "16:9", label: "16:9", w: 16, h: 9 },
  { id: "4:3", label: "4:3", w: 4, h: 3 },
  { id: "1:1", label: "1:1", w: 1, h: 1 },
  { id: "4:5", label: "4:5", w: 4, h: 5 },
  { id: "9:16", label: "9:16", w: 9, h: 16 },
];

export const RESOLUTIONS = [
  { id: "720p", label: "720p", long: 1280 },
  { id: "1080p", label: "1080p", long: 1920 },
  { id: "2k", label: "2K", long: 2560 },
  { id: "4k", label: "4K", long: 3840 },
  { id: "8k", label: "8K", long: 7680 },
] as const;

export type ResolutionId = (typeof RESOLUTIONS)[number]["id"];

export const FRAMERATES = [24, 25, 30, 48, 60] as const;
export type Framerate = (typeof FRAMERATES)[number];

export const EXPORT_FORMATS = [
  { id: "mp4", label: "MP4" },
  { id: "webp", label: "WebP" },
] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number]["id"];

export type ParamType = "number" | "select" | "color";
export type ParamGroup = "motion" | "space" | "look";
export type ParamUnit = "x" | "deg" | "pct";

export type NumberParam = {
  type: "number";
  id: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  default: number;
  group?: ParamGroup;
  unit?: ParamUnit;
};

export type SelectParam = {
  type: "select";
  id: string;
  label: string;
  options: { value: string; label: string }[];
  default: string;
  group?: ParamGroup;
};

export type ColorParam = {
  type: "color";
  id: string;
  label: string;
  default: string;
  group?: ParamGroup;
};

export type TemplateParam = NumberParam | SelectParam | ColorParam;

export type TemplateCategory =
  | "3D & Perspective"
  | "Orbit"
  | "Carousel & Flow"
  | "Spotlight & Focus"
  | "Stack & Scatter"
  | "Grid"
  | "Reveal & Wipe"
  | "Reels";

export const CATEGORY_ORDER: TemplateCategory[] = [
  "3D & Perspective",
  "Orbit",
  "Carousel & Flow",
  "Grid",
  "Spotlight & Focus",
  "Reveal & Wipe",
  "Stack & Scatter",
  "Reels",
];

export type ThumbKind =
  | "ring"
  | "sphere"
  | "globe"
  | "orbit"
  | "grid"
  | "tunnel"
  | "spiral"
  | "stack"
  | "wheel"
  | "cover"
  | "row"
  | "totem"
  | "mosaic"
  | "hero"
  | "bloom"
  | "vortex"
  | "split"
  | "zoom"
  | "flash"
  | "caption";

export type RenderContext = {
  ctx: CanvasRenderingContext2D;
  t: number;
  width: number;
  height: number;
  images: CanvasImageSource[];
  params: Record<string, number | string>;
  overlay?: TextOverlay;
};

export type MotionTemplate = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  slotCount: number;
  defaultDuration: number;
  defaultFrame?: FrameRatio;
  isNew?: boolean;
  thumb: ThumbKind;
  params: TemplateParam[];
  render: (ctx: RenderContext) => void;
};

export type SlotMedia = {
  id: string;
  kind: "image" | "video";
  url: string;
  name: string;
};

export function frameSize(ratio: FrameRatio, longEdge: number) {
  const spec = FRAME_RATIOS.find((r) => r.id === ratio) ?? FRAME_RATIOS[2];
  const max = Math.max(spec.w, spec.h);
  const w = Math.round((spec.w / max) * longEdge);
  const h = Math.round((spec.h / max) * longEdge);
  return { width: w, height: h };
}

export function defaultParams(template: MotionTemplate): Record<string, number | string> {
  const out: Record<string, number | string> = {};
  for (const p of template.params) out[p.id] = p.default;
  return out;
}

export function num(params: Record<string, number | string>, id: string, fallback: number) {
  const v = params[id];
  return typeof v === "number" ? v : Number(v) || fallback;
}

export function str(params: Record<string, number | string>, id: string, fallback: string) {
  const v = params[id];
  return typeof v === "string" ? v : fallback;
}

export function formatParamValue(p: NumberParam, v: number) {
  if (p.unit === "x") return `${(v / 100).toFixed(2)}×`;
  if (p.unit === "deg") return `${v}°`;
  if (p.unit === "pct") return `${v}%`;
  return String(v);
}

export const SCENE_KEEP = [
  "background",
  "backgroundType",
  "speed",
  "easing",
  "spacePerspective",
  "spaceOrbit",
  "spaceTilt",
  "spaceDistance",
  "spaceDepth",
] as const;
