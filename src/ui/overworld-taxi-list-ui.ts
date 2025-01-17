import { getOverworldInfo, getOverworlds } from '../data/overworld';
import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager } from '../managers';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, Ui } from './ui';
import i18next from 'i18next';

export class OverworldTaxiListUi extends Ui {
  private mode: OverworldMode;
  private container!: Phaser.GameObjects.Container;
  private overworldsText: Phaser.GameObjects.Text[] = [];
  private overworldsConsumeText: Phaser.GameObjects.Text[] = [];
  private overworldsConsumeTickets: Phaser.GameObjects.Image[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];
  private spawnTypesText: Phaser.GameObjects.Text[] = [];
  private windowSpawnType!: Phaser.GameObjects.NineSlice;
  private fixedTopY: number = -400;
  private overworldList!: string[];
  private overworldPageText!: Phaser.GameObjects.Text;
  private windowList!: Phaser.GameObjects.NineSlice;
  private windowStockTicket!: Phaser.GameObjects.NineSlice;
  private stockTicketContainer!: Phaser.GameObjects.Container;
  private stockTicketCount!: Phaser.GameObjects.Text;
  private readonly LIST_PER_PAGE: number = 13;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();
    const contentHeight = 50;
    const spacing = 5;
    this.overworldList = getOverworlds();
    const totalContentsHeight = this.overworldList.length * (contentHeight + spacing) - spacing;
    const minWindowListHeight = 200;
    const windowListWidth = 400;
    const windowListHeight = Math.max(totalContentsHeight, minWindowListHeight);

    this.windowList = addWindow(this.scene, TEXTURE.WINDOW_5, 0, this.fixedTopY + windowListHeight / 2, windowListWidth / 2, windowListHeight / 2, 16, 16, 16, 16).setScale(2);
    const windowPage = addWindow(this.scene, TEXTURE.WINDOW_5, +140, this.fixedTopY - contentHeight + 15, 60, contentHeight / 2 + 5, 16, 16, 16, 16).setScale(2);
    this.windowSpawnType = addWindow(this.scene, TEXTURE.WINDOW_5, +310, this.fixedTopY + contentHeight / 2, 100, contentHeight / 2, 16, 16, 16, 16).setScale(2);

    this.stockTicketContainer = this.scene.add.container(0, this.fixedTopY + windowListHeight + spacing);
    this.windowStockTicket = addWindow(this.scene, TEXTURE.WINDOW_5, 0, 0, windowListWidth / 2, 70, 16, 16, 16, 16).setScale(2);
    const stockTicketText = addText(this.scene, 0, -30, i18next.t('menu:stockTicket'), TEXTSTYLE.OVERWORLD_LIST).setOrigin(0.5, 0.5);
    const stockTicketIcon = addImage(this.scene, `item007`, -40, 20).setScale(1.5);
    this.stockTicketCount = addText(this.scene, 20, 20, 'x0', TEXTSTYLE.OVERWORLD_LIST).setOrigin(0.5, 0.5);
    this.stockTicketContainer.add(this.windowStockTicket);
    this.stockTicketContainer.add(stockTicketText);
    this.stockTicketContainer.add(stockTicketIcon);
    this.stockTicketContainer.add(this.stockTicketCount);

    this.container = this.scene.add.container(width / 2 + 320, height / 2);

    this.overworldsText = [];
    this.dummys = [];

    this.overworldList.forEach((key, index) => {
      const overworldInfo = getOverworldInfo(key);
      if (overworldInfo) {
        const yPosition = this.fixedTopY + contentHeight / 2 + index * (contentHeight + spacing);
        const text = addText(this.scene, -160, yPosition, overworldInfo.name, TEXTSTYLE.OVERWORLD_LIST).setOrigin(0, 0.5);
        const dummy = addImage(this.scene, TEXTURE.BLANK, -180, yPosition).setScale(1.5);

        this.overworldsText.push(text);
        this.dummys.push(dummy);
      }
    });

    const cancelText = addText(this.scene, -120, this.fixedTopY - contentHeight + 30, i18next.t('sys:selectOrCancelGuide'), TEXTSTYLE.INPUT_GUIDE);

