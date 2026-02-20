import { ImageTextListContainer } from '@poposafari/containers/image-text-list.container';
import { WindowStripContainer } from '@poposafari/containers/window-strip.container';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, MONEY_SYMBOL, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addContainer, addImage, addText } from '@poposafari/utils';
import i18next from 'i18next';

const MAX_PARTY_SIZE = 6;
const MAX_QUICK_SLOT_SIZE = 6;

export class OverworldHudUI extends Phaser.GameObjects.Container {
  scene: GameScene;
  private toggleIconContainer!: GContainer;
  private toggleIcons: GImage[] = [];
  private toggleIconTexts: GText[] = [];

  private partyStrip!: WindowStripContainer;
  private partyIcons: GImage[] = [];

  private quickSlotStrip!: WindowStripContainer;
  private quickSlotIcons: GImage[] = [];

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

    this.add([this.toggleIconContainer, this.partyStrip, this.quickSlotStrip, this.infoList]);
  }

  private createToggleIcon() {
    this.toggleIconContainer = addContainer(this.scene, 0, 0);

    const iconWidth = 70;
    const spacing = 15;
    const textures = [TEXTURE.ICON_TALK, TEXTURE.ICON_RUNNING, TEXTURE.ICON_MENU];
    const guideTextures = ['Z', 'R', 'S'];
    let currentX = 0;

    for (let i = 0; i < textures.length; i++) {
      const texture = textures[i];
      const guideTexture = guideTextures[i];
      const icon = addImage(this.scene, texture, undefined, currentX, -12).setScale(2.8);
      const guide = addImage(this.scene, TEXTURE.KEYCAP, undefined, currentX + 30, -40).setScale(
        1.6,
      );
      const guideText = addText(
        this.scene,
        currentX + 30,
        -47,
        guideTexture,
        20,
        '100',
        'center',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.GRAY,
      );
      icon.setTint(0x7f7f7f);
      this.toggleIcons.push(icon);
      currentX += iconWidth + spacing;
      this.toggleIconContainer.add([icon, guide, guideText]);
    }

    this.toggleIconContainer.setPosition(+735, +510);
  }

  private createParty() {
    this.partyStrip = new WindowStripContainer(this.scene);
    this.partyStrip.create({
      orientation: 'vertical',
      slotCount: MAX_PARTY_SIZE,
      slotSize: 60,
      spacing: 10,
      nineSlice: { left: 8, right: 8, top: 8, bottom: 8 },
    });

    // TODO: 파티 포켓몬 아이콘 추가
    // for (let i = 0; i < this.partyStrip.getSlotCount(); i++) {
    //   const pos = this.partyStrip.getSlotCenter(i);
    //   const icon = addImage(this.scene, TEXTURE.ICON_CHECK, pos.x, pos.y).setScale(2);
    //   this.partyIcons.push(icon);
    //   this.partyStrip.add(icon);
    // }
    this.partyStrip.setPosition(+905, 0);
  }

  private createQuickSlot() {
    this.quickSlotStrip = new WindowStripContainer(this.scene);
    this.quickSlotStrip.create({
      orientation: 'horizontal',
      slotCount: MAX_QUICK_SLOT_SIZE,
      slotSize: 60,
      spacing: 10,
      nineSlice: { left: 8, right: 8, top: 8, bottom: 8 },
    });

    // TODO: 퀵슬롯 아이콘 추가
    // for (let i = 0; i < this.quickSlotStrip.getSlotCount(); i++) {
    //   const pos = this.quickSlotStrip.getSlotCenter(i);
    //   const icon = addImage(this.scene, TEXTURE.ICON_CHECK, pos.x, pos.y).setScale(2);
    //   this.quickSlotIcons.push(icon);
    //   this.quickSlotStrip.add(icon);
    // }
    this.quickSlotStrip.setPosition(0, +490);
  }

  private createInfo() {
    const user = this.scene.getUser()?.getProfile();
    const location = user?.lastLocation.map;
    const x = user?.lastLocation.x;
    const y = user?.lastLocation.y;
    const time = '00:00';
    const money = user?.money;
    const candy = user?.candy;

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

  updateTime(): void {
    const row = this.infoList.getRow('time');
    if (row) row.text.setText('00:00');
  }
}
