import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager } from '../managers';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addText, addWindow, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { getItem, Item } from '../data/items';

export class OverworldShopChoiceUi extends Ui {
  private mode: OverworldMode;
  private container!: Phaser.GameObjects.Container;
  private textInBag!: Phaser.GameObjects.Text;
  private textCount!: Phaser.GameObjects.Text;
  private textCost!: Phaser.GameObjects.Text;
  private choice: number = 1;
  private cost!: number;
  private targetItem!: string;
  private readonly minChoice: number = 1;
  private readonly maxChoice: number = 99;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.targetItem = '000';

    this.container = this.scene.add.container(width / 2, height / 2);

    const windowInBag = addWindow(this.scene, TEXTURE.WINDOW_7, -363, 337, 315, 80, 16, 16, 16, 16);
    const windowCost = addWindow(this.scene, TEXTURE.WINDOW_7, -45, 337, 315, 80, 16, 16, 16, 16);

    const textInBagTitle = addText(this.scene, -430, 337, i18next.t('menu:inBag'), TEXTSTYLE.MESSAGE_BLACK);
    this.textInBag = addText(this.scene, -320, 337, '1', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5);

    const textCountTitle = addText(this.scene, -165, 337, 'x', TEXTSTYLE.MESSAGE_BLACK);
    this.textCount = addText(this.scene, -140, 337, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5);

    const textCostTitle = addText(this.scene, -20, 337, '$ ', TEXTSTYLE.MESSAGE_BLACK);
    this.textCost = addText(this.scene, 0, 337, '1', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5);

    this.container.add(windowInBag);
    this.container.add(windowCost);
    this.container.add(textInBagTitle);
    this.container.add(this.textInBag);
    this.container.add(textCountTitle);
    this.container.add(this.textCount);
    this.container.add(textCostTitle);
    this.container.add(this.textCost);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI + 3);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    const playerItemManager = this.mode.getPlayerItemManager();
    this.targetItem = data;
    const item = playerItemManager.getMyItem(data);
    const itemInfo = getItem(data);

    this.cost = itemInfo!.price;

    this.textInBag.setText(item.stock.toString());

    this.choice = 1;
    this.textCount.setText(this.choice.toString());
    this.textCost.setText(`${this.choice * this.cost}`);

    this.container.setVisible(true);
    this.pause(false);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.pause(true);
  }

  pause(onoff: boolean): void {
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
            const messageResult = await this.mode.startMessage([{ type: 'default', format: 'question', content: i18next.t(`message:npc001_question`) }]);
            if (messageResult) {
              if (this.validateCalculate(this.targetItem, this.choice, this.cost) > 0) {
                const messageResult = await this.mode.startMessage([{ type: 'default', format: 'talk', content: i18next.t(`message:npc001_accept`) }]);
                this.mode.changeOverworldInfo(this.mode.getPlayerInfoManager().getInfo().currentOverworld);
                this.mode.chnageItemSlot();
              } else {
                const messageResult = await this.mode.startMessage([{ type: 'default', format: 'talk', content: i18next.t(`message:npc001_reject`) }]);
              }
            }
            this.targetItem = '000';
            this.mode.popUiStack();
            break;
          case KEY.CANCEL:
            this.clean();
            this.targetItem = '000';
            this.mode.pauseOverworldSystem(false);
            this.mode.popUiStack();
            break;
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  update(time: number, delta: number): void {}

  private changeChoice(amount: number): void {
    let newChoice = this.choice + amount;

    if (newChoice < this.minChoice) {
      newChoice = this.minChoice;
    } else if (newChoice > this.maxChoice) {
      newChoice = this.maxChoice;
    }

    if (this.choice !== newChoice) {
      this.choice = newChoice;
      this.textCount.setText(this.choice.toString());
      this.textCost.setText(`${this.choice * this.cost}`);
    }
  }

  private validateCalculate(targetItem: string, count: number, price: number) {
    const playerInfoManager = this.mode.getPlayerInfoManager();
    const playerItemManager = this.mode.getPlayerItemManager();

    const totalCost = count * price;

    if (playerInfoManager.getInfo().money < totalCost) {
      return -1;
    }

    playerInfoManager.setMoney(playerInfoManager.getInfo().money - totalCost);
    playerItemManager.increaseItemStock(targetItem, count);
    return 1;
  }
}
