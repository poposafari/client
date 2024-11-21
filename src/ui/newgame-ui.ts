import i18next from 'i18next';
import { TEXTURE } from '../enums/texture';
import { MessageManager } from '../managers';
import { NewGameMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addText, addTextInput, addWindow, UI } from './ui';
import { ModalUi } from './modal-ui';
import { TEXTSTYLE } from '../enums/textstyle';
import InputText from 'phaser3-rex-plugins/plugins/inputtext';

interface userInfo {
  nickname: string;
  gender: 0 | 1;
  avatarType: 1 | 2 | 3 | 4;
}

export class NewGameUi extends ModalUi {
  private mode: NewGameMode;
  private bg!: Phaser.GameObjects.Image;
  private input!: InputText;
  private avartar!: Phaser.GameObjects.Image;
  private genderBoy!: Phaser.GameObjects.Image;
  private genderGirl!: Phaser.GameObjects.Image;
  private selectGender!: Phaser.GameObjects.Image;
  private selects: Phaser.GameObjects.Image[] = [];
  private btnLabelStr!: Phaser.GameObjects.Text;
  private btnLabelNumber!: Phaser.GameObjects.Text;
  private btns: Phaser.GameObjects.NineSlice[] = [];

  constructor(scene: InGameScene, mode: NewGameMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const ui = this.getUi();
    const width = this.getWidth();
    const height = this.getHeight();

    this.bg = addBackground(this.scene, TEXTURE.BG_LOBBY, width, height);
    this.bg.setVisible(false);
    ui.add(this.bg);

    super.setup();

    const title = addText(this.scene, 0, -160, i18next.t('lobby:whoAreYou'), TEXTSTYLE.LOBBY_TITLE);
    this.modalContainer.add(title);

    this.avartar = addImage(this.scene, TEXTURE.BOY_1_STATUE, 0, -100);
    this.avartar.setScale(2);
    this.modalContainer.add(this.avartar);

    this.genderBoy = addImage(this.scene, TEXTURE.GENDER_0, -20, -40);
    this.genderGirl = addImage(this.scene, TEXTURE.GENDER_1, 20, -40);
    this.genderBoy.setScale(2);
    this.genderGirl.setScale(2);
    this.modalContainer.add(this.genderBoy);
    this.modalContainer.add(this.genderGirl);

    this.selectGender = addImage(this.scene, TEXTURE.SELECT, -20, -40);
    this.selectGender.setScale(2);
    this.modalContainer.add(this.selectGender);

    const selectContainer = this.scene.add.container(0, 0);
    const selectLeft = addImage(this.scene, TEXTURE.ARROW, -60, 50);
    const selectRight = addImage(this.scene, TEXTURE.ARROW, 60, 50).setFlipX(true);
    this.btnLabelStr = addText(this.scene, 0, 40, i18next.t('lobby:selectBoy1'), TEXTSTYLE.LOBBY_DEFAULT);
    this.btnLabelNumber = addText(this.scene, 0, 55, '1', TEXTSTYLE.LOBBY_DEFAULT);
    selectLeft.setScale(2);
    selectRight.setScale(2);
    selectContainer.add(this.btnLabelStr);
    selectContainer.add(this.btnLabelNumber);
    selectContainer.add(selectLeft);
    selectContainer.add(selectRight);
    this.selects.push(selectLeft);
    this.selects.push(selectRight);
    this.modalContainer.add(selectContainer);

    const inputContainer = this.scene.add.container(0, 150);
    const inputLabel = addText(this.scene, 0, -20, i18next.t('lobby:yourName'), TEXTSTYLE.LOBBY_DEFAULT);
    const inputWindow = addWindow(this.scene, TEXTURE.WINDOW_1, 0, 0, 110, 20);
    this.input = addTextInput(this.scene, 0, 0, 100, 20, TEXTSTYLE.LOBBY_INPUT, {
      type: 'text',
      minLength: 1,
      maxLength: 16,
    });

    inputContainer.add(inputLabel);
    inputContainer.add(inputWindow);
    inputContainer.add(this.input);
    this.modalContainer.add(inputContainer);

    const btnContainer = this.scene.add.container(0, 190);
    const btnWindow = addWindow(this.scene, TEXTURE.WINDOW_0, 0, 0, 110, 30);
    const btnTitle = addText(this.scene, 0, 0, i18next.t('lobby:generate'), TEXTSTYLE.LOBBY_DEFAULT);

    btnContainer.add(btnWindow);
    btnContainer.add(btnTitle);

    this.btns.push(btnWindow);
    this.modalContainer.add(btnContainer);
  }

