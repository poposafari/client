import { AudioManager, BaseUi, IInputHandler, IRefreshableLanguage } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import {
  DEPTH,
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
  getSessionBackgroundKey,
  getTextShadow,
  getTextStyle,
} from '@poposafari/utils';
import i18next from '@poposafari/i18n';
import { TalkMessageUi } from '../message';
import {
  KeyGuideBarContainer,
  type KeyGuideBarOptions,
} from '@poposafari/containers/key-guide-bar.container';

export class TitleUi extends BaseUi implements IInputHandler, IRefreshableLanguage {
  scene: GameScene;
  private audio: AudioManager;
  private talk!: TalkMessageUi;

  private currentCursor: number = 0;
  private inputResolver: ((result: { input: TitleUiInput; cursorIndex: number }) => void) | null =
    null;

  private topContainer!: GContainer;
  private bg!: GImage;
  private title!: GImage;

  private static readonly MAIN_TITLE_KEYS = [
    'etc:continue',
    'etc:newgame',
    'etc:mysteryGift',
    'etc:option',
    'etc:logout',
  ] as const;

  private mainContainer!: GContainer;
  private mainTexts: GText[] = [];
  private mainTitles: string[] = TitleUi.MAIN_TITLE_KEYS.map((k) => i18next.t(k));
  private ignoreTitleKeys: string[] = ['etc:mysteryGift'];
  private ignoreTitles: string[] = [];

  private versionText!: GText;
  private playersOnline: number = 0;
  private playerOnlineContainer!: GContainer;
  private playerOnlineDot!: Phaser.GameObjects.Graphics;
  private playersOnlineText!: GText;
  private inputGuide!: KeyGuideBarContainer;

  private socialContainer!: GContainer;
  private githubBg!: Phaser.GameObjects.Graphics;
  private githubLogo!: GImage;
  private githubOverlay!: Phaser.GameObjects.Graphics;
  private discordBg!: Phaser.GameObjects.Graphics;
  private discordLogo!: GImage;
  private discordOverlay!: Phaser.GameObjects.Graphics;

