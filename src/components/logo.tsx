import { cn } from "@/lib/utils";

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display text-[17px] font-medium tracking-tight text-ink", className)}>
      <svg
        viewBox="0 0 28 28"
        className={cn("size-[22px]", markClassName)}
        aria-hidden="true"
      >
        <rect x="3" y="6" width="16" height="16" rx="5" fill="currentColor" opacity="0.35" />
        <rect x="9" y="4" width="16" height="16" rx="5" fill="currentColor" />
      </svg>
      animos
    </span>
  );
}
