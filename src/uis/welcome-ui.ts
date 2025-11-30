import { DEPTH, EASE, MessageEndDelay, MODE, TEXTSTYLE, TEXTURE } from '../enums';
import { TalkMessageUi } from './talk-message-ui';
import { delay, Ui } from './ui';
import i18next from '../i18n';
import { Option } from '../core/storage/player-option';
import { Game } from '../core/manager/game-manager';

export class WelcomeUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private talkUi: TalkMessageUi | null = null;

  private overlayBg!: Phaser.GameObjects.Image;

  private helpArrows!: Phaser.GameObjects.Image;
  private helpArrowsGuideText!: Phaser.GameObjects.Text;
  private helpKeyZWindow!: Phaser.GameObjects.NineSlice;
  private helpKeyZText!: Phaser.GameObjects.Text;
  private helpKeyEnterWindow!: Phaser.GameObjects.NineSlice;
  private helpKeyEnterText!: Phaser.GameObjects.Text;
  private helpKeySelectGuideText!: Phaser.GameObjects.Text;

  private helpKeyXWindow!: Phaser.GameObjects.NineSlice;
  private helpKeyXText!: Phaser.GameObjects.Text;
  private helpKeyEscWindow!: Phaser.GameObjects.NineSlice;
  private helpKeyEscText!: Phaser.GameObjects.Text;
  private helpKeyCancelGuideText!: Phaser.GameObjects.Text;

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createTrackedContainer(width / 2, height / 2);

    const bg = this.addBackground(TEXTURE.BG_TITLE).setOrigin(0.5, 0.5);
    this.overlayBg = this.addBackground(TEXTURE.BG_BLACK).setOrigin(0.5, 0.5).setAlpha(0);

    this.container.add(bg);
    this.container.add(this.overlayBg);

    this.setupHelpWindow();

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TITLE - 1);
    this.container.setScrollFactor(0);
  }

  async show(data?: any): Promise<void> {
    this.container.setVisible(true);

    this.talkUi = new TalkMessageUi(this.scene);
    await this.talkUi.setup();

    await this.talkUi.show({ type: 'default', content: i18next.t('message:introNewgame1'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:introNewgame2'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:introNewgame3'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
    await this.showOverlayBg();
    this.showGroup1();
    await delay(this.scene, 300);
    this.showGroup2();
    await this.talkUi.show({ type: 'default', content: i18next.t('message:introNewgame4'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
    this.showGroup3();
    await this.talkUi.show({ type: 'default', content: i18next.t('message:introNewgame5'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
    this.hideAllGroups();
    await this.talkUi.show({ type: 'default', content: i18next.t('message:introNewgame6'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });

    Game.changeMode(MODE.TITLE);
  }

  protected onClean(): void {
    if (this.talkUi) {
      this.talkUi.clean();
      this.talkUi = null;
    }
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}

  private setupHelpWindow() {
    const scale: number = 4;
    const windowWidth: number = 150;
    const windowHeight: number = 150;

    this.helpArrows = this.addImage(TEXTURE.HELP_ARROWS, -600, -115).setScale(4.2);
    this.helpArrowsGuideText = this.addText(-600, +70, i18next.t('menu:helpArrowsGuide'), TEXTSTYLE.MESSAGE_WHITE).setOrigin(0.5, 0.5).setScale(0.9);

    this.helpKeyZWindow = this.addWindow(TEXTURE.WINDOW_HELP, -120, -115, windowWidth / scale, windowHeight / scale, 16, 16, 16, 16).setScale(scale);
    this.helpKeyZText = this.addText(-120, -110, 'Z', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0.5, 0.5).setScale(0.9);
    this.helpKeyEnterWindow = this.addWindow(TEXTURE.WINDOW_HELP, +100, -115, (windowWidth + 120) / scale, windowHeight / scale, 16, 16, 16, 16).setScale(scale);
    this.helpKeyEnterText = this.addText(+145, -110, 'Enter', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0.5, 0.5).setScale(0.9);
    this.helpKeySelectGuideText = this.addText(+15, +70, i18next.t('menu:helpSelectGuide'), TEXTSTYLE.MESSAGE_WHITE).setOrigin(0.5, 0.5).setScale(0.9);

    this.helpKeyXWindow = this.addWindow(TEXTURE.WINDOW_HELP, +520, -115, windowWidth / scale, windowHeight / scale, 16, 16, 16, 16).setScale(scale);
    this.helpKeyXText = this.addText(+520, -110, 'X', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0.5, 0.5).setScale(0.9);
    this.helpKeyEscWindow = this.addWindow(TEXTURE.WINDOW_HELP, +680, -115, windowWidth / scale, windowHeight / scale, 16, 16, 16, 16).setScale(scale);
    this.helpKeyEscText = this.addText(+680, -110, 'Esc', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0.5, 0.5).setScale(0.9);
    this.helpKeyCancelGuideText = this.addText(+610, +70, i18next.t('menu:helpCancelGuide'), TEXTSTYLE.MESSAGE_WHITE).setOrigin(0.5, 0.5).setScale(0.9);

    this.container.add(this.helpArrows);
    this.container.add(this.helpArrowsGuideText);
    this.container.add(this.helpKeyZWindow);
    this.container.add(this.helpKeyZText);
    this.container.add(this.helpKeyEnterWindow);
    this.container.add(this.helpKeyEnterText);
    this.container.add(this.helpKeySelectGuideText);
    this.container.add(this.helpKeyXWindow);
    this.container.add(this.helpKeyXText);
    this.container.add(this.helpKeyEscWindow);
    this.container.add(this.helpKeyEscText);
    this.container.add(this.helpKeyCancelGuideText);

    this.helpArrows.setAlpha(0);
    this.helpArrowsGuideText.setAlpha(0);
    this.helpKeyZWindow.setAlpha(0);
    this.helpKeyZText.setAlpha(0);
    this.helpKeyEnterWindow.setAlpha(0);
    this.helpKeyEnterText.setAlpha(0);
    this.helpKeySelectGuideText.setAlpha(0);
    this.helpKeyXWindow.setAlpha(0);
    this.helpKeyXText.setAlpha(0);
    this.helpKeyEscWindow.setAlpha(0);
    this.helpKeyEscText.setAlpha(0);
    this.helpKeyCancelGuideText.setAlpha(0);
  }

  showGroup1(duration: number = 1000): void {
    const elements = [this.helpArrows, this.helpArrowsGuideText];

    const tween = this.scene.tweens.add({
      targets: elements,
      alpha: 1,
      duration: duration,
      ease: EASE.LINEAR,
    });
    this.trackTween(tween);
  }

  showGroup2(duration: number = 1000): void {
    const elements = [this.helpKeyZWindow, this.helpKeyZText, this.helpKeyEnterWindow, this.helpKeyEnterText, this.helpKeySelectGuideText];

    const tween = this.scene.tweens.add({
      targets: elements,
      alpha: 1,
      duration: duration,
      ease: EASE.LINEAR,
    });
    this.trackTween(tween);
  }

  showGroup3(duration: number = 1000): void {
    const elements = [this.helpKeyXWindow, this.helpKeyXText, this.helpKeyEscWindow, this.helpKeyEscText, this.helpKeyCancelGuideText];

    const tween = this.scene.tweens.add({
      targets: elements,
      alpha: 1,
      duration: duration,
      ease: EASE.LINEAR,
    });
    this.trackTween(tween);
  }

  async hideAllGroups(duration: number = 1000): Promise<void> {
    const allElements = [
      this.helpArrows,
      this.helpArrowsGuideText,
      this.helpKeyZWindow,
      this.helpKeyZText,
      this.helpKeyEnterWindow,
      this.helpKeyEnterText,
      this.helpKeySelectGuideText,
      this.helpKeyXWindow,
      this.helpKeyXText,
      this.helpKeyEscWindow,
      this.helpKeyEscText,
      this.helpKeyCancelGuideText,
      this.overlayBg,
    ];

    return new Promise<void>((resolve) => {
      const tween = this.scene.tweens.add({
        targets: allElements,
        alpha: 0,
        duration: duration,
        ease: EASE.LINEAR,
        onComplete: () => {
          resolve();
        },
      });
      this.trackTween(tween);
    });
  }

  async showOverlayBg(duration: number = 200, targetAlpha: number = 0.7): Promise<void> {
    return new Promise<void>((resolve) => {
      const tween = this.scene.tweens.add({
        targets: this.overlayBg,
        alpha: targetAlpha,
        duration: duration,
        ease: EASE.LINEAR,
        onComplete: () => {
          resolve();
        },
      });
      this.trackTween(tween);
    });
  }
}
