import { ImageTextListContainer } from '@poposafari/containers/image-text-list.container';
import { PartyListContainer } from '@poposafari/containers/party-list.container';
import { WindowStripContainer } from '@poposafari/containers/window-strip.container';
import { LEVEL_CURVE } from '@poposafari/core';
import { GameEvent, GameScene } from '@poposafari/scenes';
import {
  ANIMATION,
  DEPTH,
  EASE,
  MONEY_SYMBOL,
  TEXTSHADOW,
  TEXTSTROKE,
  TEXTSTYLE,
  TEXTURE,
} from '@poposafari/types';
import { addContainer, addImage, addText } from '@poposafari/utils';
import DayNightFilter from '@poposafari/utils/day-night-filter';
import i18next from 'i18next';
import {
  equippedCostumesToParts,
  getDefaultOverworldKeys,
  getHairTextureKey,
  getOutfitTextureKey,
  getSkinTextureKey,
} from './overworld-costume-keys';

const MAX_QUICK_SLOT_SIZE = 6;

const PROFILE_BAR = {
  avatarRadius: 55,
  width: 300,
  height: 12,
  x: +80,
  y: +80,
} as const;

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

const LOCATION_BANNER = {
  slideInMs: 400,
  holdMs: 1500,
  topMargin: 40,
  labelFontSize: 70,
} as const;

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

  private timeContainer!: GContainer;
  private timeIcon!: GImage;
  private timeText!: GText;

  private xyText!: GText;

  private profileContainer!: GContainer;
  private profileAvatarContainer!: GContainer;
  private profileAvatarBg!: Phaser.GameObjects.Graphics;
  private profileSkin!: GSprite;
  private profileOutfit!: GSprite;
  private profileHair!: GSprite;
  private profileLevelBadge!: Phaser.GameObjects.Graphics;
  private profileLevelText!: GText;
  private profileNameText!: GText;
  private profileExpBarBg!: Phaser.GameObjects.Graphics;
  private profileExpBarFill!: Phaser.GameObjects.Graphics;

  private timeTickEvent: Phaser.Time.TimerEvent | null = null;

  private locationBanner: GContainer | null = null;
  private locationBannerTween: Phaser.Tweens.Tween | null = null;

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
    this.createTime();
    this.createXY();
    this.createInfo();
    this.createProfile();

    this.add([
      this.toggleIconContainer,
      this.partyList,
      this.timeContainer,
      this.xyText,
      this.infoList,
      this.profileContainer,
    ]);

    this.scene.events.on(GameEvent.GAME_TIME_CHANGED, this.onGameTimeChanged, this);
    this.scene.events.on(GameEvent.PARTY_CHANGED, this.onPartyChanged, this);
    this.scene.events.on(GameEvent.PROFILE_CHANGED, this.onProfileChanged, this);

    this.timeTickEvent = this.scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: this.refreshRemainingTime,
      callbackScope: this,
    });

    this.once('destroy', () => {
      this.scene.events.off(GameEvent.GAME_TIME_CHANGED, this.onGameTimeChanged, this);
      this.scene.events.off(GameEvent.PARTY_CHANGED, this.onPartyChanged, this);
      this.scene.events.off(GameEvent.PROFILE_CHANGED, this.onProfileChanged, this);
      this.timeTickEvent?.remove(false);
      this.timeTickEvent = null;
      this.clearLocationBanner();
    });

    this.updateTime(DayNightFilter.getCurrentTimeLabel());
    this.refreshRemainingTime();
  }

  private onGameTimeChanged = (timeOfDay: string): void => {
    this.updateTime(timeOfDay);
    this.refreshRemainingTime();
  };

  private refreshRemainingTime = (): void => {
    const remaining = this.scene.getGameTimeRemainingMs();
    if (!this.timeText) return;
    if (remaining === null) return;
    const totalSec = Math.ceil(remaining / 1000);
    const mm = Math.floor(totalSec / 60)
      .toString()
      .padStart(2, '0');
    const ss = (totalSec % 60).toString().padStart(2, '0');
    this.timeText.setText(`${mm}:${ss}`);
  };

  private onPartyChanged = (): void => {
    this.partyList?.refresh();
  };

  private onProfileChanged = (): void => {
    this.refreshProfile();
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
      heldItemOffset: { x: 20, y: 20 },
    });
    this.partyList.setPosition(+905, 0);
    this.partyList.refresh();
  }

  refreshParty(): void {
    this.partyList?.refresh();
  }

  private createQuickSlot() {}

  private createTime() {
    this.timeContainer = addContainer(this.scene, DEPTH.HUD, -810, -390);
    this.timeIcon = addImage(this.scene, TEXTURE.ICON_NIGHT, undefined, 0, 0).setScale(4.8);
    this.timeText = addText(
      this.scene,
      0,
      +60,
      '00:00',
      50,
      '100',
      'center',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    ).setOrigin(0.5, 0.5);
    this.timeContainer.add([this.timeIcon, this.timeText]);
  }

  private createXY() {
    const user = this.scene.getUser()?.getProfile();
    const x = user?.lastLocation.x ?? 0;
    const y = user?.lastLocation.y ?? 0;

    this.xyText = addText(
      this.scene,
      -810,
      -230,
      `x:${x}, y:${y}`,
      40,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    ).setOrigin(0.5, 0.5);
  }

  private createInfo() {
    const user = this.scene.getUser()?.getProfile();
    const location = user?.lastLocation.map;
    const money = user?.money;

    this.infoList = new ImageTextListContainer(this.scene);
    this.infoList.create({
      windowTexture: TEXTURE.BLANK,
      windowWidth: 500,
      windowScale: 2,
      nineSlice: { left: 16, right: 16, top: 16, bottom: 16 },
      rows: [
        { key: 'location', texture: TEXTURE.ICON_LOCATION, text: i18next.t(`menu:${location}`) },
        { key: 'money', texture: TEXTURE.ICON_MONEY, text: `${MONEY_SYMBOL} ${money}` },
      ],
      gapBetweenImageAndText: 15,
      padding: 10,
      textFontSize: 40,
      rowGap: 3,
      imageSize: 45,
    });
    this.infoList.setPosition(-950, -190);
  }

  private createProfile() {
    const AVATAR_RADIUS = PROFILE_BAR.avatarRadius;
    const BAR_W = PROFILE_BAR.width;
    const BAR_H = PROFILE_BAR.height;
    const BAR_X = PROFILE_BAR.x;
    const BAR_Y = PROFILE_BAR.y;

    this.profileContainer = addContainer(this.scene, DEPTH.HUD, -860, +380);

    const user = this.scene.getUser();
    const profile = user?.getProfile();
    const gender = profile?.gender ?? 'male';
    const equipped = user?.getEquippedCostumes();
    const parts = equipped?.length ? equippedCostumesToParts(equipped) : null;
    const defaults = getDefaultOverworldKeys(this.scene, gender);
    const skinKey = parts?.skin ? getSkinTextureKey(parts.skin) : defaults.skin;
    const hairKey = parts?.hair ? getHairTextureKey(gender, parts.hair) : defaults.hair;
    const outfitKey = parts?.outfit ? getOutfitTextureKey(gender, parts.outfit) : defaults.outfit;

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.5);
    bg.fillCircle(0, 0, AVATAR_RADIUS);
    bg.lineStyle(4, 0x5aa7ff, 1);
    bg.strokeCircle(0, 0, AVATAR_RADIUS);
    this.profileAvatarBg = bg;

    const frameName = `${ANIMATION.PLAYER_OVERWORLD_SKIN}-0`;
    const makeAvatarSprite = (key: string): GSprite => {
      const sprite = this.scene.add.sprite(0, -5, key);
      sprite.setOrigin(0.5, 0.5);
      sprite.setScale(4.8);
      if (this.scene.textures.exists(key) && this.scene.textures.get(key).has(frameName)) {
        sprite.setFrame(frameName);
      }
      return sprite;
    };

    this.profileSkin = makeAvatarSprite(skinKey);
    this.profileOutfit = makeAvatarSprite(outfitKey);
    this.profileHair = makeAvatarSprite(hairKey);

    this.profileAvatarContainer = addContainer(this.scene, DEPTH.HUD, -15, +30);
    this.profileAvatarContainer.add([
      this.profileAvatarBg,
      this.profileSkin,
      this.profileOutfit,
      this.profileHair,
    ]);

    this.profileLevelText = addText(
      this.scene,
      +15,
      +58,
      `${profile?.level ?? 1}`,
      70,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.NONE,
      TEXTSTROKE.GRAY,
    );

    this.profileNameText = addText(
      this.scene,
      -66,
      +120,
      profile?.nickname ?? '',
      60,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.NONE,
      TEXTSTROKE.GRAY,
    );

    this.profileExpBarBg = this.scene.add.graphics();
    this.profileExpBarBg.fillStyle(0x000000, 0.6);
    this.profileExpBarBg.fillRoundedRect(BAR_X - BAR_W / 2, BAR_Y, BAR_W, BAR_H, 5);
    this.profileExpBarBg.lineStyle(2, 0x888888, 1);
    this.profileExpBarBg.strokeRoundedRect(BAR_X - BAR_W / 2, BAR_Y, BAR_W, BAR_H, 5);

    this.profileExpBarFill = this.scene.add.graphics();
    this.drawExpFill(profile?.level ?? 1, profile?.exp ?? 0, BAR_W, BAR_H, BAR_X, BAR_Y);

    this.profileContainer.add([
      this.profileAvatarContainer,
      this.profileNameText,
      this.profileExpBarBg,
      this.profileExpBarFill,
      this.profileLevelText,
    ]);
  }

  private drawExpFill(
    level: number,
    exp: number,
    barW: number,
    barH: number,
    barX: number,
    barY: number,
  ): void {
    const ratio = LEVEL_CURVE.isMaxLevel(level)
      ? 1
      : Math.max(0, Math.min(1, exp / LEVEL_CURVE.expToNext(level)));
    this.profileExpBarFill.clear();
    if (ratio <= 0) return;
    this.profileExpBarFill.fillStyle(0x5aa7ff);
    this.profileExpBarFill.fillRoundedRect(barX - barW / 2, barY, barW * ratio, barH, 5);
  }

  refreshProfile(): void {
    const profile = this.scene.getUser()?.getProfile();
    if (!profile) return;
    this.profileLevelText?.setText(`${profile.level}`);
    this.profileNameText?.setText(profile.nickname ?? '');
    this.drawExpFill(
      profile.level,
      profile.exp,
      PROFILE_BAR.width,
      PROFILE_BAR.height,
      PROFILE_BAR.x,
      PROFILE_BAR.y,
    );
  }

  show() {
    const zoom = this.scene.cameras.main.zoom;
    this.setScale(zoom > 0 ? 1 / zoom : 1);

    this.setVisible(true);
  }

  showLocationBanner(area: string, mapKey: string): void {
    this.clearLocationBanner();

    const textureKey = `location_${area}`;
    if (!this.scene.textures.exists(textureKey)) return;

    const { height } = this.scene.cameras.main;
    const halfH = height / 2;

    const img = addImage(this.scene, textureKey, undefined, +30, 0).setScale(6.5);
    const h = img.displayHeight;
    const offscreenY = -halfH - h / 2;
    const visibleY = -halfH + h / 2 + LOCATION_BANNER.topMargin;

    const label = addText(
      this.scene,
      -330,
      0,
      i18next.t(`menu:${mapKey}`),
      LOCATION_BANNER.labelFontSize,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );

    const container = addContainer(this.scene, DEPTH.HUD, -560, offscreenY);
    container.add([img, label]);
    this.add(container);
    this.locationBanner = container;

    this.locationBannerTween = this.scene.tweens.add({
      targets: container,
      y: visibleY,
      duration: LOCATION_BANNER.slideInMs,
      // ease: EASE.SINE_EASEOUT,
      ease: EASE.LINEAR,
      yoyo: true,
      hold: LOCATION_BANNER.holdMs,
      onComplete: () => {
        if (this.locationBanner === container) this.clearLocationBanner();
      },
    });
  }

  private clearLocationBanner(): void {
    if (this.locationBannerTween) {
      this.locationBannerTween.stop();
      this.locationBannerTween = null;
    }
    if (this.locationBanner) {
      this.locationBanner.destroy();
      this.locationBanner = null;
    }
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

  refreshInfo(mapKey: string, tileX: number, tileY: number, money: number): void {
    const loc = this.infoList.getRow('location');
    if (loc) loc.text.setText(mapKey ? i18next.t(`menu:${mapKey}`) : '');

    if (this.xyText) this.xyText.setText(`x:${tileX}, y:${tileY}`);

    const moneyRow = this.infoList.getRow('money');
    if (moneyRow) moneyRow.text.setText(`${MONEY_SYMBOL} ${money}`);
  }

  updateTime(timeOfDay?: string): void {
    if (!this.timeIcon) return;
    if (timeOfDay) {
      const texture = TIME_ICON_MAP[timeOfDay] ?? TEXTURE.ICON_DAY;
      this.timeIcon.setTexture(texture);
    }
  }
}
