import { AUDIO, DEPTH, KEY, TEXTSTYLE, TEXTURE } from '../enums';
import { KeyboardManager } from '../core/manager/keyboard-manager';
import { Option } from '../core/storage/player-option';
import i18next from '../i18n';
import { InGameScene } from '../scenes/ingame-scene';
import { Question } from '../types';
import { addImage, addText, addWindow, getTextStyle, playEffectSound } from './ui';
import { MessageUi } from './message-ui';

export class QuestionMessageUi extends MessageUi {
  private questionContainer!: Phaser.GameObjects.Container;
  private questionWindow!: Phaser.GameObjects.NineSlice;
  private dummys: Phaser.GameObjects.Image[] = [];
  private questionTexts: Phaser.GameObjects.Text[] = [];
  private arrowTexture!: TEXTURE | string;

  private readonly questionWindowWidth: number = 160;
  private readonly questionWindowHeight: number = 120;

  setup(data?: any): void {
    super.setup(data);

    const width = this.getWidth();
    const height = this.getHeight();

    this.questionContainer = this.createTrackedContainer(width / 2 + 790, height / 2 + 150);
    this.questionWindow = this.addWindow(TEXTURE.WINDOW_0, 0, 0, this.questionWindowWidth / this.scale, this.questionWindowHeight / this.scale, 16, 16, 16, 16).setScale(this.scale);
    this.questionContainer.add(this.questionWindow);

    const texts = [i18next.t('menu:yes'), i18next.t('menu:no')];
    const contentHeight = 30;
    const spacing = 10;
    let currentY = 0;

    for (const str of texts) {
      const text = this.addText(-40, currentY - 18, str, TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5);
      const dummy = this.addImage(TEXTURE.BLANK, -50, currentY - 20).setScale(1.4);

      this.dummys.push(dummy);
      this.questionTexts.push(text);

      this.questionContainer.add(text);
      this.questionContainer.add(dummy);

      currentY += contentHeight + spacing;
    }

    this.questionContainer.setScale(this.scale);
    this.questionContainer.setVisible(false);
    this.questionContainer.setDepth(DEPTH.MESSAGE);
    this.questionContainer.setScrollFactor(0);
  }

  async show(data: Question): Promise<boolean> {
    this.setMessageStyle(data.type);

    if (data.type === 'sys') {
      this.questionWindow.setTexture(TEXTURE.WINDOW_SYS);
      this.questionTexts.forEach((value) => value.setStyle(getTextStyle(TEXTSTYLE.MESSAGE_WHITE)));
      this.arrowTexture = TEXTURE.ARROW_W;
    } else {
      this.questionWindow.setTexture(Option.getFrame('text') as string);
      this.questionTexts.forEach((value) => value.setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLACK)));
      this.arrowTexture = TEXTURE.ARROW_B;
    }

    playEffectSound(this.scene, AUDIO.SELECT_0);
    this.container.setVisible(true);

    await this.showText(data.content, data.speed);

    return new Promise((resolve) => {
      let choice = 0;
      this.dummys[0].setTexture(this.arrowTexture);
      this.showQuestion(true);

      const keyboard = KeyboardManager.getInstance();
      keyboard.setAllowKey([KEY.ARROW_UP, KEY.ARROW_DOWN, KEY.Z, KEY.ENTER]);
      const callback = async (key: KEY) => {
        let prevChoice = choice;

        switch (key) {
          case KEY.ARROW_UP:
            if (choice > 0) choice--;
            break;
          case KEY.ARROW_DOWN:
            if (choice < this.dummys.length - 1) choice++;
            break;
          case KEY.ENTER:
          case KEY.Z:
            keyboard.clearCallbacks();
            this.container.setVisible(false);
            this.questionContainer.setVisible(false);
            this.text.text = '';
            this.textObjects.forEach((obj) => obj.destroy());
            this.textObjects = [];
            this.dummys.forEach((d) => d.setTexture(TEXTURE.BLANK));

            if (choice === 0) {
              await data.yes();
              resolve(true);
            } else if (choice === 1) {
              await data.no();
              resolve(false);
            }
            return;
        }

        if (choice !== prevChoice) {
          playEffectSound(this.scene, AUDIO.SELECT_0);
          this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
          this.dummys[choice].setTexture(this.arrowTexture);
        }
      };
      keyboard.setKeyDownCallback(callback);
      this.trackKeyboardCallback(() => keyboard.clearCallbacks());
    });
  }

  protected onClean(): void {
    super.onClean();
    this.dummys.forEach((d) => d.setTexture(TEXTURE.BLANK));
  }

  private showQuestion(onoff: boolean) {
    this.questionContainer.setVisible(onoff);
  }
}
