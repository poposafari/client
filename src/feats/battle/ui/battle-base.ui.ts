import type { GameScene } from '@poposafari/scenes/game.scene';
import { DEPTH, TEXTSHADOW, TEXTSTYLE } from '@poposafari/types';
import { addBackground, addText, addWindow } from '@poposafari/utils';
import type { BattleContext } from '../battle.types';
import { BASE_WINDOW } from '../battle.constants';

export class BattleBaseUi extends Phaser.GameObjects.Container {
  private background!: GImage;
  private baseWindow!: GWindow;
  private messageText!: GText;

  constructor(scene: GameScene) {
    const { width, height } = scene.cameras.main;
    super(scene, width / 2, height / 2);
    this.setScrollFactor(0);
    this.setDepth(DEPTH.HUD + 1);
    scene.add.existing(this);
  }

  build(ctx: BattleContext): void {
    const scene = this.scene as GameScene;
    const { width, height } = scene.cameras.main;

    const bgKey = `bg_${ctx.area}_${ctx.time}`;
    this.background = addBackground(this.scene, bgKey);

    this.add(this.background);

    this.baseWindow = addWindow(
      scene,
      scene.getOption().getWindow(),
      BASE_WINDOW.x,
      BASE_WINDOW.y,
      width + 80,
      BASE_WINDOW.height,
      BASE_WINDOW.scale,
      16,
      16,
      16,
      16,
    );
    this.add(this.baseWindow);

    this.messageText = addText(
      scene,
      BASE_WINDOW.x,
      BASE_WINDOW.y,
      '',
      40,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.NONE,
    );
    this.add(this.messageText);

    this.setVisible(false);
  }

  show(): void {
    this.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
  }

  setMessage(text: string): void {
    this.messageText?.setText(text);
  }

  hideMessageBox(): void {
    (this.baseWindow as Phaser.GameObjects.Components.Visible)?.setVisible(false);
    this.messageText?.setVisible(false);
  }

  showMessageBox(): void {
    (this.baseWindow as Phaser.GameObjects.Components.Visible)?.setVisible(true);
    this.messageText?.setVisible(true);
  }

  crossfadeBackground(area: string, newTime: string, duration: number = 2000): void {
    const scene = this.scene as GameScene;
    const newKey = `bg_${area}_${newTime}`;
    if (!scene.textures.exists(newKey)) return;
    if (this.background.texture.key === newKey) return;

    const newBg = addBackground(scene, newKey);
    newBg.setAlpha(0);

    const idx = this.getIndex(this.background);
    this.addAt(newBg, idx + 1);

    const oldBg = this.background;
    this.background = newBg;

    scene.tweens.add({
      targets: newBg,
      alpha: 1,
      duration,
      ease: 'Linear',
      onComplete: () => {
        oldBg.destroy();
      },
    });
  }

  getBaseWindow(): Phaser.GameObjects.GameObject {
    return this.baseWindow;
  }

  getMessageText(): Phaser.GameObjects.Text {
    return this.messageText;
  }
}
