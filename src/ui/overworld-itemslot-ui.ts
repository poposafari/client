import { DEPTH } from '../enums/depth';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, Ui } from './ui';

export class OverworldItemSlotUi extends Ui {
  private mode: OverworldMode;
  private container!: Phaser.GameObjects.Container;

  protected slotWindows: Phaser.GameObjects.NineSlice[] = [];
  protected slotIcons: Phaser.GameObjects.Image[] = [];
  protected slotNumbers: Phaser.GameObjects.Text[] = [];
  protected slotStock: Phaser.GameObjects.Text[] = [];

  private readonly MaxSlot: number = 9;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();
    const contentHeight = 55;
    const spacing = 8;

    let currentX = 0;

    this.container = this.scene.add.container(width / 2 - 195, height / 2 + 507);

    for (let i = 1; i <= this.MaxSlot; i++) {
      const window = addWindow(this.scene, TEXTURE.WINDOW_0, currentX, 0, 60, 60, 8, 8, 8, 8);
      const icon = addImage(this.scene, '', currentX, 0);
      const num = addText(this.scene, currentX - 20, 0 - 12, i.toString(), TEXTSTYLE.CHOICE_DEFAULT);
      const stock = addText(this.scene, currentX + 10, +15, '', TEXTSTYLE.CHOICE_DEFAULT);

      this.container.add(window);
      this.container.add(icon);
      this.container.add(num);
      this.container.add(stock);

      this.slotWindows.push(window);
      this.slotIcons.push(icon);
      this.slotNumbers.push(num);
      this.slotStock.push(stock);

      currentX += contentHeight + spacing;
    }

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.pause(false);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.pause(true);
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  private block() {}

  private unblock() {
    this.updateSlot();
  }

  update(time: number, delta: number): void {}

  updateSlot() {
    const bag = this.mode.getBag();

    for (let i = 1; i <= this.MaxSlot; i++) {
      const item = bag?.findItemByRegister(i as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9);
      if (item) {
        this.slotIcons[i - 1].setTexture(`item${item.getKey()}`);
        this.slotStock[i - 1].setText(`x${item.getStock()}`);
      } else {
        this.slotIcons[i - 1].setTexture(TEXTURE.BLANK);
        this.slotStock[i - 1].setText(``);
      }
    }
  }
}
