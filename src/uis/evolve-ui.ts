import i18next from '../i18n';
import { Event } from '../core/manager/event-manager';
import { Game } from '../core/manager/game-manager';
import { Option } from '../core/storage/player-option';
import { AUDIO, DEPTH, EASE, EVENT, MessageEndDelay, TextSpeed, TEXTSTYLE, TEXTURE, UI } from '../enums';
import { PlayerPokemon } from '../obj/player-pokemon';
import { InGameScene } from '../scenes/ingame-scene';
import { getPokemonTextureFromPlayerPokemon, replacePercentSymbol } from '../utils/string-util';
import { TalkMessageUi } from './talk-message-ui';
import { delay, pauseSound, playEffectSound, resumeBackgroundMusic, runFadeEffect, stopBackgroundMusic, Ui } from './ui';

export class EvolveUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private particleContainer!: Phaser.GameObjects.Container;

  private talkUi!: TalkMessageUi;

  private startPokemon!: Phaser.GameObjects.Image;
  private nextPokemon!: Phaser.GameObjects.Image;
  private text!: Phaser.GameObjects.Text;
  private textWindow!: Phaser.GameObjects.NineSlice;
  private particles: Phaser.GameObjects.Image[] = [];

  private readonly pokemonScale: number = 2.8;

  private readonly baseWindowScale: number = 4;

  constructor(scene: InGameScene) {
    super(scene);

    this.talkUi = new TalkMessageUi(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.talkUi.setup();

    this.container = this.createTrackedContainer(width / 2, height / 2);
    this.particleContainer = this.createTrackedContainer(width / 2, height / 2);

    const bg = this.addBackground(TEXTURE.BG_EVOLVE).setOrigin(0.5, 0.5);
    this.startPokemon = this.addImage(getPokemonTextureFromPlayerPokemon('front', null), 0, 0).setScale(this.pokemonScale);
    this.nextPokemon = this.addImage(getPokemonTextureFromPlayerPokemon('front', null), 0, 0).setScale(this.pokemonScale);
    this.textWindow = this.addWindow(TEXTURE.WINDOW_MENU, 0, 410, 2000 / this.baseWindowScale, 260 / this.baseWindowScale, 16, 16, 16, 16).setScale(this.baseWindowScale);
    this.text = this.addText(-880, +340, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0).setScale(1);

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

  async show(data: { start: PlayerPokemon; next: string }): Promise<void> {
    runFadeEffect(this.scene, 800, 'in');

    stopBackgroundMusic();

    this.startPokemon.clearTint();
    this.nextPokemon.clearTint();

    this.startPokemon.setTexture(getPokemonTextureFromPlayerPokemon('front', data.start));
    this.nextPokemon.setTexture(`pokemon.front.${data.next}`);

    this.startPokemon.setVisible(true);
    this.nextPokemon.setVisible(false);

    this.container.setVisible(true);

    await this.talkUi.show({
      type: 'default',
      content: replacePercentSymbol(i18next.t('message:evolve_0'), [i18next.t(`pokemon:${data.start.getPokedex()}.name`)]),
      speed: Option.getTextSpeed()!,
      endDelay: MessageEndDelay.DEFAULT,
      end: async () => {
        this.showMessage(replacePercentSymbol(i18next.t('message:evolve_0'), [i18next.t(`pokemon:${data.next}.name`)]));

        playEffectSound(this.scene, `${data.start.getPokedex()}`);

        await delay(this.scene, 1000);

        await this.startEvolveAnimation(data.start.getPokedex(), data.next);

        resumeBackgroundMusic();
      },
    });
  }

  protected onClean(): void {
    runFadeEffect(this.scene, 800, 'in');
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  private showMessage(content: string) {
    this.text.setText(content);
    this.textWindow.setTexture(Option.getFrame('text') as string);
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

    this.startPokemon.setScale(this.pokemonScale).setVisible(true);
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

    playEffectSound(this.scene, `${next}`);

    this.nextPokemon.clearTint();
    await delay(this.scene, 1000);

    playEffectSound(this.scene, AUDIO.CONG);

    this.cleanText();

    await this.talkUi.show({
      type: 'default',
      content: replacePercentSymbol(i18next.t('message:evolve_1'), [i18next.t(`pokemon:${start}.name`), i18next.t(`pokemon:${next}.name`)]),
      speed: TextSpeed.CONG,
      endDelay: MessageEndDelay.CONG,
      end: async () => {
        await Game.removeUi(UI.EVOLVE);
      },
    });

    resumeBackgroundMusic();
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
          scale: this.pokemonScale,
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
        scale: this.pokemonScale,
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
      const particle = this.addImage(TEXTURE.PARTICLE_EVOL, 0, 0);

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
