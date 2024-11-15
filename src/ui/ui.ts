import InputText from 'phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText';

import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { TEXTSTYLE } from '../enums/textstyle';

export function addWindow(scene: InGameScene, texture: TEXTURE, x: number, y: number, width: number, height: number) {
  const ret = scene.add.nineslice(x, y, texture, undefined, width, height, 6, 6, 6, 6);
  ret.setOrigin(0.5, 0.5);

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

  result.setShadow(1, 0, getTextShadow(style));
  result.setScale(0.5);
  result.setOrigin(0.5, 0.5);

  return result;
}

export function addTextInput(scene: InGameScene, x: number, y: number, width: number, height: number, style: TEXTSTYLE, option: InputText.IConfig): InputText {
  const result = new InputText(scene, x, y, width, height, getTextStyle(style, option));

  scene.add.existing(result);
  result.setScale(1);

  return result;
}

function getTextShadow(style: TEXTSTYLE) {
  let ret;

  switch (style) {
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
      config.fontSize = '54px';
      config.color = '#4b4b4b';
      break;
    case TEXTSTYLE.MESSAGE_WHITE:
      config.fontSize = '54px';
      config.color = '#ffffff';
      break;
  }

  return config;
}

export abstract class UI {
  protected scene: InGameScene;

  constructor(scene: InGameScene) {
    this.scene = scene;
  }

  abstract setup(): void;
  abstract show(): void;
  abstract clean(): void;
  abstract pause(onoff: boolean): void;

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
