import type InputText from 'phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText';
import InputTextClass from 'phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText';
import {
  ANIMATION,
  EASE,
  TextAlign,
  TEXTCOLOR,
  TEXTFONT,
  TEXTSHADOW,
  TEXTSTROKE,
  TEXTSTYLE,
  TEXTURE,
} from '@poposafari/types';

export function addContainer(scene: Phaser.Scene, depth: number, x: number = 0, y: number = 0) {
  const ret = scene.add.container(x, y);

  ret.setDepth(depth);
  ret.setScrollFactor(0);

  return ret;
}

export function addBackground(scene: Phaser.Scene, texture: TEXTURE) {
  const { width, height } = scene.scale;
  const ret = scene.add.image(0, 0, texture).setOrigin(0.5);
  ret.setDisplaySize(width, height);

  return ret;
}

export function addText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  content: string,
  fontSize: number,
  fontWeight: number | string,
  align: TextAlign,
  style: TEXTSTYLE,
  shadow: TEXTSHADOW,
  stroke?: TEXTSTROKE,
) {
  const ret = scene.add.text(x, y, content, getTextStyle(style, fontSize, fontWeight));

  ret.setScale(1);

  if (align === 'center') ret.setOrigin(0.5, 0.5);
  else if (align === 'left') ret.setOrigin(0, 0.5);
  else if (align === 'right') ret.setOrigin(0.5, 0);

  if (stroke) {
    const [color, weight] = getTextStroke(stroke);
    ret.setStroke(color, weight);
  } else {
    const [x, y, color] = getTextShadow(shadow);
    ret.setShadow(x, y, color);
  }

  return ret;
}

export function addObjText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  content: string,
  fontSize: number,
  color: TEXTCOLOR,
) {
  const ret = scene.add.text(x, y, content, {
    fontFamily: 'sans-serif',
    fontSize: fontSize + 'px',
    color: color,
    ...(content !== '' && { backgroundColor: TEXTCOLOR.REAL_BLACK + '80' }),
    padding: {
      left: 4,
      right: 4,
      top: 2,
      bottom: 2,
    },
  });

  ret.setOrigin(0.5, 0.5);

  return ret;
}

export function updateTextColor(text: GText, targetColor: TEXTCOLOR, targetShadow: TEXTSHADOW) {
  const [x, y, color] = getTextShadow(targetShadow);
  text.setShadow(x, y, color);
  text.setColor(targetColor);
}

export function updateRankTextColor(text: GText, rank: 'common' | 'rare' | 'epic' | 'legendary') {
  switch (rank) {
    case 'common':
      updateTextColor(text, TEXTCOLOR.WHITE, TEXTSHADOW.GRAY);
      break;
    case 'rare':
      updateTextColor(text, TEXTCOLOR.RARE, TEXTSHADOW.GRAY);
      break;
    case 'epic':
      updateTextColor(text, TEXTCOLOR.EPIC, TEXTSHADOW.GRAY);
      break;
    case 'legendary':
      updateTextColor(text, TEXTCOLOR.LEGENDARY, TEXTSHADOW.GRAY);
      break;
  }
}

export function addTextInput(
  scene: Phaser.Scene,
  x: number,
  y: number,
  fontSize: number,
  fontWeight: number | string,
  width: number,
  height: number,
  style: TEXTSTYLE,
  option: InputText.IConfig,
): InputText {
  const ret = new InputTextClass(
    scene,
    x,
    y,
    width,
    height,
    getTextStyle(style, fontSize, fontWeight, option) as InputText.IConfig,
  );

  ret.setOrigin(0, 0.5);

  return ret;
}

export function getTextStyle(
  style: TEXTSTYLE,
  fontSize: number,
  fontWeight: string | number,
  inputConfig?: InputText.IConfig,
) {
  let ret: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: TEXTFONT.BW,
    fontSize: fontSize + 'px',
    fontStyle: fontWeight.toString(),
  };

  if (inputConfig) Object.assign(ret, inputConfig);

  switch (style) {
    case TEXTSTYLE.WHITE:
      ret.color = TEXTCOLOR.WHITE;
      break;
    case TEXTSTYLE.YELLOW:
      ret.color = TEXTCOLOR.YELLOW;
      break;
    case TEXTSTYLE.BLACK:
      ret.color = TEXTCOLOR.BLACK;
      break;
    case TEXTSTYLE.SIG_0:
      ret.color = TEXTCOLOR.SIG_0;
      break;
    case TEXTSTYLE.SIG_1:
      ret.color = TEXTCOLOR.SIG_1;
      break;
    case TEXTSTYLE.ERROR:
      ret.color = TEXTCOLOR.RED;
      break;
    case TEXTSTYLE.BLOCKING:
      ret.color = TEXTCOLOR.LIGHT_GRAY;
      break;
  }

  return ret;
}

