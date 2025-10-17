import { eventBus } from '../core/event-bus';
import { GM } from '../core/game-manager';
import { AUDIO, DEPTH, EVENT, KEY, TEXTSTYLE, TEXTURE } from '../enums';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import i18next from '../i18n';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, getTextStyle, playSound, Ui } from './ui';

export class MenuUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private window!: Phaser.GameObjects.NineSlice;
  private menus: Phaser.GameObjects.Text[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];
  private etcImgs: Phaser.GameObjects.Image[] = [];
  private etcTexts: Phaser.GameObjects.Text[] = [];

  private info: string[] = [];
  private readonly contentHeight: number = 30;
  private readonly spacing: number = 10;
  private readonly windowWidth: number = 270;
  private readonly scale: number = 2;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(texts: string[]): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.info.push(...texts);
    this.container = this.createContainer(width / 2 + 410, height / 2 + 530);

    this.container.setScale(this.scale);
    this.container.setVisible(false);
    this.container.setDepth(DEPTH.MENU);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    const lineHeight = this.contentHeight + this.spacing;

    let currentY = -lineHeight * (this.info.length - 1);
    currentY -= 15;

    this.menus.forEach((menu) => {
      menu.destroy();
    });

    this.dummys.forEach((dummy) => {
      dummy.destroy();
    });

    this.etcImgs.forEach((img) => {
      img.destroy();
    });

    this.etcTexts.forEach((text) => {
      text.destroy();
    });

    this.dummys = [];
    this.menus = [];
    this.etcImgs = [];
    this.etcTexts = [];

    if (this.container) {
      this.container.removeAll(true);
    }

    this.window = addWindow(this.scene, TEXTURE.WINDOW_MENU, 0, 0, 0, 0, 16, 16, 16, 16);
    this.window.setOrigin(0, 1);
    this.window.setScale(this.scale);

    this.container.add(this.window);

    for (const info of this.info) {
      const text = addText(this.scene, +40, currentY, info, TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 1);
      const dummy = addImage(this.scene, TEXTURE.BLANK, +20, currentY).setOrigin(0, 1);
      const etcTexts = addText(this.scene, text.displayWidth + text.x + 33, currentY - 5, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 1);
      const etcImgs = addImage(this.scene, TEXTURE.BLANK, text.displayWidth + text.x + 10, currentY - 8).setOrigin(0, 1);

      dummy.setScale(1.6);

      this.menus.push(text);
      this.dummys.push(dummy);
      this.etcTexts.push(etcTexts);
      this.etcImgs.push(etcImgs);

      this.container.add(text);
      this.container.add(dummy);
      this.container.add(etcTexts);
      this.container.add(etcImgs);

      currentY += lineHeight;
    }

    const totalHeight = lineHeight * this.info.length + this.spacing + this.spacing + this.spacing;

    this.window.setSize(this.windowWidth / this.scale, totalHeight / this.scale);

    this.container.setVisible(true);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  async handleKeyInput(data?: any): Promise<string> {
    const keys = [KEY.DOWN, KEY.UP, KEY.SELECT, KEY.CANCEL];
    const keyboard = KeyboardHandler.getInstance();

    let start = 0;
    let end = this.info.length - 1;
    let choice = start;

    this.dummys[choice].setTexture(TEXTURE.ARROW_B);

    return new Promise((resolve) => {
      keyboard.setAllowKey(keys);
      keyboard.setKeyDownCallback(async (key) => {
        const prevChoice = choice;

        try {
          switch (key) {
            case KEY.UP:
              choice = Math.max(start, choice - 1);
              break;
            case KEY.DOWN:
              choice = Math.min(end, choice + 1);
              break;
            case KEY.SELECT:
              if (this.menus[choice].style.color !== '#999999') {
                this.clean();
                return resolve(this.info[choice]);
              }
              playSound(this.scene, AUDIO.BUZZER, GM.getUserOption()?.getEffectVolume());

              break;
            case KEY.CANCEL:
              this.clean();
              return resolve(i18next.t('menu:cancelMenu'));
          }

          if (key === KEY.UP || key === KEY.DOWN) {
            if (choice !== prevChoice) {
              playSound(this.scene, AUDIO.SELECT_0, GM.getUserOption()?.getEffectVolume());

              this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
              this.dummys[choice].setTexture(TEXTURE.ARROW_B);
            }
          }
        } catch (error) {
          console.error(`Error handling key input: ${error}`);
        }
      });
    });
  }

  updateInfo(from: string, to: string) {
    for (let i = 0; i < this.info.length; i++) {
      const target = this.info[i];

      if (target === from) {
        this.info[i] = to;
      }
    }
  }

  update(time?: number, delta?: number): void {}

  updateInfoColor(target: string, style: TEXTSTYLE) {
    for (const menu of this.menus) {
      if (menu.text === target) {
        menu.setStyle(getTextStyle(style));
      }
    }
  }

  updateEtc(target: string, texture: TEXTURE, text: string, scaleImg: number = 1, scaleText: number = 1) {
    let i = 0;
    for (const menu of this.menus) {
      if (menu.text === target) {
        console.log();
        this.etcImgs[i].setTexture(texture).setScale(scaleImg);
        this.etcTexts[i].setText(text).setScale(scaleText);
      }
      i++;
    }
  }
}
