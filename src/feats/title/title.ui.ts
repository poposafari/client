import { AudioManager, BaseUi, IInputHandler, IRefreshableLanguage } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import {
  DEPTH,
  EASE,
  KEY,
  SFX,
  TEXTCOLOR,
  TEXTSHADOW,
  TEXTSTYLE,
  TEXTURE,
  TitleUiInput,
} from '@poposafari/types';
import {
  addBackground,
  addContainer,
  addImage,
  addText,
  getBackgroundKey,
  getRandomSplash,
  getTextShadow,
  getTextStyle,
} from '@poposafari/utils';
import i18next from '@poposafari/i18n';
import { TalkMessageUi } from '../message';

export class TitleUi extends BaseUi implements IInputHandler, IRefreshableLanguage {
  private audio: AudioManager;
  private talk!: TalkMessageUi;

  private currentCursor: number = 0;
  private splashTween: Phaser.Tweens.Tween | null = null;
  private inputResolver: ((result: { input: TitleUiInput; cursorIndex: number }) => void) | null =
    null;

  private topContainer!: GContainer;
  private bg!: GImage;
  private title!: GImage;
  private splashText!: GText;

  private static readonly MAIN_TITLE_KEYS = [
    'menu:continue',
    'menu:newgame',
    'menu:mysteryGift',
    'menu:option',
    'menu:logout',
  ] as const;

  private mainContainer!: GContainer;
  private mainTexts: GText[] = [];
  private mainTitles: string[] = TitleUi.MAIN_TITLE_KEYS.map((k) => i18next.t(k));
  private ignoreTitleKeys: string[] = ['menu:mysteryGift'];
  private ignoreTitles: string[] = [];

  private bottomContainer!: GContainer;
  private versionText!: GText;

  constructor(scene: GameScene, existUser: boolean) {
    super(scene, scene.getInputManager(), DEPTH.DEFAULT);
    this.audio = scene.getAudio();
    this.talk = scene.getMessage('talk');

    this.isExistUser(existUser);
    this.ignoreTitles = this.ignoreTitleKeys.map((k) => i18next.t(k));
    this.createLayout();
    this.findInitialValidCursor();
    this.updateCursor();
    this.startSplashAnimation();
  }

  onInput(key: string): void {
    switch (key) {
      case KEY.UP:
        this.audio.playEffect(SFX.CURSOR_0);
        this.moveCursor(-1);
        break;
      case KEY.DOWN:
        this.audio.playEffect(SFX.CURSOR_0);
        this.moveCursor(1);
        break;
      case KEY.Z:
      case KEY.ENTER:
        const select = this.handleSelect();
        this.audio.playEffect(SFX.CURSOR_0);

        if (select !== 'none' && this.inputResolver) {
          const inputMap: Record<string, TitleUiInput> = {
            [i18next.t('menu:continue')]: 'continue',
            [i18next.t('menu:newgame')]: 'newgame',
            [i18next.t('menu:mysteryGift')]: 'mystery_gift',
            [i18next.t('menu:option')]: 'option',
            [i18next.t('menu:logout')]: 'logout',
          };
          const input = inputMap[select] ?? 'logout';
          this.inputResolver({ input, cursorIndex: this.currentCursor });
          this.inputResolver = null;
        }
        break;
    }
  }

  errorEffect(errorMsg: string): void {
    throw new Error('Method not implemented.');
  }

  private isExistUser(exist: boolean) {
    if (!exist) {
      this.ignoreTitleKeys.push('menu:continue');
    }
  }

  private moveCursor(step: number): void {
    const len = this.mainTexts.length;
    let nextIndex = this.currentCursor;
    let count = 0;

    while (count < len) {
      nextIndex = (nextIndex + step + len) % len;
      count++;

      const nextTitle = this.mainTitles[nextIndex];

      if (!this.ignoreTitles.includes(nextTitle)) {
        this.currentCursor = nextIndex;
        this.updateCursor();
        return;
      }
    }
  }

  private findInitialValidCursor(): void {
    const currentTitle = this.mainTitles[this.currentCursor];
    if (this.ignoreTitles.includes(currentTitle)) {
      this.moveCursor(1);
    }
  }

  /** initialCursorIndex: 복귀 시 커서 복원용. 지정 시 유효한 인덱스로 보정 후 사용. */
  waitForInput(initialCursorIndex?: number): Promise<{ input: TitleUiInput; cursorIndex: number }> {
    if (initialCursorIndex !== undefined) {
      this.currentCursor = Math.max(
        0,
        Math.min(this.mainTitles.length - 1, initialCursorIndex),
      );
      this.findInitialValidCursor();
      this.updateCursor();
    }
    return new Promise((resolve) => {
      this.inputResolver = resolve;
    });
  }

