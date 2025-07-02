import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { Global } from '../storage/global';
import { Message } from '../types';
import { replacePercentSymbol } from '../utils/string-util';
import { addBackground, addImage, addText, addWindow, createSprite, delay, pauseSound, playSound, runFadeEffect, Ui } from './ui';
import { eventBus } from '../core/event-bus';
import { EVENT } from '../enums/event';
import { MODE } from '../enums/mode';
import { InGameScene } from '../scenes/ingame-scene';
import { EASE } from '../enums/ease';
import { AUDIO } from '../enums/audio';

export class EvolveUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private particleContainer!: Phaser.GameObjects.Container;

  private startPokemon!: Phaser.GameObjects.Image;
  private nextPokemon!: Phaser.GameObjects.Image;
  private text!: Phaser.GameObjects.Text;
  private textWindow!: Phaser.GameObjects.NineSlice;
  private particles: Phaser.GameObjects.Image[] = [];

  private readonly baseWindowScale: number = 4;

  constructor(scene: InGameScene) {
    super(scene);

    eventBus.on(EVENT.START_EVOLVE_ANIMATION, () => {
      this.startEvolveAnimation();
    });

    eventBus.on(EVENT.FINISH_EVOLVE, () => {
      runFadeEffect(scene, 500, 'in');
      eventBus.emit(EVENT.POP_MODE);
      eventBus.emit(EVENT.RESTORE_POKEBOX_KEYHANDLE);
    });
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);
    this.particleContainer = this.createContainer(width / 2, height / 2);

    const bg = addBackground(this.scene, TEXTURE.BG_EVOLVE).setOrigin(0.5, 0.5);
    this.startPokemon = addImage(this.scene, `pokemon_sprite0000`, 0, 0).setScale(4.8);
    this.nextPokemon = addImage(this.scene, `pokemon_sprite0000`, 0, 0).setScale(4.8);
    this.textWindow = addWindow(this.scene, TEXTURE.WINDOW_2, 0, 410, 1900 / this.baseWindowScale, 240 / this.baseWindowScale, 16, 16, 16, 16).setScale(this.baseWindowScale);
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

  show(data?: any): void {
    const evolveData: any[] = Global.getInstance().getEvolveData();
    runFadeEffect(this.scene, 500, 'in');

    this.startPokemon.clearTint();
    this.nextPokemon.clearTint();

    this.startPokemon.setTexture(evolveData[0]);
    this.nextPokemon.setTexture(evolveData[1]);

    this.startPokemon.setVisible(true);
    this.nextPokemon.setVisible(false);

    eventBus.emit(EVENT.OVERLAP_MODE, MODE.MESSAGE, [
      {
        type: 'battle',
        format: 'talk',
        content: replacePercentSymbol(i18next.t('message:evolve_0'), [i18next.t(`pokemon:${evolveData[2]}.name`)]),
        speed: 20,
        end: EVENT.START_EVOLVE_ANIMATION,
      },
    ]);

    this.showMessage({
      type: 'battle',
      format: 'talk',
      content: replacePercentSymbol(i18next.t('message:evolve_0'), [i18next.t(`pokemon:${evolveData[2]}.name`)]),
      speed: 20,
    });

    this.container.setVisible(true);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  private showMessage(message: Message) {
    const text = message.content.split('');

    this.textWindow.setVisible(true);

    let index = 0;
    let speed = message.speed;

    return new Promise((resolve) => {
      const addNextChar = () => {
        if (index < text.length) {
          this.text.text += text[index];
          index++;
          this.scene.time.delayedCall(speed, addNextChar, [], this);
        } else {
          resolve(true);
        }
      };
      addNextChar();
    });
  }

  private cleanText() {
    this.text.text = '';
    this.textWindow.setVisible(false);
  }

  private async startEvolveAnimation() {
    const evolveData: any[] = Global.getInstance().getEvolveData();

    playSound(this.scene, AUDIO.EVOL_INTRO);

    await delay(this.scene, 900);

    playSound(this.scene, AUDIO.EVOL);

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
    playSound(this.scene, AUDIO.HATCH);

    await delay(this.scene, 1000);

    pauseSound(this.scene, true);
    playSound(this.scene, AUDIO.CONG);

    this.nextPokemon.clearTint();

    this.cleanText();

    eventBus.emit(EVENT.OVERLAP_MODE, MODE.MESSAGE, [
      {
        type: 'battle',
        format: 'talk',
        content: replacePercentSymbol(i18next.t('message:evolve_1'), [i18next.t(`pokemon:${evolveData[2]}.name`), i18next.t(`pokemon:${evolveData[3]}.name`)]),
        speed: 20,
        endDelay: 2000,
        end: EVENT.FINISH_EVOLVE,
      },
    ]);
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
