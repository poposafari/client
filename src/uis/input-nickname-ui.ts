import InputText from 'phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText';
import { addText, addTextInput, addWindow, Ui } from './ui';
import { InGameScene } from '../scenes/ingame-scene';
import { DEPTH, KEY, TEXTSTYLE, TEXTURE } from '../enums';
import i18next from '../i18n';
import { InputNickname } from '../types';
import { Keyboard, KeyboardManager } from '../core/manager/keyboard-manager';

export class InputNicknameUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private btnContainer!: Phaser.GameObjects.Container;
  private title!: Phaser.GameObjects.Text;
  private input!: InputText;
  private btnWindows: Phaser.GameObjects.NineSlice[] = [];
  private btnTitles: Phaser.GameObjects.Text[] = [];

  private enterKey!: Phaser.Input.Keyboard.Key;
  private escKey!: Phaser.Input.Keyboard.Key;

  private readonly windowWidth: number = 1000;
  private readonly windowHeight: number = 410;
  private readonly scale: number = 6;
  private readonly inputScale: number = 4;
  private readonly btnScale: number = 4;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);
    this.btnContainer = this.createContainer(width / 2, height / 2 + 110);

    const window = this.addWindow(TEXTURE.WINDOW_MENU, 0, 0, this.windowWidth / this.scale, this.windowHeight / this.scale, 16, 16, 16, 16).setScale(this.scale);
    this.title = this.addText(0, -110, '', TEXTSTYLE.MESSAGE_BLACK).setScale(1);
    const inputWindow = this.addWindow(TEXTURE.WINDOW_MENU, 0, 0, (this.windowWidth - 400) / this.inputScale, 100 / this.inputScale, 16, 16, 16, 16).setScale(this.inputScale);

    this.input = this.addTextInput(-260, 0, 1300, 200, TEXTSTYLE.MESSAGE_BLACK, {
      type: 'text',
      minLength: 1,
      maxLength: 16,
      placeholder: i18next.t('menu:nickname'),
    })
      .setScale(0.5)
      .setOrigin(0, 0.5);

    this.btnWindows[0] = this.addWindow(TEXTURE.WINDOW_MENU, -170, 0, 220 / this.btnScale, 90 / this.btnScale, 16, 16, 16, 16)
      .setScale(this.btnScale)
      .setInteractive({ cursor: 'pointer' });
    this.btnWindows[1] = this.addWindow(TEXTURE.WINDOW_MENU, +170, 0, 220 / this.btnScale, 90 / this.btnScale, 16, 16, 16, 16)
      .setScale(this.btnScale)
      .setInteractive({ cursor: 'pointer' });

    this.btnTitles[0] = this.addText(-170, 0, i18next.t('menu:change'), TEXTSTYLE.MESSAGE_BLACK);
    this.btnTitles[1] = this.addText(+170, 0, i18next.t('menu:cancel'), TEXTSTYLE.MESSAGE_BLACK);
    this.btnTitles[0].setScale(0.7);
    this.btnTitles[1].setScale(0.7);

    this.container.add(window);
    this.container.add(this.title);
    this.container.add(inputWindow);
    this.container.add(this.input);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 3);
    this.container.setScrollFactor(0);

    this.btnContainer.add(this.btnWindows[0]);
    this.btnContainer.add(this.btnWindows[1]);
    this.btnContainer.add(this.btnTitles[0]);
    this.btnContainer.add(this.btnTitles[1]);

    this.btnContainer.setVisible(false);
    this.btnContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 3);
    this.btnContainer.setScrollFactor(0);

    this.handleMouseBtn();
  }

  async show(data: InputNickname): Promise<string> {
    Keyboard.setKeyDownCallback(() => {});
    Keyboard.clearAllowKey();

    this.btnContainer.setActive(true);
    this.btnContainer.setVisible(true);
    this.container.setActive(true);
    this.container.setVisible(true);

    this.title.setText(data.title);
    this.input.text = data.content || '';

    this.pause(false);

    return new Promise((resolve) => {
      let resolved = false;
      const resolveOnce = (value: string) => {
        if (!resolved) {
          resolved = true;
          this.hide();
          if (this.enterKey) {
            this.enterKey.removeAllListeners();
          }
          if (this.escKey) {
            this.escKey.removeAllListeners();
          }
          resolve(value);
        }
      };

      const keyboard = this.scene.input.keyboard;
      if (!keyboard) {
        resolveOnce(i18next.t('menu:cancel'));
        return;
      }

      this.enterKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      this.escKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

      const handleEnter = () => {
        if (!resolved) {
          resolveOnce(this.input.text);
        }
      };

      const handleEsc = () => {
        if (!resolved) {
          resolveOnce(i18next.t('menu:cancel'));
        }
      };

      this.enterKey.on('down', handleEnter);
      this.escKey.on('down', handleEsc);

      for (const btn of this.btnWindows) {
        btn.removeAllListeners();
      }

      this.btnWindows[0].on('pointerover', () => {
        this.btnWindows[0].setTint(0xcccccc);
      });
      this.btnWindows[1].on('pointerover', () => {
        this.btnWindows[1].setTint(0xcccccc);
      });

      this.btnWindows[0].on('pointerout', () => {
        this.btnWindows[0].clearTint();
      });
      this.btnWindows[1].on('pointerout', () => {
        this.btnWindows[1].clearTint();
      });

      this.btnWindows[0].on('pointerup', () => {
        resolveOnce(this.input.text);
      });
      this.btnWindows[1].on('pointerup', () => {
        resolveOnce(i18next.t('menu:cancel'));
      });
    });
  }

  protected onClean(): void {
    this.pause(true);

    Keyboard.setKeyDownCallback(() => {});

    if (this.enterKey) {
      this.enterKey.removeAllListeners();
      this.enterKey.destroy();
    }
    if (this.escKey) {
      this.escKey.removeAllListeners();
      this.escKey.destroy();
    }

    for (const btn of this.btnWindows) {
      btn.removeAllListeners();
    }

    this.btnContainer.setVisible(false);
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  hide(): void {
    if (this.btnContainer) {
      this.btnContainer.setVisible(false);
    }
    if (this.container) {
      this.container.setVisible(false);
    }
  }

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  private block() {
    for (const btn of this.btnWindows) {
      btn.disableInteractive();
    }
    this.input.setBlur();
    this.input.pointerEvents = 'none';
  }

  private unblock() {
    for (const btn of this.btnWindows) {
      btn.setInteractive().setScrollFactor(0);
    }
    this.input.pointerEvents = 'auto';
  }

  private handleMouseBtn() {}
}
