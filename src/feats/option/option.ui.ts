import { InputGuideContainer } from '@poposafari/containers/input-guide.container';
import { BaseUi, IInputHandler, IRefreshableLanguage } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import {
  addBackground,
  addContainer,
  addText,
  addWindow,
  getBackgroundKey,
} from '@poposafari/utils';
import i18next from 'i18next';

export class OptionUi extends BaseUi implements IInputHandler, IRefreshableLanguage {
  scene: GameScene;
  private bg!: GImage;
  private topContainer!: GContainer;
  topWindow!: GWindow;
  private topTitle!: GText;
  private bottomContainer!: GContainer;
  bottomWindow!: GWindow;
  private bottomTitle!: GText;
  private inputGuideKeycap!: InputGuideContainer;
  private inputGuideText!: GText;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.MESSAGE);
    this.scene = scene;

    const { width, height } = this.scene.cameras.main;

    this.createLayout();
    this.createTopLayout(width);
    this.createBottomLayout(width);

    this.add([this.bg, this.topContainer, this.bottomContainer]);
  }

  onInput(key: string): void {}
  errorEffect(errorMsg: string): void {}
  waitForInput(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  createLayout(): void {
    this.bg = addBackground(this.scene, TEXTURE.BLANK);
  }
  createTopLayout(width: number): void {
    this.topContainer = addContainer(this.scene, DEPTH.DEFAULT);
    this.topWindow = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      0,
      width - 20,
      140,
      4,
      16,
      16,
      16,
      16,
    );
    this.topTitle = addText(
      this.scene,
      -910,
      0,
      i18next.t('menu:option'),
      80,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    this.topContainer.setY(-460);
    this.topContainer.add([this.topWindow, this.topTitle]);
  }
  createBottomLayout(width: number): void {
    this.bottomContainer = addContainer(this.scene, DEPTH.DEFAULT);
    this.bottomWindow = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      0,
      width - 20,
      140,
      4,
      16,
      16,
      16,
      16,
    );
    this.inputGuideKeycap = new InputGuideContainer(this.scene);
    this.inputGuideKeycap.create(-870, 0, 3, 'esc', 40);
    this.inputGuideText = addText(
      this.scene,
      this.inputGuideKeycap.displayWidth + this.inputGuideKeycap.x + 50,
      0,
      i18next.t('menu:cancel'),
      60,
      '100',
      'left',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    );

    this.bottomContainer.setY(+460);
    this.bottomContainer.add([this.bottomWindow, this.inputGuideKeycap, this.inputGuideText]);
  }

  onRefreshLanguage(): void {
    this.topTitle.setText(i18next.t('menu:option'));
    this.inputGuideText.setText(i18next.t('menu:cancel'));
  }

  show(): void {
    // this.bg.setTexture(getBackgroundKey());
    super.show();
  }
}
