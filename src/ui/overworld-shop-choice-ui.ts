import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager } from '../managers';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addText, addWindow, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';

export class OverworldShopChoiceUi extends Ui {
  private mode: OverworldMode;
  private container!: Phaser.GameObjects.Container;
  private textInBag!: Phaser.GameObjects.Text;
  private textCost!: Phaser.GameObjects.Text;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.scene.add.container(width / 2, height / 2);

    const windowInBag = addWindow(this.scene, TEXTURE.WINDOW_7, -363, 337, 315, 80, 16, 16, 16, 16);
    const windowCost = addWindow(this.scene, TEXTURE.WINDOW_7, -45, 337, 315, 80, 16, 16, 16, 16);

    const textInBagTitle = addText(this.scene, -430, 337, i18next.t('menu:inBag'), TEXTSTYLE.MESSAGE_BLACK);
    this.textInBag = addText(this.scene, -320, 337, '19', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5);

    const textCostTitle = addText(this.scene, -165, 337, 'x', TEXTSTYLE.MESSAGE_BLACK);

    this.container.add(windowInBag);
    this.container.add(windowCost);
    this.container.add(textInBagTitle);
    this.container.add(this.textInBag);
    this.container.add(textCostTitle);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI + 3);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    console.log(data);
    this.container.setVisible(true);
    this.pause(false);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.pause(true);
  }

  pause(onoff: boolean, data?: any): void {
    const keys = [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];
    const keyboardManager = KeyboardManager.getInstance();

    let start = 1;
    let end = 99;
    let choice = start;
    let currentPage = 1;
    const totalPages = 9;

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback(async (key) => {
      try {
        switch (key) {
          case KEY.UP:
            break;
          case KEY.DOWN:
            break;
          case KEY.LEFT:
            break;
          case KEY.RIGHT:
            break;
          case KEY.SELECT:
            break;
          case KEY.CANCEL:
            this.clean();
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
}
