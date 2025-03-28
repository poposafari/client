import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { TEXTURE } from '../enums/texture';
import { Mode } from '../mode';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addText, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';

export class LoadingDefaultUi extends Ui {
  private mode: Mode;

  private bg!: Phaser.GameObjects.Image;

  private text!: Phaser.GameObjects.Text;

  private container!: Phaser.GameObjects.Container;
  private textContainer!: Phaser.GameObjects.Container;

  constructor(scene: InGameScene, mode: Mode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);
    this.textContainer = this.createContainer(width / 2, height / 2);

    this.bg = addBackground(this.scene, TEXTURE.BLACK).setOrigin(0.5, 0.5);
    this.bg.setAlpha(0.5);

    this.text = addText(this.scene, 0, 0, i18next.t('lobby:loadingDefault'), TEXTSTYLE.LOADING);

    this.container.add(this.bg);
    this.container.add(this.text);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TOP);
    this.container.setScrollFactor(0);

    this.textContainer.setVisible(false);
    this.textContainer.setDepth(DEPTH.TOP + 1);
    this.textContainer.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.textContainer.setVisible(true);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.textContainer.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {
    this.clean();
  }

  update(time: number, delta: number): void {}
}
