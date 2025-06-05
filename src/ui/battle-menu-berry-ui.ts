import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { ITEM } from '../enums/item';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes-test';
import { PlayerItem } from '../object/player-item';
import { InGameScene } from '../scenes/ingame-scene';
import { BattleUi } from './battle-ui';
import { addImage, addText, addWindow, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { KEY } from '../enums/key';
import { KeyboardManager } from '../managers';
import { BATTLE_STATUS } from '../enums/battle-status';
import { BattleMenuDescUi } from './battle-menu-desc-ui';

export class BattleMenuBerryUi extends Ui {
  private mode: OverworldMode;
  private battleUi: BattleUi;
  private battleMenuDescUi: BattleMenuDescUi;
  private start!: number;

  private container!: Phaser.GameObjects.Container;
  private listContainer!: Phaser.GameObjects.Container;

  private window!: Phaser.GameObjects.NineSlice;
  private windowHeight!: number;
  private names: Phaser.GameObjects.Text[] = [];
  private stocks: Phaser.GameObjects.Text[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];
  private berries: PlayerItem[] = [];

  private readonly scale: number = 2;
  private readonly fixedBottomY: number = +340;
  private readonly contentHeight: number = 50;
  private readonly contentSpacing: number = 5;
  private readonly windowWidth = 450;
  private readonly ITEMS_PER_PAGE = 8;

  constructor(scene: InGameScene, mode: OverworldMode, battleUi: BattleUi) {
    super(scene);
    this.mode = mode;
    this.battleUi = battleUi;
    this.battleMenuDescUi = new BattleMenuDescUi(scene, mode);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.battleMenuDescUi.setup();

    this.container = this.scene.add.container(width / 2 + 735, height / 2);
    this.listContainer = this.scene.add.container(0, 0);

    this.window = addWindow(this.scene, TEXTURE.WINDOW_0, 0, 0, 0, 0, 16, 16, 16, 16).setScale(this.scale);

    this.container.add(this.window);
    this.container.add(this.listContainer);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE_UI + 5);
    this.container.setScrollFactor(0);
  }

  show(): void {
    const bag = this.mode.getBag();
    if (bag) this.berries = Object.values(bag.getPockets(ITEM.BERRY));

    this.battleMenuDescUi.show(this.berries[0]);
    this.start = 0;
    this.renderWindow();
    this.pause(false);
  }

  clean(data?: any): void {
    this.battleMenuDescUi.clean();
    this.cleanWindow();
    this.container.setVisible(false);
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

    let choice = 0;
    this.start = 0;

    this.dummys[choice].setTexture(TEXTURE.ARROW_W_R);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback((key) => {
      let prevChoice = choice;
      try {
        switch (key) {
          case KEY.UP:
            if (choice > 0) {
              choice--;
            } else if (this.start > 0) {
              prevChoice = 1;
              this.start--;
              this.renderWindow();
            }
            break;
          case KEY.DOWN:
            if (choice < Math.min(this.ITEMS_PER_PAGE, this.berries.length) - 1) {
              choice++;
            } else if (this.start + this.ITEMS_PER_PAGE < this.berries.length) {
              prevChoice = 6;
              this.start++;
              this.renderWindow();
            }
            break;
          case KEY.SELECT:
            const target = this.berries[choice + this.start];
            this.dummys[choice].setTexture(TEXTURE.BLANK);
            this.clean();
            this.battleUi.handleBattleStatus(BATTLE_STATUS.THROW_BERRY, target);
            return;
          case KEY.CANCEL:
            this.dummys[choice].setTexture(TEXTURE.BLANK);
            this.clean();
            this.battleUi.handleBattleStatus(BATTLE_STATUS.MENU);
            return;
        }
        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            this.battleMenuDescUi.show(this.berries[choice + this.start]);
            this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
            this.dummys[choice].setTexture(TEXTURE.ARROW_W_R);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  private cleanWindow() {
    if (this.listContainer) {
      this.listContainer.removeAll(true);
    }

    this.names.forEach((text) => text.destroy());
    this.stocks.forEach((text) => text.destroy());
    this.dummys.forEach((dummy) => dummy.destroy());

    this.names = [];
    this.stocks = [];
    this.dummys = [];
  }

  private renderWindow() {
    const point = 365;
    const calcHeight = (this.ITEMS_PER_PAGE * (this.contentHeight + this.contentSpacing)) / this.scale;
    let currentY = 0;

    this.cleanWindow();

    this.window.setSize(this.windowWidth / this.scale, calcHeight);
    this.window.setPosition(0, this.fixedBottomY - calcHeight);

    const visibleItems = this.berries.slice(this.start, this.start + this.ITEMS_PER_PAGE);

    for (const item of visibleItems) {
      const additionalCalc = point - this.ITEMS_PER_PAGE * (this.contentHeight + this.contentSpacing);
      const name = addText(this.scene, -200, currentY + additionalCalc, i18next.t(`item:${item.getKey()}.name`), TEXTSTYLE.OVERWORLD_LIST).setOrigin(0, 0.5);
      const stock = addText(this.scene, +150, currentY + additionalCalc, 'x ' + item.getStock().toString(), TEXTSTYLE.OVERWORLD_LIST).setOrigin(0, 0.5);
      const dummy = addImage(this.scene, TEXTURE.BLANK, -210, currentY + additionalCalc).setScale(1.4);

      this.names.push(name);
      this.stocks.push(stock);
      this.dummys.push(dummy);

      this.listContainer.add(name);
      this.listContainer.add(stock);
      this.listContainer.add(dummy);

      currentY += this.contentHeight + this.contentSpacing;
    }

    this.container.setVisible(true);
  }
}
