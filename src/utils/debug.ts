export const DEBUG = true;

export function debugLog(...args: unknown[]): void {
  if (DEBUG) {
    console.log(...args);
  }
}
