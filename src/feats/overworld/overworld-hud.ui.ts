import { ImageTextListContainer } from '@poposafari/containers/image-text-list.container';
import { PartyListContainer } from '@poposafari/containers/party-list.container';
import { WindowStripContainer } from '@poposafari/containers/window-strip.container';
import { GameEvent, GameScene } from '@poposafari/scenes';
import { DEPTH, MONEY_SYMBOL, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addContainer, addImage, addText } from '@poposafari/utils';
import DayNightFilter from '@poposafari/utils/day-night-filter';
import i18next from 'i18next';

const MAX_QUICK_SLOT_SIZE = 6;

const TIME_ICON_MAP: Record<string, TEXTURE> = {
  dawn: TEXTURE.ICON_DAWN,
  day: TEXTURE.ICON_DAY,
  dusk: TEXTURE.ICON_DUSK,
  night: TEXTURE.ICON_NIGHT,
};

type ToggleIconConfig = { texture: TEXTURE; guide: string };

const TOGGLE_ICONS: ReadonlyArray<ToggleIconConfig> = [
  { texture: TEXTURE.ICON_REGISTER, guide: 'A' },
  { texture: TEXTURE.ICON_RUNNING, guide: 'R' },
  { texture: TEXTURE.ICON_MENU, guide: 'S' },
];

const TOGGLE_ICON_LAYOUT = {
  iconWidth: 70,
  spacing: 40,
  iconScale: 3.2,
  iconY: -12,
  guideOffsetX: 30,
  guideKeycapY: -56,
  guideTextY: -70,
  guideScale: 2.2,
  guideFontSize: 35,
  rightPadding: 60,
  y: +495,
};

export class OverworldHudUI extends Phaser.GameObjects.Container {
  scene: GameScene;
  private toggleIconContainer!: GContainer;
  private toggleIcons: GImage[] = [];
  private toggleIconTexts: GText[] = [];

  private partyList!: PartyListContainer;

  private infoList!: ImageTextListContainer;

  constructor(scene: GameScene) {
    const { width, height } = scene.cameras.main;
    super(scene, width / 2, height / 2);

    this.scene = scene;

    this.setScrollFactor(0);
    this.setDepth(DEPTH.HUD);

    this.setVisible(false);
    scene.add.existing(this);
  }

  create() {
    this.createToggleIcon();
    this.createParty();
    this.createQuickSlot();
    this.createInfo();

    this.add([this.toggleIconContainer, this.partyList, this.infoList]);

    this.scene.events.on(GameEvent.GAME_TIME_CHANGED, this.onGameTimeChanged, this);
    this.scene.events.on(GameEvent.PARTY_CHANGED, this.onPartyChanged, this);
    this.once('destroy', () => {
      this.scene.events.off(GameEvent.GAME_TIME_CHANGED, this.onGameTimeChanged, this);
      this.scene.events.off(GameEvent.PARTY_CHANGED, this.onPartyChanged, this);
    });

    this.updateTime(DayNightFilter.getCurrentTimeLabel());
  }

  private onGameTimeChanged = (timeOfDay: string): void => {
    this.updateTime(timeOfDay);
  };

  private onPartyChanged = (): void => {
    this.partyList?.refresh();
  };

  private createToggleIcon() {
    this.toggleIconContainer = addContainer(this.scene, 0, 0);

    const {
      iconWidth,
      spacing,
      iconScale,
      iconY,
      guideOffsetX,
      guideKeycapY,
      guideTextY,
      guideScale,
      guideFontSize,
      rightPadding,
      y,
    } = TOGGLE_ICON_LAYOUT;

    const step = iconWidth + spacing;
    const n = TOGGLE_ICONS.length;

    for (let i = 0; i < n; i++) {
      const { texture, guide } = TOGGLE_ICONS[i];
      const x = -(n - 1 - i) * step;

      const icon = addImage(this.scene, texture, undefined, x, iconY).setScale(iconScale);
      const guideIcon = addImage(
        this.scene,
        TEXTURE.KEYCAP,
        undefined,
        x + guideOffsetX,
        guideKeycapY,
      ).setScale(guideScale);
      const guideText = addText(
        this.scene,
        x + guideOffsetX,
        guideTextY,
        guide,
        guideFontSize,
        'bold',
        'center',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.GRAY,
      );
      icon.setTint(0x7f7f7f);
      this.toggleIcons.push(icon);
      this.toggleIconContainer.add([icon, guideIcon, guideText]);
    }

    const { width } = this.scene.cameras.main;
    this.toggleIconContainer.setPosition(width / 2 - rightPadding, y);
  }

