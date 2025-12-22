import { EvolvePcApi, getPcApi, LearnSkillApi, MovePcApi } from '../api';
import { MAX_PARTY_SLOT, MAX_PC_BG } from '../constants';
import { Event } from '../core/manager/event-manager';
import { ANIMATION, AUDIO, DEPTH, EVENT, KEY, MessageEndDelay, MODE, TEXTSTYLE, TEXTURE, TIME, TYPE, UI } from '../enums';
import { Keyboard } from '../core/manager/keyboard-manager';
import { SocketManager } from '../core/manager/socket-manager';
import i18next from '../i18n';
import { PlayerPokemon } from '../obj/player-pokemon';
import { InGameScene } from '../scenes/ingame-scene';
import { EvolPcRes, GetPcRes, ListForm, PokemonGender, PokemonHiddenMove, PokemonRank } from '../types';
import {
  formatDateTime,
  getCurrentTimeOfDay,
  getOverworldPokemonTexture,
  getPokemonEvolCostText,
  getPokemonSkillText,
  getPokemonTextureFromPlayerPokemon,
  getTypesSpriteOnSkills,
  replacePercentSymbol,
} from '../utils/string-util';
import { MenuListUi } from './menu-list-ui';
import { MenuUi } from './menu-ui';
import { NoticeUi } from './notice-ui';
import { QuestionMessageUi } from './question-message-ui';
import { delay, getTextShadow, getTextStyle, playEffectSound, runFadeEffect, setTextShadow, Ui } from './ui';
import { PC, PcStorage } from '../core/storage/pc-storage';
import { Option } from '../core/storage/player-option';
import { ErrorCode } from '../core/errors';
import { Game } from '../core/manager/game-manager';
import { InputNicknameUi } from './input-nickname-ui';
import { TalkMessageUi } from './talk-message-ui';
import { PlayerGlobal } from '../core/storage/player-storage';
import { getPokemonData } from '../data';
import { Bag } from '../core/storage/bag-storage';

export class PcUi extends Ui {
  private pcBoxUi: PcBoxUi;
  private pcSummary: PcSummaryUi;
  private container!: Phaser.GameObjects.Container;
  private tutorialContainer!: Phaser.GameObjects.Container;
  private tutorialBg!: Phaser.GameObjects.Image;
  private talkMesageUi!: TalkMessageUi;

  constructor(scene: InGameScene) {
    super(scene);
    this.pcBoxUi = new PcBoxUi(scene);
    this.pcSummary = new PcSummaryUi(scene);
    this.talkMesageUi = new TalkMessageUi(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.talkMesageUi.setup();

    this.pcSummary.setup();
    this.pcBoxUi.setup(this.pcSummary);
    this.container = this.createTrackedContainer(width / 2, height / 2);
    const bg = this.addBackground(TEXTURE.BG_PC).setOrigin(0.5, 0.5);

    this.tutorialContainer = this.createTrackedContainer(width / 2, height / 2);
    this.tutorialBg = this.addBackground(TEXTURE.BG_BLACK).setOrigin(0.5, 0.5).setAlpha(0.5);

    this.container.add(bg);
    this.tutorialContainer.add(this.tutorialBg);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE);
    this.container.setScrollFactor(0);

    this.tutorialContainer.setVisible(false);
    this.tutorialContainer.setDepth(DEPTH.MESSAGE - 1);
    this.tutorialContainer.setScrollFactor(0);
  }

  async show(data?: unknown): Promise<void> {
    Event.emit(EVENT.DISABLE_DAY_NIGHT_FILTER);

    playEffectSound(this.scene, AUDIO.OPEN_1);
    runFadeEffect(this.scene, 800, 'in');
    this.container.setVisible(true);

    if (Option.getTutorial() && Option.getClientTutorial('pc')) {
      this.tutorialContainer.setVisible(true);
      await this.showTutorial();
      this.tutorialContainer.setVisible(false);
      Option.setClientTutorial(false, 'pc');
    }

    this.pcBoxUi.show();
    this.pcSummary.show();
  }

