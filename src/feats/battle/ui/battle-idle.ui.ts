import i18next from 'i18next';
import { BaseUi, IInputHandler, InputManager } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, KEY, SFX, TEXTCOLOR, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addImage, addText, addWindow } from '@poposafari/utils';
import type { BattleAction } from '../battle.types';
import { COMMAND_MENU } from '../battle.constants';

const LABEL_KEYS = [
  'menu:battleSelectBall',
  'menu:battleSelectFeed',
  'menu:battleSelectMud',
  'menu:battleSelectRun',
] as const;

export class BattleIdleUi extends BaseUi implements IInputHandler {
  scene: GameScene;

  private window!: Phaser.GameObjects.NineSlice;
  private menuTexts: Phaser.GameObjects.Text[] = [];
  private cursor!: Phaser.GameObjects.Image;

  private cursorIndex = 0;
  private resolver: ((action: BattleAction) => void) | null = null;
  private ballDisabled = false;
  private onCursorChange: ((action: BattleAction) => void) | null = null;

  constructor(scene: GameScene, inputManager: InputManager) {
    super(scene, inputManager, DEPTH.MESSAGE_TOP + 1);
    this.scene = scene;
    this.createLayout();
  }

  createLayout(): void {
    const { width, height } = this.scene.cameras.main;

    this.setPosition(
      width / 2 + COMMAND_MENU.containerXOffset,
      height / 2 + COMMAND_MENU.containerYOffset,
    );

    this.window = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      COMMAND_MENU.windowOffset.x,
      COMMAND_MENU.windowOffset.y,
      COMMAND_MENU.windowWidth,
      COMMAND_MENU.windowHeight,
      COMMAND_MENU.windowScale,
      16,
      16,
      16,
      16,
    );
    this.add(this.window);

    for (let i = 0; i < 4; i++) {
      const slot = COMMAND_MENU.slots[i];
      const text = addText(
        this.scene,
        slot.x,
        slot.y,
        i18next.t(LABEL_KEYS[i]),
        70,
        '100',
        'left',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.GRAY,
      );
      this.menuTexts.push(text);
      this.add(text);
    }

    this.cursor = addImage(this.scene, TEXTURE.CURSOR_WHITE, undefined, 0, 0).setScale(2.4);
    this.add(this.cursor);

    this.refreshCursor();
  }

  setOnCursorChange(cb: ((action: BattleAction) => void) | null): void {
    this.onCursorChange = cb;
  }

  waitForInput(): Promise<BattleAction> {
    this.show();
    this.onCursorChange?.(this.indexToAction(this.cursorIndex));
    return new Promise<BattleAction>((resolve) => {
      this.resolver = resolve;
    });
  }

  onInput(key: string): void {
    switch (key) {
      case KEY.UP:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.moveCursor(0, -1);
        break;
      case KEY.DOWN:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.moveCursor(0, 1);
        break;
      case KEY.LEFT:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.moveCursor(-1, 0);
        break;
      case KEY.RIGHT:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.moveCursor(1, 0);
        break;
      case KEY.Z:
      case KEY.ENTER:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.confirmSelection();
        break;
    }
  }

  errorEffect(_errorMsg: string): void {}

  hide(): void {
    super.hide();
  }

  setBallDisabled(disabled: boolean): void {
    this.ballDisabled = disabled;
    const ballText = this.menuTexts[0];
    if (ballText) {
      ballText.setColor(disabled ? TEXTCOLOR.GRAY : TEXTCOLOR.WHITE);
    }
  }

  // ── 내부 ───────────────────────────────────────

  private moveCursor(dCol: number, dRow: number): void {
    const col = (this.cursorIndex & 1) + dCol;
    const row = (this.cursorIndex >> 1) + dRow;
    if (col < 0 || col > 1 || row < 0 || row > 1) return;
    this.cursorIndex = row * 2 + col;
    this.refreshCursor();
    this.onCursorChange?.(this.indexToAction(this.cursorIndex));
  }

  private refreshCursor(): void {
    const slot = COMMAND_MENU.slots[this.cursorIndex];

    this.cursor.setPosition(slot.x - 30, slot.y);
  }

  private confirmSelection(): void {
    if (this.cursorIndex === 0 && this.ballDisabled) {
      this.scene.getAudio().playEffect(SFX.BUZZER);
      return;
    }
    const action = this.indexToAction(this.cursorIndex);
    this.resolveWith(action);
  }

  private indexToAction(index: number): BattleAction {
    switch (index) {
      case 0:
        return { type: 'ball' };
      case 1:
        return { type: 'feed' };
      case 2:
        return { type: 'mud' };
      case 3:
      default:
        return { type: 'run' };
    }
  }

  private resolveWith(action: BattleAction): void {
    if (!this.resolver) return;
    const r = this.resolver;
    this.resolver = null;
    this.hide();
    r(action);
  }
}
