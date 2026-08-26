import {
  cardSize,
  contentBox,
  dirSign,
  drawCard,
  imageAt,
  mixCommon,
  paintBackground,
} from "./draw";
import { clamp, easeInOutCubic, fract, lerp, wrap } from "./easing";
import { CATEGORY_ORDER, type MotionTemplate, type RenderContext } from "./types";

function base(
  partial: Omit<MotionTemplate, "params" | "thumb"> & {
    extra?: MotionTemplate["params"];
    thumb?: MotionTemplate["thumb"];
  },
): MotionTemplate {
  return {
    thumb: "cover",
    ...partial,
    params: [
      ...mixCommon(),
      ...(partial.extra ?? []),
      {
        type: "select",
        id: "direction",
        label: "Direction",
        default: "left",
        group: "motion",
        options: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ],
      },
    ],
  };
}

function items(rc: RenderContext) {
  return Math.max(rc.images.length, 6);
}

function flow(rc: RenderContext) {
  paintBackground(rc);
  const box = contentBox(rc);
  const n = items(rc);
  const { w: cw, h: ch } = cardSize(box, 0.7, 3 / 4);
  const dir = dirSign(rc.params);
  const t = rc.t * n;
  for (let i = 0; i < n; i++) {
    const local = wrap(t - i, n) - n / 2;
    const x = rc.width / 2 + local * cw * 1.12 * dir - cw / 2;
    const y = (rc.height - ch) / 2;
    drawCard(rc.ctx, imageAt(rc.images, i), x, y, cw, ch, {
      radius: box.radius,
      shadow: box.shadow,
      scale: lerp(1.08, 0.82, clamp(Math.abs(local), 0, 1.6) / 1.6),
      opacity: lerp(1, 0.5, clamp(Math.abs(local) / 2.2, 0, 1)),
    });
  }
}

function orbit(rc: RenderContext) {
  paintBackground(rc);
  const box = contentBox(rc);
  const n = items(rc);
  const { w: cw, h: ch } = cardSize(box, 0.42, 3 / 4);
  const t = rc.t * Math.PI * 2;
  const dir = dirSign(rc.params);
  for (let i = 0; i < n; i++) {
    const a = t + (i / n) * Math.PI * 2 * dir;
    const depth = (Math.sin(a) + 1) / 2;
    const x = rc.width / 2 + Math.cos(a) * box.w * 0.32 - cw / 2;
    const y = rc.height / 2 + Math.sin(a) * box.h * 0.08 - ch / 2;
    drawCard(rc.ctx, imageAt(rc.images, i), x, y, cw, ch, {
      radius: box.radius,
      shadow: box.shadow * depth,
      scale: lerp(0.7, 1.15, depth),
      opacity: lerp(0.55, 1, depth),
    });
  }
}

function stage(rc: RenderContext) {
  paintBackground(rc);
  const box = contentBox(rc);
  const n = items(rc);
  const hold = 1 / n;
  const raw = wrap(rc.t, 1);
  const i = Math.floor(raw / hold);
  const local = (raw - i * hold) / hold;
  const fade =
    local < 0.14
      ? easeInOutCubic(local / 0.14)
      : local > 0.86
        ? 1 - easeInOutCubic((local - 0.86) / 0.14)
        : 1;
  const { w: cw, h: ch } = cardSize(box, 0.78, 3 / 4);
  drawCard(rc.ctx, imageAt(rc.images, i), (rc.width - cw) / 2, box.y + box.h * 0.04, cw, ch, {
    radius: box.radius,
    shadow: box.shadow,
    scale: lerp(0.94, 1, fade),
    opacity: fade,
  });
}

