import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { TEXTURE } from '../enums/texture';
import { MessageManager } from '../managers';
import { NewGameMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addText, addTextInput, addWindow, startModalAnimation, Ui } from './ui';
import { ModalFormUi } from './modal-form-ui';
import { TEXTSTYLE } from '../enums/textstyle';
import InputText from 'phaser3-rex-plugins/plugins/inputtext';
import { isValidNickname } from '../utils/string-util';

export class NewGameUi extends ModalFormUi {
  private mode: NewGameMode;
  private gender!: 'boy' | 'girl';
  private avatar!: '1' | '2' | '3' | '4';

  private bg!: Phaser.GameObjects.Image;

  private inputWindow!: Phaser.GameObjects.NineSlice;
  private input!: InputText;

  private statue!: Phaser.GameObjects.Image;

  private selectBtns: Phaser.GameObjects.Image[] = [];
  private selectTexts: (number[] | string[])[] = [];
  private selectViewTexts: Phaser.GameObjects.Text[] = [];

  private btnWindow!: Phaser.GameObjects.NineSlice;
  private btnText!: Phaser.GameObjects.Text;

  private container!: Phaser.GameObjects.Container;
  private titleContainer!: Phaser.GameObjects.Container;
  private statueContainer!: Phaser.GameObjects.Container;
  private inputContainer!: Phaser.GameObjects.Container;
  private selectContainer!: Phaser.GameObjects.Container;
  private btnContainer!: Phaser.GameObjects.Container;

  private targetContainers!: Phaser.GameObjects.Container[];
  private restorePosY!: number[];

  constructor(scene: InGameScene, mode: NewGameMode) {
    super(scene);

    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.gender = 'boy';
    this.avatar = '1';

    super.setup();
    this.setModalSize(TEXTURE.WINDOW_2, 160, 145, 4);

    this.container = this.createContainer(width / 2, height / 2);

    this.bg = addBackground(this.scene, TEXTURE.BG_LOBBY).setOrigin(0.5, 0.5);
    this.setUpTitles(width, height);
    this.setUpStatue(width, height);
    this.setUpSelects(width, height);
    this.setUpInputs(width, height);

    this.targetContainers = [this.titleContainer, this.statueContainer, this.inputContainer, this.selectContainer, this.btnContainer, this.getModal()];
    this.restorePosY = [this.titleContainer.y, this.statueContainer.y, this.inputContainer.y, this.selectContainer.y, this.btnContainer.y, this.getModal().y];

    this.container.add(this.bg);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TITLE - 1);
    this.container.setScrollFactor(0);

    this.handleMouseBtn();

