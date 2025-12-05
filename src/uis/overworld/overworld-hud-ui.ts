import i18next from 'i18next';
import { PlayerGlobal } from '../../core/storage/player-storage';
import { DEPTH, EASE, EVENT, TEXTSTYLE, TEXTURE, TIME } from '../../enums';
import { InGameScene } from '../../scenes/ingame-scene';
import { getTextShadow, getTextStyle, runFadeEffect, setTextShadow, Ui } from '../ui';
import { MAX_PARTY_SLOT } from '../../constants';
import { PC } from '../../core/storage/pc-storage';
import { Event } from '../../core/manager/event-manager';
import { getCurrentTimeOfDay } from '../../utils/string-util';

export class OverworldHUDUi extends Ui {
  private tutorialContainer!: Phaser.GameObjects.Container;

  private overworldPokemonSlotUi: OverworldPokemonSlotUi;
  private overworldInfoUi: OverworldInfoUi;
  private overworldIconUi: OverworldIconUi;
  private overworldLocationUi: OverworldLocationUi;

  private tutorialBg!: Phaser.GameObjects.Image;
  private candyUpdatedCallback!: () => void;

  constructor(scene: InGameScene) {
    super(scene);

    this.overworldPokemonSlotUi = new OverworldPokemonSlotUi(scene);
    this.overworldInfoUi = new OverworldInfoUi(scene);
    this.overworldIconUi = new OverworldIconUi(scene);
    this.overworldLocationUi = new OverworldLocationUi(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.tutorialContainer = this.createContainer(width / 2, height / 2);
    this.tutorialBg = this.addBackground(TEXTURE.BG_BLACK).setOrigin(0.5, 0.5);
    this.tutorialBg.setAlpha(0.5);

    this.tutorialContainer.add(this.tutorialBg);

    this.overworldPokemonSlotUi.setup();
    this.overworldInfoUi.setup();
    this.overworldIconUi.setup();
    this.overworldLocationUi.setup();

    this.candyUpdatedCallback = () => {
      this.updateCandyUi();
    };
    Event.on(EVENT.CANDY_UPDATED, this.candyUpdatedCallback);

    this.tutorialContainer.setVisible(false);
    this.tutorialContainer.setDepth(DEPTH.MESSAGE - 1);
    this.tutorialContainer.setScrollFactor(0);
  }

  show(data?: any): void {
    this.overworldPokemonSlotUi.show();
    this.overworldInfoUi.show();
    this.overworldIconUi.show();
  }

  protected onClean(): void {
    Event.off(EVENT.CANDY_UPDATED, this.candyUpdatedCallback);
    this.overworldPokemonSlotUi.clean();
    this.overworldInfoUi.clean();
    this.overworldIconUi.clean();
    this.overworldLocationUi.clean();
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {
    this.updatePokemonSlotUi();
    this.updateLocationUi();
    this.updateCandyUi();
  }

  getOverworldInfoContainer() {
    return this.overworldInfoUi.getContainer();
  }

  getOverworldPokemonSlotContainer() {
    return this.overworldPokemonSlotUi.getContainer();
  }

  getOverworldIconContainer() {
    return this.overworldIconUi.getContainer();
  }

  getOverworldLocationContainer() {
    return this.overworldLocationUi.getContainer();
  }

  updatePokemonSlotUi() {
    this.overworldPokemonSlotUi.update();
  }

  updateLocationUi() {
    this.overworldInfoUi.updateLocation();
    this.overworldInfoUi.updatePosition();
  }

  updateCandyUi() {
    this.overworldInfoUi.updateMyCandy();
  }

  showArea(texture: TEXTURE | string, location: string) {
    this.overworldLocationUi.show({ texture, location });
  }

  updateIconTint(icon: TEXTURE, onoff: boolean) {
    this.overworldIconUi.updateToggle(icon, onoff);
  }

  showTutorialBg(onoff: boolean) {
    this.tutorialContainer.setVisible(onoff);
  }

  async showIconsForStarter(icon: TEXTURE) {
    await this.overworldIconUi.showIconsForStarter(icon);
  }

  private block() {
    this.overworldPokemonSlotUi.pause(true);
    this.overworldInfoUi.pause(true);
  }

  private unblock() {
    this.overworldPokemonSlotUi.pause(false);
    this.overworldInfoUi.pause(false);
  }

  updateTexts(): void {
    if (this.overworldLocationUi) {
      const location = this.overworldLocationUi.getCurrentLocation();
      if (location) {
        const texture = this.overworldLocationUi.getCurrentTexture();
        if (texture) {
          this.overworldLocationUi.show({ texture, location });
        }
      }
    }

    this.overworldInfoUi.updateLocation();
    this.overworldInfoUi.updateMyCandy();
  }
}

export class OverworldIconUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private icons: Phaser.GameObjects.Image[] = [];
  private iconTitles: Phaser.GameObjects.Text[] = [];
  private iconHelpWindows: Phaser.GameObjects.NineSlice[] = [];
  private iconHelpTexts: Phaser.GameObjects.Text[] = [];
  private iconToggle: boolean[] = [];
  private iconBaseY: number[] = [];
  private iconHelpWindowBaseY: number[] = [];
  private iconHelpTextBaseY: number[] = [];
  private starterIconTweens: Map<TEXTURE, Phaser.Tweens.Tween[]> = new Map();
  private starterHelpWindowTweens: Map<TEXTURE, Phaser.Tweens.Tween[]> = new Map();
  private starterHelpTextTweens: Map<TEXTURE, Phaser.Tweens.Tween[]> = new Map();

  private readonly contents: string[] = [TEXTURE.ICON_REG, TEXTURE.ICON_RUNNING, TEXTURE.ICON_MENU];
  private readonly guides: string[] = [TEXTURE.BLANK, TEXTURE.BLANK, TEXTURE.BLANK];
  private readonly guideTexts: string[] = [i18next.t('menu:guide_reg'), i18next.t('menu:guide_runningshoes'), i18next.t('menu:guide_menu')];
  private readonly helpTexts: string[] = ['A', 'R', 'S'];

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    const slotSize = 50;
    const slotSpacing = 10;

    const helpWindowSize = 25;
    const helpWindowScale = 1;

    this.container = this.createTrackedContainer(width / 2 + 480, height / 2 + 330);

    this.contents.forEach((key, index) => {
      const xPosition = index * (slotSize + slotSpacing);
      const yPosition = 0;

      const icon = this.addImage(key, xPosition, yPosition).setScale(2);
      const iconHelpWindow = this.addWindow(TEXTURE.WINDOW_HELP, xPosition - 20, yPosition - 25, helpWindowSize / helpWindowScale, helpWindowSize / helpWindowScale, 16, 16, 16, 16).setScale(
        helpWindowScale,
      );
      const iconHelpText = this.addText(xPosition - 20, yPosition - 25, this.helpTexts[index], TEXTSTYLE.MESSAGE_BLACK).setScale(0.2);
      const guideText = this.addImage(this.guides[index], xPosition, yPosition - 20);
      const guideTitle = this.addText(xPosition, yPosition - 55, this.guideTexts[index], TEXTSTYLE.INPUT_GUIDE_WHITE).setScale(0.5);

      icon.setVisible(true);
      icon.setInteractive();
      guideTitle.setVisible(false);

      this.icons.push(icon);
      this.iconHelpWindows.push(iconHelpWindow);
      this.iconHelpTexts.push(iconHelpText);
      this.iconTitles.push(guideTitle);
      this.iconToggle.push(false);
      this.iconBaseY.push(icon.y);
      this.iconHelpWindowBaseY.push(iconHelpWindow.y);
      this.iconHelpTextBaseY.push(iconHelpText.y);

      this.container.add(icon);
      this.container.add(iconHelpWindow);
      this.container.add(iconHelpText);
      this.container.add(guideText);
      this.container.add(guideTitle);
    });

    for (let i = 0; i < this.icons.length; i++) {
      this.icons[i].setScrollFactor(0);
      this.icons[i].setTint(0x7f7f7f);

      this.icons[i].on('pointerover', () => {
        this.iconTitles[i].setVisible(true);
      });

      this.icons[i].on('pointerout', () => {
        this.iconTitles[i].setVisible(false);
      });
    }

    PlayerGlobal.appearMenuFlag = true;
    PlayerGlobal.appearItemSlotFlag = true;
    PlayerGlobal.appearRunningShoesFlag = true;

    if (PlayerGlobal.getData()?.isStarter0) {
      this.icons[0].setVisible(false);
      this.icons[1].setVisible(false);
      this.icons[2].setVisible(false);

      this.iconHelpWindows[0].setVisible(false);
      this.iconHelpWindows[1].setVisible(false);
      this.iconHelpWindows[2].setVisible(false);

      this.iconHelpTexts[0].setVisible(false);
      this.iconHelpTexts[1].setVisible(false);
      this.iconHelpTexts[2].setVisible(false);

      PlayerGlobal.appearMenuFlag = false;
      PlayerGlobal.appearItemSlotFlag = false;
      PlayerGlobal.appearRunningShoesFlag = false;
    }

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.pause(false);
  }