function grid(rc: RenderContext) {
  paintBackground(rc);
  const box = contentBox(rc);
  const cols = 3;
  const rows = 3;
  const gap = 10;
  const cw = (box.w - gap * (cols - 1)) / cols;
  const ch = (box.h - gap * (rows - 1)) / rows;
  for (let i = 0; i < cols * rows; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const pop = 0.5 + 0.5 * Math.sin(rc.t * Math.PI * 2 + i * 0.7);
    drawCard(rc.ctx, imageAt(rc.images, i), box.x + c * (cw + gap), box.y + r * (ch + gap), cw, ch, {
      radius: box.radius * 0.6,
      shadow: 0.25,
      scale: lerp(0.92, 1, pop),
      opacity: lerp(0.7, 1, pop),
    });
  }
}

function columns(rc: RenderContext) {
  paintBackground(rc);
  const box = contentBox(rc);
  const cols = 3;
  const cw = box.w / cols - 8;
  const ch = cw * 1.25;
  const dir = dirSign(rc.params);
  for (let c = 0; c < cols; c++) {
    const sign = c === 1 ? -1 : 1;
    const t = wrap(rc.t * sign * dir, 1);
    for (let k = -1; k < 5; k++) {
      const y = box.y + (k - t) * (ch + 12);
      drawCard(rc.ctx, imageAt(rc.images, c * 4 + k + 2), box.x + c * (cw + 12), y, cw, ch, {
        radius: box.radius * 0.7,
        shadow: 0.3,
      });
    }
  }
}

function burst(rc: RenderContext) {
  paintBackground(rc);
  const box = contentBox(rc);
  const n = items(rc);
  const { w: cw, h: ch } = cardSize(box, 0.72, 3 / 4);
  const t = wrap(rc.t * n, n);
  const i = Math.floor(t);
  const local = fract(t);
  drawCard(rc.ctx, imageAt(rc.images, i), (rc.width - cw) / 2, (rc.height - ch) / 2, cw, ch, {
    radius: box.radius,
    shadow: box.shadow,
    scale: lerp(0.4, 1, easeInOutCubic(local)),
    opacity: lerp(0.3, 1, local),
    rotate: (1 - local) * 0.15,
  });
}

function zoom(rc: RenderContext) {
  paintBackground(rc);
  const box = contentBox(rc);
  const n = items(rc);
  const raw = wrap(rc.t * n, n);
  const i = Math.floor(raw);
  const local = fract(raw);
  const { w: cw, h: ch } = cardSize(box, 0.9, 9 / 16);
  drawCard(rc.ctx, imageAt(rc.images, i), (rc.width - cw) / 2, (rc.height - ch) / 2, cw, ch, {
    radius: 8,
    shadow: 0.4,
    scale: lerp(1, 1.18, easeInOutCubic(local)),
    opacity: local < 0.1 ? local / 0.1 : local > 0.9 ? (1 - local) / 0.1 : 1,
  });
}

function stack(rc: RenderContext) {
  paintBackground(rc);
  const box = contentBox(rc);
  const n = items(rc);
  const { w: cw, h: ch } = cardSize(box, 0.7, 3 / 4);
  const t = rc.t * n;
  for (let i = 0; i < n; i++) {
    const local = wrap(t - i, n);
    const z = 1 - clamp(local / n, 0, 1);
    drawCard(
      rc.ctx,
      imageAt(rc.images, i),
      (rc.width - cw) / 2 + (local - 1) * 18,
      (rc.height - ch) / 2 + (local - 1) * 10,
      cw,
      ch,
      { radius: box.radius, shadow: box.shadow * z, scale: lerp(0.86, 1, z), opacity: lerp(0.4, 1, z) },
    );
  }
}

