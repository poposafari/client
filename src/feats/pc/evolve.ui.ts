import { BaseUi, IInputHandler } from '@poposafari/core';
import { pokemonCryNames } from '@poposafari/core/master.data.ts';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, EASE, SFX, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addImage, addText, addWindow, getPokemonTexture } from '@poposafari/utils';
import i18next from 'i18next';
import { TalkMessageUi } from '../message';

const POKEMON_SCALE = 3;
const MAX_CROSS_REPEATS = 12;
const TALK_DEPTH_DURING_EVOLVE = DEPTH.API + 2;

export class EvolveUi extends BaseUi implements IInputHandler {
  scene: GameScene;

  private bg!: GImage;
  private blackOverlay!: Phaser.GameObjects.Rectangle;
  private whiteFlash!: Phaser.GameObjects.Rectangle;
  private startSprite!: GImage;
  private nextSprite!: GImage;

  private fakeWindow!: GWindow;
  private fakeText!: GText;

  private particles: Phaser.GameObjects.Image[] = [];
  private loopSound: Phaser.Sound.BaseSound | null = null;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.API + 1);
    this.scene = scene;
    this.createLayout();
    this.setVisible(false);
  }

  createLayout(): void {
    const { width, height } = this.scene.cameras.main;
    const w = width;
    const h = height;

    this.bg = addImage(this.scene, TEXTURE.BG_EVOLVE, undefined, 0, 0)
      .setDisplaySize(w * 2, h * 2)
      .setOrigin(0.5, 0.5);

    this.blackOverlay = this.scene.add
      .rectangle(0, 0, w * 2, h * 2, 0x000000)
      .setOrigin(0.5, 0.5)
      .setAlpha(0);

    this.whiteFlash = this.scene.add
      .rectangle(0, 0, w * 2, h * 2, 0xffffff)
      .setOrigin(0.5, 0.5)
      .setAlpha(0);

    this.startSprite = addImage(this.scene, TEXTURE.BLANK, undefined, 0, -60)
      .setScale(POKEMON_SCALE)
      .setOrigin(0.5, 0.5);

    this.nextSprite = addImage(this.scene, TEXTURE.BLANK, undefined, 0, -60)
      .setScale(POKEMON_SCALE)
      .setOrigin(0.5, 0.5);

    this.fakeWindow = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      405,
      width,
      270,
      3,
      16,
      16,
      16,
      16,
    );
    this.fakeWindow.setVisible(false);

    this.fakeText = addText(
      this.scene,
      -880,
      335,
      '',
      75,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    ).setOrigin(0, 0);
    this.fakeText.setVisible(false);

    this.add([
      this.bg,
      this.blackOverlay,
      this.startSprite,
      this.nextSprite,
      this.fakeWindow,
      this.fakeText,
      this.whiteFlash,
    ]);
  }

  async play(startPokedexId: string, nextPokedexId: string): Promise<void> {
    const startTex = getPokemonTexture('sprite', startPokedexId);
    const nextTex = getPokemonTexture('sprite', nextPokedexId);

    this.startSprite.setTexture(startTex.key, startTex.frame).clearTint();
    this.nextSprite.setTexture(nextTex.key, nextTex.frame).clearTint();

    this.startSprite.setScale(POKEMON_SCALE).setVisible(true);
    this.nextSprite.setScale(0).setVisible(false);
    this.blackOverlay.setAlpha(0);
    this.whiteFlash.setAlpha(0);
    this.hideFakeMessage();
    this.fakeWindow.setAlpha(1);
    this.fakeText.setAlpha(1);

    this.show();
    this.setVisible(true);
    this.inputManager.pop(this);

    const talk = this.scene.getMessage('talk');
    const originalTalkDepth = (talk as Phaser.GameObjects.Container).depth;

    await this.fadeIn();

    const startName = i18next.t(`pokemon:${startPokedexId}.name`);
    const nextName = i18next.t(`pokemon:${nextPokedexId}.name`);

    const startMessage = i18next.t('pc:evolveStart', { name: startName });
    await this.showTalk(talk, startMessage);
    this.showFakeMessage(startMessage);

    await this.playSoundAsync(this.resolveCryKey(startPokedexId));
    await this.playSoundAsync(SFX.EVOL_0);
    this.playLoopSound(SFX.EVOL_1);

    await this.fadeToBlack();
    // await this.prePulse(this.startSprite);
    await this.runCrossTween();
    await this.flashWhite();

    // 파티클 이펙트 시작
    this.stopLoopSound();
    this.nextSprite.clearTint();
    await this.playSoundAsync(SFX.HATCH);

    this.startParticles();

    await this.fadeFromBlack();
    await this.wait(800);
    await this.playSoundAsync(this.resolveCryKey(nextPokedexId));

    this.hideFakeMessage();

    const endMessage = i18next.t('pc:evolveEnd', { from: startName, to: nextName });
    const congDone = this.playSoundAsync(SFX.CONGRATULATIONS);
    const talkDone = this.showTalk(talk, endMessage).then(() => this.showFakeMessage(endMessage));
    await Promise.all([congDone, talkDone]);

    (talk as Phaser.GameObjects.Container).setDepth(originalTalkDepth);

    await this.fadeOut();
    this.hide();
    this.setVisible(false);
  }

  private showFakeMessage(content: string): void {
    this.fakeText.setText(content);
    this.fakeWindow.setVisible(true);
    this.fakeText.setVisible(true);
  }

  private hideFakeMessage(): void {
    this.fakeWindow.setVisible(false);
    this.fakeText.setVisible(false);
    this.fakeText.setText('');
  }

  private async showTalk(talk: TalkMessageUi, content: string): Promise<void> {
    (talk as unknown as Phaser.GameObjects.Container).setDepth(TALK_DEPTH_DURING_EVOLVE);
    await talk.showMessage(content);
  }

  private resolveCryKey(pokedexId: string): string {
    return pokemonCryNames.includes(pokedexId) ? pokedexId : pokedexId.split('_')[0];
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.scene.time.delayedCall(ms, resolve);
    });
  }

  private playSoundAsync(key: string): Promise<void> {
    return new Promise((resolve) => {
      const sound = this.scene.sound.add(key);
      sound.once(Phaser.Sound.Events.COMPLETE, () => {
        sound.destroy();
        resolve();
      });
      sound.play();
    });
  }

  private playLoopSound(key: string): void {
    this.stopLoopSound();
    const sound = this.scene.sound.add(key, { loop: true });
    sound.play();
    this.loopSound = sound;
  }

  private stopLoopSound(): void {
    if (this.loopSound) {
      this.loopSound.stop();
      this.loopSound.destroy();
      this.loopSound = null;
    }
  }

  private fadeIn(): Promise<void> {
    this.bg.setAlpha(0);
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.bg,
        alpha: 1,
        duration: 600,
        ease: EASE.LINEAR,
        onComplete: () => resolve(),
      });
    });
  }

  private fadeOut(): Promise<void> {
    return new Promise((resolve) => {
      const targets = [
        this.bg,
        this.blackOverlay,
        this.startSprite,
        this.nextSprite,
        this.fakeWindow,
        this.fakeText,
      ];
      this.scene.tweens.add({
        targets,
        alpha: 0,
        duration: 600,
        ease: EASE.LINEAR,
        onComplete: () => {
          [this.bg, this.startSprite, this.nextSprite, this.fakeWindow, this.fakeText].forEach(
            (o) => o.setAlpha(1),
          );
          this.blackOverlay.setAlpha(0);
          this.whiteFlash.setAlpha(0);
          this.hideFakeMessage();
          resolve();
        },
      });
    });
  }

  private fadeToBlack(): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.blackOverlay,
        alpha: 1,
        duration: 900,
        ease: EASE.LINEAR,
        onComplete: () => resolve(),
      });
    });
  }

  private fadeFromBlack(): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.blackOverlay,
        alpha: 0,
        duration: 900,
        ease: EASE.LINEAR,
        onComplete: () => resolve(),
      });
    });
  }

  private prePulse(sprite: GImage): Promise<void> {
    return new Promise((resolve) => {
      sprite.setTintFill(0xffffff);
      this.scene.tweens.add({
        targets: sprite,
        x: { from: -12, to: 12 },
        duration: 60,
        yoyo: true,
        repeat: 8,
        ease: EASE.LINEAR,
        onComplete: () => {
          sprite.setX(0);
          sprite.clearTint();
          resolve();
        },
      });
    });
  }

  private flashWhite(): Promise<void> {
    return new Promise((resolve) => {
      this.whiteFlash.setAlpha(0);
      this.scene.tweens.add({
        targets: this.whiteFlash,
        alpha: 1,
        duration: 120,
        ease: EASE.LINEAR,
        onComplete: () => {
          this.scene.tweens.add({
            targets: this.whiteFlash,
            alpha: 0,
            duration: 700,
            ease: EASE.QUINT_EASEOUT,
            onComplete: () => resolve(),
          });
        },
      });
    });
  }

  private async runCrossTween(): Promise<void> {
    let speed = 800;
    for (let i = 0; i < MAX_CROSS_REPEATS; i++) {
      await this.crossTween(this.startSprite, this.nextSprite, speed);
      await this.crossTween(this.nextSprite, this.startSprite, speed);
      speed = Math.max(50, speed - 200);
    }
    this.startSprite.setVisible(false);
    this.nextSprite.setVisible(true);
    await this.animateGrow(this.nextSprite, speed);
  }

  private crossTween(shrink: GImage, grow: GImage, duration: number): Promise<void> {
    return new Promise((resolve) => {
      shrink.setVisible(true);
      grow.setVisible(true);
      grow.setScale(0);

      const half = duration / 3;

      this.scene.tweens.add({
        targets: shrink,
        scale: 0,
        duration,
        ease: EASE.LINEAR,
        onStart: () => shrink.setTintFill(0xffffff),
      });

      this.scene.time.delayedCall(half, () => {
        this.scene.tweens.add({
          targets: grow,
          scale: POKEMON_SCALE,
          duration,
          ease: EASE.LINEAR,
          onStart: () => grow.setTintFill(0xffffff),
          onComplete: () => resolve(),
        });
      });
    });
  }

  private animateGrow(sprite: GImage, duration: number): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: sprite,
        scale: POKEMON_SCALE,
        ease: EASE.LINEAR,
        duration,
        onStart: () => sprite.setTintFill(0xffffff),
        onComplete: () => resolve(),
      });
    });
  }

  private startParticles(): void {
    this.particles.forEach((p) => p.destroy());
    this.particles = [];

    const cx = 0;
    const cy = -60;

    const flash = this.scene.add.image(cx, cy, TEXTURE.PARTICLE_EVOL);
    flash.setTintFill(0xffffff);
    flash.setAlpha(1);
    flash.setScale(2.4);
    flash.setBlendMode(Phaser.BlendModes.ADD);
    this.particles.push(flash);
    this.add(flash);
    this.scene.tweens.add({
      targets: flash,
      scale: 8,
      alpha: 0,
      duration: 900,
      ease: EASE.QUINT_EASEOUT,
      onComplete: () => {
        flash.destroy();
        this.particles = this.particles.filter((p) => p !== flash);
      },
    });

    const sparkCount = 40;
    const GRAVITY = 2600;

    for (let i = 0; i < sparkCount; i++) {
      const spark = this.scene.add.image(cx, cy, TEXTURE.PARTICLE_EVOL);
      spark.setTintFill(0xffffff);
      spark.setBlendMode(Phaser.BlendModes.ADD);
      spark.setAlpha(1);
      spark.setScale(Phaser.Math.FloatBetween(2, 4));
      this.particles.push(spark);
      this.add(spark);

      const spread = Phaser.Math.DegToRad(25);
      const angle = -Math.PI / 2 + Phaser.Math.FloatBetween(-spread, spread);
      const speed = Phaser.Math.Between(1400, 2000);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const lifetime = Phaser.Math.Between(1200, 2000);
      const startX = cx;
      const startY = cy;

      const state = { t: 0 };
      this.scene.tweens.add({
        targets: state,
        t: lifetime,
        duration: lifetime,
        ease: EASE.LINEAR,
        onUpdate: () => {
          const ts = state.t / 1000;
          spark.x = startX + vx * ts;
          spark.y = startY + vy * ts + 0.5 * GRAVITY * ts * ts;
          const p = state.t / lifetime;
          spark.alpha = p < 0.6 ? 1 : 1 - (p - 0.6) / 0.4;
        },
        onComplete: () => {
          spark.destroy();
          this.particles = this.particles.filter((p) => p !== spark);
        },
      });
    }
  }

  onInput(_key: string): void {}
  errorEffect(_errorMsg: string): void {}
  waitForInput(): Promise<unknown> {
    return new Promise(() => {});
  }
}
