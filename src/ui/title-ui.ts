import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { TEXTURE } from '../enums/texture';
import { TitleMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addText, addWindow, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { KeyboardManager } from '../managers';
import { KEY } from '../enums/key';
import { PlayerInfo } from '../storage/player-info';

export class TitleUi extends Ui {
  private mode: TitleMode;
  private start!: number;

  private bg!: Phaser.GameObjects.Image;

  private windows: Phaser.GameObjects.NineSlice[] = [];
  private texts: Phaser.GameObjects.Text[] = [];

  private continueName!: Phaser.GameObjects.Text;
  private continueLocation!: Phaser.GameObjects.Text;
  private continuePlaytime!: Phaser.GameObjects.Text;
  private continueParties: Phaser.GameObjects.Image[] = [];

  private container!: Phaser.GameObjects.Container;
  private windowContainer!: Phaser.GameObjects.Container;

  private readonly contentHeight: number = 100;
  private readonly contentSpacing: number = 15;
  private readonly scale: number = 3.4;
  private readonly menus = [i18next.t('lobby:newGame'), i18next.t('lobby:mysteryGift'), i18next.t('lobby:settings'), i18next.t('lobby:logout')];

  constructor(scene: InGameScene, mode: TitleMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);

    this.bg = addBackground(this.scene, TEXTURE.BG_LOBBY).setOrigin(0.5, 0.5);

    this.windowContainer = this.createContainer(width / 2, height / 2 + 10);

    this.createContinue();
    this.createMenus();

    this.container.add(this.bg);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TITLE - 1);
    this.container.setScrollFactor(0);

    this.windowContainer.setVisible(false);
    this.windowContainer.setDepth(DEPTH.TITLE);
    this.windowContainer.setScrollFactor(0);
  }

  show(data?: any): void {
    const playerData = PlayerInfo.getInstance();

    this.continueName.setText(playerData.getNickname());
    this.continueLocation.setText(playerData.getLocation().overworld);

    this.container.setVisible(true);
    this.windowContainer.setVisible(true);

    this.pause(false);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.windowContainer.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  update(time: number, delta: number): void {}

  private block() {}

  private unblock() {
    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT];
    const keyboardManager = KeyboardManager.getInstance();

    let choice = 0;
    this.start = 0;

    this.windows[choice].setTexture(TEXTURE.WINDOW_4);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback(async (key) => {
      let prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            if (choice > 0) {
              choice--;
            }
            break;
          case KEY.DOWN:
            if (choice < this.windows.length - 1) {
              choice++;
            }
            break;
          case KEY.SELECT:
            const target = this.windows[choice];
            break;
        }

        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            this.windows[prevChoice].setTexture(TEXTURE.WINDOW_5);
            this.windows[choice].setTexture(TEXTURE.WINDOW_4);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  private createContinue() {
    const window = addWindow(this.scene, TEXTURE.WINDOW_5, 0, -195, 210, 75, 16, 16, 16, 16).setScale(this.scale);
    const text = addText(this.scene, -320, -275, i18next.t('lobby:continue'), TEXTSTYLE.DEFAULT_BLACK).setOrigin(0, 0.5);
    const labelName = addText(this.scene, -320, -230, i18next.t('menu:continueName'), TEXTSTYLE.SPECIAL).setOrigin(0, 0.5);
    const labelLocation = addText(this.scene, -320, -190, i18next.t('menu:continueLocation'), TEXTSTYLE.SPECIAL).setOrigin(0, 0.5);
    const labelPlaytime = addText(this.scene, -320, -150, i18next.t('menu:continuePlaytime'), TEXTSTYLE.SPECIAL).setOrigin(0, 0.5);

    this.continueName = addText(this.scene, -60, -230, '테스트테스트테스트맨', TEXTSTYLE.SPECIAL).setOrigin(0, 0.5);
    this.continueLocation = addText(this.scene, -60, -190, '미친 광장', TEXTSTYLE.SPECIAL).setOrigin(0, 0.5);
    this.continuePlaytime = addText(this.scene, -60, -150, '00:00', TEXTSTYLE.SPECIAL).setOrigin(0, 0.5);

    this.windowContainer.add(window);
    this.windowContainer.add(text);
    this.windowContainer.add(labelName);
    this.windowContainer.add(labelLocation);
    this.windowContainer.add(labelPlaytime);
    this.windowContainer.add(this.continueName);
    this.windowContainer.add(this.continueLocation);
    this.windowContainer.add(this.continuePlaytime);

    this.windows.unshift(window);
  }

  private createMenus() {
    let currentY = 0;

    for (const target of this.menus) {
      const window = addWindow(this.scene, TEXTURE.WINDOW_5, 0, currentY, 210, 30, 16, 16, 16, 16).setScale(this.scale);
      const text = addText(this.scene, -320, currentY, target, TEXTSTYLE.DEFAULT_BLACK).setOrigin(0, 0.5);

      this.windows.push(window);
      this.texts.push(text);

      this.windowContainer.add(window);
      this.windowContainer.add(text);

      currentY += this.contentHeight + this.contentSpacing;
    }
  }
}
