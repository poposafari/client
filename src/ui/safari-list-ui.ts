import i18next from 'i18next';
import { getAllSafaris, safariData, SafariData } from '../data/overworld';
import { DEPTH } from '../enums/depth';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { KEY } from '../enums/key';
import { KeyboardManager } from '../managers';
import { NpcObject } from '../object/npc-object';

export class SafariListUi extends Ui {
  private mode: OverworldMode;
  private container!: Phaser.GameObjects.Container;
  private safaris!: SafariData[];
  private taxiNpc!: NpcObject;
  private lastChoice!: number | null;
  private lastPage!: number | null;

  private safariWindow!: Phaser.GameObjects.NineSlice;
  private safariWindowHeight!: number;
  private safariNames: Phaser.GameObjects.Text[] = [];
  private safariTicketCosts: Phaser.GameObjects.Text[] = [];
  private safariTicketIcons: Phaser.GameObjects.Image[] = [];
  private safariDummys: Phaser.GameObjects.Image[] = [];

  private yourStockWindow!: Phaser.GameObjects.NineSlice;
  private yourStockText!: Phaser.GameObjects.Text;

  private pageWindow!: Phaser.GameObjects.NineSlice;
  private pageText!: Phaser.GameObjects.Text;

  private spawnTypesWindow!: Phaser.GameObjects.NineSlice;
  private spawnTypesTexts: Phaser.GameObjects.Text[] = [];

  private readonly fixedTopY: number = -400;
  private readonly ListPerPage: number = 13;
  private readonly safariWindowWidth: number = 400;
  private readonly spawnTypesWindowWidth: number = 100;
  private readonly scale: number = 2;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();
    const contentHeight = 50;
    const spacing = 5;
    const bag = this.mode.getBag();

    this.lastChoice = null;
    this.lastPage = null;

    this.container = this.scene.add.container(width / 2 + 280, height / 2);

    this.safaris = getAllSafaris();
    this.safariWindowHeight = this.safaris.length * (contentHeight + spacing);

    this.safariWindow = addWindow(
      this.scene,
      TEXTURE.WINDOW_5,
      0,
      this.fixedTopY + this.safariWindowHeight / this.scale,
      this.safariWindowWidth / this.scale,
      this.safariWindowHeight / this.scale,
      16,
      16,
      16,
      16,
    ).setScale(this.scale);

    this.pageWindow = addWindow(this.scene, TEXTURE.WINDOW_5, +140, this.fixedTopY - contentHeight + 15, 60, contentHeight / this.scale + 5, 16, 16, 16, 16).setScale(this.scale);
    this.pageText = addText(this.scene, +120, this.fixedTopY - contentHeight + 15, '1/10', TEXTSTYLE.OVERWORLD_LIST).setOrigin(0, 0.5);

    this.yourStockWindow = addWindow(this.scene, TEXTURE.WINDOW_5, -63, this.fixedTopY - contentHeight + 15, 138, contentHeight / this.scale + 5, 16, 16, 16, 16).setScale(this.scale);
    this.yourStockText = addText(this.scene, -63, this.fixedTopY - contentHeight + 15, ``, TEXTSTYLE.OVERWORLD_LIST);

    this.spawnTypesWindow = addWindow(this.scene, TEXTURE.WINDOW_5, +305, this.fixedTopY + contentHeight / 2, this.spawnTypesWindowWidth, contentHeight / 2, 16, 16, 16, 16).setScale(this.scale);

    const spawnTypesTitle = addText(this.scene, +305, this.fixedTopY + contentHeight / 2, i18next.t('menu:typeTitle'), TEXTSTYLE.OVERWORLD_LIST);