  async show(): Promise<void> {
    let choice = 1;
    let choiceGender = 0;
    const message = MessageManager.getInstance();

    this.bg.setVisible(true);

    await message.show(this, [
      { type: 'sys', format: 'talk', content: i18next.t('message:newgameWelcome1') },
      { type: 'sys', format: 'talk', content: i18next.t('message:newgameWelcome2') },
      { type: 'sys', format: 'talk', content: i18next.t('message:newgameWelcome3') },
    ]);

    super.show();

    this.genderBoy.setInteractive({ cursor: 'pointer' });
    this.genderBoy.on('pointerdown', () => {
      this.selectGender.setPosition(-20, -40);
      this.avartar.setTexture(TEXTURE.BOY_1_STATUE);
      this.btnLabelStr.setText(i18next.t('lobby:selectBoy1'));
      this.btnLabelNumber.setText('1');
      choice = 1;
      choiceGender = 0;
    });
    this.genderBoy.on('pointerover', () => {
      this.genderBoy.setAlpha(0.7);
    });
    this.genderBoy.on('pointerout', () => {
      this.genderBoy.setAlpha(1);
    });

    this.genderGirl.setInteractive({ cursor: 'pointer' });
    this.genderGirl.on('pointerdown', () => {
      this.selectGender.setPosition(20, -40);
      this.avartar.setTexture(TEXTURE.GIRL_1_STATUE);
      this.btnLabelStr.setText(i18next.t('lobby:selectGirl1'));
      this.btnLabelNumber.setText('1');
      choice = 1;
      choiceGender = 1;
    });
    this.genderGirl.on('pointerover', () => {
      this.genderGirl.setAlpha(0.7);
    });
    this.genderGirl.on('pointerout', () => {
      this.genderGirl.setAlpha(1);
    });

    const boyStatues = [TEXTURE.BOY_1_STATUE, TEXTURE.BOY_2_STATUE, TEXTURE.BOY_3_STATUE, TEXTURE.BOY_4_STATUE];
    const girlStatues = [TEXTURE.GIRL_1_STATUE, TEXTURE.GIRL_2_STATUE, TEXTURE.GIRL_3_STATUE, TEXTURE.GIRL_4_STATUE];
    this.selects[0].setInteractive({ cursor: 'pointer' });
    this.selects[0].on('pointerdown', async () => {
      choice = Math.max(1, choice - 1);
      this.btnLabelNumber.setText(choice.toString());

      this.avartar.setTexture(choiceGender ? girlStatues[choice - 1] : boyStatues[choice - 1]);
    });
    this.selects[0].on('pointerover', () => {
      this.selects[0].setAlpha(0.7);
    });
    this.selects[0].on('pointerout', () => {
      this.selects[0].setAlpha(1);
    });

    this.selects[1].setInteractive({ cursor: 'pointer' });
    this.selects[1].on('pointerdown', async () => {
      choice = Math.min(4, choice + 1);
      this.btnLabelNumber.setText(choice.toString());

      this.avartar.setTexture(choiceGender ? girlStatues[choice - 1] : boyStatues[choice - 1]);
    });
    this.selects[1].on('pointerover', () => {
      this.selects[1].setAlpha(0.7);
    });
    this.selects[1].on('pointerout', () => {
      this.selects[1].setAlpha(1);
    });

    this.btns[0].setInteractive({ cursor: 'pointer' });
    this.btns[0].on('pointerdown', async () => {
      const data: userInfo = { nickname: this.input.text, gender: choiceGender as 0 | 1, avatarType: choice as 1 | 2 | 3 | 4 };

      if (this.validate(data)) {
        console.log('캐릭터 생성 성공!');
      }
    });
    this.btns[0].on('pointerover', () => {
      this.btns[0].setAlpha(0.7);
    });
    this.btns[0].on('pointerout', () => {
      this.btns[0].setAlpha(1);
    });
  }

  clean(): void {
    console.log('?');
  }

  pause(onoff: boolean): void {
    super.pause(onoff);
    onoff ? this.blockInputs() : this.unblockInputs();
  }

  private blockInputs(): void {
    this.input.setBlur();
    this.input.pointerEvents = 'none';

    this.genderBoy.disableInteractive();
    this.genderGirl.disableInteractive();

    this.selects[0].disableInteractive();
    this.selects[1].disableInteractive();

    for (const btn of this.btns) {
      btn.disableInteractive();
    }
  }

  private unblockInputs(): void {
    this.input.setBlur();
    this.input.pointerEvents = 'auto';

    this.genderBoy.setInteractive({ cursor: 'pointer' });
    this.genderGirl.setInteractive({ cursor: 'pointer' });

    this.selects[0].setInteractive({ cursor: 'pointer' });
    this.selects[1].setInteractive({ cursor: 'pointer' });

    for (const btn of this.btns) {
      btn.setInteractive();
    }
  }

  validate(data: userInfo) {
    const message = MessageManager.getInstance();
    const nickname = data.nickname;

    if (nickname === '') {
      this.pause(true);
      message.show(this, [{ type: 'sys', format: 'talk', content: i18next.t('message:newgameNicknameEmpty') }]);
      return false;
    }

    return true;
  }
}
