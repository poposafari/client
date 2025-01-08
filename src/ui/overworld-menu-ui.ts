import { DEPTH } from '../enums/depth';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, Ui } from './ui';
import { KEY } from '../enums/key';
import { KeyboardManager } from '../managers';
import { TEXTSTYLE } from '../enums/textstyle';
import i18next from 'i18next';

export class OverworldMenuUi extends Ui {
  private mode: OverworldMode;
  private container!: Phaser.GameObjects.Container;
  private menuSlotBtns: Phaser.GameObjects.Image[] = [];
  private dummys: Phaser.GameObjects.NineSlice[] = [];
  private texts: Phaser.GameObjects.Text[] = [];
  private window!: Phaser.GameObjects.NineSlice;
  private guideText!: Phaser.GameObjects.Text;
  private selectedIndex: number = 0;
  private readonly MENU_LIST_ICON = [TEXTURE.MENU_POKEDEX, TEXTURE.MENU_BOX, TEXTURE.MENU_BAG, TEXTURE.MENU_CARD, TEXTURE.MENU_DOLL];
  private readonly MENU_LIST_TEXT = [i18next.t('menu:menuPokedex'), i18next.t('menu:menuPokemon'), i18next.t('menu:menuBag'), i18next.t('menu:menuTrainerCard'), i18next.t('menu:menuCloset')];
  private readonly FIXED_TOP_Y: number = -150;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    const slotSize = 20;
    const slotSpacing = 3;
    const totalHeight = this.MENU_LIST_ICON.length * (slotSize + slotSpacing * 1.8);
    const minWindowHeight = 100;
    const windowHeight = Math.max(minWindowHeight, totalHeight);

    this.container = this.scene.add.container(width / 2 + 750, height / 2);

    this.window = addWindow(this.scene, TEXTURE.WINDOW_4, 0, this.FIXED_TOP_Y + windowHeight / 2, 110, windowHeight, 16, 16, 16, 16);

    this.guideText = addText(this.scene, width / 2 + 655, 40, i18next.t('sys:selectOrCancelGuide'), TEXTSTYLE.INPUT_GUIDE).setOrigin(0.5, 0.5);

    for (let i = 0; i < this.MENU_LIST_ICON.length; i++) {
      const yPosition = this.FIXED_TOP_Y + i * (slotSize + slotSpacing) + slotSize / 2 + 6;
      const menuIcon = addImage(this.scene, this.MENU_LIST_ICON[i], -36, yPosition);
      const dummy = addWindow(this.scene, TEXTURE.BLANK, -51, yPosition, 102, 25, 16, 16, 16, 16).setOrigin(0, 0.5);
      const text = addText(this.scene, -20, yPosition, this.MENU_LIST_TEXT[i], TEXTSTYLE.MENU).setOrigin(0, 0.5);

      this.texts.push(text);
      this.menuSlotBtns.push(menuIcon);
      this.dummys.push(dummy);
    }

    this.container.add(this.window);
    this.container.add(this.menuSlotBtns);
    this.container.add(this.dummys);
    this.container.add(this.texts);

    this.container.setScale(3.2);
    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI + 1);
    this.container.setScrollFactor(0);

    this.guideText.setVisible(false);
    this.guideText.setDepth(DEPTH.OVERWORLD_UI + 1);
    this.guideText.setScrollFactor(0);
  }

  show(data?: any): void {
    this.guideText.setVisible(true);
    this.container.setVisible(true);
    this.updateWindowHeight();
    this.pause(false);
  }

  clean(data?: any): void {
    this.guideText.setVisible(false);
    this.container.setVisible(false);
    this.pause(true);
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.blocking() : this.unblocking();
  }

  update(time: number, delta: number): void {}

  private blocking() {}

  private unblocking() {
    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT, KEY.CANCEL];
    const keyboardManager = KeyboardManager.getInstance();

    let startIndex = 0;
    let endIndex = this.MENU_LIST_ICON.length - 1;
    let choice = startIndex;

    this.dummys[choice].setTexture(TEXTURE.WINDOW_3);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback((key) => {
      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            if (choice > startIndex) choice--;
            break;
          case KEY.DOWN:
            if (choice < endIndex && choice < this.MENU_LIST_ICON.length - 1) choice++;
            break;
          case KEY.SELECT:
            const texture = this.MENU_LIST_ICON[choice].split('_')[1];
            console.log(texture);
            if (texture === 'box') {
            } else if (texture === 'bag') {
              this.dummys[choice].setTexture(TEXTURE.BLANK);
              this.mode.addUiStackOverlap('BagUi');
            }
            break;
          case KEY.CANCEL:
            this.clean();
            this.dummys[choice].setTexture(TEXTURE.BLANK);
            this.mode.pauseOverworldSystem(false);
            this.mode.popUiStack();
            break;
        }

        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
            this.dummys[choice].setTexture(TEXTURE.WINDOW_3);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  private updateWindowHeight(): void {
    const slotSize = 20;
    const slotSpacing = 3;
    const totalHeight = this.MENU_LIST_ICON.length * (slotSize + slotSpacing * 1.8);
    const minWindowHeight = 100;
    const newWindowHeight = Math.max(minWindowHeight, totalHeight);

    this.window.setSize(110, newWindowHeight);
    this.window.setPosition(0, this.FIXED_TOP_Y + newWindowHeight / 2);
  }
}
