export const LEVEL_CURVE = {
  USER_LEVEL_MAX: 50,

  expToNext(level: number): number {
    return Math.floor(50 * level * level);
  },

  isMaxLevel(level: number): boolean {
    return level >= LEVEL_CURVE.USER_LEVEL_MAX;
  },
};