  protected onClean(): void {
    this.container.setVisible(false);
    this.pause(true);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}

  updateToggle(icon: TEXTURE, onoff: boolean) {
    switch (icon) {
      case TEXTURE.ICON_RUNNING:
        this.icons[1].setTint(onoff ? 0xffffff : 0x7f7f7f);
        break;
      case TEXTURE.ICON_MENU:
        this.icons[2].setTint(onoff ? 0xffffff : 0x7f7f7f);
        break;
      case TEXTURE.ICON_REG:
        this.icons[0].setTint(onoff ? 0xffffff : 0x7f7f7f);
        break;
    }
  }

  async showIconsForStarter(icon: TEXTURE): Promise<void> {
    const targetIndex = this.contents.indexOf(icon);
    const targetIcon = targetIndex > -1 ? this.icons[targetIndex] : null;
    const targetHelpWindow = targetIndex > -1 ? this.iconHelpWindows[targetIndex] : null;
    const targetHelpText = targetIndex > -1 ? this.iconHelpTexts[targetIndex] : null;

    if (!targetIcon || !targetHelpWindow || !targetHelpText) return;

    const initialY = this.iconBaseY[targetIndex] ?? targetIcon.y;
    const initialHelpWindowY = this.iconHelpWindowBaseY[targetIndex] ?? targetHelpWindow.y;
    const initialHelpTextY = this.iconHelpTextBaseY[targetIndex] ?? targetHelpText.y;
    const bounceHeight = 10;

    this.container.setVisible(true);
    targetIcon.setVisible(true);
    targetIcon.setTint(0xffffff);
    targetIcon.setAlpha(1);
    targetIcon.setY(initialY);

    targetHelpWindow.setVisible(true);
    targetHelpWindow.setAlpha(1);
    targetHelpWindow.setY(initialHelpWindowY);

    targetHelpText.setVisible(true);
    targetHelpText.setAlpha(1);
    targetHelpText.setY(initialHelpTextY);

    const existingIconTweens = this.starterIconTweens.get(icon);
    if (existingIconTweens) {
      existingIconTweens.forEach((tween) => tween.stop());
      this.starterIconTweens.delete(icon);
    }

    const existingHelpWindowTweens = this.starterHelpWindowTweens.get(icon);
    if (existingHelpWindowTweens) {
      existingHelpWindowTweens.forEach((tween) => tween.stop());
      this.starterHelpWindowTweens.delete(icon);
    }

    const existingHelpTextTweens = this.starterHelpTextTweens.get(icon);
    if (existingHelpTextTweens) {
      existingHelpTextTweens.forEach((tween) => tween.stop());
      this.starterHelpTextTweens.delete(icon);
    }

    await new Promise<void>((resolve) => {
      let settled = false;
      let completed = 0;
      const totalTweens = 4;

      const finish = () => {
        if (settled) return;
        completed += 1;
        if (completed < totalTweens) {
          return;
        }

        settled = true;
        targetIcon.setCrop();
        targetIcon.setY(initialY);
        targetHelpWindow.setY(initialHelpWindowY);
        targetHelpText.setY(initialHelpTextY);

        this.starterIconTweens.delete(icon);
        this.starterHelpWindowTweens.delete(icon);
        this.starterHelpTextTweens.delete(icon);

        this.icons[0].setTint(0x7f7f7f);
        this.icons[1].setTint(0x7f7f7f);
        this.icons[2].setTint(0x7f7f7f);

        resolve();
      };

      const iconCropState = { height: 0 };
      targetIcon.setCrop(0, targetIcon.height, targetIcon.width, 0);

      const iconBounceTween = this.scene.tweens.add({
        targets: targetIcon,
        y: initialY - bounceHeight,
        duration: 220,
        ease: EASE.SINE_EASEIN,
        yoyo: true,
        hold: 60,
        onComplete: finish,
        onStop: finish,
      });

      const iconRevealTween = this.scene.tweens.add({
        targets: iconCropState,
        height: targetIcon.height,
        duration: 260,
        ease: EASE.SINE_EASEOUT,
        onUpdate: () => {
          const yOffset = Math.max(targetIcon.height - iconCropState.height, 0);
          targetIcon.setCrop(0, yOffset, targetIcon.width, Math.max(iconCropState.height, 0.0001));
        },
        onComplete: finish,
        onStop: finish,
      });

      const helpWindowBounceTween = this.scene.tweens.add({
        targets: targetHelpWindow,
        y: initialHelpWindowY - bounceHeight,
        duration: 220,
        ease: EASE.SINE_EASEIN,
        yoyo: true,
        hold: 60,
        onComplete: finish,
        onStop: finish,
      });

      const helpTextBounceTween = this.scene.tweens.add({
        targets: targetHelpText,
        y: initialHelpTextY - bounceHeight,
        duration: 220,
        ease: EASE.SINE_EASEIN,
        yoyo: true,
        hold: 60,
        onComplete: finish,
        onStop: finish,
      });

      this.starterIconTweens.set(icon, [iconBounceTween, iconRevealTween]);
      this.starterHelpWindowTweens.set(icon, [helpWindowBounceTween]);
      this.starterHelpTextTweens.set(icon, [helpTextBounceTween]);
    });
  }

