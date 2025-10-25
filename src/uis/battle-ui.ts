import { catchWildApi } from '../api';
import { MAX_PARTY_SLOT } from '../constants';
import { eventBus } from '../core/event-bus';
import { GM } from '../core/game-manager';
import { getPokemonInfo, getSafariByKey } from '../data';
import { AUDIO, DEPTH, EASE, EVENT, ItemCategory, KEY, TEXTSTYLE, TEXTURE, ANIMATION, TYPE } from '../enums';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import i18next from '../i18n';
import { PlayerItem } from '../obj/player-item';
import { WildOverworldObj } from '../obj/wild-overworld-obj';
import { InGameScene } from '../scenes/ingame-scene';
import { BagStorage, OverworldStorage } from '../storage';
import { CatchRewardRes, CatchWildFailRes, CatchWildSuccessRes, ListForm, PokemonGender, Talk, WildRes } from '../types';
import { getPokemonType, matchPokemonWithRarityRate, matchTypeWithBerryRate, replacePercentSymbol } from '../utils/string-util';
import { MenuListUi } from './menu-list-ui';
import { TalkMessageUi } from './talk-message-ui';
import {
  addBackground,
  addImage,
  addText,
  addWindow,
  createSprite,
  delay,
  getTextStyle,
  playEffectSound,
  runFadeEffect,
  runFlashEffect,
  runWipeRifghtToLeftEffect,
  startModalAnimation,
  stopPostPipeline,
  Ui,
} from './ui';

export class BattleUi extends Ui {
  private dummyContainer!: Phaser.GameObjects.Container;

  private dummyWindow!: Phaser.GameObjects.NineSlice;

  private battleBg: BattleBgUi;
  private battleSprite: BattleSpriteUi;
  private battleMessage: BattleMessageUi;
  private battleRewardUi!: BattleRewardUi;

  private readonly baseWindowScale: number = 4;
  private readonly menuWindowScale: number = 4;

  constructor(scene: InGameScene) {
    super(scene);

    this.battleRewardUi = new BattleRewardUi(scene);
    this.battleBg = new BattleBgUi(scene);
    this.battleSprite = new BattleSpriteUi(scene, this.battleRewardUi);
    this.battleMessage = new BattleMessageUi(scene, this.battleSprite, this.battleBg);

    eventBus.on(EVENT.BATTLE_UI_FINISH, () => {
      runFadeEffect(this.scene, 800, 'in');
      this.clean();
      GM.popUi();
      eventBus.emit(EVENT.BATTLE_FINISH);
    });
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.dummyContainer = this.createContainer(width / 2, height / 2);

    this.dummyWindow = addWindow(this.scene, TEXTURE.WINDOW_0, 0, +410, 480, 260 / this.baseWindowScale, 16, 16, 16, 16).setScale(this.baseWindowScale);

    this.dummyContainer.add(this.dummyWindow);

    this.battleRewardUi.setup();
    this.battleBg.setup();
    this.battleMessage.setup();
    this.battleSprite.setup();

    this.dummyContainer.setVisible(false);
    this.dummyContainer.setDepth(DEPTH.BATTLE + 4);
    this.dummyContainer.setScrollFactor(0);
  }

  async show(data: WildOverworldObj): Promise<void> {
    const currentUserFrame = GM.getUserOption()?.getFrame('text') as string;

    await delay(this.scene, 500);
    await runFlashEffect(this.scene, 100);
    await runFlashEffect(this.scene, 100);
    runWipeRifghtToLeftEffect(this.scene);
    await delay(this.scene, 1000);
    await stopPostPipeline(this.scene);
    runFadeEffect(this.scene, 1000, 'in');

    this.dummyContainer.setVisible(true);
    this.dummyWindow.setTexture(currentUserFrame);

    this.battleBg.show();
    await this.battleSprite.show(data);
    await this.battleMessage.show(data);
  }

