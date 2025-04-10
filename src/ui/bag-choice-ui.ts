import i18next from 'i18next';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, playSound, Ui } from './ui';
import { TEXTURE } from '../enums/texture';
import { TEXTSTYLE } from '../enums/textstyle';
import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { KeyboardManager } from '../managers';
import { BagUi } from './bag-ui';
import { PlayerItem } from '../object/player-item';
import { BagRegisterUi } from './bag-register-ui';
import { Bag } from '../storage/bag';
import { AUDIO } from '../enums/audio';

export class BagChoiceUi extends Ui {
  private mode: OverworldMode;
  private bagUi: BagUi;
  private bagRegisterUi: BagRegisterUi;
  private targetItem!: PlayerItem;
  private isRegister!: boolean;

  private container!: Phaser.GameObjects.Container;

  private windows: Phaser.GameObjects.Image[] = [];
  private texts: Phaser.GameObjects.Text[] = [];
  private titles: string[] = [i18next.t('menu:use'), i18next.t('menu:register'), i18next.t('menu:cancel')];

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

    this.container = this.scene.add.container(width / 2 + 720, height / 2 + 200);

    this.bagRegisterUi.setup();

    for (const title of this.titles) {
      const window = addImage(this.scene, TEXTURE.CHOICE, 0, currentY);
      const text = addText(this.scene, -65, currentY, title, TEXTSTYLE.CHOICE_DEFAULT).setOrigin(0, 0.5);

      this.windows.push(window);
      this.texts.push(text);

      this.container.add(window);
      this.container.add(text);

      currentY += contentHeight + spacing;

      this.container.setScale(2.6);
      this.container.setVisible(false);
      this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
      this.container.setScrollFactor(0);
    }
  }

  show(data?: PlayerItem): void {
    if (data) this.targetItem = data;

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

    let start = 0;
    let end = 2;
    let choice = start;

    this.windows[1].setTexture(TEXTURE.CHOICE);
    this.windows[2].setTexture(TEXTURE.CHOICE);
    this.windows[0].setTexture(TEXTURE.CHOICE_S);

    this.registerCheck();

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback((key) => {
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
            if (choice === 0) {
              //use
              playSound(this.scene, AUDIO.SELECT);
            } else if (choice === 1) {
              //register
              playSound(this.scene, AUDIO.SELECT);
              if (this.isRegister) {
                this.cancelRegister(this.targetItem);
                this.clean();
                this.bagUi.pause(false);
              } else {
                this.bagRegisterUi.show(this.targetItem);
              }
            } else if (choice === 2) {
              //cancel
              this.clean();
              this.bagUi.pause(false);
            }
            break;
          case KEY.CANCEL:
            playSound(this.scene, AUDIO.BAG_CLOSE);
            this.clean();
            this.bagUi.pause(false);
            break;
        }

        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            playSound(this.scene, AUDIO.BAG_DECISON);
            this.windows[prevChoice].setTexture(TEXTURE.CHOICE);
            this.windows[choice].setTexture(TEXTURE.CHOICE_S);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  private cancelRegister(item: PlayerItem) {
    Bag.getInstance().getItem(item.getKey())?.registerSlot(null);
    this.bagUi.setRegVisual(false);
  }

  private registerCheck() {
    const playerItem = Bag.getInstance().getItem(this.targetItem.getKey());

    if (!playerItem?.getRegister()) {
      this.texts[1].setText(i18next.t('menu:register'));
      this.isRegister = false;
    } else {
      this.texts[1].setText(i18next.t('menu:registerCancel'));
      this.isRegister = true;
    }
  }
}
