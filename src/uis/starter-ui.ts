import InputText from 'phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText';
import { PlayerAvatar, PlayerGender } from '../types';
import { ModalFormUi } from './modal-form-ui';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addText, addTextInput, addWindow, runFadeEffect, startModalAnimation } from './ui';
import { DEPTH, HttpErrorCode, MODE, TEXTSTYLE, TEXTURE } from '../enums';
import i18next from '../i18n';
import { getIngameApi, registerIngameApi } from '../api';
import { isValidNickname, replacePercentSymbol } from '../utils/string-util';
import { TalkMessageUi } from './talk-message-ui';
import { GM } from '../core/game-manager';

export class StarterUi extends ModalFormUi {
  private container!: Phaser.GameObjects.Container;

  private talkUi: TalkMessageUi;

  private titleContainer!: Phaser.GameObjects.Container;
  private statueContainer!: Phaser.GameObjects.Container;
  private inputContainer!: Phaser.GameObjects.Container;
  private selectContainer!: Phaser.GameObjects.Container;
  private btnContainer!: Phaser.GameObjects.Container;
  private targetContainers!: Phaser.GameObjects.Container[];

  private gender!: PlayerGender;
  private avatar!: PlayerAvatar;
  private restorePosY!: number[];
  private inputWindow!: Phaser.GameObjects.NineSlice;
  private input!: InputText;
  private statue!: Phaser.GameObjects.Image;
  private selectBtns: Phaser.GameObjects.Image[] = [];
  private selectTexts: (number[] | string[])[] = [];
  private selectViewTexts: Phaser.GameObjects.Text[] = [];
  private btnWindow!: Phaser.GameObjects.NineSlice;
  private btnText!: Phaser.GameObjects.Text;
  private errTexts!: Phaser.GameObjects.Text;

  private readonly professorMsgSpeed: number = 50;

  constructor(scene: InGameScene) {
    super(scene);

    this.talkUi = new TalkMessageUi(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.talkUi.setup();

    this.container = this.createContainer(width / 2, height / 2);

    const bg = addBackground(this.scene, TEXTURE.BG_STARTER).setOrigin(0.5, 0.5);
    const professor = addImage(this.scene, TEXTURE.PROFESSOR, 0, -50).setScale(5.2);

    this.setupAvatarModal(width, height);

    this.container.add(bg);
    this.container.add(professor);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TITLE - 1);
    this.container.setScrollFactor(0);
  }

