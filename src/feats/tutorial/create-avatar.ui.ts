import i18next from '@poposafari/i18n';
import { BaseUi, IInputHandler, IRefreshableLanguage } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import {
  CreateUserReq,
  DEPTH,
  SFX,
  SYMBOL_FEMALE,
  SYMBOL_MALE,
  TEXTSHADOW,
  TEXTSTYLE,
  TEXTURE,
} from '@poposafari/types';
import {
  addBackground,
  addContainer,
  addText,
  addTextInput,
  addWindow,
  getBackgroundKey,
  runShakeEffect,
  toGenderCode,
} from '@poposafari/utils';
import { SelectBoxContainer } from '@poposafari/containers/box-select.container';
import { ButtonContainer } from '@poposafari/containers/button.container';
import InputText from 'phaser3-rex-plugins/plugins/inputtext';
import { CostumePreview } from '@poposafari/containers/costume-preview.container';

export class CreateAvatarUi extends BaseUi implements IInputHandler, IRefreshableLanguage {
  scene: GameScene;
  private inputResolver: ((result: CreateUserReq) => void) | null = null;

  private bg!: GImage;
  private topContainer!: GContainer;
  private topWindow!: GWindow;
  private topTitle!: GText;

  private mainContainer!: GContainer;
  private mainLeftContainer!: GContainer;
  private mainWindow!: GWindow;

  private boxSkin!: SelectBoxContainer;
  private boxHair!: SelectBoxContainer;
  private boxHairColor!: SelectBoxContainer;
  private boxOutfit!: SelectBoxContainer;

  private currentGender: 'male' | 'female' = 'male';

