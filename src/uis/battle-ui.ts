import { MAX_PARTY_SLOT } from '../constants';
import { GM } from '../core/game-manager';
import { getSafariByKey } from '../data';
import { AUDIO, DEPTH, KEY, TEXTSTYLE, TEXTURE } from '../enums';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import i18next from '../i18n';
import { WildOverworldObj } from '../obj/wild-overworld-obj';
import { InGameScene } from '../scenes/ingame-scene';
import { OverworldStorage } from '../storage';
import { Talk, WildRes } from '../types';
import { getPokemonType, replacePercentSymbol } from '../utils/string-util';
import { MenuListUi } from './menu-list-ui';
import { TalkMessageUi } from './talk-message-ui';
import { addBackground, addImage, addText, addWindow, createSprite, delay, getTextStyle, playSound, runFadeEffect, runFlashEffect, runWipeRifghtToLeftEffect, stopPostPipeline, Ui } from './ui';

export class BattleUi extends Ui {
  private battleBg: BattleBgUi;
  private battleMessage: BattleMessageUi;
  private battleSprite: BattleSpriteUi;

  constructor(scene: InGameScene) {
    super(scene);

    this.battleBg = new BattleBgUi(scene);
    this.battleMessage = new BattleMessageUi(scene);
    this.battleSprite = new BattleSpriteUi(scene);
  }

  setup(data?: any): void {
    this.battleBg.setup();
    this.battleMessage.setup();
    this.battleSprite.setup();
  }

  async show(data: WildOverworldObj): Promise<void> {
    await delay(this.scene, 500);
    await runFlashEffect(this.scene, 100);
    await runFlashEffect(this.scene, 100);
    runWipeRifghtToLeftEffect(this.scene);
    await delay(this.scene, 1000);
    await stopPostPipeline(this.scene);
    runFadeEffect(this.scene, 1000, 'in');
    this.battleBg.show();
    await this.battleSprite.show(data);
    await this.battleMessage.show(data);
  }

  clean(data?: any): void {
    this.battleBg.clean();
    this.battleMessage.clean();
    this.battleSprite.clean();
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}
}

export class BattleBgUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private bg!: Phaser.GameObjects.Image;
  private playerBase!: Phaser.GameObjects.Image;
  private enemyBase!: Phaser.GameObjects.Image;
  private rateText!: Phaser.GameObjects.Text;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);

    this.bg = addBackground(this.scene, TEXTURE.BG_BLACK).setOrigin(0.5, 0.5).setScale(2);
    this.playerBase = addImage(this.scene, '', -400, +250).setScale(1.6);
    this.enemyBase = addImage(this.scene, '', +500, -100).setOrigin(0.5, 0.5).setScale(2);
    this.rateText = addText(this.scene, +700, -480, '100.0%', TEXTSTYLE.MESSAGE_WHITE);
    const rateTextTitle = addText(this.scene, this.rateText.x - 15, -490, i18next.t('menu:battleCaptureRateTitle'), TEXTSTYLE.MESSAGE_WHITE);

    rateTextTitle.setOrigin(1, 0.5);
    rateTextTitle.setScale(1.1);
    this.rateText.setOrigin(0, 0.5);
    this.rateText.setScale(1.4);

    this.container.add(this.bg);
    this.container.add(this.playerBase);
    this.container.add(this.enemyBase);
    this.container.add(rateTextTitle);
    this.container.add(this.rateText);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE + 1);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    const overworld = OverworldStorage.getInstance().getKey();
    const overworldData = getSafariByKey(overworld);

    if (!overworldData) throw new Error(`not found overworld data : ${overworld}`);

    const time = 'day';

    this.bg.setTexture(`bg_${overworldData.area}_${time}`);
    this.playerBase.setTexture(`pb_${overworldData.area}_${time}`);
    this.enemyBase.setTexture(`eb_${overworldData.area}_${time}`);

    this.container.setVisible(true);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}
}

