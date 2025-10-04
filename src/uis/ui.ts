import InputText from 'phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText';
import { ANIMATION, AUDIO, EASE, PIPELINES, TEXTSTYLE, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { LoadingScene } from '../scenes/load-scene';
import { GM } from '../core/game-manager';

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

export function addImage(scene: InGameScene | LoadingScene, texture: TEXTURE | string, x: number, y: number) {
  const ret = scene.add.image(x, y, texture).setOrigin(0.5, 0.5);

  return ret;
}

export function addBackground(scene: InGameScene | LoadingScene, texture: TEXTURE | string) {
  const { width, height } = scene.scale;
  const bg = scene.add.image(0, 0, texture).setOrigin(0);
  bg.setDisplaySize(width, height);
  return bg;
}

export function addText(scene: InGameScene, x: number, y: number, content: string, style: TEXTSTYLE): Phaser.GameObjects.Text {
  const result = scene.add.text(x, y, content, getTextStyle(style));
  const shadow = getTextShadow(style);

  result.setShadow(shadow[0] as number, shadow[1] as number, shadow[2] as string);
  result.setScale(0.5);
  result.setOrigin(0.5, 0.5);

  return result;
}

export function addTextBackground(scene: InGameScene, x: number, y: number, content: string, style: TEXTSTYLE): Phaser.GameObjects.Text {
  const result = scene.add.text(x, y, content, getTextStyle(style));
  const shadow = getTextShadow(style);

  result.setShadow(shadow[0] as number, shadow[1] as number, shadow[2] as string);
  result.setScale(0.5);
  result.setOrigin(0.5, 0.5);
  result.setBackgroundColor('rgba(0, 0, 0, 0.7)');

  return result;
}

export function addTextInput(scene: InGameScene, x: number, y: number, width: number, height: number, style: TEXTSTYLE, option: InputText.IConfig): InputText {
  const result = new InputText(scene, x, y, width, height, getTextStyle(style, option));

  scene.add.existing(result);
  result.setScale(1);
  result.setOrigin(0, 0.5);

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
    frameRate: getSpriteAnimationFrameRate(animationKey),
    repeat: -1,
    delay: getSpriteAnimationDelay(animationKey),
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

function isRideAnimation(animationKey: string): boolean {
  const genders = ['boy', 'girl'];
  const directions = ['up', 'down', 'left', 'right'];
  const indices = [1, 2, 3, 4];
  const stages = [1, 2];

  return genders.some((gender) => indices.some((index) => directions.some((direction) => stages.some((stage) => animationKey === `${gender}_${index}_ride_${direction}_${stage}`))));
}

function getSpriteAnimationFrameRate(animationKey: ANIMATION | string): number {
  let ret = 8;

  if (isRideAnimation(animationKey)) {
    ret = 5;
  }

  return ret;
}

function getSpriteAnimationDelay(animationKey: ANIMATION | string): number {
  let ret = 8;

  if (isRideAnimation(animationKey)) {
    ret = 8;
  }

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
    case ANIMATION.OVERWORLD_SHADOW:
      return 1;
    case ANIMATION.PAUSE:
    case ANIMATION.PAUSE_B:
    case ANIMATION.PAUSE_W:
      return 3;
    case ANIMATION.PLAYER_MOVEMENT:
      return 23;
    case ANIMATION.PLAYER_HM:
      return 3;
    case ANIMATION.SURF:
    case ANIMATION.PLAYER_SURF:
    case ANIMATION.PLAYER_RIDE:
      return 11;
    case ANIMATION.TYPES:
    case ANIMATION.TYPES_1:
      return 17;
    case ANIMATION.POKEMON_CALL:
    case ANIMATION.POKEMON_RECALL:
      return 4;
    case ANIMATION.NPC_MOVEMENT:
    case ANIMATION.POKEMON_OVERWORLD:
      return 15;
    case ANIMATION.BAG_POCKET_BALL:
    case ANIMATION.BAG_POCKET_ETC:
    case ANIMATION.BAG_POCKET_BERRY:
    case ANIMATION.BAG_POCKET_KEY:
      return 2;
    case ANIMATION.BOY_1_BACK:
    case ANIMATION.BOY_2_BACK:
    case ANIMATION.BOY_3_BACK:
    case ANIMATION.BOY_4_BACK:
    case ANIMATION.GIRL_1_BACK:
    case ANIMATION.GIRL_2_BACK:
    case ANIMATION.GIRL_3_BACK:
    case ANIMATION.GIRL_4_BACK:
      return 4;
    case ANIMATION.POKEBALL:
      return 39;
    case ANIMATION.OVERWORLD_SHADOW_WATER:
    case ANIMATION.OVERWORLD_SHINY:
      return 2;
    case ANIMATION.EMO:
      return 15;
    case ANIMATION.SPARKLE:
      return 47;
    case ANIMATION.PARTICLE_EVOL:
      return 12;
    case 'door_1':
      return 7;
  }
}

export function getTextShadow(style: TEXTSTYLE) {
  switch (style) {
    case TEXTSTYLE.TITLE_MODAL:
      return [8, 4, '#266c58'];
    case TEXTSTYLE.DEFAULT_BLACK:
      return [5, 3, '#91919a'];
    case TEXTSTYLE.SPECIAL:
      return [5, 3, '#53a8fc'];
    case TEXTSTYLE.MESSAGE_WHITE:
    case TEXTSTYLE.MESSAGE_GRAY:
      return [3, 2, '#777777'];
    case TEXTSTYLE.SPRING:
    case TEXTSTYLE.SUMMER:
    case TEXTSTYLE.FALL:
    case TEXTSTYLE.WINTER:
    case TEXTSTYLE.SEASON_SYMBOL:
      return [0, 0, 0];
    case TEXTSTYLE.BOX_NAME:
    case TEXTSTYLE.CHOICE_DEFAULT:
    case TEXTSTYLE.MESSAGE_BLACK:
    case TEXTSTYLE.ITEM_NOTICE:
    case TEXTSTYLE.BOX_CAPTURE_TITLE:
    case TEXTSTYLE.DEFAULT:
      return [3, 2, '#91919a'];
  }

  return [0, 0, 0];
}

export function getTextStyle(style: TEXTSTYLE, inputConfig?: InputText.IConfig): any {
  let config: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: 'font_4',
  };

  if (inputConfig) Object.assign(config, inputConfig);

  switch (style) {
    case TEXTSTYLE.MESSAGE_BLACK:
      config.fontSize = '80px';
      config.color = '#4b4b4b';
      break;
    case TEXTSTYLE.MESSAGE_GRAY:
      config.fontSize = '80px';
      config.color = '#999999';
      break;
    case TEXTSTYLE.MESSAGE_WHITE:
      config.fontSize = '80px';
      config.color = '#ffffff';
      break;
    case TEXTSTYLE.MESSAGE_BLUE:
      config.fontSize = '80px';
      config.color = '#236df3';
      config.fontStyle = 'bold';
      break;
    case TEXTSTYLE.SPECIAL:
      config.fontSize = '100px';
      config.color = '#236df3';
      config.fontStyle = 'bold';
      break;
    case TEXTSTYLE.SPRING:
      config.fontFamily = 'sans-serif';
      config.color = '#bafa67';
      config.fontStyle = 'bold';
      config.fontSize = '80px';
      break;
    case TEXTSTYLE.SUMMER:
      config.fontFamily = 'sans-serif';
      config.color = '#7dcffb';
      config.fontStyle = 'bold';
      config.fontSize = '80px';
      break;
    case TEXTSTYLE.FALL:
      config.fontFamily = 'sans-serif';
      config.color = '#f69f76';
      config.fontStyle = 'bold';
      config.fontSize = '80px';
      break;
    case TEXTSTYLE.WINTER:
      config.fontFamily = 'sans-serif';
      config.color = '#f2dbfc';
      config.fontStyle = 'bold';
      config.fontSize = '80px';
      break;
    case TEXTSTYLE.SEASON_SYMBOL:
      config.fontSize = '80px';
      config.fontStyle = 'bold';
      config.color = '#ffffff';
      break;
    case TEXTSTYLE.LOBBY_INPUT:
      config.fontSize = '13px';
      config.color = '#4b4b4b';
      break;
    case TEXTSTYLE.BAG_DESC:
      config.fontSize = '55px';
      config.color = '#ffffff';
      break;
    case TEXTSTYLE.BAG_REGISTER:
      config.fontSize = '80px';
      config.color = '#53a8fc';
      config.fontStyle = 'bold';
      break;
    case TEXTSTYLE.ITEM_NOTICE:
      config.fontSize = '100px';
      config.color = '#ffffff';
      break;
    case TEXTSTYLE.CHOICE_DEFAULT:
      config.fontSize = '50px';
      config.color = '#ffffff';
      break;
    case TEXTSTYLE.BOX_POKEDEX:
      config.fontSize = '50px';
      config.color = '#ffffff';
      break;
    case TEXTSTYLE.BOX_NAME:
      config.fontSize = '80px';
      config.color = '#4b4b4b';
      break;
    case TEXTSTYLE.INPUT_GUIDE_WHITE:
      config.fontSize = '50px';
      config.color = '#ffffff';
      break;
    case TEXTSTYLE.GENDER_0:
      config.fontSize = '80px';
      config.color = '#53a8fc';
      config.fontStyle = 'bold';
      break;
    case TEXTSTYLE.GENDER_1:
      config.fontSize = '80px';
      config.color = '#fc5353';
      config.fontStyle = 'bold';
      break;
    case TEXTSTYLE.BOX_CAPTURE_TITLE:
      config.fontSize = '80px';
      config.color = '#ffffff';
      break;
    case TEXTSTYLE.DEFAULT:
      config.fontSize = '80px';
      config.color = '#505058';
      config.fontStyle = 'bold';
      break;
    case TEXTSTYLE.DEFAULT_GRAY:
      config.fontSize = '60px';
      config.color = '#b0b0b0';
      break;
    case TEXTSTYLE.DEFAULT_BLACK:
      config.fontSize = '100px';
      config.color = '#505058';
      config.fontStyle = 'bold';
      break;
    case TEXTSTYLE.TITLE_MODAL:
      config.fontSize = '150px';
      config.color = '#40a174';
      config.fontStyle = 'bold';
      break;
  }

  return config;
}

