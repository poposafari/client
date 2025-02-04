import { getItem } from '../data/items';
import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager } from '../managers';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, Ui } from './ui';

export class OverworldBattlePokeballUi extends Ui {
  private mode: OverworldMode;
  private container!: Phaser.GameObjects.Container;
  private window!: Phaser.GameObjects.NineSlice;
  private itemNames: Phaser.GameObjects.Text[] = [];
  private itemStocks: Phaser.GameObjects.Text[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];
  private lastChoice!: number;
  private readonly scale: number = 3;
  private readonly fixedBottomY: number = +300;
  private readonly contentHeight: number = 50;
  private readonly contentSpacing: number = 5;
  private readonly minWindowHeight = 55;
  private readonly windowWidth = 450;
  private readonly targetPokeballs: string[] = ['001', '002', '003', '004'];

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.scene.add.container(width / 2, height / 2);

    this.window = addWindow(
      this.scene,
      TEXTURE.WINDOW_5,
      +730,
      this.fixedBottomY - this.minWindowHeight / this.scale,
      this.windowWidth / this.scale,
      this.minWindowHeight / this.scale,
      16,
      16,
      16,
      16,
    ).setScale(this.scale);

    this.container.add(this.window);
    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE_UI + 3);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    const playerItemManager = this.mode.getPlayerItemManager();
    const playerItem = playerItemManager.getMyItems();

    this.itemNames.forEach((text) => text.destroy());
    this.itemStocks.forEach((text) => text.destroy());
    this.dummys.forEach((dummy) => dummy.destroy());
    this.itemNames = [];
    this.itemStocks = [];
    this.dummys = [];

    const matchedItems = Object.entries(playerItem)
      .filter(([key, _]) => this.targetPokeballs.includes(key))
      .map(([key, item]) => ({ key, ...item }));

    const totalHeight = matchedItems.length * (this.contentHeight + this.contentSpacing);
    const dynamicHeight = Math.max(totalHeight, this.minWindowHeight) + this.contentSpacing;
    const windowY = this.fixedBottomY - dynamicHeight / this.scale;

    this.window.setSize(this.windowWidth / this.scale, dynamicHeight / this.scale + this.contentSpacing);
    this.window.setPosition(+730, windowY + this.itemNames.length * this.contentSpacing);

    const paddingTop = 20;
    let currentY = windowY - dynamicHeight / 2 + paddingTop;

    for (const item of matchedItems) {
      const target = getItem(item.key);
      if (!target) return;

      const nameText = addText(this.scene, +555, currentY, target.name, TEXTSTYLE.OVERWORLD_LIST).setOrigin(0, 0.5);
      const stockText = addText(this.scene, +865, currentY, 'x ' + item.stock.toString(), TEXTSTYLE.OVERWORLD_LIST).setOrigin(0, 0.5);
      const dummy = addImage(this.scene, TEXTURE.BLANK, +530, currentY).setScale(1.4);

      this.itemNames.push(nameText);
      this.itemStocks.push(stockText);
      this.dummys.push(dummy);

      currentY += this.contentHeight + this.contentSpacing;
    }

    this.container.add(this.itemNames);
    this.container.add(this.itemStocks);
    this.container.add(this.dummys);
    this.container.setVisible(true);
    this.pause(false);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.itemNames.forEach((text) => text.destroy());
    this.itemStocks.forEach((text) => text.destroy());
    this.dummys.forEach((dummy) => dummy.destroy());
    this.itemNames = [];
    this.itemStocks = [];
    this.dummys = [];
    this.pause(true);
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  update(time: number, delta: number): void {}

  private block() {}

  private unblock() {
    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT, KEY.CANCEL];
    const keyboardManager = KeyboardManager.getInstance();

    let start = 0;
    let end = this.itemNames.length - 1;
    let choice = start;

    this.dummys[choice].setTexture(TEXTURE.ARROW_W_R);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback(async (key) => {
      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            if (choice > start) {
              choice--;
            }
            break;
          case KEY.DOWN:
            if (choice < end && choice < this.itemNames.length - 1) {
              choice++;
            }
            break;
          case KEY.CANCEL:
            this.dummys[choice].setTexture(TEXTURE.BLANK);
            this.clean();
            this.mode.popUiStack();
            break;
        }
        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
            this.dummys[choice].setTexture(TEXTURE.ARROW_W_R);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }
}
