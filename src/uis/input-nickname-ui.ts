import InputText from 'phaser3-rex-plugins/plugins/inputtext';
import { DEPTH } from '../enums/depth';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addText, addTextInput, addWindow, Ui } from './ui';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import { KEY } from '../enums/key';
import { eventBus } from '../core/event-bus';
import { EVENT } from '../enums/event';
import i18next from 'i18next';
import { InputNicknameData } from '../types';

export class InputNicknameUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private bgContainer!: Phaser.GameObjects.Container;
  private title!: Phaser.GameObjects.Text;
  private input!: InputText;
  private submitBtn!: Phaser.GameObjects.NineSlice;
  private cancelBtn!: Phaser.GameObjects.NineSlice;

  private readonly windowWidth: number = 1100;
  private readonly windowHeight: number = 420;
  private readonly scale: number = 4;
  private readonly inputScale: number = 2;
  private readonly btnScale: number = 2;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);
    this.bgContainer = this.createContainer(width / 2, height / 2);

    const bg = addBackground(this.scene, TEXTURE.BLACK).setOrigin(0.5, 0.5);
    bg.setAlpha(0.5);

    const window = addWindow(this.scene, TEXTURE.WINDOW_2, 0, 0, this.windowWidth / this.scale, this.windowHeight / this.scale, 16, 16, 16, 16).setScale(this.scale);
    this.title = addText(this.scene, 0, -110, '', TEXTSTYLE.MESSAGE_BLACK);
    this.title.setScale(1);
    const inputWindow = addWindow(this.scene, TEXTURE.WINDOW_1, 0, 0, (this.windowWidth - 400) / this.inputScale, 50, 16, 16, 16, 16).setScale(this.inputScale);

    this.input = addTextInput(this.scene, -320, 0, 1300, 600, TEXTSTYLE.MESSAGE_BLACK, {
      type: 'text',
      minLength: 1,
      maxLength: 20,
      placeholder: i18next.t('menu:nickname'),
    });

    this.submitBtn = addWindow(this.scene, TEXTURE.WINDOW_2, -170, 115, 220 / this.btnScale, 90 / this.btnScale, 16, 16, 16, 16).setScale(this.btnScale);
    this.cancelBtn = addWindow(this.scene, TEXTURE.WINDOW_2, +170, 115, 220 / this.btnScale, 90 / this.btnScale, 16, 16, 16, 16).setScale(this.btnScale);

    const submitBtnTitle = addText(this.scene, -170, 115, i18next.t('menu:change'), TEXTSTYLE.MESSAGE_BLACK);
    const cancelBtnTitle = addText(this.scene, +170, 115, i18next.t('menu:cancel'), TEXTSTYLE.MESSAGE_BLACK);
    submitBtnTitle.setScale(0.7);
    cancelBtnTitle.setScale(0.7);
    this.input.setScale(0.6);
    this.input.setOrigin(0, 0.5);

    this.container.add(window);
    this.container.add(this.title);
    this.container.add(inputWindow);
    this.container.add(this.input);
    this.container.add(this.submitBtn);
    this.container.add(this.cancelBtn);
    this.container.add(submitBtnTitle);
    this.container.add(cancelBtnTitle);

    this.bgContainer.add(bg);

    this.bgContainer.setVisible(false);
    this.bgContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.bgContainer.setScrollFactor(0);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 3);
    this.container.setScrollFactor(0);
  }

  show(data: InputNicknameData): void {
    this.bgContainer.setVisible(true);
    this.container.setVisible(true);

    this.input.pointerEvents = 'auto';

    if (data.type === 'pokemon') {
      this.title.setText(i18next.t('menu:changePokemonName'));
    } else if (data.type === 'box') {
      this.title.setText(i18next.t('menu:changeBoxName'));
    }
    this.input.text = data.base;

    eventBus.emit(EVENT.SHOW_MODE_STACK);
    this.handleKeyInput();
    this.scene.input.keyboard?.disableGlobalCapture();
  }

  clean(data?: any): void {
    this.scene.input.keyboard?.enableGlobalCapture();

    this.input.setBlur();
    this.input.pointerEvents = 'none';
    this.input.text = '';

    this.bgContainer.setVisible(false);
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {
    const keyboard = KeyboardHandler.getInstance();
    const keys = [KEY.ENTER, KEY.CANCEL];

    keyboard.setAllowKey(keys);
    keyboard.setKeyDownCallback((key) => {
      switch (key) {
        case KEY.CANCEL:
          this.clean();
          eventBus.emit(EVENT.POP_MODE);
          eventBus.emit(EVENT.RESTORE_POKEBOX_KEYHANDLE);
          break;
      }
    });
  }

  update(time?: number, delta?: number): void {}
}
