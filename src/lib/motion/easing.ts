export function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function wrap(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function fract(n: number) {
  return n - Math.floor(n);
}

export function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInCubic(t: number) {
  return t * t * t;
}

export function easeOutBack(t: number) {
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}

export function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export function easeInExpo(t: number) {
  return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
}

export function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function easeInOutExpo(t: number) {
  if (t === 0 || t === 1) return t;
  return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

export function easeOutBounce(t: number) {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t - 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t - 2.25 / d1) * t + 0.9375;
  return n1 * (t - 2.625 / d1) * t + 0.984375;
}

export type EasingId = "linear" | "in" | "out" | "in-out" | "sine" | "back" | "expo" | "bounce";

export const EASING_OPTIONS: { value: EasingId; label: string }[] = [
  { value: "linear", label: "Linear" },
  { value: "in", label: "Ease in" },
  { value: "out", label: "Ease out" },
  { value: "in-out", label: "Ease in-out" },
  { value: "sine", label: "Sine" },
  { value: "back", label: "Back" },
  { value: "expo", label: "Expo" },
  { value: "bounce", label: "Bounce" },
];

export function applyTimeEase(t: number, id: string) {
  const x = clamp(t, 0, 1);
  switch (id) {
    case "in":
      return easeInCubic(x);
    case "out":
      return easeOutCubic(x);
    case "in-out":
      return easeInOutCubic(x);
    case "sine":
      return easeInOutSine(x);
    case "back":
      return clamp(easeOutBack(x), 0, 1);
    case "expo":
      return easeInOutExpo(x);
    case "bounce":
      return easeOutBounce(x);
    default:
      return x;
  }
}

export function pingpong(t: number) {
  const x = wrap(t, 2);
  return x < 1 ? x : 2 - x;
}

export function slotTime(t: number, index: number, count: number, overlap = 0) {
  const span = 1 / count;
  const start = index * span * (1 - overlap);
  return clamp((t - start) / (span + overlap * span), 0, 1);
}
