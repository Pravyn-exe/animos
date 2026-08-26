import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/templates", label: "Templates" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#why", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
];

export function SiteHeader({ dark = true }: { dark?: boolean }) {
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-6">
        <Link to="/" aria-label="animos home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) =>
            l.href.startsWith("/#") ? (
              <a
                key={l.href}
                href={l.href}
                className={cn("text-sm text-ink-2 transition-colors hover:text-ink", !dark && "text-ink-3")}
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                to={l.href}
                className={cn("text-sm text-ink-2 transition-colors hover:text-ink", !dark && "text-ink-3")}
              >
                {l.label}
              </Link>
            ),
          )}
        </nav>
        <Button asChild size="sm">
          <Link to="/editor">Open editor</Link>
        </Button>
      </div>
    </header>
  );
}
