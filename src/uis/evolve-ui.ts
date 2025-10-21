import { eventBus } from '../core/event-bus';
import { GM } from '../core/game-manager';
import { AUDIO, DEPTH, EASE, EVENT, TEXTSTYLE, TEXTURE } from '../enums';
import i18next from '../i18n';
import { PlayerPokemon } from '../obj/player-pokemon';
import { InGameScene } from '../scenes/ingame-scene';
import { getPokemonSpriteKey, replacePercentSymbol } from '../utils/string-util';
import { TalkMessageUi } from './talk-message-ui';
import { addBackground, addImage, addText, addWindow, delay, pauseSound, playEffectSound, runFadeEffect, Ui } from './ui';

export class EvolveUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private particleContainer!: Phaser.GameObjects.Container;

  private talkUi!: TalkMessageUi;

  private startPokemon!: Phaser.GameObjects.Image;
  private nextPokemon!: Phaser.GameObjects.Image;
  private text!: Phaser.GameObjects.Text;
  private textWindow!: Phaser.GameObjects.NineSlice;
  private particles: Phaser.GameObjects.Image[] = [];

  private readonly baseWindowScale: number = 4;

  constructor(scene: InGameScene) {
    super(scene);

    this.talkUi = new TalkMessageUi(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.talkUi.setup();

    this.container = this.createContainer(width / 2, height / 2);
    this.particleContainer = this.createContainer(width / 2, height / 2);

    const bg = addBackground(this.scene, TEXTURE.BG_EVOLVE).setOrigin(0.5, 0.5);
    this.startPokemon = addImage(this.scene, `pokemon_sprite0000`, 0, 0).setScale(4.8);
    this.nextPokemon = addImage(this.scene, `pokemon_sprite0000`, 0, 0).setScale(4.8);
    this.textWindow = addWindow(this.scene, TEXTURE.WINDOW_MENU, 0, 410, 1900 / this.baseWindowScale, 240 / this.baseWindowScale, 16, 16, 16, 16).setScale(this.baseWindowScale);
    this.text = addText(this.scene, -880, +340, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0).setScale(1);

    this.textWindow.setVisible(false);

    this.container.add(bg);
    this.container.add(this.startPokemon);
    this.container.add(this.nextPokemon);
    this.container.add(this.textWindow);
    this.container.add(this.text);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TOP + 1);
    this.container.setScrollFactor(0);

    this.particleContainer.setVisible(false);
    this.particleContainer.setDepth(DEPTH.TOP + 2);
    this.particleContainer.setScrollFactor(0);
  }

  async show(data: PlayerPokemon): Promise<void> {
    runFadeEffect(this.scene, 800, 'in');

    this.startPokemon.clearTint();
    this.nextPokemon.clearTint();

    this.startPokemon.setTexture(getPokemonSpriteKey(data));
    this.nextPokemon.setTexture(getPokemonSpriteKey(data, data.getEvol().next!));

    this.startPokemon.setVisible(true);
    this.nextPokemon.setVisible(false);

    this.container.setVisible(true);

    await this.talkUi.show({
      type: 'default',
      content: replacePercentSymbol(i18next.t('message:evolve_0'), [i18next.t(`pokemon:${data.getPokedex()}.name`)]),
      speed: GM.getUserOption()?.getTextSpeed()!,
      end: async () => {
        this.showMessage(replacePercentSymbol(i18next.t('message:evolve_0'), [i18next.t(`pokemon:${data.getPokedex()}.name`)]));
        await this.startEvolveAnimation(data.getPokedex(), data.getEvol().next!);
      },
    });
  }

  clean(data?: any): void {
    runFadeEffect(this.scene, 800, 'in');

    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  private showMessage(content: string) {
    this.text.setText(content);
    this.textWindow.setTexture(GM.getUserOption()?.getFrame('text') as string);
    this.textWindow.setVisible(true);
  }

  private cleanText() {
    this.text.text = '';
    this.textWindow.setVisible(false);
  }

  private async startEvolveAnimation(start: string, next: string) {
    playEffectSound(this.scene, AUDIO.EVOL_INTRO);

    await delay(this.scene, 900);

    playEffectSound(this.scene, AUDIO.EVOL);

    const maxRepeats = 12;
    let speed = 800;

    this.startPokemon.setScale(4.8).setVisible(true);
    this.nextPokemon.setScale(0).setVisible(false);

    for (let i = 0; i < maxRepeats; i++) {
      await this.crossTween(this.startPokemon, this.nextPokemon, speed);
      await this.crossTween(this.nextPokemon, this.startPokemon, speed);

      speed = Math.max(50, speed - 200);
    }

    this.startPokemon.setVisible(false);
    this.nextPokemon.setVisible(true);
    await this.animateGrow(this.nextPokemon, speed);
    this.startParticle();
    playEffectSound(this.scene, AUDIO.HATCH);

    await delay(this.scene, 1000);

    pauseSound(this.scene, true);
    playEffectSound(this.scene, AUDIO.CONG);

    this.nextPokemon.clearTint();

    this.cleanText();

    await this.talkUi.show({
      type: 'default',
      content: replacePercentSymbol(i18next.t('message:evolve_1'), [i18next.t(`pokemon:${start}.name`), i18next.t(`pokemon:${next}.name`)]),
      speed: GM.getUserOption()?.getTextSpeed()!,
      end: () => {
        this.clean();
        eventBus.emit(EVENT.EVOLVE_FINISH_IN_PC);
      },
    });
  }

  private crossTween(shrinkTarget: Phaser.GameObjects.Image, growTarget: Phaser.GameObjects.Image, duration: number): Promise<void> {
    return new Promise((resolve) => {
      shrinkTarget.setVisible(true);
      growTarget.setVisible(true);
      growTarget.setScale(0);

      const half = duration / 3;

      this.scene.tweens.add({
        targets: shrinkTarget,
        scale: 0,
        duration,
        ease: EASE.LINEAR,
        onStart: () => {
          shrinkTarget.setTintFill(0xffffff);
        },
      });

      this.scene.time.delayedCall(half, () => {
        this.scene.tweens.add({
          targets: growTarget,
          scale: 4.8,
          duration,
          ease: EASE.LINEAR,
          onStart: () => {
            growTarget.setTintFill(0xffffff);
          },
          onComplete: () => {
            resolve();
          },
        });
      });
    });
  }

  private animateGrow(sprite: Phaser.GameObjects.Image, duration: number): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: sprite,
        scale: 4.8,
        ease: EASE.LINEAR,
        duration,
        onStart: () => {
          sprite.setTintFill(0xffffff);
        },
        onComplete: () => {
          resolve();
        },
      });
    });
  }

  private setParticle() {
    if (this.particleContainer) {
      this.particleContainer.removeAll(true);
    }

    this.particles.forEach((particle) => particle.destroy());
    this.particles = [];

    for (let i = 0; i < 100; i++) {
      const particle = addImage(this.scene, TEXTURE.PARTICLE_EVOL, 0, 0);

      this.particles.push(particle);
      this.particleContainer.add(particle);
    }
  }

  private startParticle() {
    this.setParticle();
    this.particleContainer.setVisible(true);

    const centerX = 0;
    const centerY = 0;

    for (const particle of this.particles) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.Between(1200, 2000);

      const targetX = centerX + Math.cos(angle) * distance;
      const targetY = centerY + Math.sin(angle) * distance;

      particle.setAlpha(1);
      particle.setScale(Phaser.Math.Between(3, 6));
      particle.setPosition(centerX, centerY);
      particle.setTintFill(0xffffff);

      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        duration: Phaser.Math.Between(3000, 5000),
        ease: EASE.QUINT_EASEOUT,
        onComplete: () => {
          particle.destroy();
        },
      });
    }
  }
}
