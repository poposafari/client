import { DEPTH } from '../enums/depth';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, Ui } from './ui';

export class OverworldMenuUi extends Ui {
  private mode: OverworldMode;
  private container!: Phaser.GameObjects.Container;
  private menuSlotBtns: Phaser.GameObjects.Image[] = [];

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    const slotSize = 20;
    const slotSpacing = 3;
    const menuList = [TEXTURE.MENU_CHAT, TEXTURE.MENU_CARD, TEXTURE.MENU_DOLL, TEXTURE.MENU_POKEDEX, TEXTURE.MENU_BAG, TEXTURE.MENU_BOX];

    this.container = this.scene.add.container(width / 2 + 700, height / 2 + 510);

    for (let i = 0; i < menuList.length; i++) {
      const xPosition = i * (slotSize + slotSpacing);
      const yPosition = 0;

      const menuIcon = addImage(this.scene, menuList[i], xPosition, yPosition);

      this.container.add(menuIcon);
      this.menuSlotBtns.push(menuIcon.setTint(0x808080));
    }
    this.container.setScale(2);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);

    for (const btn of this.menuSlotBtns) {
      btn.setScrollFactor(0);
      btn.setInteractive({ cursor: 'pointer' });

      btn.on('pointerover', () => {
        btn.clearTint();
      });

      btn.on('pointerout', () => {
        btn.setTint(0x808080);
      });

      btn.on('pointerup', () => {
        const texture = btn.texture.key;
        switch (texture) {
          case TEXTURE.MENU_BAG:
            this.mode.changeBagMode();
            break;
          case TEXTURE.MENU_BOX:
            this.mode.changeBoxMode();
            break;
        }
      });
    }
  }

  clean(data?: any): void {
    this.container.setVisible(false);

    for (const btn of this.menuSlotBtns) {
      btn.off('pointerup');
      btn.off('pointerover');
      btn.off('pointerout');
    }
  }

  pause(onoff: boolean, data?: any): void {}
  update(time: number, delta: number): void {}
}
