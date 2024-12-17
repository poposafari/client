import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { PlayerManager } from '../managers';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { Overworld } from './overworld';
import { addImage, addText, addWindow } from './ui';

export class OverworldUi extends Overworld {
  protected itemSlotContainers: Phaser.GameObjects.Container[] = [];
  protected itemSlotBtns: Phaser.GameObjects.NineSlice[] = [];
  protected itemSlotIcons: Phaser.GameObjects.Image[] = [];
  protected pokemonSlotContainers: Phaser.GameObjects.Container[] = [];
  protected pokemonSloteBtns: Phaser.GameObjects.NineSlice[] = [];
  protected menuSlotContainers: Phaser.GameObjects.Container[] = [];
  protected menuSlotBtns: Phaser.GameObjects.Image[] = [];
  protected menuSlotXboxBtns: Phaser.GameObjects.Image[] = [];

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene, mode);
  }

  setup(): void {
    super.setup();
    const width = this.getWidth();
    const height = this.getHeight();

    const itemSlotContainer = this.scene.add.container(0, 0);
    const itemSlotContainerWidth = 9 * (50 + 5) - 5;
    const itemSlotContainerHeight = 50;
    itemSlotContainer.setPosition(width / 2 - itemSlotContainerWidth / 2, height / 2 - itemSlotContainerHeight / 2 + 530);

    const pokemonSlotContainer = this.scene.add.container(0, 0);
    const pokemonSlotContainerWidth = 50;
    const pokemonSlotContainerHeight = 6 * (50 + 5) - 5;
    pokemonSlotContainer.setPosition(width / 2 - pokemonSlotContainerWidth / 2 + 950, height / 2 - pokemonSlotContainerHeight / 2);

    const menuSlotContainer = this.scene.add.container(0, 0);
    const menuSlotContainerWidth = 2 * (50 + 1) - 1;
    const menuSlotContainerHeight = 50;
    menuSlotContainer.setPosition(width / 2 - menuSlotContainerWidth / 2 + 678, height / 2 - menuSlotContainerHeight / 2 + 530);

    const menuList = [TEXTURE.MENU_SHOES, TEXTURE.MENU_CHAT, TEXTURE.MENU_CARD, TEXTURE.MENU_DOLL, TEXTURE.MENU_POKEDEX, TEXTURE.MENU_BAG, TEXTURE.MENU_BOX];
    for (let i = 0; i < menuList.length; i++) {
      const xPosition = i * (50 + 1);
      const menuBoxImage = addImage(this.scene, menuList[i], xPosition, 0).setScale(2);
      menuSlotContainer.add(menuBoxImage);
      this.menuSlotBtns.push(menuBoxImage.setTint(0x808080));
    }

    for (let i = 0; i < 9; i++) {
      const xPosition = i * (50 + 5);
      const itemSlotWindow = addWindow(this.scene, TEXTURE.WINDOW_0, xPosition, 0, 50, 50, 8, 8, 8, 8);
      const itemSlotText = addText(this.scene, xPosition - 16, -12, (i + 1).toString(), TEXTSTYLE.LOBBY_DEFAULT);
      const itemIcon = addImage(this.scene, 'item000', xPosition, 0).setVisible(false);
      this.itemSlotIcons.push(itemIcon);
      itemSlotContainer.add(itemSlotWindow);
      itemSlotContainer.add(itemSlotText);
      this.itemSlotBtns.push(itemSlotWindow);
    }
    itemSlotContainer.add(this.itemSlotIcons);

    for (let i = 0; i < 6; i++) {
      const yPosition = i * (50 + 5);
      const pokemonSlotWindow = addWindow(this.scene, TEXTURE.WINDOW_0, 0, yPosition, 50, 50, 8, 8, 8, 8);
      pokemonSlotContainer.add(pokemonSlotWindow);
      this.pokemonSloteBtns.push(pokemonSlotWindow);
    }

    itemSlotContainer.setVisible(false).setScrollFactor(0);
    pokemonSlotContainer.setVisible(false).setScrollFactor(0);
    menuSlotContainer.setVisible(false).setScrollFactor(0);

    this.itemSlotContainers.push(itemSlotContainer);
    this.pokemonSlotContainers.push(pokemonSlotContainer);
    this.menuSlotContainers.push(menuSlotContainer);

    this.scene.add.existing(itemSlotContainer);
    this.scene.add.existing(pokemonSlotContainer);
    this.scene.add.existing(menuSlotContainer);
  }

  show(): void {
    const playerManager = PlayerManager.getInstance();
    const itemSlotsInfo = playerManager.getItemSlot();
    console.log(itemSlotsInfo);

    super.show();
    for (const container of this.menuSlotContainers) {
      container.setVisible(true);
      container.setDepth(10000);
    }

    for (const container of this.itemSlotContainers) {
      container.setVisible(true);
      container.setDepth(10000);
    }

    for (const container of this.pokemonSlotContainers) {
      container.setVisible(true);
      container.setDepth(10000);
    }

    let idx = 0;
    for (const info of itemSlotsInfo) {
      if (info.idx === '000') {
        this.itemSlotIcons[idx].setTexture(`item000`).setVisible(false);
      }

      if (info.idx !== '000') {
        this.itemSlotIcons[idx].setTexture(`item${info.idx}`).setVisible(true);
      }
      idx++;
    }

    for (const btn of this.menuSlotBtns) {
      btn.setScrollFactor(0);
      btn.setInteractive({ cursor: 'pointer' });

      btn.on('pointerover', () => {
        btn.clearTint();
      });

      btn.on('pointerout', () => {
        btn.setTint(0x808080);
      });

      btn.on('pointerdown', () => {
        const texture = btn.texture.key;
        const modeManager = this.getMode();
        switch (texture) {
          case TEXTURE.MENU_BAG:
            modeManager.changeBagMode();
            break;
          case TEXTURE.MENU_BOX:
            modeManager.changeBoxMode();
            break;
        }
      });
    }

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

    for (const btn of this.pokemonSloteBtns) {
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

  clean(): void {
    super.clean();
    for (const container of this.menuSlotContainers) {
      container.setVisible(false);
    }

    for (const container of this.itemSlotContainers) {
      container.setVisible(false);
    }

    for (const container of this.pokemonSlotContainers) {
      container.setVisible(false);
    }

    for (const btn of this.menuSlotBtns) {
      btn.off('pointerover');
      btn.off('pointerout');
      btn.off('pointerdown');
    }

    for (const btn of this.itemSlotBtns) {
      btn.off('pointerover');
      btn.off('pointerout');
      btn.off('pointerdown');
    }

    for (const btn of this.pokemonSloteBtns) {
      btn.off('pointerover');
      btn.off('pointerout');
      btn.off('pointerdown');
    }
  }

  pause(onoff: boolean): void {
    super.pause(onoff);
    onoff ? this.blockInputs() : this.unblockInputs();
  }

  private blockInputs(): void {
    for (const btn of this.menuSlotBtns) {
      btn.disableInteractive();
    }
    for (const btn of this.itemSlotBtns) {
      btn.disableInteractive();
    }
    for (const btn of this.pokemonSloteBtns) {
      btn.disableInteractive();
    }
  }

  private unblockInputs(): void {
    for (const btn of this.menuSlotBtns) {
      btn.setInteractive();
    }
    for (const btn of this.itemSlotBtns) {
      btn.setInteractive();
    }
    for (const btn of this.pokemonSloteBtns) {
      btn.setInteractive();
    }
  }
}