  async show(data?: any): Promise<void> {
    runFadeEffect(this.scene, 1000, 'in');

    this.container.setVisible(true);

    await this.talkUi.show({ type: 'default', content: i18next.t('message:starterGame1'), speed: this.professorMsgSpeed });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:starterGame2'), speed: this.professorMsgSpeed });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:starterGame3'), speed: this.professorMsgSpeed });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:starterGame4'), speed: this.professorMsgSpeed });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:starterGame5'), speed: this.professorMsgSpeed });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:starterGame6'), speed: this.professorMsgSpeed });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:starterGame7'), speed: this.professorMsgSpeed });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:starterGame8'), speed: this.professorMsgSpeed });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:starterGame9'), speed: this.professorMsgSpeed });

    this.showModal();
    this.handleMouseBtn();
    this.pause(false);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  private block() {
    this.input!.setBlur();
    this.input!.pointerEvents = 'none';

    this.btnWindow.disableInteractive();

    this.selectBtns[0].disableInteractive();
    this.selectBtns[1].disableInteractive();
    this.selectBtns[2].disableInteractive();
    this.selectBtns[3].disableInteractive();
  }

  private unblock() {
    this.input!.pointerEvents = 'auto';

    this.btnWindow.setInteractive({ cursor: 'pointer' });

    this.selectBtns[0].setInteractive({ cursor: 'pointer' });
    this.selectBtns[1].setInteractive({ cursor: 'pointer' });
    this.selectBtns[2].setInteractive({ cursor: 'pointer' });
    this.selectBtns[3].setInteractive({ cursor: 'pointer' });
  }

  private setupAvatarModal(width: number, height: number) {
    this.gender = 'boy';
    this.avatar = '1';

    super.setup();
    this.setModalSize(GM.getMsgWindow(), 110, 120, 6);

    this.titleContainer = this.createContainer(width / 2, height / 2 - 260);

    const text = addText(this.scene, 0, 0, i18next.t('menu:createAvatar'), TEXTSTYLE.TITLE_MODAL);

    this.titleContainer.add(text);

    this.titleContainer.setVisible(false);
    this.titleContainer.setDepth(DEPTH.TITLE + 3);
    this.titleContainer.setScrollFactor(0);

    this.statueContainer = this.createContainer(width / 2, height / 2 - 140);

    this.statue = addImage(this.scene, `${this.gender}_${this.avatar}_statue`, 0, 0).setScale(3.4);

    this.statueContainer.add(this.statue);

    this.statueContainer.setVisible(false);
    this.statueContainer.setDepth(DEPTH.TITLE + 3);
    this.statueContainer.setScrollFactor(0);

    this.selectContainer = this.createContainer(width / 2, height / 2 + 50);

    const genderRight = addImage(this.scene, TEXTURE.ARROW_B, +150, 0).setScale(2);
    const genderLeft = addImage(this.scene, TEXTURE.ARROW_B, -150, 0).setFlipX(true).setScale(2);
    const genderViewText = addText(this.scene, 0, 0, '', TEXTSTYLE.DEFAULT);

    const avatarIdxRight = addImage(this.scene, TEXTURE.ARROW_B, +150, +70).setScale(2);
    const avatarIdxLeft = addImage(this.scene, TEXTURE.ARROW_B, -150, +70).setFlipX(true).setScale(2);
    const avartarViewText = addText(this.scene, 0, +70, '', TEXTSTYLE.DEFAULT);

    //gender
    this.selectBtns.push(genderLeft);
    this.selectBtns.push(genderRight);
    this.selectTexts[0] = [i18next.t('menu:selectBoy'), i18next.t('menu:selectGirl')];
    this.selectViewTexts[0] = genderViewText;

    //avatar index
    this.selectBtns.push(avatarIdxLeft);
    this.selectBtns.push(avatarIdxRight);
    this.selectTexts[1] = [i18next.t('menu:selectSet') + ' 1', i18next.t('menu:selectSet') + ' 2', i18next.t('menu:selectSet') + ' 3', i18next.t('menu:selectSet') + ' 4'];
    this.selectViewTexts[1] = avartarViewText;

    this.selectContainer.add(this.selectBtns);
    this.selectContainer.add(this.selectViewTexts);

    this.selectContainer.setVisible(false);
    this.selectContainer.setDepth(DEPTH.TITLE + 3);
    this.selectContainer.setScrollFactor(0);

    this.selectViewTexts[0].setText(this.selectTexts[0][0].toString());
    this.selectViewTexts[1].setText(this.selectTexts[1][0].toString());

    const btnScale = 2;

    this.inputContainer = this.createContainer(width / 2, height / 2 - 40);
    this.btnContainer = this.createContainer(width / 2, height / 2 + 280);

    this.inputWindow = addWindow(this.scene, TEXTURE.WINDOW_WHITE, 0, 0, 210, 50, 16, 16, 16, 16).setScale(1.2);
    this.errTexts = addText(this.scene, 0, -60, '', TEXTSTYLE.GENDER_1);

    this.input = addTextInput(this.scene, -110, 0, 210, 50, TEXTSTYLE.LOBBY_INPUT, {
      type: 'text',
      placeholder: i18next.t('menu:nickname'),
      minLength: 2,
      maxLength: 10,
    }).setScale(2);

    this.btnWindow = addWindow(this.scene, GM.getMsgWindow(), 0, 0, 150 / btnScale, 65 / btnScale, 16, 16, 16, 16).setScale(btnScale);
    this.btnText = addText(this.scene, 0, 0, i18next.t('menu:create'), TEXTSTYLE.DEFAULT);

    this.inputContainer.add(this.inputWindow);
    this.inputContainer.add(this.input);

    this.btnContainer.add(this.btnWindow);
    this.btnContainer.add(this.btnText);
    this.btnContainer.add(this.errTexts);

    this.inputContainer.setVisible(false);
    this.inputContainer.setDepth(DEPTH.TITLE + 3);
    this.inputContainer.setScrollFactor(0);

    this.btnContainer.setVisible(false);
    this.btnContainer.setDepth(DEPTH.TITLE + 3);
    this.btnContainer.setScrollFactor(0);

    this.targetContainers = [this.titleContainer, this.statueContainer, this.inputContainer, this.selectContainer, this.btnContainer, this.getModal()];
    this.restorePosY = [this.titleContainer.y, this.statueContainer.y, this.inputContainer.y, this.selectContainer.y, this.btnContainer.y, this.getModal().y];
  }

  private showModal() {
    super.show();

    for (const container of this.targetContainers) {
      container.y += 48;
      container.setAlpha(0);
      container.setVisible(true);
      startModalAnimation(this.scene, container);
    }
  }

  private cleanModal() {
    for (let i = 0; i < this.targetContainers.length; i++) {
      this.targetContainers[i].y = this.restorePosY[i];
      this.targetContainers[i].setAlpha(1);
      this.targetContainers[i].setVisible(false);
    }
  }

  private handleMouseBtn() {
    this.btnWindow.on('pointerover', () => {
      this.btnWindow.setTint(0xcccccc);
    });
    this.btnWindow.on('pointerout', () => {
      this.btnWindow.clearTint();
    });
    this.btnWindow.on('pointerup', async () => {
      if (await this.validate(this.input.text)) {
        this.pause(true);
        const res = await registerIngameApi({ nickname: this.input.text, gender: this.gender, avatar: this.avatar as PlayerAvatar });

        if (res!.result) {
          this.cleanModal();
          await this.showOuttroMsg(this.input.text);
        } else {
          if (res!.data === HttpErrorCode.ALREADY_EXIST_NICKNAME) {
            this.shake();
            this.errTexts.setText(i18next.t('message:existNickname'));
          }
        }
      }
    });

    this.selectBtns[0].on('pointerover', () => {
      this.selectBtns[0].setAlpha(0.5);
    });
    this.selectBtns[0].on('pointerout', () => {
      this.selectBtns[0].setAlpha(1);
    });
    this.selectBtns[0].on('pointerup', () => {
      this.updateSelectText(0, -1);
    });

    this.selectBtns[1].on('pointerover', () => {
      this.selectBtns[1].setAlpha(0.5);
    });
    this.selectBtns[1].on('pointerout', () => {
      this.selectBtns[1].setAlpha(1);
    });
    this.selectBtns[1].on('pointerup', () => {
      this.updateSelectText(0, 1);
    });

    this.selectBtns[2].on('pointerover', () => {
      this.selectBtns[2].setAlpha(0.5);
    });
    this.selectBtns[2].on('pointerout', () => {
      this.selectBtns[2].setAlpha(1);
    });
    this.selectBtns[2].on('pointerup', () => {
      this.updateSelectText(1, -1);
    });

    this.selectBtns[3].on('pointerover', () => {
      this.selectBtns[3].setAlpha(0.5);
    });
    this.selectBtns[3].on('pointerout', () => {
      this.selectBtns[3].setAlpha(1);
    });
    this.selectBtns[3].on('pointerup', () => {
      this.updateSelectText(1, 1);
    });
  }

  private updateSelectText(section: number, value: -1 | 1) {
    const texts = this.selectTexts[section];
    if (!texts || texts.length === 0) return;

    const currentText = this.selectViewTexts[section].text;
    const currentIndex = texts.findIndex((t) => t === currentText);

    const nextIndex = (currentIndex + value + texts.length) % texts.length;
    const nextText = texts[nextIndex];

    this.selectViewTexts[section].setText(nextText.toString());

    if (section === 0) {
      this.gender = nextIndex === 0 ? 'boy' : 'girl';
    } else if (section === 1) {
      this.avatar = (nextIndex + 1).toString() as '1' | '2' | '3' | '4';
    }

    this.updateStatueImage();
  }

  private updateStatueImage() {
    const textureKey = `${this.gender}_${this.avatar}_statue`;
    this.statue.setTexture(textureKey);
  }

  private async validate(nickname: string) {
    if (nickname.length <= 0) {
      this.shake();
      this.errTexts.setText(i18next.t('message:emptyNickname'));
      return false;
    }

    if (!isValidNickname(nickname)) {
      this.shake();
      this.errTexts.setText(i18next.t('message:invalidNickname'));
      return false;
    }

    return true;
  }

  private async showOuttroMsg(nickname: string): Promise<void> {
    await this.talkUi.show({ type: 'default', content: replacePercentSymbol(i18next.t('message:starterGame10'), [nickname]), speed: this.professorMsgSpeed });
    await this.talkUi.show({ type: 'default', content: replacePercentSymbol(i18next.t('message:starterGame11'), [nickname]), speed: this.professorMsgSpeed });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:starterGame12'), speed: this.professorMsgSpeed });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:starterGame13'), speed: this.professorMsgSpeed });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:starterGame14'), speed: this.professorMsgSpeed });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:starterGame15'), speed: this.professorMsgSpeed });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:starterGame16'), speed: this.professorMsgSpeed });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:starterGame17'), speed: this.professorMsgSpeed });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:starterGame18'), speed: this.professorMsgSpeed });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:starterGame19'), speed: this.professorMsgSpeed });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:starterGame20'), speed: this.professorMsgSpeed });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:starterGame21'), speed: this.professorMsgSpeed });

    await runFadeEffect(this.scene, 2000, 'out');

    const res = await getIngameApi();

    if (res.result) {
      GM.initUserData(res.data);
    } else {
      GM.setUserData(null);
    }

    GM.changeMode(MODE.BLACK_SCREEN);
  }
}
