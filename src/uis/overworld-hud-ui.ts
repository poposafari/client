import { MAX_PARTY_SLOT } from '../constants';
import { eventBus } from '../core/event-bus';
import { GM } from '../core/game-manager';
import { DEPTH, EASE, EVENT, TEXTSTYLE, TEXTURE } from '../enums';
import i18next from '../i18n';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, runFadeEffect, Ui } from './ui';

export class OverworldHUDUi extends Ui {
  private overworldPokemonSlotUi: OverworldPokemonSlotUi;
  private overworldInfoUi: OverworldInfoUi;
  private overworldIconUi: OverworldIconUi;
  private overworldLocationUi: OverworldLocationUi;

  constructor(scene: InGameScene) {
    super(scene);

    this.overworldPokemonSlotUi = new OverworldPokemonSlotUi(scene);
    this.overworldInfoUi = new OverworldInfoUi(scene);
    this.overworldIconUi = new OverworldIconUi(scene);
    this.overworldLocationUi = new OverworldLocationUi(scene);

    eventBus.on(EVENT.HUD_LOCATION_UPDATE, () => this.updateLocationUi());
    eventBus.on(EVENT.HUD_CANDY_UPDATE, () => this.updateCandyUi());
    eventBus.on(EVENT.HUD_SHOW_OVERWORLD, () => this.showLocationUi());
    eventBus.on(EVENT.HUD_PARTY_UPDATE, () => this.updatePokemonSlotUi());
  }

  setup(): void {
    this.overworldPokemonSlotUi.setup();
    this.overworldInfoUi.setup();
    this.overworldIconUi.setup();
    this.overworldLocationUi.setup();
  }

  show(data?: any): void {
    this.overworldPokemonSlotUi.show();
    this.overworldInfoUi.show();
    this.overworldIconUi.show();
  }

  clean(data?: any): void {
    this.overworldPokemonSlotUi.clean();
    this.overworldInfoUi.clean();
    this.overworldIconUi.clean();
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}

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

  showLocationUi() {
    this.overworldLocationUi.show(GM.getUserData()?.location);
  }

  private block() {
    this.overworldPokemonSlotUi.pause(true);
    this.overworldInfoUi.pause(true);
  }

  private unblock() {
    this.overworldPokemonSlotUi.pause(false);
    this.overworldInfoUi.pause(false);
  }
}

