import { cn } from "@/lib/utils";
import type { ThumbKind } from "@/lib/motion/types";

function Rect({ x, y, w, h, o = 0.55 }: { x: number; y: number; w: number; h: number; o?: number }) {
  return <rect x={x} y={y} width={w} height={h} rx="3" fill={`rgba(210,210,214,${o})`} />;
}

function Glyph({ kind }: { kind: ThumbKind }) {
  switch (kind) {
    case "orbit":
      return (<><Rect x={14} y={36} w={16} h={20} o={0.3} /><Rect x={32} y={22} w={18} h={22} o={0.5} /><Rect x={52} y={30} w={22} h={28} o={0.8} /><Rect x={74} y={18} w={16} h={20} o={0.45} /></>);
    case "grid":
      return <>{[0, 1, 2].map((r) => [0, 1, 2].map((c) => <Rect key={`${r}${c}`} x={22 + c * 20} y={18 + r * 20} w={16} h={16} o={0.35 + ((r + c) % 3) * 0.15} />))}</>;
    case "stack":
      return (<><Rect x={30} y={18} w={40} h={28} o={0.3} /><Rect x={34} y={28} w={40} h={28} o={0.5} /><Rect x={38} y={40} w={40} h={28} o={0.75} /></>);
    case "cover":
      return (<><Rect x={14} y={28} w={22} h={32} o={0.3} /><Rect x={34} y={20} w={32} h={44} o={0.75} /><Rect x={64} y={28} w={22} h={32} o={0.3} /></>);
    case "row":
      return (<><Rect x={12} y={30} w={22} h={28} o={0.35} /><Rect x={38} y={26} w={24} h={32} o={0.75} /><Rect x={66} y={30} w={22} h={28} o={0.35} /></>);
    case "hero":
      return (<><Rect x={16} y={16} w={68} h={40} o={0.55} /><Rect x={22} y={62} w={10} h={12} o={0.3} /><Rect x={36} y={62} w={10} h={12} o={0.7} /><Rect x={50} y={62} w={10} h={12} o={0.3} /><Rect x={64} y={62} w={10} h={12} o={0.3} /></>);
    case "spiral":
      return (<><Rect x={46} y={10} w={14} h={16} o={0.3} /><Rect x={58} y={24} w={16} h={18} o={0.45} /><Rect x={44} y={38} w={18} h={22} o={0.7} /><Rect x={28} y={54} w={14} h={16} o={0.4} /></>);
    case "wheel":
      return (<><Rect x={42} y={8} w={16} h={18} o={0.5} /><Rect x={68} y={28} w={16} h={18} o={0.55} /><Rect x={58} y={56} w={16} h={18} o={0.4} /><Rect x={26} y={56} w={16} h={18} o={0.4} /><Rect x={16} y={28} w={16} h={18} o={0.55} /></>);
    case "zoom":
      return (<><Rect x={22} y={18} w={56} h={48} o={0.35} /><Rect x={34} y={28} w={32} h={28} o={0.75} /></>);
    case "bloom":
      return (<><Rect x={42} y={12} w={16} h={20} o={0.5} /><Rect x={64} y={28} w={16} h={20} o={0.55} /><Rect x={54} y={52} w={16} h={20} o={0.45} /><Rect x={30} y={52} w={16} h={20} o={0.45} /><Rect x={20} y={28} w={16} h={20} o={0.55} /></>);
    case "flash":
      return (<><Rect x={18} y={20} w={28} h={44} o={0.35} /><Rect x={54} y={20} w={28} h={44} o={0.7} /></>);
    case "caption":
      return (<><Rect x={16} y={14} w={68} h={44} o={0.4} /><Rect x={22} y={64} w={56} h={10} o={0.75} /></>);
    case "split":
      return (<><Rect x={16} y={16} w={68} h={26} o={0.45} /><Rect x={16} y={46} w={68} h={26} o={0.7} /></>);
    default:
      return <Rect x={28} y={22} w={44} h={44} o={0.5} />;
  }
}

export function TemplateThumb({ kind, active, isNew, className }: { kind: ThumbKind; active?: boolean; isNew?: boolean; className?: string }) {
  return (
    <div className={cn("relative aspect-square overflow-hidden rounded-lg bg-surface-2", active && "ring-2 ring-accent", className)}>
      <svg viewBox="0 0 100 88" className="size-full" aria-hidden="true">
        <rect width="100" height="88" fill="#121214" />
        <Glyph kind={kind} />
      </svg>
      {isNew && <span className="absolute top-1.5 right-1.5 rounded-full bg-accent px-1.5 py-px text-[9px] font-semibold text-ink">NEW</span>}
    </div>
  );
}
