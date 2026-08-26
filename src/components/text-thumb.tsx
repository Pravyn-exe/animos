import { cn } from "@/lib/utils";
import type { TextPresetId } from "@/lib/motion/text";

export function TextThumb({
  id,
  active,
  isNew,
  className,
}: {
  id: TextPresetId;
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
      <div className="flex size-full items-center justify-center bg-[#121214] text-[12px] font-semibold text-ink-1">
        {id === "none" ? "—" : "Aa"}
      </div>
      {isNew && (
        <span className="absolute top-1.5 right-1.5 rounded-full bg-accent px-1.5 py-px text-[9px] font-semibold text-ink">
          NEW
        </span>
      )}
    </div>
  );
}
