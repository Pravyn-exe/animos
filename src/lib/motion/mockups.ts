const COLORS = ["#7c5cbf", "#e07a5f", "#3d8b6e", "#3f6ff8", "#e94560", "#d4a017", "#94a3b8", "#f5f5f7"];
const NAMES = ["Orbit", "Ember", "Mint", "Halo", "Dusk", "Gold", "Slate", "Mono"];

let cache: HTMLCanvasElement[] | null = null;

export function getMockupCanvases(size = 720): HTMLCanvasElement[] {
  if (typeof document === "undefined") return [];
  if (cache) return cache;
  cache = COLORS.map((color, i) => {
    const c = document.createElement("canvas");
    c.width = size;
    c.height = Math.round(size * 1.25);
    const ctx = c.getContext("2d");
    if (!ctx) return c;
    ctx.fillStyle = "#121214";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = color;
    const x = size * 0.08;
    const y = size * 0.08;
    const w = size * 0.84;
    const h = size * 1.09;
    const r = 28;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = i === 7 ? "#111" : "#fff";
    ctx.font = `700 ${Math.round(size * 0.09)}px Geist, Inter, system-ui`;
    ctx.fillText(NAMES[i], size * 0.16, size * 0.32);
    ctx.font = `500 ${Math.round(size * 0.035)}px Inter, system-ui`;
    ctx.globalAlpha = 0.8;
    ctx.fillText("Shot " + (i + 1), size * 0.16, size * 0.4);
    ctx.globalAlpha = 1;
    return c;
  });
  return cache;
}

export function getMockupDataUrls(): string[] {
  return getMockupCanvases().map((c) => c.toDataURL("image/jpeg", 0.86));
}