export class BattleMessageUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private menuContainer!: Phaser.GameObjects.Container;
  private baseWindow!: Phaser.GameObjects.NineSlice;
  private menuWindow!: Phaser.GameObjects.NineSlice;
  private text!: Phaser.GameObjects.Text;
  private menuTexts: Phaser.GameObjects.Text[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];
  private wildObj!: WildOverworldObj;
  private lastChoice!: number;

  private pokeballMenuList!: MenuListUi;
  private pokeballMenuListDummy!: BattleBallMenuListDummyUi;
  private berryMenuList!: MenuListUi;
  private berryMenuListDummy!: BattleBerryMenuListDummyUi;
  private talkMessage!: TalkMessageUi;

  private readonly baseWindowScale: number = 2;
  private readonly menuWindowScale: number = 3.2;
  private readonly menus: string[] = [i18next.t('menu:battleSelect0'), i18next.t('menu:battleSelect1'), i18next.t('menu:battleSelect3')];

  constructor(scene: InGameScene) {
    super(scene);

    this.talkMessage = new TalkMessageUi(scene);
    this.pokeballMenuListDummy = new BattleBallMenuListDummyUi(scene);
    this.pokeballMenuList = new MenuListUi(scene, this.pokeballMenuListDummy);
    this.berryMenuListDummy = new BattleBerryMenuListDummyUi(scene);
    this.berryMenuList = new MenuListUi(scene, this.berryMenuListDummy);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.talkMessage.setup();

    this.container = this.createContainer(width / 2, height / 2);
    this.menuContainer = this.createContainer(width / 2 + 683, height / 2 + 420);

    this.baseWindow = addWindow(this.scene, GM.getUserOption()?.getFrame('text') as string, 0, 420, width / this.baseWindowScale + 20, 240 / this.baseWindowScale, 16, 16, 16, 16).setScale(
      this.baseWindowScale,
    );
    this.text = addText(this.scene, -920, +350, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0).setScale(1);

    this.menuWindow = addWindow(this.scene, GM.getUserOption()?.getFrame('text') as string, 0, 0, 555 / this.menuWindowScale, 240 / this.menuWindowScale, 16, 16, 16, 16).setScale(
      this.menuWindowScale,
    );
    this.menuTexts[0] = addText(this.scene, -200, -35, this.menus[0], TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5).setScale(0.9);
    this.menuTexts[1] = addText(this.scene, +60, -35, this.menus[1], TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5).setScale(0.9);
    this.menuTexts[2] = addText(this.scene, -200, +35, this.menus[2], TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5).setScale(0.9);

    this.dummys[0] = addImage(this.scene, TEXTURE.BLANK, -220, -35).setScale(2.4);
    this.dummys[1] = addImage(this.scene, TEXTURE.BLANK, +40, -35).setScale(2.4);
    this.dummys[2] = addImage(this.scene, TEXTURE.BLANK, -220, +35).setScale(2.4);

    this.container.add(this.baseWindow);
    this.container.add(this.text);

    this.menuContainer.add(this.menuWindow);
    this.menuContainer.add(this.menuTexts[0]);
    this.menuContainer.add(this.menuTexts[1]);
    this.menuContainer.add(this.menuTexts[2]);
    this.menuContainer.add(this.dummys[0]);
    this.menuContainer.add(this.dummys[1]);
    this.menuContainer.add(this.dummys[2]);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE + 4);
    this.container.setScrollFactor(0);

    this.menuContainer.setVisible(false);
    this.menuContainer.setDepth(DEPTH.BATTLE + 5);
    this.menuContainer.setScrollFactor(0);
  }

  async show(data: WildOverworldObj): Promise<void> {
    this.wildObj = data;

    await this.talkMessage.show({
      type: 'default',
      content: replacePercentSymbol(i18next.t(`message:battle_intro1`), [i18next.t(`pokemon:${data.getData().pokedex}.name`)]),
      speed: GM.getUserOption()?.getTextSpeed()!,
    });
    await this.handleKeyInput();
  }

  clean(data?: any): void {}

  pause(onoff: boolean, data?: any): void {}

  async handleKeyInput(...data: any[]): Promise<void> {
    const keys = [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT];
    const keyboard = KeyboardHandler.getInstance();
    const maxChoice = 2;
    const cols = 2;

    let choice = this.lastChoice ? this.lastChoice : 0;

    this.container.setVisible(true);
    this.showMenu();

    this.dummys[choice].setTexture(TEXTURE.ARROW_B);
    this.menuTexts[1].setStyle(getTextStyle(this.wildObj.getData().eaten_berry ? TEXTSTYLE.MESSAGE_GRAY : TEXTSTYLE.MESSAGE_BLACK));

    keyboard.setAllowKey(keys);
    keyboard.setKeyDownCallback(async (key) => {
      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            if (choice - cols >= 0) choice -= cols;
            break;
          case KEY.DOWN:
            if (choice + cols <= maxChoice) choice += cols;
            break;
          case KEY.LEFT:
            if (choice % cols !== 0) choice--;
            break;
          case KEY.RIGHT:
            if ((choice + 1) % cols !== 0 && choice + 1 <= maxChoice) choice++;
            break;
          case KEY.SELECT:
            playSound(this.scene, AUDIO.SELECT_0);

            const target = this.menus[choice];
            this.lastChoice = choice;
            if (target === i18next.t('menu:battleSelect0')) {
              this.handleBallMenuKeyInput();
            } else if (target === i18next.t('menu:battleSelect1')) {
              if (this.wildObj.getData().eaten_berry) {
                playSound(this.scene, AUDIO.BUZZER);
              } else {
                this.handleBerryMenuKeyInput();
              }
            } else if (target === i18next.t('menu:battleSelect3')) {
              this.dummys[choice].setTexture(TEXTURE.BLANK);
              this.lastChoice = 0;

              playSound(this.scene, AUDIO.FLEE);

              this.wildObj.scheduleRandomMovement();
            }
            break;
        }

        if (choice !== prevChoice) {
          playSound(this.scene, AUDIO.SELECT_0);

          this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
          this.dummys[choice].setTexture(TEXTURE.ARROW_B);
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  update(time?: number, delta?: number): void {}

  private handleBallMenuKeyInput() {}

  private handleBerryMenuKeyInput() {}

  private showMenu() {
    this.menuContainer.setVisible(true);
    this.showBattleMessage({ type: 'default', content: replacePercentSymbol(i18next.t(`message:battle_intro2`), [GM.getUserData()?.nickname]), speed: GM.getUserOption()?.getTextSpeed()! });
  }

  private showBattleMessage(talk: Talk) {
    this.baseWindow.setTexture(GM.getUserOption()!.getFrame('text') as string);

    const text = talk.content.split('');
    let index = 0;
    let speed = talk.speed;

    return new Promise((resolve) => {
      const addNextChar = () => {
        if (index < text.length) {
          this.text.text += text[index];
          index++;
          this.scene.time.delayedCall(speed, addNextChar, [], this);
        } else {
          resolve(true);
        }
      };
      addNextChar();
    });
  }
}

export class BattleSpriteUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private partyContainer!: Phaser.GameObjects.Container;

  private player!: Phaser.GameObjects.Sprite;
  private playerInfo!: Phaser.GameObjects.Image;
  private throwItem!: Phaser.GameObjects.Sprite;
  private wild!: Phaser.GameObjects.Image;
  private wildInfo!: Phaser.GameObjects.Image;
  private wildInfoShiny!: Phaser.GameObjects.Image;
  private wildInfoName!: Phaser.GameObjects.Text;
  private wildInfoGender!: Phaser.GameObjects.Text;
  private wildInfoType1!: Phaser.GameObjects.Image;
  private wildInfoType2!: Phaser.GameObjects.Image;
  private heart!: Phaser.GameObjects.Sprite;
  private eatenBerry!: Phaser.GameObjects.Sprite;
  private parties: Phaser.GameObjects.Image[] = [];
  private shinies: Phaser.GameObjects.Image[] = [];
  private effect!: Phaser.GameObjects.Sprite;

  private wildObj!: WildOverworldObj;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);
    this.partyContainer = this.createContainer(width / 2 + 295, height / 2 + 130);

    this.player = createSprite(this.scene, '', -400, +60).setScale(4).setOrigin(0.5, 0.5);
    this.playerInfo = addImage(this.scene, TEXTURE.BATTLE_BAR, 500, +150).setOrigin(0.5, 0.5).setScale(2.4);
    this.playerInfo.setFlipX(true);
    this.throwItem = createSprite(this.scene, TEXTURE.BLANK, -230, +110).setOrigin(0.5, 0.5);

    this.wild = addImage(this.scene, '', +500, -200).setScale(4).setOrigin(0.5, 0.5);
    this.wildInfo = addImage(this.scene, TEXTURE.BATTLE_BAR, -400, -250).setOrigin(0.5, 0.5).setScale(2.2);
    this.wildInfoShiny = addImage(this.scene, TEXTURE.ICON_SHINY, -645, -260).setOrigin(0.5, 0.5).setScale(1.6);
    this.wildInfoName = addText(this.scene, -620, -260, '', TEXTSTYLE.BOX_NAME).setOrigin(0, 0.5).setScale(0.8);
    this.wildInfoGender = addText(this.scene, 0, 0, '♂♀', TEXTSTYLE.BOX_NAME).setOrigin(0, 0.5).setScale(0.8);
    this.wildInfoType1 = addImage(this.scene, TEXTURE.BLANK, -305, -260).setScale(1.2);
    this.wildInfoType2 = addImage(this.scene, TEXTURE.BLANK, -225, -260).setScale(1.2);
    this.heart = createSprite(this.scene, TEXTURE.BLANK, +500, -400).setScale(2).setOrigin(0.5, 0.5);
    this.eatenBerry = createSprite(this.scene, TEXTURE.BLANK, -620, -120).setOrigin(0.5, 0.5);
    this.effect = createSprite(this.scene, TEXTURE.BLANK, +500, -200).setScale(8).setOrigin(0.5, 0.5);

    const contentWidth = 50;
    const spacing = 15;
    let currentX = 0;

    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      const icon = addImage(this.scene, `pokemon_icon000`, currentX, 0);
      const shiny = addImage(this.scene, TEXTURE.BLANK, currentX - 15, -15);

      this.parties.push(icon);
      this.shinies.push(shiny);

      this.partyContainer.add(icon);
      this.partyContainer.add(shiny);

      currentX += contentWidth + spacing;
    }

    this.container.add(this.player);
    this.container.add(this.playerInfo);
    this.container.add(this.wild);
    this.container.add(this.throwItem);
    this.container.add(this.wildInfo);
    this.container.add(this.wildInfoShiny);
    this.container.add(this.wildInfoName);
    this.container.add(this.wildInfoGender);
    this.container.add(this.wildInfoType1);
    this.container.add(this.wildInfoType2);
    this.container.add(this.heart);
    this.container.add(this.eatenBerry);
    this.container.add(this.effect);

    this.partyContainer.setScale(1.4);
    this.partyContainer.setVisible(false);
    this.partyContainer.setDepth(DEPTH.BATTLE + 3);
    this.partyContainer.setScrollFactor(0);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE + 2);
    this.container.setScrollFactor(0);
  }

  async show(data?: WildOverworldObj): Promise<void> {
    if (!data) throw Error('Not found wild pokemon');
    this.wildObj = data;
    this.eatenBerry.setTexture(TEXTURE.BLANK);

    const userData = GM.getUserData();

    if (!userData) throw Error('Not found user data');

    const playerTexture = `${userData.gender}_${userData.avatar}_back`;
    const wildData = data.getData();
    const shiny = wildData.shiny ? 's' : '';
    const gender = wildData.gender === 'male' ? 'm' : wildData.gender === 'female' ? 'f' : 'm';

    this.player.setTexture(playerTexture);
    this.wild.setTexture(`pokemon_sprite${wildData.pokedex}_${gender}${shiny}`);
    this.wildInfoName.setText(i18next.t(`pokemon:${wildData.pokedex}.name`));
    this.wildInfoShiny.setVisible(wildData.shiny);
    this.showGender(wildData);
    this.showType(wildData);

    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      this.parties[i].setTexture(`pokemon_icon000`);
      this.shinies[i].setTexture(TEXTURE.BLANK);
    }

    let idx = 0;
    for (const party of userData.party) {
      if (party) {
        this.parties[idx].setTexture(`pokemon_icon${party.getPokedex()}${party.getShiny() ? 's' : ''}`);
        this.shinies[idx].setTexture(party.getShiny() ? TEXTURE.ICON_SHINY : TEXTURE.BLANK);
      } else {
        this.parties[idx].setTexture('pokemon_icon000');
        this.shinies[idx].setTexture(TEXTURE.BLANK);
      }

      idx++;
    }

    this.container.setVisible(true);
    this.partyContainer.setVisible(true);

    await this.showShinyEffect(wildData.shiny);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.partyContainer.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  private showGender(pokemon: WildRes) {
    this.wildInfoGender.setPosition(this.wildInfoName.x + this.wildInfoName.displayWidth, -260);

    if (pokemon.gender === 'male') {
      this.wildInfoGender.setText(`♂`);
      this.wildInfoGender.setStyle(getTextStyle(TEXTSTYLE.GENDER_0));
    }
    if (pokemon.gender === 'female') {
      this.wildInfoGender.setText(`♀`);
      this.wildInfoGender.setStyle(getTextStyle(TEXTSTYLE.GENDER_1));
    }
  }

  private showType(pokemon: WildRes) {
    const type1 = getPokemonType(pokemon.type1);
    const type2 = getPokemonType(pokemon.type2);

    if (type1 && type2) {
      this.wildInfoType1.setTexture(TEXTURE.TYPES, `types-${type1}`);
      this.wildInfoType2.setTexture(TEXTURE.TYPES, `types-${type2}`);
    } else if (type1 && !type2) {
      this.wildInfoType1.setTexture(TEXTURE.BLANK);
      this.wildInfoType2.setTexture(TEXTURE.TYPES, `types-${type1}`);
    } else {
      this.wildInfoType1.setTexture(TEXTURE.BLANK);
      this.wildInfoType2.setTexture(TEXTURE.BLANK);
    }
  }

  private showShinyEffect(shiny: boolean): Promise<void> {
    return new Promise((resolve) => {
      if (!shiny) {
        resolve();
        return;
      }

      playSound(this.scene, AUDIO.SHINY);

      this.effect.setTexture(TEXTURE.SPARKLE);
      this.effect.anims.play({
        key: TEXTURE.SPARKLE,
        repeat: 0,
        frameRate: 30,
      });

      this.effect.once('animationcomplete', () => {
        this.effect.anims.stop();
        this.effect.setTexture(TEXTURE.BLANK);
        resolve();
      });
    });
  }
}

export class BattleBallMenuListDummyUi extends Ui {
  setup(data?: any): void {}

  show(data?: any): void {}

  clean(data?: any): void {}

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}
}

export class BattleBerryMenuListDummyUi extends Ui {
  setup(data?: any): void {}

  show(data?: any): void {}

  clean(data?: any): void {}

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}
}
