export const LEVEL_CURVE = {
  USER_LEVEL_MAX: 100,

  expToNext(level: number): number {
    return level * level;
  },

  isMaxLevel(level: number): boolean {
    return level >= LEVEL_CURVE.USER_LEVEL_MAX;
  },
};
