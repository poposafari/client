import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, getTextStyle, playSound, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { KEY } from '../enums/key';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import { eventBus } from '../core/event-bus';
import { EVENT } from '../enums/event';
import { AUDIO } from '../enums/audio';

export class MenuUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private window!: Phaser.GameObjects.NineSlice;
  private menus: Phaser.GameObjects.Text[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];

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

    this.dummys = [];
    this.menus = [];

    if (this.container) {
      this.container.removeAll(true);
    }

    this.window = addWindow(this.scene, TEXTURE.WINDOW_2, 0, 0, 0, 0, 16, 16, 16, 16);
    this.window.setOrigin(0, 1);
    this.window.setScale(this.scale);

    this.container.add(this.window);

    for (const info of this.info) {
      const text = addText(this.scene, +40, currentY, info, TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 1);
      const dummy = addImage(this.scene, TEXTURE.BLANK, +20, currentY).setOrigin(0, 1);
      dummy.setScale(1.6);

      this.menus.push(text);
      this.dummys.push(dummy);

      this.container.add(text);
      this.container.add(dummy);

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

    this.dummys[choice].setTexture(TEXTURE.ARROW_B_R);

    return new Promise((resolve) => {
      keyboard.setAllowKey(keys);
      keyboard.setKeyDownCallback(async (key) => {
        const prevChoice = choice;

        eventBus.emit(EVENT.PLAY_SOUND, this.scene, key);

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
              playSound(this.scene, AUDIO.BUZZER);
              break;
            // if()
            case KEY.CANCEL:
              this.clean();
              return resolve(i18next.t('menu:cancelMenu'));
              break;
          }

          if (key === KEY.UP || key === KEY.DOWN) {
            if (choice !== prevChoice) {
              this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
              this.dummys[choice].setTexture(TEXTURE.ARROW_B_R);
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
}
