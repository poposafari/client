import i18next from 'i18next';
import { eventBus } from '../core/event-bus';
import { ANIMATION } from '../enums/animation';
import { AUDIO } from '../enums/audio';
import { DEPTH } from '../enums/depth';
import { EVENT, isEvent } from '../enums/event';
import { KEY } from '../enums/key';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, createSprite, playSound, Ui } from './ui';
import { isMode, MODE } from '../enums/mode';
import { PlayerInfo } from '../storage/player-info';
import { Message } from '../types';

export class MessageUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private endMarkContainer!: Phaser.GameObjects.Container;
  private questionContainer!: Phaser.GameObjects.Container;

  private window!: Phaser.GameObjects.NineSlice;
  private text!: Phaser.GameObjects.Text;
  private endMark!: Phaser.GameObjects.Sprite;
  private questionDummys: Phaser.GameObjects.Image[] = [];

  private readonly scale: number = 2;
  private readonly messageWindowWidth: number = 950;
  private readonly messageWindowHeight: number = 120;
  private readonly questionWindowWidth: number = 160;
  private readonly questionWindowHeight: number = 120;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.setupEndMark(width, height);
    this.setupQuestion(width, height);

    this.container = this.createContainer(width / 2, height / 2 + 410);

    this.window = addWindow(this.scene, TEXTURE.WINDOW_2, 0, 0, this.messageWindowWidth / this.scale, this.messageWindowHeight / this.scale, 16, 16, 16, 16).setScale(this.scale);
    this.text = addText(this.scene, -440, -35, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0);

    this.container.add(this.window);
    this.container.add(this.text);

    this.container.setScale(this.scale);
    this.container.setVisible(false);
    this.container.setDepth(DEPTH.MESSAGE);
    this.container.setScrollFactor(0);
  }

  async show(data: Message[]) {
    for (const message of data) {
      let result;
      playSound(this.scene, AUDIO.SELECT_0);
      this.container.setVisible(true);

      if (message.format === 'talk') result = await this.showTalkMessage(message);
      else if (message.format === 'question') {
        result = await this.showQuestionMessage(message);
        if (!result) {
          if (message.questionNo) {
            eventBus.emit(EVENT.POP_MODE);
            eventBus.emit(message.questionNo);
            return;
          }
        } else {
          if (message.questionYes) {
            eventBus.emit(EVENT.POP_MODE);
            eventBus.emit(message.questionYes);
            return;
          }
        }
      }

      if (message.end) {
        eventBus.emit(EVENT.POP_MODE);
        eventBus.emit(message.end);
        return;
      }
    }

    eventBus.emit(EVENT.POP_MODE);
  }

  clean(data?: any): void {
    this.text.text = '';
    this.container.setVisible(false);
  }

  pause(): void {}

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}

  private setupEndMark(width: number, height: number) {
    this.endMarkContainer = this.createContainer(width / 2 + 830, height / 2 + 410);

    this.endMark = createSprite(this.scene, TEXTURE.PAUSE_BLACK, 0, 0);

    this.endMarkContainer.add(this.endMark);

    this.endMarkContainer.setScale(this.scale);
    this.endMarkContainer.setVisible(false);
    this.endMarkContainer.setDepth(DEPTH.MESSAGE + 1);
    this.endMarkContainer.setScrollFactor(0);
  }

  private setupQuestion(width: number, height: number) {
    const texts = [i18next.t('menu:yes'), i18next.t('menu:no')];
    const contentHeight = 30;
    const spacing = 10;
    let currentY = 0;

    this.questionContainer = this.createContainer(width / 2 + 787, height / 2 + 155);

    const window = addWindow(this.scene, TEXTURE.WINDOW_2, 0, 0, this.questionWindowWidth / this.scale, this.questionWindowHeight / this.scale, 16, 16, 16, 16).setScale(this.scale);
    this.questionContainer.add(window);

    for (const str of texts) {
      const text = addText(this.scene, -40, currentY - 18, str, TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5);
      const dummy = addImage(this.scene, TEXTURE.BLANK, -50, currentY - 20).setScale(1.4);

      this.questionDummys.push(dummy);

      this.questionContainer.add(text);
      this.questionContainer.add(dummy);

      currentY += contentHeight + spacing;
    }

    this.questionContainer.setScale(this.scale);
    this.questionContainer.setVisible(false);
    this.questionContainer.setDepth(DEPTH.MESSAGE);
    this.questionContainer.setScrollFactor(0);
  }

  private showEndMark(onoff: boolean) {
    if (onoff) {
      this.endMarkContainer.setVisible(true);
      this.endMark.anims.play(ANIMATION.PAUSE_BLACK);
    } else {
      this.endMarkContainer.setVisible(false);
      this.endMark.anims.stop();
    }
  }

  private showQuestion(onoff: boolean) {
    let result = true;

    if (!onoff) result = false;

    this.questionContainer.setVisible(result);
  }

  private async showTalkMessage(message: Message): Promise<boolean> {
    const keyboard = KeyboardHandler.getInstance();
    keyboard.setAllowKey([KEY.SELECT]);

    const result = await this.showMessage(message);

    return new Promise((resolve) => {
      this.showEndMark(true);
      keyboard.setKeyDownCallback((key) => {
        if (key === KEY.SELECT && result) {
          this.clean();
          this.showEndMark(false);
          KeyboardHandler.getInstance().clearCallbacks();
          resolve(true);
        }
      });
    });
  }

  private async showQuestionMessage(message: Message): Promise<boolean> {
    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT];
    const keyboard = KeyboardHandler.getInstance();

    const result = await this.showMessage(message);

    return new Promise((resolve) => {
      let choice = 0;
      this.questionDummys[0].setTexture(TEXTURE.ARROW_B_R);
      keyboard.setAllowKey(keys);

      this.showQuestion(true);
      keyboard.setKeyDownCallback(async (key) => {
        let prevChoice = choice;

        try {
          switch (key) {
            case KEY.UP:
              if (choice > 0) {
                choice--;
              }
              break;
            case KEY.DOWN:
              if (choice < this.questionDummys.length - 1) {
                choice++;
              }
              break;
            case KEY.SELECT:
              if (choice === 0) {
                resolve(true);
              } else if (choice === 1) {
                resolve(false);
              }
              this.clean();
              this.showQuestion(false);
              KeyboardHandler.getInstance().clearCallbacks();
              this.questionDummys[1].setTexture(TEXTURE.BLANK);
              break;
          }

          if (key === KEY.UP || key === KEY.DOWN) {
            if (choice !== prevChoice) {
              playSound(this.scene, AUDIO.SELECT_0);
              this.questionDummys[prevChoice].setTexture(TEXTURE.BLANK);
              this.questionDummys[choice].setTexture(TEXTURE.ARROW_B_R);
            }
          }
        } catch (error) {
          console.error(`Error handling key input: ${error}`);
        }
      });
    });
  }

  private async showMessage(message: Message): Promise<boolean> {
    const text = message.content.split('');
    const keyboard = KeyboardHandler.getInstance();

    let index = 0;
    let messageType = message.type;
    let speed = message.speed;

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
}
