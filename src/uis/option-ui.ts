import { AUDIO, DEPTH, EVENT, KEY, TextSpeed, TEXTSTYLE, TEXTURE } from '../enums';
import { Keyboard, KeyboardManager } from '../core/manager/keyboard-manager';
import { SocketIO, SocketManager } from '../core/manager/socket-manager';
import i18next from '../i18n';
import { InGameScene } from '../scenes/ingame-scene';
import { changeTextSpeedToDigit } from '../utils/string-util';
import { addBackground, addImage, addText, addWindow, getTextStyle, playEffectSound, runFadeEffect, Ui } from './ui';
import { Option } from '../core/storage/player-option';
import { Game } from '../core/manager/game-manager';
import { Event } from '../core/manager/event-manager';

export class OptionUi extends Ui {
  private bgContainer!: Phaser.GameObjects.Container;
  private titleContainer!: Phaser.GameObjects.Container;
  private container!: Phaser.GameObjects.Container;

  private contentTitleTexts: Phaser.GameObjects.Text[] = [];
  private contentTitleDummys: Phaser.GameObjects.NineSlice[] = [];
  private optionUis: Ui[] = [];
  private optionDescUi: OptionDescUi;

  private choice: number = 0;
  private lastChoice: number = 0;
  private activeControl: 'menu' | 'option' = 'menu';

  private readonly windowWidth: number = 1200;
  private readonly windowHeight: number = 600;
  private readonly titleWindowHeight: number = 140;
  private readonly windowScale: number = 3;
  private readonly contentDummyScale: number = 4;
  private readonly contentTitle: string[] = [
    i18next.t('menu:optionTitle0'),
    i18next.t('menu:optionTitle1'),
    i18next.t('menu:optionTitle2'),
    i18next.t('menu:optionTitle3'),
    i18next.t('menu:optionTitle4'),
    i18next.t('menu:optionTitle5'),
  ];

  constructor(scene: InGameScene) {
    super(scene);

    this.optionDescUi = new OptionDescUi(scene, this);
    this.optionUis.push(new OptionTextSpeedUi(scene, this, this.optionDescUi));
    this.optionUis.push(new OptionWindowTypeUi(scene, this, this.optionDescUi));
    this.optionUis.push(new OptionBackgroundSoundUi(scene, this));
    this.optionUis.push(new OptionEffectSoundUi(scene, this));
    this.optionUis.push(new OptionTutorialUi(scene, this, this.optionDescUi));
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    for (const ui of this.optionUis) {
      ui.setup();
    }

    this.optionDescUi.setup();

    this.bgContainer = this.createContainer(width / 2, height / 2);
    this.titleContainer = this.createContainer(width / 2, height / 2 - 400);
    this.container = this.createContainer(width / 2, height / 2 - 20);

    const bg = this.addBackground(TEXTURE.BG_TITLE).setOrigin(0.5, 0.5);

    this.bgContainer.add(bg);

    this.bgContainer.setVisible(false);
    this.bgContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE);
    this.bgContainer.setScrollFactor(0);

    const titleWindow = this.addWindow(TEXTURE.WINDOW_MENU, 0, 0, this.windowWidth / this.windowScale, this.titleWindowHeight / this.windowScale, 16, 16, 16, 16).setScale(this.windowScale);
    const titleText = this.addText(-550, 0, i18next.t(`menu:option`), TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5).setScale(0.9);

    this.titleContainer.add(titleWindow);
    this.titleContainer.add(titleText);

    this.titleContainer.setVisible(false);
    this.titleContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.titleContainer.setScrollFactor(0);

    const window = this.addWindow(TEXTURE.WINDOW_MENU, 0, 0, this.windowWidth / this.windowScale, this.windowHeight / this.windowScale, 16, 16, 16, 16).setScale(this.windowScale);

    this.container.add(window);
    this.setupContent();

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    Event.emit(EVENT.DISABLE_DAY_NIGHT_FILTER);

    runFadeEffect(this.scene, 800, 'in');

    for (const ui of this.optionUis) {
      ui.show();
      ui.update();
    }

    this.optionDescUi.show();

    this.bgContainer.setVisible(true);
    this.titleContainer.setVisible(true);
    this.container.setVisible(true);

