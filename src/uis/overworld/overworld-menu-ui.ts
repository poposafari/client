import i18next from 'i18next';
import { AUDIO, DEPTH, EVENT, KEY, MODE, OVERWORLD_TYPE, TEXTSTYLE, TEXTURE, UI } from '../../enums';
import { playEffectSound, stopBackgroundMusic, Ui } from '../ui';
import { InGameScene } from '../../scenes/ingame-scene';
import { Keyboard } from '../../core/manager/keyboard-manager';
import { Game } from '../../core/manager/game-manager';
import { OverworldGlobal } from '../../core/storage/overworld-storage';
import { QuestionMessageUi } from '../question-message-ui';
import { Option } from '../../core/storage/player-option';
import { SocketIO } from '../../core/manager/socket-manager';
import { PlayerGlobal } from '../../core/storage/player-storage';
import { Event } from '../../core/manager/event-manager';
import { DEFAULT_ZOOM, OVERWORLD_ZOOM } from '../../constants';

export class OverworldMenuUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private lastStart!: number;
  private isProcessing: boolean = false;

  private window!: Phaser.GameObjects.NineSlice;
  private dummys: Phaser.GameObjects.NineSlice[] = [];
  private icons: Phaser.GameObjects.Image[] = [];
  private texts: Phaser.GameObjects.Text[] = [];

  private questionMessage: QuestionMessageUi;
  private languageChangedCallback!: () => void;

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
    this.questionMessage = new QuestionMessageUi(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.questionMessage.setup(OVERWORLD_ZOOM);

    this.lastStart = 0;

    this.languageChangedCallback = () => {
      this.updateTexts();
    };
    Event.on(EVENT.LANGUAGE_CHANGED, this.languageChangedCallback);

    this.container = this.createTrackedContainer(width / 2 + 270, height / 2 - 315);

    this.window = this.addWindow(TEXTURE.WINDOW_MENU, 0, -30, 140, 0, 16, 16, 16, 16).setOrigin(0, 0).setScale(this.scale);
    this.container.add(this.window);

    this.renderList();

    this.container.setScale(1.3);
    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI + 1);
    this.container.setScrollFactor(0);
  }

  async show(data?: unknown): Promise<void> {
    playEffectSound(this.scene, AUDIO.OPEN_0);

    this.renderIconsTint();
    this.icons[0].clearTint();

    this.handleKeyInput();
    this.container.setVisible(true);
  }

  protected onClean(): void {
    if (this.languageChangedCallback) {
      Event.off(EVENT.LANGUAGE_CHANGED, this.languageChangedCallback);
    }
    this.lastStart = 0;
  }

  pause(onoff: boolean, data?: any): void {
    if (onoff) {
      Keyboard.clearCallbacks();
    } else {
      this.handleKeyInput();
    }
  }

  update(time: number, delta: number): void {}

  handleKeyInput() {
    let startIndex = this.lastStart ? this.lastStart : 0;
    let endIndex = this.ListIcons.length - 1;
    let choice = startIndex;

    this.dummys[choice].setTexture(TEXTURE.WINDOW_RED);

    this.updateBackToText();

    Keyboard.setAllowKey([KEY.ARROW_UP, KEY.ARROW_DOWN, KEY.Z, KEY.ENTER, KEY.X, KEY.ESC]);
    const callback = async (key: KEY) => {
      if (this.isProcessing) return;

      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.ARROW_UP:
            if (choice > 0) {
              choice--;
              playEffectSound(this.scene, AUDIO.SELECT_1);
              this.renderIconsTint();
              this.icons[choice].clearTint();
              this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
              this.dummys[choice].setTexture(TEXTURE.WINDOW_RED);
            }
            break;
          case KEY.ARROW_DOWN:
            if (choice < endIndex && choice < this.ListIcons.length - 1) {
              choice++;
              playEffectSound(this.scene, AUDIO.SELECT_1);
              this.renderIconsTint();
              this.icons[choice].clearTint();
              this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
              this.dummys[choice].setTexture(TEXTURE.WINDOW_RED);
            }
            break;
          case KEY.ENTER:
          case KEY.Z:
            this.isProcessing = true;
            this.lastStart = choice;
            this.selectMenu(choice).finally(() => {
              this.isProcessing = false;
            });
            break;
          case KEY.ESC:
          case KEY.X:
            this.isProcessing = true;
            await this.cancelMenu(choice);
            playEffectSound(this.scene, AUDIO.CANCEL_0);
            this.isProcessing = false;
            break;
        }
      } catch (error) {
        console.error(`[OverworldMenuUi] Error handling key input: ${error}`);
        this.isProcessing = false;
      }
    };
    Keyboard.setKeyDownCallback(callback);
    this.trackKeyboardCallback(() => Keyboard.clearCallbacks());
  }

  private renderList(): void {
    const spacing = 5;
    const contentHeight = 50;
    let currentY = 0;

    for (let i = 0; i < this.ListIcons.length; i++) {
      const icon = this.addImage(this.ListIcons[i], +10, currentY).setOrigin(0, 0.5).setScale(this.scale);
      const text = this.addText(+60, currentY, this.ListTexts[i], TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5);
      const dummy = this.addWindow(TEXTURE.BLANK, +10, currentY, this.window.width - 10, contentHeight / this.scale, 16, 16, 16, 16)
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

  private async selectMenu(choice: number): Promise<void> {
    const target = this.ListTexts[choice];

    try {
      if (target === i18next.t('menu:menuPokebox')) {
        await Game.changeMode(MODE.PC);
      } else if (target === i18next.t('menu:menuBag')) {
        await Game.changeMode(MODE.BAG);
      } else if (target === i18next.t('menu:menuProfile')) {
        //profile
      } else if (target === i18next.t('menu:menuOption')) {
        await Game.changeMode(MODE.OPTION);
      } else if (target === i18next.t('menu:menuBackToTitle')) {
        await this.questionMessage.show({
          type: 'default',
          content: i18next.t('message:is_back_to_title'),
          speed: Option.getTextSpeed()!,
          yes: async () => {
            await this.cancelMenu(choice);
            this.scene.cameras.main.setZoom(DEFAULT_ZOOM);
            stopBackgroundMusic();
            SocketIO.moveToTitle({ from: PlayerGlobal.getData()?.location! });
            await Game.changeMode(MODE.TITLE);
          },
          no: async () => {
            this.handleKeyInput();
          },
        });
      } else if (target === i18next.t('menu:menuCancel')) {
        await this.cancelMenu(choice);
        playEffectSound(this.scene, AUDIO.CANCEL_0);
      }
    } catch (error) {
      console.error(`[OverworldMenuUi] Error in selectMenu: ${error}`);
      throw error;
    }
  }

  private async cancelMenu(choice: number) {
    this.lastStart = 0;
    this.renderIconsTint();
    this.dummys[choice].setTexture(TEXTURE.BLANK);
    await Game.removeUi(UI.OVERWORLD_MENU);
  }

  private updateBackToText() {
    this.texts[4].setText(i18next.t('menu:menuBackToTitle'));
    this.icons[4].setTexture(TEXTURE.ICON_EXIT_0);
    this.ListTexts[4] = i18next.t('menu:menuBackToTitle');
  }

  updateTexts(): void {
    this.ListTexts = [
      i18next.t('menu:menuPokebox'),
      i18next.t('menu:menuBag'),
      i18next.t('menu:menuProfile'),
      i18next.t('menu:menuOption'),
      i18next.t('menu:menuBackToTitle'),
      i18next.t('menu:menuCancel'),
    ];

    for (let i = 0; i < this.texts.length && i < this.ListTexts.length; i++) {
      this.texts[i].setText(this.ListTexts[i]);
    }
  }
}