  clean(data?: any): void {
    this.dummyContainer.setVisible(false);

    this.battleBg.clean();
    this.battleMessage.clean();
    this.battleSprite.clean();
    this.battleRewardUi.clean();
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
    this.playerBase = addImage(this.scene, '', -400, +250).setScale(2.6);
    this.enemyBase = addImage(this.scene, '', +500, -100).setOrigin(0.5, 0.5).setScale(2.6);
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

  updateCatchRate(value: number) {
    this.rateText.setText(`${(value * 100).toFixed(1)}%`);
  }
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

  private battleSpriteUi!: BattleSpriteUi;
  private battleBgUi!: BattleBgUi;

  private pokeballMenuList!: MenuListUi;
  private pokeballMenuListDummy!: BattleBallMenuListDummyUi;
  private berryMenuList!: MenuListUi;
  private berryMenuListDummy!: BattleBerryMenuListDummyUi;
  private talkMessage!: TalkMessageUi;

  private readonly baseWindowScale: number = 4;
  private readonly menuWindowScale: number = 4;
  private readonly menus: string[] = [i18next.t('menu:battleSelect0'), i18next.t('menu:battleSelect1'), i18next.t('menu:battleSelect3')];

  constructor(scene: InGameScene, battleSpriteUi: BattleSpriteUi, battleBgUi: BattleBgUi) {
    super(scene);

    this.battleSpriteUi = battleSpriteUi;
    this.battleBgUi = battleBgUi;

    this.talkMessage = new TalkMessageUi(scene);
    this.pokeballMenuListDummy = new BattleBallMenuListDummyUi(scene, this);
    this.pokeballMenuList = new MenuListUi(scene, this.pokeballMenuListDummy);
    this.berryMenuListDummy = new BattleBerryMenuListDummyUi(scene, this);
    this.berryMenuList = new MenuListUi(scene, this.berryMenuListDummy);

    eventBus.on(EVENT.SHOW_BATTLE_MENU, () => {
      this.handleKeyInput();
    });

    eventBus.on(EVENT.FORCE_CHANGE_BATTLE_MESSAGE, (str: string) => {
      this.text.text = str;
    });
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.talkMessage.setup();
    this.pokeballMenuList.setup({ scale: 1.8, etcScale: 2, windowWidth: 328, offsetX: 362, offsetY: 183, depth: DEPTH.MESSAGE - 1, per: 7, info: [], window: TEXTURE.WINDOW_MENU });
    this.pokeballMenuListDummy.setup();
    this.berryMenuList.setup({ scale: 1.8, etcScale: 2, windowWidth: 328, offsetX: 362, offsetY: 183, depth: DEPTH.MESSAGE - 1, per: 7, info: [], window: TEXTURE.WINDOW_MENU });
    this.berryMenuListDummy.setup();

    this.container = this.createContainer(width / 2, height / 2);
    this.menuContainer = this.createContainer(width / 2 + 660, height / 2 + 410);

    this.baseWindow = addWindow(this.scene, TEXTURE.WINDOW_0, 0, +410, 480, 260 / this.baseWindowScale, 16, 16, 16, 16).setScale(this.baseWindowScale);
    this.text = addText(this.scene, -880, +335, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0).setScale(1);

    this.menuWindow = addWindow(this.scene, TEXTURE.WINDOW_0, 0, 0, 590 / this.menuWindowScale, 252 / this.menuWindowScale, 16, 16, 16, 16).setScale(this.menuWindowScale);
    this.menuTexts[0] = addText(this.scene, -220, -35, this.menus[0], TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5).setScale(0.9);
    this.menuTexts[1] = addText(this.scene, +30, -35, this.menus[1], TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5).setScale(0.9);
    this.menuTexts[2] = addText(this.scene, -220, +35, this.menus[2], TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5).setScale(0.9);

    this.dummys[0] = addImage(this.scene, TEXTURE.BLANK, -240, -35).setScale(2.4);
    this.dummys[1] = addImage(this.scene, TEXTURE.BLANK, +10, -35).setScale(2.4);
    this.dummys[2] = addImage(this.scene, TEXTURE.BLANK, -240, +35).setScale(2.4);

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

    const currentUserFrame = GM.getUserOption()?.getFrame('text') as string;

    this.menuWindow.setTexture(currentUserFrame);
    this.berryMenuList.updateWindow(currentUserFrame);
    this.pokeballMenuList.updateWindow(currentUserFrame);

    await this.handleKeyInput();
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.menuContainer.setVisible(false);
    this.text.text = '';
  }

  onoffMenu(onoff: boolean) {
    this.menuContainer.setVisible(onoff);
  }

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
            playEffectSound(this.scene, AUDIO.SELECT_0);

            const target = this.menus[choice];
            this.lastChoice = choice;
            if (target === i18next.t('menu:battleSelect0')) {
              this.pokeballMenuListDummy.handleKeyInput([0]);
              const menuResult0 = await this.handlePokeBallMenuKeyInput();
              this.pokeballMenuList.clean();
              this.onoffMenu(false);
              this.pokeballMenuListDummy.clean();

              if (menuResult0 === 'cancel') {
                this.handleKeyInput();
              } else {
                BagStorage.getInstance().useItem(menuResult0.getKey());

                await this.showBattleMessage({
                  type: 'default',
                  content: replacePercentSymbol(i18next.t('message:battleUse'), [GM.getUserData()?.nickname, i18next.t(`item:${menuResult0.getKey()}.name`)]),
                  speed: GM.getUserOption()?.getTextSpeed()!,
                });

                await this.battleSpriteUi.startItemThrow(menuResult0, ItemCategory.POKEBALL);
              }
            } else if (target === i18next.t('menu:battleSelect1')) {
              if (this.wildObj.getData().eaten_berry) {
                playEffectSound(this.scene, AUDIO.BUZZER);
              } else {
                this.berryMenuListDummy.handleKeyInput([0]);
                const menuResult1 = await this.handleBerryMenuKeyInput();
                this.berryMenuList.clean();
                this.onoffMenu(false);
                this.berryMenuListDummy.clean();

                if (menuResult1 === 'cancel') {
                  this.handleKeyInput();
                } else {
                  BagStorage.getInstance().useItem(menuResult1.getKey());

                  await this.showBattleMessage({
                    type: 'default',
                    content: replacePercentSymbol(i18next.t('message:battleUse'), [GM.getUserData()?.nickname, i18next.t(`item:${menuResult1.getKey()}.name`)]),
                    speed: GM.getUserOption()?.getTextSpeed()!,
                  });

                  await this.battleSpriteUi.startItemThrow(menuResult1, ItemCategory.BERRY);
                }
              }
            } else if (target === i18next.t('menu:battleSelect3')) {
              this.dummys[choice].setTexture(TEXTURE.BLANK);
              this.lastChoice = 0;

              playEffectSound(this.scene, AUDIO.FLEE);

              await this.talkMessage.show({
                type: 'default',
                content: replacePercentSymbol(i18next.t('message:battleEscape'), [GM.getUserData()?.nickname]),
                speed: GM.getUserOption()?.getTextSpeed()!,
              });

              this.wildObj.scheduleRandomMovement();

              eventBus.emit(EVENT.BATTLE_UI_FINISH);
            }
            break;
        }

