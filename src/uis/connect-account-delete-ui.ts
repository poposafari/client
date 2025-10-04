import { DEPTH, EASE, TEXTSTYLE, TEXTURE } from '../enums';
import i18next from '../i18n';
import { InGameScene } from '../scenes/ingame-scene';
import { addText, addWindow, Ui } from './ui';

export class ConnectAccountDeleteUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private type1Symbol!: Phaser.GameObjects.Text;
  private spinningTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();
    const windowScale = 2;
    const windowWidth = 950;
    const windowHeight = 120;

    this.container = this.createContainer(width / 2, height / 2 + 410);

    const window = addWindow(this.scene, TEXTURE.WINDOW_MENU, 0, 0, windowWidth / windowScale, windowHeight / windowScale, 16, 16, 16, 16);
    window.setScale(windowScale);
    const text = addText(this.scene, -440, -35, i18next.t('message:deleteAccount3'), TEXTSTYLE.MESSAGE_BLACK);
    text.setOrigin(0, 0);
    this.type1Symbol = addText(this.scene, text.displayWidth + text.x + 15, text.displayOriginY + 16, '/', TEXTSTYLE.MESSAGE_BLACK);
    this.type1Symbol.setOrigin(0.5, 0.55);

    this.container.add(window);
    this.container.add(text);
    this.container.add(this.type1Symbol);

    this.container.setScale(windowScale);
    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TOP + 1);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);

    if (this.spinningTween) {
      return;
    }

    this.spinningTween = this.scene.tweens.add({
      targets: this.type1Symbol,
      angle: '+=360',
      duration: 1000,
      ease: EASE.SINE_EASEINOUT,
      repeat: -1,
      repeatDelay: 2000,
    });
  }

  clean(data?: any): void {
    this.container.setVisible(false);

    if (this.spinningTween) {
      this.spinningTween.stop();
      this.spinningTween = null;
    }
    this.type1Symbol.setAngle(0);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}
}
