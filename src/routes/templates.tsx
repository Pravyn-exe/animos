import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { TemplateThumb } from "@/components/template-thumb";
import { CATEGORIES, TEMPLATES } from "@/lib/motion/templates";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/templates")({ component: TemplatesPage });

function TemplatesPage() {
  const [cat, setCat] = useState<string>("All");
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    return TEMPLATES.filter((t) => {
      if (cat !== "All" && t.category !== cat) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return t.name.toLowerCase().includes(s) || t.description.toLowerCase().includes(s);
    });
  }, [cat, q]);

  const reels = TEMPLATES.filter((t) => t.category === "Reels");

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5">
          <Link to="/">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-ink-2 md:flex">
            <Link to="/" className="hover:text-ink">
              Home
            </Link>
            <Link to="/templates" className="text-ink">
              Templates
            </Link>
          </nav>
          <Button asChild size="sm" variant="accent">
            <Link to="/editor">Open editor</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-[1200px] px-5 pt-12 pb-8">
        <p className="font-mono text-[11px] tracking-[0.18em] text-ink-4 uppercase">Library</p>
        <h1 className="mt-2 font-display text-[clamp(1.8rem,4vw,3rem)] font-medium tracking-tight">
          {TEMPLATES.length} motion templates
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-2">
          Showcase loops for portfolios — plus a Reels set built for trending vertical edits: hook zooms, beat
          cuts, whip pans, captions, shake cuts, and before/after wipes. Every template opens in the editor.
        </p>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 pb-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-medium">Trending reels</h2>
            <p className="mt-1 text-sm text-ink-3">9:16 motion for TikTok, Reels, and Shorts.</p>
          </div>
          <button onClick={() => setCat("Reels")} className="text-sm text-ink-3 hover:text-ink">
            View all
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {reels.map((t) => (
            <TemplateCard key={t.id} id={t.id} name={t.name} description={t.description} kind={t.thumb} isNew={t.isNew} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 pb-20">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {["All", ...CATEGORIES].map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "h-8 shrink-0 rounded-full px-3 text-[12px]",
                  cat === c ? "bg-ink text-bg" : "bg-surface-2 text-ink-2",
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search templates"
            className="h-9 w-full rounded-full bg-surface-2 px-4 text-sm text-ink outline-none sm:w-56"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((t) => (
            <TemplateCard key={t.id} id={t.id} name={t.name} description={t.description} kind={t.thumb} isNew={t.isNew} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="py-16 text-center text-sm text-ink-3">No templates match that search.</p>
        )}
      </section>
    </div>
  );
}

function TemplateCard({
  id,
  name,
  description,
  kind,
  isNew,
}: {
  id: string;
  name: string;
  description: string;
  kind: (typeof TEMPLATES)[number]["thumb"];
  isNew?: boolean;
}) {
  return (
    <Link
      to="/editor"
      search={{ template: id }}
      className="group block rounded-2xl bg-surface p-2 transition-colors hover:bg-surface-2"
    >
      <TemplateThumb kind={kind} isNew={isNew} className="rounded-xl" />
      <div className="px-1.5 pt-2 pb-1">
        <div className="truncate text-[13px] font-medium text-ink">{name}</div>
        <div className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-ink-3">{description}</div>
      </div>
    </Link>
  );
}
