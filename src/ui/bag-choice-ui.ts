import i18next from 'i18next';
import { OverworldMode } from '../modes-test';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, playSound, Ui } from './ui';
import { TEXTURE } from '../enums/texture';
import { TEXTSTYLE } from '../enums/textstyle';
import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { KeyboardManager, MessageManager } from '../managers';
import { BagUi } from './bag-ui';
import { PlayerItem } from '../object/player-item';
import { BagRegisterUi } from './bag-register-ui';
import { Bag } from '../storage/bag';
import { AUDIO } from '../enums/audio';
import { getItemByKey, itemData } from '../data/items';
import { PlayerInfo } from '../storage/player-info';

export class BagChoiceUi extends Ui {
  private mode: OverworldMode;
  private bagUi: BagUi;
  private bagRegisterUi: BagRegisterUi;
  private targetItem!: PlayerItem;

  private registerableTrueContainer!: Phaser.GameObjects.Container;
  private registerableFalseContainer!: Phaser.GameObjects.Container;

  private reggisterableTrueWindows: Phaser.GameObjects.Image[] = [];
  private registerableTrueTexts: Phaser.GameObjects.Text[] = [];
  private registerableTrueTitles: string[] = [i18next.t('menu:use'), i18next.t('menu:register'), i18next.t('menu:cancel')];

  private reggisterableFalseWindows: Phaser.GameObjects.Image[] = [];
  private registerableFalseTexts: Phaser.GameObjects.Text[] = [];
  private registerableFalseTitles: string[] = [i18next.t('menu:use'), i18next.t('menu:cancel')];

  private targetContainer!: Phaser.GameObjects.Container;
  private targetWindows: Phaser.GameObjects.Image[] = [];
  private targetTexts: Phaser.GameObjects.Text[] = [];
  private targetTitles: string[] = [];

  constructor(scene: InGameScene, mode: OverworldMode, bagUi: BagUi) {
    super(scene);
    this.mode = mode;

    this.bagUi = bagUi;
    this.bagRegisterUi = new BagRegisterUi(scene, mode, this, bagUi);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    const contentHeight = 45;
    const spacing = 5;
    let currentY = 0;

    this.registerableTrueContainer = this.scene.add.container(width / 2 + 720, height / 2);
    this.registerableFalseContainer = this.scene.add.container(width / 2 + 720, height / 2);

    this.bagRegisterUi.setup();

    for (const title of this.registerableTrueTitles) {
      const window = addImage(this.scene, TEXTURE.CHOICE, 0, currentY);
      const text = addText(this.scene, -65, currentY, title, TEXTSTYLE.CHOICE_DEFAULT).setOrigin(0, 0.5);

      this.reggisterableTrueWindows.push(window);
      this.registerableTrueTexts.push(text);

      this.registerableTrueContainer.add(window);
      this.registerableTrueContainer.add(text);

      currentY += contentHeight + spacing;

      this.registerableTrueContainer.setScale(2.6);
      this.registerableTrueContainer.setVisible(false);
      this.registerableTrueContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
      this.registerableTrueContainer.setScrollFactor(0);
    }

    for (const title of this.registerableFalseTitles) {
      const window = addImage(this.scene, TEXTURE.CHOICE, 0, currentY);
      const text = addText(this.scene, -65, currentY, title, TEXTSTYLE.CHOICE_DEFAULT).setOrigin(0, 0.5);

      this.reggisterableFalseWindows.push(window);
      this.registerableFalseTexts.push(text);

      this.registerableFalseContainer.add(window);
      this.registerableFalseContainer.add(text);

      currentY += contentHeight + spacing;

      this.registerableFalseContainer.setScale(2.6);
      this.registerableFalseContainer.setVisible(false);
      this.registerableFalseContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
      this.registerableFalseContainer.setScrollFactor(0);
    }
  }

  show(data?: PlayerItem): void {
    if (data) this.targetItem = data;

    const checkResult = this.checkItemRegisterable();

    this.targetContainer = checkResult ? this.registerableTrueContainer : this.registerableFalseContainer;
    this.targetWindows = checkResult ? this.reggisterableTrueWindows : this.reggisterableFalseWindows;
    this.targetTitles = checkResult ? this.registerableTrueTitles : this.registerableFalseTitles;
    this.targetTexts = checkResult ? this.registerableTrueTexts : this.registerableFalseTexts;

    checkResult ? this.targetContainer.setY(+720) : this.targetContainer.setY(+450);

    const findItem = PlayerInfo.getInstance().findItemSlot(this.targetItem.getKey());

    checkResult && findItem !== null ? this.targetTexts[1].setText(i18next.t('menu:registerCancel')) : this.targetTexts[1].setText(i18next.t('menu:register'));

    if (!checkResult) this.targetTexts[1].setText(i18next.t('menu:cancel'));

    this.targetContainer.setVisible(true);
    this.pause(false);
  }

  clean(data?: any): void {
    this.targetContainer.setVisible(false);
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
    const playerInfo = PlayerInfo.getInstance();

    let start = 0;
    let end = this.targetWindows.length - 1;
    let choice = start;

    this.targetWindows[0].setTexture(TEXTURE.CHOICE_S);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback(async (key) => {
      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            if (choice > 0) choice--;
            break;
          case KEY.DOWN:
            if (choice < end) choice++;
            break;
          case KEY.SELECT:
            playSound(this.scene, AUDIO.BAG_SELECT);
            this.close(choice);
            if (choice === 0) {
              if (!this.checkItemUsable()) {
                const message = MessageManager.getInstance();
                await message.show(this, [{ type: 'sys', format: 'talk', content: i18next.t('message:use_inbag_warning') }]);
                this.bagUi.pause(false);
              } else {
                playSound(this.scene, AUDIO.BAG_SELECT);
                //use item.
              }
            }
            if (this.checkItemRegisterable()) {
              if (choice === 1) {
                const find = playerInfo.findItemSlot(this.targetItem.getKey());
                //register

                if (find !== null) {
                  PlayerInfo.getInstance().setItemSlot(find, null);
                  this.bagUi.setRegVisual(false);
                  this.mode.updateItemSlotUi();
                } else {
                  this.bagRegisterUi.show(this.targetItem);
                }
              } else if (choice === 2) {
                //cancel
                this.close(choice);
              }
            } else {
              if (choice === 1) {
                //cancel
                this.close(choice);
              }
            }
            break;
          case KEY.CANCEL:
            playSound(this.scene, AUDIO.BAG_CLOSE);
            this.close(choice);
            break;
        }

        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            playSound(this.scene, AUDIO.BAG_DECISON);
            this.targetWindows[prevChoice].setTexture(TEXTURE.CHOICE);
            this.targetWindows[choice].setTexture(TEXTURE.CHOICE_S);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  private checkItemRegisterable() {
    const itemInfo = getItemByKey(this.targetItem.getKey());

    if (!itemInfo) throw Error('exist not item');

    return itemInfo.registerable;
  }

  private checkItemUsable() {
    const itemInfo = getItemByKey(this.targetItem.getKey());

    if (!itemInfo) throw Error('exist not item');

    return itemInfo.usable;
  }

  private close(choice: number) {
    this.targetWindows[choice].setTexture(TEXTURE.CHOICE);
    this.clean();
    this.bagUi.pause(false);
  }
}