  async showTutorial(): Promise<void> {
    await this.talkMesageUi.show({ type: 'default', content: i18next.t('message:tutorial_pc_0'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
    await this.talkMesageUi.show({ type: 'default', content: i18next.t('message:tutorial_pc_1'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
    await this.talkMesageUi.show({ type: 'default', content: i18next.t('message:tutorial_pc_2'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
    await this.talkMesageUi.show({ type: 'default', content: i18next.t('message:tutorial_pc_3'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
  }

  protected onClean(): void {
    Event.emit(EVENT.ENABLE_DAY_NIGHT_FILTER);

    playEffectSound(this.scene, AUDIO.CANCEL_1);
    runFadeEffect(this.scene, 800, 'in');
    this.container.setVisible(false);

    this.pcBoxUi.clean();
    this.pcSummary.clean();
  }

  pause(onoff: boolean, data?: any): void {
    if (!onoff) {
      this.pcBoxUi.pause(onoff);
    }
  }

  update(time: number, delta: number): void {}

  handleKeyInput(data?: any): void {}
}

enum PcInputMode {
  BOX_GRID = 'BOX_GRID',
  BOX_HEADER = 'BOX_HEADER',
  PARTY = 'PARTY',
}

export class PcBoxUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private pokeIconContainer!: Phaser.GameObjects.Container;
  private partyContainer!: Phaser.GameObjects.Container;
  private pcSummaryUi!: PcSummaryUi;
  private inputNicknameUi!: InputNicknameUi;

  private menu: MenuUi;
  private evolveListMenu: MenuListUi;
  private skillListMenu: MenuListUi;
  private boxMenu: MenuUi;
  private partyMenu: MenuUi;
  private boxListMenu: MenuListUi;
  private boxBgListMenu: MenuListUi;
  private noticeUi: NoticeUi;
  private questionUi: QuestionMessageUi;
  private talkUi: TalkMessageUi;

  private boxBg!: Phaser.GameObjects.Image;
  private window!: Phaser.GameObjects.NineSlice;
  private boxTitle!: Phaser.GameObjects.Text;
  private boxArrowLeft!: Phaser.GameObjects.Image;
  private boxArrowRight!: Phaser.GameObjects.Image;
  private boxTitleDummy!: Phaser.GameObjects.Image;

  private boxIcons: Phaser.GameObjects.Image[] = [];
  private boxDummys: Phaser.GameObjects.Image[] = [];
  private boxShinyIcons: Phaser.GameObjects.Image[] = [];

  private partyIcons: Phaser.GameObjects.Image[] = [];
  private partyDummys: Phaser.GameObjects.Image[] = [];
  private partyShinyIcons: Phaser.GameObjects.Image[] = [];
  private partyFollowIcons: Phaser.GameObjects.Image[] = [];

  private boxPokemons: PlayerPokemon[] = [];
  private currentBoxIndex: number = 0;
  private boxSelection: { row: number; col: number } = { row: 0, col: 0 };
  private partySelection: number = 0;
  private currentInputMode: PcInputMode = PcInputMode.BOX_GRID;
  private currentPokemonCrySound: Phaser.Sound.BaseSound | null = null;
  private pokemonCryDebounceTimer: Phaser.Time.TimerEvent | null = null;
  private pendingCryPokedex: string | null = null;

  private readonly FINGER: TEXTURE = TEXTURE.FINGER;
  private readonly MAX_ROW: number = 9;
  private readonly MAX_COLUMN: number = 7;
  private readonly MAX_BOX_INDEX: number = 32;
  private readonly BOX_ICON_HEIGHT: number = 90;
  private readonly BOX_ICON_SPACING: number = 15;
  private readonly PARTY_ICON_HEIGHT: number = 70;
  private readonly PARTY_ICON_SPACING: number = 20;

  constructor(scene: InGameScene) {
    super(scene);

    this.menu = new MenuUi(scene);
    this.evolveListMenu = new MenuListUi(scene);
    this.skillListMenu = new MenuListUi(scene);
    this.boxMenu = new MenuUi(scene);
    this.partyMenu = new MenuUi(scene);
    this.noticeUi = new NoticeUi(scene);
    this.boxListMenu = new MenuListUi(scene);
    this.boxBgListMenu = new MenuListUi(scene);
    this.questionUi = new QuestionMessageUi(scene);
    this.talkUi = new TalkMessageUi(scene);
    this.inputNicknameUi = new InputNicknameUi(scene);
  }

  setup(data?: PcSummaryUi): void {
    if (data) this.pcSummaryUi = data;

    const width = this.getWidth();
    const height = this.getHeight();

    this.setupMenus();
    this.setupBox(width, height);
    this.setupParty(width, height);
    this.createBoxIcons();
    this.createPartyIcons();
    this.inputNicknameUi.setup();
  }

  async show(data?: unknown): Promise<void> {
    this.container.setVisible(true);
    this.pokeIconContainer.setVisible(true);
    this.partyContainer.setVisible(true);

    this.currentBoxIndex = PC.getLastBoxIndexOnPcUi();
    this.boxSelection = PC.getLastBoxSelectionOnPcUi();

    this.currentInputMode = PcInputMode.BOX_GRID;

    this.showPartyDummyIcon();
    await this.renderBox(this.currentBoxIndex);
    this.showPartyIcon();
    this.showPartyFollowIcon();
    this.renderBackground(this.currentBoxIndex);

    this.handleKeyInput();
  }

  protected onClean(): void {
    if (this.pokemonCryDebounceTimer) {
      this.pokemonCryDebounceTimer.remove();
      this.pokemonCryDebounceTimer = null;
    }
    this.pendingCryPokedex = null;

    if (this.currentPokemonCrySound && this.currentPokemonCrySound.isPlaying) {
      this.currentPokemonCrySound.stop();
      this.currentPokemonCrySound.destroy();
      this.currentPokemonCrySound = null;
    }

    this.container.setVisible(false);
    this.pokeIconContainer.setVisible(false);
    this.partyContainer.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {
    this.handleKeyInput();
  }
  update(time?: number, delta?: number): void {}

  handleKeyInput(...data: any[]): void {
    switch (this.currentInputMode) {
      case PcInputMode.BOX_GRID:
        this.handleBoxGridInput();
        break;
      case PcInputMode.BOX_HEADER:
        this.handleBoxHeaderInput();
        break;
      case PcInputMode.PARTY:
        this.handlePartyInput();
        break;
    }
  }

  private waitForKeyInput(allowedKeys: KEY[]): Promise<KEY> {
    return new Promise((resolve) => {
      Keyboard.setAllowKey(allowedKeys);
      Keyboard.setKeyDownCallback((key) => {
        Keyboard.setKeyDownCallback(() => {});
        resolve(key);
      });
    });
  }

  private handleBoxGridInput(): void {
    let { row, col } = this.boxSelection;
    let choice = row * this.MAX_ROW + col;

    this.updateBoxSelection(choice);
    this.pcSummaryUi.updateSummary(this.boxPokemons[choice]);

    this.processBoxGridInput();
  }

  private async processBoxGridInput(): Promise<void> {
    let { row, col } = this.boxSelection;
    let choice = row * this.MAX_ROW + col;

    while (this.currentInputMode === PcInputMode.BOX_GRID) {
      const key = await this.waitForKeyInput([KEY.ARROW_UP, KEY.ARROW_DOWN, KEY.ARROW_LEFT, KEY.ARROW_RIGHT, KEY.Z, KEY.ENTER, KEY.X, KEY.ESC]);
      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.ARROW_UP:
            if (row > -1) row--;
            if (row === -1) {
              this.stopPokemonCryDebounceTimer();
              this.switchToBoxHeader();
              return;
            }
            break;
          case KEY.ARROW_DOWN:
            if (row < this.MAX_COLUMN - 1) row++;
            break;
          case KEY.ARROW_LEFT:
            if (col > -1) col--;
            if (col === -1) {
              this.stopPokemonCryDebounceTimer();
              this.switchToParty();
              return;
            }
            break;
          case KEY.ARROW_RIGHT:
            if (col < this.MAX_ROW - 1) col++;
            break;
          case KEY.ENTER:
          case KEY.Z:
            const pokemon = this.boxPokemons[choice];
            if (pokemon) {
              playEffectSound(this.scene, AUDIO.SELECT_0);
              await this.handlePokemonMenu(pokemon, choice);
              if (this.currentInputMode === PcInputMode.BOX_GRID) {
                choice = this.boxSelection.row * this.MAX_ROW + this.boxSelection.col;
                this.updateBoxSelection(choice);
                this.pcSummaryUi.updateSummary(this.boxPokemons[choice]);
              }
            }
            continue;
          case KEY.ESC:
          case KEY.X:
            PC.setLastBoxIndexOnPcUi(this.currentBoxIndex);
            PC.setLastBoxSelectionOnPcUi(this.boxSelection);
            Game.removeUi(UI.PC);
            return;
        }

        choice = row * this.MAX_ROW + col;
        if (choice !== prevChoice) {
          playEffectSound(this.scene, AUDIO.SELECT_0);
          this.stopPokemonCryDebounceTimer();
          this.pcSummaryUi.stopSpeakerAnimation();

          if (PlayerGlobal.pokemonCryFlagInPc) {
            this.playPokemonCrySound(this.boxPokemons[choice]?.getPokedex());
          }

          this.boxSelection = { row, col };
          this.updateBoxSelection(choice);
          this.pcSummaryUi.updateSummary(this.boxPokemons[choice]);
        }
      } catch (error) {
        console.error(`Error handling box grid input: ${error}`);
      }
    }
  }

  private stopPokemonCryDebounceTimer(): void {
    if (this.pokemonCryDebounceTimer) {
      this.pokemonCryDebounceTimer.remove();
      this.pokemonCryDebounceTimer = null;
    }
  }

  private playPokemonCrySound(pokedex: string): void {
    this.stopPokemonCryDebounceTimer();

    this.pendingCryPokedex = pokedex;

    this.pokemonCryDebounceTimer = this.scene.time.delayedCall(300, () => {
      if (this.pendingCryPokedex) {
        this.executePokemonCrySound(this.pendingCryPokedex);
        this.pendingCryPokedex = null;
      }
      this.pokemonCryDebounceTimer = null;
    });
  }

  private executePokemonCrySound(pokedex: string): void {
    if (this.currentPokemonCrySound && this.currentPokemonCrySound.isPlaying) {
      this.currentPokemonCrySound.stop();
      this.currentPokemonCrySound.destroy();
      this.currentPokemonCrySound = null;
    }

    if (this.scene.cache.audio.exists(pokedex)) {
      this.currentPokemonCrySound = this.scene.sound.add(pokedex, {
        volume: Option.getEffectVolume(),
        loop: false,
      }) as Phaser.Sound.BaseSound;
      this.pcSummaryUi.runSpeakerAnimation();
      this.currentPokemonCrySound.play();

      this.currentPokemonCrySound.once('complete', () => {
        this.currentPokemonCrySound = null;
      });
    }
  }

  private handleBoxHeaderInput(): void {
    this.boxTitleDummy.setTexture(this.FINGER);
    this.setBoxArrowsTint(true);

    this.processBoxHeaderInput();
  }

  private async processBoxHeaderInput(): Promise<void> {
    let boxIndex = this.currentBoxIndex;

    while (this.currentInputMode === PcInputMode.BOX_HEADER) {
      const key = await this.waitForKeyInput([KEY.ARROW_DOWN, KEY.ARROW_LEFT, KEY.ARROW_RIGHT, KEY.Z, KEY.X, KEY.ESC, KEY.ENTER]);
      const prevBoxIndex = boxIndex;

      try {
        switch (key) {
          case KEY.ARROW_DOWN:
            playEffectSound(this.scene, AUDIO.SELECT_0);
            this.switchToBoxGrid();
            return;
          case KEY.ENTER:
          case KEY.Z:
            playEffectSound(this.scene, AUDIO.SELECT_0);
            await this.handleBoxMenu();
            if (this.currentInputMode === PcInputMode.BOX_HEADER) {
              boxIndex = this.currentBoxIndex;
            }
            continue;
          case KEY.ARROW_LEFT:
            boxIndex = (boxIndex - 1 + this.MAX_BOX_INDEX + 1) % (this.MAX_BOX_INDEX + 1);
            break;
          case KEY.ARROW_RIGHT:
            boxIndex = (boxIndex + 1) % (this.MAX_BOX_INDEX + 1);
            break;
          case KEY.ESC:
          case KEY.X:
            PC.setLastBoxIndexOnPcUi(this.currentBoxIndex);
            PC.setLastBoxSelectionOnPcUi(this.boxSelection);
            Game.removeUi(UI.PC);
            return;
        }

        if (boxIndex !== prevBoxIndex) {
          playEffectSound(this.scene, AUDIO.SELECT_0);
          this.currentBoxIndex = boxIndex;
          await this.renderBox(boxIndex);
          this.renderBackground(boxIndex);
        }
      } catch (error) {
        console.error(`Error handling box header input: ${error}`);
      }
    }
  }

  private handlePartyInput(): void {
    let choice = this.partySelection;

    this.updatePartySelection(choice);
    const partyPokemon = PC.getParty()[choice];
    this.pcSummaryUi.updateSummary(partyPokemon as PlayerPokemon);

    this.processPartyInput();
  }

  private async processPartyInput(): Promise<void> {
    let choice = this.partySelection;

    while (this.currentInputMode === PcInputMode.PARTY) {
      const key = await this.waitForKeyInput([KEY.ARROW_UP, KEY.ARROW_DOWN, KEY.ARROW_RIGHT, KEY.Z, KEY.ENTER, KEY.X, KEY.ESC]);
      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.ARROW_UP:
            if (choice > 0) choice--;
            break;
          case KEY.ARROW_DOWN:
            if (choice < MAX_PARTY_SLOT - 1) choice++;
            break;
          case KEY.ARROW_RIGHT:
            playEffectSound(this.scene, AUDIO.SELECT_0);
            this.switchToBoxGrid();
            return;
          case KEY.ENTER:
          case KEY.Z:
            const pokemon = PC.getParty()[choice] ?? null;
            if (pokemon) {
              playEffectSound(this.scene, AUDIO.SELECT_0);
              await this.handlePartyMenu(pokemon);
              if (this.currentInputMode === PcInputMode.PARTY) {
                choice = this.partySelection;
                this.updatePartySelection(choice);
                const partyPokemon = PC.getParty()[choice];
                this.pcSummaryUi.updateSummary(partyPokemon as PlayerPokemon);
              }
            }
            continue;
          case KEY.ESC:
          case KEY.X:
            this.clean();
            PC.setLastBoxIndexOnPcUi(this.currentBoxIndex);
            PC.setLastBoxSelectionOnPcUi(this.boxSelection);
            Game.removeUi(UI.PC);
            return;
        }

        if (choice !== prevChoice) {
          playEffectSound(this.scene, AUDIO.SELECT_0);
          this.partySelection = choice;
          this.updatePartySelection(choice);
          const partyPokemon = PC.getParty()[choice];
          this.pcSummaryUi.updateSummary(partyPokemon as PlayerPokemon);
        }
      } catch (error) {
        console.error(`Error handling party input: ${error}`);
      }
    }
  }

  private switchToBoxGrid(): void {
    this.currentInputMode = PcInputMode.BOX_GRID;
    this.boxTitleDummy.setTexture(TEXTURE.BLANK);
    this.setBoxArrowsTint(false);
    if (this.partyDummys[this.partySelection]) {
      this.partyDummys[this.partySelection].setTexture(TEXTURE.BLANK);
    }
    this.handleKeyInput();
  }

  private switchToBoxHeader(): void {
    playEffectSound(this.scene, AUDIO.SELECT_0);
    this.currentInputMode = PcInputMode.BOX_HEADER;
    const choice = this.boxSelection.row * this.MAX_ROW + this.boxSelection.col;
    this.boxDummys[choice].setTexture(TEXTURE.BLANK);
    this.handleKeyInput();
  }

  private switchToParty(): void {
    playEffectSound(this.scene, AUDIO.SELECT_0);
    this.currentInputMode = PcInputMode.PARTY;
    this.partySelection = 0;
    const choice = this.boxSelection.row * this.MAX_ROW + this.boxSelection.col;
    this.boxDummys[choice].setTexture(TEXTURE.BLANK);
    this.handleKeyInput();
  }

  private updateBoxSelection(choice: number): void {
    this.boxDummys.forEach((dummy) => dummy.setTexture(TEXTURE.BLANK));

    if (this.boxDummys[choice]) {
      this.boxDummys[choice].setTexture(this.FINGER);
    }
  }

  private updatePartySelection(choice: number): void {
    this.partyDummys.forEach((dummy) => dummy.setTexture(TEXTURE.BLANK));

    if (this.partyDummys[choice]) {
      this.partyDummys[choice].setTexture(this.FINGER);
    }
  }

  private async handlePokemonMenu(pokemon: PlayerPokemon, index: number): Promise<void> {
    const isInParty = PC.findParty(pokemon)[0] !== null;

    this.menu.updateInfo(isInParty ? i18next.t('menu:addParty') : i18next.t('menu:removeParty'), isInParty ? i18next.t('menu:removeParty') : i18next.t('menu:addParty'));

    this.menu.show();

    if (pokemon.getEvol().next === null) {
      this.menu.updateInfoColor(i18next.t('menu:evolve'), TEXTSTYLE.MESSAGE_GRAY);
    } else {
      this.menu.updateInfoColor(i18next.t('menu:evolve'), TEXTSTYLE.MESSAGE_BLACK);
    }

    const ret = await this.menu.handleKeyInput();

    if (ret === i18next.t('menu:addParty')) {
      await this.handleAddParty(pokemon);
    } else if (ret === i18next.t('menu:removeParty')) {
      await this.handleRemoveParty(pokemon);
    } else if (ret === i18next.t('menu:boxJump')) {
      await this.handleBoxJump(pokemon);
    } else if (ret === i18next.t('menu:evolve')) {
      await this.handleEvolve(pokemon);
    } else if (ret === i18next.t('menu:rename')) {
      await this.handleRename(pokemon);
    } else if (ret === i18next.t('menu:moveTutor')) {
      await this.handleLearnSkill(pokemon);
    }

    this.handleKeyInput();
  }

  private async handleLearnSkill(pokemon: PlayerPokemon): Promise<void> {
    const pokemonData = getPokemonData(pokemon.getPokedex());
    const moveTutor = pokemonData?.skills ?? [];

    const { list, labels } = this.createSkillListMenuForm(pokemon, moveTutor);
    this.skillListMenu.updateInfo(list);

    labels.forEach(([canSkill, text]) => {
      if (!canSkill) {
        this.skillListMenu.updateContentColor(i18next.t(`menu:${text}`), TEXTSTYLE.MESSAGE_GRAY);
      }
    });

    const ret = await this.skillListMenu.handleKeyInput();
    const targetSkill = moveTutor[Number(ret)];
    let checkSuccess = false;

    if (ret === i18next.t('menu:cancelMenu')) return;

    await this.questionUi.show({
      type: 'default',
      content: replacePercentSymbol(i18next.t('message:learn_skill_question'), [i18next.t(`pokemon:${pokemon.getPokedex()}.name`), i18next.t(`menu:${targetSkill}`)]),
      speed: Option.getTextSpeed()!,
      yes: async () => {
        const apiRet = await LearnSkillApi({ idx: pokemon.getIdx(), target: Number(ret) });

        if (apiRet.result) {
          pokemon.addSkill(targetSkill as PokemonHiddenMove);
          this.pcSummaryUi.updateSkillSummary(pokemon.getSkill());
          Bag.useItem(targetSkill);
          checkSuccess = true;
        } else {
          if (apiRet.data === ErrorCode.INGAME_PC_SKILL_IS_FULL) {
            playEffectSound(this.scene, AUDIO.BUZZER);
            await this.noticeUi.show({ content: i18next.t('message:warn_pc_skill_is_full'), window: TEXTURE.WINDOW_NOTICE_2, textStyle: TEXTSTYLE.MESSAGE_BLACK });
          } else if (apiRet.data === ErrorCode.INGAME_PC_SKILL_EXIST) {
            playEffectSound(this.scene, AUDIO.BUZZER);
            await this.noticeUi.show({ content: i18next.t('message:warn_skill_exist'), window: TEXTURE.WINDOW_NOTICE_2, textStyle: TEXTSTYLE.MESSAGE_BLACK });
          }
        }
      },
      no: async () => {},
    });

    if (checkSuccess) {
      playEffectSound(this.scene, AUDIO.GET_1);
      await this.talkUi.show({
        type: 'default',
        content: replacePercentSymbol(i18next.t('message:success_skill_learn'), [i18next.t(`pokemon:${pokemon.getPokedex()}.name`), i18next.t(`menu:${targetSkill}`)]),
        speed: Option.getTextSpeed()!,
        endDelay: MessageEndDelay.DEFAULT,
      });
    }
  }

  private async handlePartyMenu(pokemon: PlayerPokemon): Promise<void> {
    const isPet = PC.findPet(pokemon);

    this.partyMenu.updateInfo(isPet ? i18next.t('menu:follow') : i18next.t('menu:removeFollow'), isPet ? i18next.t('menu:removeFollow') : i18next.t('menu:follow'));
    this.partyMenu.show();

    const ret = await this.partyMenu.handleKeyInput();

    if (ret === i18next.t('menu:removeParty')) {
      await this.handleRemoveParty(pokemon);
    } else if (ret === i18next.t('menu:follow')) {
      await this.handleSetPet(pokemon);
    } else if (ret === i18next.t('menu:removeFollow')) {
      await this.handleRemovePet(pokemon);
    }

    this.handlePartyInput();
  }

  private async handleBoxMenu(): Promise<void> {
    this.boxMenu.show();
    const ret = await this.boxMenu.handleKeyInput();

    if (ret === i18next.t('menu:boxJump')) {
      await this.handleBoxJumpFromHeader();
    } else if (ret === i18next.t('menu:boxBackground')) {
      await this.handleBoxBackground();
    } else if (ret === i18next.t('menu:rename')) {
      await this.handleBoxRename();
    }

    this.handleBoxHeaderInput();
  }

  private async handleAddParty(pokemon: PlayerPokemon): Promise<void> {
    if (PC.registerParty(pokemon)) {
      this.showPartyIcon();
      this.updateBoxIconAlpha(pokemon, true);
    } else {
      playEffectSound(this.scene, AUDIO.BUZZER);
      await this.noticeUi.show({ content: i18next.t('message:warn_full_party'), window: TEXTURE.WINDOW_NOTICE_2, textStyle: TEXTSTYLE.MESSAGE_BLACK });
    }
  }

  private async handleRemoveParty(pokemon: PlayerPokemon): Promise<void> {
    if (PC.getHiddenMovePokemon()?.getIdx() === pokemon.getIdx()) {
      playEffectSound(this.scene, AUDIO.BUZZER);
      await this.noticeUi.show({ content: i18next.t('message:warn_hidden_move_pokemon'), window: TEXTURE.WINDOW_NOTICE_2, textStyle: TEXTSTYLE.MESSAGE_BLACK });
      return;
    }

    if (PC.findPet(pokemon)) {
      PC.cancelPet();
      this.showPartyFollowIcon();
    }

    PC.registerCancelParty(pokemon);
    this.showPartyIcon();
    this.updateBoxIconAlpha(pokemon, false);
  }

  private async handleBoxJump(pokemon: PlayerPokemon): Promise<void> {
    this.boxListMenu.updateInfo(this.createBoxListMenuForm());
    const jump = await this.boxListMenu.handleKeyInput();

    if (typeof jump === 'number' && this.currentBoxIndex !== jump) {
      await this.movePlayerPokemon(pokemon, this.currentBoxIndex, jump);
    }
  }

  private async handleBoxJumpFromHeader(): Promise<void> {
    this.boxListMenu.updateInfo(this.createBoxListMenuForm());
    const jump = await this.boxListMenu.handleKeyInput();

    if (typeof jump === 'number' && this.currentBoxIndex !== jump) {
      this.currentBoxIndex = jump;
      this.renderBackground(jump);
      await this.renderBox(jump);
    }
  }

  private async handleEvolve(pokemon: PlayerPokemon): Promise<void> {
    const pokemonData = getPokemonData(pokemon.getPokedex());
    const nextEvol = pokemonData?.nextEvol ?? { next: [], cost: [] };

    const { list, evolLabels } = this.createEvolveListMenuForm({ ...nextEvol, target: pokemon });
    this.evolveListMenu.updateInfo(list);

    evolLabels.forEach(([canEvolve, text]) => {
      if (!canEvolve) {
        this.evolveListMenu.updateContentColor(text, TEXTSTYLE.MESSAGE_GRAY);
      }
    });

    const ret = await this.evolveListMenu.handleKeyInput();
    const evolIdx = Number(ret);

    if (ret === i18next.t('menu:cancelMenu')) return;

    await this.questionUi.show({
      type: 'default',
      content: replacePercentSymbol(i18next.t('message:evolve_question'), [i18next.t(`pokemon:${pokemon.getPokedex()}.name`), i18next.t(`pokemon:${pokemonData?.nextEvol?.next[evolIdx]}.name`)]),
      speed: Option.getTextSpeed()!,
      yes: async () => {
        const selectedCost = nextEvol.cost[evolIdx];
        if (selectedCost) {
          this.consumeEvolveCost(selectedCost);
        }

        this.pcSummaryUi.updateYourCandy();

        const res = await EvolvePcApi({ idx: pokemon.getIdx(), target: evolIdx, time: new Date().toISOString() });
        if (res?.result) {
          for (const data of res.data as EvolPcRes[]) {
            PC.resetPcMappingByKey(data.box, data.pokemons);
          }
          this.cleanupPlayerPokemon(PC.getPcMappingByKey(this.currentBoxIndex) ?? []);

          PC.restorePetAndParty(pokemon.getIdx(), res.data as EvolPcRes[]);
          this.showPartyIcon();
          this.showPartyFollowIcon();

          await Game.changeMode(MODE.EVOLVE, { start: pokemon, next: pokemonData?.nextEvol?.next[evolIdx] });
        } else {
          if (res?.data === ErrorCode.NOT_ENOUGH_EVOLVE_CONDITION) {
            playEffectSound(this.scene, AUDIO.BUZZER);
            await this.noticeUi.show({ content: i18next.t('message:warn_not_enough_evolve_condition'), window: TEXTURE.WINDOW_NOTICE_0 });
            this.handleKeyInput();
          }
        }
      },
      no: async () => {},
    });
  }

  private async handleRename(pokemon: PlayerPokemon): Promise<void> {
    Keyboard.setKeyDownCallback(() => {});

    const nicknameContent = pokemon.getNickname() ? pokemon.getNickname() : i18next.t(`pokemon:${pokemon.getPokedex()}.name`);
    const nickname = await this.inputNicknameUi.show({ content: nicknameContent!, title: i18next.t('menu:renamePokemonName') });

    Keyboard.setKeyDownCallback(() => {});

    if (this.currentInputMode === PcInputMode.BOX_GRID) {
      this.handleKeyInput();
    } else if (this.currentInputMode === PcInputMode.PARTY) {
      this.handleKeyInput();
    }

    if (nickname !== i18next.t('menu:cancel')) {
      pokemon.setNickname(nickname);
      PC.setPokemonNewNickname(pokemon.getIdx(), nickname);
      SocketManager.getInstance().changePokemonNickname(pokemon.getIdx(), nickname);
      this.pcSummaryUi.updateNickname(pokemon);
    }
  }

  private async handleSetPet(pokemon: PlayerPokemon): Promise<void> {
    PC.setPet(pokemon);
    this.showPartyFollowIcon();
    SocketManager.getInstance().changePet({ idx: pokemon.getIdx(), texture: getOverworldPokemonTexture(pokemon) });
  }

  private async handleRemovePet(pokemon: PlayerPokemon): Promise<void> {
    PC.cancelPet();
    this.showPartyFollowIcon();
    SocketManager.getInstance().changePet({ idx: pokemon.getIdx(), texture: null });
  }

  private async handleBoxBackground(): Promise<void> {
    this.boxBgListMenu.updateInfo(this.createBoxBgListMenuForm());
    const bgIdx = await this.boxBgListMenu.handleKeyInput();

    if (typeof bgIdx === 'number') {
      SocketManager.getInstance().changePcBg(this.currentBoxIndex, bgIdx);
      PC.getBoxBgs()[this.currentBoxIndex] = bgIdx;
      this.renderBackground(this.currentBoxIndex);
    }
  }

  private async handleBoxRename(): Promise<void> {
    Keyboard.setKeyDownCallback(() => {});

    const nicknameContent = PC.getBoxNames()[this.currentBoxIndex] !== '' ? PC.getBoxNames()[this.currentBoxIndex] : i18next.t(`box${this.currentBoxIndex}`);
    const nickname = await this.inputNicknameUi.show({ content: nicknameContent!, title: i18next.t('menu:renameBoxName') });

    Keyboard.setKeyDownCallback(() => {});

    if (this.currentInputMode === PcInputMode.BOX_HEADER) {
      this.handleBoxHeaderInput();
    }

    if (nickname !== i18next.t('menu:cancel')) {
      SocketManager.getInstance().changePcName(this.currentBoxIndex, nickname);
      PC.getBoxNames()[this.currentBoxIndex] = nickname;
      this.renderBackground(this.currentBoxIndex);
    }
  }

  private setupMenus(): void {
    this.menu.setup();
    this.menu.setupContent([i18next.t('menu:addParty'), i18next.t('menu:boxJump'), i18next.t('menu:evolve'), i18next.t('menu:moveTutor'), i18next.t('menu:rename'), i18next.t('menu:cancelMenu')]);
    this.boxMenu.setup();
    this.boxMenu.setupContent([i18next.t('menu:boxJump'), i18next.t('menu:boxBackground'), i18next.t('menu:rename'), i18next.t('menu:cancelMenu')]);
    this.partyMenu.setup();
    this.partyMenu.setupContent([i18next.t('menu:removeParty'), i18next.t('menu:follow'), i18next.t('menu:cancel')]);
    this.noticeUi.setup();
    this.evolveListMenu.setup({ scale: 2, etcScale: 1, windowWidth: 450, offsetX: 50, offsetY: 425, depth: DEPTH.MESSAGE - 1, per: 6, info: [], window: Option.getFrame('text') as TEXTURE });
    this.skillListMenu.setup({ scale: 2, etcScale: 1, windowWidth: 330, offsetX: 290, offsetY: 425, depth: DEPTH.MESSAGE - 1, per: 6, info: [], window: Option.getFrame('text') as TEXTURE });
    this.boxListMenu.setup({ scale: 2, etcScale: 2, windowWidth: 300, offsetX: 350, offsetY: 425, depth: DEPTH.MESSAGE - 1, per: 10, info: [], window: Option.getFrame('text') as TEXTURE });
    this.boxBgListMenu.setup({ scale: 2, etcScale: 2, windowWidth: 300, offsetX: 350, offsetY: 425, depth: DEPTH.MESSAGE - 1, per: 8, info: [], window: Option.getFrame('text') as TEXTURE });
    this.questionUi.setup();
    this.talkUi.setup();
  }

  private setupBox(width: number, height: number): void {
    this.container = this.createContainer(width / 2 - 265, height / 2 + 20);
    this.pokeIconContainer = this.createContainer(width / 2 - 685, height / 2 - 215);

    this.window = this.addWindow(TEXTURE.WINDOW_SYS, 0, 0, 402, 402, 16, 16, 16, 16).setScale(2.4);
    this.boxBg = this.addImage(`box0`, 0, 0).setDisplaySize(954, 954);
    this.boxTitle = this.addText(0, -405, '', TEXTSTYLE.MESSAGE_BLACK).setScale(0.8).setOrigin(0.5, 0.5);
    this.boxTitleDummy = this.addImage(TEXTURE.BLANK, +10, -380).setScale(3);
    this.boxArrowLeft = this.addImage(TEXTURE.PC_ARROW, -410, -410).setDisplaySize(100, 100);
    this.boxArrowRight = this.addImage(TEXTURE.PC_ARROW, +410, -410).setDisplaySize(100, 100).setFlipX(true);

    this.container.add(this.window);
    this.container.add(this.boxBg);
    this.container.add(this.boxTitle);
    this.container.add(this.boxTitleDummy);
    this.container.add(this.boxArrowLeft);
    this.container.add(this.boxArrowRight);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.container.setScrollFactor(0);

    this.pokeIconContainer.setVisible(false);
    this.pokeIconContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.pokeIconContainer.setScrollFactor(0);
  }

  private setupParty(width: number, height: number): void {
    const windowWidth = 175;
    const windowHeight = 100 * 6;
    const windowScale = 2.8;

    this.partyContainer = this.createContainer(width / 2 - 845, height / 2 + 35);
    const partyWindow = this.addWindow(TEXTURE.WINDOW_MENU_BLACK, 0, 0, windowWidth / windowScale, windowHeight / windowScale, 16, 16, 16, 16).setScale(windowScale);
    this.partyContainer.add(partyWindow);

    this.partyContainer.setVisible(false);
    this.partyContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 3);
    this.partyContainer.setScrollFactor(0);
  }

  private createBoxIcons(): void {
    let currentX = 0;
    let currentY = 0;

    for (let i = 0; i < this.MAX_COLUMN; i++) {
      for (let j = 0; j < this.MAX_ROW; j++) {
        const icon = this.addImage(TEXTURE.BLANK, currentX, currentY);
        const dummy = this.addImage(TEXTURE.BLANK, currentX + 20, currentY + 50);
        const shiny = this.addImage(TEXTURE.BLANK, currentX - 50, currentY - 30).setScale(2.8);

        icon.setScale(2.4);
        dummy.setScale(3);

        this.boxIcons.push(icon);
        this.boxDummys.push(dummy);
        this.boxShinyIcons.push(shiny);

        this.pokeIconContainer.add(icon);
        this.pokeIconContainer.add(dummy);
        this.pokeIconContainer.add(shiny);

        currentX += this.BOX_ICON_HEIGHT + this.BOX_ICON_SPACING;
      }
      currentX = 0;
      currentY += this.BOX_ICON_HEIGHT + this.BOX_ICON_SPACING;
    }
  }

  private createPartyIcons(): void {
    let currentY = -235;

    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      const icon = this.addImage(TEXTURE.BLANK, 0, currentY).setScale(1.4);
      const dummy = this.addImage(TEXTURE.BLANK, +20, currentY + 30).setScale(2.6);
      const shiny = this.addImage(TEXTURE.BLANK, -30, currentY - 20).setScale(1.4);
      const follow = this.addImage(TEXTURE.BLANK, +35, currentY - 20).setScale(1.2);

      this.partyIcons.push(icon);
      this.partyDummys.push(dummy);
      this.partyShinyIcons.push(shiny);
      this.partyFollowIcons.push(follow);

      this.partyContainer.add(icon);
      this.partyContainer.add(dummy);
      this.partyContainer.add(shiny);
      this.partyContainer.add(follow);

      currentY += this.PARTY_ICON_HEIGHT + this.PARTY_ICON_SPACING;
    }
  }

  private async renderBox(box: number): Promise<void> {
    let pc = PC.getPcMappingByKey(box);

    if (!pc) {
      const res = await getPcApi({ box: box });
      PC.createPcMappingByKey(box, res?.data as GetPcRes[]);
      pc = PC.getPcMappingByKey(box);
    }

    this.currentBoxIndex = box;
    this.cleanupPlayerPokemon(pc ?? []);
  }

  private cleanupPlayerPokemon(data: (PlayerPokemon | null)[]): void {
    if (data.length > 0 && !(data[0] instanceof PlayerPokemon)) {
      const pc = PC.getPcMappingByKey(this.currentBoxIndex);
      this.boxPokemons = (pc ?? []).filter((p): p is PlayerPokemon => p !== null);
    } else {
      this.boxPokemons = (data as (PlayerPokemon | null)[]).filter((p): p is PlayerPokemon => p !== null);
    }
    this.showBoxDummyIcon();
    this.showBoxIcon();
  }

  private showBoxDummyIcon(): void {
    this.boxIcons.forEach((icon) => icon.setTexture(TEXTURE.BLANK));
    this.boxDummys.forEach((dummy) => dummy.setTexture(TEXTURE.BLANK));
    this.boxShinyIcons.forEach((shinyIcon) => shinyIcon.setTexture(TEXTURE.BLANK));
  }

  private showBoxIcon(): void {
    const pc = PC.getPcMappingByKey(this.currentBoxIndex);
    if (!pc) return;

    let i = 0;
    for (const pokemon of pc) {
      if (pokemon && this.boxIcons[i]) {
        this.boxIcons[i].setTexture(getPokemonTextureFromPlayerPokemon('icon', pokemon));
        this.boxShinyIcons[i].setTexture(pokemon.getShiny() ? TEXTURE.ICON_SHINY : TEXTURE.BLANK);
        this.updateBoxIconAlpha(pokemon, PC.findParty(pokemon)[0] ? true : false);
      }
      i++;
    }
  }

  private updateBoxIconAlpha(pokemon: PlayerPokemon, isInParty: boolean): void {
    const index = this.boxPokemons.findIndex((p) => p.getIdx() === pokemon.getIdx());
    if (index !== -1 && this.boxIcons[index] && this.boxShinyIcons[index]) {
      this.boxIcons[index].setAlpha(isInParty ? 0.5 : 1);
      this.boxShinyIcons[index].setAlpha(isInParty ? 0.5 : 1);
    }
  }

  private showPartyDummyIcon(): void {
    this.partyIcons.forEach((icon) => icon.setTexture(getPokemonTextureFromPlayerPokemon('icon', null)));
    this.partyDummys.forEach((dummy) => dummy.setTexture(TEXTURE.BLANK));
    this.partyShinyIcons.forEach((shinyIcon) => shinyIcon.setTexture(TEXTURE.BLANK));
  }

  private showPartyIcon(): void {
    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      const party = PC.getParty()[i] ?? null;

      if (party && this.partyIcons[i]) {
        this.partyIcons[i].setTexture(getPokemonTextureFromPlayerPokemon('icon', party));
        this.partyShinyIcons[i].setTexture(party.getShiny() ? TEXTURE.ICON_SHINY : TEXTURE.BLANK);
      } else if (this.partyIcons[i]) {
        this.partyIcons[i].setTexture(getPokemonTextureFromPlayerPokemon('icon', null));
        this.partyShinyIcons[i].setTexture(TEXTURE.BLANK);
      }
    }
  }

  private showPartyFollowIcon(): void {
    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      const party = PC.getParty()[i] ?? null;

      if (party && PC.findPet(party) && this.partyFollowIcons[i]) {
        this.partyFollowIcons[i].setTexture(TEXTURE.ICON_FOLLOW);
      } else if (this.partyFollowIcons[i]) {
        this.partyFollowIcons[i].setTexture(TEXTURE.BLANK);
      }
    }
  }

  private renderBackground(index: number): void {
    this.boxBg.setTexture(`box${PC.getBoxBgs()[index]}`);
    this.boxTitle.setText(PC.getBoxNames()[index] === '' ? i18next.t(`menu:box`) + index.toString() : PC.getBoxNames()[index]);
  }

  private setBoxArrowsTint(highlight: boolean): void {
    const tint = highlight ? -1 : 0x6a6a6a;

    if (tint < 0) {
      this.boxArrowLeft.clearTint();
      this.boxArrowRight.clearTint();
    } else {
      this.boxArrowLeft.setTint(tint);
      this.boxArrowRight.setTint(tint);
    }
  }

  private async movePlayerPokemon(pokemon: PlayerPokemon, from: number, to: number): Promise<void> {
    const ret = await MovePcApi({ target: pokemon.getIdx(), from: from, to: to });
    if (ret.result) {
      PC.movePcMappingByKey(pokemon.getIdx(), from, to);
      const originalBoxIndex = this.currentBoxIndex;
      await this.renderBox(from);
      if (originalBoxIndex === to) {
        await this.renderBox(to);
      } else {
        this.currentBoxIndex = originalBoxIndex;
      }
    }
  }

  private createEvolveListMenuForm(data: { next: string[]; cost: string[]; target: PlayerPokemon }): { list: ListForm[]; evolLabels: [boolean, string][] } {
    const list: ListForm[] = [];
    const evolLabels: [boolean, string][] = [];

    for (let i = 0; i < data.cost.length; i++) {
      const label = getPokemonEvolCostText(data.target, data.cost[i]);
      evolLabels.push(label);

      list.push({ name: label[1], nameImg: '', etc: '', etcImg: '' });
    }

    return { list, evolLabels };
  }

  private consumeEvolveCost(cost: string): void {
    const conditions = cost.split('+');

    for (const condition of conditions) {
      const trimmed = condition.trim();

      if (trimmed.startsWith('candy_')) {
        const candyAmount = Number(trimmed.split('_')[1]);
        const currentCandy = PlayerGlobal.getData()?.candy ?? 0;
        PlayerGlobal.updateData({
          candy: Math.max(0, currentCandy - candyAmount),
        });
      } else if (trimmed.startsWith('friendship_') || trimmed.startsWith('time_') || trimmed === 'male' || trimmed === 'female') {
        continue;
      } else {
        Bag.useItem(trimmed, 1);
      }
    }
  }

  private createSkillListMenuForm(targetPokemon: PlayerPokemon, data: string[]): { list: ListForm[]; labels: [boolean, string][] } {
    const list: ListForm[] = [];
    const labels: [boolean, string][] = [];

    for (const skill of data) {
      const label = getPokemonSkillText(targetPokemon, skill);
      labels.push(label);
      list.push({ name: i18next.t(`menu:${label[1]}`), nameImg: '', etc: '', etcImg: '' });
    }

    return { list, labels };
  }

  private createBoxListMenuForm(): ListForm[] {
    const boxes = PC.getBoxNames();
    const ret: ListForm[] = [];

    if (boxes) {
      boxes.forEach((box, i) => {
        ret.push({
          name: box === '' ? i18next.t(`menu:box`) + `${i}` : box,
          nameImg: '',
          etc: '',
          etcImg: '',
        });
      });
    }

    return ret;
  }

  private createBoxBgListMenuForm(): ListForm[] {
    const ret: ListForm[] = [];

    for (let i = 0; i <= MAX_PC_BG; i++) {
      ret.push({ name: i18next.t(`menu:box${i}`), nameImg: '', etc: '', etcImg: '' });
    }

    return ret;
  }
}

export class PcSummaryUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private skillContainer!: Phaser.GameObjects.Container;
  private skillContainerPosY!: number;
  private yourCandyContainer!: Phaser.GameObjects.Container;

  private sprite!: Phaser.GameObjects.Image;
  private shiny!: Phaser.GameObjects.Image;
  private name!: Phaser.GameObjects.Text;
  private gender!: Phaser.GameObjects.Text;
  private pokedex!: Phaser.GameObjects.Text;
  private type1!: Phaser.GameObjects.Image;
  private type2!: Phaser.GameObjects.Image;
  private captureCnt!: Phaser.GameObjects.Text;
  private captureCntIcon!: Phaser.GameObjects.Image;
  private captureCntTitle!: Phaser.GameObjects.Text;
  private captureLocation!: Phaser.GameObjects.Text;
  private captureDate!: Phaser.GameObjects.Text;
  private skillWindows: Phaser.GameObjects.Image[] = [];
  private skillTexts: Phaser.GameObjects.Text[] = [];
  private rank!: Phaser.GameObjects.Text;
  private friendShip!: Phaser.GameObjects.Text;
  private speakerSprite!: Phaser.GameObjects.Sprite;
  private speakerFlagIcon!: Phaser.GameObjects.Image;

  private yourCandyIcon!: Phaser.GameObjects.Image;
  private yourCandyText!: Phaser.GameObjects.Text;
  private yourCandyTitle!: Phaser.GameObjects.Text;
  private yourCandyValue!: Phaser.GameObjects.Text;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();
    this.skillContainerPosY = height / 2 + 265;

    this.container = this.createTrackedContainer(width / 2 + 660, height / 2);
    this.skillContainer = this.createTrackedContainer(width / 2 + 435, this.skillContainerPosY);

    this.setupYourCandy(width, height);
    this.createSummaryElements();
    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.container.setScrollFactor(0);

    this.skillContainer.setVisible(false);
    this.skillContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.skillContainer.setScrollFactor(0);

    this.yourCandyContainer.setVisible(false);
    this.yourCandyContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.yourCandyContainer.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.skillContainer.setVisible(true);
    this.yourCandyContainer.setVisible(true);
    this.handleMousePointer();

    this.updateYourCandy();
  }

  protected onClean(): void {
    this.container.setVisible(false);
    this.skillContainer.setVisible(false);
    this.yourCandyContainer.setVisible(false);

    this.captureCntIcon.off('pointerover');
    this.captureCntIcon.off('pointerout');
    this.captureCntIcon.disableInteractive();
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }
  handleKeyInput(...data: any[]): void {}
  update(time?: number, delta?: number): void {}

  private block() {
    this.speakerSprite.disableInteractive();
  }

  private unblock() {
    this.speakerSprite.setInteractive();
  }

  updateSummary(pokemon: PlayerPokemon | null): void {
    if (pokemon) {
      this.renderPokemonSummary(pokemon);
    } else {
      this.clearSummary();
    }
  }

  updateNickname(pokemon: PlayerPokemon): void {
    this.name.setText(pokemon.getNickname()!);
  }

  private createSummaryElements(): void {
    const topWindow = this.addImage(TEXTURE.PC_NAME, 0, -390).setScale(2.8);
    const bottomWindow = this.addImage(TEXTURE.PC_DESC, -10, +410).setScale(2.8);
    this.sprite = this.addImage(getPokemonTextureFromPlayerPokemon('front', null), 0, 0).setScale(2.8);
    this.shiny = this.addImage(TEXTURE.BLANK, +250, -350).setScale(2.8);
    this.name = this.addText(-230, -355, '', TEXTSTYLE.BOX_NAME).setOrigin(0, 0.5).setScale(1);
    this.gender = this.addText(this.name.x + this.name.displayWidth, -350, '', TEXTSTYLE.GENDER_0)
      .setOrigin(0, 0.5)
      .setScale(0.8);
    const pokedexTitle = this.addText(-230, -435, `No.`, TEXTSTYLE.BOX_POKEDEX).setOrigin(0, 0.5).setScale(1.2);
    this.pokedex = this.addText(-160, -445, `0000`, TEXTSTYLE.BOX_POKEDEX).setOrigin(0, 0.5).setScale(1.6);
    this.type1 = this.addImage(TEXTURE.TYPES, +90, -450).setScale(1.8);
    this.type2 = this.addImage(TEXTURE.TYPES, +210, -450).setScale(1.8);
    this.captureCntTitle = this.addText(-230, -190, i18next.t('menu:captureCount'), TEXTSTYLE.BOX_CAPTURE_TITLE).setScale(0.7).setOrigin(0.5, 0.5);
    this.captureCntIcon = this.addImage(`poke-ball`, -230, -250).setScale(2.8).setInteractive();
    const friendShipIcon = this.addImage(`soothe-bell`, -230, +250).setScale(2.8).setInteractive();
    const friendShipColon = this.addText(-185, +255, ':', TEXTSTYLE.BOX_CAPTURE_TITLE).setScale(0.7).setOrigin(0, 0.5);
    this.friendShip = this.addText(-155, +255, '', TEXTSTYLE.SPECIAL).setScale(0.55).setOrigin(0, 0.5);
    const captureCntColon = this.addText(-185, -250, ':', TEXTSTYLE.BOX_CAPTURE_TITLE).setScale(0.7).setOrigin(0, 0.5);
    this.captureCnt = this.addText(-155, -250, '', TEXTSTYLE.SPECIAL).setScale(0.55).setOrigin(0, 0.5);
    const captureTitle = this.addText(-110, +322, i18next.t('menu:capture'), TEXTSTYLE.BOX_POKEDEX).setScale(1);
    this.captureLocation = this.addText(-260, +405, '- ', TEXTSTYLE.SPECIAL).setScale(0.55).setOrigin(0, 0.5);
    this.captureDate = this.addText(-260, +480, '- ' + '', TEXTSTYLE.SPECIAL)
      .setScale(0.55)
      .setOrigin(0, 0.5);
    this.rank = this.addText(+200, -250, 'Legendary', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5).setScale(0.8);

    this.speakerSprite = this.createSprite(TEXTURE.SPEAKER, -380, -480).setScale(3).setInteractive({ cursor: 'pointer' });
    this.speakerFlagIcon = this.addImage(TEXTURE.X_BUTTON, -320, -445).setScale(1.4);

    this.updateSpeakerFlagIcon();

    this.container.add(topWindow);
    this.container.add(bottomWindow);
    this.container.add(this.sprite);
    this.container.add(this.name);
    this.container.add(this.shiny);
    this.container.add(this.gender);
    this.container.add(pokedexTitle);
    this.container.add(this.pokedex);
    this.container.add(this.type1);
    this.container.add(this.type2);
    this.container.add(captureTitle);
    this.container.add(this.captureCntIcon);
    this.container.add(friendShipIcon);
    this.container.add(friendShipColon);
    this.container.add(this.captureCntTitle);
    this.container.add(captureCntColon);
    this.container.add(this.captureCnt);
    this.container.add(this.friendShip);
    this.container.add(this.captureDate);
    this.container.add(this.captureLocation);
    this.container.add(this.rank);
    this.container.add(this.speakerSprite);
    this.container.add(this.speakerFlagIcon);
  }

  updateSpeakerFlagIcon(): void {
    this.speakerFlagIcon.setTexture(!PlayerGlobal.pokemonCryFlagInPc ? TEXTURE.X_BUTTON : TEXTURE.BLANK);
  }

  stopSpeakerAnimation(): void {
    if (this.speakerSprite.anims.isPlaying) {
      this.speakerSprite.anims.stop();
      this.speakerSprite.setFrame(0);
    }
  }

  runSpeakerAnimation(): void {
    this.stopSpeakerAnimation();

    this.speakerSprite.play({ key: ANIMATION.SPEAKER, frameRate: 6, repeat: 0 });

    this.speakerSprite.on('animationcomplete', () => {
      this.speakerSprite.setFrame(0);
      this.speakerSprite.anims.stop();
    });
  }

  private renderPokemonSummary(pokemon: PlayerPokemon): void {
    const name = pokemon.getNickname();
    const friendShip = pokemon.getFriendShip();

    this.sprite.setTexture(getPokemonTextureFromPlayerPokemon('front', pokemon));
    this.name.setText(name ? name : i18next.t(`pokemon:${pokemon.getPokedex()}.name`));
    this.pokedex.setText(pokemon.getPokedex());
    this.captureCnt.setText(String(pokemon.getCount()));
    this.captureLocation.setText(`- ` + i18next.t(`menu:${pokemon.getCreatedLocation()}`));
    this.captureDate.setText(`- ` + formatDateTime(pokemon.getCreatedAt()));
    this.friendShip.setText(String(friendShip));

    this.updateGenderSummary(pokemon.getGender());
    this.updateTypeSummary(pokemon.getType1()!, pokemon.getType2()!);
    this.updateSkillSummary(pokemon.getSkill());
    this.updateRankSummary(pokemon.getRank());
    this.updateShiny(pokemon);
  }

  private updateShiny(pokemon: PlayerPokemon): void {
    this.shiny.setX(this.gender.x + this.gender.displayWidth + 25);
    this.shiny.setTexture(pokemon.getShiny() ? TEXTURE.ICON_SHINY : TEXTURE.BLANK);
  }

  private clearSummary(): void {
    this.sprite.setTexture(getPokemonTextureFromPlayerPokemon('front', null));
    this.shiny.setTexture(TEXTURE.BLANK);
    this.name.setText(``);
    this.pokedex.setText(`0000`);
    this.captureCnt.setText(``);
    this.captureLocation.setText(`- `);
    this.captureDate.setText(`- `);
    this.gender.setText(``);
    this.type1.setTexture(TEXTURE.BLANK);
    this.type2.setTexture(TEXTURE.BLANK);
    this.rank.setText('');
    this.friendShip.setText('');
    this.cleanSkills();
  }

  private updateRankSummary(rank: PokemonRank): void {
    this.rank.setText(i18next.t(`menu:${rank}`));
    const margin = 690;
    const screenWidth = this.getWidth();
    const maxX = screenWidth / 2 - this.rank.displayWidth - margin;

    this.rank.setX(maxX);

    switch (rank) {
      case 'common':
        this.rank.setStyle(getTextStyle(TEXTSTYLE.RANK_COMMON));
        setTextShadow(this.rank, getTextShadow(TEXTSTYLE.RANK_COMMON));
        break;
      case 'rare':
        this.rank.setStyle(getTextStyle(TEXTSTYLE.RANK_RARE));
        setTextShadow(this.rank, getTextShadow(TEXTSTYLE.RANK_RARE));
        break;
      case 'epic':
        this.rank.setStyle(getTextStyle(TEXTSTYLE.RANK_EPIC));
        setTextShadow(this.rank, getTextShadow(TEXTSTYLE.RANK_EPIC));
        break;
      case 'legendary':
        this.rank.setStyle(getTextStyle(TEXTSTYLE.RANK_LEGENDARY));
        setTextShadow(this.rank, getTextShadow(TEXTSTYLE.RANK_LEGENDARY));
        break;
    }
  }

  private updateGenderSummary(gender: PokemonGender): void {
    this.gender.setX(this.name.x + this.name.displayWidth);
    if (gender === 'female') {
      this.gender.setText(`♀`);
      this.gender.setStyle(getTextStyle(TEXTSTYLE.GENDER_1));
    } else if (gender === 'male') {
      this.gender.setText(`♂`);
      this.gender.setStyle(getTextStyle(TEXTSTYLE.GENDER_0));
    } else {
      this.gender.setText(``);
    }
  }

  private updateTypeSummary(type_1: TYPE, type_2: TYPE): void {
    type_1 ? this.type1.setTexture(TEXTURE.TYPES, `types-${type_1}`) : this.type1.setTexture(TEXTURE.BLANK);
    type_2 ? this.type2.setTexture(TEXTURE.TYPES, `types-${type_2}`) : this.type2.setTexture(TEXTURE.BLANK);
  }

  updateSkillSummary(skills: PokemonHiddenMove[]): void {
    const contentWidth = 40;
    const spacing = 10;
    let currentY = 0;
    let targetY = [];

    this.cleanSkills();

    skills.reverse();

    for (const skill of skills) {
      const window = this.addImage(TEXTURE.BLANK, +400, currentY).setScale(1.2);
      const text = this.addText(+400, currentY, i18next.t(`menu:${skill}`), TEXTSTYLE.BOX_CAPTURE_TITLE);
      text.setScale(0.4).setOrigin(0.5, 0.5);

      window.setTexture(TEXTURE.TYPES_B, getTypesSpriteOnSkills(skill));
      window.setDisplaySize(220, 50);

      this.skillWindows.push(window);
      this.skillTexts.push(text);

      this.skillContainer.add(window);
      this.skillContainer.add(text);

      currentY += contentWidth + spacing;

      targetY.push(currentY);
    }

    const length = this.skillWindows.length;
    if (length > 1) {
      this.skillContainer.setY(this.skillContainerPosY - (length - 1) * (contentWidth + spacing));
    } else {
      this.skillContainer.setY(this.skillContainerPosY);
    }
  }

  private cleanSkills(): void {
    this.skillWindows.forEach((icon) => {
      icon.off('pointerover');
      icon.destroy();
    });
    this.skillTexts.forEach((text) => text.destroy());

    this.skillWindows = [];
    this.skillTexts = [];
    this.skillContainer.removeAll(true);
  }

  private handleMousePointer(): void {
    this.captureCntIcon.setInteractive().setScrollFactor(0);
    this.speakerSprite.setInteractive().setScrollFactor(0);
    this.captureCntTitle.setVisible(false);

    this.captureCntIcon.on('pointerover', () => {
      this.captureCntTitle.setVisible(true);
    });

    this.captureCntIcon.on('pointerout', () => {
      this.captureCntTitle.setVisible(false);
    });

    this.speakerSprite.on('pointerover', () => {
      this.speakerSprite.setTint(0xcccccc);
    });

    this.speakerSprite.on('pointerout', () => {
      this.speakerSprite.clearTint();
    });

    this.speakerSprite.on('pointerup', () => {
      PlayerGlobal.pokemonCryFlagInPc = !PlayerGlobal.pokemonCryFlagInPc;

      this.updateSpeakerFlagIcon();
    });
  }

  private setupYourCandy(width: number, height: number): void {
    const windowWidth = 180;
    const windowHeight = 190;
    const windowScale = 2.8;

    this.yourCandyContainer = this.createTrackedContainer(width / 2 - 845, height / 2 - 370);

    const window = this.addWindow(TEXTURE.WINDOW_MENU_BLACK, 0, 0, windowWidth / windowScale, windowHeight / windowScale, 16, 16, 16, 16).setScale(windowScale);
    this.yourCandyIcon = this.addImage(TEXTURE.ICON_CANDY, 0, -35).setScale(2.8);
    this.yourCandyText = this.addText(0, 0, '', TEXTSTYLE.MESSAGE_WHITE).setScale(0.7).setOrigin(0.5, 0.5);
    this.yourCandyTitle = this.addText(0, 0, '', TEXTSTYLE.MESSAGE_WHITE).setScale(0.7).setOrigin(0.5, 0.5);
    this.yourCandyValue = this.addText(0, +25, '200', TEXTSTYLE.MESSAGE_WHITE).setScale(0.8).setOrigin(0.5, 0.5);

    this.yourCandyContainer.add(window);
    this.yourCandyContainer.add(this.yourCandyIcon);
    this.yourCandyContainer.add(this.yourCandyText);
    this.yourCandyContainer.add(this.yourCandyTitle);
    this.yourCandyContainer.add(this.yourCandyValue);

    this.updateYourCandy();
  }

  updateYourCandy(): void {
    this.yourCandyValue.setText(String(PlayerGlobal.getData()?.candy));
    // this.yourCandyValue.setText('x20');
  }
}
