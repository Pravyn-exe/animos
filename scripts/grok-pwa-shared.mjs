/** Minimal PWA helpers so Vite can boot locally on Windows. */
export const DEFAULT_APP_NAME = "animos";
export const OG_SERVICE_URL_DEFAULT = "https://og.grok.me";
export const OG_SITE_REL_PATH = "src/lib/og/site.json";
export const GROK_EXTENSIONS_SCRIPT_SRC = "https://grok.com/grok-app-builder/extensions.js";
export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
export function appNameFromHost() { return DEFAULT_APP_NAME; }
export function publicAppHost() { return ""; }
export function resolvePublicHost() { return ""; }
export function isInstallQuery() { return false; }
export function isDocumentPath(pathname) {
  const path = String(pathname ?? "");
  return !path.startsWith("/__grok/") && !path.startsWith("/api/") && !/\.[a-z0-9]+$/i.test(path);
}
export function acceptsHtml(accept) {
  const value = String(accept ?? "");
  return value === "" || value.includes("text/html") || value.includes("*/*");
}
export function stripInstallParams(url) { return String(url ?? "/"); }
export function renderInstallPageHtml(template) { return String(template); }
export function renderWebManifest() {
  return JSON.stringify({
    name: DEFAULT_APP_NAME,
    short_name: DEFAULT_APP_NAME,
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  });
}
export function grokPwaHeadTags() { return []; }
export function readGrokProjectId() { return ""; }
export function readXCreator() { return ""; }
export function readXCreatorId() { return ""; }
export function grokXCreatorHeadTags() { return []; }
export function grokExtensionsHeadTags() { return []; }
export function readOgSite() { return {}; }
export function ogCardPublicPath() { return ""; }
export function snapshotOgIdentity() { return { site: {} }; }
export function customOgAssetPath() { return "/og.jpg"; }
export function resolveOgCardAsset() { return ""; }
export function ogServiceUrl() { return OG_SERVICE_URL_DEFAULT; }
export function titleFromDocument() { return ""; }
export function resolveOgTitle() { return DEFAULT_APP_NAME; }
export function siteHasCustomCard() { return false; }
export function grokOgHeadTags() { return []; }
export function stripShareMetaTags(html) { return html; }
export function normalizeHeadContext(ctx = {}) {
  return {
    appName: DEFAULT_APP_NAME,
    projectId: "",
    creator: "",
    creatorId: "",
    host: ctx.host ?? "",
    cwd: ctx.cwd ?? "",
    site: {},
  };
}
export function injectGrokPwaHead(html) { return html; }
export function createHeadInjector() {
  return {
    push(chunk) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      return [buf];
    },
    flush() { return []; },
  };
}