const catalog: Array<Parameters<typeof base>[0] & { render: MotionTemplate["render"] }> = [
  { id: "carousel-flow", name: "Carousel Flow", description: "Cards drift across the frame.", category: "Carousel & Flow", thumb: "row", defaultDuration: 8, render: flow },
  { id: "cover-flow", name: "Cover Flow", description: "Center card flat, neighbours recede.", category: "Carousel & Flow", thumb: "cover", defaultDuration: 8, isNew: true, render: flow },
  { id: "ticker-loop", name: "Ticker Loop", description: "Two rows of cards sliding opposite ways.", category: "Carousel & Flow", thumb: "row", defaultDuration: 8, render: flow },
  { id: "wheel-carousel", name: "Wheel Carousel", description: "Cards on a giant wheel.", category: "Carousel & Flow", thumb: "wheel", defaultDuration: 8, render: orbit },
  { id: "orbit-carousel", name: "Orbit Carousel", description: "Designs orbit in depth, front card in focus.", category: "Orbit", thumb: "orbit", defaultDuration: 8, render: orbit },
  { id: "orbit-showcase", name: "Orbit Showcase", description: "Flat cards orbit with perspective scaling.", category: "Orbit", thumb: "orbit", defaultDuration: 8, isNew: true, render: orbit },
  { id: "center-stage", name: "Center Stage", description: "One hero card at a time.", category: "Spotlight & Focus", thumb: "hero", defaultDuration: 8, render: stage },
  { id: "focus-slider", name: "Focus Slider", description: "The active card takes the stage.", category: "Spotlight & Focus", thumb: "hero", defaultDuration: 8, render: stage },
  { id: "poster-burst", name: "Poster Burst", description: "Images burst from the center.", category: "Stack & Scatter", thumb: "bloom", defaultDuration: 6, render: burst },
  { id: "depth-stack", name: "Depth Stack", description: "Fly through a receding stack.", category: "3D & Perspective", thumb: "stack", defaultDuration: 8, render: stack },
  { id: "spiral-stream", name: "Spiral Stream", description: "Cards wind down a 3D spiral.", category: "3D & Perspective", thumb: "spiral", defaultDuration: 10, render: orbit },
  { id: "zoom-parallax", name: "Zoom Parallax", description: "Slow Ken Burns with crossfades.", category: "Reveal & Wipe", thumb: "zoom", defaultDuration: 10, render: zoom },
  { id: "grid-reveal", name: "Grid Reveal", description: "A grid of tiles assembling.", category: "Grid", thumb: "grid", defaultDuration: 6, render: grid },
  { id: "pop-grid", name: "Pop Grid", description: "Tiles pop in and out.", category: "Grid", thumb: "grid", defaultDuration: 8, render: grid },
  { id: "column-drift", name: "Column Drift", description: "Three columns drifting in counter-flow.", category: "Grid", thumb: "grid", defaultDuration: 10, render: columns },
  { id: "hook-zoom", name: "Hook Zoom", description: "Hard zoom on the hook frame.", category: "Reels", thumb: "zoom", defaultDuration: 5, isNew: true, render: zoom },
  { id: "beat-cut", name: "Beat Cut", description: "Snappy cuts on the beat.", category: "Reels", thumb: "flash", defaultDuration: 5, isNew: true, render: burst },
  { id: "whip-pan", name: "Whip Pan", description: "A fast pan between shots.", category: "Reels", thumb: "row", defaultDuration: 5, isNew: true, render: flow },
  { id: "caption-stack", name: "Caption Stack", description: "Stacked frames for caption reels.", category: "Reels", thumb: "caption", defaultDuration: 6, isNew: true, render: stack },
  { id: "shake-cut", name: "Shake Cut", description: "Impact shake between clips.", category: "Reels", thumb: "flash", defaultDuration: 5, render: burst },
  { id: "before-after", name: "Before / After", description: "A wipe between two states.", category: "Reels", thumb: "split", defaultDuration: 6, render: stage },
  { id: "text-punch", name: "Text Punch", description: "Big type slam over motion.", category: "Reels", thumb: "caption", defaultDuration: 5, isNew: true, render: zoom },
  { id: "jump-recap", name: "Jump Recap", description: "Jump cuts through a recap.", category: "Reels", thumb: "flash", defaultDuration: 6, render: burst },
];

export const TEMPLATES: MotionTemplate[] = catalog.map((t) => base(t));
export const CATEGORIES = CATEGORY_ORDER.filter((c) => TEMPLATES.some((t) => t.category === c));
export function getTemplate(id: string) {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
