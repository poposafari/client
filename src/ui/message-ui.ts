import { ANIMATION } from '../enums/animation';
import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { Message } from '../interface/sys';
import { KeyboardManager } from '../managers';
import { Mode } from '../mode';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addText, addWindow, createSprite, createSpriteAnimation, Ui } from './ui';

export class MessageUi extends Ui {
  private mode!: OverworldMode;
  private messageContainer!: Phaser.GameObjects.Container;
  private messageText!: Phaser.GameObjects.Text;
  private messageEndMarkContainer!: Phaser.GameObjects.Container;
  private endMark!: Phaser.GameObjects.Sprite;

  constructor(scene: InGameScene, mode?: OverworldMode) {
    super(scene);

    if (mode) {
      this.mode = mode;
    }
  }

  setup(): void {
    const ui = this.scene.ui;
    const width = this.scene.game.canvas.width;
    const height = this.scene.game.canvas.height;

    this.messageContainer = this.scene.add.container(width / 2, height / 2);

    const messageWindow = addWindow(this.scene, TEXTURE.WINDOW_1, 0, 210, 800, 100, 8, 8, 8, 8);
    this.messageText = addText(this.scene, -380, 180, '', TEXTSTYLE.MESSAGE_BLACK);
    this.messageText.setOrigin(0, 0);
    this.messageContainer.add(messageWindow);
    this.messageContainer.add(this.messageText);
    this.messageContainer.setVisible(false);

    this.endMark = createSprite(this.scene, TEXTURE.PAUSE_BLACK, +350, 220);
    this.endMark.setDepth(DEPTH.MESSAGE).setScale(1.5);
    this.endMark.setVisible(false);
    this.endMark.anims.stop();
    this.messageContainer.add(this.endMark);

    this.messageContainer.setDepth(DEPTH.MESSAGE).setScale(2);
    this.messageContainer.setScrollFactor(0);
  }

  show(data: Message): Promise<void> {
    const text = data.content;
    let textArray = text.split('');
    let delay = 10;
    let index = 0;
    let isFinish = false;

    this.endMark.setVisible(false);
    this.messageContainer.setVisible(true);
    this.messageText.text = '';

    const keyboardMananger = KeyboardManager.getInstance();
    keyboardMananger.clearCallbacks();

    return new Promise((resolve) => {
      const addNextChar = () => {
        if (index < textArray.length) {
          this.messageText.text += textArray[index];
          index++;
          this.scene.time.delayedCall(delay, addNextChar, [], this);
        } else if (!isFinish) {
          isFinish = true;
          this.endMark.setVisible(true);
          this.endMark.anims.play(ANIMATION.PAUSE);

          keyboardMananger.setKeyDownCallback((key) => {
            if (key === KEY.SELECT) {
              this.clean();
              this.endMark.anims.stop();
              resolve();
            }
          });
        }
      };

      addNextChar();
    });
  }

  clean(): void {
    this.messageText.text = '';
    this.messageContainer.setVisible(false);
  }

  pause(onoff: boolean): void {
    this.endMark.anims.stop();
  }

  update(time: number, delta: number): void {}
}