export function getRealBounds(image: Phaser.GameObjects.Image, scene: InGameScene): { x: number; y: number; width: number; height: number } {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const textureKey = image.texture.key;

  if (!ctx) return { x: 0, y: 0, width: image.width, height: image.height };

  const texture = scene.textures.get(textureKey);
  const source = texture.getSourceImage() as HTMLImageElement;

  canvas.width = source.width;
  canvas.height = source.height;
  ctx.drawImage(source, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let minX = canvas.width,
    minY = canvas.height,
    maxX = 0,
    maxY = 0;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4;
      const alpha = data[index + 3];

      if (alpha > 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

export function runFlashEffect(scene: InGameScene, delay: number): Promise<void> {
  return new Promise((resolve) => {
    scene.cameras.main.flash(delay, 255, 255, 255);
    scene.cameras.main.once('cameraflashcomplete', () => {
      resolve();
    });
  });
}

export function runZoomEffect(scene: InGameScene, value: number, delay: number, ease: EASE): Promise<void> {
  return new Promise((resolve) => {
    scene.tweens.add({
      targets: scene.cameras.main,
      zoom: value,
      duration: delay,
      ease: ease,
      onComplete: () => {
        resolve();
      },
    });
  });
}

export function runFadeEffect(scene: InGameScene, delay: number, status: 'in' | 'out'): Promise<void> {
  return new Promise((resolve) => {
    const camera = scene.cameras.main;

    if (status === 'in') {
      camera.fadeIn(delay, 0, 0, 0);
      camera.once('camerafadeincomplete', () => resolve());
    } else {
      camera.fadeOut(delay, 0, 0, 0);
      camera.once('camerafadeoutcomplete', () => resolve());
    }
  });
}

export function runWipeRifghtToLeftEffect(scene: InGameScene) {
  startPostPipeline(scene, PIPELINES.WIPE_RIGHTLEFT_SHADER);
}

export function moveToCamera(scene: InGameScene, x: number, y: number, delay: number, ease: EASE): Promise<void> {
  return new Promise((resolve) => {
    const camera = scene.cameras.main;
    camera.pan(x, y, delay, ease);
    camera.once('camerapancomplete', () => {
      console.log('move to finish?');
      resolve();
    });
  });
}

export function stopPostPipeline(scene: InGameScene): Promise<void> {
  return new Promise((resolve) => {
    scene.cameras.main.resetPostPipeline();
    resolve();
  });
}

export function startPostPipeline(scene: InGameScene, pipelineKey: PIPELINES) {
  scene.cameras.main.setPostPipeline(pipelineKey);
}

export function delay(scene: InGameScene, time: number): Promise<void> {
  return new Promise((resolve) => {
    scene.time.delayedCall(time, resolve);
  });
}

export function startModalAnimation(scene: InGameScene, target: any, duration: number = 700, y: number = 48) {
  scene.tweens.add({
    targets: target,
    duration: duration,
    ease: EASE.SINE_EASEINOUT,
    y: `-=${y}`,
    alpha: 1,
  });
}

export function playSound(scene: InGameScene | LoadingScene, key: AUDIO, volume: number = 1, loop: boolean = false) {
  scene.sound.play(key, {
    volume: volume,
    loop: loop,
  });
}

export function pauseSound(scene: InGameScene, onoff: boolean) {
  if (onoff) {
    scene.sound.pauseAll();
  } else {
    scene.sound.resumeAll();
  }
}

export function findEventTile(tiles: Phaser.Tilemaps.Tile[] | null) {
  let ret: string | null = null;

  if (!tiles) return ret;

  for (const tile of tiles) {
    const event = tile.properties.event;
    if (event) {
      ret = event;
    }
  }

  return ret;
}

export const shakeEffect = (scene: InGameScene | LoadingScene, container: Phaser.GameObjects.Container, intensity = 10, duration = 50): void => {
  const originalX = container.x;

  playSound(scene, AUDIO.BUZZER, GM.getUserOption()?.getEffectVolume());

  scene.tweens.add({
    targets: container,
    x: originalX - intensity,
    duration,
    ease: EASE.POWER1,
    yoyo: true,
    repeat: 3,
    onComplete: () => {
      container.setX(originalX);
    },
  });
};

export abstract class Ui {
  protected scene: InGameScene;

  constructor(scene: InGameScene) {
    this.scene = scene;
  }

  abstract setup(data?: any): void;
  abstract show(data?: any): void;
  abstract clean(data?: any): void;
  abstract pause(onoff: boolean, data?: any): void;
  abstract handleKeyInput(...data: any[]): any;
  abstract update(time?: number, delta?: number): void;

  getWidth() {
    return this.scene.game.canvas.width;
  }

  getHeight() {
    return this.scene.game.canvas.height;
  }

  createContainer(width: number, height: number) {
    return this.scene.add.container(width, height);
  }
}
