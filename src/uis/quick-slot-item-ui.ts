import { MAX_QUICK_ITEM_SLOT } from '../constants';
import { Event } from '../core/manager/event-manager';
import { Game } from '../core/manager/game-manager';
import { Keyboard } from '../core/manager/keyboard-manager';
import { Bag } from '../core/storage/bag-storage';
import { AUDIO, DEPTH, EVENT, KEY, TEXTURE, UI } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addWindow, playEffectSound, Ui } from './ui';

export class QuickSlotItemUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private windows: Phaser.GameObjects.NineSlice[] = [];
  private icons: Phaser.GameObjects.Image[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];

  private lastChoice: number = 0;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    const contentWidth = 50;
    const contentHeight = 50;
    const spacing = 5;
    const calc = (MAX_QUICK_ITEM_SLOT / 2) * (contentWidth + spacing);

    this.container = this.createTrackedContainer(width / 2 - calc, height / 2 - 120);

    let currentX = 0;
    let currentY = 0;

    for (let i = 0; i < MAX_QUICK_ITEM_SLOT; i++) {
      const window = this.addWindow(TEXTURE.WINDOW_OPACITY, currentX, currentY, contentWidth, contentHeight, 8, 8, 8, 8);
      const icon = this.addImage(TEXTURE.BLANK, currentX, currentY);
      const dummy = this.addImage(TEXTURE.BLANK, currentX, currentY - 40).setScale(1.8);

      this.windows.push(window);
      this.icons.push(icon);
      this.dummys.push(dummy);

      this.container.add(window);
      this.container.add(icon);
      this.container.add(dummy);

      currentX += contentWidth + spacing;
    }

    this.container.setScale(1.2);
    this.container.setVisible(false);
    this.container.setDepth(DEPTH.MENU + 1);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);

    playEffectSound(this.scene, AUDIO.SELECT_0);

    for (let i = 0; i < MAX_QUICK_ITEM_SLOT; i++) {
      const item = Bag.getSlotItems()[i];

      this.icons[i].setTexture(item ? `item${item.getKey()}` : TEXTURE.BLANK);
    }

    this.handleKeyInput();
  }

  protected onClean(): void {
    // 상태 초기화
    this.lastChoice = 0;
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {
    const keys = [KEY.LEFT, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];

    let start = 0;
    let end = MAX_QUICK_ITEM_SLOT - 1;
    let choice = this.lastChoice ? this.lastChoice : 0;

    this.dummys[choice].setTexture(TEXTURE.ARROW_R);

    Keyboard.setAllowKey(keys);
    const callback = (key: KEY) => {
      const prevChoice = choice;

      switch (key) {
        case KEY.LEFT:
          if (choice > start) {
            choice--;
          }
          break;
        case KEY.RIGHT:
          if (choice < end && choice < MAX_QUICK_ITEM_SLOT) {
            choice++;
          }
          break;
        case KEY.SELECT:
          const item = Bag.getSlotItems()[choice];
          if (item) {
            Event.emit(EVENT.USE_ITEM, item);
          }

          Event.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_REG, false);
          this.clean();
          Game.removeUi(UI.QUICK_SLOT_ITEM);
          break;
        case KEY.CANCEL:
          Event.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_REG, false);
          this.clean();
          Game.removeUi(UI.QUICK_SLOT_ITEM);
          break;
      }
      if (key === KEY.LEFT || key === KEY.RIGHT) {
        if (choice !== prevChoice) {
          playEffectSound(this.scene, AUDIO.SELECT_0);

          this.lastChoice = choice;
          this.renderChoice(prevChoice, choice);
        }
      }
    };
    Keyboard.setKeyDownCallback(callback);
    this.trackKeyboardCallback(() => Keyboard.clearCallbacks());
  }

  update(time?: number, delta?: number): void {
    for (let i = 0; i < MAX_QUICK_ITEM_SLOT; i++) {
      const item = Bag.getSlotItems()[i];
      if (item) {
        this.icons[i].setTexture(`item${item.getKey()}`);
      } else {
        this.icons[i].setTexture(TEXTURE.BLANK);
      }
    }
  }

  private renderChoice(prev: number, current: number) {
    this.dummys[prev].setTexture(TEXTURE.BLANK);
    this.dummys[current].setTexture(TEXTURE.ARROW_R);
  }
}
