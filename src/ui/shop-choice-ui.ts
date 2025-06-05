import { TEXTURE } from '../enums/texture';
import i18next from 'i18next';
import { OverworldMode } from '../modes-test';
import { InGameScene } from '../scenes/ingame-scene';
import { addText, addWindow, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { KeyboardManager } from '../managers';
import { NpcObject } from '../object/npc-object';
import { Item } from '../data/items';
import { ShopUi } from './shop-ui';

export interface BuyInfo {
  npc: NpcObject;
  item: Item;
}

export class ShopChoiceUi extends Ui {
  private mode: OverworldMode;
  private shopUi!: ShopUi;

  private container!: Phaser.GameObjects.Container;
  private npc!: NpcObject;
  private choice: number = 1;
  private cost!: number;
  private resultCost!: number;
  private item!: Item;

  private inBagText!: Phaser.GameObjects.Text;
  private countText!: Phaser.GameObjects.Text;
  private costText!: Phaser.GameObjects.Text;

  private readonly minChoice: number = 1;
  private readonly maxChoice: number = 99;

  constructor(scene: InGameScene, mode: OverworldMode, shopUi: ShopUi) {
    super(scene);
    this.mode = mode;
    this.shopUi = shopUi;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.scene.add.container(width / 2, height / 2);

    const inBagWindow = addWindow(this.scene, TEXTURE.WINDOW_2, -360, 330, 230, 50, 16, 16, 16, 16).setScale(1.4);
    const costWindow = addWindow(this.scene, TEXTURE.WINDOW_2, -30, 330, 230, 50, 16, 16, 16, 16).setScale(1.4);

    const textInBagTitle = addText(this.scene, -430, 330, i18next.t('menu:inBag'), TEXTSTYLE.MESSAGE_BLACK);
    this.inBagText = addText(this.scene, -320, 330, '1', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5);

    const textCountTitle = addText(this.scene, -150, 330, 'x', TEXTSTYLE.MESSAGE_BLACK);
    this.countText = addText(this.scene, -120, 330, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5);

    const textCostTitle = addText(this.scene, -20, 330, '$ ', TEXTSTYLE.MESSAGE_BLACK);
    this.costText = addText(this.scene, 0, 330, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5);

    this.container.add(inBagWindow);
    this.container.add(costWindow);
    this.container.add(textInBagTitle);
    this.container.add(this.inBagText);
    this.container.add(textCountTitle);
    this.container.add(this.countText);
    this.container.add(textCostTitle);
    this.container.add(this.costText);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI + 1);
    this.container.setScrollFactor(0);
  }

  show(data?: BuyInfo): void {
    if (data) {
      this.npc = data.npc;
      this.item = data.item;
    }

    this.choice = this.minChoice;
    this.resultCost = 0;
    this.renderText();

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

  update(time: number, delta: number): void {}

  private block() {}

  private unblock() {
    const keys = [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];
    const keyboardManager = KeyboardManager.getInstance();

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback(async (key) => {
      try {
        switch (key) {
          case KEY.UP:
            this.changeChoice(1);
            break;
          case KEY.DOWN:
            this.changeChoice(-1);
            break;
          case KEY.LEFT:
            this.changeChoice(-10);
            break;
          case KEY.RIGHT:
            this.changeChoice(10);
            break;
          case KEY.SELECT:
            this.clean();
            const bag = this.mode.getBag();
            const messageResult = await this.mode.startMessage(this.npc.reactionScript('npc002', 'question', 'welcome', i18next.t(`item:${this.item.key}.name`) + `x${this.choice}\n`));
            if (messageResult) {
              if (this.useMoney(this.resultCost)) {
                bag?.addItems(this.item.key, this.choice);
                const messageResult = await this.mode.startMessage(this.npc.reactionScript('npc002', 'talk', 'success'));
              } else {
                const messageResult = await this.mode.startMessage(this.npc.reactionScript('npc002', 'talk', 'reject'));
              }
            }
            break;
          case KEY.CANCEL:
            this.clean();
            this.shopUi.pause(false);
            break;
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  private changeChoice(amount: number) {
    let newChoice = this.choice + amount;

    if (newChoice < this.minChoice) {
      newChoice = this.minChoice;
    } else if (newChoice > this.maxChoice) {
      newChoice = this.maxChoice;
    }

    if (this.choice !== newChoice) {
      this.choice = newChoice;
      this.renderText();
    }
  }

  private renderText() {
    this.resultCost = this.choice * this.item.price;
    this.countText.setText(this.choice.toString());
    this.costText.setText(this.resultCost.toString());
  }

  private useMoney(cost: number) {
    const playerInfo = this.mode.getPlayerInfo();

    if (!playerInfo) {
      throw Error('PlayerInfo does not exist.');
    }

    return playerInfo.useMoney(cost);
  }
}
