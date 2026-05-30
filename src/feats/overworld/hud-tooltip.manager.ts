import { GameScene } from '@poposafari/scenes';
import { TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addContainer, addText, addWindow } from '@poposafari/utils';
import i18next from 'i18next';

const TOOLTIP = {
  windowScale: 2,
  nineSlice: { left: 16, right: 16, top: 16, bottom: 16 },
  paddingX: 20,
  paddingY: 20,
  fontSize: 60,
  lineGap: 8,
  cursorOffsetX: 10,
  cursorOffsetY: 8,
  edgeMargin: 12,
} as const;

type Hoverable = Phaser.GameObjects.GameObject & {
  visible: boolean;
  parentContainer: GContainer | null;
  getBounds?: () => Phaser.Geom.Rectangle;
};

export type TooltipContent = string | (() => string);

export class HudTooltipManager {
  private scene: GameScene;
  private parent: GContainer;
  private entries = new Map<Hoverable, TooltipContent>();

  private container!: GContainer;
  private window!: GWindow;
  private nameText!: GText;
  private descText!: GText;

  private currentTarget: Hoverable | null = null;
  private destroyed = false;

  constructor(scene: GameScene, parent: GContainer) {
    this.scene = scene;
    this.parent = parent;
    this.createTooltip();

    this.scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
  }

  private createTooltip(): void {
    this.container = addContainer(this.scene, 0, 0, 0);

    this.window = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      0,
      120,
      48,
      TOOLTIP.windowScale,
      TOOLTIP.nineSlice.left,
      TOOLTIP.nineSlice.right,
      TOOLTIP.nineSlice.top,
      TOOLTIP.nineSlice.bottom,
    );
    this.window.setOrigin(0, 0);

    this.nameText = addText(
      this.scene,
      TOOLTIP.paddingX,
      TOOLTIP.paddingY,
      '',
      TOOLTIP.fontSize,
      '100',
      'left',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    );
    this.nameText.setOrigin(0, 0);

    this.descText = addText(
      this.scene,
      TOOLTIP.paddingX,
      TOOLTIP.paddingY,
      '',
      TOOLTIP.fontSize,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.descText.setOrigin(0, 0);

    this.container.add([this.window, this.nameText, this.descText]);
    this.container.setVisible(false);
    this.parent.add(this.container);
  }

  register(target: Hoverable, content: TooltipContent): void {
    if (!target || this.entries.has(target)) return;
    this.entries.set(target, content);
    target.once(Phaser.GameObjects.Events.DESTROY, () => this.unregister(target));
  }

  unregister(target: Hoverable): void {
    if (!this.entries.has(target)) return;
    this.entries.delete(target);
    if (this.currentTarget === target) {
      this.currentTarget = null;
      this.hide();
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.destroyed) return;
    if (!this.parent.visible) {
      if (this.currentTarget) {
        this.currentTarget = null;
        this.hide();
      }
      return;
    }

    const hit = this.findHitTarget(pointer);

    if (hit !== this.currentTarget) {
      this.currentTarget = hit;
      if (hit) this.show(this.entries.get(hit)!, pointer);
      else this.hide();
    } else if (hit) {
      this.updatePosition(pointer);
    }
  }

  private findHitTarget(pointer: Phaser.Input.Pointer): Hoverable | null {
    for (const target of this.entries.keys()) {
      if (!this.isVisibleChain(target)) continue;
      const bounds = target.getBounds?.();
      if (!bounds) continue;
      if (Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y)) {
        return target;
      }
    }
    return null;
  }

  private isVisibleChain(target: Hoverable): boolean {
    if (!target.visible) return false;
    let p: GContainer | null = target.parentContainer;
    while (p) {
      if (!p.visible) return false;
      p = p.parentContainer;
    }
    return true;
  }

  private show(content: TooltipContent, pointer: Phaser.Input.Pointer): void {
    const label = typeof content === 'function' ? content() : i18next.t(content);
    if (!label) {
      this.hide();
      return;
    }

    const newlineIdx = label.indexOf('\n');
    const name = newlineIdx === -1 ? label : label.slice(0, newlineIdx);
    const desc = newlineIdx === -1 ? '' : label.slice(newlineIdx + 1);

    this.nameText.setText(name);
    this.descText.setText(desc);
    this.descText.setVisible(!!desc);

    const nameH = this.nameText.height;
    this.descText.setY(TOOLTIP.paddingY + nameH + (desc ? TOOLTIP.lineGap : 0));

    const contentW = Math.max(this.nameText.width, desc ? this.descText.width : 0);
    const descBlockH = desc ? TOOLTIP.lineGap + this.descText.height : 0;
    const w = contentW + TOOLTIP.paddingX * 2;
    const h = nameH + descBlockH + TOOLTIP.paddingY * 2;

    this.window.setSize(w / TOOLTIP.windowScale, h / TOOLTIP.windowScale);
    this.window.setTexture(this.scene.getOption().getWindow());
    this.updatePosition(pointer);
    this.parent.bringToTop(this.container);
    this.container.setVisible(true);
  }

  private updatePosition(pointer: Phaser.Input.Pointer): void {
    const { width, height } = this.scene.cameras.main;
    const halfW = width / 2;
    const halfH = height / 2;

    const tooltipW = this.window.displayWidth;
    const tooltipH = this.window.displayHeight;

    let screenX = pointer.x + TOOLTIP.cursorOffsetX;
    let screenY = pointer.y + TOOLTIP.cursorOffsetY;

    if (screenX + tooltipW + TOOLTIP.edgeMargin > width) {
      screenX = pointer.x - tooltipW - TOOLTIP.cursorOffsetX;
    }
    if (screenY + tooltipH + TOOLTIP.edgeMargin > height) {
      screenY = pointer.y - tooltipH - TOOLTIP.cursorOffsetY;
    }

    this.container.setPosition(screenX - halfW, screenY - halfH);
  }

  private hide(): void {
    this.container.setVisible(false);
  }

  destroy(): void {
    this.destroyed = true;
    this.scene.input.off(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
    this.entries.clear();
    this.currentTarget = null;
    this.container.destroy();
  }
}