    this.handleKeyInput();
  }

  protected onClean(): void {
    Event.emit(EVENT.ENABLE_DAY_NIGHT_FILTER);

    runFadeEffect(this.scene, 800, 'in');

    this.bgContainer.setVisible(false);
    this.titleContainer.setVisible(false);
    this.container.setVisible(false);

    for (const ui of this.optionUis) {
      ui.clean();
    }

    this.optionDescUi.clean();

    SocketIO.changeOption({
      textSpeed: changeTextSpeedToDigit(Option.getTextSpeed() as number),
      frame: Option.getFrame('number') as number,
      backgroundVolume: (Option.getBackgroundVolume()! as number) * 10,
      effectVolume: (Option.getEffectVolume()! as number) * 10,
      tutorial: Option.getTutorial() as boolean,
    });
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {
    this.choice = this.lastChoice;
    this.optionDescUi.updateText(this.choice);
    this.contentTitleDummys[this.choice].setTexture(TEXTURE.WINDOW_RED);

    Keyboard.setAllowKey([KEY.ARROW_UP, KEY.ARROW_DOWN, KEY.ARROW_LEFT, KEY.ARROW_RIGHT, KEY.Z, KEY.ENTER, KEY.X, KEY.ESC]);
    Keyboard.setKeyDownCallback(async (key) => {
      try {
        if (this.activeControl === 'menu') {
          this.handleMenuNavigation(key);
        } else {
          this.optionUis[this.choice].handleKeyInput(key);
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  handleMenuNavigation(key: KEY) {
    let prevChoice = this.choice;

    switch (key) {
      case KEY.ARROW_UP:
        if (this.choice > 0) {
          this.choice--;
        }
        break;
      case KEY.ARROW_DOWN:
        if (this.choice < this.contentTitle.length - 1) {
          this.choice++;
        }
        break;
      case KEY.ARROW_LEFT:
        this.optionUis[this.choice].handleKeyInput(key);
        this.switchToOptionControl();
        return;
      case KEY.ARROW_RIGHT:
        this.optionUis[this.choice].handleKeyInput(key);
        this.switchToOptionControl();
        return;
      case KEY.ENTER:
      case KEY.Z:
        const target = this.contentTitle[this.choice];

        if (target === i18next.t('menu:optionTitle5')) {
          this.lastChoice = 0;
          this.contentTitleDummys[this.choice].setTexture(TEXTURE.BLANK);
          Game.popUi();
        }
        break;
      case KEY.ESC:
      case KEY.X:
        this.lastChoice = 0;
        this.contentTitleDummys[this.choice].setTexture(TEXTURE.BLANK);
        Game.popUi();
        break;
    }

    if (key === KEY.ARROW_UP || key === KEY.ARROW_DOWN) {
      if (this.choice !== prevChoice) {
        this.lastChoice = this.choice;
        playEffectSound(this.scene, AUDIO.SELECT_0);

        this.contentTitleDummys[prevChoice].setTexture(TEXTURE.BLANK);
        this.contentTitleDummys[this.choice].setTexture(TEXTURE.WINDOW_RED);

        this.optionDescUi.updateText(this.choice);
      }
    }
  }

  update(time?: number, delta?: number): void {}

  switchToOptionControl() {
    this.activeControl = 'option';
  }

  switchToMenuControl() {
    this.activeControl = 'menu';
  }

  private setupContent() {
    const contentHeight = 70;
    const spacing = 10;

    let currentY = -240;
    for (const title of this.contentTitle) {
      const titleText = this.addText(-570, currentY, title, TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5).setScale(0.9);
      const dummy = this.addWindow(TEXTURE.BLANK, -578, currentY, (this.windowWidth - 42) / this.contentDummyScale, 80 / this.contentDummyScale, 16, 16, 16, 16)
        .setScale(this.contentDummyScale)
        .setOrigin(0, 0.5);

      this.contentTitleTexts.push(titleText);
      this.contentTitleDummys.push(dummy);

      this.container.add(titleText);
      this.container.add(dummy);

      currentY += contentHeight + spacing;
    }
  }
}

export class OptionTextSpeedUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private optionUi: OptionUi;
  private optionDescUi: OptionDescUi;

  private choice: number = 0;

  private texts: Phaser.GameObjects.Text[] = [];

  private readonly contents: string[] = [i18next.t('menu:optionSlow'), i18next.t('menu:optionMid'), i18next.t('menu:optionFast')];

  constructor(scene: InGameScene, option: OptionUi, optionDesc: OptionDescUi) {
    super(scene);
    this.optionUi = option;
    this.optionDescUi = optionDesc;
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    const contentWidth = 180;
    const spacing = 50;

    let currentX = 0;

    this.container = this.createContainer(width / 2, height / 2 - 260);

    for (const content of this.contents) {
      const text = this.addText(currentX, 0, content, TEXTSTYLE.MESSAGE_BLACK).setOrigin(0.5, 0.5).setScale(0.9);

      this.texts.push(text);

      this.container.add(text);

      currentX += contentWidth + spacing;
    }

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
  }

  protected onClean(): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  async handleKeyInput(key: KEY) {
    let prevChoice = this.choice;

    this.texts[this.choice].setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLUE));

    switch (key) {
      case KEY.ARROW_UP:
      case KEY.ARROW_DOWN:
        this.optionDescUi.updateText(0);
        this.optionUi.switchToMenuControl();
        this.optionUi.handleMenuNavigation(key);
        return;
      case KEY.ARROW_LEFT:
        if (this.choice > 0) {
          this.choice--;
        }
        break;
      case KEY.ARROW_RIGHT:
        if (this.choice < this.contents.length - 1) {
          this.choice++;
        }
        break;
      case KEY.X:
        this.optionDescUi.updateText(0);
        this.optionUi.switchToMenuControl();
        Game.popUi();
        break;
    }

    if (key === KEY.ARROW_LEFT || key === KEY.ARROW_RIGHT) {
      if (this.choice !== prevChoice) {
        Option.setTextSpeed(this.choice);

        playEffectSound(this.scene, AUDIO.SELECT_0);

        this.optionDescUi.showTestTextSpeed(Option.getTextSpeed()!);

        this.texts[prevChoice].setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLACK));
        this.texts[this.choice].setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLUE));
      }
    }
  }

  update(time?: number, delta?: number): void {
    this.updateValue();
  }

  updateValue() {
    this.choice = changeTextSpeedToDigit(Option.getTextSpeed()!);

    for (const text of this.texts) {
      text.setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLACK));
    }

    this.texts[this.choice].setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLUE));
  }
}

