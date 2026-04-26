import { BaseUi } from '@poposafari/core';
import { pokemonCryNames } from '@poposafari/core/master.data.ts';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, EASE, TEXTURE } from '@poposafari/types';
import { addContainer, getPokemonTexture } from '@poposafari/utils';
import type { HiddenMoveCaster } from './hidden-move.phase';

const BANNER_HEIGHT = 520;
const OVERLAY_ALPHA = 0.5;

const FADE_IN_MS = 200;
const BANNER_OPEN_MS = 320;
const BANNER_CLOSE_MS = 220;
const FADE_OUT_MS = 200;

const POKEMON_SLIDE_IN_MS = 600;
const POKEMON_SLIDE_OUT_MS = 600;
const POKEMON_HOLD_MS = 400;
const POKEMON_DISPLAY_SCALE = 3;

const PARTICLE_INTERVAL_MS = 50;
const PARTICLE_TRAVEL_MS = 400;

export class HiddenMoveUi extends BaseUi {
  scene: GameScene;

  private container!: GContainer;
  private overlay!: Phaser.GameObjects.Rectangle;
  private banner!: GImage;
  private particles: Set<GImage> = new Set();
  private particleTimer: Phaser.Time.TimerEvent | null = null;
  private bannerScaleX: number = 2;
  private bannerScaleY: number = 1;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.MESSAGE_TOP);
    this.scene = scene;
    this.createLayout();
  }

  onInput(_key: string): void {}

  errorEffect(_errorMsg: string): void {
    throw new Error('Method not implemented.');
  }

  waitForInput(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  createLayout(): void {
    const { width, height } = this.scene.cameras.main;
    this.container = addContainer(this.scene, DEPTH.MESSAGE_TOP);

    this.overlay = this.scene.add
      .rectangle(0, 0, width * 2, height * 2, 0x000000, OVERLAY_ALPHA)
      .setOrigin(0.5);
    this.overlay.setAlpha(0);

    this.banner = this.scene.add.image(0, 0, TEXTURE.BG_HM).setOrigin(0.5);
    this.banner.setDisplaySize(width, BANNER_HEIGHT);
    this.bannerScaleX = this.banner.scaleX;
    this.bannerScaleY = this.banner.scaleY;
    this.banner.setScale(this.bannerScaleX, 0);
    this.banner.setVisible(false);

    this.container.add([this.overlay, this.banner]);
    this.add([this.container]);
    this.setVisible(false);
  }

  async play(caster: HiddenMoveCaster): Promise<void> {
    this.show();
    this.setVisible(true);

    await this.tweenAsync(this.overlay, { alpha: 1 }, FADE_IN_MS, 'Linear');

    this.banner.setVisible(true);
    this.banner.setScale(this.bannerScaleX, 0);
    await this.tweenAsync(
      this.banner,
      { scaleY: this.bannerScaleY },
      BANNER_OPEN_MS,
      'Back.easeOut',
    );

    this.startParticleStream();

    await this.playCasterSequence(caster);

    this.stopParticleStream();

    await this.tweenAsync(this.banner, { scaleY: 0 }, BANNER_CLOSE_MS, 'Back.easeIn');
    this.banner.setVisible(false);

    await this.tweenAsync(this.overlay, { alpha: 0 }, FADE_OUT_MS, 'Linear');

    this.clearParticles();
  }

  private async playCasterSequence(caster: HiddenMoveCaster): Promise<void> {
    const { width } = this.scene.cameras.main;
    const { key, frame } = getPokemonTexture(
      'sprite',
      caster.pokedexId,
      { isShiny: caster.isShiny, isFemale: caster.isFemale },
      this.scene,
    );

    let sprite: GImage | null = null;
    if (this.scene.textures.exists(key) && this.scene.textures.get(key).has(frame)) {
      sprite = this.scene.add.image(width, 0, key, frame).setOrigin(0.5);
      sprite.setScale(POKEMON_DISPLAY_SCALE);
      this.container.add(sprite);
    }

    if (sprite) {
      await this.tweenAsync(sprite, { x: 0 }, POKEMON_SLIDE_IN_MS, EASE.QUART_EASEOUT);
    }

    this.playCry(caster.pokedexId);
    await this.delay(POKEMON_HOLD_MS);

    if (sprite) {
      await this.tweenAsync(
        sprite,
        { x: -width, alpha: 0 },
        POKEMON_SLIDE_OUT_MS,
        EASE.QUART_EASEIN,
      );
      sprite.destroy();
    }
  }

  private playCry(pokedexId: string): void {
    const cryKey = pokemonCryNames.includes(pokedexId) ? pokedexId : pokedexId.split('_')[0];
    if (!pokemonCryNames.includes(cryKey)) return;
    this.scene.getAudio().playEffect(cryKey);
  }

  private startParticleStream(): void {
    this.particleTimer = this.scene.time.addEvent({
      delay: PARTICLE_INTERVAL_MS,
      loop: true,
      callback: () => this.spawnParticle(),
    });
  }

  private stopParticleStream(): void {
    if (this.particleTimer) {
      this.particleTimer.remove();
      this.particleTimer = null;
    }
  }

  private spawnParticle(): void {
    const { width } = this.scene.cameras.main;
    const tex = Math.random() < 0.5 ? TEXTURE.PARTICLE_HM_0 : TEXTURE.PARTICLE_HM_1;

    const startX = -width / 2 - 100;
    const endX = width / 2 + 100;
    const y = Phaser.Math.Between(-200, 200);

    const p = this.scene.add.image(startX, y, tex).setOrigin(0.5);
    p.setScale(Phaser.Math.FloatBetween(4, 5));
    p.setAlpha(0);

    this.container.add(p);
    this.particles.add(p);

    this.scene.tweens.add({
      targets: p,
      x: endX,
      duration: PARTICLE_TRAVEL_MS,
      ease: 'Linear',
      onComplete: () => {
        p.destroy();
        this.particles.delete(p);
      },
    });

    this.scene.tweens.add({
      targets: p,
      alpha: 0.9,
      duration: PARTICLE_TRAVEL_MS / 2,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });
  }

  private clearParticles(): void {
    for (const p of this.particles) p.destroy();
    this.particles.clear();
  }

  private tweenAsync(
    target: Phaser.GameObjects.GameObject,
    props: Record<string, number>,
    duration: number,
    ease: string,
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: target,
        ...props,
        duration,
        ease,
        onComplete: () => resolve(),
      });
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
      this.scene.time.delayedCall(ms, () => resolve());
    });
  }

  override hide(): void {
    super.hide();
    this.setVisible(false);
  }

  override destroy(fromScene?: boolean): void {
    this.stopParticleStream();
    this.clearParticles();
    super.destroy(fromScene);
  }
}
