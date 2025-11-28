import { AUDIO, DEPTH, KEY, TEXTSTYLE, TEXTURE } from '../enums';
import { KeyboardManager } from '../core/manager/keyboard-manager';
import i18next from '../i18n';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, getTextStyle, playEffectSound, Ui } from './ui';
import { Option } from '../core/storage/player-option';

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
    this.info = [...texts];

    if (!this.container) {
      this.container = this.createContainer(width / 2 + 410, height / 2 + 530);
      this.container.setScale(this.scale);
      this.container.setDepth(DEPTH.MENU);
      this.container.setScrollFactor(0);
    }

    this.container.setVisible(false);
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

    this.window = this.addWindow(Option.getFrame('text') as TEXTURE, 0, 0, 0, 0, 16, 16, 16, 16);
    this.window.setOrigin(0, 1);
    this.window.setScale(this.scale);

    this.container.add(this.window);

    for (const info of this.info) {
      const text = this.addText(+40, currentY, info, TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 1);
      const dummy = this.addImage(TEXTURE.BLANK, +20, currentY).setOrigin(0, 1);
      const etcTexts = this.addText(text.displayWidth + text.x + 33, currentY - 5, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 1);
      const etcImgs = this.addImage(TEXTURE.BLANK, text.displayWidth + text.x + 10, currentY - 8).setOrigin(0, 1);

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

  protected onClean(): void {
    if (this.container) {
      this.container.setVisible(false);
    }
  }

  hide(): void {
    if (this.container) {
      this.container.setVisible(false);
    }
  }

  pause(onoff: boolean, data?: any): void {}

  async handleKeyInput(data?: any): Promise<string> {
    const keys = [KEY.ARROW_DOWN, KEY.ARROW_UP, KEY.Z, KEY.ENTER, KEY.X, KEY.ESC];
    const keyboard = KeyboardManager.getInstance();

    if (this.dummys.length === 0 || !this.container.visible) {
      this.show();
    }

    let start = 0;
    let end = this.info.length - 1;
    let choice = start;

    if (this.dummys[choice]) {
      this.dummys[choice].setTexture(TEXTURE.ARROW_B);
    }

    return new Promise((resolve) => {
      keyboard.setAllowKey(keys);
      keyboard.setKeyDownCallback(async (key) => {
        const prevChoice = choice;

        try {
          switch (key) {
            case KEY.ARROW_UP:
              choice = Math.max(start, choice - 1);
              break;
            case KEY.ARROW_DOWN:
              choice = Math.min(end, choice + 1);
              break;
            case KEY.ENTER:
            case KEY.Z:
              if (this.menus[choice].style.color !== '#999999') {
                this.hide();
                return resolve(this.info[choice]);
              }
              playEffectSound(this.scene, AUDIO.BUZZER);

              break;
            case KEY.ESC:
            case KEY.X:
              this.hide();
              return resolve(i18next.t('menu:cancelMenu'));
          }

          if (key === KEY.ARROW_UP || key === KEY.ARROW_DOWN) {
            if (choice !== prevChoice) {
              playEffectSound(this.scene, AUDIO.SELECT_0);

              if (this.dummys[prevChoice]) {
                this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
              }
              if (this.dummys[choice]) {
                this.dummys[choice].setTexture(TEXTURE.ARROW_B);
              }
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
