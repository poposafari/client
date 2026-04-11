import { DEPTH, TEXTURE } from '@poposafari/types';

const SHINY_ANIM_KEY = 'battle_shiny_sparkle';

function ensureSparkleAnim(scene: Phaser.Scene): boolean {
  if (scene.anims.exists(SHINY_ANIM_KEY)) return true;
  if (!scene.textures.exists(TEXTURE.SPARKLE)) return false;

  const frameNames = scene.textures
    .get(TEXTURE.SPARKLE)
    .getFrameNames()
    .sort((a, b) => {
      const na = parseInt(a.replace(/\D+/g, ''), 10);
      const nb = parseInt(b.replace(/\D+/g, ''), 10);
      if (Number.isNaN(na) || Number.isNaN(nb)) return a.localeCompare(b);
      return na - nb;
    });
  if (frameNames.length === 0) return false;

  scene.anims.create({
    key: SHINY_ANIM_KEY,
    frames: frameNames.map((frame) => ({ key: TEXTURE.SPARKLE, frame })),
    frameRate: 24,
    repeat: 0,
  });
  return true;
}

export async function playShinySparkle(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Image,
): Promise<void> {
  if (!ensureSparkleAnim(scene)) return;

  const cx = target.x + (target.parentContainer?.x ?? 0);
  const cy = target.y + (target.parentContainer?.y ?? 0);

  const sparkle = scene.add
    .sprite(cx, cy, TEXTURE.SPARKLE)
    .setScrollFactor(0)
    .setDepth(DEPTH.HUD + 5)
    .setScale(4);

  sparkle.setDisplaySize(500, 500);

  await new Promise<void>((resolve) => {
    sparkle.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => resolve());
    sparkle.play(SHINY_ANIM_KEY);
  });
  sparkle.destroy();
}
