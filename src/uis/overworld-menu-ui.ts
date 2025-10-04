import { eventBus } from '../core/event-bus';
import { GM } from '../core/game-manager';
import { AUDIO, DEPTH, EVENT, KEY, MODE, TEXTSTYLE, TEXTURE } from '../enums';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import i18next from '../i18n';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, playSound, Ui } from './ui';

export class OverworldMenuUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private lastStart!: number;

  private window!: Phaser.GameObjects.NineSlice;
  private dummys: Phaser.GameObjects.NineSlice[] = [];
  private icons: Phaser.GameObjects.Image[] = [];
  private texts: Phaser.GameObjects.Text[] = [];

  private readonly ListIcons = [TEXTURE.ICON_PC, TEXTURE.ICON_BAG_M, TEXTURE.ICON_PROFILE, TEXTURE.ICON_OPTION, TEXTURE.ICON_EXIT];
  private ListTexts = [i18next.t('menu:menuPokebox'), i18next.t('menu:menuBag'), i18next.t('menu:menuProfile'), i18next.t('menu:menuOption'), i18next.t('menu:menuBackToTitle')];
  private readonly scale: number = 2;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.lastStart = 0;

    this.container = this.scene.add.container(width / 2 + 480, height / 2 - 470);

    this.window = addWindow(this.scene, TEXTURE.WINDOW_MENU, 0, -30, 130, 0, 16, 16, 16, 16).setOrigin(0, 0).setScale(this.scale);
    this.container.add(this.window);

    this.renderList();

    this.container.setScale(1.8);
    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI + 1);
    this.container.setScrollFactor(0);
  }

  show(data?: unknown): void {
    playSound(this.scene, AUDIO.OPEN_0, GM.getUserOption()?.getEffectVolume());

    this.renderIconsTint();
    this.icons[0].clearTint();

    this.handleKeyInput();
    this.container.setVisible(true);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {
    if (!onoff) this.handleKeyInput();
  }

  update(time: number, delta: number): void {}

  handleKeyInput() {
    const keyboard = KeyboardHandler.getInstance();
    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT, KEY.CANCEL];

    let startIndex = this.lastStart ? this.lastStart : 0;
    let endIndex = this.ListIcons.length - 1;
    let choice = startIndex;

    this.dummys[choice].setTexture(TEXTURE.WINDOW_RED);

    keyboard.setAllowKey(keys);
    keyboard.setKeyDownCallback((key) => {
      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            if (choice > 0) choice--;
            break;
          case KEY.DOWN:
            if (choice < endIndex && choice < this.ListIcons.length - 1) choice++;
            break;
          case KEY.SELECT:
            this.lastStart = choice;
            this.selectMenu(choice);
            break;
          case KEY.CANCEL:
            playSound(this.scene, AUDIO.CANCEL_0, GM.getUserOption()?.getEffectVolume());
            this.clean();
            this.lastStart = 0;
            this.renderIconsTint();
            this.dummys[choice].setTexture(TEXTURE.BLANK);
            GM.popUi();
            eventBus.emit(EVENT.UPDATE_OVERWORLD_MENU_TINT);
            break;
        }

        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            playSound(this.scene, AUDIO.SELECT_1, GM.getUserOption()?.getEffectVolume());

            this.renderIconsTint();
            this.icons[choice].clearTint();

            this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
            this.dummys[choice].setTexture(TEXTURE.WINDOW_RED);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  private renderList(): void {
    const spacing = 5;
    const contentHeight = 50;
    let currentY = 0;

    for (let i = 0; i < this.ListIcons.length; i++) {
      const icon = addImage(this.scene, this.ListIcons[i], +10, currentY).setOrigin(0, 0.5).setScale(this.scale);
      const text = addText(this.scene, +60, currentY, this.ListTexts[i], TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5);
      const dummy = addWindow(this.scene, TEXTURE.BLANK, +10, currentY, this.window.width - 10, contentHeight / this.scale, 16, 16, 16, 16)
        .setOrigin(0, 0.5)
        .setScale(this.scale);

      this.icons.push(icon);
      this.texts.push(text);
      this.dummys.push(dummy);

      this.container.add(icon);
      this.container.add(text);
      this.container.add(dummy);

      currentY += contentHeight + spacing;
    }

    this.window.setSize(this.window.width, (currentY + spacing) / this.scale);
  }

  private renderIconsTint() {
    for (const icon of this.icons) {
      icon.setTint(0x7f7f7f);
    }
  }

  private selectMenu(choice: number) {
    const target = this.ListTexts[choice];

    if (target === i18next.t('menu:menuPokebox')) {
      //pokebox
      GM.changeMode(MODE.PC);
    } else if (target === i18next.t('menu:menuBag')) {
      //bag
      GM.changeMode(MODE.BAG);
    } else if (target === i18next.t('menu:menuProfile')) {
      //profile
    } else if (target === i18next.t('menu:menuOption')) {
      //option
      GM.changeMode(MODE.OPTION);
    } else if (target === i18next.t('menu:menuBackToTitle')) {
      //back to title
    } else if (target === i18next.t('menu:menuBackToPlaza')) {
      eventBus.emit(EVENT.OVERLAP_MODE, MODE.MESSAGE, [
        { type: 'sys', format: 'question', content: i18next.t('message:isBackToPlaza'), speed: 10, questionYes: EVENT.ACCEPT_BACKTO_PLAZA, questionNo: EVENT.REJECT_BACKTO_PLAZA },
      ]);
    }
  }
}
