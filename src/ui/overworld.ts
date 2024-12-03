import { KEY } from '../enums/key';
import { PLAYER_STATUS } from '../enums/player-status';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager, PlayerManager } from '../managers';
import { PLAYER_SCALE } from '../object/base-object';
import { PlayerObject } from '../object/player-object';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, UI } from './ui';

export class Overworld extends UI {
  public map!: Phaser.Tilemaps.Tilemap;
  private players: PlayerObject[] = [];
  private cursorKey: Phaser.Types.Input.Keyboard.CursorKeys;
  private player!: PlayerObject;
  private itemSlotContainers: Phaser.GameObjects.Container[] = [];
  private itemSlotBtns: Phaser.GameObjects.NineSlice[] = [];
  private pokemonSlotContainers: Phaser.GameObjects.Container[] = [];
  private pokemonSloteBtns: Phaser.GameObjects.NineSlice[] = [];
  private menuSlotContainers: Phaser.GameObjects.Container[] = [];
  private menuSlotBtns: Phaser.GameObjects.Image[] = [];

  constructor(scene: InGameScene) {
    super(scene);
    this.cursorKey = this.scene.input.keyboard!.createCursorKeys();
  }

  setMap(map: Phaser.Tilemaps.Tilemap) {
    this.map = map;
  }

  setup(): void {
    const ui = this.scene.ui;
    const width = this.scene.game.canvas.width;
    const height = this.scene.game.canvas.height;

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
      const itemSlotWindow = addWindow(this.scene, TEXTURE.WINDOW_0, xPosition, 0, 50, 50);
      const itemSlotText = addText(this.scene, xPosition - 16, -12, (i + 1).toString(), TEXTSTYLE.LOBBY_DEFAULT);
      itemSlotContainer.add(itemSlotWindow);
      itemSlotContainer.add(itemSlotText);
      this.itemSlotBtns.push(itemSlotWindow);
    }

    for (let i = 0; i < 6; i++) {
      const yPosition = i * (50 + 5);
      const pokemonSlotWindow = addWindow(this.scene, TEXTURE.WINDOW_0, 0, yPosition, 50, 50);
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
        console.log(`${btn.texture.key} clicked!`);
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

    const keyboardMananger = KeyboardManager.getInstance();
    const keys = [KEY.SELECT, KEY.RUNNING];
    keyboardMananger.setAllowKey(keys);

    const playerManager = PlayerManager.getInstance();

    this.player = new PlayerObject(this.scene, playerManager.getType(PLAYER_STATUS.MOVEMENT), 4, 3, this.map, playerManager.getNickname());

    const playerSprite = this.player.getSprite();
    playerSprite.setVisible(true);
    playerSprite.setScale(PLAYER_SCALE);
    this.scene.cameras.main.startFollow(playerSprite, true, 0.5, 0.5, 0, 0);

    keyboardMananger.setKeyDownCallback((key) => {
      switch (key) {
        case KEY.RUNNING:
          this.player.setRunning();
          break;
      }
    });
  }

  clean(): void {}

  pause(onoff: boolean): void {}

  update(time: number, delta: number) {
    this.movement();
    this.player.update(delta);
  }

  private movement() {
    if (this.cursorKey.up.isDown && this.player.isMovementFinish()) {
      this.player.move(KEY.UP);
    } else if (this.cursorKey.down.isDown && this.player.isMovementFinish()) {
      this.player.move(KEY.DOWN);
    } else if (this.cursorKey.left.isDown && this.player.isMovementFinish()) {
      this.player.move(KEY.LEFT);
    } else if (this.cursorKey.right.isDown && this.player.isMovementFinish()) {
      this.player.move(KEY.RIGHT);
    }
  }
}
