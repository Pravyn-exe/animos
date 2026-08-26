import { clamp, easeOutCubic, fract, lerp } from "./easing";

export type TextPosition = "top" | "center" | "bottom";
export type TextPresetId =
  | "none"
  | "fade-up"
  | "punch"
  | "typewriter"
  | "word-by-word"
  | "lower-third"
  | "center-lock"
  | "bounce"
  | "stamp"
  | "outline-pop"
  | "karaoke"
  | "glitch"
  | "rise-blur"
  | "caption-bar"
  | "hook-stack"
  | "slide-in";

export type TextOverlay = {
  preset: TextPresetId;
  title: string;
  subtitle: string;
  color: string;
  size: number;
  position: TextPosition;
};

export type TextPreset = { id: TextPresetId; name: string; description: string; isNew?: boolean };

export const TEXT_PRESETS: TextPreset[] = [
  { id: "none", name: "None", description: "No text overlay." },
  { id: "fade-up", name: "Fade Up", description: "Soft rise with a fade." },
  { id: "punch", name: "Punch", description: "Scale slam on the hook.", isNew: true },
  { id: "typewriter", name: "Typewriter", description: "Characters tick on." },
  { id: "word-by-word", name: "Word by Word", description: "Each word pops in sequence." },
  { id: "lower-third", name: "Lower Third", description: "Bar + nameplate." },
  { id: "center-lock", name: "Center Lock", description: "Big centered title." },
  { id: "bounce", name: "Bounce", description: "Overshoots in from below." },
  { id: "stamp", name: "Stamp", description: "Rotates and slams.", isNew: true },
  { id: "outline-pop", name: "Outline Pop", description: "Stroke first, fill second." },
  { id: "karaoke", name: "Karaoke", description: "Words light up in time.", isNew: true },
  { id: "glitch", name: "Glitch", description: "RGB split on the in.", isNew: true },
  { id: "rise-blur", name: "Rise Blur", description: "Lifts out of a heavy shadow." },
  { id: "caption-bar", name: "Caption Bar", description: "Black bar, white type." },
  { id: "hook-stack", name: "Hook Stack", description: "Title, then subtitle.", isNew: true },
  { id: "slide-in", name: "Slide In", description: "Enters from the left." },
];

export const DEFAULT_OVERLAY: TextOverlay = {
  preset: "none",
  title: "YOUR HOOK",
  subtitle: "Add a line",
  color: "#ffffff",
  size: 100,
  position: "bottom",
};

export function drawTextOverlay(
  ctx: CanvasRenderingContext2D,
  t: number,
  overlay: TextOverlay,
  width: number,
  height: number,
) {
  if (overlay.preset === "none") return;
  const title = overlay.title || "YOUR HOOK";
  const y = overlay.position === "top" ? height * 0.16 : overlay.position === "center" ? height * 0.5 : height * 0.78;
  const appear = easeOutCubic(clamp((t % 1) / 0.22, 0, 1));
  const px = Math.round(Math.min(width, height) * 0.072 * (overlay.size / 100));
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${px}px Geist, Inter, system-ui`;
  ctx.fillStyle = overlay.color || "#ffffff";
  ctx.globalAlpha = appear;
  const scale = overlay.preset === "punch" ? lerp(1.4, 1, appear) : 1;
  ctx.translate(width / 2, y);
  ctx.scale(scale, scale);
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 18;
  ctx.fillText(title, 0, 0);
  if (overlay.subtitle) {
    ctx.font = `500 ${Math.round(px * 0.42)}px Inter, system-ui`;
    ctx.globalAlpha = appear * 0.85;
    ctx.fillText(overlay.subtitle, 0, px * 0.9);
  }
  ctx.restore();
}
