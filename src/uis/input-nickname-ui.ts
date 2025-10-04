import InputText from 'phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText';
import { addText, addTextInput, addWindow, Ui } from './ui';
import { InGameScene } from '../scenes/ingame-scene';
import { DEPTH, KEY, TEXTSTYLE, TEXTURE } from '../enums';
import i18next from '../i18n';
import { InputNickname } from '../types';
import { KeyboardHandler } from '../handlers/keyboard-handler';

export class InputNicknameUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private btnContainer!: Phaser.GameObjects.Container;
  private title!: Phaser.GameObjects.Text;
  private input!: InputText;
  private btnWindows: Phaser.GameObjects.NineSlice[] = [];
  private btnTitles: Phaser.GameObjects.Text[] = [];

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

    const window = addWindow(this.scene, TEXTURE.WINDOW_MENU, 0, 0, this.windowWidth / this.scale, this.windowHeight / this.scale, 16, 16, 16, 16).setScale(this.scale);
    this.title = addText(this.scene, 0, -110, '', TEXTSTYLE.MESSAGE_BLACK).setScale(1);
    const inputWindow = addWindow(this.scene, TEXTURE.WINDOW_MENU, 0, 0, (this.windowWidth - 400) / this.inputScale, 100 / this.inputScale, 16, 16, 16, 16).setScale(this.inputScale);

    this.input = addTextInput(this.scene, -260, 0, 1300, 200, TEXTSTYLE.MESSAGE_BLACK, {
      type: 'text',
      minLength: 1,
      maxLength: 16,
      placeholder: i18next.t('menu:nickname'),
    })
      .setScale(0.5)
      .setOrigin(0, 0.5);

    this.btnWindows[0] = addWindow(this.scene, TEXTURE.WINDOW_MENU, -170, 0, 220 / this.btnScale, 90 / this.btnScale, 16, 16, 16, 16)
      .setScale(this.btnScale)
      .setInteractive({ cursor: 'pointer' });
    this.btnWindows[1] = addWindow(this.scene, TEXTURE.WINDOW_MENU, +170, 0, 220 / this.btnScale, 90 / this.btnScale, 16, 16, 16, 16)
      .setScale(this.btnScale)
      .setInteractive({ cursor: 'pointer' });

    this.btnTitles[0] = addText(this.scene, -170, 0, i18next.t('menu:change'), TEXTSTYLE.MESSAGE_BLACK);
    this.btnTitles[1] = addText(this.scene, +170, 0, i18next.t('menu:cancel'), TEXTSTYLE.MESSAGE_BLACK);
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
    this.btnContainer.setVisible(true);
    this.container.setVisible(true);

    this.title.setText(data.title);

    this.input.text = data.content;

    this.pause(false);

    return new Promise((resolve) => {
      const keyboard = KeyboardHandler.getInstance();
      const keys = [KEY.ENTER, KEY.CANCEL];
      keyboard.setAllowKey(keys);
      keyboard.setKeyDownCallback((key) => {
        switch (key) {
          case KEY.CANCEL:
            this.clean();
            resolve(i18next.t('menu:cancel'));
            break;
          case KEY.ENTER:
            this.clean();
            resolve(this.input.text);
            break;
        }
      });

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
        this.clean();
        resolve(this.input.text);
      });
      this.btnWindows[1].on('pointerup', () => {
        console.log('?');
        this.clean();
        resolve(i18next.t('menu:cancel'));
      });
    });
  }

  clean(data?: any): void {
    this.pause(true);

    for (const btn of this.btnWindows) {
      btn.removeAllListeners();
    }

    this.btnContainer.setVisible(false);
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
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
