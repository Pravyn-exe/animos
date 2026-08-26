import { renderAtResolution } from "@/lib/motion/engine";
import type { TextOverlay } from "@/lib/motion/text";
import type { ExportFormat, FrameRatio, ResolutionId } from "@/lib/motion/types";
import { RESOLUTIONS } from "@/lib/motion/types";

export type ExportOpts = {
  templateId: string;
  images: CanvasImageSource[];
  params: Record<string, number | string>;
  ratio: FrameRatio;
  resolution: ResolutionId;
  duration: number;
  fps?: number;
  format?: ExportFormat;
  overlay?: TextOverlay;
  onProgress?: (p: number) => void;
};

export function downloadBlob(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

function longEdge(id: ResolutionId) {
  return RESOLUTIONS.find((r) => r.id === id)?.long ?? 1280;
}

function makeCanvas() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.left = "-9999px";
  document.body.appendChild(canvas);
  return canvas;
}

function paint(opts: ExportOpts, canvas: HTMLCanvasElement, t: number) {
  renderAtResolution({
    canvas,
    templateId: opts.templateId,
    t,
    images: opts.images,
    params: opts.params,
    ratio: opts.ratio,
    longEdge: longEdge(opts.resolution),
    overlay: opts.overlay,
  });
}

export async function exportFrame(opts: {
  templateId: string;
  images: CanvasImageSource[];
  params: Record<string, number | string>;
  ratio: FrameRatio;
  resolution: ResolutionId;
  t: number;
  overlay?: TextOverlay;
  type: "image/png" | "image/webp";
}) {
  const canvas = makeCanvas();
  renderAtResolution({
    canvas,
    templateId: opts.templateId,
    t: opts.t,
    images: opts.images,
    params: opts.params,
    ratio: opts.ratio,
    longEdge: longEdge(opts.resolution),
    overlay: opts.overlay,
  });
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("frame failed"))), opts.type, 0.92);
  });
  canvas.remove();
  downloadBlob(blob, `animos-frame.${opts.type === "image/png" ? "png" : "webp"}`);
}

export async function exportPngSequence(opts: ExportOpts): Promise<Blob> {
  const { blob } = await exportVideo({ ...opts, format: "webp" });
  return blob;
}

export async function exportVideo(opts: ExportOpts): Promise<{ blob: Blob; ext: string }> {
  const fps = opts.fps ?? 30;
  const canvas = makeCanvas();
  paint(opts, canvas, 0);
  const frames = Math.max(8, Math.round(opts.duration * fps));
  const wantWebp = opts.format === "webp" || opts.params.backgroundType === "transparent";

  if (wantWebp) {
    const parts: Blob[] = [];
    for (let i = 0; i < frames; i++) {
      paint(opts, canvas, Math.min(i / frames, 0.999));
      parts.push(
        await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("webp frame"))), "image/webp", 0.92);
        }),
      );
      opts.onProgress?.(i / frames);
    }
    canvas.remove();
    return { blob: parts[0] ?? new Blob(), ext: "webp" };
  }

  if (typeof VideoEncoder === "undefined") {
    canvas.remove();
    throw new Error("Use Chrome or Edge to export MP4");
  }

  const width = canvas.width;
  const height = canvas.height;
  const { Muxer, ArrayBufferTarget } = await import("mp4-muxer");
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: { codec: "avc", width, height, frameRate: fps },
    fastStart: "in-memory",
    firstTimestampBehavior: "offset",
  });
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => console.error(e),
  });
  encoder.configure({
    codec: "avc1.640028",
    width,
    height,
    bitrate: Math.max(2_500_000, width * height * fps * 0.1),
    framerate: fps,
    avc: { format: "avc" },
  });
  for (let i = 0; i < frames; i++) {
    paint(opts, canvas, Math.min(i / frames, 0.999));
    const frame = new VideoFrame(canvas, {
      timestamp: Math.round((i * 1e6) / fps),
      duration: Math.round(1e6 / fps),
    });
    encoder.encode(frame, { keyFrame: i % fps === 0 });
    frame.close();
    opts.onProgress?.(i / frames);
  }
  await encoder.flush();
  encoder.close();
  muxer.finalize();
  canvas.remove();
  return { blob: new Blob([target.buffer], { type: "video/mp4" }), ext: "mp4" };
}
