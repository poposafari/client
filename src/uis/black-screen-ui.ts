import i18next from 'i18next';
import { DEPTH, EASE, MODE, Season, TEXTSTYLE, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { getCurrentSeason } from '../utils/string-util';
import { addBackground, addImage, addText, Ui } from './ui';
import { GM } from '../core/game-manager';
import { KeyboardHandler } from '../handlers/keyboard-handler';

export class BlackScreenUi extends Ui {
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

    const bg = addBackground(this.scene, TEXTURE.BG_BLACK).setOrigin(0.5, 0.5);

    const season = getCurrentSeason();

    this.seasonSymbol = addImage(this.scene, TEXTURE.BLANK, 0, 0);
    this.seasonText0 = addText(this.scene, 0, -50, i18next.t(`menu:season_${season}_ch`), TEXTSTYLE.SEASON_SYMBOL).setScale(2);
    this.seasonText1 = addText(this.scene, 0, +50, i18next.t(`menu:season_${season}_en`), this.seasonToTextStyle()).setScale(0.7);

    this.container = this.createContainer(width / 2, height / 2);

    this.container.add(bg);
    this.container.add(this.seasonSymbol);
    this.container.add(this.seasonText0);
    this.container.add(this.seasonText1);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TOP);
    this.container.setScrollFactor(0);
  }

  async show(data?: any): Promise<void> {
    const elementsToAnimate = [this.seasonSymbol, this.seasonText0, this.seasonText1];

    this.handleKeyInput();

    elementsToAnimate.forEach((el) => el.setAlpha(0));
    this.container.setVisible(true);
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: elementsToAnimate,
        alpha: 1,
        duration: 1500,
        ease: EASE.LINEAR,
        onComplete: () => {
          this.scene.time.delayedCall(1500, () => {
            this.scene.tweens.add({
              targets: elementsToAnimate,
              alpha: 0,
              duration: 1500,
              ease: EASE.LINEAR,
              onComplete: () => {
                this.clean();
                GM.changeMode(MODE.OVERWORLD);
                resolve();
              },
            });
          });
        },
      });
    });
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {
    const keyboard = KeyboardHandler.getInstance();
    keyboard.setKeyDownCallback(() => {});
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
