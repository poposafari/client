import { DEPTH } from '../enums/depth';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { MAX_ITEM_SLOT } from '../managers';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, Ui } from './ui';

export class OverworldItemSlotUi extends Ui {
  private mode: OverworldMode;
  private container!: Phaser.GameObjects.Container;
  protected itemSlotBtns: Phaser.GameObjects.NineSlice[] = [];
  protected itemSlotIcons: Phaser.GameObjects.Image[] = [];
  protected itmeSlotStocks: Phaser.GameObjects.Text[] = [];

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    const slotSize = 55;
    const slotSpacing = 5;
    const totalSlots = MAX_ITEM_SLOT;

    this.container = this.scene.add.container(width / 2 - 195, height / 2 + 507);

    for (let i = 0; i < totalSlots; i++) {
      const xPosition = i * (slotSize + slotSpacing);
      const yPosition = 0;

      const itemSlotWindow = addWindow(this.scene, TEXTURE.WINDOW_0, xPosition, yPosition, slotSize, slotSize, 8, 8, 8, 8);
      const itemSlotText = addText(this.scene, xPosition - 18, yPosition - 12, (i + 1).toString(), TEXTSTYLE.CHOICE_DEFAULT);
      const itemIcon = addImage(this.scene, 'item000', xPosition, yPosition).setVisible(false);
      const itemStock = addText(this.scene, xPosition + 12, yPosition + 12, '', TEXTSTYLE.ITEM_STOCK).setOrigin(0.5, 0.5);

      this.container.add(itemSlotWindow);
      this.container.add(itemIcon);
      this.container.add(itemSlotText);
      this.container.add(itemStock);

      this.itemSlotBtns.push(itemSlotWindow);
      this.itemSlotIcons.push(itemIcon);
      this.itmeSlotStocks.push(itemStock);
    }
    this.container.setScale(1);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.pause(false);
    this.updateItemSlotUi();
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.pause(true);
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.blocking() : this.unblocking();
  }

  unblocking() {
    console.log('itemslot unblocking');

    for (const btn of this.itemSlotBtns) {
      btn.setScrollFactor(0);
      btn.setInteractive({ cursor: 'pointer' });
      btn.on('pointerdown', () => {});
      btn.on('pointerover', () => {
        btn.setAlpha(0.7);
      });
      btn.on('pointerout', () => {
        btn.setAlpha(1);
      });
    }
  }

  blocking() {
    for (const btn of this.itemSlotBtns) {
      btn.off('pointerdown');
      btn.off('pointerover');
      btn.off('pointerout');
    }
  }

  update(time: number, delta: number): void {}

  updateItemSlotUi() {
    const playerItemManager = this.mode.getPlayerItemManager();
    const itemSlots = playerItemManager.getMyItemSlots();
    itemSlots.forEach((slot, i) => {
      this.itemSlotIcons[i].setTexture(`item${slot !== '000' ? slot : '000'}`).setVisible(slot !== '000');
      this.itmeSlotStocks[i].setText(slot !== '000' ? `x${playerItemManager.getMyItem(slot).stock}` : '');
    });
  }
}