    this.container.add(this.safariWindow);
    this.container.add(this.pageWindow);
    this.container.add(this.pageText);
    this.container.add(this.spawnTypesWindow);
    this.container.add(this.yourStockWindow);
    this.container.add(this.yourStockText);
    this.container.add(spawnTypesTitle);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE);
    this.container.setScrollFactor(0);

    this.renderPage(1);
  }

  show(data?: any): void {
    this.taxiNpc = data;
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

    let start = 0;
    let end = this.ListPerPage - 1;
    let choice = this.lastChoice ? this.lastChoice : start;
    let currentPage = this.lastPage ? this.lastPage : 1;
    const totalPages = Math.ceil(this.safaris.length / this.ListPerPage);
    const globalChoice = (currentPage - 1) * this.ListPerPage + choice;

    this.safariDummys[globalChoice].setTexture(TEXTURE.ARROW_W_R);
    this.renderSpawnTypes(globalChoice, currentPage);
    this.renderYourTickets();

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback(async (key) => {
      const prevChoice = choice;
      const prevPage = currentPage;

      try {
        switch (key) {
          case KEY.UP:
            if (choice > start) choice--;
            break;
          case KEY.DOWN:
            if (choice < end && choice < this.safaris.length - 1 - (currentPage - 1) * this.ListPerPage) {
              choice++;
            }
            break;
          case KEY.LEFT:
            if (currentPage > 1) {
              currentPage--;
            }
            break;
          case KEY.RIGHT:
            if (currentPage < totalPages) {
              currentPage++;
            }
            break;
          case KEY.SELECT:
            if (this.safaris.length <= 0) return;
            const globalChoice = (currentPage - 1) * this.ListPerPage + choice;
            const targetSafari = this.safaris[globalChoice];
            this.clean();
            const messageResult = await this.mode.startMessage(this.taxiNpc.reactionScript('npc000', 'question', 'welcome', i18next.t(`menu:overworld_${targetSafari.key}`)));
            if (!messageResult) {
              const messageResult = await this.mode.startMessage(this.taxiNpc.reactionScript('npc000', 'talk', 'sorry'));
              this.mode.popUiStack();
              this.safariDummys[choice].setTexture(TEXTURE.BLANK);
              this.renderPage(1);
            } else {
              if (!this.validateTicket(targetSafari.cost)) {
                const messageResult = await this.mode.startMessage(this.taxiNpc.reactionScript('npc000', 'talk', 'reject'));
                this.show(this.taxiNpc);
              } else {
                console.log('결제 완!');
                this.useTicket(targetSafari.cost);
                this.mode.pauseOverworldSystem(false);
                this.mode.popUiStack();
              }
            }
            break;
          case KEY.CANCEL:
            this.clean();
            this.mode.pauseOverworldSystem(false);
            this.mode.popUiStack();
            this.safariDummys[choice].setTexture(TEXTURE.BLANK);
            this.renderPage(1);
            break;
          default:
            console.error(`Unhandled key: ${key}`);
            break;
        }
        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            this.safariDummys[prevChoice].setTexture(TEXTURE.BLANK);
            this.safariDummys[choice].setTexture(TEXTURE.ARROW_W_R);
            this.renderSpawnTypes(choice, currentPage);
          }
        }
        if (key === KEY.LEFT || key === KEY.RIGHT) {
          if (currentPage !== prevPage) {
            this.renderPage(currentPage);
            choice = 0;
            this.safariDummys[choice].setTexture(TEXTURE.ARROW_W_R);
            this.updatePageText(currentPage);
            this.renderSpawnTypes(choice, currentPage);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  private renderPage(page: number) {
    const startIdx = (page - 1) * this.ListPerPage;
    const endIdx = Math.min(startIdx + this.ListPerPage, this.safaris.length);

    this.cleanPage();

    const contentHeight = 50;
    const spacing = 5;
    const totalCnt = endIdx - startIdx;
    const calcHeight = (totalCnt * (contentHeight + spacing)) / this.scale;
    this.safariWindow.setSize(this.safariWindowWidth / this.scale, calcHeight);
    this.safariWindow.setPosition(0, this.fixedTopY + calcHeight);

    let currentY = 0;

    for (let i = startIdx; i < endIdx; i++) {
      const safari = this.safaris[i];
      const name = addText(this.scene, -160, this.fixedTopY + currentY + 25, i18next.t(`menu:overworld_${safari.key}`), TEXTSTYLE.OVERWORLD_LIST).setOrigin(0, 0.5);
      const cost = addText(this.scene, +145, this.fixedTopY + currentY + 25, 'x' + safari.cost.toString(), TEXTSTYLE.OVERWORLD_LIST).setOrigin(0, 0.5);
      const icon = addImage(this.scene, 'item006', +120, this.fixedTopY + currentY + 25);
      const dummy = addImage(this.scene, TEXTURE.BLANK, -175, this.fixedTopY + currentY + 25).setScale(1.8);

      this.safariNames.push(name);
      this.safariTicketCosts.push(cost);
      this.safariTicketIcons.push(icon);
      this.safariDummys.push(dummy);

      currentY += contentHeight + spacing;
    }

    this.container.add(this.safariNames);
    this.container.add(this.safariTicketCosts);
    this.container.add(this.safariTicketIcons);
    this.container.add(this.safariDummys);

    this.updatePageText(page);
  }

  private cleanPage() {
    this.safariNames.forEach((name) => name.destroy());
    this.safariTicketCosts.forEach((cost) => cost.destroy());
    this.safariTicketIcons.forEach((icon) => icon.destroy());
    this.safariDummys.forEach((dummy) => dummy.destroy());

    this.safariNames = [];
    this.safariTicketCosts = [];
    this.safariTicketIcons = [];
    this.safariDummys = [];
  }

  private updatePageText(currentPage: number): void {
    const totalPages = Math.ceil(this.safaris.length / this.ListPerPage);
    this.pageText.setText(`${currentPage}/${totalPages}`);
  }

  private renderSpawnTypes(choice: number, page: number) {
    const globalChoice = (page - 1) * this.ListPerPage + choice;

    this.spawnTypesTexts.forEach((text) => {
      text.destroy();
    });
    this.spawnTypesTexts = [];

    const contentHeight = 50;
    const spacing = 5;
    const totalCnt = this.safaris[globalChoice].spawnTypes.length;
    const calcHeight = (totalCnt * (contentHeight + spacing)) / this.scale;
    this.spawnTypesWindow.setSize(this.spawnTypesWindowWidth, calcHeight + (contentHeight + spacing) / this.scale);
    this.spawnTypesWindow.setPosition(+305, this.fixedTopY + calcHeight + (contentHeight + spacing) / this.scale);

    let currentY = contentHeight + spacing;

    this.safaris[globalChoice].spawnTypes.forEach((value) => {
      const text = addText(this.scene, +305, this.fixedTopY + currentY + 25, i18next.t(`menu:type${value}`), TEXTSTYLE.OVERWORLD_LIST);

      this.spawnTypesTexts.push(text);

      currentY += contentHeight + spacing;
    });

    this.container.add(this.spawnTypesTexts);
  }

  private renderYourTickets() {
    const bag = this.mode.getBag();
    const ticket = bag?.getItem('006');
    let stock = 0;

    if (ticket) stock = ticket.getStock();

    this.yourStockText.setText(i18next.t('menu:yourTickets') + stock);
  }

  private validateTicket(cost: number): boolean {
    const bag = this.mode.getBag();

    if (!bag) {
      console.error('Bag does not exist');
      return false;
    }

    const myTicket = bag.getItem('006');

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

    bag.useItem('006', cost);
  }
}