  constructor(scene: GameScene, existUser: boolean) {
    super(scene, scene.getInputManager(), DEPTH.DEFAULT);
    this.scene = scene;
    this.audio = scene.getAudio();
    this.talk = scene.getMessage('talk');

    this.isExistUser(existUser);
    this.ignoreTitles = this.ignoreTitleKeys.map((k) => i18next.t(k));
    this.createLayout();
    this.findInitialValidCursor();
    this.updateCursor();
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
            [i18next.t('etc:continue')]: 'continue',
            [i18next.t('etc:newgame')]: 'newgame',
            [i18next.t('etc:mysteryGift')]: 'mystery_gift',
            [i18next.t('etc:option')]: 'option',
            [i18next.t('etc:logout')]: 'logout',
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
      this.ignoreTitleKeys.push('etc:continue');
    }
  }

  setExistUser(exist: boolean): void {
    const idx = this.ignoreTitleKeys.indexOf('etc:continue');
    if (exist && idx >= 0) {
      this.ignoreTitleKeys.splice(idx, 1);
    } else if (!exist && idx < 0) {
      this.ignoreTitleKeys.push('etc:continue');
    }
    this.ignoreTitles = this.ignoreTitleKeys.map((k) => i18next.t(k));
    this.findInitialValidCursor();
    this.updateCursor();
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

  waitForInput(initialCursorIndex?: number): Promise<{ input: TitleUiInput; cursorIndex: number }> {
    if (initialCursorIndex !== undefined) {
      this.currentCursor = Math.max(0, Math.min(this.mainTitles.length - 1, initialCursorIndex));
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

  async waitForServerBusy(cooldownSec: number): Promise<void> {
    await this.scene.getMessage('cooldown').showCooldown(i18next.t('etc:serverBusy'), cooldownSec);
  }

  createLayout(): void {
    this.bg = addBackground(this.scene, TEXTURE.BG_1);

    this.createTopLayout();
    this.createMainLayout();
    this.createPlayerOnlineLayout();
    this.createSocialLinks();
    this.createInputGuide();

    this.add([
      this.bg,
      this.topContainer,
      this.mainContainer,
      this.playerOnlineContainer,
      this.socialContainer,
      this.inputGuide,
    ]);
  }

  createTopLayout() {
    this.topContainer = addContainer(this.scene, DEPTH.DEFAULT);
    this.title = addImage(this.scene, TEXTURE.LOGO_0, undefined, 0, 0).setScale(3.4);

    this.versionText = addText(
      this.scene,
      this.title.displayWidth / 2,
      this.title.displayHeight / 2,
      __BUILD_VERSION__,
      60,
      '100',
      'right',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    ).setOrigin(1, 0);

    this.topContainer.setY(-400);
    this.topContainer.add([this.title, this.versionText]);
  }

  private createPlayerOnlineLayout() {
    const DOT_RADIUS = 14;
    const DOT_COLOR = 0x22c55e;
    const GAP = 18;
    const ANCHOR_LEFT_X = -940;
    const ANCHOR_TOP_Y = -500;

    this.playerOnlineContainer = addContainer(this.scene, DEPTH.DEFAULT);

    this.playerOnlineDot = this.scene.add.graphics();
    this.playerOnlineDot.fillStyle(DOT_COLOR, 1);
    this.playerOnlineDot.fillCircle(0, 0, DOT_RADIUS);

    this.playersOnlineText = addText(
      this.scene,
      DOT_RADIUS + GAP,
      0,
      i18next.t('etc:playersOnline', { value: this.playersOnline }),
      50,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    ).setOrigin(0, 0.5);

    this.playerOnlineContainer.setPosition(ANCHOR_LEFT_X + DOT_RADIUS, ANCHOR_TOP_Y);
    this.playerOnlineContainer.add([this.playerOnlineDot, this.playersOnlineText]);
  }

  setPlayersOnline(value: number): void {
    this.playersOnline = value;
    this.playersOnlineText.setText(i18next.t('etc:playersOnline', { value }));
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

  private createInputGuide() {
    this.inputGuide = new KeyGuideBarContainer(this.scene);
    this.inputGuide.create(this.buildInputGuideOptions());
    this.inputGuide.setPosition(+930, +500);
  }

  private drawSocialBg(
    g: Phaser.GameObjects.Graphics,
    centerX: number,
    width: number,
    height: number,
    radius: number,
    color: number,
    alpha: number,
  ): void {
    g.clear();
    g.fillStyle(color, alpha);
    g.fillRoundedRect(centerX - width / 2, -height / 2, width, height, radius);
  }

  private createSocialLinks() {
    const BG_PADDING_X = 18;
    const BG_PADDING_Y = 10;
    const BUTTON_GAP = 16;
    const BG_ALPHA = 0.8;
    const GITHUB_COLOR = 0xffffff;
    const DISCORD_COLOR = 0x5865f2;
    const ANCHOR_LEFT_X = -940;
    const GITHUB_URL = 'https://github.com/seophohoho/poposafari';
    const DISCORD_URL = 'https://discord.gg/uqt7cqqT23';
    const TINT_GRAY = 0xcccccc;

    this.socialContainer = addContainer(this.scene, DEPTH.DEFAULT);

    this.githubLogo = addImage(this.scene, TEXTURE.LOGO_GITHUB, undefined, 0, 0);
    this.discordLogo = addImage(this.scene, TEXTURE.LOGO_DISCORD, undefined, 0, 0);

    const bgHeight = this.discordLogo.displayHeight + BG_PADDING_Y * 2;
    const githubBgW = this.githubLogo.displayWidth + BG_PADDING_X * 2;
    const discordBgW = this.discordLogo.displayWidth + BG_PADDING_X * 2;
    const bgRadius = bgHeight / 2;

    const githubX = 0;
    const discordX = githubBgW / 2 + BUTTON_GAP + discordBgW / 2;

    this.githubLogo.setPosition(githubX, 0);
    this.discordLogo.setPosition(discordX, 0);

    this.githubBg = this.scene.add.graphics();
    this.discordBg = this.scene.add.graphics();
    this.drawSocialBg(
      this.githubBg,
      githubX,
      githubBgW,
      bgHeight,
      bgRadius,
      GITHUB_COLOR,
      BG_ALPHA,
    );
    this.drawSocialBg(
      this.discordBg,
      discordX,
      discordBgW,
      bgHeight,
      bgRadius,
      DISCORD_COLOR,
      BG_ALPHA,
    );

    this.githubBg.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(
        githubX - githubBgW / 2,
        -bgHeight / 2,
        githubBgW,
        bgHeight,
      ),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    this.githubBg.on('pointerover', () => this.githubOverlay.setVisible(true));
    this.githubBg.on('pointerout', () => this.githubOverlay.setVisible(false));
    this.githubBg.on('pointerdown', () => {
      window.open(GITHUB_URL, '_blank', 'noopener,noreferrer');
    });

    this.discordBg.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(
        discordX - discordBgW / 2,
        -bgHeight / 2,
        discordBgW,
        bgHeight,
      ),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    this.discordBg.on('pointerover', () => this.discordOverlay.setVisible(true));
    this.discordBg.on('pointerout', () => this.discordOverlay.setVisible(false));
    this.discordBg.on('pointerdown', () => {
      window.open(DISCORD_URL, '_blank', 'noopener,noreferrer');
    });

    // 호버 오버레이: bg/logo 위에 깔리고 multiply 블렌드로 setTint(0xcccccc)와 동일한 어둡힘 효과
    this.githubOverlay = this.scene.add.graphics();
    this.githubOverlay.fillStyle(TINT_GRAY, 1);
    this.githubOverlay.fillRoundedRect(
      githubX - githubBgW / 2,
      -bgHeight / 2,
      githubBgW,
      bgHeight,
      bgRadius,
    );
    this.githubOverlay.setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.githubOverlay.setVisible(false);

    this.discordOverlay = this.scene.add.graphics();
    this.discordOverlay.fillStyle(TINT_GRAY, 1);
    this.discordOverlay.fillRoundedRect(
      discordX - discordBgW / 2,
      -bgHeight / 2,
      discordBgW,
      bgHeight,
      bgRadius,
    );
    this.discordOverlay.setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.discordOverlay.setVisible(false);

    this.socialContainer.setPosition(ANCHOR_LEFT_X + githubBgW / 2, +500);
    // 렌더 순서: bg → logo → overlay (overlay가 최상단, multiply로 아래 픽셀을 어둡힘)
    this.socialContainer.add([
      this.githubBg,
      this.discordBg,
      this.githubLogo,
      this.discordLogo,
      this.githubOverlay,
      this.discordOverlay,
    ]);
  }

  /**
   * inputGuide 옵션 — 초기 빌드와 언어 변경 시 recreate 양쪽에서 사용.
   * i18next.t() 가 호출 시점의 현재 언어로 평가되므로 동일 함수가 양쪽에서 올바른 텍스트를 만든다.
   */
  private buildInputGuideOptions(): KeyGuideBarOptions {
    return {
      entries: [
        { keys: [i18next.t('etc:arrowKey')], description: i18next.t('etc:move') },
        { keys: ['Z', 'ENTER'], description: i18next.t('etc:confirm') },
      ],
      keycapTextSize: 36,
      keycapPaddingX: 50,
      keycapPaddingY: 40,
      keycapScale: 2,
      keycapTextYOffset: -5,
      descriptionTextSize: 50,
      gapKeyToDescription: 8,
      gapBetweenEntries: 30,
      gapInsideEntry: 4,
      align: 'right',
      maxWidth: this.scene.cameras.main.width - 60,
    };
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

  onRefreshLanguage(): void {
    for (let i = 0; i < TitleUi.MAIN_TITLE_KEYS.length; i++) {
      const key = TitleUi.MAIN_TITLE_KEYS[i];
      this.mainTitles[i] = i18next.t(key);
      this.mainTexts[i].setText(this.mainTitles[i]);
    }

    this.ignoreTitles = this.ignoreTitleKeys.map((k) => i18next.t(k));
    this.updateCursor();

    this.playersOnlineText.setText(i18next.t('etc:playersOnline', { value: this.playersOnline }));

    // 키캡(`방향키` 등)의 폭이 언어에 따라 달라지므로 전체 재빌드. transform(setPosition) 유지됨.
    this.inputGuide.recreate(this.buildInputGuideOptions());
  }

  show(): void {
    this.bg.setTexture(getSessionBackgroundKey());
    super.show();
  }

  updateBg(): void {
    this.bg.setTexture(getSessionBackgroundKey());
  }
}