  private mainRightContainer!: GContainer;
  private preview!: CostumePreview;
  private femaleBtn!: ButtonContainer;
  private maleBtn!: ButtonContainer;
  private createBtn!: ButtonContainer;
  private errorMsg!: GText;
  private mainRightNicknameInputWindow!: GWindow;
  private mainRightNicknameInput!: InputText;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.DEFAULT);
    this.scene = scene;
    this.createLayout();
  }

  onInput(key: string): void {}

  createLayout(): void {
    const { width, height } = this.scene.cameras.main;

    this.bg = addBackground(this.scene, TEXTURE.BG_1);
    this.createTopLayout(width);
    this.createMainLayout(width, height);

    this.topContainer.setVisible(false);
    this.mainContainer.setVisible(false);

    this.add([this.bg, this.topContainer, this.mainContainer]);

    this.femaleBtn.updateCursor(false);
    this.maleBtn.updateCursor(true);

    this.updateGender('male');
  }

  errorEffect(errorMsg: string): void {
    this.scene.getAudio().playEffect(SFX.BUZZER);

    runShakeEffect(this.scene, this.mainContainer);
    this.errorMsg.setText(errorMsg);
  }

  private createTopLayout(width: number) {
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
      i18next.t('menu:createAvatar'),
      80,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    this.topContainer.setY(-460);
    this.topContainer.add([this.topWindow, this.topTitle]);
  }

  private createMainLayout(width: number, height: number) {
    this.mainContainer = addContainer(this.scene, DEPTH.DEFAULT);
    this.mainWindow = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      0,
      width - 20,
      900,
      4,
      16,
      16,
      16,
      16,
    );

    this.createMainLeftLayout();
    this.createMainRightLayout();

    this.mainContainer.setY(+75);
    this.mainContainer.add([this.mainWindow, this.mainLeftContainer, this.mainRightContainer]);
  }

  private createMainLeftLayout() {
    this.mainLeftContainer = addContainer(this.scene, DEPTH.DEFAULT);

    const contentWidth = 500;
    const contentHeight = 195;
    const spacing = 10;

    const createBox = (x: number, y: number, titleKey: string) => {
      const box = new SelectBoxContainer(this.scene);
      box.create(contentWidth, contentHeight, i18next.t(titleKey));
      box.setPosition(x, y);
      return box;
    };

    this.boxSkin = createBox(0, 0, 'costume:skin');
    this.boxSkin.onChange = (skinId) => {
      this.preview.updateAllSkin(skinId);
    };

    this.boxHair = createBox(0, contentHeight + spacing, 'costume:hair');
    this.boxHair.onChange = (hairId) => {
      this.updateHairColorList(hairId);
      this.preview.updateAllHair(hairId);
    };

    this.boxHairColor = createBox(0, (contentHeight + spacing) * 2, 'costume:hair_color');
    this.boxHairColor.onChange = (colorId) => {
      this.preview.updateAllHairColor(colorId);
    };

    this.boxOutfit = createBox(0, (contentHeight + spacing) * 3, 'costume:outfit');
    this.boxOutfit.onChange = (outfitId) => {
      this.preview.updateAllOutfit(outfitId);
    };

    this.mainLeftContainer.add([this.boxSkin, this.boxHair, this.boxHairColor, this.boxOutfit]);
    this.mainLeftContainer.setPosition(-655, -310);
  }

  private createMainRightLayout() {
    this.mainRightContainer = addContainer(this.scene, DEPTH.DEFAULT);
    this.femaleBtn = new ButtonContainer(this.scene);
    this.maleBtn = new ButtonContainer(this.scene);
    this.createBtn = new ButtonContainer(this.scene);

    this.preview = new CostumePreview(this.scene);
    this.preview.create(5, 6);
    this.preview.setY(-180);

    this.femaleBtn.create(TEXTURE.WINDOW_0, 3, SYMBOL_FEMALE, 80, true, () => {
      this.updateGender('female');
      this.femaleBtn.updateCursor(true);
      this.maleBtn.updateCursor(false);
      this.preview.updateGender('female');
    });
    this.maleBtn.create(TEXTURE.WINDOW_0, 3, SYMBOL_MALE, 80, true, () => {
      this.updateGender('male');
      this.maleBtn.updateCursor(true);
      this.femaleBtn.updateCursor(false);
      this.preview.updateGender('male');
    });
    this.createBtn.create(TEXTURE.WINDOW_0, 2, i18next.t('menu:create'), 50, false, () => {
      this.validateAndSubmit();
    });

    this.maleBtn.setPosition(-80, +5);
    this.femaleBtn.setPosition(+80, +5);
    this.createBtn.setY(+360);
    this.preview.updateGender('male');

    this.errorMsg = addText(
      this.scene,
      -210,
      +200,
      '',
      40,
      '100',
      'left',
      TEXTSTYLE.ERROR,
      TEXTSHADOW.ERROR,
    ).setOrigin(0, 0);

    this.mainRightNicknameInputWindow = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      +140,
      450,
      80,
      2.4,
      16,
      16,
      16,
      16,
    );
    this.mainRightNicknameInput = addTextInput(
      this.scene,
      -185,
      +140,
      30,
      '100',
      350,
      70,
      TEXTSTYLE.WHITE,
      {
        type: 'text',
        placeholder: i18next.t('menu:enterYourNickname'),
        minLength: 2,
        maxLength: 12,
      },
    );

    this.mainRightContainer.setX(+540);
    this.mainRightContainer.add([
      this.maleBtn,
      this.femaleBtn,
      this.createBtn,
      this.errorMsg,
      this.mainRightNicknameInputWindow,
      this.mainRightNicknameInput,
      this.preview,
    ]);
  }

  waitForInput(): Promise<CreateUserReq> {
    return new Promise((resolve) => {
      this.inputResolver = resolve;
    });
  }

  private updateGender(newGender: 'male' | 'female') {
    if (this.currentGender === newGender && this.boxSkin.getSelectedId()) return;

    this.currentGender = newGender;
    const master = this.scene.getMasterData();

    // skin
    const skinIds = master.getCostumeData('skin');
    const skinTexts = skinIds.map((id) => i18next.t(`costume:${id}`));
    this.boxSkin.setOptionsWithIds(skinIds, skinTexts, true);

    // outfits
    const outfitIds = master.getCostumeData(newGender, 'outfits');
    const outfitTexts = outfitIds.map((id) =>
      i18next.t(`costume:${toGenderCode(newGender)}_${id}`),
    );
    this.boxOutfit.setOptionsWithIds(outfitIds, outfitTexts, true);

    // hairs
    const hairIds = master.getCostumeData(newGender, 'hairs');
    const hairTexts = hairIds.map((id) => i18next.t(`costume:${toGenderCode(newGender)}_${id}`));
    this.boxHair.setOptionsWithIds(hairIds, hairTexts, true);
  }

  private updateHairColorList(hairId: string) {
    const master = this.scene.getMasterData();
    const colorIds = master.getCostumeData(this.currentGender, 'hair_colors', hairId);
    const colorTexts = colorIds.map((id) => i18next.t(`costume:${id}`));

    this.boxHairColor.setOptionsWithIds(colorIds, colorTexts, true);
  }

  async showGuideMsg() {
    const talk = this.scene.getMessage('talk');
    await talk.showMessage(i18next.t('msg:createAvatar_0'), { name: '테스트맨' });
    this.showContent();
  }

  private showContent() {
    this.topContainer.setVisible(true);
    this.mainContainer.setVisible(true);
  }

  private validateAndSubmit() {
    if (!this.inputResolver) return;

    const nickname = this.mainRightNicknameInput.text;
    const skinId = this.boxSkin.getSelectedId();
    const hairId = this.boxHair.getSelectedId();
    const hairColorId = this.boxHairColor.getSelectedId();
    const outfitId = this.boxOutfit.getSelectedId();

    if (!nickname || nickname.trim() === '') {
      this.errorEffect(i18next.t('error:emptyNickname'));
      return;
    }

    if (nickname.length <= 2 || nickname.length >= 12) {
      this.errorEffect(i18next.t('error:invalidNickname'));
      return;
    }

    if (!skinId || !hairId || !hairColorId || !outfitId) {
      this.errorEffect(i18next.t('error:invalidCostume'));
      return;
    }

    this.inputResolver({
      nickname: nickname,
      gender: this.currentGender,
      costume: {
        skin: skinId,
        hair: hairId,
        hairColor: hairColorId,
        outfit: outfitId,
      },
    });
    this.inputResolver = null;
  }

  onRefreshLanguage(): void {
    this.topTitle.setText(i18next.t('menu:createAvatar'));
    this.errorMsg.setText(i18next.t('error:emptyNickname'));
    this.mainRightNicknameInput.placeholder = i18next.t('menu:enterYourNickname');
  }

  show(): void {
    this.bg.setTexture(getBackgroundKey());
    super.show();
  }
}
