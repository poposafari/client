import { GameScene } from '@poposafari/scenes';
import { TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addImage, addText } from '@poposafari/utils';
import i18next from '@poposafari/i18n';

export interface ItemDetailPartConfig {
  x: number;
  y: number;
}

export interface ItemDetailIconConfig extends ItemDetailPartConfig {
  scale: number;
}

export interface ItemDetailTextConfig extends ItemDetailPartConfig {
  fontSize: number;
  fontWeight?: number | string;
  style?: TEXTSTYLE;
  shadow?: TEXTSHADOW;
  align?: 'left' | 'center' | 'right';
  visible?: boolean;
}

export interface ItemDetailConfig {
  icon: ItemDetailIconConfig;
  name: ItemDetailTextConfig;
  desc: ItemDetailTextConfig;
}

export class ItemDetailContainer extends Phaser.GameObjects.Container {
  private iconImage!: GImage;
  private nameText!: GText;
  private descText!: GText;

  constructor(scene: GameScene, config: ItemDetailConfig, x = 0, y = 0) {
    super(scene, x, y);
    this.setScrollFactor(0);
    scene.add.existing(this);
    this.build(config);
  }

  private build(config: ItemDetailConfig): void {
    this.iconImage = addImage(this.scene, TEXTURE.BLANK, undefined, config.icon.x, config.icon.y);
    this.iconImage.setScale(config.icon.scale);

    this.nameText = this.buildText(config.name);
    this.descText = this.buildText(config.desc);

    this.add([this.iconImage, this.nameText, this.descText]);
  }

  private buildText(cfg: ItemDetailTextConfig): GText {
    const text = addText(
      this.scene,
      cfg.x,
      cfg.y,
      '',
      cfg.fontSize,
      cfg.fontWeight ?? '100',
      cfg.align ?? 'left',
      cfg.style ?? TEXTSTYLE.WHITE,
      cfg.shadow ?? TEXTSHADOW.GRAY,
    )
      .setOrigin(0, 0)
      .setVisible(cfg.visible!);
    return text;
  }

  update(itemId: string): void {
    if (!itemId || itemId === '__empty__') {
      this.clear();
      return;
    }

    const nameKey = `item:${itemId}.name`;
    const descKey = `item:${itemId}.description`;
    this.nameText.setText(i18next.exists(nameKey) ? i18next.t(nameKey) : itemId);
    this.descText.setText(i18next.exists(descKey) ? i18next.t(descKey) : '');

    if (this.scene.textures.exists(itemId)) {
      this.iconImage.setTexture(itemId);
    } else {
      this.iconImage.setTexture(TEXTURE.BLANK);
    }
  }

  clear(): void {
    this.iconImage.setTexture(TEXTURE.BLANK);
    this.nameText.setText('');
    this.descText.setText('');
  }

  setIconPosition(x: number, y: number): void {
    this.iconImage.setPosition(x, y);
  }

  setIconScale(scale: number): void {
    this.iconImage.setScale(scale);
  }

  setNamePosition(x: number, y: number): void {
    this.nameText.setPosition(x, y);
  }

  setNameFontSize(fontSize: number): void {
    this.nameText.setFontSize(fontSize);
  }

  setNameColor(color: string): void {
    this.nameText.setColor(color);
  }

  setDescPosition(x: number, y: number): void {
    this.descText.setPosition(x, y);
  }

  setDescFontSize(fontSize: number): void {
    this.descText.setFontSize(fontSize);
  }

  setDescColor(color: string): void {
    this.descText.setColor(color);
  }

  getIcon(): GImage {
    return this.iconImage;
  }

  getName(): GText {
    return this.nameText;
  }

  getDesc(): GText {
    return this.descText;
  }
}