    this.pause(false);
  }

  async show(data?: any): Promise<void> {
    this.container.setVisible(true);
    await this.showIntro();

    for (const container of this.targetContainers) {
      container.y += 48;
      container.setAlpha(0);
      container.setVisible(true);
      startModalAnimation(this.scene, container);
    }
  }

  clean(data?: any): void {
    this.container.setVisible(false);

    for (let i = 0; i < this.targetContainers.length; i++) {
      this.targetContainers[i].y = this.restorePosY[i];
      this.targetContainers[i].setAlpha(1);
      this.targetContainers[i].setVisible(false);
    }
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  update(time: number, delta: number): void {}

  private setUpTitles(width: number, height: number) {
    this.titleContainer = this.createContainer(width / 2, height / 2 - 205);

    const text = addText(this.scene, 0, 0, i18next.t('lobby:setAvatar'), TEXTSTYLE.TITLE_MODAL);

    this.titleContainer.add(text);

    this.titleContainer.setVisible(false);
    this.titleContainer.setDepth(DEPTH.TITLE + 3);
    this.titleContainer.setScrollFactor(0);
  }

  private setUpInputs(width: number, height: number) {
    this.inputContainer = this.createContainer(width / 2, height / 2 + 150);
    this.btnContainer = this.createContainer(width / 2, height / 2 + 223);

    this.inputWindow = addWindow(this.scene, TEXTURE.WINDOW_1, 0, 0, 210, 50, 16, 16, 16, 16).setScale(1.2);

    this.input = addTextInput(this.scene, -110, 0, 210, 50, TEXTSTYLE.LOBBY_INPUT, {
      type: 'text',
      placeholder: i18next.t('lobby:nickname'),
      minLength: 2,
      maxLength: 10,
    }).setScale(2);

    this.btnWindow = addWindow(this.scene, TEXTURE.WINDOW_2, 0, 0, 123, 56, 16, 16, 16, 16).setScale(1.2);
    this.btnText = addText(this.scene, 0, 0, i18next.t('lobby:createAvatar'), TEXTSTYLE.DEFAULT);

    this.inputContainer.add(this.inputWindow);
    this.inputContainer.add(this.input);

    this.btnContainer.add(this.btnWindow);
    this.btnContainer.add(this.btnText);

    this.inputContainer.setVisible(false);
    this.inputContainer.setDepth(DEPTH.TITLE + 3);
    this.inputContainer.setScrollFactor(0);

    this.btnContainer.setVisible(false);
    this.btnContainer.setDepth(DEPTH.TITLE + 3);
    this.btnContainer.setScrollFactor(0);
  }

  private setUpStatue(width: number, height: number) {
    this.statueContainer = this.createContainer(width / 2, height / 2 - 120);

    this.statue = addImage(this.scene, `${this.gender}_${this.avatar}_statue`, 0, 0).setScale(3);

    this.statueContainer.add(this.statue);

    this.statueContainer.setVisible(false);
    this.statueContainer.setDepth(DEPTH.TITLE + 3);
    this.statueContainer.setScrollFactor(0);
  }

  private setUpSelects(width: number, height: number) {
    this.selectContainer = this.createContainer(width / 2, height / 2 - 20);

    const genderRight = addImage(this.scene, TEXTURE.ARROW_B_R, +150, 0).setScale(2);
    const genderLeft = addImage(this.scene, TEXTURE.ARROW_B_R, -150, 0).setFlipX(true).setScale(2);
    const genderViewText = addText(this.scene, 0, 0, '', TEXTSTYLE.DEFAULT);

    const avatarIdxRight = addImage(this.scene, TEXTURE.ARROW_B_R, +150, +70).setScale(2);
    const avatarIdxLeft = addImage(this.scene, TEXTURE.ARROW_B_R, -150, +70).setFlipX(true).setScale(2);
    const avartarViewText = addText(this.scene, 0, +70, '', TEXTSTYLE.DEFAULT);

    //gender
    this.selectBtns.push(genderLeft);
    this.selectBtns.push(genderRight);
    this.selectTexts[0] = [i18next.t('lobby:selectBoy'), i18next.t('lobby:selectGirl')];
    this.selectViewTexts[0] = genderViewText;

    //avatar index
    this.selectBtns.push(avatarIdxLeft);
    this.selectBtns.push(avatarIdxRight);
    this.selectTexts[1] = [i18next.t('lobby:set') + ' 1', i18next.t('lobby:set') + ' 2', i18next.t('lobby:set') + ' 3', i18next.t('lobby:set') + ' 4'];
    this.selectViewTexts[1] = avartarViewText;

    this.selectContainer.add(this.selectBtns);
    this.selectContainer.add(this.selectViewTexts);

    this.selectContainer.setVisible(false);
    this.selectContainer.setDepth(DEPTH.TITLE + 3);
    this.selectContainer.setScrollFactor(0);

    this.selectViewTexts[0].setText(this.selectTexts[0][0].toString());
    this.selectViewTexts[1].setText(this.selectTexts[1][0].toString());
  }

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

  private async showIntro() {
    const message = MessageManager.getInstance();

    await message.show(this, [
      { type: 'sys', format: 'talk', content: i18next.t('message:newgameWelcome1') },
      { type: 'sys', format: 'talk', content: i18next.t('message:newgameWelcome2') },
      { type: 'sys', format: 'talk', content: i18next.t('message:newgameWelcome3') },
    ]);
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
        this.mode.submit(this.input.text, this.gender, this.avatar);
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
    const message = MessageManager.getInstance();

    if (nickname.length <= 0) {
      this.pause(true);
      await message.show(this, [{ type: 'sys', format: 'talk', content: i18next.t('message:nicknameError1') }]);
      return false;
    }

    if (!isValidNickname(nickname)) {
      this.pause(true);
      await message.show(this, [{ type: 'sys', format: 'talk', content: i18next.t('message:nicknameError2') }]);
      return false;
    }

    return true;
  }
}
