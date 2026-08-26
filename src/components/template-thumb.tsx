import { cn } from "@/lib/utils";
import type { ThumbKind } from "@/lib/motion/types";

export function TemplateThumb({
  kind,
  active,
  isNew,
  className,
}: {
  kind: ThumbKind;
  active?: boolean;
  isNew?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-lg bg-surface-2",
        active && "ring-2 ring-accent",
        className,
      )}
    >
      <div className="flex size-full items-center justify-center bg-[#121214] text-[10px] text-ink-3">
        {kind}
      </div>
      {isNew && (
        <span className="absolute top-1.5 right-1.5 rounded-full bg-accent px-1.5 py-px text-[9px] font-semibold text-ink">
          NEW
        </span>
      )}
    </div>
  );
}
