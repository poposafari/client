import i18next from 'i18next';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addText, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { KEY } from '../enums/key';
import { KeyboardManager } from '../managers';
import { DEPTH } from '../enums/depth';

export class BagChoiceUi extends Ui {
  private mode: OverworldMode;
  private container!: Phaser.GameObjects.Container;
  private bg!: Phaser.GameObjects.Image;
  private targetItem!: string;
  private isRegister!: boolean;

  //choice
  private choiceTitles: string[] = [i18next.t('menu:register'), i18next.t('menu:cancel')];
  private choiceWindows: Phaser.GameObjects.Image[] = [];
  private choiceTexts: Phaser.GameObjects.Text[] = [];

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();
    const spacing = 50;
    const contentHeight = 50;

    let currentY = 0;

    this.container = this.scene.add.container(width / 2, height / 2);
    this.bg = addBackground(this.scene, TEXTURE.BLACK).setOrigin(0.5, 0.5);
    this.bg.setAlpha(0.5);
    this.container.add(this.bg);

    for (const title of this.choiceTitles) {
      const window = addImage(this.scene, TEXTURE.CHOICE, +780, currentY + 370).setScale(2);
      const text = addText(this.scene, -110 + 780, currentY + contentHeight / 2 - 25 + 370, title, TEXTSTYLE.ITEM_NOTICE).setOrigin(0, 0.5);

      this.choiceWindows.push(window);
      this.choiceTexts.push(text);

      this.container.add(window);
      this.container.add(text);

      currentY += contentHeight + spacing;
    }

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.container.setScrollFactor(0);
  }

  show(data: any): void {
    this.targetItem = data;

    this.container.setVisible(true);
    this.pause(false);
  }

  clean(): void {
    this.container.setVisible(false);
    this.pause(true);
  }

  pause(onoff: boolean): void {
    onoff ? this.block() : this.unblock();
  }

  private block() {}

  private unblock() {
    const keyboardMananger = KeyboardManager.getInstance();
    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT, KEY.CANCEL];

    let start = 0;
    let end = this.choiceTitles.length - 1;
    let choice = start;

    this.renderChoice(1, 0);
    this.registerCheck();

    keyboardMananger.setAllowKey(keys);
    keyboardMananger.setKeyDownCallback((key) => {
      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            if (choice > start) {
              choice--;
            }
            break;
          case KEY.DOWN:
            if (choice < end && choice < this.choiceTitles.length - 1) {
              choice++;
            }
            break;
          case KEY.SELECT:
            if (choice === 0 && !this.isRegister) {
              this.clean();
              this.mode.popUiStack();
              this.mode.addUiStackOverlap('BagRegisterUi', this.targetItem);
            } else if (choice === 0 && this.isRegister) {
              this.cancelRegister(this.targetItem);
              this.clean();
              this.mode.popUiStack();
            } else if (choice === 1) {
              this.clean();
              this.mode.popUiStack();
            }
            break;
          case KEY.CANCEL:
            this.clean();
            this.mode.popUiStack();
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

  update(time: number, delta: number): void {}

  private renderChoice(prev: number, current: number) {
    this.choiceWindows[prev].setTexture(TEXTURE.CHOICE);
    this.choiceWindows[current].setTexture(TEXTURE.CHOICE_S);
  }

  private registerCheck() {
    const playerItem = this.mode.getBag()?.getItem(this.targetItem);

    if (!playerItem?.getRegister()) {
      this.choiceTexts[0].setText(i18next.t('menu:register'));
      this.isRegister = false;
    } else {
      this.choiceTexts[0].setText(i18next.t('menu:registerCancel'));
      this.isRegister = true;
    }
  }

  private cancelRegister(item: string) {
    this.mode.getBag()?.getItem(item)?.registerSlot(null);
  }
}
