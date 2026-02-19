import { GameScene } from '@poposafari/scenes';
import { TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addText, addWindow } from '@poposafari/utils';

export class ButtonContainer extends Phaser.GameObjects.Container {
  scene: GameScene;

  private window!: GWindow;
  private contentText!: GText;
  private isVisibleClickEffect!: boolean;

  private cursor!: GWindow;

  constructor(scene: GameScene) {
    super(scene, 0, 0);
    this.scene = scene;
    this.setScrollFactor(0);
    this.setVisible(true);
    scene.add.existing(this);
  }

  create(
    window: TEXTURE,
    windowScale: number,
    strContent: string,
    contentSize: number,
    isVisibleClickEffect: boolean = false,
    onAction: () => void,
  ) {
    this.isVisibleClickEffect = isVisibleClickEffect;
    this.contentText = addText(
      this.scene,
      0,
      0,
      strContent,
      contentSize,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    this.window = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      0,
      this.contentText.displayWidth + 90,
      this.contentText.displayHeight + 40,
      windowScale,
      16,
      16,
      16,
      16,
    );

    this.cursor = addWindow(
      this.scene,
      TEXTURE.WINDOW_CURSOR,
      0,
      0,
      this.window.displayWidth + 10,
      this.window.displayHeight + 10,
      windowScale,
      16,
      16,
      16,
      16,
    );

    this.cursor.setVisible(false);

    this.add([this.window, this.contentText, this.cursor]);

    this.handleClickEvent(onAction);
  }

  handleClickEvent(onAction: () => void) {
    this.addInteraction(this.window, () => {
      if (this.isVisibleClickEffect) {
        this.updateCursor(true);
      }

      if (onAction) {
        onAction();
      }
    });
  }

  private addInteraction(target: GWindow, onAction: () => void) {
    target.setInteractive({ cursor: 'pointer' });

    target.on('pointerover', () => {
      this.window.setTint(0xcccccc);
      this.contentText.setTint(0xcccccc);
    });

    target.on('pointerout', () => {
      this.window.clearTint();
      this.contentText.clearTint();
    });

    target.on('pointerup', () => {
      onAction();
    });
  }

  updateCursor(onoff: boolean) {
    this.cursor.setVisible(onoff);
  }
}
