import { DIRECTION } from './overworld.constants';

export function getDirName(direction: DIRECTION): string {
  return direction === DIRECTION.UP
    ? 'up'
    : direction === DIRECTION.DOWN
      ? 'down'
      : direction === DIRECTION.LEFT
        ? 'left'
        : 'right';
}

export function getWalkAnimationKey(
  textureKey: string,
  direction: DIRECTION,
  animStep: number,
): string {
  const stepIndex = animStep % 2;
  return `${textureKey}_walk_${getDirName(direction)}_${stepIndex}`;
}

export function getRunningAnimationKey(
  textureKey: string,
  direction: DIRECTION,
  animStep: number,
): string {
  const stepIndex = animStep % 3;
  return `${textureKey}_running_${getDirName(direction)}_${stepIndex}`;
}

export function getRideAnimationKey(
  textureKey: string,
  direction: DIRECTION,
  animStep: number,
): string {
  const stepIndex = animStep % 5;
  return `${textureKey}_ride_${getDirName(direction)}_${stepIndex}`;
}

export function getSurfAnimationKey(
  textureKey: string,
  direction: DIRECTION,
  animStep: number,
): string {
  const stepIndex = animStep % 2;
  return `${textureKey}_surf_${getDirName(direction)}_${stepIndex}`;
}
