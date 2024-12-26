import InputText from 'phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText';

import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { TEXTSTYLE } from '../enums/textstyle';
import { ANIMATION } from '../enums/animation';

export function addWindow(
  scene: InGameScene,
  texture: TEXTURE | string,
  x: number,
  y: number,
  width: number,
  height: number,
  leftWidth?: number,
  rightWidth?: number,
  topHeight?: number,
  bottomHeight?: number,
) {
  const ret = scene.add.nineslice(x, y, texture, undefined, width, height, leftWidth, rightWidth, topHeight, bottomHeight);
  ret.setOrigin(0.5, 0.5);

  return ret;
}

export function addImage(scene: InGameScene, texture: TEXTURE | string, x: number, y: number) {
  const ret = scene.add.image(x, y, texture).setOrigin(0.5, 0.5);

  return ret;
}

export function addBackground(scene: InGameScene, texture: TEXTURE, width: number, height: number) {
  const ret = scene.add
    .image(0, 0, texture)
    .setOrigin(0, 0)
    .setDisplaySize(width / 2, height / 2);

  return ret;
}

export function addText(scene: InGameScene, x: number, y: number, content: string, style: TEXTSTYLE): Phaser.GameObjects.Text {
  const result = scene.add.text(x, y, content, getTextStyle(style));

  result.setShadow(3, 2, getTextShadow(style));
  result.setScale(0.5);
  result.setOrigin(0.5, 0.5);

  return result;
}

export function addTextBackground(scene: InGameScene, x: number, y: number, content: string, style: TEXTSTYLE): Phaser.GameObjects.Text {
  const result = scene.add.text(x, y, content, getTextStyle(style));

  result.setShadow(3, 2, getTextShadow(style));
  result.setScale(0.5);
  result.setOrigin(0.5, 0.5);
  result.setBackgroundColor('rgba(0, 0, 0, 0.7)');

  return result;
}

export function addTextInput(scene: InGameScene, x: number, y: number, width: number, height: number, style: TEXTSTYLE, option: InputText.IConfig): InputText {
  const result = new InputText(scene, x, y, width, height, getTextStyle(style, option));

  scene.add.existing(result);
  result.setScale(1);

  return result;
}

export function addMap(scene: InGameScene, key: TEXTURE): Phaser.Tilemaps.Tilemap {
  const result = scene.make.tilemap({ key: key });

  return result;
}

export function createSpriteAnimation(scene: InGameScene, key: TEXTURE | string, animationKey: ANIMATION | string, frames?: Phaser.Types.Animations.AnimationFrame[]) {
  scene.anims.create({
    key: animationKey,
    frames: frames ? frames : getSpriteFrames(scene, key, animationKey),
    frameRate: 8,
    repeat: -1,
    delay: 8,
    yoyo: false,
  });
}

export function getSpriteFrames(scene: InGameScene, key: TEXTURE | string, animationKey: ANIMATION | string) {
  return scene.anims.generateFrameNames(key, {
    prefix: animationKey + '-',
    suffix: '',
    start: 0,
    end: getAnimationSize(animationKey),
  });
}

export function createSprite(scene: InGameScene, key: TEXTURE | string, posX: number, posY: number) {
  const ret = scene.add.sprite(posX, posY, key);
  ret.setOrigin(0, 0);
  ret.setScale(2);
  return ret;
}

function isNagativeNumber(targetNumber: number) {
  const calc = targetNumber - 3;
  let ret = -1;

  calc <= 0 ? (ret = 0) : (ret = calc);
  console.log(targetNumber, ret);
  return ret;
}

function getAnimationSize(key: ANIMATION | string) {
  switch (key) {
    case ANIMATION.PAUSE:
      return 3;
    case ANIMATION.PLAYER_MOVEMENT:
      return 23;
    case ANIMATION.PLAYER_RIDE:
      return 11;
    case ANIMATION.TYPES:
      return 17;
    case ANIMATION.POKEMON_CALL:
    case ANIMATION.POKEMON_RECALL:
      return 4;
    case ANIMATION.POKEMON_OVERWORLD:
      return 15;
    case ANIMATION.BAG1:
    case ANIMATION.BAG2:
    case ANIMATION.BAG3:
    case ANIMATION.BAG4:
      return 2;
  }
}

function getTextShadow(style: TEXTSTYLE) {
  let ret;

  switch (style) {
    case TEXTSTYLE.BOX_DEFAULT:
    case TEXTSTYLE.BOX_NAME:
    case TEXTSTYLE.BOX_POKEDEX:
    case TEXTSTYLE.CHOICE_DEFAULT:
    case TEXTSTYLE.ITEM_TITLE:
    case TEXTSTYLE.MESSAGE_BLACK:
    case TEXTSTYLE.LOBBY_DEFAULT:
      ret = '#91919a';
      break;
    case TEXTSTYLE.LOBBY_TITLE:
      ret = '#2CC295';
      break;
  }

  return ret;
}

function getTextStyle(style: TEXTSTYLE, inputConfig?: InputText.IConfig): any {
  let config: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: 'font_4',
  };

  if (inputConfig) Object.assign(config, inputConfig);

  switch (style) {
    case TEXTSTYLE.LOBBY_TITLE:
      config.fontSize = '80px';
      config.color = '#00DF81';
      // config.fontStyle = 'bold';
      break;
    case TEXTSTYLE.LOBBY_DEFAULT:
      config.fontSize = '30px';
      config.color = '#ffffff';
      break;
    case TEXTSTYLE.LOBBY_INPUT:
      config.fontSize = '13px';
      config.color = '#4b4b4b';
      break;
    case TEXTSTYLE.MESSAGE_BLACK:
      config.fontSize = '68px';
      config.color = '#4b4b4b';
      break;
    case TEXTSTYLE.MESSAGE_WHITE:
      config.fontSize = '54px';
      config.color = '#ffffff';
      break;
    case TEXTSTYLE.TITLE_DEFAULT:
      config.fontSize = '36px';
      config.color = '#ffffff';
      break;
    case TEXTSTYLE.ITEM_TITLE:
      config.fontSize = '40px';
      config.color = '#ffffff';
      break;
    case TEXTSTYLE.CHOICE_DEFAULT:
      config.fontSize = '50px';
      config.color = '#ffffff';
      break;
    case TEXTSTYLE.BOX_POKEDEX:
      config.fontSize = '50px';
      config.color = '#b0b0b0';
      config.fontStyle = 'bold';
      break;
    case TEXTSTYLE.BOX_NAME:
      config.fontSize = '80px';
      config.color = '#4b4b4b';
      break;
    case TEXTSTYLE.BOX_DEFAULT:
      config.fontSize = '50px';
      config.color = '#4b4b4b';
      break;
  }

  return config;
}

export abstract class Ui {
  protected scene: InGameScene;

  constructor(scene: InGameScene) {
    this.scene = scene;
  }

  abstract setup(): void;
  abstract show(data?: any): void;
  abstract clean(data?: any): void;
  abstract pause(onoff: boolean, data?: any): void;
  abstract update(time: number, delta: number): void;

  getUi() {
    return this.scene.ui;
  }

  getWidth() {
    return this.scene.game.canvas.width;
  }

  getHeight() {
    return this.scene.game.canvas.height;
  }
}