  getContainer() {
    return this.container;
  }
}

export class OverworldInfoUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private titles: Phaser.GameObjects.Text[] = [];
  private textMyCandy!: Phaser.GameObjects.Text;
  private textLocation!: Phaser.GameObjects.Text;
  private textPosition!: Phaser.GameObjects.Text;
  private icons: TEXTURE[] = [TEXTURE.ICON_LOCATION, TEXTURE.ICON_XY, TEXTURE.ICON_CANDY];
  private texts: Phaser.GameObjects.Text[] = [];

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createTrackedContainer(width / 2 - 440, height / 2 - 320);

    this.createWindow();

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.pause(false);
  }

  protected onClean(): void {
    this.container.setVisible(false);
    this.pause(true);
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  handleKeyInput(data?: any): void {}

  update(): void {}

  private block() {}

  private unblock() {}

  updateLocation() {
    let timeText = i18next.t('menu:time_day');

    const timeOfDay = getCurrentTimeOfDay();
    if (timeOfDay === TIME.NIGHT || timeOfDay === TIME.DAWN) {
      timeText = i18next.t('menu:time_night');
    } else if (timeOfDay === TIME.DUSK) {
      timeText = i18next.t('menu:time_dusk');
    }

    this.texts[0].setText(i18next.t(`menu:${PlayerGlobal.getData()?.location}`) + ' (' + timeText + ')');
  }

  updatePosition() {
    this.texts[1].setText(`${PlayerGlobal.getData()?.x},${PlayerGlobal.getData()?.y}`);
  }

  updateMyCandy() {
    this.texts[2].setText(`${PlayerGlobal.getData()?.candy} ${i18next.t('menu:candy')}`);
  }

  private createWindow() {
    const contentWidth = 380;
    const contentHeight = 35;
    const spacing = 10;

    let currentY = 0;
    let i = 0;
    for (const key of this.icons) {
      const icon = this.addImage(key, -160, currentY).setScale(1.6);
      const text = this.addText(-130, currentY, '10,20', TEXTSTYLE.ONLY_WHITE).setOrigin(0, 0.5);
      text.setScale(0.4);
      text.setStroke('#5e5e5e', 12);

      this.container.add(icon);
      this.container.add(text);

      this.texts.push(text);

      currentY += contentHeight + spacing;
    }
  }

  getContainer() {
    return this.container;
  }
}

