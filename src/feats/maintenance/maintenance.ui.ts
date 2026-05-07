import { BaseUi, IInputHandler } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addBackground, addText, getBackgroundKey } from '@poposafari/utils';
import i18next from 'i18next';

export class MaintenanceUi extends BaseUi implements IInputHandler {
  scene!: GameScene;

  private bg!: GImage;
  private titleText!: GText;
  private descText!: GText;
  private hintText!: GText;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.API);
    this.scene = scene;
    this.createLayout();
  }

  onInput(_key: string): void {}

  errorEffect(_errorMsg: string): void {
    throw new Error('Method not implemented.');
  }

  waitForInput(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  createLayout(): void {
    this.bg = addBackground(this.scene, TEXTURE.BG_0);

    this.titleText = addText(
      this.scene,
      0,
      -120,
      i18next.t('etc:maintenance_title'),
      80,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    this.descText = addText(
      this.scene,
      0,
      40,
      i18next.t('etc:maintenance_desc'),
      48,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    this.hintText = addText(
      this.scene,
      0,
      180,
      i18next.t('etc:maintenance_refresh_hint'),
      36,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    this.add([this.bg, this.titleText, this.descText, this.hintText]);
  }

  show(): void {
    this.bg.setTexture(getBackgroundKey());
    super.show();
  }

  onRefreshLanguage(): void {
    this.titleText.setText(i18next.t('etc:maintenance_title'));
    this.descText.setText(i18next.t('etc:maintenance_desc'));
    this.hintText.setText(i18next.t('etc:maintenance_refresh_hint'));
  }
}
