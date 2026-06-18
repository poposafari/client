// @ts-expect-error import.meta.glob is available at Vite build/runtime
const manifest: Record<string, string> = import.meta.glob(
  '/src/assets/**/*.{png,jpg,jpeg,webp,json,atlas,ogg,mp3,wav,ttf,woff,woff2}',
  { eager: true, query: '?url', import: 'default' },
);

export function assetUrl(relPath: string): string {
  const key = `/src/assets/${relPath}`;
  const url = manifest[key];
  if (!url) {
    throw new Error(`[assetUrl] not found: ${relPath}`);
  }
  return url;
}

export function assetUrlSafe(relPath: string): string | null {
  return manifest[`/src/assets/${relPath}`] ?? null;
}
