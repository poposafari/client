import i18next from 'i18next';
import { ANIMATION } from '../enums/animation';
import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager } from '../managers';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, createSprite, Ui } from './ui';
import { Message } from '../interface/sys';

export class MessageUi extends Ui {
  private mode!: OverworldMode;
  private messageContainer!: Phaser.GameObjects.Container;
  private messageText!: Phaser.GameObjects.Text;
  private endMark!: Phaser.GameObjects.Sprite;
  private questionContainer!: Phaser.GameObjects.Container;
  private questionTexts: Phaser.GameObjects.Text[] = [];
  private questionDummys: Phaser.GameObjects.Image[] = [];
  private selectedIndex: number = 0;
  scene: any;

  constructor(scene: InGameScene, mode?: OverworldMode) {
    super(scene);

    if (mode) {
      this.mode = mode;
    }
  }

  setup(): void {
    const width = this.scene.game.canvas.width;
    const height = this.scene.game.canvas.height;

    this.messageContainer = this.scene.add.container(width / 2, height / 2);
    const messageWindow = addWindow(this.scene, TEXTURE.WINDOW_1, 0, 210, 800, 100, 8, 8, 8, 8);
    this.messageText = addText(this.scene, -380, 180, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0);
    this.messageContainer.add(messageWindow);
    this.messageContainer.add(this.messageText);
    this.messageContainer.setVisible(false);

    this.endMark = createSprite(this.scene, TEXTURE.PAUSE_BLACK, +350, 220);
    this.endMark.setDepth(DEPTH.MESSAGE).setScale(1.5).setVisible(false);
    this.messageContainer.add(this.endMark);

    this.questionContainer = this.scene.add.container(width / 2 + 685, height / 2 + 230);
    const questionWindow = addWindow(this.scene, TEXTURE.WINDOW_1, 0, 0, 150, 100, 8, 8, 8, 8);
    this.questionContainer.add(questionWindow);

    const options = [i18next.t('menu:accept'), i18next.t('menu:reject')];
    options.forEach((text, index) => {
      const yPosition = index * 40 - 20;
      const optionText = addText(this.scene, -30, yPosition, text, TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5);
      const dummy = addImage(this.scene, TEXTURE.BLANK, -50, yPosition);

      this.questionTexts.push(optionText);
      this.questionDummys.push(dummy);
      this.questionContainer.add(optionText);
      this.questionContainer.add(dummy);
    });
    this.questionContainer.setDepth(DEPTH.MESSAGE).setScale(1.5);
    this.questionContainer.setScrollFactor(0);
    this.questionContainer.setVisible(false);

    this.messageContainer.setDepth(DEPTH.MESSAGE).setScale(2);
    this.messageContainer.setScrollFactor(0);
  }

  async show(data: Message): Promise<boolean | void> {
    const text = data.content;
    let textArray = text.split('');
    let index = 0;
    let isQuestion = data.format === 'question';
    let isFinish = false;

    this.endMark.setVisible(false);
    this.messageContainer.setVisible(true);
    this.messageText.text = '';
    this.questionContainer.setVisible(false);

    const keyboardManager = KeyboardManager.getInstance();
    keyboardManager.clearCallbacks();

    return new Promise((resolve) => {
      const addNextChar = () => {
        if (index < textArray.length) {
          this.messageText.text += textArray[index];
          index++;
          this.scene.time.delayedCall(10, addNextChar, [], this);
        } else if (!isFinish) {
          isFinish = true;
          this.endMark.setVisible(!isQuestion);
          if (!isQuestion) {
            this.endMark.anims.play(ANIMATION.PAUSE);

            keyboardManager.setKeyDownCallback((key) => {
              if (key === KEY.SELECT) {
                this.clean();
                resolve();
              }
            });
          } else {
            this.showQuestion(resolve);
          }
        }
      };

      addNextChar();
    });
  }

  private showQuestion(resolve: (value: boolean) => void): void {
    this.questionContainer.setVisible(true);

    this.questionDummys[this.selectedIndex].setTexture(TEXTURE.ARROW_B_R);

    const keyboardManager = KeyboardManager.getInstance();
    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT];

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback((key) => {
      const prevIndex = this.selectedIndex;

      switch (key) {
        case KEY.UP:
          this.selectedIndex = Math.max(0, this.selectedIndex - 1);
          break;
        case KEY.DOWN:
          this.selectedIndex = Math.min(this.questionTexts.length - 1, this.selectedIndex + 1);
          break;
        case KEY.SELECT:
          this.clean();
          resolve(this.selectedIndex === 0 ? true : false);
          this.selectedIndex = 0;
          break;
      }

      if (this.selectedIndex !== prevIndex) {
        this.updateSelection(prevIndex, this.selectedIndex);
      }
    });
  }

  private updateSelection(prevIndex: number, currentIndex: number): void {
    this.questionDummys[prevIndex].setTexture(TEXTURE.BLANK);
    this.questionDummys[currentIndex].setTexture(TEXTURE.ARROW_B_R);
  }

  clean(): void {
    this.messageText.text = '';
    this.messageContainer.setVisible(false);
    this.questionContainer.setVisible(false);
  }

  pause(onoff: boolean): void {
    this.endMark.anims.stop();
  }

  update(time: number, delta: number): void {}
}