        if (choice !== prevChoice) {
          playEffectSound(this.scene, AUDIO.SELECT_0);

          this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
          this.dummys[choice].setTexture(TEXTURE.ARROW_B);
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  update(time?: number, delta?: number): void {}

  private async handlePokeBallMenuKeyInput(): Promise<'cancel' | PlayerItem> {
    const pokeballs = Object.values(BagStorage.getInstance().getCategory(ItemCategory.POKEBALL));

    this.pokeballMenuList.updateInfo(this.createPokeballMenuListForm(pokeballs));

    this.pokeballMenuList.show();
    const ret = await this.pokeballMenuList.handleKeyInput();

    if (ret === i18next.t('menu:cancelMenu')) {
      return 'cancel';
    } else {
      return pokeballs[ret as number];
    }
  }

  private createPokeballMenuListForm(pokeballs: PlayerItem[]) {
    let ret: ListForm[] = [];

    for (const pokeball of pokeballs) {
      ret.push({
        name: i18next.t(`item:${pokeball.getKey()}.name`),
        nameImg: '',
        etc: `x${pokeball.getStock()}`,
        etcImg: '',
      });
    }

    return ret;
  }

  private async handleBerryMenuKeyInput(): Promise<'cancel' | PlayerItem> {
    const berries = Object.values(BagStorage.getInstance().getCategory(ItemCategory.BERRY));

    this.berryMenuList.updateInfo(this.createBerryMenuListForm(berries));

    this.berryMenuList.show();
    const ret = await this.berryMenuList.handleKeyInput();

    if (ret === i18next.t('menu:cancelMenu')) {
      return 'cancel';
    } else {
      return berries[ret as number];
    }
  }

  private createBerryMenuListForm(berries: PlayerItem[]) {
    let ret: ListForm[] = [];

    for (const berry of berries) {
      ret.push({
        name: i18next.t(`item:${berry.getKey()}.name`),
        nameImg: '',
        etc: `x${berry.getStock()}`,
        etcImg: '',
      });
    }

    return ret;
  }

  private showMenu() {
    this.menuContainer.setVisible(true);
    this.calcCatchRate(null, null);
    this.showBattleMessage({ type: 'default', content: replacePercentSymbol(i18next.t(`message:battle_intro2`), [GM.getUserData()?.nickname]), speed: GM.getUserOption()?.getTextSpeed()! });
  }

  private showBattleMessage(talk: Talk) {
    this.text.text = '';
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

  calcCatchRate(berry: string | null, ball: string | null) {
    const userData = GM.getUserData();

    let partyBonus = 0;
    for (const party of userData?.party!) {
      if (party) {
        const shinyBonus = party.getShiny() ? 0.03 : 0;
        const countBonus = Math.min(party.getCount() * 0.005, 0.25);
        const rankBonus = matchPokemonWithRarityRate(party.getRank());

        partyBonus += shinyBonus + countBonus + rankBonus;
      }
    }

    let ballRate = 1.0;
    switch (ball) {
      case '002':
        ballRate = 1.0;
        break;
      case '003':
        ballRate = 1.5;
        break;
      case '004':
        ballRate = 2.0;
        break;
      default:
        ballRate = 1;
    }

    let targetBerry = !berry ? this.wildObj.getData().eaten_berry : berry;

    const berryRate = matchTypeWithBerryRate(targetBerry, this.wildObj.getData().type1!, this.wildObj.getData().type2!);
    const baseRate = this.wildObj.getData().baseRate * ballRate * berryRate;
    let finalRate = Math.min(baseRate + partyBonus, 1.0);

    if (ball === '001') finalRate = 1.0;

    this.battleBgUi.updateCatchRate(finalRate);
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
  private wildEmotion!: Phaser.GameObjects.Sprite;
  private wildShadow!: Phaser.GameObjects.Image;
  private eatenBerry!: Phaser.GameObjects.Sprite;
  private parties: Phaser.GameObjects.Image[] = [];
  private shinies: Phaser.GameObjects.Image[] = [];
  private effect!: Phaser.GameObjects.Sprite;
  private particleEnterBallBg0!: Phaser.GameObjects.Image;
  private particleEnterBallBg1!: Phaser.GameObjects.Sprite;
  private particles: Phaser.GameObjects.Image[] = [];
  private particleStars: Phaser.GameObjects.Image[] = [];

  private talkMessage!: TalkMessageUi;
  private battleRewardUi!: BattleRewardUi;
  private wildObj!: WildOverworldObj;

  private wildOffsetY: number = 0;
  private wildShadowOffsetX: number = 0;

  private readonly particleCnt: number = 8;
  private readonly particleScale: number = 2.4;
  private readonly throwItemScale: number = 2.4;
  private readonly wildScale: number = 4.5;

  constructor(scene: InGameScene, battleRewardUi: BattleRewardUi) {
    super(scene);

    this.talkMessage = new TalkMessageUi(scene);
    this.battleRewardUi = battleRewardUi;
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.talkMessage.setup();

    this.container = this.createContainer(width / 2, height / 2);
    this.partyContainer = this.createContainer(width / 2 + 295, height / 2 + 130);

    this.player = createSprite(this.scene, '', -400, +16).setScale(4.4).setOrigin(0.5, 0.5);
    this.playerInfo = addImage(this.scene, TEXTURE.BATTLE_BAR, 500, +150).setOrigin(0.5, 0.5).setScale(3);
    this.playerInfo.setFlipX(true);

    for (let i = 0; i < this.particleCnt; i++) {
      const tex = TEXTURE.PARTICLE_BALL_0;
      const p = addImage(this.scene, tex, 0, 0).setOrigin(0.5, 0.5).setAlpha(1).setVisible(false);

      this.particles.push(p);
      this.container.add(p);
    }

    for (let i = 0; i < 3; i++) {
      const p = addImage(this.scene, TEXTURE.PARTICLE_STAR, 0, 0).setOrigin(0.5, 0.5).setAlpha(1).setVisible(false);
      this.particleStars.push(p);
      this.container.add(p);
    }

    this.particleEnterBallBg0 = addImage(this.scene, TEXTURE.BLANK, 0, 0).setOrigin(0.5, 0.5).setAlpha(1).setVisible(false);
    this.particleEnterBallBg1 = createSprite(this.scene, TEXTURE.BLANK, 0, 0).setOrigin(0.5, 0.5).setAlpha(1).setVisible(false);
    this.container.add(this.particleEnterBallBg0);
    this.container.add(this.particleEnterBallBg1);

    this.throwItem = createSprite(this.scene, TEXTURE.BLANK, -230, +110).setOrigin(0.5, 0.5).setScale(this.throwItemScale);
    this.wild = addImage(this.scene, '', +500, -200).setScale(this.wildScale).setOrigin(0.5, 0.5);
    this.wildInfo = addImage(this.scene, TEXTURE.BATTLE_BAR, -400, -250).setOrigin(0.5, 0.5).setScale(3);
    this.wildInfoShiny = addImage(this.scene, TEXTURE.ICON_SHINY, -740, -285).setOrigin(0.5, 0.5).setScale(2.8);
    this.wildInfoName = addText(this.scene, -720, -285, '', TEXTSTYLE.MESSAGE_WHITE).setOrigin(0, 0.5).setScale(1.1);
    this.wildInfoGender = addText(this.scene, 0, 0, '♂♀', TEXTSTYLE.MESSAGE_WHITE).setOrigin(0, 0.5).setScale(1.1);
    this.wildInfoType1 = addImage(this.scene, TEXTURE.BLANK, -300, -190).setScale(1.8);
    this.wildInfoType2 = addImage(this.scene, TEXTURE.BLANK, -170, -190).setScale(1.8);
    this.wildEmotion = createSprite(this.scene, TEXTURE.BLANK, +500, -300).setScale(2.4).setOrigin(0.5, 0.5);
    this.wildShadow = addImage(this.scene, '', +500, -100).setScale(2.2).setOrigin(0.5, 0.5).setAlpha(0.5);
    this.eatenBerry = createSprite(this.scene, TEXTURE.BLANK, -695, -90).setOrigin(0.5, 0.5);
    this.effect = createSprite(this.scene, TEXTURE.BLANK, +500, -200).setScale(8).setOrigin(0.5, 0.5);

    const contentWidth = 60;
    const spacing = 15;
    let currentX = -20;

    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      const icon = addImage(this.scene, `pokemon_icon000`, currentX, -20).setScale(1.2);
      const shiny = addImage(this.scene, TEXTURE.BLANK, currentX - 25, -30).setScale(2.2);

      this.parties.push(icon);
      this.shinies.push(shiny);

      this.partyContainer.add(icon);
      this.partyContainer.add(shiny);

      currentX += contentWidth + spacing;
    }

    this.container.add(this.player);
    this.container.add(this.playerInfo);
    this.container.add(this.wildShadow);
    this.container.add(this.wild);
    this.container.add(this.throwItem);
    this.container.add(this.wildInfo);
    this.container.add(this.wildInfoShiny);
    this.container.add(this.wildInfoName);
    this.container.add(this.wildInfoGender);
    this.container.add(this.wildInfoType1);
    this.container.add(this.wildInfoType2);
    this.container.add(this.wildEmotion);
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
    this.eatenBerry.setTexture(data.getData().eaten_berry ? `item${data.getData().eaten_berry}` : TEXTURE.BLANK);

    const userData = GM.getUserData();

    if (!userData) throw Error('Not found user data');

    const playerTexture = `${userData.gender}_${userData.avatar}_back`;
    const wildData = data.getData();
    const PokemonData = getPokemonInfo(Number(wildData.pokedex));
    const shiny = wildData.shiny ? 's' : '';
    const gender = wildData.gender === 'male' ? 'm' : wildData.gender === 'female' ? 'f' : 'm';

    this.player.setTexture(playerTexture);

    this.wildOffsetY = PokemonData?.offsetY ?? 0;
    this.wildShadowOffsetX = PokemonData?.shadowOffsetX ?? 0;
    this.wild.setPosition(500, -200 + this.wildOffsetY);
    this.wildShadow.setVisible(true);
    this.wildShadow.setTexture(`battle_shadow_${PokemonData?.shadow ?? 0}`);
    this.wildShadow.setPosition(500 + this.wildShadowOffsetX, -100);
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

  async startItemThrow(item: PlayerItem, category: ItemCategory) {
    const startX: number = -300;
    const startY: number = 150;
    const endX: number = 500;
    const endY: number = -200;

    const peakHeight = -300;
    const duration = 500;
    const userData = GM.getUserData();
    const gender = userData?.gender;
    const avatarIdx = userData?.avatar ?? 0;
    const throwAnimKey = `${gender}_${avatarIdx}_back`;

    this.scene.tweens.killTweensOf(this.throwItem);
    this.throwItem.setVisible(false);
    this.throwItem.setAngle(0);
    this.throwItem.setOrigin(0.5, 1);

    await new Promise<void>((resolve) => {
      const hasAnim = this.player.anims.animationManager.exists(throwAnimKey);
      if (hasAnim) {
        this.player.anims.play({ key: throwAnimKey, repeat: 0, frameRate: 8, delay: 0 });
        this.player.once('animationcomplete', () => {
          playEffectSound(this.scene, AUDIO.THROW);
          resolve();
        });
      } else {
        resolve();
      }
    });

    this.throwItem.setVisible(true);
    this.throwItem.setPosition(startX, startY);
    this.throwItem.setScale(this.throwItemScale);
    if (category === ItemCategory.POKEBALL) {
      const launchKey = `ball_${item.getKey()}_launch`;
      if (this.throwItem.anims.animationManager.exists(launchKey)) {
        this.throwItem.anims.play({ key: launchKey, repeat: 0, frameRate: 12 });
      }
    } else {
      this.throwItem.setTexture(`item${item.getKey()}`);
    }

    await new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: this.throwItem,
        x: endX,
        duration: duration,
        ease: EASE.LINEAR,
        onUpdate: (tween) => {
          const progress = tween.progress;
          const parabola = -4 * peakHeight * (progress - 0.5) ** 2 + peakHeight;
          this.throwItem.y = startY + (endY - startY) * progress + parabola;
        },
        onComplete: async () => {
          this.throwItem.setPosition(endX, endY);

          const animation = this.player.scene.anims.get(throwAnimKey);
          const firstFrame = animation.frames[0];
          this.player.setTexture(firstFrame.textureKey, firstFrame.textureFrame);

          const launchKey = `ball_${item.getKey()}_launch`;
          if (this.throwItem.anims.animationManager.exists(launchKey)) {
            this.throwItem.anims.stop();

            await delay(this.scene, 200);

            const animation = this.throwItem.scene.anims.get(launchKey);
            const firstFrame = animation.frames[0];
            this.throwItem.setTexture(firstFrame.textureKey, firstFrame.textureFrame);
          }
          resolve();
        },
      });
    });

