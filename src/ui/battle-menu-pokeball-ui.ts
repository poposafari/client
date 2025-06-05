import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { ITEM } from '../enums/item';
import { TEXTURE } from '../enums/texture';
import { PlayerItem } from '../object/player-item';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { KEY } from '../enums/key';
import { KeyboardManager } from '../managers';
import { BATTLE_STATUS } from '../enums/battle-status';
import { OverworldMode } from '../modes-test';
import { BattleUi } from './battle-ui';
import { BattleMenuDescUi } from './battle-menu-desc-ui';

export class BattleMenuPokeballUi extends Ui {
  private mode: OverworldMode;
  private battleUi: BattleUi;
  private battleMenuDescUi: BattleMenuDescUi;

  private container!: Phaser.GameObjects.Container;
  private descContainer!: Phaser.GameObjects.Container;

  private window!: Phaser.GameObjects.NineSlice;
  private windowHeight!: number;
  private names: Phaser.GameObjects.Text[] = [];
  private stocks: Phaser.GameObjects.Text[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];
  private pokeballs: PlayerItem[] = [];

  private readonly scale: number = 2;
  private readonly fixedBottomY: number = +340;
  private readonly contentHeight: number = 50;
  private readonly contentSpacing: number = 5;
  private readonly windowWidth = 450;
  keyboardManager: any;

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
    this.descContainer = this.scene.add.container(0, 0);

    this.window = addWindow(this.scene, TEXTURE.WINDOW_0, 0, 0, 0, 0, 16, 16, 16, 16).setScale(this.scale);

    this.container.add(this.window);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE_UI + 5);
    this.container.setScrollFactor(0);
  }

  show(): void {
    this.cleanWindow();
    const bag = this.mode.getBag();
    this.pokeballs = Object.values(bag?.getPockets(ITEM.POKEBALL)!);
    this.battleMenuDescUi.show(this.pokeballs[0]);

    const point = 365;
    const calcHeight = (this.pokeballs.length * (this.contentHeight + this.contentSpacing)) / this.scale;

    this.window.setSize(this.windowWidth / this.scale, calcHeight);
    this.window.setPosition(0, this.fixedBottomY - calcHeight);

    let currentY = 0;

    for (const item of this.pokeballs) {
      const additionalCalc = point - this.pokeballs.length * (this.contentHeight + this.contentSpacing);
      const name = addText(this.scene, -200, currentY + additionalCalc, i18next.t(`item:${item.getKey()}.name`), TEXTSTYLE.OVERWORLD_LIST).setOrigin(0, 0.5);
      const stock = addText(this.scene, +150, currentY + additionalCalc, 'x ' + item.getStock().toString(), TEXTSTYLE.OVERWORLD_LIST).setOrigin(0, 0.5);
      const dummy = addImage(this.scene, TEXTURE.BLANK, -210, currentY + additionalCalc).setScale(1.4);

      this.names.push(name);
      this.stocks.push(stock);
      this.dummys.push(dummy);

      currentY += this.contentHeight + this.contentSpacing;
    }

    this.container.add(this.names);
    this.container.add(this.stocks);
    this.container.add(this.dummys);
    this.container.setVisible(true);
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

    let start = 0;
    let end = this.pokeballs.length - 1;
    let choice = start;

    this.dummys[choice].setTexture(TEXTURE.ARROW_W_R);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback((key) => {
      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            if (choice > start) {
              choice--;
            }
            break;
          case KEY.DOWN:
            if (choice < end && choice < this.pokeballs.length - 1) {
              choice++;
            }
            break;
          case KEY.SELECT:
            const target = this.pokeballs[choice];
            this.dummys[choice].setTexture(TEXTURE.BLANK);
            this.clean();
            this.battleUi.handleBattleStatus(BATTLE_STATUS.THROW_POKEBALL, target);
            return;
          case KEY.CANCEL:
            this.dummys[choice].setTexture(TEXTURE.BLANK);
            this.clean();
            this.battleUi.handleBattleStatus(BATTLE_STATUS.MENU);
            return;
        }
        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
            this.dummys[choice].setTexture(TEXTURE.ARROW_W_R);
            this.battleMenuDescUi.updateDesc(this.pokeballs[choice]);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  private cleanWindow() {
    this.names.forEach((text) => text.destroy());
    this.stocks.forEach((text) => text.destroy());
    this.dummys.forEach((dummy) => dummy.destroy());
    this.names = [];
    this.stocks = [];
    this.dummys = [];
    this.pokeballs = [];
  }
}
