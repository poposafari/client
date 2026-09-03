import type { GameScene } from '@poposafari/scenes/game.scene';
import { OptionKey } from '@poposafari/types';

const BATTLE_SPEED_FACTORS = [1, 2, 3] as const;

let battleSpeed = 1;
let battleBgmSpeed = 1;

export function refreshBattleSpeed(scene: GameScene): number {
  const option = scene.getOption();
  const idx = Number(option.getOption(OptionKey.BATTLE_SPEED) ?? 0);
  battleSpeed = BATTLE_SPEED_FACTORS[idx] ?? 1;
  const bgmApplies = Number(option.getOption(OptionKey.BATTLE_BGM_SPEED) ?? 0) === 0;
  battleBgmSpeed = bgmApplies ? battleSpeed : 1;
  return battleSpeed;
}

export function getBattleSpeed(): number {
  return battleSpeed;
}

export function getBattleBgmSpeed(): number {
  return battleBgmSpeed;
}

export function scaled(ms: number): number {
  return ms / battleSpeed;
}

export function tweenAsync(
  scene: Phaser.Scene,
  config: Phaser.Types.Tweens.TweenBuilderConfig,
): Promise<void> {
  const duration = config.duration != null ? scaled(config.duration as number) : config.duration;
  const delay = config.delay != null ? scaled(config.delay as number) : config.delay;
  return new Promise((resolve) => {
    scene.tweens.add({ ...config, duration, delay, onComplete: () => resolve() });
  });
}

export function delay(scene: Phaser.Scene, ms: number): Promise<void> {
  return new Promise((resolve) => scene.time.delayedCall(scaled(ms), () => resolve()));
}
