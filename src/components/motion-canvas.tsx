import { useEffect, useRef, type MutableRefObject } from "react";
import { renderFrame, resolveSources, type LoadedMedia } from "@/lib/motion/engine";
import type { FrameRatio } from "@/lib/motion/types";
import { FRAME_RATIOS } from "@/lib/motion/types";
import type { TextOverlay } from "@/lib/motion/text";
import { cn } from "@/lib/utils";

const EMPTY_LOADED: (LoadedMedia | null)[] = [];

export function MotionCanvas({
  templateId,
  params,
  ratio,
  duration,
  playing = true,
  loaded = EMPTY_LOADED,
  overlay,
  className,
  timeRef,
  seekRef,
}: {
  templateId: string;
  params: Record<string, number | string>;
  ratio: FrameRatio;
  duration: number;
  playing?: boolean;
  loaded?: (LoadedMedia | null)[];
  overlay?: TextOverlay;
  className?: string;
  timeRef?: MutableRefObject<number>;
  seekRef?: MutableRefObject<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const paramsRef = useRef(params);
  const loadedRef = useRef(loaded);
  const playingRef = useRef(playing);
  const durationRef = useRef(duration);
  const templateRef = useRef(templateId);
  const ratioRef = useRef(ratio);
  const overlayRef = useRef(overlay);
  paramsRef.current = params;
  loadedRef.current = loaded;
  playingRef.current = playing;
  durationRef.current = duration;
  templateRef.current = templateId;
  ratioRef.current = ratio;
  overlayRef.current = overlay;

  const spec = FRAME_RATIOS.find((r) => r.id === ratio) ?? FRAME_RATIOS[2];
  const transparent = params.backgroundType === "transparent";

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    let raf = 0;
    let start = performance.now() - (seekRef?.current ?? 0) * (durationRef.current || 8) * 1000;
    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const loop = (now: number) => {
      const images = resolveSources(loadedRef.current);
      const dur = durationRef.current || 8;
      let t: number;
      if (reduced) {
        t = 0;
      } else if (!playingRef.current) {
        t = seekRef?.current ?? 0;
        start = now - t * dur * 1000;
      } else {
        const elapsed = (now - start) / 1000;
        t = (elapsed % dur) / dur;
        if (seekRef) seekRef.current = t;
      }
      if (timeRef) timeRef.current = t;
      const cssWidth = wrap.clientWidth || 480;
      renderFrame({
        canvas,
        templateId: templateRef.current,
        t,
        images,
        params: paramsRef.current,
        ratio: ratioRef.current,
        cssWidth,
        overlay: overlayRef.current,
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [timeRef, seekRef, playing, templateId]);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative w-full overflow-hidden rounded-xl shadow-[var(--shadow-canvas)]",
        transparent ? "checkerboard" : "bg-surface",
        className,
      )}
      style={{ aspectRatio: `${spec.w} / ${spec.h}` }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}