  async waitForError(error: any) {
    await this.talk.showMessage(error, { name: '' });
  }

  createLayout(): void {
    this.bg = addBackground(this.scene, TEXTURE.BG_1);

    this.createTopLayout();
    this.createMainLayout();
    this.createBottomLayout();

    this.add([this.bg, this.topContainer, this.mainContainer, this.bottomContainer]);
  }

  createTopLayout() {
    const splashBundle = i18next.getResourceBundle(i18next.language, 'splash');
    const { text: splashContent, fontSize: splashFontSize } = getRandomSplash(splashBundle);

    this.topContainer = addContainer(this.scene, DEPTH.DEFAULT);
    this.title = addImage(this.scene, TEXTURE.LOGO_0, undefined, 0, 0).setScale(3.4);
    this.splashText = addText(
      this.scene,
      +380,
      +30,
      splashContent,
      splashFontSize,
      '100',
      'center',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.DARK_YELLOW,
    ).setAngle(-25);
    this.topContainer.setY(-400);

    this.topContainer.add([this.title, this.splashText]);
  }

  createMainLayout() {
    const contentHeight = 80;
    const contentSpacing = 20;

    let currentY = -110;

    this.mainContainer = addContainer(this.scene, DEPTH.DEFAULT);

    for (const title of this.mainTitles) {
      this.mainTexts.push(
        addText(
          this.scene,
          0,
          currentY,
          title,
          80,
          '100',
          'center',
          TEXTSTYLE.WHITE,
          TEXTSHADOW.GRAY,
        ),
      );

      currentY += contentHeight + contentSpacing;
    }
    this.mainContainer.add(this.mainTexts);
  }

  private createBottomLayout() {
    this.bottomContainer = addContainer(this.scene, DEPTH.DEFAULT);
    this.versionText = addText(
      this.scene,
      0,
      0,
      'v0.0.1',
      100,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    this.bottomContainer.setPosition(-930, +480);

    this.bottomContainer.add([this.versionText]);
  }

  private handleSelect(): string {
    const currentTitle = this.mainTitles[this.currentCursor];

    if (this.ignoreTitles.includes(currentTitle)) {
      return 'none';
    }

    return currentTitle;
  }

  private updateCursor() {
    this.mainTexts.forEach((text, index) => {
      const isSelected = index === this.currentCursor;
      this.applyMenu(text, text.text, isSelected);
    });
  }

  private applyMenu(textObj: GText, title: string, isSelected: boolean) {
    if (this.ignoreTitles.includes(title)) {
      const blockStyle = getTextStyle(TEXTSTYLE.BLOCKING, 70, '100');
      textObj.setColor(blockStyle.color || TEXTCOLOR.LIGHT_GRAY);

      const [sx, sy, sc] = getTextShadow(TEXTSHADOW.BLOCKING);
      textObj.setShadow(sx, sy, sc);
      return;
    }

    const targetColor = isSelected ? TEXTCOLOR.YELLOW : TEXTCOLOR.WHITE;
    const targetShadowEnum = isSelected ? TEXTSHADOW.GRAY : TEXTSHADOW.GRAY;

    textObj.setColor(targetColor);

    const [sx, sy, sc] = getTextShadow(targetShadowEnum);
    textObj.setShadow(sx, sy, sc);
  }

  public startSplashAnimation(): void {
    if (this.splashTween && this.splashTween.isPlaying()) {
      return;
    }

    this.splashTween = this.scene.tweens.add({
      targets: this.splashText,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: EASE.SINE_EASEINOUT,
    });
  }

  public stopSplashAnimation(): void {
    if (this.splashTween) {
      this.splashTween.remove();
      this.splashTween = null;
    }

    if (this.splashText) {
      this.splashText.setScale(1);
    }
  }

  onRefreshLanguage(): void {
    for (let i = 0; i < TitleUi.MAIN_TITLE_KEYS.length; i++) {
      const key = TitleUi.MAIN_TITLE_KEYS[i];
      this.mainTitles[i] = i18next.t(key);
      this.mainTexts[i].setText(this.mainTitles[i]);
    }
    const splashBundle = i18next.getResourceBundle(i18next.language, 'splash');
    const { text: splashContent, fontSize: splashFontSize } = getRandomSplash(splashBundle);
    this.splashText.setText(splashContent);
    this.splashText.setFontSize(splashFontSize);

    this.ignoreTitles = this.ignoreTitleKeys.map((k) => i18next.t(k));
    this.updateCursor();
  }

  show(): void {
    this.bg.setTexture(getBackgroundKey());
    super.show();
  }

  updateBg(): void {
    this.bg.setTexture(getBackgroundKey());
  }
}
