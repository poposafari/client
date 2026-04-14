import type { GameScene } from '@poposafari/scenes/game.scene';
import { DEPTH, EASE, SFX, TEXTURE } from '@poposafari/types';
import { addImage } from '@poposafari/utils';
import type { BattleSpriteUi } from '../ui/battle-sprite.ui';
import { BALL_ANIM, THROW_ITEM } from '../battle.constants';

const BALL_THROW_ANIM_KEY = 'battle_ball_throw';

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

/** throwItem 을 시작 위치로 리셋하고 숨긴다. */
function resetThrowItem(item: Phaser.GameObjects.Sprite): void {
  item.stop();
  item.setPosition(THROW_ITEM.startX, THROW_ITEM.startY);
  item.setAngle(0).setAlpha(1).setVisible(false);
  item.clearTint();
}

/**
 * 포물선 던지기. start → end (peakHeight 만큼 위로 솟음).
 *
 * Phaser 단일 tween 으로는 포물선이 안 되므로 좌표를 직접 갱신한다.
 * t in [0,1] 동안 y = lerp(startY,endY,t) + 4*peakHeight*t*(1-t).
 */
function throwParabola(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  peakHeight: number,
  duration: number,
): Promise<void> {
  return new Promise((resolve) => {
    const proxy = { t: 0 };
    target.setPosition(startX, startY).setVisible(true);
    scene.tweens.add({
      targets: proxy,
      t: 1,
      duration,
      onUpdate: () => {
        const t = proxy.t;
        target.x = startX + (endX - startX) * t;
        target.y = startY + (endY - startY) * t + 4 * peakHeight * t * (1 - t);
      },
      onComplete: () => resolve(),
    });
  });
}

/**
 * 사파리볼 던지기 풀 시퀀스: ready → throw → enter → drop → shake.
 *
 * 결과(catch/fail)는 Step 4 에서 BattlePhase.checking 응답 후 별도로
 * runCatch / runFail 을 호출한다.
 */
