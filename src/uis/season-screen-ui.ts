import i18next from 'i18next';
import { DEPTH, EASE, Season, TEXTSTYLE, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { getCurrentSeason } from '../utils/string-util';
import { Ui } from './ui';
import { KeyboardManager } from '../core/manager/keyboard-manager';

export class SeasonScreenUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private seasonSymbol!: Phaser.GameObjects.Image;
  private seasonText0!: Phaser.GameObjects.Text;
  private seasonText1!: Phaser.GameObjects.Text;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    const bg = this.addBackground(TEXTURE.BG_BLACK).setOrigin(0.5, 0.5);

    const season = getCurrentSeason();

    this.seasonSymbol = this.addImage(TEXTURE.BLANK, 0, 0);
    this.seasonText0 = this.addText(0, -50, i18next.t(`menu:season_${season}_ch`), TEXTSTYLE.SEASON_SYMBOL).setScale(2);
    this.seasonText1 = this.addText(0, +50, i18next.t(`menu:season_${season}_en`), this.seasonToTextStyle()).setScale(0.7);

    this.container = this.createTrackedContainer(width / 2, height / 2);

    this.container.add(bg);
    this.container.add(this.seasonSymbol);
    this.container.add(this.seasonText0);
    this.container.add(this.seasonText1);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TOP);
    this.container.setScrollFactor(0);
  }

  async show(data?: any): Promise<void> {
    const bg = this.container.list[0] as Phaser.GameObjects.Image;
    const elementsToAnimate = [this.seasonSymbol, this.seasonText0, this.seasonText1];

    this.handleKeyInput();

    elementsToAnimate.forEach((el) => el.setAlpha(0));
    this.container.setVisible(true);

    return new Promise((resolve) => {
      const tween1 = this.scene.tweens.add({
        targets: elementsToAnimate,
        alpha: 1,
        duration: 1500,
        ease: EASE.LINEAR,
        onComplete: () => {
          const timer = this.scene.time.delayedCall(1500, () => {
            const tween2 = this.scene.tweens.add({
              targets: elementsToAnimate,
              alpha: 0,
              duration: 1500,
              ease: EASE.LINEAR,
              onComplete: () => {
                this.onClean();
                resolve();
              },
            });
            this.trackTween(tween2);
          });
          this.trackTimer(timer);
        },
      });
      this.trackTween(tween1);
    });
  }

  protected onClean(): void {}

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {
    const keyboard = KeyboardManager.getInstance();
    const callback = () => {};
    keyboard.setKeyDownCallback(callback);
    this.trackKeyboardCallback(callback);
  }

  update(time?: number, delta?: number): void {}

  private seasonToTextStyle(): TEXTSTYLE {
    const season = getCurrentSeason();

    switch (season) {
      case Season.SPRING:
        return TEXTSTYLE.SPRING;
      case Season.SUMMER:
        return TEXTSTYLE.SUMMER;
      case Season.FALL:
        return TEXTSTYLE.FALL;
      case Season.WINTER:
        return TEXTSTYLE.WINTER;
      default:
        return TEXTSTYLE.SPRING;
    }
  }
}
