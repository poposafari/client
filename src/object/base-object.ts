import { ANIMATION } from '../enums/animation';
import { DEPTH } from '../enums/depth';
import { OBJECT } from '../enums/object-type';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { addTextBackground, createSprite } from '../ui/ui';

export const TILE_SIZE = 32;
export const MAP_SCALE = 1.5;
export const PLAYER_SCALE = 3;

export class BaseObject {
  private scene: InGameScene;
  private tilePos!: Phaser.Math.Vector2;
  private sprite: Phaser.GameObjects.Sprite;
  private nickname: Phaser.GameObjects.Text;
  private type!: OBJECT;
  private readonly offsetX = TILE_SIZE / 2;
  private readonly offsetY = TILE_SIZE;

  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, nickname: string) {
    this.scene = scene;
    this.sprite = createSprite(scene, texture, 0, 0);

    this.sprite.setOrigin(0.5, 1);

    this.tilePos = new Phaser.Math.Vector2(x, y);

    this.nickname = addTextBackground(scene, this.getPosition().x, this.getPosition().y, nickname, TEXTSTYLE.MESSAGE_WHITE);

    this.initSetPosition(this.tilePos.x, this.tilePos.y);
    this.nickname.setDepth(DEPTH.NICKNAME);
    this.setDepth(this.tilePos.y);
  }

  initSetPosition(posX: number, posY: number) {
    const retX = posX * TILE_SIZE * MAP_SCALE + this.offsetX * MAP_SCALE;
    const retY = posY * TILE_SIZE * MAP_SCALE + this.offsetY * MAP_SCALE;

    this.sprite.setPosition(retX, retY);
    this.nickname.setPosition(retX, retY - 100);
  }

  setScale(value: number) {
    this.sprite.setScale(1.5);
  }

  setType(type: OBJECT) {
    if (type) {
      this.type = type;
    }
  }

  getType() {
    return this.type;
  }

  destroy() {
    if (this.sprite) {
      this.scene.children.remove(this.sprite);
      this.sprite.destroy();
      this.sprite = null!;
    }

    if (this.nickname) {
      this.scene.children.remove(this.nickname);
      this.nickname.destroy();
      this.nickname = null!;
    }
  }

  setVisible(onoff: boolean) {
    this.sprite.setVisible(onoff ? true : false);
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