export async function playBallThrow(
  scene: GameScene,
  sprite: BattleSpriteUi,
  shakeCount: number = 3,
): Promise<void> {
  const throwItem = sprite.getThrowItem();
  const wild = sprite.getWildSprite();
  const wildShadow = sprite.getWildShadow();

  // 애니메이션 lazy 등록
  if (!scene.anims.exists(BALL_THROW_ANIM_KEY)) {
    const frameNames = scene.textures
      .get(TEXTURE.SAFARI_BALL_THROW)
      .getFrameNames()
      .filter((name) => name !== '__BASE')
      .sort((a, b) => {
        const na = parseInt(a.replace(/\D+/g, ''), 10);
        const nb = parseInt(b.replace(/\D+/g, ''), 10);
        if (Number.isNaN(na) || Number.isNaN(nb)) return a.localeCompare(b);
        return na - nb;
      });
    scene.anims.create({
      key: BALL_THROW_ANIM_KEY,
      frames: frameNames.map((frame) => ({ key: TEXTURE.SAFARI_BALL_THROW, frame })),
      frameRate: 30,
      repeat: -1,
    });
  }

  // 1. ready — SAFARI_BALL_THROW 아뜰라스로 설정하고 애니메이션 재생
  throwItem.setTexture(TEXTURE.SAFARI_BALL_THROW);

  // 2. player_back 던지기 모션 → 포물선 투척
  await sprite.playPlayerBackThrowAnim();
  scene.getAudio().playEffect(SFX.THROW);
  throwItem.setVisible(true);
  throwItem.play(BALL_THROW_ANIM_KEY);

  await throwParabola(
    scene,
    throwItem,
    THROW_ITEM.startX,
    THROW_ITEM.startY,
    THROW_ITEM.endX,
    THROW_ITEM.endY,
    THROW_ITEM.peakHeight,
    THROW_ITEM.durationMs,
  );
  sprite.resetPlayerBackFrame();

  // 3. 도착 후 애니메이션 정지 → 0.5초 동안 첫 프레임 유지
  throwItem.stop();
  throwItem.setFrame(`${TEXTURE.SAFARI_BALL_THROW}-0`);
  scene.getAudio().playEffect(SFX.BALL_DROP);

  // 위에서 아래로 찌그러지는 squash 효과
  const baseScale = throwItem.scaleX;
  await tweenAsync(scene, {
    targets: throwItem,
    scaleX: baseScale * 1.2,
    scaleY: baseScale * 0.9,
    duration: 10,
    // ease: EASE.SINE_EASEOUT,
  });
  await delay(scene, 500);
  // squash 원복

  // 4. SAFARI_BALL_OPEN 으로 텍스처 변경 — 야생 + 그림자가 볼 안으로 빨려 들어감
  throwItem.setTexture(TEXTURE.SAFARI_BALL_OPEN);
  scene.getAudio().playEffect(SFX.BALL_ENTER);

  await tweenAsync(scene, {
    targets: throwItem,
    scaleX: baseScale,
    scaleY: baseScale,
    duration: 120,
    ease: EASE.SINE_EASEOUT,
  });
  // origin (0.5,1)→(0.5,0.5) 전환 시 시각적 위치 보정
  const savedY = wild.y;
  wild.y -= wild.displayHeight / 2;
  wild.setOrigin(0.5, 0.5);
  wild.setTintFill(0xffffff);
  wildShadow.setTintFill(0x000000);

  await Promise.all([
    tweenAsync(scene, {
      targets: wild,
      scale: 0.1,
      alpha: 0,
      duration: BALL_ANIM.enterShrinkMs,
    }),
    tweenAsync(scene, {
      targets: wildShadow,
      scale: 0.1,
      alpha: 0,
      duration: BALL_ANIM.enterShrinkMs,
    }),
  ]);
  wild.clearTint();
  wildShadow.clearTint();
  wild.setOrigin(0.5, 1);
  wild.y = savedY;
  throwItem.setTexture(TEXTURE.SAFARI_BALL_THROW).setFrame(`${TEXTURE.SAFARI_BALL_THROW}-0`);

  await delay(scene, 500);

  // 5. drop — 수동 멀티 바운스 (각 착지마다 효과음)
  const dropTargetY = THROW_ITEM.endY + 130;
  const bounceHeights = [80, 35, 12]; // 각 바운스의 반등 높이 (점점 감소)
  const bounceDurations = [
    BALL_ANIM.dropMs * 0.45,
    BALL_ANIM.dropMs * 0.3,
    BALL_ANIM.dropMs * 0.25,
  ];

  // 최초 낙하
  scene.getAudio().playEffect(SFX.BALL_DROP);
  await tweenAsync(scene, {
    targets: throwItem,
    y: dropTargetY,
    duration: bounceDurations[0],
    ease: EASE.SINE_EASEIN,
  });

  for (let i = 0; i < bounceHeights.length; i++) {
    // 반등 (위로)
    await tweenAsync(scene, {
      targets: throwItem,
      y: dropTargetY - bounceHeights[i],
      duration: bounceDurations[i] * 0.5,
      ease: EASE.SINE_EASEOUT,
    });
    // 착지 (아래로) + 효과음
    scene.getAudio().playEffect(SFX.BALL_DROP);
    await tweenAsync(scene, {
      targets: throwItem,
      y: dropTargetY,
      duration: bounceDurations[i] * 0.5,
      ease: EASE.SINE_EASEIN,
    });
  }

  await delay(scene, 600);

  // 6. shake
  const angle = BALL_ANIM.shakeAngleDeg;
  for (let i = 0; i < shakeCount; i++) {
    scene.getAudio().playEffect(SFX.BALL_SHAKE);

    await tweenAsync(scene, {
      targets: throwItem,
      angle: -angle,
      duration: BALL_ANIM.shakeMs,
      ease: EASE.SINE_EASEOUT,
    });
    await tweenAsync(scene, {
      targets: throwItem,
      angle: angle,
      duration: BALL_ANIM.shakeMs,
      ease: EASE.SINE_EASEOUT,
    });
    await tweenAsync(scene, {
      targets: throwItem,
      angle: 0,
      duration: BALL_ANIM.shakeMs,
      ease: EASE.SINE_EASEOUT,
    });
    await delay(scene, 400);
  }
}

