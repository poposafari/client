import { DEPTH } from '../enums/depth';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes-test';
import { InGameScene } from '../scenes/ingame-scene';
import { Bag } from '../storage/bag';
import { MAX_ITEM_SLOT, PlayerInfo } from '../storage/player-info';
import { addImage, addText, addWindow, Ui } from './ui';

export class OverworldItemSlotUi extends Ui {
  private mode: OverworldMode;
  private container!: Phaser.GameObjects.Container;

  protected slotWindows: Phaser.GameObjects.NineSlice[] = [];
  protected slotIcons: Phaser.GameObjects.Image[] = [];
  protected slotNumbers: Phaser.GameObjects.Text[] = [];
  // protected slotStock: Phaser.GameObjects.Text[] = [];

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();
    const contentHeight = 55;
    const spacing = 10;

    let currentX = 0;

    this.container = this.scene.add.container(width / 2 - 200, height / 2 + 500);

    for (let i = 0; i < MAX_ITEM_SLOT; i++) {
      const window = addWindow(this.scene, TEXTURE.WINDOW_0, currentX, 0, 60, 60, 8, 8, 8, 8);
      const icon = addImage(this.scene, '', currentX, 0);
      const num = addText(this.scene, currentX - 20, 0 - 12, (i + 1).toString(), TEXTSTYLE.CHOICE_DEFAULT);
      const stock = addText(this.scene, currentX + 10, +15, '', TEXTSTYLE.CHOICE_DEFAULT);

      this.container.add(window);
      this.container.add(icon);
      this.container.add(num);
      this.container.add(stock);

      this.slotWindows.push(window);
      this.slotIcons.push(icon);
      this.slotNumbers.push(num);
      // this.slotStock.push(stock);

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
    this.update();
  }

  update(): void {
    const playerInfo = PlayerInfo.getInstance();
    const itemSlots = playerInfo.getItemSlot();

    for (let i = 0; i < MAX_ITEM_SLOT; i++) {
      const item = itemSlots[i];
      if (item) {
        this.slotIcons[i].setTexture(`item${item}`);
      } else {
        this.slotIcons[i].setTexture(TEXTURE.BLANK);
      }
    }
  }
}