export class OverworldIconUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private icons: Phaser.GameObjects.Image[] = [];
  private iconTitles: Phaser.GameObjects.Text[] = [];
  private iconToggle: boolean[] = [];

  private readonly contents: string[] = [TEXTURE.ICON_TALK, TEXTURE.ICON_REG, TEXTURE.ICON_RUNNING, TEXTURE.ICON_MENU];
  private readonly guides: string[] = [TEXTURE.BLANK, TEXTURE.BLANK, TEXTURE.BLANK, TEXTURE.BLANK];
  private readonly guideTexts: string[] = [i18next.t('menu:guide_talk'), i18next.t('menu:guide_reg'), i18next.t('menu:guide_runningshoes'), i18next.t('menu:guide_menu')];

  constructor(scene: InGameScene) {
    super(scene);

    eventBus.on(EVENT.UPDATE_OVERWORLD_ICON_TINT, (icon: TEXTURE, onoff: boolean) => {
      this.updateToggle(icon, onoff);
    });
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    const slotSize = 55;
    const slotSpacing = 5;

    this.container = this.scene.add.container(width / 2 + 750, height / 2 + 507);

    this.contents.forEach((key, index) => {
      const xPosition = index * (slotSize + slotSpacing);
      const yPosition = 0;

      const icon = addImage(this.scene, key, xPosition, yPosition).setScale(2);
      const guideText = addImage(this.scene, this.guides[index], xPosition, yPosition - 20);
      const guideTitle = addText(this.scene, xPosition, yPosition - 45, this.guideTexts[index], TEXTSTYLE.INPUT_GUIDE_WHITE).setScale(0.5);

      icon.setInteractive();
      guideTitle.setVisible(false);

      this.icons.push(icon);
      this.iconTitles.push(guideTitle);
      this.iconToggle.push(false);

      this.container.add(icon);
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

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.pause(false);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.pause(true);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}

  updateToggle(icon: TEXTURE, onoff: boolean) {
    if (icon === TEXTURE.ICON_RUNNING) {
      if (GM.getRunningToggle()) {
        onoff = true;
      } else {
        onoff = false;
      }
    }

    for (let i = 0; i < this.icons.length; i++) {
      if (this.icons[i].texture.key === icon) {
        this.iconToggle[i] = onoff;
        if (onoff) {
          this.icons[i].setTint(0xffffff);
        } else {
          this.icons[i].setTint(0x7f7f7f);
        }
      }
    }
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

    this.container = this.scene.add.container(width / 2 - 750, height / 2 - 500);

    this.createWindow();

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.pause(false);
  }

  clean(data?: any): void {
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
    this.texts[0].setText(i18next.t(`menu:${GM.getUserData()?.location}`));
  }

  updatePosition() {
    this.texts[1].setText(`${GM.getUserData()?.x},${GM.getUserData()?.y}`);
  }

  updateMyCandy() {
    this.texts[2].setText(`${GM.getUserData()?.candy}${i18next.t('menu:candy')}`);
  }

  private createWindow() {
    const contentWidth = 380;
    const contentHeight = 50;
    const spacing = 5;

    let currentY = 0;
    let i = 0;
    for (const key of this.icons) {
      const window = addWindow(this.scene, TEXTURE.WINDOW_OPACITY, 0, currentY, contentWidth, contentHeight, 8, 8, 8, 8);
      const icon = addImage(this.scene, key, -160, currentY).setScale(2);
      const text = addText(this.scene, -120, currentY, '10,20', TEXTSTYLE.MESSAGE_WHITE).setOrigin(0, 0.5);

      this.container.add(window);
      this.container.add(icon);
      this.container.add(text);

      this.texts.push(text);

      currentY += contentHeight + spacing;
    }
  }
}

export class OverworldLocationUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private window!: Phaser.GameObjects.NineSlice;
  private location!: Phaser.GameObjects.Text;
  private restorePosY!: number;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2 - 940, height / 2 - 475);
    this.restorePosY = this.container.y;

    this.window = addWindow(this.scene, TEXTURE.WINDOW_0, 0, 0, 150, 30, 16, 16, 16, 16).setOrigin(0, 0.5).setScale(3);
    this.location = addText(this.scene, 25, 0, '', TEXTSTYLE.DEFAULT_BLACK).setOrigin(0, 0.5);

    this.container.add(this.window);
    this.container.add(this.location);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_MENU);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.location.setText(i18next.t(`menu:${data}`));

    this.container.y = this.restorePosY;

    const startY = -this.window.height - 15;
    const endY = this.container.y;

    this.container.setVisible(true);
    this.container.y = startY;

    this.scene.tweens.add({
      targets: this.container,
      y: endY,
      ease: EASE.LINEAR,
      duration: 500,
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.container,
          y: startY,
          ease: EASE.LINEAR,
          duration: 500,
          delay: 2000,
        });
      },
    });
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}
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

    this.container = this.scene.add.container(width - 40, height / 3 + 50);

    for (let i = 0; i < this.MaxSlot; i++) {
      const window = addWindow(this.scene, TEXTURE.WINDOW_OPACITY, 0, currentY, contentHeight, contentHeight, 8, 8, 8, 8);
      const icon = addImage(this.scene, 'pokemon_icon000', 0, currentY);
      const shiny = addImage(this.scene, TEXTURE.BLANK, -25, currentY - 15).setScale(1.4);

      this.container.add(window);
      this.container.add(icon);
      this.container.add(shiny);

      this.windows.push(window);
      this.icons.push(icon);
      this.shinyIcons.push(shiny);

      currentY += contentHeight + spacing;
    }
    this.container.setScale(1);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.update();
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(): void {
    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      const party = GM.getUserData()?.party[i];

      if (party) {
        this.icons[i].setTexture(`pokemon_icon${party.getPokedex()}${party.getShiny() ? 's' : ''}`);
        this.shinyIcons[i].setTexture(party.getShiny() ? TEXTURE.ICON_SHINY : TEXTURE.BLANK);
      } else {
        this.icons[i].setTexture(TEXTURE.BLANK);
        this.shinyIcons[i].setTexture(TEXTURE.BLANK);
      }
    }
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

  clean(data?: any): void {}

  pause(data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}
}
