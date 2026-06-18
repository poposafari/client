import type { GameScene } from '@poposafari/scenes/game.scene';
import { DEPTH, EASE, SFX, TEXTURE } from '@poposafari/types';
import { addImage } from '@poposafari/utils';
import type { BattleSpriteUi } from '../ui/battle-sprite.ui';
import { BALL_ANIM, THROW_ITEM, WILD_SHADOW, WILD_SPRITE } from '../battle.constants';
import { resolveCryKey } from '@poposafari/core/master.data.ts';

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

async function playBallBurstParticles(scene: GameScene, sprite: BattleSpriteUi): Promise<void> {
  const throwItem = sprite.getThrowItem();
  const wildContainer = sprite.getWildContainer();
  const burstX = throwItem.x + (0.5 - throwItem.originX) * throwItem.displayWidth;
  const burstY = throwItem.y + (0.5 - throwItem.originY) * throwItem.displayHeight;

  const particleCount = 7;
  const outerRadius = 360;
  const innerRadius = 185;
  const expandMs = 350;
  const contractMs = 350;
  const rotationDeg = 140;

  type BurstParticle = {
    img: Phaser.GameObjects.Image;
    baseAngleDeg: number;
    radius: number;
  };
  const particles: BurstParticle[] = [];
  const peakAlpha = 0.55;
  const bigTint = 0xa6f062;
  const smallTint = 0xffdb4d;

  for (let i = 0; i < particleCount; i++) {
    const angleStep = 360 / particleCount;
    const big = addImage(scene, TEXTURE.BALL_BURST_PARTICLE, undefined, burstX, burstY)
      .setScale(3)
      .setAlpha(0)
      .setTint(bigTint)
      .setBlendMode(Phaser.BlendModes.ADD);
    wildContainer.add(big);
    wildContainer.moveBelow(big, throwItem);
    particles.push({ img: big, baseAngleDeg: angleStep * i, radius: outerRadius });

    const small = addImage(scene, TEXTURE.BALL_BURST_PARTICLE_S, undefined, burstX, burstY)
      .setScale(2.4)
      .setAlpha(0)
      .setTint(smallTint)
      .setBlendMode(Phaser.BlendModes.ADD);
    wildContainer.add(small);
    wildContainer.moveBelow(small, throwItem);
    particles.push({
      img: small,
      baseAngleDeg: angleStep * i + angleStep / 2,
      radius: innerRadius,
    });
  }

  const dazzleStartScale = 0.1;
  const dazzlePeakScale = 4;
  const dazzleEndScale = 6;
  const dazzlePeakAlpha = 0.6;
  const dazzle = addImage(scene, TEXTURE.BALL_BURST_DAZZLE, undefined, burstX, burstY)
    .setScale(dazzleStartScale)
    .setAlpha(0)
    .setTint(0xf6f2d9)
    .setBlendMode(Phaser.BlendModes.ADD);
  wildContainer.add(dazzle);
  wildContainer.moveBelow(dazzle, throwItem);

  const totalMs = expandMs + contractMs;
  const fadeInMs = 300;
  const holdMs = 300;
  const fadeOutStart = fadeInMs + holdMs;
  const fadeOutMs = Math.max(1, totalMs - fadeOutStart);
  const holdCurve = (elapsedMs: number): number => {
    if (elapsedMs < fadeInMs) return elapsedMs / fadeInMs;
    if (elapsedMs < fadeOutStart) return 1;
    return Math.max(0, 1 - (elapsedMs - fadeOutStart) / fadeOutMs);
  };

  const expandProxy = { t: 0 };
  await tweenAsync(scene, {
    targets: expandProxy,
    t: 1,
    duration: expandMs,
    ease: EASE.LINEAR,
    onUpdate: () => {
      const t = expandProxy.t;
      const alphaMul = holdCurve(t * expandMs);
      for (const p of particles) {
        const ang = Phaser.Math.DegToRad(p.baseAngleDeg + rotationDeg * t);
        p.img.x = burstX + Math.cos(ang) * p.radius * t;
        p.img.y = burstY + Math.sin(ang) * p.radius * t;
        p.img.alpha = peakAlpha * alphaMul;
      }
      dazzle.setScale(dazzleStartScale + (dazzlePeakScale - dazzleStartScale) * t);
      dazzle.alpha = dazzlePeakAlpha * alphaMul;
    },
  });

  const contractProxy = { t: 0 };
  await tweenAsync(scene, {
    targets: contractProxy,
    t: 1,
    duration: contractMs,
    ease: EASE.LINEAR,
    onUpdate: () => {
      const t = contractProxy.t;
      const r = 1 - t;
      const alphaMul = holdCurve(expandMs + t * contractMs);
      for (const p of particles) {
        const ang = Phaser.Math.DegToRad(p.baseAngleDeg + rotationDeg * (1 + t));
        p.img.x = burstX + Math.cos(ang) * p.radius * r;
        p.img.y = burstY + Math.sin(ang) * p.radius * r;
        p.img.alpha = peakAlpha * alphaMul;
      }
      dazzle.setScale(dazzlePeakScale + (dazzleEndScale - dazzlePeakScale) * t);
      dazzle.alpha = dazzlePeakAlpha * alphaMul;
    },
  });

  particles.forEach((p) => p.img.destroy());
  dazzle.destroy();

  const ringStartScale = 0.1;
  const ringEndScale = 5.0;
  const ringPeakAlpha = 0.6;
  const ringFadeInMs = 200;
  const ringFadeOutMs = 300;
  const ringTotalMs = ringFadeInMs + ringFadeOutMs;
  const ringFadeInRatio = ringFadeInMs / ringTotalMs;
  const ring = addImage(scene, TEXTURE.BALL_BURST_RING, undefined, burstX, burstY)
    .setScale(ringStartScale)
    .setAlpha(0)
    .setBlendMode(Phaser.BlendModes.ADD);
  wildContainer.add(ring);
  wildContainer.moveBelow(ring, throwItem);

  const ringProxy = { t: 0 };
  await tweenAsync(scene, {
    targets: ringProxy,
    t: 1,
    duration: ringTotalMs,
    ease: EASE.LINEAR,
    onUpdate: () => {
      const t = ringProxy.t;
      ring.setScale(ringStartScale + (ringEndScale - ringStartScale) * t);
      ring.alpha =
        t < ringFadeInRatio
          ? ringPeakAlpha * (t / ringFadeInRatio)
          : ringPeakAlpha * (1 - (t - ringFadeInRatio) / (1 - ringFadeInRatio));
    },
  });

  ring.destroy();
}

