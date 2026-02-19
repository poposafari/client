import { GameEvent, GameScene } from '@poposafari/scenes';
import { InputManager, LanguageItmes } from '@poposafari/core';
import {
  KEY,
  SFX,
  IMenuListConfig,
  DEPTH,
  TEXTCOLOR,
  OptionKey,
  LANGUAGE_KEY,
} from '@poposafari/types';
import { MenuListUi } from '../menu/menu-list.ui';
import i18next from '@poposafari/i18n';

export interface IOptionItem {
  key: string;
  label: string;
  values: string[];
  valueIndex: number;
}

function optionItemsToMenuItems(options: IOptionItem[]) {
  return options.map((opt) => {
    const valueParts: { text: string; color?: string }[] = [];
    opt.values.forEach((val, vi) => {
      if (vi > 0) valueParts.push({ text: ' ', color: TEXTCOLOR.WHITE });
      valueParts.push({
        text: val,
        color: vi === opt.valueIndex ? TEXTCOLOR.YELLOW : TEXTCOLOR.WHITE,
      });
    });
    return {
      key: opt.key,
      label: opt.label,
      valueParts: valueParts.length > 0 ? valueParts : undefined,
    };
  });
}

export class OptionMenuUi extends MenuListUi {
  private optionData: IOptionItem[] = [];
  private changeWindows: GWindow[] = [];

  constructor(scene: GameScene, inputManager: InputManager, config: IMenuListConfig) {
    super(scene, inputManager, { ...config, showCancel: true });

    this.setDepth(DEPTH.MESSAGE + 1);
  }

  public setOptionItems(options: IOptionItem[], windows: GWindow[], preserveCursor = false) {
    const savedCursor = preserveCursor ? this.cursorIndex : 0;
    const savedScroll = preserveCursor ? this.scrollIndex : 0;

    this.optionData = options.map((o) => ({
      ...o,
      values: [...o.values],
      valueIndex: Math.max(0, Math.min(o.valueIndex, o.values.length - 1)),
    }));
    const items = optionItemsToMenuItems(this.optionData);
    this.setItems(items);
    this.changeWindows = windows;

    if (preserveCursor && this.optionData.length > 0) {
      const maxCursor = this.optionData.length - 1;
      this.cursorIndex = Math.min(savedCursor, maxCursor);
      this.scrollIndex = Math.min(
        savedScroll,
        Math.max(0, this.optionData.length - (this.config.visibleCount ?? 6)),
      );
      this.refreshList();
    }
  }

  public getOptionData(): IOptionItem[] {
    return this.optionData.map((o) => ({ ...o, values: [...o.values] }));
  }

  private syncItemsFromOptionData(): void {
    const items = optionItemsToMenuItems(this.optionData);
    const cancelItem = this.items.find((i) => i.key === 'cancel');
    this.items = cancelItem ? [...items, cancelItem] : [...items];
    this.refreshList();
  }

  protected handleCustomInput(key: string): void {
    if (this.optionData.length === 0) return;
    if (this.cursorIndex >= this.optionData.length) return;

    const opt = this.optionData[this.cursorIndex];
    if (!opt || opt.values.length === 0) return;

    if (key === KEY.LEFT) {
      this.scene.getAudio().playEffect(SFX.CURSOR_0);
      opt.valueIndex = (opt.valueIndex - 1 + opt.values.length) % opt.values.length;
      this.syncItemsFromOptionData();
      this.scene.getOption().updateOption(opt.key as OptionKey, opt.valueIndex);

      if (opt.key === OptionKey.WINDOW) {
        this.changeWindowsTexture();
      } else if (opt.key === LANGUAGE_KEY) {
        this.changeLanguage(opt.valueIndex);
      }

      return;
    }
    if (key === KEY.RIGHT) {
      this.scene.getAudio().playEffect(SFX.CURSOR_0);
      opt.valueIndex = (opt.valueIndex + 1) % opt.values.length;
      this.syncItemsFromOptionData();
      this.scene.getOption().updateOption(opt.key as OptionKey, opt.valueIndex);

      if (opt.key === OptionKey.WINDOW) {
        this.changeWindowsTexture();
      } else if (opt.key === LANGUAGE_KEY) {
        this.changeLanguage(opt.valueIndex);
      }

      return;
    }
  }

  protected selectItem(): void {
    const selected = this.items[this.cursorIndex];

    this.scene.getAudio().playEffect(SFX.CURSOR_0);

    if (selected.key === 'cancel') {
      this.cancel();
    }
  }

  private changeWindowsTexture(): void {
    this.window.setTexture(this.scene.getOption().getWindow());
    for (const window of this.changeWindows) {
      window.setTexture(this.scene.getOption().getWindow());
    }
    (this.scene as GameScene).emitEvent(GameEvent.WINDOW_CHANGED);
  }

  private changeLanguage(idx: number): void {
    const language = LanguageItmes[idx];
    i18next.changeLanguage(language).then(() => {
      (this.scene as GameScene).emitEvent(GameEvent.LANGUAGE_CHANGED);
    });
  }
}
