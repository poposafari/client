import { InGameScene } from '../../scenes/ingame-scene';
import { addImage, addText, addWindow, runFadeEffect, Ui } from '../ui';
import { PlayerInfo } from '../../storage/player-info';
import { DEPTH } from '../../enums/depth';
import { TEXTURE } from '../../enums/texture';
import i18next from 'i18next';
import { TEXTSTYLE } from '../../enums/textstyle';
import { MaxItemSlot, MaxPartySlot } from '../../types';
import { isPokedexShiny } from '../../utils/string-util';
import { EASE } from '../../enums/ease';
import { eventBus } from '../../core/event-bus';
import { EVENT } from '../../enums/event';

export class OverworldHUDUi extends Ui {
  private overworldItemSlotUi: OverworldItemSlotUi;
  private overworldPokemonSlotUi: OverworldPokemonSlotUi;
  private overworldInfoUi: OverworldInfoUi;
  private overworldIconUi: OverworldIconUi;
  private overworldLocationUi: OverworldLocationUi;

  constructor(scene: InGameScene) {
    super(scene);

    this.overworldItemSlotUi = new OverworldItemSlotUi(scene);
    this.overworldPokemonSlotUi = new OverworldPokemonSlotUi(scene);
    this.overworldInfoUi = new OverworldInfoUi(scene);
    this.overworldIconUi = new OverworldIconUi(scene);
    this.overworldLocationUi = new OverworldLocationUi(scene);

    eventBus.on(EVENT.HUD_LOCATION_UPDATE, () => this.updateLocationUi());
    eventBus.on(EVENT.HUD_ITEMSLOT_UPDATE, () => this.updateItemSlotUi());
    eventBus.on(EVENT.HUD_CANDY_UPDATE, () => this.updateCandyUi());
    eventBus.on(EVENT.HUD_SHOW_OVERWORLD, () => this.showLocationUi());
    eventBus.on(EVENT.HUD_PARTY_UPDATE, () => this.updatePokemonSlotUi());
  }

  setup(): void {
    this.overworldItemSlotUi.setup();
    this.overworldPokemonSlotUi.setup();
    this.overworldInfoUi.setup();
    this.overworldIconUi.setup();
    this.overworldLocationUi.setup();
  }

  show(data?: any): void {
    this.overworldItemSlotUi.show();
    this.overworldPokemonSlotUi.show();
    this.overworldInfoUi.show();
    this.overworldIconUi.show();
  }

  clean(data?: any): void {
    this.overworldItemSlotUi.clean();
    this.overworldPokemonSlotUi.clean();
    this.overworldInfoUi.clean();
    this.overworldIconUi.clean();
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}

  updateItemSlotUi() {
    this.overworldItemSlotUi.update();
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

  showLocationUi() {
    this.overworldLocationUi.show(PlayerInfo.getInstance().getLocation());
  }

  private block() {
    this.overworldItemSlotUi.pause(true);
    this.overworldPokemonSlotUi.pause(true);
    this.overworldInfoUi.pause(true);
  }

  private unblock() {
    this.overworldItemSlotUi.pause(false);
    this.overworldPokemonSlotUi.pause(false);
    this.overworldInfoUi.pause(false);
  }
}

export class OverworldIconUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private icons: Phaser.GameObjects.Image[] = [];
  private iconTitles: Phaser.GameObjects.Text[] = [];
  private readonly contents: string[] = [TEXTURE.MENU_SHOES, TEXTURE.MENU_ICON];
  private readonly guides: string[] = [TEXTURE.KEY_R, TEXTURE.KEY_S];
  private readonly guideTexts: string[] = [i18next.t('menu:guide_runningshoes'), i18next.t('menu:guide_menu')];

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    const slotSize = 55;
    const slotSpacing = 5;

    this.container = this.scene.add.container(width / 2, height / 2 + 507);

    this.contents.forEach((key, index) => {
      const xPosition = index * (slotSize + slotSpacing);
      const yPosition = 0;

      const icon = addImage(this.scene, key, xPosition + 860, yPosition).setScale(2);
      const guideText = addImage(this.scene, this.guides[index], xPosition + 840, yPosition - 20);
      const guideTitle = addText(this.scene, xPosition + 860, yPosition - 45, this.guideTexts[index], TEXTSTYLE.INPUT_GUIDE_WHITE).setScale(0.7);

      icon.setInteractive();
      guideTitle.setVisible(false);

      this.icons.push(icon);
      this.iconTitles.push(guideTitle);

      this.container.add(icon);
      this.container.add(guideText);
      this.container.add(guideTitle);
    });

    for (let i = 0; i < this.icons.length; i++) {
      this.icons[i].setScrollFactor(0);

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
}

export class OverworldInfoUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private titles: Phaser.GameObjects.Text[] = [];
  private textMyCandy!: Phaser.GameObjects.Text;
  private textLocation!: Phaser.GameObjects.Text;
  private textPosition!: Phaser.GameObjects.Text;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.scene.add.container(width / 2 - 920, height / 2 - 500);

