export interface ScreenFadeOptions {
  duration?: number;
  r?: number;
  g?: number;
  b?: number;
  camera?: Phaser.Cameras.Scene2D.Camera;
}

const DEFAULT_DURATION = 400;

export function screenFadeIn(scene: Phaser.Scene, options: ScreenFadeOptions = {}): Promise<void> {
  const { duration = DEFAULT_DURATION, r = 0, g = 0, b = 0, camera = scene.cameras.main } = options;

  return new Promise((resolve) => {
    camera.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => resolve());
    camera.fadeIn(duration, r, g, b);
  });
}

export function screenFadeOut(scene: Phaser.Scene, options: ScreenFadeOptions = {}): Promise<void> {
  const { duration = DEFAULT_DURATION, r = 0, g = 0, b = 0, camera = scene.cameras.main } = options;

  return new Promise((resolve) => {
    camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => resolve());
    camera.fadeOut(duration, r, g, b);
  });
}