export function getTextShadow(shadow: TEXTSHADOW): [number, number, string] {
  switch (shadow) {
    case TEXTSHADOW.GRAY:
      return [4, 3, TEXTCOLOR.GRAY];
    case TEXTSHADOW.SIG_0:
      return [4, 3, TEXTCOLOR.SIG_0];
    case TEXTSHADOW.SIG_1:
      return [4, 3, TEXTCOLOR.SIG_1];
    case TEXTSHADOW.ERROR:
      return [3, 2, TEXTCOLOR.ORANGE];
    case TEXTSHADOW.DARK_YELLOW:
      return [4, 3, TEXTCOLOR.DARK_YELLOW];
    case TEXTSHADOW.BLOCKING:
      return [4, 3, TEXTCOLOR.GRAY];
    default:
      return [0, 0, ''];
  }
}

export function getTextStroke(stroke: TEXTSTROKE): [string, number] {
  switch (stroke) {
    case TEXTSTROKE.GRAY:
      return [TEXTCOLOR.GRAY, 5];
    case TEXTSTROKE.OBJ_NAME:
      return [TEXTCOLOR.BLACK, 2];
    default:
      return ['', 0];
  }
}

export function addWindow(
  scene: Phaser.Scene,
  texture: TEXTURE,
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number,
  leftWidth?: number,
  rightWidth?: number,
  topHeight?: number,
  bottomHeight?: number,
) {
  const ret = scene.add.nineslice(
    x,
    y,
    texture,
    undefined,
    width / scale,
    height / scale,
    leftWidth,
    rightWidth,
    topHeight,
    bottomHeight,
  );

  ret.setScale(scale);
  ret.setOrigin(0.5, 0.5);

  return ret;
}

export function addImage(
  scene: Phaser.Scene,
  texture: string,
  frame: string | number | undefined,
  x: number,
  y: number,
): Phaser.GameObjects.Image {
  return scene.add.image(x, y, texture, frame).setOrigin(0.5);
}

export function addSprite(
  scene: Phaser.Scene,
  key: string,
  frame: string | number | undefined,
  x: number,
  y: number,
): Phaser.GameObjects.Sprite {
  return scene.add.sprite(x, y, key, frame);
}

export function runFloatEffect(
  scene: Phaser.Scene,
  target: any,
  offsetY: number = 50,
  duration: number = 700,
  delay: number = 0,
) {
  const destY = target.y;
  target.y = destY + offsetY;
  target.alpha = 0;

  scene.tweens.add({
    targets: target,
    y: destY,
    alpha: 1,
    duration: duration,
    delay: delay,
    ease: Phaser.Math.Easing.Sine.Out,
  });
}

export function runShakeEffect(
  scene: Phaser.Scene,
  target: any,
  intensity: number = 10, // 강도
  duration: number = 50, // 한 번 흔들리는 시간(ms)
  repeat: number = 3,
  onComplete?: () => void,
) {
  scene.tweens.killTweensOf(target);

  if (target.getData('originalX') === undefined) {
    target.setData('originalX', target.x);
  }

  const originalX = target.getData('originalX');

  target.x = originalX;

  scene.tweens.add({
    targets: target,
    x: originalX - intensity,
    duration: duration,
    ease: EASE.POWER1,
    yoyo: true,
    repeat: repeat,
    onComplete: () => {
      target.x = originalX;
      if (onComplete) onComplete();
    },
  });
}

export function createSpriteAnimation(
  scene: Phaser.Scene,
  key: TEXTURE | string,
  animation: ANIMATION | string,
  frames?: Phaser.Types.Animations.AnimationFrame[],
) {
  const result = scene.anims.create({
    key: key,
    frames: frames ? frames : getSpriteAnimationFrames(scene, key, animation),
    frameRate: getSpriteAnimationFrameRate(animation),
    delay: getSpriteAnimationFrameDelay(animation),
    repeat: getSpriteAnimationFrameRepeat(animation),
    yoyo: getSpriteAnimationFrameYoyo(animation),
  });

  return result ? true : false;
}

