import { AUDIO, DEPTH, EASE, KEY, TEXTSTYLE, TEXTURE } from '../enums';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import { InGameScene } from '../scenes/ingame-scene';
import { Notice } from '../types';
import { addText, addWindow, playEffectSound, Ui } from './ui';

export class NoticeUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private window!: Phaser.GameObjects.NineSlice;
  private text!: Phaser.GameObjects.Text;

  private readonly scale: number = 2;
  private readonly windowWidth: number = 950;
  private readonly windowHeight: number = 120;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2 + 410);

    this.window = addWindow(this.scene, TEXTURE.WINDOW_SYS, 0, 0, this.windowWidth / this.scale, this.windowHeight / this.scale, 16, 16, 16, 16).setScale(this.scale);
    this.text = addText(this.scene, -440, -35, '', TEXTSTYLE.MESSAGE_WHITE).setOrigin(0, 0);

    this.container.add(this.window);
    this.container.add(this.text);

    this.container.setScale(this.scale);
    this.container.setVisible(false);
    this.container.setDepth(DEPTH.MESSAGE);
    this.container.setScrollFactor(0);
  }

  async show(data: Notice[]): Promise<boolean> {
    for (const notice of data) {
      const keyboard = KeyboardHandler.getInstance();
      keyboard.setAllowKey([KEY.SELECT]);

      const result = await this.showNotice(notice);

      playEffectSound(this.scene, AUDIO.SELECT_0);

      this.container.setY(this.getHeight() / 2 + 500);
      this.container.setVisible(true);

      this.scene.tweens.add({
        targets: this.container,
        y: this.getHeight() / 2 + 410,
        duration: 300,
        ease: EASE.QUINT_EASEOUT,
      });

      return new Promise((resolve) => {
        keyboard.setKeyDownCallback((key) => {
          if (key === KEY.SELECT && result) {
            this.scene.tweens.add({
              targets: this.container,
              y: this.getHeight() / 2 + 500,
              duration: 200,
              ease: EASE.QUINT_EASEIN,
              onComplete: () => {
                this.container.setVisible(false);
                resolve(true);
              },
            });
          }
        });
      });
    }

    return true;
  }

  clean(data?: any): void {}

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  private showNotice(message: Notice): Promise<boolean> {
    return new Promise((resolve) => {
      this.text.setText(message.content);
      resolve(true);
    });
  }
}