export class OptionWindowTypeUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private optionUi: OptionUi;
  private optionDescUi: OptionDescUi;

  private arrowLeft!: Phaser.GameObjects.Image;
  private arrowRight!: Phaser.GameObjects.Image;
  private text!: Phaser.GameObjects.Text;

  private choice: number = 0;

  private readonly contents: number = 5;

  constructor(scene: InGameScene, option: OptionUi, optionDesc: OptionDescUi) {
    super(scene);
    this.optionUi = option;
    this.optionDescUi = optionDesc;
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2 + 230, height / 2 - 180);

    this.text = this.addText(0, 0, i18next.t('menu:optionWindow') + '0', TEXTSTYLE.MESSAGE_BLACK)
      .setOrigin(0.5, 0.5)
      .setScale(0.9);
    this.arrowLeft = this.addImage(TEXTURE.ARROW_G, this.text.x - this.text.displayOriginX - 20, 0).setScale(3);
    this.arrowRight = this.addImage(TEXTURE.ARROW_G, this.text.displayOriginX + this.text.x + 20, 0)
      .setFlipX(true)
      .setScale(3);

    this.container.add(this.text);
    this.container.add(this.arrowLeft);
    this.container.add(this.arrowRight);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);

    this.text.setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLUE));
  }

  protected onClean(): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(key: KEY) {
    let prevChoice = this.choice;

    this.arrowLeft.setVisible(true);
    this.arrowRight.setVisible(true);

    this.text.setText(i18next.t('menu:optionWindow') + `${this.choice}`);

    switch (key) {
      case KEY.ARROW_UP:
      case KEY.ARROW_DOWN:
        this.optionUi.switchToMenuControl();
        this.optionUi.handleMenuNavigation(key);
        return;
      case KEY.ARROW_LEFT:
        if (this.choice > 0) this.choice--;
        break;
      case KEY.ARROW_RIGHT:
        if (this.choice < this.contents - 1) this.choice++;
        break;
      case KEY.X:
        Game.popUi();
        this.optionUi.switchToMenuControl();
        break;
    }

    if (key === KEY.ARROW_LEFT || key === KEY.ARROW_RIGHT) {
      if (this.choice !== prevChoice) {
        Option.setFrame(this.choice);
        playEffectSound(this.scene, AUDIO.SELECT_0);

        this.optionDescUi.showTestWindowFrame(Option.getFrame('text') as string);
        this.text.setText(i18next.t('menu:optionWindow') + `${this.choice}`);
      }
    }
  }

  update(time?: number, delta?: number): void {
    this.updateValue();
  }

  updateValue() {
    this.choice = Option.getFrame('number') as number;

    this.text.setText(i18next.t('menu:optionWindow') + `${this.choice}`);
  }
}

