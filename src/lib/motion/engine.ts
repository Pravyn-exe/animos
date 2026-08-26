import { applySpaceCamera, beginSpace, endSpace, fillStageBackground } from "./draw";
import { applyTimeEase, fract } from "./easing";
import { getMockupCanvases } from "./mockups";
import { getTemplate } from "./templates";
import { drawTextOverlay, type TextOverlay } from "./text";
import type { FrameRatio, SlotMedia } from "./types";
import { frameSize, num, str } from "./types";

export type LoadedMedia = {
  source: CanvasImageSource;
  kind: "image" | "video";
  el?: HTMLVideoElement;
};

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

function loadVideo(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onloadeddata = () => {
      void video.play().catch(() => undefined);
      resolve(video);
    };
    video.onerror = () => reject(new Error("Failed to load video"));
    video.src = url;
  });
}

export async function loadSlot(slot: SlotMedia | null): Promise<LoadedMedia | null> {
  if (!slot) return null;
  try {
    if (slot.kind === "video") {
      const el = await loadVideo(slot.url);
      return { source: el, kind: "video", el };
    }
    const img = await loadImage(slot.url);
    return { source: img, kind: "image" };
  } catch {
    return null;
  }
}

export function demoSources(): CanvasImageSource[] {
  return getMockupCanvases();
}

export function resolveSources(loaded: (LoadedMedia | null)[]): CanvasImageSource[] {
  const fromSlots = loaded.filter(Boolean).map((m) => m!.source);
  if (fromSlots.length) return fromSlots;
  return demoSources();
}

export function motionT(t: number, params: Record<string, number | string>) {
  const speed = Math.max(0.1, num(params, "speed", 100) / 100);
  const raw = fract(t * speed);
  return applyTimeEase(raw, str(params, "easing", "linear"));
}

function paintScene(
  ctx: CanvasRenderingContext2D,
  templateId: string,
  t: number,
  width: number,
  height: number,
  images: CanvasImageSource[],
  params: Record<string, number | string>,
  overlay?: TextOverlay,
) {
  const template = getTemplate(templateId);
  const mt = motionT(t, params);
  const sources = images.length ? images : demoSources();
  fillStageBackground({ ctx, width, height, params });
  beginSpace(params);
  applySpaceCamera(ctx, width, height, params, () => {
    template.render({
      ctx,
      t: mt,
      width,
      height,
      images: sources,
      params,
      overlay,
    });
  });
  endSpace();
  if (overlay) drawTextOverlay(ctx, mt, overlay, width, height);
}

export function renderFrame(opts: {
  canvas: HTMLCanvasElement;
  templateId: string;
  t: number;
  images: CanvasImageSource[];
  params: Record<string, number | string>;
  ratio: FrameRatio;
  cssWidth?: number;
  overlay?: TextOverlay;
}) {
  const ctx = opts.canvas.getContext("2d", { alpha: true });
  if (!ctx) return;
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const { width, height } = frameSize(opts.ratio, 1080);
  const cssW = opts.cssWidth ?? Math.min(width, 720);
  const cssH = (cssW * height) / width;
  if (opts.canvas.width !== Math.round(cssW * dpr) || opts.canvas.height !== Math.round(cssH * dpr)) {
    opts.canvas.width = Math.round(cssW * dpr);
    opts.canvas.height = Math.round(cssH * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  paintScene(ctx, opts.templateId, opts.t, cssW, cssH, opts.images, opts.params, opts.overlay);
}

export function renderAtResolution(opts: {
  canvas: HTMLCanvasElement;
  templateId: string;
  t: number;
  images: CanvasImageSource[];
  params: Record<string, number | string>;
  ratio: FrameRatio;
  longEdge: number;
  overlay?: TextOverlay;
}) {
  let { width, height } = frameSize(opts.ratio, opts.longEdge);
  width -= width % 2;
  height -= height % 2;
  if (opts.canvas.width !== width || opts.canvas.height !== height) {
    opts.canvas.width = width;
    opts.canvas.height = height;
  }
  const ctx = opts.canvas.getContext("2d", { alpha: true });
  if (!ctx) return { width, height };
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  paintScene(ctx, opts.templateId, opts.t, width, height, opts.images, opts.params, opts.overlay);
  return { width, height };
}
