import { GameScene } from '@poposafari/scenes';
import { TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addImage, addText, addWindow } from '@poposafari/utils';

export class SelectBoxContainer extends Phaser.GameObjects.Container {
  scene: GameScene;

  private window!: GWindow;
  private title!: GText;
  private arrowLeft!: GImage;
  private arrowRight!: GImage;
  private contentText!: GText;

  private options: string[] = [];
  private optionIds: string[] = [];
  private currentIdx: number = 0;

  public onChange?: (selectedId: string) => void;

  constructor(scene: GameScene) {
    super(scene, 0, 0);
    this.scene = scene;
    this.setScrollFactor(0);
    this.setVisible(true);
    scene.add.existing(this);
  }

  create(width: number, height: number, strTitle: string) {
    this.window = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      0,
      width,
      height,
      3,
      16,
      16,
      16,
      16,
    );

    this.title = addText(
      this.scene,
      0,
      -40,
      strTitle,
      70,
      '100',
      'center',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    );

    this.arrowLeft = addImage(this.scene, TEXTURE.CURSOR_WHITE, undefined, -180, 30)
      .setScale(2.4)
      .setFlipX(true);
    this.arrowRight = addImage(this.scene, TEXTURE.CURSOR_WHITE, undefined, 180, 30).setScale(2.4);

    this.contentText = addText(
      this.scene,
      0,
      30,
      '',
      50,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    ).setOrigin(0.5);

    this.add([this.window, this.title, this.arrowLeft, this.arrowRight, this.contentText]);

    this.setupInteractions();
  }

  public setOptions(options: string[], triggerChange: boolean = false) {
    this.options = options;
    this.currentIdx = 0;
    this.updateDisplay();

    if (triggerChange && this.options.length > 0 && this.onChange) {
      this.onChange(this.optionIds[0]);
    }
  }

  public setOptionsWithIds(ids: string[], texts: string[], triggerChange: boolean = false) {
    this.optionIds = ids;
    this.options = texts;
    this.currentIdx = 0;
    this.updateDisplay();

    if (triggerChange && this.options.length > 0 && this.onChange) {
      this.onChange(this.optionIds[0]);
    }
  }

  private setupInteractions() {
    this.addArrowEvent(this.arrowLeft, -1);
    this.addArrowEvent(this.arrowRight, 1);
  }

  private addArrowEvent(target: GImage, direction: number) {
    target
      .setInteractive({ cursor: 'pointer' })
      .on('pointerdown', () => target.setTint(0xcccccc))
      .on('pointerout', () => target.clearTint())
      .on('pointerup', () => {
        target.clearTint();
        if (this.options.length <= 1) return;

        this.currentIdx = (this.currentIdx + direction + this.options.length) % this.options.length;
        this.updateDisplay();

        if (this.onChange) {
          this.onChange(this.optionIds[this.currentIdx]);
        }
      });
  }

  private updateDisplay() {
    if (this.options.length === 0) {
      this.contentText.setText('');
      this.arrowLeft.setTint(0x999999).disableInteractive();
      this.arrowRight.setTint(0x999999).disableInteractive();
    } else {
      const currentId = this.options[this.currentIdx];
      this.contentText.setText(currentId);

      const tint = this.options.length > 1 ? 0xffffff : 0x999999;
      this.arrowLeft.setTint(tint).setInteractive();
      this.arrowRight.setTint(tint).setInteractive();

      if (this.options.length <= 1) {
        this.arrowLeft.disableInteractive();
        this.arrowRight.disableInteractive();
      }
    }
  }

  public getSelectedId(): string | null {
    return this.optionIds.length > 0 ? this.optionIds[this.currentIdx] : null;
  }
}