/**
 * 텍스처의 특정 프레임 이름들로 애니메이션 생성 (pokemon.icon 등 _0, _1 패킹용).
 * @param animationKey Phaser anims에 등록될 키
 * @param frameNames 프레임 이름 배열 (예: ['0214-mega_0', '0214-mega_1'])
 */
export function createAnimationFromFrameNames(
  scene: Phaser.Scene,
  textureKey: string,
  animationKey: string,
  frameNames: string[],
  frameRate = 6,
  repeat = -1,
): boolean {
  if (frameNames.length === 0) return false;
  const frames = frameNames.map((frame) => ({ key: textureKey, frame }));
  const result = scene.anims.create({
    key: animationKey,
    frames,
    frameRate,
    repeat,
  });
  return result != null;
}

export function getSpriteAnimationFrames(
  scene: Phaser.Scene,
  key: TEXTURE | string,
  animationKey: ANIMATION | string,
) {
  const ret = scene.anims.generateFrameNames(key, {
    prefix: animationKey + '-',
    suffix: '',
    start: 0,
    end: getSpriteAnimationFrameSize(animationKey),
  });

  return ret;
}

/** 로딩에서 사용하는 _0, _1 접미사 제거 (player_overworld_walk_down_0 → player_overworld_walk_down) */
function normalizeOverworldAnimationKey(animation: ANIMATION | string): string {
  const s = String(animation);
  const m = s.match(/^(.+)_[01]$/);
  return m ? m[1] : s;
}

//return 값 = (해당 애니메이션 스프라이트의 프레임 총 개수 - 1)
function getSpriteAnimationFrameSize(animation: ANIMATION | string) {
  const base = normalizeOverworldAnimationKey(animation);
  let ret = 0;
  switch (base) {
    case ANIMATION.PLAYER_OVERWORLD_SKIN:
      ret = 79;
      break;
    case ANIMATION.PLAYER_OVERWORLD_WALK_DOWN:
    case ANIMATION.PLAYER_OVERWORLD_WALK_LEFT:
    case ANIMATION.PLAYER_OVERWORLD_WALK_RIGHT:
    case ANIMATION.PLAYER_OVERWORLD_WALK_UP:
      ret = 4;
      break;
    case ANIMATION.PLAYER_OVERWORLD_RUNNING_DOWN:
    case ANIMATION.PLAYER_OVERWORLD_RUNNING_LEFT:
    case ANIMATION.PLAYER_OVERWORLD_RUNNING_RIGHT:
    case ANIMATION.PLAYER_OVERWORLD_RUNNING_UP:
      ret = 0;
      break;
    case ANIMATION.PLAYER_BACK_SKIN:
      ret = 4;
      break;
    case ANIMATION.DOOR:
      ret = 7;
      break;
  }
  return ret;
}

function getSpriteAnimationFrameRate(animation: ANIMATION | string) {
  const base = normalizeOverworldAnimationKey(animation);
  let ret = 0;
  switch (base) {
    case ANIMATION.PLAYER_OVERWORLD_WALK_DOWN:
    case ANIMATION.PLAYER_OVERWORLD_WALK_LEFT:
    case ANIMATION.PLAYER_OVERWORLD_WALK_RIGHT:
    case ANIMATION.PLAYER_OVERWORLD_WALK_UP:
      ret = 7;
      break;
    case ANIMATION.PLAYER_OVERWORLD_RUNNING_DOWN:
    case ANIMATION.PLAYER_OVERWORLD_RUNNING_LEFT:
    case ANIMATION.PLAYER_OVERWORLD_RUNNING_RIGHT:
    case ANIMATION.PLAYER_OVERWORLD_RUNNING_UP:
      ret = 8;
      break;
    case ANIMATION.PLAYER_OVERWORLD_RIDE_DOWN:
    case ANIMATION.PLAYER_OVERWORLD_RIDE_LEFT:
    case ANIMATION.PLAYER_OVERWORLD_RIDE_RIGHT:
    case ANIMATION.PLAYER_OVERWORLD_RIDE_UP:
      ret = 2;
      break;
    case ANIMATION.PLAYER_OVERWORLD_SURF_DOWN:
    case ANIMATION.PLAYER_OVERWORLD_SURF_LEFT:
    case ANIMATION.PLAYER_OVERWORLD_SURF_RIGHT:
    case ANIMATION.PLAYER_OVERWORLD_SURF_UP:
      break;
    case ANIMATION.DOOR:
      ret = 10;
      break;
  }
  return ret;
}