    if (category === ItemCategory.POKEBALL) {
      await this.startEnterBall(item);
      await this.startDropBall(item);

      const parties =
        GM.getUserData()
          ?.party.filter((party) => party !== null)
          .map((party) => party!.getIdx()) || [];

      const apiRet = await catchWildApi({ idx: this.wildObj.getData().idx, ball: item.getKey(), berry: null, parties: parties });

      if (apiRet && apiRet.result) {
        if (apiRet.data.catch) {
          const result = apiRet.data as CatchWildSuccessRes;
          const rewardCandy = result.rewards.candy;
          const rewardItems = result.rewards.items;

          await this.startShakeBall(3);
          await this.startCatchBall();
          eventBus.emit(EVENT.FORCE_CHANGE_BATTLE_MESSAGE, replacePercentSymbol(i18next.t('message:battle_catch_success'), [i18next.t(`pokemon:${this.wildObj.getData().pokedex}.name`)]));
          playEffectSound(this.scene, AUDIO.CONG);
          await this.talkMessage.show({
            type: 'default',
            content: replacePercentSymbol(i18next.t('message:battle_catch_success'), [i18next.t(`pokemon:${this.wildObj.getData().pokedex}.name`)]),
            speed: GM.getUserOption()?.getTextSpeed()!,
          });
          this.wildObj.caught();
          await this.battleRewardUi.show({ data: this.wildObj.getData(), candy: rewardCandy, items: rewardItems });
          this.restoreWild();
          eventBus.emit(EVENT.BATTLE_UI_FINISH);
        } else {
          const result = apiRet.data as CatchWildFailRes;
          const flee = result.flee;

          await this.startShakeBall(1);
          await this.startFailBall(item);
          playEffectSound(this.scene, AUDIO.FLEE);
          await this.talkMessage.show({
            type: 'default',
            content: replacePercentSymbol(i18next.t('message:battle_catch_fail'), [i18next.t(`pokemon:${this.wildObj.getData().pokedex}.name`)]),
            speed: GM.getUserOption()?.getTextSpeed()!,
          });

          if (flee) {
            await this.talkMessage.show({
              type: 'default',
              content: replacePercentSymbol(i18next.t('message:battle_wild_flee'), [i18next.t(`pokemon:${this.wildObj.getData().pokedex}.name`)]),
              speed: GM.getUserOption()?.getTextSpeed()!,
            });
            this.wildObj.caught();
            eventBus.emit(EVENT.BATTLE_UI_FINISH);
          } else {
            eventBus.emit(EVENT.SHOW_BATTLE_MENU);
          }
        }
      }
    } else {
      await this.startFeed(item);
      eventBus.emit(EVENT.SHOW_BATTLE_MENU);
    }
  }

  private restoreWild() {
    this.wild.setVisible(true);
    this.wild.setAlpha(1);
    this.wild.setScale(this.wildScale);
    this.wild.clearTint();
    this.wild.setPosition(500, -200 + this.wildOffsetY);
    this.wildShadow.setVisible(true);
    this.wildShadow.setScale(2.2);
    this.wildShadow.setPosition(500 + this.wildShadowOffsetX, -100);
    this.throwItem.setTexture(TEXTURE.BLANK);
    this.throwItem.setPosition(-230, +110 + this.wildOffsetY);
    this.throwItem.stop();
    this.throwItem.setAlpha(1);
    this.throwItem.setScale(this.throwItemScale);
    this.throwItem.clearTint();
    this.throwItem.setVisible(false);
  }

  private async startEnterBall(item: PlayerItem) {
    const centerX = this.throwItem.x;
    const centerY = this.throwItem.y;
    const localCX = centerX;
    const localCY = centerY;

    for (const particle of this.particles) {
      this.scene.tweens.killTweensOf(particle);
      particle.setPosition(localCX, localCY);
      particle.setAlpha(2);
      particle.setScale(this.particleScale);
      particle.setVisible(false);
      particle.setAngle(0);
    }

    this.scene.tweens.killTweensOf(this.particleEnterBallBg0);
    this.particleEnterBallBg0.setPosition(localCX, localCY);
    this.particleEnterBallBg0.setScale(2);
    this.particleEnterBallBg0.setAlpha(1);
    this.particleEnterBallBg0.setOrigin(0.5, 1);
    this.particleEnterBallBg0.setVisible(false);

    this.scene.tweens.killTweensOf(this.particleEnterBallBg1);
    this.particleEnterBallBg1.setPosition(localCX, localCY);
    this.particleEnterBallBg1.setScale(2);
    this.particleEnterBallBg1.setAlpha(1);
    this.particleEnterBallBg1.setVisible(false);
    this.particleEnterBallBg1.setOrigin(0.5, 1);
    this.particleEnterBallBg1.anims.stop();

    this.scene.tweens.killTweensOf(this.wild);
    this.scene.tweens.killTweensOf(this.wildEmotion);
    this.wild.clearTint();
    this.wild.setScale(this.wildScale);
    this.wild.setAlpha(1);
    this.wild.setVisible(true);

    this.throwItem.anims.stop();

    const ballInit = new Promise<void>((resolve) => {
      const animation = this.throwItem.scene.anims.get(`ball_${item.getKey()}_launch`);
      const firstFrame = animation.frames[0];
      this.throwItem.setTexture(firstFrame.textureKey, firstFrame.textureFrame);
      resolve();
    });

    await delay(this.scene, 500);

    const ballEnter = new Promise<void>((resolve) => {
      const enterKey = `ball_${item.getKey()}_enter`;
      this.wildShadow.setVisible(false);
      playEffectSound(this.scene, AUDIO.BALL_ENTER);
      this.throwItem.anims.play({ key: enterKey, repeat: 0, frameRate: 12 });
      this.throwItem.once('animationcomplete', () => resolve());
    });

    const wildShrink = new Promise<void>((resolve) => {
      this.wild.setTintFill(0xffffff);
      this.scene.tweens.add({
        targets: this.wild,
        duration: 500,
        ease: EASE.LINEAR,
        onComplete: () => {
          this.scene.tweens.add({
            targets: this.wild,
            scaleX: 0.1,
            scaleY: 0.1,
            alpha: 0,
            duration: 500,
            ease: EASE.LINEAR,
            onComplete: () => {
              this.wild.setVisible(false);
              this.wild.setTint(0xffffff);
              this.wild.setScale(1);
              this.wild.setAlpha(1);
              resolve();
            },
          });
        },
      });
    });

    const particleBurst = new Promise<void>((resolve) => {
      const maxRadius = 200;
      const spiralTurns = 0.3;
      const expandDuration = 500;
      const contractDuration = 500;

      let completedCount = 0;

      const done = () => {
        completedCount++;
        if (completedCount === this.particleCnt) {
          const animation = this.throwItem.scene.anims.get(`ball_${item.getKey()}_launch`);
          const firstFrame = animation.frames[0];
          this.throwItem.setTexture(firstFrame.textureKey, firstFrame.textureFrame);
          resolve();
        }
      };

      const particleOffsetY = +30;
      this.particles.forEach((particle, index) => {
        particle.setPosition(localCX, localCY + particleOffsetY);
        particle.setScale(this.particleScale);
        particle.setAlpha(1);
        particle.setOrigin(0.5, 1);
        particle.setVisible(true);

        const startAngle = (index / this.particleCnt) * Math.PI * 2;

        const expand = { t: 0 } as { t: number };
        this.scene.tweens.add({
          targets: expand,
          t: 1,
          duration: expandDuration,
          ease: EASE.LINEAR,
          onUpdate: () => {
            const angle = startAngle - expand.t * spiralTurns * Math.PI * 2;
            const r = maxRadius * expand.t;
            particle.setPosition(localCX + r * Math.cos(angle), localCY + r * Math.sin(angle) + particleOffsetY);
          },
          onComplete: () => {
            const contract = { t: 0 } as { t: number };
            this.scene.tweens.add({
              targets: contract,
              t: 1,
              duration: contractDuration,
              ease: EASE.LINEAR,
              onUpdate: () => {
                const angle = startAngle - spiralTurns * Math.PI * 2 - contract.t * spiralTurns * Math.PI * 2;
                const r = maxRadius * (1 - contract.t);
                particle.setPosition(localCX + r * Math.cos(angle), localCY + r * Math.sin(angle) + particleOffsetY);
              },
              onComplete: () => {
                particle.setPosition(localCX, localCY + particleOffsetY);
                particle.setScale(this.particleScale);
                particle.setAlpha(0);
                done();
              },
            });
          },
        });
      });
    });

    await Promise.all([ballInit, ballEnter, wildShrink, particleBurst]);

    await new Promise<void>((resolve) => {
      this.particleEnterBallBg1.setOrigin(0.5, 0.5);
      this.particleEnterBallBg1.setPosition(localCX, localCY - 30);
      this.particleEnterBallBg1.setVisible(true);

      const animationKey = ANIMATION.PARTICLE_ENTER_BALL;
      this.particleEnterBallBg1.anims.play({ key: animationKey, repeat: 0, frameRate: 12 });

      this.scene.tweens.add({
        targets: this.particleEnterBallBg1,
        duration: 600,
        ease: EASE.LINEAR,
        onComplete: () => {
          this.scene.tweens.add({
            scaleX: 4,
            scaleY: 4,
            targets: this.particleEnterBallBg1,
            alpha: 0,
            duration: 600,
            ease: EASE.LINEAR,
            onComplete: () => {
              this.particleEnterBallBg1.setScale(4);
              this.particleEnterBallBg1.setAlpha(1);
              this.particleEnterBallBg1.setVisible(false);

              let blinkCount = 0;
              this.scene.time.addEvent({
                delay: 200,
                repeat: 3,
                callback: () => {
                  if (blinkCount % 2 === 0) {
                    this.throwItem.setTint(0xffff00);
                  } else {
                    this.throwItem.clearTint();
                  }
                  blinkCount++;
                  if (blinkCount === 4) {
                    resolve();
                  }
                },
              });
            },
          });
        },
      });
    });
  }

  private async startDropBall(item: PlayerItem): Promise<void> {
    return new Promise((resolve) => {
      const startY = this.throwItem.y;
      const targetY = -90;

      let prevY = startY;
      let falling = true;
      let bounceCount = 0;

      this.scene.tweens.add({
        targets: this.throwItem,
        y: targetY,
        duration: 500,
        ease: EASE.BOUNCE_EASEOUT,
        onUpdate: () => {
          const currentY = this.throwItem.y;

          if (falling && currentY >= prevY) {
            bounceCount++;
            playEffectSound(this.scene, AUDIO.BALL_DROP);
            falling = false;
          }

          if (!falling && currentY < prevY) {
            falling = true;
          }

          prevY = currentY;
        },
        onComplete: () => {
          this.throwItem.setY(targetY);
          resolve();
        },
      });
    });
  }

  private async startShakeBall(cnt: number = 3): Promise<void> {
    return new Promise((resolve) => {
      const shakeAngle = 20;
      const shakeDuration = 200;
      let current = 0;

      // throwItem 초기화
      this.scene.tweens.killTweensOf(this.throwItem);
      this.throwItem.setAngle(0);
      this.throwItem.setOrigin(0.5, 1);
      const playOneShake = async () => {
        if (current >= cnt) {
          this.scene.tweens.add({
            targets: this.throwItem,
            angle: 0,
            duration: shakeDuration,
            ease: EASE.QUART_EASEOUT,
            onComplete: () => resolve(),
          });
          return;
        }

        await delay(this.scene, 500);
        playEffectSound(this.scene, AUDIO.BALL_SHAKE);

        this.scene.tweens.add({
          targets: this.throwItem,
          angle: -shakeAngle,
          duration: shakeDuration,
          ease: EASE.QUART_EASEINOUT,
          onComplete: () => {
            this.scene.tweens.add({
              targets: this.throwItem,
              angle: shakeAngle,
              duration: shakeDuration,
              ease: EASE.QUART_EASEINOUT,
              onComplete: () => {
                this.scene.tweens.add({
                  targets: this.throwItem,
                  angle: 0,
                  duration: shakeDuration,
                  ease: EASE.QUART_EASEOUT,
                  onComplete: () => {
                    current++;
                    playOneShake();
                  },
                });
              },
            });
          },
        });
      };

      playOneShake();
    });
  }

  private async startCatchBall(): Promise<void> {
    await delay(this.scene, 500);

    return new Promise((resolve) => {
      playEffectSound(this.scene, AUDIO.BALL_CATCH);

      this.throwItem.setTint(0x5a5a5a);

      const ballX = this.throwItem.x;
      const ballY = this.throwItem.y;

      this.particleStars.forEach((star) => {
        this.scene.tweens.killTweensOf(star);
        star.setPosition(ballX - 50, ballY);
        star.setScale(1);
        star.setAlpha(1);
        star.setVisible(true);
        star.setAngle(0);
      });

      let completedStars = 0;

      this.particleStars.forEach((star, index) => {
        const targetAngle = [10, 80, 190];
        const angle = targetAngle[index] * (Math.PI / 180);
        const distance = 100;
        const peakHeight = 150;
        const fallDistance = 10;
        const dummy = { t: 0 };

        this.scene.tweens.add({
          targets: dummy,
          t: 1,
          duration: 400,
          ease: EASE.LINEAR,
          onUpdate: () => {
            const t = dummy.t;
            const currentX = ballX + Math.cos(angle) * distance * t;

            // Y: 포물선 궤적 (물리적으로 정확한 포물선)
            // t=0: 시작점, t=0.5: 최고점, t=1: 끝점
            // 포물선 공식: y = -4h(t - 0.5)^2 + h
            const parabola = -4 * peakHeight * Math.pow(t - 0.5, 2) + peakHeight;
            const currentY = ballY - parabola + t * fallDistance;

            star.setPosition(currentX, currentY);
            star.setAngle(t * 360);
          },
          onComplete: () => {
            this.scene.tweens.add({
              targets: star,
              scaleX: 0.5,
              scaleY: 0.5,
              alpha: 0,
              duration: 200,
              ease: EASE.LINEAR,
              onComplete: () => {
                star.setVisible(false);
                completedStars++;
                if (completedStars === this.particleStars.length) {
                  resolve();
                }
              },
            });
          },
        });
      });
    });
  }

  private async startFailBall(item: PlayerItem): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.killTweensOf(this.wild);
      this.wild.setScale(0.1);
      this.wild.setAlpha(0);
      this.wild.setVisible(true);
      this.wild.setTintFill(0xffffff);

      this.throwItem.anims.stop();

      playEffectSound(this.scene, AUDIO.BALL_EXIT);

      this.scene.tweens.add({
        targets: this.wild,
        scaleX: this.wildScale,
        scaleY: this.wildScale,
        alpha: 1,
        duration: 300,
        ease: EASE.LINEAR,
        onStart: () => {
          this.throwItem.anims.play({
            key: `ball_${item.getKey()}_enter`,
            repeat: 0,
            frameRate: 10,
          });
        },
        onComplete: async () => {
          await delay(this.scene, 100);

          this.wild.clearTint();
          this.wildObj.updateData({ eaten_berry: null });
          this.throwItem.setTexture(TEXTURE.BLANK);
          this.eatenBerry.setTexture(TEXTURE.BLANK);

          this.wildShadow.setVisible(true);

          resolve();
        },
      });
    });
  }

  private async startFeed(item: PlayerItem): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.throwItem,
        duration: 1000,
        ease: EASE.BACK_EASEIN,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        onComplete: () => {
          const berryRateResult = matchTypeWithBerryRate(item.getKey(), this.wildObj.getData().type1, this.wildObj.getData().type2);
          let key = 'emo_3';
          this.scene.tweens.killTweensOf(this.wildEmotion);
          this.wildObj.updateData({ eaten_berry: item.getKey() });
          this.eatenBerry.setTexture(`item${item.getKey()}`);
          this.throwItem.setTexture(TEXTURE.BLANK);
          this.throwItem.setScale(this.throwItemScale);
          this.throwItem.setAlpha(1);

          if (berryRateResult >= 1.2) {
            key = 'emo_1';
          }

          this.wildEmotion.anims.play({
            key: key,
            repeat: 0,
            frameRate: 7,
          });

          this.wildEmotion.once('animationcomplete', () => {
            this.wildEmotion.setTexture(TEXTURE.BLANK);
            this.wildEmotion.stop();
            resolve();
          });
        },
      });
    });
  }

  private showGender(pokemon: WildRes) {
    this.wildInfoGender.setPosition(this.wildInfoName.x + this.wildInfoName.displayWidth, -285);

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

      playEffectSound(this.scene, AUDIO.SHINY);

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
  private container!: Phaser.GameObjects.Container;

  private window!: Phaser.GameObjects.NineSlice;
  private text!: Phaser.GameObjects.Text;
  private icon!: Phaser.GameObjects.Image;

  private battleMessageUi: BattleMessageUi;

  private readonly windowScale: number = 4;

  constructor(scene: InGameScene, battleMessageUi: BattleMessageUi) {
    super(scene);

    this.battleMessageUi = battleMessageUi;
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);

    this.window = addWindow(this.scene, TEXTURE.WINDOW_0, -295, +410, 331, 260 / this.windowScale, 16, 16, 16, 16).setScale(this.windowScale);
    this.text = addText(this.scene, -750, +350, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0).setScale(0.8);
    this.icon = addImage(this.scene, TEXTURE.BLANK, -840, +410).setScale(2.4);

    this.container.add(this.window);
    this.container.add(this.text);
    this.container.add(this.icon);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE + 6);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {}

  clean(data?: any): void {
    this.text.text = '';
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {
    const item = Object.values(BagStorage.getInstance().getCategory(ItemCategory.POKEBALL))[data[0]];

    this.icon.setTexture(item ? `item${item?.getKey()}` : TEXTURE.BLANK);
    this.text.setText(item ? i18next.t(`item:${item.getKey()}.description`) : '');
    this.window.setTexture(GM.getUserOption()?.getFrame('text') as string);
    this.container.setVisible(true);

    this.battleMessageUi.calcCatchRate(null, item?.getKey());
  }

  update(time?: number, delta?: number): void {}
}

export class BattleBerryMenuListDummyUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private window!: Phaser.GameObjects.NineSlice;
  private text!: Phaser.GameObjects.Text;
  private icon!: Phaser.GameObjects.Image;

  private battleMessageUi: BattleMessageUi;

  private readonly windowScale: number = 4;

  constructor(scene: InGameScene, battleMessageUi: BattleMessageUi) {
    super(scene);

    this.battleMessageUi = battleMessageUi;
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);

    this.window = addWindow(this.scene, TEXTURE.WINDOW_0, -295, +410, 331, 260 / this.windowScale, 16, 16, 16, 16).setScale(this.windowScale);
    this.text = addText(this.scene, -750, +350, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0).setScale(0.8);
    this.icon = addImage(this.scene, TEXTURE.BLANK, -840, +410).setScale(2.4);

    this.container.add(this.window);
    this.container.add(this.text);
    this.container.add(this.icon);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE + 6);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {}

  clean(data?: any): void {
    this.text.text = '';
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {
    const item = Object.values(BagStorage.getInstance().getCategory(ItemCategory.BERRY))[data[0]];

    this.icon.setTexture(item ? `item${item?.getKey()}` : TEXTURE.BLANK);
    this.text.setText(item ? i18next.t(`item:${item.getKey()}.description`) : '');
    this.window.setTexture(GM.getUserOption()?.getFrame('text') as string);
    this.container.setVisible(true);

    this.battleMessageUi.calcCatchRate(item?.getKey(), null);
  }

  update(time?: number, delta?: number): void {}
}

