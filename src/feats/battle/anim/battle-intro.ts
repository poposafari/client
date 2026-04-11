import type { GameScene } from '@poposafari/scenes/game.scene';
import { DEPTH, EASE } from '@poposafari/types';
import type { BattleBaseUi } from '../ui/battle-base.ui';
import type { BattleSpriteUi } from '../ui/battle-sprite.ui';
import type { BattleInfoUi } from '../ui/battle-info.ui';
import { INTRO_SLIDE, PLAYER_HUD, WILD_HUD, WILD_SHADOW } from '../battle.constants';
import { pokemonCryNames } from '@poposafari/core/master.data.ts';

/** Phaser tween 을 Promise 로 감싼 헬퍼. */
function tweenAsync(
  scene: Phaser.Scene,
  config: Phaser.Types.Tweens.TweenBuilderConfig,
): Promise<void> {
  return new Promise((resolve) => {
    scene.tweens.add({ ...config, onComplete: () => resolve() });
  });
}

function delay(scene: Phaser.Scene, ms: number): Promise<void> {
  return new Promise((resolve) => scene.time.delayedCall(ms, () => resolve()));
}

export async function displayBattleIntro(
  scene: GameScene,
  base: BattleBaseUi,
  sprite: BattleSpriteUi,
  info: BattleInfoUi,
  isShiny: boolean,
  pokedexId: string,
): Promise<void> {
  const { width, height } = scene.cameras.main;

  // 1. 검정 오버레이 — wipe 직후의 검정 화면을 유지한 채 내부 컨테이너를 띄운다.
  const blackOverlay = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x000000, 1)
    .setScrollFactor(0)
    .setDepth(DEPTH.HUD + 50);

  base.show();
  sprite.show();
  info.show();

  const playerC = sprite.getPlayerContainer();
  const wildC = sprite.getWildContainer();
  const wildSprite = sprite.getWildSprite();
  const wildShadow = sprite.getWildShadow();
  wildShadow.setVisible(false);

  // 플레이어 컨테이너는 최종 위치. (인트로 동안 슬라이드 없음)
  playerC.x = INTRO_SLIDE.playerToX;

  // 야생 컨테이너는 최종 위치. 내부 sprite 만 왼→오 슬라이드.
  wildC.x = INTRO_SLIDE.wildToX;
  const wildSpriteFromX = INTRO_SLIDE.wildFromX - INTRO_SLIDE.wildToX;
  const wildSpriteToX = wildSprite.x;
  wildSprite.x = wildSpriteFromX;
  wildSprite.setTint(0x000000);

  // HUD 초기 위치: wild=fromX, player=fromX (오프스크린 유지, idle 프롬프트 시점에 슬라이드)
  const wildHud = info.getWildHudContainer();
  const playerHud = info.getPlayerHudContainer();
  wildHud.x = WILD_HUD.fromX;
  playerHud.x = PLAYER_HUD.fromX;

  // 2. 오버레이 페이드아웃 + 야생 sprite 슬라이드/틴트 복구 (동시)
  const tintProxy = { v: 0 };
  const fadeOverlay = tweenAsync(scene, {
    targets: blackOverlay,
    alpha: 0,
    duration: INTRO_SLIDE.blackoverlayMs,
  });
  const slideWildSprite = tweenAsync(scene, {
    targets: wildSprite,
    x: wildSpriteToX,
    duration: INTRO_SLIDE.durationMs,
    ease: EASE.QUAD_EASEOUT,
  });
  const recolorWild = tweenAsync(scene, {
    targets: tintProxy,
    v: 1,
    duration: INTRO_SLIDE.durationMs,
    onUpdate: () => {
      const c = Math.max(0, Math.min(255, Math.floor(tintProxy.v * 255)));
      const color = (c << 16) | (c << 8) | c;
      wildSprite.setTint(color);
    },
  });

  await Promise.all([fadeOverlay, slideWildSprite, recolorWild]);
  wildSprite.clearTint();
  blackOverlay.destroy();

  wildShadow.setAlpha(0).setVisible(true);
  await tweenAsync(scene, {
    targets: wildShadow,
    alpha: WILD_SHADOW.alpha,
    duration: 400,
    ease: EASE.LINEAR,
  });

  const cryKey = pokemonCryNames.includes(pokedexId) ? pokedexId : pokedexId.split('_')[0];
  scene.getAudio().playEffect(cryKey);

  // 3. wildHud 슬라이드인 (playerHud 는 아직 오프스크린)
  await tweenAsync(scene, {
    targets: wildHud,
    x: WILD_HUD.toX,
    duration: WILD_HUD.durationMs,
    ease: Phaser.Math.Easing.Quadratic.Out,
  });

  // 4. 이로치 이펙트
  if (isShiny) {
    const { playShinySparkle } = await import('./shiny');
    await playShinySparkle(scene, wildSprite);
  }
}
