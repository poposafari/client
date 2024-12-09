export function createZeroPad(value: number): string {
  return value.toString().padStart(3, '0');
}