export class OverworldLocationUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private window!: Phaser.GameObjects.Image;
  private location!: Phaser.GameObjects.Text;
  private restorePosY!: number;
  private currentLocation: string | undefined;
  private isAnimating: boolean = false;
  private activeTweens: Phaser.Tweens.Tween[] = [];

  private readonly posX: number = 35;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2 - 630, height / 2 - 400);
    this.restorePosY = this.container.y;

    this.window = this.addImage(TEXTURE.WINDOW_0, 0, 0).setOrigin(0, 0.5).setScale(3.8);
    this.location = this.addText(0, 0, '', TEXTSTYLE.OVERWORLD_AREA_B).setOrigin(0, 0.5);
    this.location.setScale(0.4);

    this.container.add(this.window);
    this.container.add(this.location);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_MENU);
    this.container.setScrollFactor(0);
  }

  show(data?: { texture: TEXTURE | string; location: string }): void {
    this.stopAllTweens();

    if (data?.location) {
      this.currentLocation = data.location;
    }

    if (data?.texture === TEXTURE.AREA_4 || data?.texture === TEXTURE.AREA_7) {
      this.location.setStyle(getTextStyle(TEXTSTYLE.OVERWORLD_AREA_W));
      setTextShadow(this.location, getTextShadow(TEXTSTYLE.OVERWORLD_AREA_W));
    } else {
      this.location.setStyle(getTextStyle(TEXTSTYLE.OVERWORLD_AREA_B));
      setTextShadow(this.location, getTextShadow(TEXTSTYLE.OVERWORLD_AREA_B));
    }

    if (data?.texture) {
      this.window.setTexture(data.texture as string);
    }
    if (data?.location) {
      this.location.setText(i18next.t(`menu:${data.location}`));
    }
    this.location.setPosition(this.posX, 0);

    const startY = 100;
    const endY = 240;
    this.isAnimating = true;

    this.container.setVisible(true);
    this.container.y = startY;

    const slideDownTween = this.scene.tweens.add({
      targets: this.container,
      y: endY,
      ease: EASE.LINEAR,
      duration: 500,
      onComplete: () => {
        const slideUpTween = this.scene.tweens.add({
          targets: this.container,
          y: startY,
          ease: EASE.LINEAR,
          duration: 500,
          delay: 2000,
          onComplete: () => {
            this.isAnimating = false;

            this.activeTweens = this.activeTweens.filter((t) => t !== slideUpTween);
          },
        });
        this.activeTweens.push(slideUpTween);
        this.activeTweens = this.activeTweens.filter((t) => t !== slideDownTween);
      },
    });
    this.activeTweens.push(slideDownTween);
  }

  private stopAllTweens(): void {
    this.activeTweens.forEach((tween) => {
      if (tween && !tween.isDestroyed()) {
        tween.stop();
        tween.remove();
      }
    });
    this.activeTweens = [];

    this.scene.tweens.killTweensOf(this.container);

    this.isAnimating = false;
  }

  getCurrentLocation(): string | undefined {
    return this.currentLocation;
  }

  getCurrentTexture(): TEXTURE | string | undefined {
    return this.window.texture?.key as TEXTURE | string | undefined;
  }

  protected onClean(): void {
    this.stopAllTweens();

    this.container.setVisible(false);
    this.currentLocation = undefined;
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}

  getContainer() {
    return this.container;
  }
}

