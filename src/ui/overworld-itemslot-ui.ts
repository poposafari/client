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

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    const slotSize = 50;
    const slotSpacing = 5;
    const totalSlots = MAX_ITEM_SLOT;

    this.container = this.scene.add.container(width / 2 - 195, height / 2 + 507);

    for (let i = 0; i < totalSlots; i++) {
      const xPosition = i * (slotSize + slotSpacing);
      const yPosition = 0;

      const itemSlotWindow = addWindow(this.scene, TEXTURE.WINDOW_0, xPosition, yPosition, slotSize, slotSize, 8, 8, 8, 8);
      const itemSlotText = addText(this.scene, xPosition - 16, yPosition - 12, (i + 1).toString(), TEXTSTYLE.LOBBY_DEFAULT);
      const itemIcon = addImage(this.scene, 'item000', xPosition, yPosition).setVisible(false);

      this.container.add(itemSlotWindow);
      this.container.add(itemSlotText);
      this.container.add(itemIcon);

      this.itemSlotBtns.push(itemSlotWindow);
      this.itemSlotIcons.push(itemIcon);
    }
    this.container.setScale(1);

    this.container.setVisible(false);
    this.container.setDepth(10000);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);

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

    const playerItemManager = this.mode.getPlayerItemManager();
    const itemSlots = playerItemManager.getMyItemSlots();
    itemSlots.forEach((slot, i) => {
      this.itemSlotIcons[i].setTexture(`item${slot !== '000' ? slot : '000'}`).setVisible(slot !== '000');
    });
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}
}