  private createParty() {
    this.partyList = new PartyListContainer(this.scene);
    this.partyList.create({
      orientation: 'vertical',
      slotSize: 90,
      spacing: 10,
      iconScale: 1.4,
      showLevel: true,
      nineSlice: { left: 8, right: 8, top: 8, bottom: 8 },
      frameVisible: false,
      levelSize: 40,
    });
    this.partyList.setPosition(+905, 0);
    this.partyList.refresh();
  }

  refreshParty(): void {
    this.partyList?.refresh();
  }

  private createQuickSlot() {}

  private createInfo() {
    const user = this.scene.getUser()?.getProfile();
    const location = user?.lastLocation.map;
    const x = user?.lastLocation.x;
    const y = user?.lastLocation.y;
    const time = '00:00';
    const money = user?.money;
    const candy = 0;

    this.infoList = new ImageTextListContainer(this.scene);
    this.infoList.create({
      windowTexture: TEXTURE.BLANK,
      windowWidth: 500,
      windowScale: 2,
      nineSlice: { left: 16, right: 16, top: 16, bottom: 16 },
      rows: [
        { key: 'location', texture: TEXTURE.ICON_LOCATION, text: i18next.t(`menu:${location}`) },
        { key: 'xy', texture: TEXTURE.ICON_XY, text: `${x},${y}` },
        { key: 'time', texture: TEXTURE.ICON_NIGHT, text: time, scale: 1.4 },
        { key: 'money', texture: TEXTURE.ICON_MONEY, text: `${MONEY_SYMBOL} ${money}` },
        {
          key: 'candy',
          texture: TEXTURE.ICON_CANDY,
          text: `${candy} ${i18next.t('menu:candy')}`,
          scale: 0.8,
        },
      ],
      gapBetweenImageAndText: 15,
      padding: 10,
      textFontSize: 40,
      rowGap: 3,
      imageSize: 45,
    });
    this.infoList.setPosition(-950, -525);
  }

  show() {
    const zoom = this.scene.cameras.main.zoom;
    this.setScale(zoom > 0 ? 1 / zoom : 1);

    this.setVisible(true);
  }

  hide() {
    this.setVisible(false);
  }

  updateToggleIcon(texture: TEXTURE, onoff: boolean) {
    const index = this.toggleIcons.findIndex((icon) => icon.texture.key === texture);
    if (index > -1) {
      if (onoff) {
        this.toggleIcons[index].clearTint();
      } else {
        this.toggleIcons[index].setTint(0x7f7f7f);
      }
    }
  }

  refreshInfo(mapKey: string, tileX: number, tileY: number, money: number, candy: number): void {
    const loc = this.infoList.getRow('location');
    if (loc) loc.text.setText(mapKey ? i18next.t(`menu:${mapKey}`) : '');

    const xy = this.infoList.getRow('xy');
    if (xy) xy.text.setText(`${tileX},${tileY}`);

    const moneyRow = this.infoList.getRow('money');
    if (moneyRow) moneyRow.text.setText(`${MONEY_SYMBOL} ${money}`);

    const candyRow = this.infoList.getRow('candy');
    if (candyRow) candyRow.text.setText(`${candy} ${i18next.t('menu:candy')}`);
  }

  updateTime(timeOfDay?: string): void {
    const row = this.infoList.getRow('time');
    if (!row) return;
    if (timeOfDay) {
      const texture = TIME_ICON_MAP[timeOfDay] ?? TEXTURE.ICON_DAY;
      row.image.setTexture(texture);
    }
  }
}
