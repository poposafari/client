import { ANIMATION } from '../enums/animation';
import { KEY } from '../enums/key';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { Message } from '../interface/sys';
import { KeyboardManager } from '../managers';
import { InGameScene } from '../scenes/ingame-scene';
import { addText, addWindow, createSprite, createSpriteAnimation, UI } from './ui';

export class MessageUi {
  private scene: InGameScene;
  private messageContainer!: Phaser.GameObjects.Container;
  private messageText!: Phaser.GameObjects.Text;
  private messageEndMarkContainer!: Phaser.GameObjects.Container;
  private endMark!: Phaser.GameObjects.Sprite;

  constructor(scene: InGameScene) {
    this.scene = scene;
  }

  setup(): void {
    const ui = this.scene.ui;
    const width = this.scene.game.canvas.width;
    const height = this.scene.game.canvas.height;

    this.messageContainer = this.scene.add.container(width / 4, height / 4);

    const messageWindow = addWindow(this.scene, TEXTURE.WINDOW_1, 0, 210, 800, 100);
    this.messageText = addText(this.scene, -380, 180, '', TEXTSTYLE.MESSAGE_BLACK);
    this.messageText.setOrigin(0, 0);
    this.messageContainer.add(messageWindow);
    this.messageContainer.add(this.messageText);
    this.messageContainer.setVisible(false);

    this.messageEndMarkContainer = this.scene.add.container(width / 2, height / 2);
    this.endMark = createSprite(this.scene, TEXTURE.PAUSE_BLACK, 730, 460);
    this.endMark.anims.stop();
    createSpriteAnimation(this.scene, TEXTURE.PAUSE_BLACK, ANIMATION.PAUSE);
    this.messageEndMarkContainer.add(this.endMark);
    this.messageEndMarkContainer.setVisible(false);

    ui.add(this.messageContainer);
  }

  show(data: Message): Promise<void> {
    const text = data.content;
    let textArray = text.split('');
    let delay = 10;
    let index = 0;

    this.messageContainer.setVisible(true);

    const keyboardMananger = KeyboardManager.getInstance();
    const keys = [KEY.SELECT];
    keyboardMananger.setAllowKey(keys);

    return new Promise((resolve) => {
      const addNextChar = () => {
        if (index < textArray.length) {
          this.messageText.text += textArray[index];
          index++;
          this.scene.time.delayedCall(delay, addNextChar, [], this);
        }
        if (index === textArray.length) {
          this.messageEndMarkContainer.setVisible(true);
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
    this.messageEndMarkContainer.setVisible(false);
  }

  pause(onoff: boolean): void {
    this.messageEndMarkContainer.setVisible(false);
    this.endMark.anims.stop();
  }
}