type BattleRewardData = {
  data: WildRes;
  candy: number;
  items: CatchRewardRes[];
};

export class BattleRewardUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private contentContainer!: Phaser.GameObjects.Container;
  private rewardContainer!: Phaser.GameObjects.Container;
  private targetContainers!: Phaser.GameObjects.Container[];
  private restoreTargetContainerPosY!: number[];

  private wild!: Phaser.GameObjects.Image;
  private wildPokedex!: Phaser.GameObjects.Text;
  private wildName!: Phaser.GameObjects.Text;
  private wildGender!: Phaser.GameObjects.Text;
  private wildShiny!: Phaser.GameObjects.Image;
  private type1!: Phaser.GameObjects.Image;
  private type2!: Phaser.GameObjects.Image;
  private wildSpecies!: Phaser.GameObjects.Text;
  private wildRank!: Phaser.GameObjects.Text;
  private rewardIcons: Phaser.GameObjects.Image[] = [];
  private rewardTexts: Phaser.GameObjects.Text[] = [];
  private rewardStocks: Phaser.GameObjects.Text[] = [];

  private readonly windowWidth: number = 600;
  private readonly windowHeight: number = 400;
  private readonly overlay0Width: number = 448;
  private readonly overlay0Height: number = 40;
  private readonly overlay1Width: number = 310;
  private readonly overlay1Height: number = 60;
  private readonly rewardOverlayWidth: number = 900;
  private readonly rewardOverlayHeight: number = 200;
  private readonly ribbonWidth: number = 700;
  private readonly ribbonHeight: number = 130;
  private readonly textScale: number = 0.8;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);
    this.contentContainer = this.createContainer(width / 2, height / 2);
    this.rewardContainer = this.createContainer(width / 2, height / 2 + 260);

    this.wild = addImage(this.scene, '', -370, -130).setScale(4).setOrigin(0.5, 0.5);

    const bg = addBackground(this.scene, TEXTURE.BG_BLACK).setOrigin(0.5, 0.5);
    const window = addWindow(this.scene, TEXTURE.REWARD_WINDOW, 0, 0, this.windowWidth, this.windowHeight, 32, 32, 32, 32).setScale(2.4);
    const title = addText(this.scene, 0, -406, i18next.t('menu:reward_title'), TEXTSTYLE.ONLY_WHITE).setOrigin(0.5, 0.5).setScale(this.textScale).setStroke('#696969', 12);
    const overlay0 = addWindow(this.scene, TEXTURE.REWARD_OVERLAY_0, 0, -396, this.overlay0Width, this.overlay0Height, 8, 8, 8, 8).setScale(3);
    const overlay1 = addWindow(this.scene, TEXTURE.REWARD_OVERLAY_1, +270, -250, this.overlay1Width, this.overlay1Height, 8, 8, 8, 8).setScale(2.4);
    const overlay1Shadow = addWindow(this.scene, TEXTURE.REWARD_OVERLAY_1, +280, -235, this.overlay1Width, this.overlay1Height, 8, 8, 8, 8).setScale(2.4).setAlpha(0.5).setTintFill(0x9f9f9f);

    const pokedexSymbol = addImage(this.scene, TEXTURE.ICON_FOLLOW, -50, -285).setOrigin(0.5, 0.5).setScale(2);
    this.wildPokedex = addText(this.scene, -10, -285, '0015', TEXTSTYLE.ONLY_WHITE).setOrigin(0, 0.5).setScale(this.textScale).setStroke('#696969', 12);
    this.wildName = addText(this.scene, +120, -285, '한카리아스', TEXTSTYLE.ONLY_WHITE).setOrigin(0, 0.5).setScale(this.textScale).setStroke('#696969', 12);
    this.wildSpecies = addText(this.scene, -80, -215, '', TEXTSTYLE.ONLY_WHITE).setOrigin(0, 0.5).setScale(this.textScale).setStroke('#696969', 12);
    const rankOverlay = addWindow(this.scene, TEXTURE.REWARD_OVERLAY_2, +30, -70, 130, 70, 4, 4, 4, 4).setScale(2);
    const rankOverlayShadow = addWindow(this.scene, TEXTURE.REWARD_OVERLAY_2, +40, -55, 130, 70, 4, 4, 4, 4).setScale(2).setAlpha(0.5).setTintFill(0x9f9f9f);
    const rankTitle = addText(this.scene, +30, -135, i18next.t('menu:reward_rank'), TEXTSTYLE.ONLY_WHITE).setOrigin(0.5, 0).setScale(0.6).setStroke('#696969', 12);
    this.wildRank = addText(this.scene, +30, -75, '', TEXTSTYLE.ONLY_WHITE).setOrigin(0.5, 0).setScale(0.8).setStroke('#696969', 12);
    const wildGenderOverlay = addWindow(this.scene, TEXTURE.REWARD_OVERLAY_2, +265, -70, 80, 70, 4, 4, 4, 4).setScale(2);
    const wildGenderOverlayShadow = addWindow(this.scene, TEXTURE.REWARD_OVERLAY_2, +275, -55, 80, 70, 4, 4, 4, 4).setScale(2).setAlpha(0.5).setTintFill(0x9f9f9f);
    const wildGenderTitle = addText(this.scene, +265, -135, i18next.t('menu:reward_gender'), TEXTSTYLE.ONLY_WHITE).setOrigin(0.5, 0).setScale(0.6).setStroke('#696969', 12);
    this.wildGender = addText(this.scene, +265, -40, '♂♀', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0.5, 0.5).setScale(this.textScale);
    this.type1 = addImage(this.scene, TEXTURE.TYPES, +430, -112).setScale(2);
    this.type2 = addImage(this.scene, TEXTURE.TYPES, +570, -112).setScale(2);
    const rewardOverlay = addWindow(this.scene, TEXTURE.REWARD_OVERLAY_3, 0, +250, this.rewardOverlayWidth, this.rewardOverlayHeight, 16, 16, 16, 16).setScale(1.4);
    const ribbon = addImage(this.scene, TEXTURE.RIBBON, 0, +110).setScale(1);
    const ribbonText = addText(this.scene, 0, +100, i18next.t('menu:reward_ribbon'), TEXTSTYLE.ONLY_WHITE).setOrigin(0.5, 0.5).setScale(this.textScale).setStroke('#696969', 12);
    ribbon.setDisplaySize(this.ribbonWidth, this.ribbonHeight);

    const message = addText(this.scene, 0, +423, i18next.t('menu:reward_message'), TEXTSTYLE.ONLY_WHITE).setOrigin(0.5, 0.5).setScale(0.6).setStroke('#696969', 12);

    this.wildShiny = addImage(this.scene, TEXTURE.ICON_SHINY, -600, -285).setOrigin(0.5, 0.5).setScale(2.8);

    bg.setAlpha(0.5);
    this.container.add(bg);
    this.contentContainer.add(window);
    this.contentContainer.add(overlay0);
    this.contentContainer.add(title);
    this.contentContainer.add(overlay1Shadow);
    this.contentContainer.add(overlay1);
    this.contentContainer.add(this.wild);
    this.contentContainer.add(pokedexSymbol);
    this.contentContainer.add(this.wildPokedex);
    this.contentContainer.add(this.wildName);
    this.contentContainer.add(this.wildSpecies);
    this.contentContainer.add(rankOverlayShadow);
    this.contentContainer.add(rankOverlay);
    this.contentContainer.add(rankTitle);
    this.contentContainer.add(this.wildRank);
    this.contentContainer.add(wildGenderOverlayShadow);
    this.contentContainer.add(wildGenderOverlay);
    this.contentContainer.add(wildGenderTitle);
    this.contentContainer.add(this.wildGender);
    this.contentContainer.add(this.type1);
    this.contentContainer.add(this.type2);
    this.contentContainer.add(rewardOverlay);
    this.contentContainer.add(ribbon);
    this.contentContainer.add(ribbonText);
    this.contentContainer.add(this.wildShiny);
    this.contentContainer.add(message);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TOP);
    this.container.setScrollFactor(0);

    this.contentContainer.setVisible(false);
    this.contentContainer.setDepth(DEPTH.TOP + 1);
    this.contentContainer.setScrollFactor(0);

    this.rewardContainer.setVisible(false);
    this.rewardContainer.setDepth(DEPTH.TOP + 2);
    this.rewardContainer.setScrollFactor(0);

    this.targetContainers = [this.contentContainer, this.rewardContainer];
    this.restoreTargetContainerPosY = [this.contentContainer.y, this.rewardContainer.y];
  }

  async show(data: BattleRewardData): Promise<void> {
    const wildData = data.data;
    const candy = data.candy;
    const rewards = data.items;

    const shiny = wildData.shiny ? 's' : '';
    const gender = wildData.gender === 'male' ? 'm' : wildData.gender === 'female' ? 'f' : 'm';

    this.wild.setTexture(`pokemon_sprite${wildData.pokedex}_${gender}${shiny}`);
    this.wildPokedex.setText(`${wildData.pokedex}`);
    this.wildName.setText(i18next.t(`pokemon:${wildData.pokedex}.name`));
    this.updateGenderSummary(wildData.gender);
    this.updateTypeSummary(getPokemonType(wildData.type1)!, getPokemonType(wildData.type2)!);
    this.updateShiny(wildData.shiny);
    this.wildSpecies.setText(i18next.t(`pokemon:${wildData.pokedex}.species`));
    this.wildRank.setText(i18next.t(`menu:${wildData.rank}`));

    this.cleanRewards();
    this.updateCandy(candy);
    this.updateRewards(rewards);

    playEffectSound(this.scene, AUDIO.REWARD);
    this.container.setVisible(true);
    for (const container of this.targetContainers) {
      container.y += 70;
      container.setAlpha(0);
      container.setVisible(true);
      startModalAnimation(this.scene, container, 500, 70);
    }

    this.contentContainer.setVisible(true);
    this.rewardContainer.setVisible(true);

    const keys = [KEY.SELECT];
    const keyboard = KeyboardHandler.getInstance();

    return new Promise((resolve) => {
      keyboard.setAllowKey(keys);
      keyboard.setKeyDownCallback((key) => {
        if (key === KEY.SELECT) {
          resolve();
        }
      });
    });
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.contentContainer.setVisible(false);
    this.rewardContainer.setVisible(false);

    for (let i = 0; i < this.targetContainers.length; i++) {
      this.targetContainers[i].y = this.restoreTargetContainerPosY[i];
      this.targetContainers[i].setAlpha(1);
      this.targetContainers[i].setVisible(false);
    }
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  private updateGenderSummary(gender: PokemonGender) {
    if (gender === 'female') {
      this.wildGender.setText(`♀`);
      this.wildGender.setStyle(getTextStyle(TEXTSTYLE.GENDER_1));
    } else if (gender === 'male') {
      this.wildGender.setText(`♂`);
      this.wildGender.setStyle(getTextStyle(TEXTSTYLE.GENDER_0));
    } else {
      this.wildGender.setText(``);
    }
  }

  private updateTypeSummary(type_1: TYPE, type_2: TYPE) {
    type_1 ? this.type1.setTexture(TEXTURE.TYPES, `types-${type_1}`) : this.type1.setTexture(TEXTURE.BLANK);
    type_2 ? this.type2.setTexture(TEXTURE.TYPES, `types-${type_2}`) : this.type2.setTexture(TEXTURE.BLANK);
  }

  private updateShiny(shiny: boolean) {
    this.wildShiny.setX(this.wildName.x + this.wildName.displayWidth + 20);
    this.wildShiny.setTexture(shiny ? TEXTURE.ICON_SHINY : TEXTURE.BLANK);
  }

  private updateRewards(rewards: CatchRewardRes[]) {
    for (const reward of rewards) {
      this.updateRewardIcon(reward.item);
      this.updateRewardText(reward.item);
      this.updateRewardStock(reward.stock);
    }

    this.repositionRewards();
  }

  private updateCandy(candy: number) {
    const candyIcon = addImage(this.scene, TEXTURE.ICON_CANDY, 0, 0).setScale(4);
    const candyText = addText(this.scene, 0, 0, i18next.t('menu:candy'), TEXTSTYLE.ONLY_WHITE).setScale(0.5).setStroke('#696969', 12);
    const candyStock = addText(this.scene, 0, 0, `x${candy}`, TEXTSTYLE.ONLY_WHITE).setScale(0.5).setStroke('#696969', 12);

    this.rewardIcons.push(candyIcon);
    this.rewardTexts.push(candyText);
    this.rewardStocks.push(candyStock);

    this.rewardContainer.add(candyIcon);
    this.rewardContainer.add(candyText);
    this.rewardContainer.add(candyStock);

    this.repositionRewards();
  }

  private repositionRewards() {
    const itemSpacing = 200;
    const totalItems = this.rewardIcons.length;

    if (totalItems === 0) return;

    const totalWidth = (totalItems - 1) * itemSpacing;
    const startX = -totalWidth / 2;
    for (let i = 0; i < totalItems; i++) {
      const x = startX + i * itemSpacing;
      this.rewardIcons[i].setPosition(x, -10);
      this.rewardTexts[i].setPosition(x, +70);
      this.rewardStocks[i].setPosition(x + 35, 30);
    }
  }

  private cleanRewards() {
    this.rewardIcons.forEach((icon) => icon.destroy());
    this.rewardTexts.forEach((text) => text.destroy());
    this.rewardStocks.forEach((stock) => stock.destroy());

    this.rewardIcons = [];
    this.rewardTexts = [];
    this.rewardStocks = [];

    this.rewardContainer.removeAll(true);
  }

  private updateRewardIcon(item: string) {
    const icon = addImage(this.scene, `item${item}`, 0, 0).setScale(2);
    this.rewardIcons.push(icon);
    this.rewardContainer.add(icon);
  }

  private updateRewardText(item: string) {
    const text = addText(this.scene, 0, 0, i18next.t(`item:${item}.name`), TEXTSTYLE.ONLY_WHITE)
      .setScale(0.5)
      .setStroke('#696969', 12);
    this.rewardTexts.push(text);
    this.rewardContainer.add(text);
  }

  private updateRewardStock(value: number) {
    const stock = addText(this.scene, 0, 0, `x${value}`, TEXTSTYLE.ONLY_WHITE).setScale(0.5).setStroke('#696969', 12);
    this.rewardStocks.push(stock);
    this.rewardContainer.add(stock);
  }
}