export class OverworldPokemonSlotUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  protected windows: Phaser.GameObjects.NineSlice[] = [];
  protected icons: Phaser.GameObjects.Image[] = [];
  protected shinyIcons: Phaser.GameObjects.Image[] = [];

  private readonly MaxSlot: number = 6;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    const contentHeight = 55;
    const spacing = 5;
    let currentY = 0;

    this.container = this.createTrackedContainer(width / 2 + 600, height / 3 + 50);

    for (let i = 0; i < this.MaxSlot; i++) {
      const window = this.addWindow(TEXTURE.WINDOW_OPACITY, 0, currentY, contentHeight, contentHeight, 8, 8, 8, 8);
      const icon = this.addImage('pokemon_icon000', 0, currentY);
      const shiny = this.addImage(TEXTURE.BLANK, -25, currentY - 15).setScale(1.4);

      this.container.add(window);
      this.container.add(icon);
      this.container.add(shiny);

      this.windows.push(window);
      this.icons.push(icon);
      this.shinyIcons.push(shiny);

      currentY += contentHeight + spacing;
    }
    this.container.setScale(0.8);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.update();
  }

  protected onClean(): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(): void {
    if (this.getIsDestroyed()) return;
    if (!this.scene || !this.scene.sys) return;

    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      const party = PC.getParty()[i];

      if (party) {
        this.icons[i]?.setTexture(`pokemon_icon${party.getPokedex()}${party.getShiny() ? 's' : ''}`);
        this.shinyIcons[i]?.setTexture(party.getShiny() ? TEXTURE.ICON_SHINY : TEXTURE.BLANK);
      } else {
        this.icons[i]?.setTexture(TEXTURE.BLANK);
        this.shinyIcons[i]?.setTexture(TEXTURE.BLANK);
      }
    }
  }

  getContainer() {
    return this.container;
  }
}

export class OverworldOverlayUi extends Ui {
  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {}

  show(data?: any): void {
    runFadeEffect(this.scene, 1000, 'in');
  }

  protected onClean(): void {}

  pause(data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}
}