function getSpriteAnimationFrameDelay(animation: ANIMATION | string) {
  let ret = 0;

  switch (animation) {
    case ANIMATION.PLAYER_OVERWORLD_WALK_DOWN:
    case ANIMATION.PLAYER_OVERWORLD_WALK_LEFT:
    case ANIMATION.PLAYER_OVERWORLD_WALK_RIGHT:
    case ANIMATION.PLAYER_OVERWORLD_WALK_UP:
    case ANIMATION.PLAYER_OVERWORLD_RUNNING_DOWN:
    case ANIMATION.PLAYER_OVERWORLD_RUNNING_LEFT:
    case ANIMATION.PLAYER_OVERWORLD_RUNNING_RIGHT:
    case ANIMATION.PLAYER_OVERWORLD_RUNNING_UP:
      ret = 10;
      break;
    case ANIMATION.PLAYER_OVERWORLD_RIDE_DOWN:
    case ANIMATION.PLAYER_OVERWORLD_RIDE_LEFT:
    case ANIMATION.PLAYER_OVERWORLD_RIDE_RIGHT:
    case ANIMATION.PLAYER_OVERWORLD_RIDE_UP:
      ret = 50;
      break;
    case ANIMATION.PLAYER_OVERWORLD_SURF_DOWN:
    case ANIMATION.PLAYER_OVERWORLD_SURF_LEFT:
    case ANIMATION.PLAYER_OVERWORLD_SURF_RIGHT:
    case ANIMATION.PLAYER_OVERWORLD_SURF_UP:
      break;
  }

  return ret;
}

function getSpriteAnimationFrameRepeat(animation: ANIMATION | string) {
  const base = normalizeOverworldAnimationKey(animation);
  let ret = 0;
  switch (base) {
    case ANIMATION.PLAYER_OVERWORLD_WALK_DOWN:
    case ANIMATION.PLAYER_OVERWORLD_WALK_LEFT:
    case ANIMATION.PLAYER_OVERWORLD_WALK_RIGHT:
    case ANIMATION.PLAYER_OVERWORLD_WALK_UP:
    case ANIMATION.PLAYER_OVERWORLD_RUNNING_DOWN:
    case ANIMATION.PLAYER_OVERWORLD_RUNNING_LEFT:
    case ANIMATION.PLAYER_OVERWORLD_RUNNING_RIGHT:
    case ANIMATION.PLAYER_OVERWORLD_RUNNING_UP:
    case ANIMATION.PLAYER_OVERWORLD_RIDE_DOWN:
    case ANIMATION.PLAYER_OVERWORLD_RIDE_LEFT:
    case ANIMATION.PLAYER_OVERWORLD_RIDE_RIGHT:
    case ANIMATION.PLAYER_OVERWORLD_RIDE_UP:
    case ANIMATION.PLAYER_OVERWORLD_SURF_DOWN:
    case ANIMATION.PLAYER_OVERWORLD_SURF_LEFT:
    case ANIMATION.PLAYER_OVERWORLD_SURF_RIGHT:
    case ANIMATION.PLAYER_OVERWORLD_SURF_UP:
      ret = -1;
      break;
  }
  return ret;
}

function getSpriteAnimationFrameYoyo(animation: ANIMATION | string) {
  let ret = false;

  switch (animation) {
  }

  return ret;
}

const BACKGROUND_KEY = [TEXTURE.BG_2, TEXTURE.BG_4, TEXTURE.BG_5] as const;

// dawn : 6:00 ~ 6:59
// day : 7:00 ~ 17:59
// dusk : 18:00 ~ 18:59
// night : 19:00 ~ 5:59
const DUSK_HOUR_START = 18;
const DAWN_HOUR_START = 6;
const NIGHT_HOUR_START = 19;
const DAY_HOUR_START = 7;

export function getBackgroundKey(): TEXTURE {
  const hour = new Date().getHours();
  if (hour >= NIGHT_HOUR_START || hour < DAWN_HOUR_START) return BACKGROUND_KEY[2];
  if (
    (hour >= DUSK_HOUR_START && hour < NIGHT_HOUR_START) ||
    (hour >= DAWN_HOUR_START && hour < DAY_HOUR_START)
  ) {
    return BACKGROUND_KEY[1];
  }
  return BACKGROUND_KEY[0];
}
