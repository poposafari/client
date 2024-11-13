import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';

export function addWindow(scene: InGameScene, texture: TEXTURE, x: number, y: number, width: number, height: number) {
  const ret = scene.add.nineslice(x, y, texture, undefined, width, height, 6, 6, 6, 6);
  ret.setOrigin(0.5, 0.5);

  return ret;
}

export function addBackground(
  scene: InGameScene,
  texture: TEXTURE,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const ret = scene.add
    .image(0, 0, TEXTURE.BG_LOBBY)
    .setOrigin(0, 0)
    .setDisplaySize(width / 2, height / 2);

  return ret;
}

export abstract class UI {
  protected scene: InGameScene;

  constructor(scene: InGameScene) {
    this.scene = scene;
  }

  abstract setup(): void;
  abstract show(): void;
  abstract clean(): void;
  abstract pause(): void;

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
