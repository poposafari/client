import i18next from 'i18next';
import { getAllSafaris, SafariData } from '../data/overworld';
import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager } from '../managers';
import { OverworldMode } from '../modes';
import { NpcObject } from '../object/npc-object';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';

export class SafariListUi extends Ui {
  private mode: OverworldMode;
  private npc!: NpcObject;
  private safaris!: SafariData[];
  private start!: number;

  private container!: Phaser.GameObjects.Container;
  private listContainer!: Phaser.GameObjects.Container;
  private descContainer!: Phaser.GameObjects.Container;

  private arrowUp!: Phaser.GameObjects.Image;
  private arrowDown!: Phaser.GameObjects.Image;

  private window!: Phaser.GameObjects.NineSlice;
  private names: Phaser.GameObjects.Text[] = [];
  private icons: Phaser.GameObjects.Image[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];
  private costs: Phaser.GameObjects.Text[] = [];

  private yourTicketWindow!: Phaser.GameObjects.NineSlice;
  private stock!: Phaser.GameObjects.Text;

  private descWindow!: Phaser.GameObjects.NineSlice;
  private spawnTypes: Phaser.GameObjects.Image[] = [];

  private readonly scale: number = 4;
  private readonly ITEMS_PER_PAGE = 8;
  private readonly contentHeight: number = 60;
  private readonly contentSpacing: number = 5;
  private readonly windowWidth = 350;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);

    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.safaris = getAllSafaris();

    this.container = this.scene.add.container(width / 2 + 250, height / 2 - 100);
    this.listContainer = this.scene.add.container(0, 0);
    this.descContainer = this.scene.add.container(+300, -95);

    this.arrowUp = addImage(this.scene, TEXTURE.ARROW_RED, +170, -115).setFlipY(true);
    this.arrowDown = addImage(this.scene, TEXTURE.ARROW_RED, +170, +375);
    this.arrowUp.setScale(1.4).setVisible(false);
    this.arrowDown.setScale(1.4).setVisible(false);

    this.window = addWindow(this.scene, TEXTURE.WINDOW_1, 0, 0, 0, 0, 8, 8, 8, 8).setScale(this.scale);
    const yourTicketTitle = addText(this.scene, -50, -180, i18next.t(`menu:yourTickets`), TEXTSTYLE.ITEM_LIST);
    this.stock = addText(this.scene, +70, -180, '3', TEXTSTYLE.ITEM_LIST);
    this.yourTicketWindow = addWindow(this.scene, TEXTURE.WINDOW_1, 0, -180, 86, 20, 8, 8, 8, 8).setScale(this.scale);

    this.descWindow = addWindow(this.scene, TEXTURE.WINDOW_1, +300, -180, 60, 20, 8, 8, 8, 8).setScale(this.scale);
    const spawnTypesTitle = addText(this.scene, +300, -180, i18next.t('menu:typeTitle'), TEXTSTYLE.ITEM_LIST);

    this.container.add(this.window);
    this.container.add(this.listContainer);
    this.container.add(this.arrowUp);
    this.container.add(this.arrowDown);
    this.container.add(this.yourTicketWindow);
    this.container.add(yourTicketTitle);
    this.container.add(this.stock);
    this.container.add(this.descWindow);
    this.container.add(spawnTypesTitle);
    this.container.add(this.descContainer);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE);
    this.container.setScrollFactor(0);
  }

  show(data?: NpcObject): void {
    if (data) this.npc = data;

    this.start = 0;

    this.renderYourTickets();
    this.renderWindow();

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
    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT, KEY.CANCEL];
    const keyboardManager = KeyboardManager.getInstance();

    let choice = 0;
    this.start = 0;

    this.dummys[choice].setTexture(TEXTURE.ARROW_B_R);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback(async (key) => {
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
            if (choice < Math.min(this.ITEMS_PER_PAGE, this.safaris.length) - 1) {
              choice++;
            } else if (this.start + this.ITEMS_PER_PAGE < this.safaris.length) {
              prevChoice = this.ITEMS_PER_PAGE - 2;
              this.start++;
              this.renderWindow();
            }
            break;
          case KEY.SELECT:
            const target = this.safaris[choice + this.start];
            this.clean();
            const messageResult = await this.mode.startMessage(this.npc.reactionScript('npc000', 'question', 'welcome', i18next.t(`menu:overworld_${target.key}`)));
            if (!messageResult) {
              const messageResult = await this.mode.startMessage(this.npc.reactionScript('npc000', 'talk', 'sorry'));
              this.mode.popUiStack();
              this.dummys[choice].setTexture(TEXTURE.BLANK);
              this.start = 0;
            } else {
              if (!this.validateTicket(target.cost)) {
                const messageResult = await this.mode.startMessage(this.npc.reactionScript('npc000', 'talk', 'reject'));
                this.show(this.npc);
              } else {
                this.useTicket(target.cost);
                this.mode.pauseOverworldSystem(false);
                this.clean();
                this.mode.popUiStack();
                this.mode.updateOverworld(target.key);
              }
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
            this.renderSpawnTypes(choice);
            this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
            this.dummys[choice].setTexture(TEXTURE.ARROW_B_R);
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
    this.costs.forEach((text) => text.destroy());
    this.icons.forEach((image) => image.destroy());
    this.dummys.forEach((image) => image.destroy());

    this.names = [];
    this.costs = [];
    this.icons = [];
    this.dummys = [];
  }

  private renderWindow() {
    const point = 430;
    const calcHeight = (this.ITEMS_PER_PAGE * (this.contentHeight + this.contentSpacing)) / this.scale;

    let currentY = 0;

    this.cleanWindow();

    this.window.setSize(this.windowWidth / this.scale, calcHeight);
    this.window.setPosition(0, calcHeight);

    if (this.start <= 0) this.arrowUp.setVisible(false);
    if (this.start > 0) this.arrowUp.setVisible(true);

    if (this.start + this.ITEMS_PER_PAGE >= this.safaris.length) this.arrowDown.setVisible(false);
    else this.arrowDown.setVisible(true);

    const visibleSafaris = this.safaris.slice(this.start, this.start + this.ITEMS_PER_PAGE);

    for (const safari of visibleSafaris) {
      const additionalCalc = point - this.ITEMS_PER_PAGE * (this.contentHeight + this.contentSpacing);
      const name = addText(this.scene, -140, currentY + additionalCalc, i18next.t(`menu:overworld_${safari.key}`), TEXTSTYLE.ITEM_LIST).setOrigin(0, 0.5);
      const cost = addText(this.scene, +125, currentY + additionalCalc, 'x' + safari.cost.toString(), TEXTSTYLE.ITEM_LIST).setOrigin(0, 0.5);
      const icon = addImage(this.scene, 'item030', +100, currentY + additionalCalc);
      const dummy = addImage(this.scene, TEXTURE.BLANK, -150, currentY + additionalCalc).setScale(1.2);

      this.names.push(name);
      this.costs.push(cost);
      this.icons.push(icon);
      this.dummys.push(dummy);

      this.listContainer.add(name);
      this.listContainer.add(cost);
      this.listContainer.add(icon);
      this.listContainer.add(dummy);

      currentY += this.contentHeight + this.contentSpacing;
    }
  }

  private renderYourTickets() {
    const bag = this.mode.getBag();
    const ticket = bag?.getItem('030');
    let stock = 0;

    if (ticket) stock = ticket.getStock();

    this.stock.setText(stock.toString());
  }

  private renderSpawnTypes(choice: number) {
    const globalChoice = choice + this.start;
    const contentHeight = 70;
    const spacing = 5;

    let currentY = 0;

    this.cleanSpawnTypes();

    this.safaris[globalChoice].spawnTypes.forEach((value) => {
      const image = addImage(this.scene, TEXTURE.TYPES, 0, currentY).setScale(2.5);
      image.setTexture(TEXTURE.TYPES, `types-${value}`);

      currentY += contentHeight + spacing;

      this.descContainer.add(image);
    });
  }

  private cleanSpawnTypes() {
    if (this.descContainer) {
      this.descContainer.removeAll(true);
    }
  }

  private validateTicket(cost: number): boolean {
    const bag = this.mode.getBag();

    if (!bag) {
      console.error('Bag does not exist');
      return false;
    }

    const myTicket = bag.getItem('030');

    if (!myTicket) return false;

    if (myTicket?.getStock() < cost) {
      return false;
    }

    return true;
  }

  private useTicket(cost: number) {
    const bag = this.mode.getBag();

    if (!bag) {
      console.error('Bag does not exist');
      return 0;
    }

    bag.useItem('030', cost);
  }
}
