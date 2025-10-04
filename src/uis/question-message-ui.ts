import { GM } from '../core/game-manager';
import { AUDIO, DEPTH, KEY, TEXTSTYLE, TEXTURE } from '../enums';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import i18next from '../i18n';
import { InGameScene } from '../scenes/ingame-scene';
import { Question } from '../types';
import { addImage, addText, addWindow, getTextStyle, playSound, Ui } from './ui';

export class QuestionMessageUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private questionContainer!: Phaser.GameObjects.Container;

  private window!: Phaser.GameObjects.NineSlice;
  private questionWindow!: Phaser.GameObjects.NineSlice;
  private text!: Phaser.GameObjects.Text;
  private dummys: Phaser.GameObjects.Image[] = [];
  private questionTexts: Phaser.GameObjects.Text[] = [];
  private arrowTexture!: TEXTURE | string;

  private readonly scale: number = 2;
  private readonly messageWindowWidth: number = 950;
  private readonly messageWindowHeight: number = 120;
  private readonly questionWindowWidth: number = 160;
  private readonly questionWindowHeight: number = 120;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const texts = [i18next.t('menu:yes'), i18next.t('menu:no')];

    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2 + 410);

    this.window = addWindow(this.scene, GM.getMsgWindow(), 0, 0, this.messageWindowWidth / this.scale, this.messageWindowHeight / this.scale, 16, 16, 16, 16).setScale(this.scale);
    this.text = addText(this.scene, -440, -35, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0);

    this.container.add(this.window);
    this.container.add(this.text);

    this.container.setScale(this.scale);
    this.container.setVisible(false);
    this.container.setDepth(DEPTH.MESSAGE);
    this.container.setScrollFactor(0);

    this.questionContainer = this.createContainer(width / 2 + 787, height / 2 + 155);
    this.questionWindow = addWindow(this.scene, TEXTURE.WINDOW_0, 0, 0, this.questionWindowWidth / this.scale, this.questionWindowHeight / this.scale, 16, 16, 16, 16).setScale(this.scale);
    this.questionContainer.add(this.questionWindow);

    const contentHeight = 30;
    const spacing = 10;
    let currentY = 0;

    for (const str of texts) {
      const text = addText(this.scene, -40, currentY - 18, str, TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5);
      const dummy = addImage(this.scene, TEXTURE.BLANK, -50, currentY - 20).setScale(1.4);

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
    if (data.type === 'sys') {
      this.window.setTexture(TEXTURE.WINDOW_SYS);
      this.questionWindow.setTexture(TEXTURE.WINDOW_SYS);
      this.text.setStyle(getTextStyle(TEXTSTYLE.MESSAGE_WHITE));
      this.questionTexts.forEach((value) => value.setStyle(getTextStyle(TEXTSTYLE.MESSAGE_WHITE)));
      this.arrowTexture = TEXTURE.ARROW_W;
    } else {
      this.window.setTexture(GM.getUserOption()?.getFrame('text') as string);
      this.questionWindow.setTexture(GM.getUserOption()?.getFrame('text') as string);
      this.text.setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLACK));
      this.questionTexts.forEach((value) => value.setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLACK)));
      this.arrowTexture = TEXTURE.ARROW_B;
    }

    playSound(this.scene, AUDIO.SELECT_0, GM.getUserOption()?.getEffectVolume());
    this.container.setVisible(true);

    await this.showText(data);

    return new Promise((resolve) => {
      let choice = 0;
      this.dummys[0].setTexture(this.arrowTexture);
      this.showQuestion(true);

      const keyboard = KeyboardHandler.getInstance();
      keyboard.setAllowKey([KEY.UP, KEY.DOWN, KEY.SELECT]);
      keyboard.setKeyDownCallback(async (key) => {
        let prevChoice = choice;

        switch (key) {
          case KEY.UP:
            if (choice > 0) choice--;
            break;
          case KEY.DOWN:
            if (choice < this.dummys.length - 1) choice++;
            break;
          case KEY.SELECT:
            keyboard.clearCallbacks();

            if (choice === 0) {
              this.clean();
              await data.yes();
              resolve(true);
            } else if (choice === 1) {
              this.clean();
              await data.no();
              resolve(false);
            }
            this.clean();
            return;
        }

        if (choice !== prevChoice) {
          playSound(this.scene, AUDIO.SELECT_0, GM.getUserOption()?.getEffectVolume());
          this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
          this.dummys[choice].setTexture(this.arrowTexture);
        }
      });
    });
  }

  clean(data?: any): void {
    this.text.text = '';
    this.container.setVisible(false);
    this.questionContainer.setVisible(false);
    // 선택 화살표 초기화
    this.dummys.forEach((d) => d.setTexture(TEXTURE.BLANK));
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  private async showText(question: Question) {
    const text = question.content.split('');
    let index = 0;
    let speed = question.speed;

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

  private showQuestion(onoff: boolean) {
    let result = true;

    if (!onoff) result = false;

    this.questionContainer.setVisible(result);
  }
}
