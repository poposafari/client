import { BaseUi, IInputHandler, IRefreshableLanguage } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addBackground, addText } from '@poposafari/utils';
import i18next from '@poposafari/i18n';

export class OverworldEntryUi extends BaseUi {
  private bg!: GImage;
  private text!: GText;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.MESSAGE + 1);
    this.createLayout();
  }

  onInput(_key: string): void {}

  errorEffect(_errorMsg: string): void {}

  waitForInput(): Promise<never> {
    return new Promise(() => {});
  }

  createLayout(): void {
    this.bg = addBackground(this.scene, TEXTURE.BG_BLACK);
    this.text = addText(
      this.scene,
      0,
      0,
      i18next.t('msg:mapPreparing'),
      80,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.add([this.bg, this.text]);
  }

  setMessage(msgKey: string): void {
    this.text.setText(i18next.t(msgKey));
  }
}
