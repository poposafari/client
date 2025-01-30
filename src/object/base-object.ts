import { ANIMATION } from '../enums/animation';
import { DEPTH } from '../enums/depth';
import { OBJECT } from '../enums/object-type';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addTextBackground, createSprite } from '../ui/ui';

export const TILE_SIZE = 32;
export const MAP_SCALE = 1.5;
export const PLAYER_SCALE = 3;

export class BaseObject {
  private scene: InGameScene;
  private tilePos!: Phaser.Math.Vector2;
  private sprite: Phaser.GameObjects.Sprite;
  protected dummy1!: Phaser.GameObjects.Sprite;
  protected dummy2!: Phaser.GameObjects.Sprite;
  private spriteShadow: Phaser.GameObjects.Image;
  private nickname: Phaser.GameObjects.Text;
  private type!: OBJECT;
  private readonly offsetX = TILE_SIZE / 2;
  private readonly offsetY = TILE_SIZE;

  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, nickname: string, objectType: OBJECT) {
    this.scene = scene;
    this.spriteShadow = addImage(scene, TEXTURE.SHADOW, 0, 0).setScale(2.8);
    this.sprite = createSprite(scene, texture, 0, 0);
    this.dummy1 = createSprite(scene, TEXTURE.BLANK, 0, 0);
    this.dummy2 = createSprite(scene, TEXTURE.BLANK, 0, 0);

    this.sprite.setOrigin(0.5, 1);
    this.dummy1.setOrigin(0.5, 1);
    this.dummy2.setOrigin(0.5, 1);
    this.spriteShadow.setOrigin(0.5, 1);

    this.type = objectType;

    this.tilePos = new Phaser.Math.Vector2(x, y);

    this.nickname = addTextBackground(scene, this.getPosition().x, this.getPosition().y, nickname, TEXTSTYLE.MESSAGE_WHITE);

    this.initSetPosition(this.tilePos.x, this.tilePos.y);
    this.nickname.setDepth(DEPTH.NICKNAME);
    this.dummy1.setDepth(DEPTH.NICKNAME + 1);
    this.setDepth(this.tilePos.y);
  }

  initSetPosition(posX: number, posY: number) {
    const retX = posX * TILE_SIZE * MAP_SCALE + this.offsetX * MAP_SCALE;
    const retY = posY * TILE_SIZE * MAP_SCALE + this.offsetY * MAP_SCALE;

    this.sprite.setPosition(retX, retY);
    this.dummy1.setPosition(retX, retY - 80);
    this.dummy2.setPosition(retX, retY);
    this.spriteShadow.setPosition(retX, retY);
    this.nickname.setPosition(retX, retY - 100);
  }

  setScale(value: number) {
    this.sprite.setScale(1.5);
  }

  getType() {
    return this.type;
  }

  destroy() {
    if (this.sprite) {
      this.scene.children.remove(this.sprite);
      this.sprite.destroy();
      this.spriteShadow.destroy();
      this.dummy1.destroy();
      this.dummy2.destroy();
      this.sprite = null!;
      this.spriteShadow = null!;
      this.dummy1 = null!;
      this.dummy2 = null!;
    }

    if (this.nickname) {
      this.scene.children.remove(this.nickname);
      this.nickname.destroy();
      this.nickname = null!;
    }
  }

  setVisible(onoff: boolean) {
    this.sprite.setVisible(onoff ? true : false);
    this.spriteShadow.setVisible(onoff ? true : false);
    this.dummy1.setVisible(onoff ? true : false);
    this.dummy2.setVisible(onoff ? true : false);
  }

  getSprite() {
    return this.sprite;
  }

  getNickname() {
    return this.nickname;
  }

  getScene() {
    return this.scene;
  }

  getTilePos(): Phaser.Math.Vector2 {
    return this.tilePos.clone();
  }

  setTilePos(tilePosition: Phaser.Math.Vector2): void {
    this.tilePos = tilePosition.clone();
  }

  getPosition(): Phaser.Math.Vector2 {
    return this.sprite.getBottomCenter();
  }

  setPosition(position: Phaser.Math.Vector2): void {
    this.sprite.setPosition(position.x, position.y);
    this.spriteShadow.setPosition(position.x, position.y);
    this.dummy1.setPosition(position.x, position.y - 80);
    this.dummy2.setPosition(position.x, position.y);
    this.nickname.setPosition(position.x, position.y - 100);
  }

  setSpriteFrame(frame: number) {
    const textureKey = this.sprite.texture.key;
    const frameKeys = this.sprite.scene.textures.get(textureKey).getFrameNames();
    this.sprite.setFrame(frameKeys[frame]);
  }

  startAnmation(animationKey: ANIMATION | string) {
    if (this.sprite.anims.isPlaying && this.sprite.anims.currentAnim?.key === animationKey) {
      return;
    }
    this.sprite.play(animationKey);
  }

  setTexture(texture: TEXTURE | string) {
    this.sprite.setTexture(texture);
  }

  stopAnmation(frameNumber: number) {
    if (this.type === OBJECT.PET) return;
    if (this.type === OBJECT.POKEMON) return;
    const textureKey = this.sprite.texture.key;
    const frameKeys = this.sprite.scene.textures.get(textureKey).getFrameNames();
    this.sprite.stop();
    this.sprite.setFrame(frameKeys[frameNumber]);
  }

  getDepth() {
    return this.sprite.depth;
  }

  setDepth(depth: number) {
    this.sprite.setDepth(depth);
  }
}
