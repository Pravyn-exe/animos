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

function even(n: number) {
  return n % 2 === 0 ? n : n + 1;
}

function makeCanvas() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;left:0;top:0;opacity:0;pointer-events:none;width:4px;height:4px";
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
    longEdge: even(longEdge(opts.resolution)),
    overlay: opts.overlay,
  });
}

function whyFailed(err: unknown) {
  const host = typeof location !== "undefined" ? location.hostname : "";
  const local = host === "localhost" || host === "127.0.0.1";
  if (typeof window !== "undefined" && !window.isSecureContext && !local) {
    return "Open http://localhost:8080 — export does not work on the Wi-Fi IP (192.168…).";
  }
  const msg = err instanceof Error ? err.message : String(err);
  if (msg && !msg.includes("Chrome or Edge")) return `Export failed: ${msg}. Try 720p or WebP.`;
  return "Export failed in this tab. Use http://localhost:8080, pick 720p, or switch to WebP.";
}

function pickRecorderMime() {
  const types = [
    "video/mp4;codecs=avc1.42001E",
    "video/mp4",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  for (const mime of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mime)) {
      return { mime, ext: mime.includes("mp4") ? "mp4" : "webm" };
    }
  }
  return { mime: "", ext: "webm" };
}

async function exportRecorder(opts: ExportOpts): Promise<{ blob: Blob; ext: string }> {
  const fps = opts.fps ?? 30;
  const canvas = makeCanvas();
  paint(opts, canvas, 0);
  const { mime, ext } = pickRecorderMime();
  const stream = canvas.captureStream(fps);
  const rec = mime
    ? new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 })
    : new MediaRecorder(stream);
  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  const done = new Promise<Blob>((resolve, reject) => {
    rec.onerror = () => reject(new Error("Recording failed"));
    rec.onstop = () => resolve(new Blob(chunks, { type: rec.mimeType || "video/webm" }));
  });
  rec.start(100);
  const start = performance.now();
  const totalMs = Math.max(1000, opts.duration * 1000);
  await new Promise<void>((resolve) => {
    const tick = () => {
      const t = Math.min((performance.now() - start) / totalMs, 0.999);
      opts.onProgress?.(t);
      paint(opts, canvas, t);
      if (t < 0.999) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
  rec.stop();
  const blob = await done;
  stream.getTracks().forEach((tr) => tr.stop());
  canvas.remove();
  if (!blob.size) throw new Error("Empty recording");
  return { blob, ext: blob.type.includes("mp4") ? "mp4" : ext };
}

async function exportMp4Codecs(opts: ExportOpts): Promise<{ blob: Blob; ext: string }> {
  if (typeof VideoEncoder === "undefined" || typeof VideoFrame === "undefined") {
    throw new Error("no WebCodecs");
  }
  const fps = opts.fps ?? 30;
  const canvas = makeCanvas();
  paint(opts, canvas, 0);
  const width = even(canvas.width);
  const height = even(canvas.height);
  const bitrate = Math.max(2_500_000, Math.min(16_000_000, width * height * fps * 0.08));
  const codecs = ["avc1.4D002A", "avc1.42001E", "avc1.640028", "avc1.42001f"];
  let codec = "";
  for (const c of codecs) {
    try {
      const s = await VideoEncoder.isConfigSupported({ codec: c, width, height, bitrate, framerate: fps });
      if (s.supported) {
        codec = c;
        break;
      }
    } catch {
      /* next */
    }
  }
  if (!codec) {
    canvas.remove();
    throw new Error("no H.264 encoder");
  }
  const { Muxer, ArrayBufferTarget } = await import("mp4-muxer");
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: { codec: "avc", width, height, frameRate: fps },
    fastStart: "in-memory",
    firstTimestampBehavior: "offset",
  });
  let muxError: Error | null = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => {
      muxError = e;
    },
  });
  encoder.configure({ codec, width, height, bitrate, framerate: fps, avc: { format: "avc" } });
  const frames = Math.max(8, Math.round(opts.duration * fps));
  for (let i = 0; i < frames; i++) {
    if (muxError) throw muxError;
    paint(opts, canvas, Math.min(i / frames, 0.999));
    const frame = new VideoFrame(canvas, {
      timestamp: Math.round((i * 1e6) / fps),
      duration: Math.round(1e6 / fps),
    });
    encoder.encode(frame, { keyFrame: i % fps === 0 });
    frame.close();
    while (encoder.encodeQueueSize > 8) await new Promise((r) => setTimeout(r, 0));
    opts.onProgress?.(i / frames);
  }
  await encoder.flush();
  encoder.close();
  muxer.finalize();
  canvas.remove();
  return { blob: new Blob([target.buffer], { type: "video/mp4" }), ext: "mp4" };
}

async function exportWebp(opts: ExportOpts): Promise<{ blob: Blob; ext: string }> {
  const fps = Math.min(opts.fps ?? 30, 30);
  const canvas = makeCanvas();
  const frames = Math.max(8, Math.round(opts.duration * fps));
  const parts: Blob[] = [];
  for (let i = 0; i < frames; i++) {
    paint(opts, canvas, Math.min(i / frames, 0.999));
    parts.push(
      await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("webp frame"))), "image/webp", 0.9);
      }),
    );
    opts.onProgress?.(i / frames);
  }
  canvas.remove();
  return { blob: parts[Math.floor(parts.length / 2)] ?? parts[0], ext: "webp" };
}

export async function exportVideo(opts: ExportOpts): Promise<{ blob: Blob; ext: string }> {
  const wantWebp = opts.format === "webp" || opts.params.backgroundType === "transparent";
  if (wantWebp) {
    try {
      return await exportWebp(opts);
    } catch (err) {
      throw new Error(whyFailed(err));
    }
  }
  try {
    return await exportMp4Codecs(opts);
  } catch {
    try {
      return await exportRecorder(opts);
    } catch (err) {
      throw new Error(whyFailed(err));
    }
  }
}

export async function exportPngSequence(opts: ExportOpts): Promise<Blob> {
  const { blob } = await exportWebp(opts);
  return blob;
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