export class OptionBackgroundSoundUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private optionUi: OptionUi;

  private choice: number = 0;

  private texts: Phaser.GameObjects.Text[] = [];

  private readonly contents: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  constructor(scene: InGameScene, option: OptionUi) {
    super(scene);
    this.optionUi = option;
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    const contentWidth = 50;
    const spacing = 10;

    let currentX = 0;

    this.container = this.createContainer(width / 2 - 60, height / 2 - 100);

    for (const content of this.contents) {
      const text = this.addText(currentX, 0, content, TEXTSTYLE.MESSAGE_BLACK).setOrigin(0.5, 0.5).setScale(0.9);

      this.texts.push(text);

      this.container.add(text);

      currentX += contentWidth + spacing;
    }

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
  }

  protected onClean(): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(key: KEY) {
    let prevChoice = this.choice;

    this.texts[this.choice].setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLUE));

    switch (key) {
      case KEY.ARROW_UP:
      case KEY.ARROW_DOWN:
        this.optionUi.switchToMenuControl();
        this.optionUi.handleMenuNavigation(key);
        return;
      case KEY.ARROW_LEFT:
        if (this.choice > 0) this.choice--;
        break;
      case KEY.ARROW_RIGHT:
        if (this.choice < this.contents.length - 1) this.choice++;
        break;
      case KEY.X:
        Game.popUi();
        this.optionUi.switchToMenuControl();
        break;
    }

    if (key === KEY.ARROW_LEFT || key === KEY.ARROW_RIGHT) {
      if (this.choice !== prevChoice) {
        Option.setBackgroundVolume(this.choice);
        playEffectSound(this.scene, AUDIO.SELECT_0);

        this.texts[prevChoice].setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLACK));
        this.texts[this.choice].setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLUE));
      }
    }
  }

  update(time?: number, delta?: number): void {
    this.updateValue();
  }

  updateValue() {
    this.choice = Option.getBackgroundVolume()! * 10;

    for (const text of this.texts) {
      text.setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLACK));
    }

    this.texts[this.choice >= 0 ? this.choice : 5].setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLUE));
  }
}

export class OptionEffectSoundUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private optionUi: OptionUi;

  private choice: number = 0;

  private texts: Phaser.GameObjects.Text[] = [];

  private readonly contents: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  constructor(scene: InGameScene, option: OptionUi) {
    super(scene);
    this.optionUi = option;
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    const contentWidth = 50;
    const spacing = 10;

    let currentX = 0;

    this.container = this.createContainer(width / 2 - 60, height / 2 - 20);

    for (const content of this.contents) {
      const text = this.addText(currentX, 0, content, TEXTSTYLE.MESSAGE_BLACK).setOrigin(0.5, 0.5).setScale(0.9);

      this.texts.push(text);

      this.container.add(text);

      currentX += contentWidth + spacing;
    }

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
  }

  protected onClean(): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(key: KEY) {
    let prevChoice = this.choice;

    this.texts[this.choice].setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLUE));

    switch (key) {
      case KEY.ARROW_UP:
      case KEY.ARROW_DOWN:
        this.optionUi.switchToMenuControl();
        this.optionUi.handleMenuNavigation(key);
        return;
      case KEY.ARROW_LEFT:
        if (this.choice > 0) this.choice--;
        break;
      case KEY.ARROW_RIGHT:
        if (this.choice < this.contents.length - 1) this.choice++;
        break;
      case KEY.X:
        Game.popUi();
        this.optionUi.switchToMenuControl();
        break;
    }

    if (key === KEY.ARROW_LEFT || key === KEY.ARROW_RIGHT) {
      if (this.choice !== prevChoice) {
        Option.setEffectVolume(this.choice);
        playEffectSound(this.scene, AUDIO.SELECT_0);

        this.texts[prevChoice].setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLACK));
        this.texts[this.choice].setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLUE));
      }
    }
  }

  update(time?: number, delta?: number): void {
    this.updateValue();
  }

  updateValue() {
    this.choice = Option.getEffectVolume()! * 10;

    for (const text of this.texts) {
      text.setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLACK));
    }

    this.texts[this.choice >= 0 ? this.choice : 5].setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLUE));
  }
}

