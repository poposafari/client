import i18next from 'i18next';
import { getAllSafaris, SafariData } from '../data/overworld';
import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager } from '../managers';
import { OverworldMode } from '../modes-test';
import { NpcObject } from '../object/npc-object';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, playSound, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { AUDIO } from '../enums/audio';

export class SafariListUi extends Ui {
  private mode: OverworldMode;
  private npc!: NpcObject;
  private safaris!: SafariData[];
  private start!: number;
  private choice!: number;

  private container!: Phaser.GameObjects.Container;
  private listContainer!: Phaser.GameObjects.Container;
  private scrollContainer!: Phaser.GameObjects.Container;

  private listWindow!: Phaser.GameObjects.NineSlice;
  private listNames: Phaser.GameObjects.Text[] = [];
  private listPrices: Phaser.GameObjects.Text[] = [];
  private listDummys: Phaser.GameObjects.NineSlice[] = [];

  private readonly listWindowWidth = 400;
  private readonly contentHeight = 40;
  private readonly spacing = 5;
  private readonly ItemsPerList = 10;
  private readonly scale = 2.5;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);

    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();
    this.start = 0;
    this.choice = 0;

    this.safaris = getAllSafaris();

    this.container = this.scene.add.container(width / 2 + 250, height / 2);
    this.listContainer = this.scene.add.container(width / 2 + 250, height / 2 - 161);
    this.scrollContainer = this.scene.add.container(width / 2 + 250, height / 2);

    this.listWindow = addWindow(
      this.scene,
      TEXTURE.WINDOW_5,
      0,
      0,
      this.listWindowWidth / this.scale,
      (this.ItemsPerList * (this.contentHeight + this.spacing) + this.spacing * 15) / this.scale,
      16,
      16,
      16,
      16,
    );

    const hideWindow = addWindow(
      this.scene,
      TEXTURE.WINDOW_8,
      0,
      0,
      this.listWindowWidth / this.scale,
      (this.ItemsPerList * (this.contentHeight + this.spacing) + this.spacing * 15) / this.scale,
      16,
      16,
      16,
      16,
    );

    this.container.add(this.listWindow);
    this.scrollContainer.add(hideWindow);

    this.container.setScale(this.scale);
    this.scrollContainer.setScale(this.scale);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE);
    this.container.setScrollFactor(0);

    this.listContainer.setVisible(false);
    this.listContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.listContainer.setScrollFactor(0);

    this.scrollContainer.setVisible(false);
    this.scrollContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.scrollContainer.setScrollFactor(0);
  }

  show(data?: NpcObject): void {
    if (data) this.npc = data;

    this.container.setVisible(true);
    this.scrollContainer.setVisible(true);
    this.listContainer.setVisible(true);

    this.renderList();
    this.handleKeyInput();
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.scrollContainer.setVisible(false);
    this.listContainer.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}

  private cleanList() {
    if (this.listContainer) {
      this.listContainer.removeAll(true);
    }

    this.listNames.forEach((text) => text.destroy());
    this.listPrices.forEach((text) => text.destroy());
    this.listDummys.forEach((image) => image.destroy());

    this.listNames = [];
    this.listPrices = [];
    this.listDummys = [];
  }

  private renderList() {
    const point = 410;
    let currentY = 0;

    this.cleanList();

    const visibleItems = this.safaris.slice(this.start, this.start + this.ItemsPerList);

    const beforeItem = this.safaris[this.start - 1];
    const afterItem = this.safaris[this.start + this.ItemsPerList];
    const adjustPosY = point - this.ItemsPerList * (this.contentHeight + this.spacing);

    if (beforeItem) {
      const [name, price, dummy, icon] = this.createListWindow(beforeItem, -83);

      this.listContainer.add(name);
      this.listContainer.add(price);
      this.listContainer.add(dummy);
      this.listContainer.add(icon);
    }

    if (afterItem) {
      const [name, price, dummy, icon] = this.createListWindow(afterItem, +410);

      this.listContainer.add(name);
      this.listContainer.add(price);
      this.listContainer.add(dummy);
      this.listContainer.add(icon);
    }

    for (const item of visibleItems) {
      const [name, price, dummy, icon] = this.createListWindow(item, currentY + adjustPosY) as [
        Phaser.GameObjects.Text,
        Phaser.GameObjects.Text,
        Phaser.GameObjects.NineSlice,
        Phaser.GameObjects.Image,
      ];

      this.listNames.push(name);
      this.listPrices.push(price);
      this.listDummys.push(dummy);

      this.listContainer.add(name);
      this.listContainer.add(price);
      this.listContainer.add(dummy);
      this.listContainer.add(icon);

      currentY += this.contentHeight + this.spacing;
    }
  }

  private createListWindow(safari: SafariData, y: number) {
    const name = addText(this.scene, -165, y, i18next.t(`menu:overworld_${safari.key}`), TEXTSTYLE.ITEM_LIST).setOrigin(0, 0.5);
    const price = addText(this.scene, +140, y, 'x' + safari.cost.toString(), TEXTSTYLE.ITEM_LIST).setOrigin(0, 0.5);
    const dummy = addWindow(this.scene, TEXTURE.BLANK, -1, y, (this.listWindowWidth - 25) / this.scale, (this.contentHeight + this.spacing) / this.scale, 16, 16, 16, 16).setScale(this.scale);
    const icon = addImage(this.scene, `item030`, +110, y);

    return [name, price, dummy, icon];
  }

  private handleKeyInput() {
    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT, KEY.CANCEL];
    const keyboardManager = KeyboardManager.getInstance();

    this.start = this.start ? this.start : 0;
    this.choice = this.choice ? this.choice : 0;

    this.listDummys[this.choice].setTexture(TEXTURE.WINDOW_6);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback(async (key) => {
      let prevChoice = this.choice;

      try {
        switch (key) {
          case KEY.UP:
            if (this.choice > 0) {
              this.choice--;
            } else if (this.start > 0) {
              prevChoice = 1;
              this.start--;
              this.renderList();
            }
            break;
          case KEY.DOWN:
            if (this.choice < Math.min(this.ItemsPerList, this.safaris.length) - 1) {
              this.choice++;
            } else if (this.start + this.ItemsPerList < this.safaris.length) {
              prevChoice = this.ItemsPerList - 2;
              this.start++;
              this.renderList();
            }
            break;
          case KEY.SELECT:
            playSound(this.scene, AUDIO.BAG_SELECT);
            this.container.setVisible(false);
            this.listContainer.setVisible(false);
            this.scrollContainer.setVisible(false);

            const overworld = this.safaris[this.start + this.choice].key;

            await this.mode.startMessage(this.npc.reactionScript({ messageType: 'question', talkType: 'action', etc: [`${i18next.t(`menu:overworld_${overworld}`)}`] })).then(async (reuslt) => {
              if (reuslt) {
                const res = (await this.mode.useTicket(overworld)) as any;
                if (res === 'not-enough-ticket') {
                  await this.mode.startMessage(this.npc.reactionScript({ messageType: 'talk', talkType: 'reject', etc: null }));
                  this.mode.popUiStack();
                  this.mode.setOverworldUiBlock(false);
                } else {
                  console.log(`Move to ${i18next.t(`menu:overworld_${this.start + this.choice}`)}`);
                  this.mode.setOverworldUiBlock(true);
                }
              } else {
                this.container.setVisible(true);
                this.listContainer.setVisible(true);
                this.scrollContainer.setVisible(true);
                this.handleKeyInput();
              }
            });
            break;
          case KEY.CANCEL:
            playSound(this.scene, AUDIO.BAG_CLOSE);

            this.mode.popUiStack();
            this.mode.setOverworldUiBlock(false);
            this.clean();
            await this.mode.startMessage(this.npc.reactionScript({ messageType: 'talk', talkType: 'end', etc: null }));
            break;
        }

        if (key === KEY.UP || key === KEY.DOWN) {
          if (this.choice !== prevChoice) {
            playSound(this.scene, AUDIO.BAG_DECISON);
            this.listDummys[prevChoice].setTexture(TEXTURE.BLANK);
            this.listDummys[this.choice].setTexture(TEXTURE.WINDOW_6);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }
}
