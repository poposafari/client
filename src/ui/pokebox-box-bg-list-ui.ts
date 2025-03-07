import i18next from 'i18next';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { PokeboxBoxUi } from './pokebox-box-ui';
import { PokeBoxUi } from './pokebox-ui';
import { addImage, addText, Ui } from './ui';
import { TEXTURE } from '../enums/texture';
import { DEPTH } from '../enums/depth';
import { KeyboardManager } from '../managers';
import { KEY } from '../enums/key';
import { TEXTSTYLE } from '../enums/textstyle';
import { PokeboxBoxMenuUi } from './pokebox-box-menu-ui';

export class PokeboxBoxBgListUi extends Ui {
  private mode: OverworldMode;
  private pokeboxUi: PokeBoxUi;
  private pokeboxBoxMenuUi: PokeboxBoxMenuUi;
  private start!: number;
  private targetPage!: number;

  private container!: Phaser.GameObjects.Container;
  private listContainer!: Phaser.GameObjects.Container;

  private texts: string[] = [];
  private windows: Phaser.GameObjects.Image[] = [];

  private readonly ITEMS_PER_PAGE = 5;

  constructor(scene: InGameScene, mode: OverworldMode, pokeboxUi: PokeBoxUi, pokeboxBoxMenuUi: PokeboxBoxMenuUi) {
    super(scene);
    this.mode = mode;
    this.pokeboxUi = pokeboxUi;
    this.pokeboxBoxMenuUi = pokeboxBoxMenuUi;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    for (let idx = 0; idx <= 15; idx++) {
      this.texts.push(i18next.t(`menu:box${idx}`));
    }

    this.container = this.scene.add.container(width / 2, height / 2);
    this.listContainer = this.scene.add.container(750, 0).setScale(2.3);

    this.container.add(this.listContainer);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.container.setScrollFactor(0);
  }

  show(data?: number): void {
    if (data) this.targetPage = data - 1;
    // console.log('pokebox-box-bg-list-ui: ' + this.targetPage);

    this.container.setVisible(true);
    this.pause(false);

    this.renderList();
    this.renderChoice(1, 0);
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
    const keyboardManager = KeyboardManager.getInstance();
    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT, KEY.CANCEL];

    let choice = 0;
    this.start = 0;

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback((key) => {
      let prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            if (choice > 0) choice--;
            else if (this.start > 0) {
              prevChoice = 1;
              this.start--;
              this.renderList();
            }
            break;
          case KEY.DOWN:
            if (choice < Math.min(this.ITEMS_PER_PAGE, this.texts.length) - 1) {
              choice++;
            } else if (this.start + this.ITEMS_PER_PAGE < this.texts.length) {
              prevChoice = 5;
              this.start++;
              this.renderList();
            }
            break;
          case KEY.SELECT:
            this.pokeboxUi.updateBox(this.targetPage, choice + this.start);
            break;
          case KEY.CANCEL:
            this.clean();
            this.windows[choice].setTexture(TEXTURE.CHOICE);
            this.pokeboxBoxMenuUi.show();
            break;
        }

        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            this.renderChoice(prevChoice, choice);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  private renderList() {
    const spacing = 1;
    const contentHeight = 50;
    let currentY = 0;

    this.cleanList();

    const visibleItems = this.texts.slice(this.start, this.start + this.ITEMS_PER_PAGE);

    for (const key of visibleItems) {
      if (key) {
        const window = addImage(this.scene, TEXTURE.CHOICE, 0, currentY);
        const name = addText(this.scene, -60, currentY + contentHeight / 2 - 25, i18next.t(`menu:${key}`), TEXTSTYLE.ITEM_TITLE).setOrigin(0, 0.5);

        this.windows.push(window);
        this.listContainer.add(window);
        this.listContainer.add(name);

        currentY += contentHeight + spacing;
      }
    }
  }

  private renderChoice(prev: number, current: number) {
    if (this.windows[prev]) this.windows[prev].setTexture(TEXTURE.CHOICE);
    if (this.windows[current]) this.windows[current].setTexture(TEXTURE.CHOICE_S);
  }

  private cleanList() {
    if (this.listContainer) {
      this.listContainer.removeAll(true);
    }

    this.windows.forEach((window) => {
      window.destroy();
    });

    this.windows = [];
  }
}