export class OptionTutorialUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private optionUi: OptionUi;
  private optionDescUi: OptionDescUi;

  private choice: number = 0;

  private texts: Phaser.GameObjects.Text[] = [];

  private readonly contents: string[] = [i18next.t('menu:optionOn'), i18next.t('menu:optionOff')];

  constructor(scene: InGameScene, option: OptionUi, optionDesc: OptionDescUi) {
    super(scene);
    this.optionUi = option;
    this.optionDescUi = optionDesc;
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    const contentWidth = 180;
    const spacing = 50;

    let currentX = +125;

    this.container = this.createContainer(width / 2, height / 2 + 60);

    for (const content of this.contents) {
      const text = this.addText(currentX, 0, content, TEXTSTYLE.MESSAGE_BLACK).setOrigin(0.5, 0.5).setScale(0.9);

      this.texts.push(text);

      this.container.add(text);

      currentX += contentWidth + spacing;
    }

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.container.setScrollFactor(0);
  }

  show(data?: any) {
    this.container.setVisible(true);
  }

  protected onClean(): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  async handleKeyInput(key: KEY) {
    let prevChoice = this.choice;

    this.texts[this.choice].setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLUE));

    switch (key) {
      case KEY.ARROW_UP:
      case KEY.ARROW_DOWN:
        this.optionDescUi.updateText(0);
        this.optionUi.switchToMenuControl();
        this.optionUi.handleMenuNavigation(key);
        return;
      case KEY.ARROW_LEFT:
        if (this.choice > 0) {
          this.choice--;
        }
        break;
      case KEY.ARROW_RIGHT:
        if (this.choice < this.contents.length - 1) {
          this.choice++;
        }
        break;
      case KEY.X:
        this.optionDescUi.updateText(0);
        this.optionUi.switchToMenuControl();
        Game.popUi();
        break;
    }

    if (key === KEY.ARROW_LEFT || key === KEY.ARROW_RIGHT) {
      if (this.choice !== prevChoice) {
        Option.setTutorial(this.choice === 0 ? true : false);

        playEffectSound(this.scene, AUDIO.SELECT_0);

        this.texts[prevChoice].setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLACK));
        this.texts[this.choice].setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLUE));
      }
    }
  }

  update(time?: number, delta?: number): void {
    this.updateValue();
  }

  updateValue() {
    for (const text of this.texts) {
      text.setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLACK));
    }

    if (Option.getTutorial()) {
      this.choice = 0;
      this.texts[0].setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLUE));
    } else {
      this.choice = 1;
      this.texts[1].setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLUE));
    }
  }
}

export class OptionDescUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private optionUi: OptionUi;

  private window!: Phaser.GameObjects.NineSlice;
  private text!: Phaser.GameObjects.Text;
  private textSpeedTimer: Phaser.Time.TimerEvent | null = null;

  private readonly windowWidth: number = 1200;
  private readonly windowHeight: number = 200;
  private readonly windowScale: number = 3;

  private readonly contents: string[] = [
    i18next.t('menu:optionDesc0'),
    i18next.t('menu:optionDesc1'),
    i18next.t('menu:optionDesc2'),
    i18next.t('menu:optionDesc3'),
    i18next.t('menu:optionDesc4'),
    i18next.t('menu:optionDesc5'),
  ];

  constructor(scene: InGameScene, option: OptionUi) {
    super(scene);
    this.optionUi = option;
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2 + 392);

    this.window = this.addWindow(Option.getFrame('text') as TEXTURE, 0, 0, this.windowWidth / this.windowScale, this.windowHeight / this.windowScale, 16, 16, 16, 16).setScale(this.windowScale);
    this.text = this.addText(-555, -30, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5).setScale(0.9);

    this.container.add(this.window);
    this.container.add(this.text);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
  }

  protected onClean(): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  updateText(idx: number) {
    if (!this.text || !this.text.active) return;

    if (this.textSpeedTimer) {
      this.textSpeedTimer.destroy();
      this.textSpeedTimer = null;
    }

    if (idx >= 0 && idx < this.contents.length) {
      this.text.setText(this.contents[idx]);
    }
  }

  async showTestTextSpeed(speed: TextSpeed) {
    if (this.textSpeedTimer) {
      this.textSpeedTimer.destroy();
      this.textSpeedTimer = null;
    }

    const text = i18next.t('menu:optionDescTextSpeed').split('');
    let index = 0;
    this.text.text = '';

    return new Promise<void>((resolve) => {
      const addNextChar = () => {
        if (index < text.length) {
          this.text.text += text[index];
          index++;
          this.textSpeedTimer = this.scene.time.delayedCall(speed, addNextChar, [], this);
        } else {
          this.textSpeedTimer = null;
          resolve();
        }
      };
      addNextChar();
    });
  }

  showTestWindowFrame(texture: string) {
    this.window.setTexture(texture);
  }
}
