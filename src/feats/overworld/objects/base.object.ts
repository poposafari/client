import { GameScene } from '@poposafari/scenes';
import { calcOverworldTilePos } from '../overworld.constants';
import { addObjText, addSprite, addText } from '@poposafari/utils';
import { DEPTH, TEXTCOLOR, TEXTSHADOW, TEXTSTROKE, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import i18next from '@poposafari/i18n';

export interface BaseObjectOptions {
  scale?: number;
}

export interface ObjectName {
  text: string;
  color?: TEXTCOLOR;
}

export class BaseObject {
  protected scene: GameScene;
  protected sprite: GSprite;
  protected shadow: GSprite;
  protected name: GText;
  protected tileX: number;
  protected tileY: number;
  protected nameKey: string;
  protected nameColor: TEXTCOLOR;

  nameOffsetY: number = 100;

  constructor(
    scene: GameScene,
    texture: string,
    tileX: number,
    tileY: number,
    name: ObjectName,
    nameOffsetY: number,
    options?: BaseObjectOptions,
  ) {
    this.scene = scene;
    this.tileX = Math.floor(tileX);
    this.tileY = Math.floor(tileY);
    this.nameKey = name.text;
    this.nameColor = name.color ?? TEXTCOLOR.WHITE;
    this.nameOffsetY = nameOffsetY;

    const scale = options?.scale ?? 1;
    this.shadow = addSprite(scene, TEXTURE.OVERWORLD_SHADOW, undefined, tileX, tileY)
      .setOrigin(0.5, 1)
      .setScale(scale);
    this.sprite = addSprite(scene, texture, undefined, tileX, tileY)
      .setOrigin(0.5, 1)
      .setScale(scale);
    this.name = addObjText(
      scene,
      tileX,
      tileY - this.nameOffsetY,
      i18next.t(`object:${name.text}`),
      20,
      this.nameColor,
    );

    this.name.setDepth(DEPTH.MESSAGE);

    this.refreshPosition();
  }

  refreshNameText(): void {
    if (!this.nameKey || !this.name?.active) return;
    this.name.setText(i18next.t(`object:${this.nameKey}`));
  }

  getScene(): GameScene {
    return this.scene;
  }

  getSprite(): Phaser.GameObjects.Sprite {
    return this.sprite;
  }

  getShadow(): Phaser.GameObjects.Sprite {
    return this.shadow;
  }

  getName(): GText {
    return this.name;
  }

  getTileX(): number {
    return this.tileX;
  }

  getTileY(): number {
    return this.tileY;
  }

  getTilePos(): { x: number; y: number } {
    return { x: this.tileX, y: this.tileY };
  }

  setTilePos(tileX: number, tileY: number): void {
    this.tileX = Math.floor(tileX);
    this.tileY = Math.floor(tileY);
  }

  step(dx: number, dy: number): void {
    this.setTilePos(this.tileX + dx, this.tileY + dy);
    this.refreshPosition();
  }

  getSpritePos(): { x: number; y: number } {
    const c = this.sprite.getBottomCenter();
    return { x: c.x, y: c.y };
  }

  setPosition(px: number, py: number): void {
    this.sprite.setPosition(px, py);
    this.shadow.setPosition(px, py);
    this.name.setPosition(px, py - this.nameOffsetY);
  }

  startSpriteAnimation(key: string): void {
    if (this.sprite.anims.isPlaying && this.sprite.anims.currentAnim?.key === key) return;
    this.sprite.play(key);
  }

  stopSpriteAnimation(frameIndex: number): void {
    this.sprite.anims.stop();
    const textureKey = this.sprite.texture.key;
    const frameKeys = this.scene.textures.get(textureKey).getFrameNames();
    if (frameKeys[frameIndex]) this.sprite.setFrame(frameKeys[frameIndex]);
  }

  setSpriteDepth(value: number): void {
    this.sprite.setDepth(value);
    this.shadow.setDepth(value);
  }

  refreshPosition(): void {
    const [px, py] = calcOverworldTilePos(this.tileX, this.tileY);
    this.sprite.setPosition(px, py);
    this.shadow.setPosition(px, py);
    this.name.setPosition(px, py - this.nameOffsetY);
    this.sprite.setDepth(this.tileY);
    this.shadow.setDepth(this.tileY);
    this.name.setDepth(this.tileY + 1);
  }

  destroy(): void {
    this.shadow.destroy();
    this.sprite.destroy();
    this.name.destroy();
  }
}
