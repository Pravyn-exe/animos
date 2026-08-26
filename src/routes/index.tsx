import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { MotionCanvas } from "@/components/motion-canvas";
import { TemplateThumb } from "@/components/template-thumb";
import { TEMPLATES } from "@/lib/motion/templates";
import { defaultParams } from "@/lib/motion/types";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const hero = TEMPLATES.find((t) => t.id === "orbit-carousel") ?? TEMPLATES[0];
  const reels = TEMPLATES.filter((t) => t.category === "Reels").slice(0, 8);
  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="flex h-14 items-center justify-between px-6">
        <Logo />
        <nav className="flex items-center gap-4 text-sm text-ink-2">
          <Link to="/templates" className="hover:text-ink">
            Templates
          </Link>
          <Button asChild size="sm" variant="accent">
            <Link to="/editor">Open editor</Link>
          </Button>
        </nav>
      </header>
      <section className="mx-auto max-w-[860px] px-6 py-20 text-center">
        <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] leading-[1.05] font-medium tracking-tight">
          Showcase your designs in motion.
        </h1>
        <p className="mx-auto mt-4 max-w-[520px] text-lg text-ink-2">
          Pick a template, drop in photos, tweak speed and 3D, export MP4 or WebP.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link to="/editor">Try it Free</Link>
          </Button>
        </div>
        <div className="mt-12">
          <MotionCanvas
            templateId={hero.id}
            params={defaultParams(hero)}
            ratio="16:9"
            duration={hero.defaultDuration}
            className="rounded-2xl"
          />
        </div>
      </section>
      <section className="mx-auto max-w-[1100px] px-6 pb-20">
        <h2 className="mb-6 font-display text-2xl">Reels templates</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {reels.map((t) => (
            <Link key={t.id} to="/editor" search={{ template: t.id }} className="rounded-2xl bg-surface p-2">
              <TemplateThumb kind={t.thumb} isNew={t.isNew} />
              <div className="px-1.5 pt-2 text-[13px] font-medium">{t.name}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
