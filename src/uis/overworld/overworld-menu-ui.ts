import { DEPTH } from '../../enums/depth';
import { TEXTURE } from '../../enums/texture';
import { InGameScene } from '../../scenes/ingame-scene';
import { addImage, addText, addWindow, playSound, runFadeEffect, Ui } from '../ui';
import { KEY } from '../../enums/key';
import { TEXTSTYLE } from '../../enums/textstyle';
import i18next from 'i18next';
import { AUDIO } from '../../enums/audio';
import { KeyboardHandler } from '../../handlers/keyboard-handler';
import { eventBus } from '../../core/event-bus';
import { EVENT } from '../../enums/event';
import { MODE } from '../../enums/mode';
import { PLAYER_STATUS } from '../../enums/player-status';
import { PlayerObject } from '../../object/player-object';

export class OverworldMenuUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private lastStart!: number;
  private tempPlayerObject!: PlayerObject;

  private window!: Phaser.GameObjects.NineSlice;
  private dummys: Phaser.GameObjects.NineSlice[] = [];
  private icons: Phaser.GameObjects.Image[] = [];
  private texts: Phaser.GameObjects.Text[] = [];

  private readonly ListIcons = [TEXTURE.MENU_POKEBOX, TEXTURE.MENU_BAG_BOY, TEXTURE.MENU_PROFILE, TEXTURE.MENU_OPTION, TEXTURE.MENU_EXIT];
  private ListTexts = [i18next.t('menu:menuPokebox'), i18next.t('menu:menuBag'), i18next.t('menu:menuProfile'), i18next.t('menu:menuOption'), i18next.t('menu:menuBackToTitle')];
  private readonly scale: number = 2;

  constructor(scene: InGameScene) {
    super(scene);

    eventBus.on(EVENT.UPDATE_OVERWORLD_MENU, (onoff: boolean) => {
      let txt = i18next.t('menu:menuBackToTitle');

      if (onoff) {
        txt = i18next.t('menu:menuBackToPlaza');
      }

      this.texts[this.texts.length - 1].setText(txt);
      this.ListTexts[this.texts.length - 1] = txt;
    });

    eventBus.on(EVENT.ACCEPT_BACKTO_PLAZA, () => {
      this.dummys[this.lastStart].setTexture(TEXTURE.BLANK);
      this.renderIconsTint();
      this.lastStart = 0;

      eventBus.emit(EVENT.MOVETO_OVERWORLD_MODE, 'enter', '002');
    });

    eventBus.on(EVENT.REJECT_BACKTO_PLAZA, () => {
      console.log(this.lastStart);
    });
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.lastStart = 0;

    this.container = this.scene.add.container(width / 2 + 480, height / 2 - 470);

    this.window = addWindow(this.scene, TEXTURE.WINDOW_5, 0, -30, 130, 0, 16, 16, 16, 16).setOrigin(0, 0).setScale(this.scale);
    this.container.add(this.window);

    this.renderList();

    this.container.setScale(1.8);
    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI + 1);
    this.container.setScrollFactor(0);
  }

  show(data?: PlayerObject): void {
    if (data) {
      this.tempPlayerObject = data;
    }

    eventBus.emit(EVENT.PLAY_SOUND, this.scene);

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

    this.dummys[choice].setTexture(TEXTURE.WINDOW_6);

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
            this.clean();
            this.lastStart = 0;
            this.renderIconsTint();
            this.dummys[choice].setTexture(TEXTURE.BLANK);
            eventBus.emit(EVENT.POP_MODE);
            break;
        }

        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            eventBus.emit(EVENT.PLAY_SOUND, this.scene, key);

            this.renderIconsTint();
            this.icons[choice].clearTint();

            this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
            this.dummys[choice].setTexture(TEXTURE.WINDOW_6);
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
      eventBus.emit(EVENT.OVERLAP_MODE, MODE.POKEBOX, this.tempPlayerObject);
    } else if (target === i18next.t('menu:menuBag')) {
      //bag
      eventBus.emit(EVENT.OVERLAP_MODE, MODE.BAG);
    } else if (target === i18next.t('menu:menuProfile')) {
      //profile
    } else if (target === i18next.t('menu:menuOption')) {
      //option
    } else if (target === i18next.t('menu:menuBackToTitle')) {
      //back to title
    } else if (target === i18next.t('menu:menuBackToPlaza')) {
      eventBus.emit(EVENT.OVERLAP_MODE, MODE.MESSAGE, [
        { type: 'sys', format: 'question', content: i18next.t('message:isBackToPlaza'), speed: 10, questionYes: EVENT.ACCEPT_BACKTO_PLAZA, questionNo: EVENT.REJECT_BACKTO_PLAZA },
      ]);
    }
  }
}