async function playBallExitParticles(scene: GameScene, sprite: BattleSpriteUi): Promise<void> {
  const throwItem = sprite.getThrowItem();
  const wildContainer = sprite.getWildContainer();
  const burstX = throwItem.x + (0.5 - throwItem.originX) * throwItem.displayWidth;
  const burstY = throwItem.y + (0.5 - throwItem.originY) * throwItem.displayHeight;

  const particleCount = 10;
  const outerRadius = 600;
  const innerRadius = 410;
  const durationMs = 700;
  const peakAlpha = 1;
  const bigTint = 0xa6f062;
  const smallTint = 0xffdb4d;

  type ExitParticle = {
    img: Phaser.GameObjects.Image;
    angleDeg: number;
    radius: number;
  };
  const particles: ExitParticle[] = [];

  for (let i = 0; i < particleCount; i++) {
    const big = addImage(scene, TEXTURE.BALL_BURST_PARTICLE, undefined, burstX, burstY)
      .setScale(2.8)
      .setAlpha(0)
      .setTint(bigTint);
    wildContainer.add(big);
    particles.push({
      img: big,
      angleDeg: Phaser.Math.FloatBetween(0, 360),
      radius: outerRadius + Phaser.Math.FloatBetween(-40, 40),
    });

    const small = addImage(scene, TEXTURE.BALL_BURST_PARTICLE_S, undefined, burstX, burstY)
      .setScale(2.2)
      .setAlpha(0)
      .setTint(smallTint);
    wildContainer.add(small);
    particles.push({
      img: small,
      angleDeg: Phaser.Math.FloatBetween(0, 360),
      radius: innerRadius + Phaser.Math.FloatBetween(-30, 30),
    });
  }

  const particleFadeInMs = 80;
  const particleHoldMs = 220;
  const particleFadeOutStart = particleFadeInMs + particleHoldMs;
  const particleFadeOutMs = Math.max(1, durationMs - particleFadeOutStart);
  const particleAlphaCurve = (elapsedMs: number): number => {
    if (elapsedMs < particleFadeInMs) return elapsedMs / particleFadeInMs;
    if (elapsedMs < particleFadeOutStart) return 1;
    return Math.max(0, 1 - (elapsedMs - particleFadeOutStart) / particleFadeOutMs);
  };

  const particleProxy = { t: 0 };
  const particleTween = tweenAsync(scene, {
    targets: particleProxy,
    t: 1,
    duration: durationMs,
    ease: EASE.LINEAR,
    onUpdate: () => {
      const t = particleProxy.t;
      const alphaMul = particleAlphaCurve(t * durationMs);
      for (const p of particles) {
        const ang = Phaser.Math.DegToRad(p.angleDeg);
        p.img.x = burstX + Math.cos(ang) * p.radius * t;
        p.img.y = burstY + Math.sin(ang) * p.radius * t;
        p.img.alpha = peakAlpha * alphaMul;
      }
    },
  });

  const centerStartScale = 0.5;
  const centerEndScale = 9;
  const centerPeakAlpha = 0.85;
  const centerFadeInMs = 150;
  const centerHoldMs = 150;
  const centerFadeOutStart = centerFadeInMs + centerHoldMs;
  const centerFadeOutMs = Math.max(1, durationMs - centerFadeOutStart);
  const centerAlphaCurve = (elapsedMs: number): number => {
    if (elapsedMs < centerFadeInMs) return elapsedMs / centerFadeInMs;
    if (elapsedMs < centerFadeOutStart) return 1;
    return Math.max(0, 1 - (elapsedMs - centerFadeOutStart) / centerFadeOutMs);
  };
  const centerGlow = addImage(scene, TEXTURE.BALL_BURST_PARTICLE, undefined, burstX, burstY)
    .setScale(centerStartScale)
    .setAlpha(0)
    .setBlendMode(Phaser.BlendModes.ADD);
  wildContainer.add(centerGlow);
  if (particles.length > 0) {
    wildContainer.moveBelow(centerGlow, particles[0].img);
  }

  const centerProxy = { t: 0 };
  const centerTween = tweenAsync(scene, {
    targets: centerProxy,
    t: 1,
    duration: durationMs,
    ease: EASE.LINEAR,
    onUpdate: () => {
      const t = centerProxy.t;
      centerGlow.setScale(centerStartScale + (centerEndScale - centerStartScale) * t);
      centerGlow.alpha = centerPeakAlpha * centerAlphaCurve(t * durationMs);
    },
  }).then(() => {
    centerGlow.destroy();
  });

  const rayBaseAngles = [165, 180, -15, 15, -75, -105];
  const rayBaseRadius = 300;
  const rayPromises: Promise<void>[] = [];

  for (const baseAngleDeg of rayBaseAngles) {
    const angleDeg = baseAngleDeg + Phaser.Math.FloatBetween(-12, 12);
    const startDelay = Phaser.Math.Between(0, 100);
    const duration = Phaser.Math.Between(300, 500);
    const radius = rayBaseRadius + Phaser.Math.FloatBetween(-80, 80);
    const thicknessScale = 4.6;
    const lengthScale = 2.4;

    const ray = addImage(scene, TEXTURE.BALL_BURST_RAY, undefined, burstX, burstY)
      .setOrigin(0.5, 1)
      .setScale(thicknessScale, lengthScale)
      .setAlpha(0)
      .setAngle(angleDeg + 90);
    wildContainer.add(ray);
    wildContainer.moveBelow(ray, centerGlow);

    rayPromises.push(
      new Promise<void>((resolve) => {
        scene.time.delayedCall(startDelay, () => {
          ray.setAlpha(peakAlpha);
          const proxy = { t: 0 };
          scene.tweens.add({
            targets: proxy,
            t: 1,
            duration,
            ease: EASE.LINEAR,
            onUpdate: () => {
              const t = proxy.t;
              const ang = Phaser.Math.DegToRad(angleDeg);
              ray.x = burstX + Math.cos(ang) * radius * t;
              ray.y = burstY + Math.sin(ang) * radius * t;
              ray.alpha = peakAlpha * (1 - t);
            },
            onComplete: () => {
              ray.destroy();
              resolve();
            },
          });
        });
      }),
    );
  }

  await Promise.all([particleTween, centerTween, ...rayPromises]);

  particles.forEach((p) => p.img.destroy());
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

  const savedX = wild.x;
  const savedY = wild.y;
  wild.x -= (wild.originX - 0.5) * wild.displayWidth;
  wild.y -= (wild.originY - 0.5) * wild.displayHeight;
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
      scaleX: 0.1,
      scaleY: 0.1,
      alpha: 0,
      duration: BALL_ANIM.enterShrinkMs,
    }),
    // throwItem 중앙에서 파티클 버스트 → 시계방향 회전 → 중앙으로 수렴
    playBallBurstParticles(scene, sprite),
  ]);
  wild.clearTint();
  wildShadow.clearTint();
  sprite.resetWildOrigin();
  wild.x = savedX;
  wild.y = savedY;
  throwItem.setTexture(TEXTURE.SAFARI_BALL_THROW).setFrame(`${TEXTURE.SAFARI_BALL_THROW}-0`);

  const ballGlowMs = 500;
  const ballGlowPeakAlpha = 1.0;
  const ballGlow = addImage(
    scene,
    TEXTURE.SAFARI_BALL_THROW,
    `${TEXTURE.SAFARI_BALL_THROW}-0`,
    throwItem.x,
    throwItem.y,
  )
    .setScale(throwItem.scaleX, throwItem.scaleY)
    .setOrigin(throwItem.originX, throwItem.originY)
    .setAlpha(0)
    .setTintFill(0xffd84d);
  sprite.getWildContainer().add(ballGlow);

  const ballGlowProxy = { t: 0 };
  await tweenAsync(scene, {
    targets: ballGlowProxy,
    t: 1,
    duration: ballGlowMs,
    ease: EASE.LINEAR,
    onUpdate: () => {
      const t = ballGlowProxy.t;
      const k = t < 0.5 ? t * 2 : (1 - t) * 2;
      ballGlow.alpha = ballGlowPeakAlpha * k;
    },
  });
  ballGlow.destroy();

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
export async function playBallFail(
  scene: GameScene,
  sprite: BattleSpriteUi,
  pokedexId: string,
): Promise<void> {
  const throwItem = sprite.getThrowItem();
  const wild = sprite.getWildSprite();
  const wildShadow = sprite.getWildShadow();

  throwItem.setTexture(TEXTURE.SAFARI_BALL_OPEN);
  scene.getAudio().playEffect(SFX.BALL_EXIT);

  playBallExitParticles(scene, sprite);

  resetThrowItem(throwItem);

  const savedX = wild.x;
  const savedY = wild.y;
  const finalWidth = wild.width * WILD_SPRITE.scale;
  const finalHeight = wild.height * WILD_SPRITE.scale;
  const centerX = savedX - (wild.originX - 0.5) * finalWidth;
  const centerY = savedY - (wild.originY - 0.5) * finalHeight;
  wild.x = centerX;
  wild.y = centerY;
  wild.setOrigin(0.5, 0.5);
  wild.setTintFill(0xffffff);
  wildShadow.setTintFill(0x000000);

  const cryKey = resolveCryKey(pokedexId);
  if (cryKey) scene.getAudio().playEffect(cryKey);

  await Promise.all([
    tweenAsync(scene, {
      targets: wild,
      scale: WILD_SPRITE.scale,
      alpha: 1,
      duration: 300,
    }),
    tweenAsync(scene, {
      targets: wildShadow,
      scaleX: WILD_SPRITE.scale,
      scaleY: WILD_SPRITE.scale * 0.3,
      alpha: WILD_SHADOW.alpha,
      duration: 300,
    }),
  ]);

  wild.clearTint();
  sprite.resetWildOrigin();
  wild.x = savedX;
  wild.y = savedY;
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
