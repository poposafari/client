import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { Message } from '../interface/sys';
import { InGameScene } from '../scenes/ingame-scene';
import { addText, addWindow, UI } from './ui';

export class MessageUi {
  private scene: InGameScene;
  private messageContainer!: Phaser.GameObjects.Container;
  private messageText!: Phaser.GameObjects.Text;

  constructor(scene: InGameScene) {
    this.scene = scene;
  }

  setup(): void {
    const ui = this.scene.ui;
    const width = this.scene.game.canvas.width;
    const height = this.scene.game.canvas.height;

    this.messageContainer = this.scene.add.container(width / 4, height / 4);

    const messageWindow = addWindow(this.scene, TEXTURE.WINDOW_1, 0, 210, 800, 100);
    this.messageText = addText(this.scene, -380, 175, '', TEXTSTYLE.MESSAGE_BLACK);
    this.messageText.setOrigin(0, 0);
    this.messageContainer.add(messageWindow);
    this.messageContainer.add(this.messageText);
    this.messageContainer.setVisible(false);

    ui.add(this.messageContainer);
  }

  show(data: Message): Promise<void> {
    return new Promise((resolve) => {
      this.messageContainer.setVisible(true);

      const text = data.content;
      let textArray = text.split('');
      let delay = 10;
      let index = 0;

      const addNextChar = () => {
        // if (index === textArray.length) {
        //     this.messageEndMarkContainer.setVisible(true);
        // }
        if (index < textArray.length) {
          this.messageText.text += textArray[index];
          index++;
          this.scene.time.delayedCall(delay, addNextChar, [], this);
        } else {
          if (this.scene.input.keyboard) {
            this.scene.input.keyboard.on('keydown', () => {
              this.clean();
              resolve();
            });
          }
        }
      };

      addNextChar();
    });
  }

  clean(): void {
    this.messageText.text = '';
    this.messageContainer.setVisible(false);
  }

  pause(onoff: boolean): void {}
}
