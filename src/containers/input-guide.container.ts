import { GameScene } from '@poposafari/scenes';
import { TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addText, addWindow } from '@poposafari/utils';

export class InputGuideContainer extends Phaser.GameObjects.Container {
  private window!: GWindow;
  private text!: GText;

  constructor(scene: GameScene) {
    super(scene);

    this.setScrollFactor(0);
    this.setVisible(true);
    scene.add.existing(this);
  }

  create(x: number, y: number, windowScale: number, content: string, contentSize: number) {
    this.text = addText(
      this.scene,
      0,
      -15,
      content,
      contentSize,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    this.window = addWindow(
      this.scene,
      TEXTURE.KEYCAP,
      0,
      0,
      this.text.displayWidth + 60,
      this.text.displayHeight + 70,
      windowScale,
      16,
      16,
      16,
      16,
    );

    this.setPosition(x, y);
    this.add([this.window, this.text]);
  }

  setText(content: string) {
    this.text.setText(content);
  }
}