export async function playBallCatch(scene: GameScene, sprite: BattleSpriteUi): Promise<void> {
  const throwItem = sprite.getThrowItem();
  throwItem.setTint(0x808080);
  scene.getAudio().playEffect(SFX.BALL_CATCH);

  const wildContainer = sprite.getWildContainer();
  const sx = throwItem.x;
  const sy = throwItem.y;

  const promises: Promise<void>[] = [];
  const angles = [10, 80, 190];
  for (const deg of angles) {
    const rad = Phaser.Math.DegToRad(deg);
    const star = addImage(scene, TEXTURE.SAFARI_STAR, undefined, sx, sy).setScale(1);
    wildContainer.add(star);
    const distance = 100;
    const peakHeight = -140;
    promises.push(
      throwParabola(
        scene,
        star,
        sx,
        sy,
        sx + Math.cos(rad) * distance,
        sy + Math.sin(rad) * distance,
        peakHeight,
        500,
      ).then(() => star.destroy()),
    );
  }
  await Promise.all(promises);
  resetThrowItem(throwItem);
}

/** 포획 실패 연출: 볼이 튕겨 사라지고 야생 + 그림자 재등장. */
export async function playBallFail(scene: GameScene, sprite: BattleSpriteUi): Promise<void> {
  const throwItem = sprite.getThrowItem();
  const wild = sprite.getWildSprite();
  const wildShadow = sprite.getWildShadow();

  throwItem.setTexture(TEXTURE.SAFARI_BALL_OPEN);
  scene.getAudio().playEffect(SFX.BALL_EXIT);
  await delay(scene, 200);

  const finalHeight = wild.height * 2.4;
  const centerY = wild.y - finalHeight / 2;
  wild.y = centerY;
  wild.setOrigin(0.5, 0.5);
  wild.setTintFill(0xffffff);
  wildShadow.setTintFill(0x000000);

  await Promise.all([
    tweenAsync(scene, {
      targets: wild,
      scale: 2.4,
      alpha: 1,
      duration: 300,
    }),
    tweenAsync(scene, {
      targets: wildShadow,
      scale: 2.2,
      alpha: 0.3,
      duration: 300,
    }),
  ]);

  wild.clearTint();
  wild.setOrigin(0.5, 1);
  wild.y = centerY + finalHeight / 2;

  resetThrowItem(throwItem);
}

/** FEED 연출: safari_bait 던지기 + 이모트. */
export async function playFeedThrow(scene: GameScene, sprite: BattleSpriteUi): Promise<void> {
  const throwItem = sprite.getThrowItem();
  throwItem.setTexture('safari_bait');

  await sprite.playPlayerBackThrowAnim();
  scene.getAudio().playEffect(SFX.THROW);
  throwItem.setVisible(true);
  await throwParabola(
    scene,
    throwItem,
    THROW_ITEM.startX,
    THROW_ITEM.startY,
    THROW_ITEM.endX,
    THROW_ITEM.endY,
    THROW_ITEM.peakHeight,
    THROW_ITEM.durationMs,
  );
  sprite.resetPlayerBackFrame();

  resetThrowItem(throwItem);
}

/** MUD 연출: safari_rock 던지기 + 야생 shake + 분노 이모트. */
export async function playMudThrow(scene: GameScene, sprite: BattleSpriteUi): Promise<void> {
  const throwItem = sprite.getThrowItem();
  throwItem.setTexture('safari_rock');

  await sprite.playPlayerBackThrowAnim();
  scene.getAudio().playEffect(SFX.THROW);
  throwItem.setVisible(true);
  await throwParabola(
    scene,
    throwItem,
    THROW_ITEM.startX,
    THROW_ITEM.startY,
    THROW_ITEM.endX,
    THROW_ITEM.endY,
    THROW_ITEM.peakHeight,
    THROW_ITEM.durationMs,
  );
  sprite.resetPlayerBackFrame();
  resetThrowItem(throwItem);

  // 야생 shake
  const wild = sprite.getWildSprite();
  const wildContainer = sprite.getWildContainer();
  const baseX = wild.x;
  for (let i = 0; i < 3; i++) {
    await tweenAsync(scene, { targets: wild, x: baseX - 10, duration: 50 });
    await tweenAsync(scene, { targets: wild, x: baseX + 10, duration: 50 });
  }
  wild.x = baseX;

  // 분노 이모트
  const emote = addImage(scene, 'safari_anger', undefined, wild.x - 150, wild.y - 350)
    .setScrollFactor(0)
    .setScale(2)
    .setAlpha(0);
  wildContainer.add(emote);

  await tweenAsync(scene, { targets: emote, alpha: 1, duration: 200 });
  await delay(scene, 600);
  await tweenAsync(scene, { targets: emote, alpha: 0, duration: 200 });
  emote.destroy();
}
