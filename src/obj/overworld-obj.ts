import { MAP_SCALE, TILE_SIZE } from '../constants';
import { ANIMATION, DEPTH, OBJECT, TEXTSTYLE, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { addTextBackground, createSprite } from '../uis/ui';

export class OverworldObj {
  private scene: InGameScene;
  private tilePos!: Phaser.Math.Vector2;
  private sprite: Phaser.GameObjects.Sprite;
  private shadow: Phaser.GameObjects.Sprite;
  private waterShadow: Phaser.GameObjects.Sprite;
  private effect: Phaser.GameObjects.Sprite;
  private emotion: Phaser.GameObjects.Sprite;
  private dummy: Phaser.GameObjects.Sprite;
  private effectOffsetY: number = 0;
  private emotionOffsetY: number = -50;
  private grassShadowOffsetY: number = 5;
  private dummyOffsetY: number = 0;
  private name: Phaser.GameObjects.Text;
  private objType: OBJECT;

  private readonly offsetX = TILE_SIZE / 2;
  private readonly offsetY = TILE_SIZE;
  private readonly offsetNameY = 100;

  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, name: string = '', objType: OBJECT) {
    this.scene = scene;
    this.sprite = createSprite(scene, texture, 0, 0).setOrigin(0.5, 1);
    this.shadow = createSprite(scene, TEXTURE.OVERWORLD_SHADOW, 0, 0).setOrigin(0.5, 1).setAlpha(0.5);
    this.waterShadow = createSprite(scene, TEXTURE.OVERWORLD_SHADOW_WATER, 0, 0).setOrigin(0.5, 1);
    this.effect = createSprite(scene, TEXTURE.BLANK, 0, 0).setOrigin(0.5, 1);
    this.emotion = createSprite(scene, TEXTURE.BLANK, 0, 0).setOrigin(0.5, 1);
    this.dummy = createSprite(scene, TEXTURE.BLANK, 0, 0).setOrigin(0.5, 1);
    this.name = addTextBackground(scene, this.getSpritePos().x, this.getSpritePos().y, name, TEXTSTYLE.MESSAGE_WHITE);
    this.tilePos = new Phaser.Math.Vector2(x, y);
    this.objType = objType;
    this.moveTilePos(this.tilePos.x, this.tilePos.y);

    this.name.setDepth(DEPTH.NICKNAME);
    this.effect.setDepth(this.tilePos.y + 1);
    this.emotion.setDepth(DEPTH.MENU);
    this.dummy.setDepth(this.tilePos.y + 1);
    this.sprite.setDepth(this.tilePos.y);
    this.waterShadow.setDepth(this.tilePos.y);

    this.setShadow('normal');
  }

  getScene() {
    return this.scene;
  }

  setTilePos(tilePosition: Phaser.Math.Vector2): void {
    this.tilePos = tilePosition.clone();
  }

  getTilePos(): Phaser.Math.Vector2 {
    return this.tilePos.clone();
  }

  moveTilePos(x: number, y: number) {
    this.tilePos.set(x, y);

    const [retX, retY] = this.calcOverworldTilePos(x, y);

    this.sprite.setPosition(retX, retY);
    this.shadow.setPosition(retX, retY);
    this.waterShadow.setPosition(retX, retY);
    this.effect.setPosition(retX, retY + this.effectOffsetY);
    this.emotion.setPosition(retX, retY + this.emotionOffsetY);
    this.dummy.setPosition(retX, retY + this.dummyOffsetY);
    this.name.setPosition(retX, retY - this.offsetNameY);

    this.sprite.setDepth(this.tilePos.y);
    this.waterShadow.setDepth(this.tilePos.y);
    this.effect.setDepth(this.tilePos.y + 1);
    this.dummy.setDepth(this.tilePos.y + 1);
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null!;
    }

    if (this.shadow) {
      this.shadow.destroy();
      this.shadow = null!;
    }

    if (this.waterShadow) {
      this.waterShadow.stop();
      this.waterShadow.destroy();
      this.waterShadow = null!;
    }

    if (this.name) {
      this.name.destroy();
      this.name = null!;
    }

    if (this.dummy) {
      this.dummy.destroy();
      this.dummy = null!;
    }

    if (this.effect) {
      this.effect.destroy();
      this.effect = null!;
    }

    if (this.emotion) {
      this.emotion.destroy();
      this.emotion = null!;
    }
  }

  startSpriteAnimation(key: ANIMATION | string) {
    if (this.sprite.anims.isPlaying && this.sprite.anims.currentAnim?.key === key) return;

    this.sprite.play(key);
  }

  stopSpriteAnimation(frame: number) {
    if (this.objType === OBJECT.PET || this.objType === OBJECT.WILD) return;
    const textureKey = this.sprite.texture.key;
    const frameKeys = this.sprite.scene.textures.get(textureKey).getFrameNames();
    this.sprite.anims.stop();
    this.sprite.setFrame(frameKeys[frame]);
  }

  getSpritePos(): Phaser.Math.Vector2 {
    return this.sprite?.getBottomCenter();
  }

  getSprite() {
    return this.sprite;
  }

  getShadow() {
    return this.shadow;
  }

  getObjType() {
    return this.objType;
  }

  setSpriteScale(value: number) {
    this.sprite.setScale(value);
  }

  setPosition(pos: Phaser.Math.Vector2) {
    this.sprite.setPosition(pos.x, pos.y);
    this.shadow.setPosition(pos.x, pos.y);
    this.waterShadow.setPosition(pos.x, pos.y);
    this.effect.setPosition(pos.x, pos.y + this.effectOffsetY);
    this.emotion.setPosition(pos.x, pos.y + this.emotionOffsetY);
    this.dummy.setPosition(pos.x, pos.y + this.dummyOffsetY);
    this.name.setPosition(pos.x, pos.y - this.offsetNameY);

    this.sprite.setDepth(this.tilePos.y);
    this.waterShadow.setDepth(this.tilePos.y);
    this.effect.setDepth(this.tilePos.y + 1);
    this.dummy.setDepth(this.tilePos.y + 1);
  }

  setEffect(texture: TEXTURE | string, animation: ANIMATION | string, repeat: number = -1, frame: number = 10, scale: number = 1, fn?: () => void) {
    animation !== ANIMATION.NONE ? this.effect.play({ key: animation, repeat: repeat, frameRate: frame }) : this.effect.stop();
    this.effect.setTexture(texture);
    this.effect.setScale(scale);

    this.effect.once('animationcomplete', () => {
      if (fn) fn();
    });
  }

  setDummy(texture: TEXTURE | string, animation: ANIMATION | string, repeat: number = -1, frame: number = 10, scale: number = 1, fn?: () => void) {
    animation !== ANIMATION.NONE ? this.dummy.play({ key: animation, repeat: repeat, frameRate: frame }) : this.dummy.stop();

    if (texture !== TEXTURE.NONE) this.dummy.setTexture(texture);
    this.dummy.setScale(scale);

    this.dummy.once('animationcomplete', () => {
      if (fn) fn();
    });
  }

  async setEmotion(texture: TEXTURE | string, animation: ANIMATION | string, repeat: number = 0, frame: number = 7, scale: number = 1.5): Promise<void> {
    this.emotion.stop();
    this.emotion.removeAllListeners('animationcomplete');
    this.scene.tweens.killTweensOf(this.emotion);

    this.emotion.setTexture(TEXTURE.BLANK);

    this.emotion.setScale(scale);
    this.emotion.setVisible(true);

    if (animation === ANIMATION.NONE) {
      this.emotion.setVisible(false);
      this.emotion.setTexture(TEXTURE.BLANK);
      return;
    }

    this.emotion.play({ key: animation, repeat: repeat, frameRate: frame });

    await new Promise<void>((resolve) => {
      this.emotion.once('animationcomplete', () => {
        this.emotion.setTexture(TEXTURE.BLANK);
        this.emotion.setVisible(false);
        resolve();
      });
    });
  }

  setVisibleDummy(onoff: boolean) {
    this.dummy.setVisible(onoff);
  }

  setVisible(onoff: boolean) {
    this.setSpriteVisible(onoff);
    this.effect.setVisible(onoff);
    this.name.setVisible(onoff);
  }

  setSpriteVisible(onoff: boolean) {
    this.sprite.setVisible(onoff);
    this.shadow.setVisible(onoff);
    // this.waterShadow.setVisible(onoff);
  }

  setShadow(type: 'water' | 'normal' | 'grass_1' | 'grass_2' | 'grass_3' | 'grass_4' | 'grass_5' | 'grass_6' | 'grass_7') {
    if (type === 'water') {
      this.shadow.setVisible(false);
      this.waterShadow.setVisible(true);
      this.waterShadow.play({ key: TEXTURE.OVERWORLD_SHADOW_WATER, repeat: -1, frameRate: 10 });
    } else if (type === 'normal') {
      this.shadow.setVisible(true);
      this.waterShadow.setVisible(false);
      this.waterShadow.stop();
    } else if (type.startsWith('grass_')) {
      this.shadow.setVisible(false);
      this.waterShadow.setVisible(false);
    }
  }

  setDummyOffsetY(x: number, y: number, value: number) {
    const [retX, retY] = this.calcOverworldTilePos(x, y);

    this.dummyOffsetY = value;
    this.dummy.setPosition(retX, retY + this.dummyOffsetY);
  }

  setSpriteDepth(value: number) {
    this.sprite.setDepth(value);
  }

  calcOverworldTilePos(x: number, y: number) {
    const retX = x * TILE_SIZE * MAP_SCALE + this.offsetX * MAP_SCALE;
    const retY = y * TILE_SIZE * MAP_SCALE + this.offsetY * MAP_SCALE;

    return [retX, retY];
  }

  setSpriteAdjustY(value: number) {
    this.sprite.setY(this.sprite.y + value);
  }

  setName(name: string) {
    if (this.name && this.name.active) {
      this.name.setText(name);
    }
  }
}
