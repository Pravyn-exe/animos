import { clamp, lerp } from "./easing";
import { num, str, type RenderContext } from "./types";

export type SourceSize = { w: number; h: number };

export function sourceSize(img: CanvasImageSource): SourceSize {
  if (img instanceof HTMLVideoElement) {
    return { w: img.videoWidth || 1, h: img.videoHeight || 1 };
  }
  if (img instanceof HTMLImageElement) {
    return { w: img.naturalWidth || img.width || 1, h: img.naturalHeight || img.height || 1 };
  }
  if (img instanceof HTMLCanvasElement) {
    return { w: img.width, h: img.height };
  }
  if (typeof ImageBitmap !== "undefined" && img instanceof ImageBitmap) {
    return { w: img.width, h: img.height };
  }
  return { w: 1, h: 1 };
}

export function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = clamp(r, 0, Math.min(w, h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const { w: iw, h: ih } = sourceSize(img);
  if (iw < 2 || ih < 2 || w < 1 || h < 1) return;
  const scale = Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

export type CardOpts = {
  radius?: number;
  shadow?: number;
  rotate?: number;
  rotateY?: number;
  scale?: number;
  opacity?: number;
  border?: boolean;
};

let depthMul = 1;

export function beginSpace(params: Record<string, number | string>) {
  depthMul = num(params, "spaceDepth", 100) / 100;
}

export function endSpace() {
  depthMul = 1;
}

export function drawCard(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource | null | undefined,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: CardOpts = {},
) {
  const {
    radius = 18,
    shadow = 0.55,
    rotate = 0,
    rotateY = 0,
    scale = 1,
    opacity = 1,
    border = true,
  } = opts;

  if (w < 1 || h < 1 || opacity <= 0.01 || scale <= 0.01) return;

  const ry = rotateY * depthMul;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const squash = Math.max(0.12, Math.cos(ry));

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotate);
  ctx.scale(scale * squash, scale);
  ctx.globalAlpha *= opacity;

  if (shadow > 0) {
    ctx.shadowColor = `rgba(0,0,0,${0.45 * shadow})`;
    ctx.shadowBlur = 28 * shadow;
    ctx.shadowOffsetY = 14 * shadow;
  }

  roundRectPath(ctx, -w / 2, -h / 2, w, h, radius);
  ctx.fillStyle = "#1a1a1c";
  ctx.fill();
  ctx.clip();
  ctx.shadowColor = "transparent";

  if (img) {
    drawCover(ctx, img, -w / 2, -h / 2, w, h);
  } else {
    ctx.fillStyle = "#2a2a2e";
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, -w / 2 + 10, -h / 2 + 10, w - 20, h - 20, Math.max(8, radius - 8));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (border) {
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 1.25;
    roundRectPath(ctx, -w / 2 + 0.6, -h / 2 + 0.6, w - 1.2, h - 1.2, radius);
    ctx.stroke();
  }

  ctx.restore();
}

export function paintBackground(rc: RenderContext) {
  const { ctx, width, height, params } = rc;
  const type = str(params, "backgroundType", "color");
  if (type === "transparent") {
    ctx.clearRect(0, 0, width, height);
    return;
  }
  const color = str(params, "background", "#0f0f0f");
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  if (type === "gradient") {
    const g = ctx.createLinearGradient(0, 0, width * 0.2, height);
    g.addColorStop(0, shade(color, 18));
    g.addColorStop(1, color);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }
}

export function fillStageBackground(rc: Pick<RenderContext, "ctx" | "width" | "height" | "params">) {
  const type = str(rc.params, "backgroundType", "color");
  if (type === "transparent") return;
  rc.ctx.fillStyle = str(rc.params, "background", "#0f0f0f");
  rc.ctx.fillRect(0, 0, rc.width, rc.height);
}

export function applySpaceCamera(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: Record<string, number | string>,
  draw: () => void,
) {
  const persp = num(params, "spacePerspective", 0);
  const orbit = num(params, "spaceOrbit", 0);
  const tilt = num(params, "spaceTilt", 0);
  const distance = num(params, "spaceDistance", 100);
  if (persp === 0 && orbit === 0 && tilt === 0 && distance === 100) {
    draw();
    return;
  }

  const yaw = (orbit * Math.PI) / 180;
  const pitch = (tilt * Math.PI) / 180;
  const p = persp / 100;
  const scale = distance / 100;
  const sx = Math.max(0.38, Math.cos(yaw)) * scale * (1 - p * 0.1);
  const sy = Math.max(0.38, Math.cos(pitch)) * scale * (1 - p * 0.16);
  const kx = Math.sin(yaw) * (0.16 + p * 0.48);
  const ky = Math.sin(pitch) * (0.1 + p * 0.36) + p * 0.12;
  const dy = Math.sin(pitch) * height * 0.08;

  ctx.save();
  ctx.translate(width / 2, height / 2 + dy);
  ctx.transform(sx, ky, kx, sy, 0, 0);
  ctx.translate(-width / 2, -height / 2);
  draw();
  ctx.restore();
}

export function contentBox(rc: RenderContext) {
  const pad = (num(rc.params, "padding", 8) / 100) * Math.min(rc.width, rc.height);
  return {
    x: pad,
    y: pad,
    w: rc.width - pad * 2,
    h: rc.height - pad * 2,
    pad,
    radius: num(rc.params, "radius", 22),
    shadow: num(rc.params, "shadow", 55) / 100,
  };
}

export function imageAt(images: CanvasImageSource[], i: number) {
  if (!images.length) return null;
  return images[((i % images.length) + images.length) % images.length] ?? null;
}

export function cardSize(box: { w: number; h: number }, ratio = 0.72, aspect = 3 / 4) {
  const h = box.h * ratio;
  const w = h * aspect;
  return { w: Math.min(w, box.w * 0.78), h };
}

function shade(hex: string, amt: number) {
  const n = hex.replace("#", "");
  if (n.length !== 6) return hex;
  const r = clamp(parseInt(n.slice(0, 2), 16) + amt, 0, 255);
  const g = clamp(parseInt(n.slice(2, 4), 16) + amt, 0, 255);
  const b = clamp(parseInt(n.slice(4, 6), 16) + amt, 0, 255);
  return `rgb(${r},${g},${b})`;
}

export function dirSign(params: Record<string, number | string>, fallback = "left") {
  const d = str(params, "direction", fallback);
  if (d === "right" || d === "up" || d === "left-to-right" || d === "bottom-to-top") return -1;
  return 1;
}

export function mixCommon(): import("./types").TemplateParam[] {
  return [
    {
      type: "number",
      id: "speed",
      label: "Speed",
      min: 25,
      max: 300,
      step: 5,
      default: 100,
      group: "motion",
      unit: "x",
    },
    {
      type: "select",
      id: "easing",
      label: "Easing",
      default: "linear",
      group: "motion",
      options: [
        { value: "linear", label: "Linear" },
        { value: "in", label: "Ease in" },
        { value: "out", label: "Ease out" },
        { value: "in-out", label: "Ease in-out" },
        { value: "sine", label: "Sine" },
        { value: "back", label: "Back" },
        { value: "expo", label: "Expo" },
        { value: "bounce", label: "Bounce" },
      ],
    },
    {
      type: "number",
      id: "spacePerspective",
      label: "Perspective",
      min: 0,
      max: 90,
      default: 0,
      group: "space",
    },
    {
      type: "number",
      id: "spaceOrbit",
      label: "Orbit",
      min: -70,
      max: 70,
      default: 0,
      group: "space",
      unit: "deg",
    },
    {
      type: "number",
      id: "spaceTilt",
      label: "Tilt",
      min: -50,
      max: 50,
      default: 0,
      group: "space",
      unit: "deg",
    },
    {
      type: "number",
      id: "spaceDistance",
      label: "Distance",
      min: 55,
      max: 160,
      default: 100,
      group: "space",
      unit: "pct",
    },
    {
      type: "number",
      id: "spaceDepth",
      label: "Depth",
      min: 0,
      max: 200,
      default: 100,
      group: "space",
      unit: "pct",
    },
    {
      type: "select",
      id: "backgroundType",
      label: "Background",
      default: "color",
      group: "look",
      options: [
        { value: "color", label: "Colour" },
        { value: "gradient", label: "Gradient" },
        { value: "transparent", label: "Transparent" },
      ],
    },
    { type: "color", id: "background", label: "Colour", default: "#0f0f0f", group: "look" },
    { type: "number", id: "padding", label: "Padding", min: 0, max: 22, default: 8, group: "look" },
    { type: "number", id: "radius", label: "Corner radius", min: 0, max: 48, default: 22, group: "look" },
    { type: "number", id: "shadow", label: "Shadow", min: 0, max: 100, default: 55, group: "look" },
  ];
}

export function lerpColor(a: string, b: string, t: number) {
  const pa = parse(a);
  const pb = parse(b);
  const r = Math.round(lerp(pa[0], pb[0], t));
  const g = Math.round(lerp(pa[1], pb[1], t));
  const bl = Math.round(lerp(pa[2], pb[2], t));
  return `rgb(${r},${g},${bl})`;
}

function parse(hex: string): [number, number, number] {
  const n = hex.replace("#", "");
  if (n.length !== 6) return [15, 15, 15];
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}
