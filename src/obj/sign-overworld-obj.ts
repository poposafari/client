import i18next from 'i18next';
import { OBJECT, TEXTSTYLE, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { NoticeUi } from '../uis/notice-ui';
import { OverworldObj } from './overworld-obj';

export class SignOverworldObj extends OverworldObj {
  private noticeUi: NoticeUi;
  private script: string;
  private window: TEXTURE;
  private textStyle?: TEXTSTYLE;

  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, name: string, script: string, window: TEXTURE, textStyle?: TEXTSTYLE) {
    super(scene, texture, x, y, name, OBJECT.SIGN);

    this.noticeUi = new NoticeUi(scene);
    this.noticeUi.setup();

    this.getShadow().setVisible(false);
    this.script = script;
    this.window = window;
    this.textStyle = textStyle;
  }

  async reaction(): Promise<void> {
    await this.noticeUi.show({ content: this.script, window: this.window, textStyle: this.textStyle });
  }
}
