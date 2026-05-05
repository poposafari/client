export const DEBUG = false;

export function debugLog(...args: unknown[]): void {
  if (DEBUG) {
    console.log(...args);
  }
}
