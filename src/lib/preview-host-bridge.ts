/** Local-run stub. The Grok preview bridge is a no-op outside an embed. */
export function collectRoutePathsFromTree(_tree?: unknown): string[] {
  return ["/", "/templates", "/editor"];
}

export function installPreviewHostBridge(_options?: {
  navigate?: (path: string) => void;
  getRoutePaths?: () => string[];
}): () => void {
  return () => {};
}
