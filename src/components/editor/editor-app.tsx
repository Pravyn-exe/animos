import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Download, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { MotionCanvas } from "@/components/motion-canvas";
import { TemplateThumb } from "@/components/template-thumb";
import { loadSlot, resolveSources, type LoadedMedia } from "@/lib/motion/engine";
import { downloadBlob, exportVideo } from "@/lib/export-video";
import { CATEGORIES, TEMPLATES, getTemplate } from "@/lib/motion/templates";
import { TEXT_PRESETS } from "@/lib/motion/text";
import {
  EXPORT_FORMATS,
  FRAME_RATIOS,
  FRAMERATES,
  RESOLUTIONS,
  formatParamValue,
  type ExportFormat,
  type ResolutionId,
  type SlotMedia,
  type TemplateParam,
} from "@/lib/motion/types";
import { useProject } from "@/lib/project-store";
import { cn } from "@/lib/utils";

export function EditorApp({ initialTemplate }: { initialTemplate?: string }) {
  const project = useProject();
  const [loaded, setLoaded] = useState<(LoadedMedia | null)[]>([]);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resolution, setResolution] = useState<ResolutionId>("1080p");
  const [fps, setFps] = useState(30);
  const [format, setFormat] = useState<ExportFormat>("mp4");
  const timeRef = useRef(0);
  const seekRef = useRef(0);

  useEffect(() => {
    if (initialTemplate && TEMPLATES.some((t) => t.id === initialTemplate)) {
      project.setTemplate(initialTemplate);
    }
  }, [initialTemplate]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(project.slots.map((s) => loadSlot(s))).then((list) => {
      if (!cancelled) setLoaded(list);
    });
    return () => {
      cancelled = true;
    };
  }, [project.slots]);

  const images = useMemo(() => resolveSources(loaded), [loaded]);
  const template = getTemplate(project.templateId);

  async function handleExport() {
    setExporting(true);
    setProgress(0);
    try {
      const { blob, ext } = await exportVideo({
        templateId: project.templateId,
        images,
        params: project.params,
        ratio: project.frame,
        resolution,
        duration: project.duration,
        fps,
        format,
        overlay: project.overlay,
        onProgress: setProgress,
      });
      downloadBlob(blob, `${project.name || "animos"}.${ext}`);
      toast.success(`Exported ${ext.toUpperCase()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
      setProgress(0);
    }
  }

  function onFiles(files: FileList | File[], startIndex = 0) {
    Array.from(files)
      .filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"))
      .forEach((file, i) => {
        const idx = startIndex + i;
        if (idx >= project.slots.length) return;
        project.setSlot(idx, {
          id: `${Date.now()}-${i}`,
          kind: file.type.startsWith("video/") ? "video" : "image",
          url: URL.createObjectURL(file),
          name: file.name,
        });
      });
  }

  return (
    <div className="flex h-dvh flex-col bg-bg text-ink">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-line px-3">
        <Link to="/" className="flex items-center gap-2">
          <Logo />
        </Link>
        <input
          value={project.name}
          onChange={(e) => project.setName(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-center text-sm outline-none"
        />
        <select value={fps} onChange={(e) => setFps(Number(e.target.value))} className="h-8 rounded-full bg-surface-2 px-2 text-xs">
          {FRAMERATES.map((f) => (
            <option key={f} value={f}>
              {f} fps
            </option>
          ))}
        </select>
        <select value={resolution} onChange={(e) => setResolution(e.target.value as ResolutionId)} className="h-8 rounded-full bg-surface-2 px-2 text-xs">
          {RESOLUTIONS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
        <Button onClick={() => void handleExport()} disabled={exporting} size="sm" variant="accent">
          <Download className="size-3.5" />
          {exporting ? `${Math.round(progress * 100)}%` : format === "webp" ? "Export WebP" : "Export MP4"}
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[220px] shrink-0 overflow-y-auto border-r border-line p-2 lg:block">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="mb-3">
              <div className="mb-1 px-1 text-[10px] tracking-wider text-ink-4 uppercase">{cat}</div>
              <div className="grid grid-cols-2 gap-1.5">
                {TEMPLATES.filter((t) => t.category === cat).map((t) => (
                  <button key={t.id} onClick={() => project.setTemplate(t.id)} className="text-left">
                    <TemplateThumb kind={t.thumb} isNew={t.isNew} active={t.id === project.templateId} />
                    <div className="mt-1 truncate px-0.5 text-[11px] text-ink-2">{t.name}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="editor-stage flex flex-1 items-center justify-center p-6">
            <MotionCanvas
              templateId={project.templateId}
              params={project.params}
              ratio={project.frame}
              duration={project.duration}
              playing={project.playing && !exporting}
              loaded={loaded}
              overlay={project.overlay}
              timeRef={timeRef}
              seekRef={seekRef}
              className="w-full max-w-[560px] rounded-2xl"
            />
          </div>
          <div className="flex h-14 items-center gap-2 border-t border-line px-3">
            <button
              onClick={() => project.setPlaying(!project.playing)}
              className="flex size-9 items-center justify-center rounded-full bg-surface-2"
            >
              {project.playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <input
              type="range"
              min={4}
              max={30}
              value={project.duration}
              onChange={(e) => project.setDuration(Number(e.target.value))}
              className="w-32 accent-accent"
            />
            <span className="font-mono text-[11px] text-ink-3">{project.duration}s</span>
          </div>
        </main>

        <aside className="hidden w-[280px] shrink-0 overflow-y-auto border-l border-line p-3 md:block">
          <div className="mb-3 text-[11px] tracking-wider text-ink-3 uppercase">Frame</div>
          <div className="mb-3 grid grid-cols-5 gap-1">
            {FRAME_RATIOS.map((r) => (
              <button
                key={r.id}
                onClick={() => project.setFrame(r.id)}
                className={cn("h-9 rounded-md text-[10px]", project.frame === r.id ? "bg-surface-3" : "bg-surface-2 text-ink-3")}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={() =>
              project.setParam("backgroundType", project.params.backgroundType === "transparent" ? "color" : "transparent")
            }
            className="mb-4 h-9 w-full rounded-lg bg-surface-2 text-[12px]"
          >
            {project.params.backgroundType === "transparent" ? "Transparent on" : "Transparent background"}
          </button>

          {(["motion", "space", "look"] as const).map((group) => (
            <div key={group} className="mb-4">
              <div className="mb-2 text-[11px] tracking-wider text-ink-3 uppercase">
                {group === "space" ? "3D space" : group}
              </div>
              {template.params
                .filter((p) => (p.group ?? "look") === group)
                .map((p) => (
                  <ParamControl key={p.id} param={p} />
                ))}
            </div>
          ))}

          <div className="mb-2 text-[11px] tracking-wider text-ink-3 uppercase">Media</div>
          {project.slots.map((slot, i) => (
            <SlotRow key={i} slot={slot} index={i} onFiles={(files) => onFiles(files, i)} onClear={() => project.setSlot(i, null)} />
          ))}

          <div className="mt-4 mb-2 text-[11px] tracking-wider text-ink-3 uppercase">Text</div>
          <select
            value={project.overlay.preset}
            onChange={(e) => project.setTextPreset(e.target.value as (typeof TEXT_PRESETS)[number]["id"])}
            className="mb-2 h-9 w-full rounded-lg bg-surface-2 px-2 text-[13px]"
          >
            {TEXT_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            value={project.overlay.title}
            onChange={(e) => project.setOverlay({ title: e.target.value })}
            className="mb-2 h-9 w-full rounded-lg bg-surface-2 px-3 text-[13px]"
            placeholder="Title"
          />

          <div className="mt-4 mb-2 text-[11px] tracking-wider text-ink-3 uppercase">Export</div>
          <div className="mb-2 flex gap-1">
            {EXPORT_FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={cn("h-8 flex-1 rounded-md text-[12px]", format === f.id ? "bg-ink text-bg" : "bg-surface-2")}
              >
                {f.label}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function ParamControl({ param }: { param: TemplateParam }) {
  const project = useProject();
  if (param.type === "number") {
    const v = Number(project.params[param.id] ?? param.default);
    return (
      <label className="mb-3 block">
        <span className="flex justify-between text-[12px] text-ink-2">
          {param.label}
          <span className="tabular-nums text-ink-3">{formatParamValue(param, v)}</span>
        </span>
        <input
          type="range"
          min={param.min}
          max={param.max}
          step={param.step ?? 1}
          value={v}
          onChange={(e) => project.setParam(param.id, Number(e.target.value))}
          className="mt-1 w-full accent-accent"
        />
      </label>
    );
  }
  if (param.type === "select") {
    return (
      <label className="mb-3 block text-[12px] text-ink-2">
        {param.label}
        <select
          value={String(project.params[param.id] ?? param.default)}
          onChange={(e) => project.setParam(param.id, e.target.value)}
          className="mt-1 h-9 w-full rounded-lg bg-surface-2 px-2 text-[13px]"
        >
          {param.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    );
  }
  return (
    <label className="mb-3 flex items-center justify-between text-[12px] text-ink-2">
      {param.label}
      <input
        type="color"
        value={String(project.params[param.id] ?? param.default)}
        onChange={(e) => project.setParam(param.id, e.target.value)}
        className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent"
      />
    </label>
  );
}

function SlotRow({
  slot,
  index,
  onFiles,
  onClear,
}: {
  slot: SlotMedia | null;
  index: number;
  onFiles: (files: FileList) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="mb-1.5 flex items-center gap-2 rounded-xl bg-surface-2 px-2 py-1.5">
      <button onClick={() => inputRef.current?.click()} className="size-9 overflow-hidden rounded-lg bg-surface-3">
        {slot ? (
          slot.kind === "video" ? (
            <video src={slot.url} muted className="size-full object-cover" />
          ) : (
            <img src={slot.url} alt="" className="size-full object-cover" />
          )
        ) : (
          <span className="text-[10px] text-ink-4">+</span>
        )}
      </button>
      <button onClick={() => inputRef.current?.click()} className="min-w-0 flex-1 text-left text-[12px]">
        Slot {index + 1}
        <div className="truncate text-[11px] text-ink-3">{slot?.name ?? "Empty"}</div>
      </button>
      {slot ? (
        <button onClick={onClear} className="text-[11px] text-ink-3">
          x
        </button>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
