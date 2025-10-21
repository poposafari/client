import { exitSafariZoneApi } from '../api';
import { eventBus } from '../core/event-bus';
import { GM } from '../core/game-manager';
import { AUDIO, DEPTH, EVENT, KEY, MODE, OVERWORLD_TYPE, TEXTSTYLE, TEXTURE } from '../enums';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import i18next from '../i18n';
import { InGameScene } from '../scenes/ingame-scene';
import { QuestionMessageUi } from './question-message-ui';
import { addImage, addText, addWindow, playEffectSound, stopBackgroundMusic, Ui } from './ui';

export class OverworldMenuUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private questionMessageUi: QuestionMessageUi;

  private lastStart!: number;

  private window!: Phaser.GameObjects.NineSlice;
  private dummys: Phaser.GameObjects.NineSlice[] = [];
  private icons: Phaser.GameObjects.Image[] = [];
  private texts: Phaser.GameObjects.Text[] = [];

  private readonly ListIcons = [TEXTURE.ICON_PC, TEXTURE.ICON_BAG_M, TEXTURE.ICON_PROFILE, TEXTURE.ICON_OPTION, TEXTURE.ICON_EXIT_0, TEXTURE.ICON_CANCEL];
  private ListTexts = [
    i18next.t('menu:menuPokebox'),
    i18next.t('menu:menuBag'),
    i18next.t('menu:menuProfile'),
    i18next.t('menu:menuOption'),
    i18next.t('menu:menuBackToTitle'),
    i18next.t('menu:menuCancel'),
  ];
  private readonly scale: number = 2;

  constructor(scene: InGameScene) {
    super(scene);

    this.questionMessageUi = new QuestionMessageUi(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.questionMessageUi.setup();

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
    playEffectSound(this.scene, AUDIO.OPEN_0);

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

    this.updateBackToText();

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
            this.cancelMenu(choice);
            playEffectSound(this.scene, AUDIO.CANCEL_0);
            break;
        }

        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            playEffectSound(this.scene, AUDIO.SELECT_1);

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
      this.questionMessageUi.show({
        type: 'default',
        content: i18next.t('message:is_back_to_title'),
        speed: GM.getUserOption()?.getTextSpeed()!,
        yes: async () => {
          this.cancelMenu(choice);
          stopBackgroundMusic();
          GM.changeMode(MODE.TITLE, false);
        },
        no: async () => {
          this.handleKeyInput();
        },
      });
    } else if (target === i18next.t('menu:menuBackToPlaza')) {
      this.questionMessageUi.show({
        type: 'default',
        content: i18next.t('message:is_back_to_plaza'),
        speed: GM.getUserOption()?.getTextSpeed()!,
        yes: async () => {
          this.cancelMenu(choice);
          const res = await exitSafariZoneApi();
          const lastLocation = GM.getUserData()?.location;
          const currentLocation = 'p005';

          if (res.result) {
            GM.updateUserData({ location: currentLocation, lastLocation: lastLocation, x: 39, y: 41 });
            GM.changeMode(MODE.OVERWORLD);
          }
        },
        no: async () => {
          this.handleKeyInput();
        },
      });
    } else if (target === i18next.t('menu:menuCancel')) {
      //cancel
      this.cancelMenu(choice);
      playEffectSound(this.scene, AUDIO.CANCEL_0);
    }
  }

  private cancelMenu(choice: number) {
    this.clean();
    this.lastStart = 0;
    this.renderIconsTint();
    this.dummys[choice].setTexture(TEXTURE.BLANK);
    GM.popUi();
    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_MENU, false);
  }

  private updateBackToText() {
    if (GM.getCurrentOverworldType() === OVERWORLD_TYPE.SAFARI) {
      this.texts[4].setText(i18next.t('menu:menuBackToPlaza'));
      this.icons[4].setTexture(TEXTURE.ICON_EXIT_1);
      this.ListTexts[4] = i18next.t('menu:menuBackToPlaza');
    } else {
      this.texts[4].setText(i18next.t('menu:menuBackToTitle'));
      this.icons[4].setTexture(TEXTURE.ICON_EXIT_0);
      this.ListTexts[4] = i18next.t('menu:menuBackToTitle');
    }
  }
}
