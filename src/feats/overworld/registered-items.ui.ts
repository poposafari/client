import { BaseUi } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, KEY, SFX, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addImage, addText } from '@poposafari/utils';
import i18next from '@poposafari/i18n';

const RADIUS = 160;
const ICON_SCALE = 4;

export class RegisteredItemsUi extends BaseUi {
  scene: GameScene;

  private slots: Phaser.GameObjects.Image[] = [];
  private label!: Phaser.GameObjects.Text;
  private itemIds: string[] = [];
  private cursorIndex = 0;

  private resolveSelection: ((itemId: string | null) => void) | null = null;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.MESSAGE);
    this.scene = scene;
    this.createLayout();
  }

  createLayout(): void {
    this.label = addText(
      this.scene,
      0,
      0,
      '',
      70,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.add(this.label);
  }

  private rebuildSlots(): void {
    for (const s of this.slots) s.destroy();
    this.slots = [];

    const n = this.itemIds.length;
    if (n === 0) return;

    for (let i = 0; i < n; i++) {
      const itemId = this.itemIds[i];
      const thetaDeg = 90 + i * (360 / n);
      const theta = (thetaDeg * Math.PI) / 180;
      const x = RADIUS * Math.cos(theta);
      const y = -RADIUS * Math.sin(theta);

      const iconTexture = this.scene.textures.exists(itemId) ? itemId : TEXTURE.BLANK;
      const icon = addImage(this.scene, iconTexture, undefined, 0, 0).setScale(0).setAlpha(0);

      this.add(icon);
      this.slots.push(icon);

      this.scene.tweens.add({
        targets: icon,
        x,
        y,
        scale: ICON_SCALE,
        alpha: 1,
        duration: 220,
        ease: 'Back.Out',
        delay: i * 30,
      });
    }

    this.add(this.label);
    this.refresh();
  }

  private refresh(): void {
    this.slots.forEach((icon, idx) => {
      if (idx === this.cursorIndex) icon.clearTint();
      else icon.setTint(0x000000);
    });
    const itemId = this.itemIds[this.cursorIndex];
    const nameKey = `item:${itemId}.name`;
    this.label.setText(i18next.exists(nameKey) ? i18next.t(nameKey) : itemId);
  }

  onInput(key: string): void {
    if (this.itemIds.length === 0) return;
    switch (key) {
      case KEY.LEFT:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.moveCursor(-1);
        break;
      case KEY.RIGHT:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.moveCursor(1);
        break;
      case KEY.Z:
      case KEY.ENTER:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.finish(this.itemIds[this.cursorIndex]);
        break;
      case KEY.X:
      case KEY.ESC:
      case KEY.A:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.finish(null);
        break;
    }
  }

  private moveCursor(delta: number): void {
    const n = this.itemIds.length;
    this.cursorIndex = (this.cursorIndex + delta + n) % n;
    this.refresh();
  }

  private finish(itemId: string | null): void {
    if (this.resolveSelection) {
      const resolve = this.resolveSelection;
      this.resolveSelection = null;
      resolve(itemId);
    }
  }

  errorEffect(_errorMsg: string): void {}

  waitForInput(): Promise<unknown> {
    return new Promise(() => {});
  }

  waitForSelect(itemIds: string[]): Promise<string | null> {
    this.itemIds = itemIds;
    this.cursorIndex = 0;
    this.rebuildSlots();
    this.show();
    return new Promise((resolve) => {
      this.resolveSelection = resolve;
    });
  }

  destroy(fromScene?: boolean): void {
    for (const s of this.slots) s.destroy();
    this.slots = [];
    super.destroy(fromScene);
  }
}
