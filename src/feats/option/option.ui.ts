import {
  KeyGuideBarContainer,
  type KeyGuideBarOptions,
} from '@poposafari/containers/key-guide-bar.container';
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
  private inputGuide!: KeyGuideBarContainer;

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
      i18next.t('etc:option'),
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

    // KeyGuideBarContainer — 좌측 정렬, 하단 스트립 안에 배치.
    // bottomContainer 가 y=+460 으로 옮겨지므로 inputGuide 의 y 는 컨테이너 로컬 0 (스트립 세로 중앙).
    this.inputGuide = new KeyGuideBarContainer(this.scene);
    this.inputGuide.create(this.buildInputGuideOptions(width));
    this.inputGuide.setPosition(-(width / 2) + 40, 0);

    this.bottomContainer.setY(+460);
    this.bottomContainer.add([this.bottomWindow, this.inputGuide]);
  }

  /**
   * inputGuide 옵션 생성. 초기 빌드와 언어 변경 시 recreate 양쪽에서 사용.
   * i18next.t() 가 호출 시점의 현재 언어로 평가되므로, 언어가 바뀐 뒤 다시 호출하면 새 언어 텍스트로 빌드된다.
   */
  private buildInputGuideOptions(width: number): KeyGuideBarOptions {
    return {
      entries: [
        { keys: [i18next.t('etc:arrowKey')], description: i18next.t('etc:move') },
        { keys: ['Z', 'ENTER'], description: i18next.t('etc:confirm') },
        { keys: ['X', 'ESC'], description: i18next.t('etc:cancel') },
      ],
      keycapTextSize: 45,
      keycapPaddingX: 50,
      keycapPaddingY: 40,
      keycapScale: 2,
      keycapTextYOffset: -5,
      descriptionTextSize: 60,
      gapKeyToDescription: 8,
      gapBetweenEntries: 30,
      gapInsideEntry: 4,
      align: 'left',
      // 스트립이 width-20 폭으로 화면 가득 차므로, 좌·우 30px 패딩 확보.
      maxWidth: width - 60,
    };
  }

  onRefreshLanguage(): void {
    this.topTitle.setText(i18next.t('etc:option'));
    // 키캡(`방향키` 등)의 폭이 언어에 따라 달라지므로 전체 재빌드한다.
    // recreate 는 컨테이너의 transform(setPosition) 을 유지하므로 좌표 재지정 불필요.
    this.inputGuide.recreate(this.buildInputGuideOptions(this.scene.cameras.main.width));
  }

  show(): void {
    // this.bg.setTexture(getBackgroundKey());
    super.show();
  }
}
