import { create } from "zustand";
import { defaultParams, SCENE_KEEP } from "@/lib/motion/types";
import { getTemplate } from "@/lib/motion/templates";
import { DEFAULT_OVERLAY, type TextOverlay, type TextPresetId } from "@/lib/motion/text";
import type { FrameRatio, SlotMedia } from "@/lib/motion/types";

type ProjectState = {
  name: string;
  templateId: string;
  frame: FrameRatio;
  duration: number;
  params: Record<string, number | string>;
  slots: (SlotMedia | null)[];
  playing: boolean;
  overlay: TextOverlay;
  setName: (name: string) => void;
  setTemplate: (id: string) => void;
  setFrame: (frame: FrameRatio) => void;
  setDuration: (n: number) => void;
  setSlotCount: (n: number) => void;
  setParam: (id: string, value: number | string) => void;
  setSlot: (index: number, media: SlotMedia | null) => void;
  clearSlots: () => void;
  setPlaying: (v: boolean) => void;
  resetParams: () => void;
  resetSpace: () => void;
  setOverlay: (partial: Partial<TextOverlay>) => void;
  setTextPreset: (id: TextPresetId) => void;
};

function sizedSlots(count: number, prev: (SlotMedia | null)[]) {
  const n = Math.max(2, Math.min(12, count));
  return Array.from({ length: n }, (_, i) => prev[i] ?? null);
}

export const useProject = create<ProjectState>((set, get) => {
  const t = getTemplate("carousel-flow");
  return {
    name: "Untitled showcase",
    templateId: t.id,
    frame: "4:5",
    duration: t.defaultDuration,
    params: defaultParams(t),
    slots: sizedSlots(t.slotCount, []),
    playing: true,
    overlay: { ...DEFAULT_OVERLAY },
    setName: (name) => set({ name }),
    setTemplate: (id) => {
      const next = getTemplate(id);
      const prev = get();
      const params = { ...defaultParams(next) };
      for (const k of SCENE_KEEP) {
        if (prev.params[k] !== undefined) params[k] = prev.params[k];
      }
      set({
        templateId: next.id,
        duration: next.defaultDuration,
        frame: next.defaultFrame ?? prev.frame,
        params,
        slots: sizedSlots(next.slotCount, prev.slots),
      });
    },
    setFrame: (frame) => set({ frame }),
    setDuration: (duration) => set({ duration }),
    setSlotCount: (n) => set({ slots: sizedSlots(n, get().slots) }),
    setParam: (id, value) => set({ params: { ...get().params, [id]: value } }),
    setSlot: (index, media) => {
      const slots = [...get().slots];
      slots[index] = media;
      set({ slots });
    },
    clearSlots: () => set({ slots: get().slots.map(() => null) }),
    setPlaying: (playing) => set({ playing }),
    resetParams: () => set({ params: defaultParams(getTemplate(get().templateId)) }),
    resetSpace: () => {
      const defaults = defaultParams(getTemplate(get().templateId));
      set({
        params: {
          ...get().params,
          spacePerspective: defaults.spacePerspective ?? 0,
          spaceOrbit: defaults.spaceOrbit ?? 0,
          spaceTilt: defaults.spaceTilt ?? 0,
          spaceDistance: defaults.spaceDistance ?? 100,
          spaceDepth: defaults.spaceDepth ?? 100,
        },
      });
    },
    setOverlay: (partial) => set({ overlay: { ...get().overlay, ...partial } }),
    setTextPreset: (id) => set({ overlay: { ...get().overlay, preset: id } }),
  };
});