    this.overworldPageText = addText(this.scene, +140, this.fixedTopY - contentHeight + 15, ``, TEXTSTYLE.OVERWORLD_LIST);

    this.container.add(this.windowList);
    this.container.add(windowPage);
    this.container.add(this.windowSpawnType);
    this.container.add(this.overworldsText);
    this.container.add(this.overworldPageText);
    this.container.add(this.stockTicketContainer);
    this.container.add(this.dummys);
    this.container.add(cancelText);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI + 1);
    this.container.setScrollFactor(0);

    this.renderPage(1);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.pause(false);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.pause(true);
  }

  pause(onoff: boolean): void {
    onoff ? this.block() : this.unblock();
  }

  update(time: number, delta: number): void {}

  private block() {}

  private unblock() {
    const playerItemManager = this.mode.getPlayerItemManager();
    const keys = [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];
    const keyboardManager = KeyboardManager.getInstance();

    let startIndex = 0;
    let endIndex = this.LIST_PER_PAGE - 1;
    let choice = startIndex;
    let currentPage = 1;
    const totalPages = Math.ceil(this.overworldList.length / this.LIST_PER_PAGE);

    this.dummys[choice].setTexture(TEXTURE.ARROW_W_R);
    this.showSpawnTypes(this.overworldList[choice]);

    this.stockTicketCount.setText(`x${playerItemManager.getMyItem('007').stock}`);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback(async (key) => {
      const prevChoice = choice;
      const prevPage = currentPage;

      try {
        switch (key) {
          case KEY.UP:
            if (choice > startIndex) {
              choice--;
            }
            break;
          case KEY.DOWN:
            if (choice < endIndex && choice < this.overworldList.length - 1 - (currentPage - 1) * this.LIST_PER_PAGE) {
              choice++;
            }
            break;
          case KEY.LEFT:
            if (currentPage > 1) {
              currentPage--;
              this.renderPage(currentPage);
              choice = 0;
              this.dummys[choice].setTexture(TEXTURE.ARROW_W_R);
            }
            break;
          case KEY.RIGHT:
            if (currentPage < totalPages) {
              currentPage++;
              this.renderPage(currentPage);
              choice = 0;
              this.dummys[choice].setTexture(TEXTURE.ARROW_W_R);
            }
            break;
          case KEY.SELECT:
            const overworld = this.overworldList[(currentPage - 1) * this.LIST_PER_PAGE + choice];
            const overworldInfo = getOverworldInfo(overworld);
            if (overworldInfo) {
              const ret = this.validateTickets(overworldInfo?.consume);
              if (ret >= 0) {
                this.useTickets(ret);
                this.clean();
                this.mode.chnageItemSlot();
                this.mode.pauseOverworldSystem(true);
                this.mode.popUiStack();
                this.mode.changeOverworld(overworld);
              } else {
                this.clean();
                const messageResult = await this.mode.startMessage([{ type: 'default', format: 'talk', content: i18next.t(`message:npc000_reject`) }]);
                this.show();
              }
            }
            break;
          case KEY.CANCEL:
            this.clean();
            this.dummys[choice].setTexture(TEXTURE.BLANK);
            this.mode.pauseOverworldSystem(false);
            this.mode.popUiStack();
          default:
            console.error(`Unhandled key: ${key}`);
            break;
        }

        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
            this.dummys[choice].setTexture(TEXTURE.ARROW_W_R);
            const globalChoice = (currentPage - 1) * this.LIST_PER_PAGE + choice;
            this.showSpawnTypes(this.overworldList[globalChoice]);
          }
        }

        if (key === KEY.LEFT || key === KEY.RIGHT) {
          if (currentPage !== prevPage) {
            this.updatePageText(currentPage);
            const globalChoice = (currentPage - 1) * this.LIST_PER_PAGE + choice;
            this.showSpawnTypes(this.overworldList[globalChoice]);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  private showSpawnTypes(overworldIdx: string) {
    this.spawnTypesText.forEach((text) => {
      this.container.remove(text, true);
    });
    this.spawnTypesText = [];

    const overworldInfo = getOverworldInfo(overworldIdx);
    const contentHeight = 50;
    const spacing = 5;

    const totalContentsHeight = (overworldInfo!.spawnTypes.length + 1) * (contentHeight + spacing) - spacing;
    const minWindowHeight = 50 + spacing + spacing + spacing;
    const windowHeight = Math.max(totalContentsHeight, minWindowHeight);

    this.windowSpawnType.setSize(100, windowHeight / 2);
    this.windowSpawnType.setPosition(+305, windowHeight / 2 - this.fixedTopY - 800);

    const startY = this.fixedTopY + spacing + contentHeight / 2;

    const title = addText(this.scene, +235, startY, i18next.t(`menu:typeTitle`), TEXTSTYLE.OVERWORLD_LIST).setOrigin(0, 0.5);
    this.spawnTypesText.push(title);

    overworldInfo?.spawnTypes.forEach((key, index) => {
      const yPosition = this.fixedTopY + spacing + contentHeight / 2 + (index + 1) * contentHeight;
      const text = addText(this.scene, +305, yPosition, i18next.t(`menu:type${key.toString()}`), TEXTSTYLE.OVERWORLD_LIST);
      this.spawnTypesText.push(text);
    });
    this.container.add(this.spawnTypesText);
  }

  private renderPage(page: number): void {
    const startIdx = (page - 1) * this.LIST_PER_PAGE;
    const endIdx = Math.min(startIdx + this.LIST_PER_PAGE, this.overworldList.length);

    this.overworldsConsumeTickets.forEach((icon) => icon.destroy());
    this.overworldsConsumeText.forEach((text) => text.destroy());
    this.overworldsText.forEach((text) => text.destroy());
    this.dummys.forEach((dummy) => dummy.destroy());

    this.overworldsConsumeTickets = [];
    this.overworldsConsumeText = [];
    this.overworldsText = [];
    this.dummys = [];

    const contentHeight = 50;
    const spacing = 5;
    const totalItems = endIdx - startIdx;
    const minWindowHeight = 50 + spacing + spacing + spacing;
    const calculatedHeight = totalItems * (contentHeight + spacing) - spacing + spacing;

    const windowListHeight = Math.max(calculatedHeight, minWindowHeight);
    this.windowList.setSize(400 / 2, windowListHeight / 2);
    this.windowList.setPosition(0, this.fixedTopY + windowListHeight / 2);

    const stockTicketY = this.fixedTopY + windowListHeight + spacing + 70;
    this.stockTicketContainer.setPosition(0, stockTicketY);

    for (let i = startIdx; i < endIdx; i++) {
      const overworldInfo = getOverworldInfo(this.overworldList[i]);
      if (overworldInfo) {
        const yPosition = this.fixedTopY + contentHeight / 2 + (i - startIdx) * (contentHeight + spacing);
        const text = addText(this.scene, -160, yPosition + spacing, overworldInfo.name, TEXTSTYLE.OVERWORLD_LIST).setOrigin(0, 0.5);
        const consumeText = addText(this.scene, +155, yPosition + spacing, `x${overworldInfo.consume.toString()}`, TEXTSTYLE.OVERWORLD_LIST).setOrigin(0, 0.5);
        const icons = addImage(this.scene, `item007`, +130, yPosition + 3).setScale(0.7);
        const dummy = addImage(this.scene, TEXTURE.BLANK, -180, yPosition).setScale(1.5);

        this.overworldsConsumeTickets.push(icons);
        this.overworldsConsumeText.push(consumeText);
        this.overworldsText.push(text);
        this.dummys.push(dummy);
      }
    }

    this.container.add(this.overworldsConsumeTickets);
    this.container.add(this.overworldsConsumeText);
    this.container.add(this.overworldsText);
    this.container.add(this.dummys);

    this.updatePageText(page);
  }

  private updatePageText(currentPage: number): void {
    const totalPages = Math.ceil(this.overworldList.length / this.LIST_PER_PAGE);
    this.overworldPageText.setText(`${currentPage}/${totalPages}`);
  }

  private validateTickets(requiredTickets: number): number {
    const playerItem = this.mode.getPlayerItemManager();
    const stock = playerItem.getMyItem('007').stock ?? 0;

    if (stock < requiredTickets) {
      return -1;
    }

    return stock - requiredTickets;
  }

  private useTickets(value: number) {
    const playerItem = this.mode.getPlayerItemManager();
    playerItem.setItemStock('007', value);
    return true;
  }
}