    const iconLocation = addImage(this.scene, TEXTURE.MENU_LOCATION, 0, 0).setScale(2);
    const iconCandy = addImage(this.scene, TEXTURE.MENU_CANDY, 0, +50).setScale(2);

    this.textLocation = addText(this.scene, +30, 0, '', TEXTSTYLE.MESSAGE_WHITE).setOrigin(0, 0.5);
    this.textMyCandy = addText(this.scene, +30, +50, '', TEXTSTYLE.MESSAGE_WHITE).setOrigin(0, 0.5);
    this.textPosition = addText(this.scene, this.textMyCandy.displayWidth, +50, '', TEXTSTYLE.MESSAGE_WHITE).setOrigin(0, 0.5);

    this.container.add(iconLocation);
    this.container.add(this.textLocation);
    this.container.add(this.textPosition);
    this.container.add(iconCandy);
    this.container.add(this.textMyCandy);

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

  updateMyCandy() {
    const playerInfo = PlayerInfo.getInstance();

    if (!playerInfo) {
      throw Error('Player Info does not exist.');
    }

    const playerCandy = playerInfo.getCandy();
    this.textMyCandy.setText(`${playerCandy.toString()}${i18next.t('menu:candy')}`);
  }

  updateLocation() {
    const playerInfo = PlayerInfo.getInstance();

    if (!playerInfo) {
      throw Error('Player Info does not exist.');
    }

    this.textLocation.setText(i18next.t(`menu:overworld_${playerInfo.getLocation()}`));
    this.textPosition.setPosition(this.textLocation.displayWidth + 35, this.textLocation.y);
  }

  updatePosition() {
    const playerInfo = PlayerInfo.getInstance();
    this.textPosition.setText(`(X:${playerInfo.getPosX()}/Y:${playerInfo.getPosY()})`);
  }
}

export class OverworldItemSlotUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  protected slotWindows: Phaser.GameObjects.NineSlice[] = [];
  protected slotIcons: Phaser.GameObjects.Image[] = [];
  protected slotNumbers: Phaser.GameObjects.Text[] = [];

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();
    const contentHeight = 55;
    const spacing = 10;

    let currentX = 0;

    this.container = this.scene.add.container(width / 2 - 200, height / 2 + 500);

    for (let i = 0; i < MaxItemSlot; i++) {
      const window = addWindow(this.scene, TEXTURE.WINDOW_0, currentX, 0, 60, 60, 8, 8, 8, 8);
      const icon = addImage(this.scene, '', currentX, 0);
      const num = addText(this.scene, currentX - 20, 0 - 12, (i + 1).toString(), TEXTSTYLE.CHOICE_DEFAULT);
      const stock = addText(this.scene, currentX + 10, +15, '', TEXTSTYLE.CHOICE_DEFAULT);

      this.container.add(window);
      this.container.add(icon);
      this.container.add(num);
      this.container.add(stock);

      this.slotWindows.push(window);
      this.slotIcons.push(icon);
      this.slotNumbers.push(num);
      // this.slotStock.push(stock);

      currentX += contentHeight + spacing;
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

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  handleKeyInput(data?: any): void {}

  private block() {}

  private unblock() {
    this.update();
  }

  update(): void {
    const playerInfo = PlayerInfo.getInstance();
    const itemSlots = playerInfo.getItemSlot();

    for (let i = 0; i < MaxItemSlot; i++) {
      const item = itemSlots[i];
      if (item) {
        this.slotIcons[i].setTexture(`item${item}`);
      } else {
        this.slotIcons[i].setTexture(TEXTURE.BLANK);
      }
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

    this.window = addWindow(this.scene, TEXTURE.WINDOW_5, 0, 0, 150, 30, 16, 16, 16, 16).setOrigin(0, 0.5).setScale(3);
    this.location = addText(this.scene, 25, 0, '', TEXTSTYLE.DEFAULT_BLACK).setOrigin(0, 0.5);

    this.container.add(this.window);
    this.container.add(this.location);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_MENU);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    if (typeof data === 'string') {
      this.location.setText(i18next.t(`menu:overworld_${data}`));
    }

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

    const contentHeight = 60;
    const spacing = 5;
    let currentY = 0;

    this.container = this.scene.add.container(width - 40, height / 3 + 50);

    for (let i = 0; i < this.MaxSlot; i++) {
      const window = addWindow(this.scene, TEXTURE.WINDOW_0, 0, currentY, contentHeight, contentHeight, 8, 8, 8, 8);
      const icon = addImage(this.scene, 'pokemon_icon000', 0, currentY);
      const shiny = addImage(this.scene, TEXTURE.BLANK, -25, currentY - 15).setScale(1);

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
    const party = PlayerInfo.getInstance().getPartySlot();

    for (let i = 0; i < MaxPartySlot; i++) {
      this.shinyIcons[i].setTexture(TEXTURE.BLANK);
      if (party[i]) {
        const key = party[i]?.split('_')[0];
        this.icons[i].setTexture(`pokemon_icon${key}`);
        if (isPokedexShiny(key!)) this.shinyIcons[i].setTexture(TEXTURE.SHINY);
      } else {
        this.icons[i].setTexture(`pokemon_icon000`);
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
