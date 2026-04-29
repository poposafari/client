import i18next from 'i18next';
import { ApiError, ErrorCode } from '@poposafari/types';
import type { GameScene } from '@poposafari/scenes';

export function resolveErrorMessage(e: unknown, fallbackKey?: string): string {
  if (e instanceof ApiError) {
    const key = `error:${e.code}`;
    if (i18next.exists(key)) return i18next.t(key);
    if (e.message) return e.message;
  } else if (e instanceof Error && e.message) {
    return e.message;
  }

  if (fallbackKey && i18next.exists(fallbackKey)) {
    return i18next.t(fallbackKey);
  }
  return i18next.t(`error:${ErrorCode.INTERNAL_SERVER_ERROR}`);
}

export async function showApiErrorAsTalk(
  scene: GameScene,
  e: unknown,
  fallbackKey?: string,
): Promise<void> {
  const msg = resolveErrorMessage(e, fallbackKey);
  await scene.getMessage('talk').showMessage(msg);
}
