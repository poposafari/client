import i18next from 'i18next';
import { OBJECT, TEXTSTYLE, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { NoticeUi } from '../uis/notice-ui';
import { OverworldObj } from './overworld-obj';
import { replacePercentSymbol } from '../utils/string-util';
import { OVERWORLD_ZOOM } from '../constants';

export class SignOverworldObj extends OverworldObj {
  private noticeUi: NoticeUi;
  private script: string;
  private scriptKey: string | null = null;
  private scriptParams: string[] | null = null;
  private window: TEXTURE;
  private textStyle?: TEXTSTYLE;

  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, name: string, script: string, window: TEXTURE, textStyle?: TEXTSTYLE) {
    super(scene, texture, x, y, name, OBJECT.SIGN);

    this.noticeUi = new NoticeUi(scene);
    this.noticeUi.setup(OVERWORLD_ZOOM);

    this.getShadow().setVisible(false);

    if (script && (script.startsWith('menu:') || script.startsWith('npc:'))) {
      this.scriptKey = script;
      this.scriptParams = null;
      this.script = i18next.t(script);
    } else {
      this.script = script;
    }

    this.window = window;
    this.textStyle = textStyle;
  }

  setScriptKey(key: string, params?: string[]) {
    this.scriptKey = key;
    this.scriptParams = params || null;
    this.updateScript();
  }

  updateScript() {
    if (this.scriptKey) {
      if (this.scriptParams && this.scriptParams.length > 0) {
        const translatedParams = this.scriptParams.map((param) => i18next.t(param));
        this.script = replacePercentSymbol(i18next.t(this.scriptKey), translatedParams);
      } else {
        this.script = i18next.t(this.scriptKey);
      }
    }
  }

  async reaction(): Promise<void> {
    await this.noticeUi.show({ content: this.script, window: this.window, textStyle: this.textStyle });
  }
}
