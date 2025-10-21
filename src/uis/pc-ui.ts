import { EvolvePcApi, getPcApi, MovePcApi } from '../api';
import { MAX_PARTY_SLOT, MAX_PC_BG } from '../constants';
import { eventBus } from '../core/event-bus';
import { GM } from '../core/game-manager';
import { AUDIO, DEPTH, EVENT, HttpErrorCode, KEY, TEXTSTYLE, TEXTURE, TYPE } from '../enums';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import { SocketHandler } from '../handlers/socket-handler';
import i18next from '../i18n';
import { PlayerPokemon } from '../obj/player-pokemon';
import { InGameScene } from '../scenes/ingame-scene';
import { GetPcRes, ListForm, PokemonGender, PokemonSkill } from '../types';
import { formatDateTime, getOverworldPokemonTexture, getPokemonType, replacePercentSymbol } from '../utils/string-util';
import { EvolveUi } from './evolve-ui';
import { InputNicknameUi } from './input-nickname-ui';
import { MenuListUi } from './menu-list-ui';
import { MenuUi } from './menu-ui';
import { NoticeUi } from './notice-ui';
import { QuestionMessageUi } from './question-message-ui';
import { addBackground, addImage, addText, addWindow, getTextStyle, playSound, runFadeEffect, Ui } from './ui';

export class PcUi extends Ui {
  private pcBoxUi: PcBoxUi;
  private pcSummary: PcSummaryUi;

  private container!: Phaser.GameObjects.Container;

  constructor(scene: InGameScene) {
    super(scene);

    this.pcBoxUi = new PcBoxUi(scene);
    this.pcSummary = new PcSummaryUi(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.pcSummary.setup();
    this.pcBoxUi.setup(this.pcSummary);

    this.container = this.scene.add.container(width / 2, height / 2);

    const bg = addBackground(this.scene, TEXTURE.BG_PC).setOrigin(0.5, 0.5);

    this.container.add(bg);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE);
    this.container.setScrollFactor(0);
  }

  show(data?: unknown): void {
    playSound(this.scene, AUDIO.OPEN_1, GM.getUserOption()?.getEffectVolume());
    runFadeEffect(this.scene, 800, 'in');
    this.container.setVisible(true);

    this.pcBoxUi.show();
    this.pcSummary.show();
  }

  clean(data?: any): void {
    playSound(this.scene, AUDIO.CANCEL_1, GM.getUserOption()?.getEffectVolume());
    runFadeEffect(this.scene, 800, 'in');

    this.container.setVisible(false);

    this.pcBoxUi.clean();
    this.pcSummary.clean();
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}

  handleKeyInput(data?: any): void {}
}

export class PcBoxUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private pokeIconContainer!: Phaser.GameObjects.Container;
  private partyContainer!: Phaser.GameObjects.Container;

  private pcSummaryUi!: PcSummaryUi;
  private menu: MenuUi;
  private boxMenu: MenuUi;
  private partyMenu: MenuUi;
  private boxListMenu: MenuListUi;
  private boxBgListMenu: MenuListUi;
  private noticeUi: NoticeUi;
  private questionUi: QuestionMessageUi;
  private evolveUi: EvolveUi;
  private inputNicknameUi: InputNicknameUi;

  private boxPokemons: PlayerPokemon[] = [];

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

  private lastRow!: number | null;
  private lastCol!: number | null;
  private lastBoxSelect!: number;
  private lastPartySelect!: number;

  private readonly finger: TEXTURE = TEXTURE.FINGER;
  private readonly MaxRow: number = 9;
  private readonly MaxColumn: number = 7;
  private readonly MaxBoxIndex: number = 32;

  constructor(scene: InGameScene) {
    super(scene);

    this.menu = new MenuUi(scene);
    this.boxMenu = new MenuUi(scene);
    this.partyMenu = new MenuUi(scene);
    this.noticeUi = new NoticeUi(scene);
    this.boxListMenu = new MenuListUi(scene);
    this.boxBgListMenu = new MenuListUi(scene);
    this.questionUi = new QuestionMessageUi(scene);
    this.evolveUi = new EvolveUi(scene);
    this.inputNicknameUi = new InputNicknameUi(scene);

    eventBus.on(EVENT.EVOLVE_FINISH_IN_PC, () => {
      this.handleKeyInput();
    });
  }

  setup(data?: PcSummaryUi): void {
    if (data) this.pcSummaryUi = data;

    const width = this.getWidth();
    const height = this.getHeight();

    this.menu.setup([i18next.t('menu:addParty'), i18next.t('menu:boxJump'), i18next.t('menu:evolve'), i18next.t('menu:rename'), i18next.t('menu:cancelMenu')]);
    this.boxMenu.setup([i18next.t('menu:boxJump'), i18next.t('menu:boxBackground'), i18next.t('menu:rename'), i18next.t('menu:cancelMenu')]);
    this.partyMenu.setup([i18next.t('menu:removeParty'), i18next.t('menu:follow'), i18next.t('menu:cancel')]);
    this.noticeUi.setup();
    this.boxListMenu.setup({ scale: 2, etcScale: 2, windowWidth: 300, offsetX: 350, offsetY: 425, depth: DEPTH.MESSAGE - 1, per: 10, info: [], window: TEXTURE.WINDOW_MENU });
    this.boxBgListMenu.setup({ scale: 2, etcScale: 2, windowWidth: 300, offsetX: 350, offsetY: 425, depth: DEPTH.MESSAGE - 1, per: 8, info: [], window: TEXTURE.WINDOW_MENU });
    this.questionUi.setup();
    this.evolveUi.setup();
    this.inputNicknameUi.setup();

    this.setupBox(width, height);
    this.setupParty(width, height);
    this.createBoxDummyIcon();
    this.createPartyDummyIcon();
  }

  async show(data?: unknown): Promise<void> {
    this.container.setVisible(true);
    this.pokeIconContainer.setVisible(true);
    this.partyContainer.setVisible(true);

    this.showPartyDummyIcon();
    await this.renderBox(this.lastBoxSelect);
    this.showPartyIcon();
    this.renderBackground(this.lastBoxSelect);

    this.handleKeyInput();
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.pokeIconContainer.setVisible(false);
    this.partyContainer.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  update(time?: number, delta?: number): void {}

  handleKeyInput(...data: any[]) {
    const keys = [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];
    const keyboard = KeyboardHandler.getInstance();

    let row = this.lastRow ? this.lastRow : 0;
    let col = this.lastCol ? this.lastCol : 0;
    let choice = row * this.MaxRow + col;

    this.boxDummys[choice].setTexture(this.finger);
    this.pcSummaryUi.updateSummary(this.boxPokemons[choice]);

    keyboard.setAllowKey(keys);
    keyboard.setKeyDownCallback((key) => {
      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            if (row > -1) row--;
            if (row === -1) {
              playSound(this.scene, AUDIO.SELECT_0, GM.getUserOption()?.getEffectVolume());

              this.boxDummys[prevChoice].setTexture(TEXTURE.BLANK);
              this.boxTitleDummy.setTexture(TEXTURE.FINGER);
              this.setboxBgArrowsTint(true);
              this.handleBoxBgKeyInput();
              return;
            }
            break;
          case KEY.DOWN:
            if (row < this.MaxColumn - 1) row++;
            break;
          case KEY.LEFT:
            if (col > -1) col--;
            if (col === -1) {
              playSound(this.scene, AUDIO.SELECT_0, GM.getUserOption()?.getEffectVolume());

              this.lastPartySelect = 0;
              this.boxDummys[prevChoice].setTexture(TEXTURE.BLANK);
              this.handlePartyKeyInput();
              return;
            }
            break;
          case KEY.RIGHT:
            if (col < this.MaxRow - 1) col++;
            break;
          case KEY.SELECT:
            const target = this.boxPokemons[choice];

            if (target) {
              playSound(this.scene, AUDIO.SELECT_0, GM.getUserOption()?.getEffectVolume());
              this.handleMenu(target, choice);
            }
            break;
          case KEY.CANCEL:
            this.boxDummys[choice].setTexture(TEXTURE.BLANK);
            GM.popUi();
            break;
        }

        choice = row * this.MaxRow + col;

        if (choice !== prevChoice) {
          playSound(this.scene, AUDIO.SELECT_0, GM.getUserOption()?.getEffectVolume());

          this.boxDummys[prevChoice].setTexture(TEXTURE.BLANK);
          this.boxDummys[choice].setTexture(this.finger);

          this.pcSummaryUi.updateSummary(this.boxPokemons[choice]);

          this.lastRow = row;
          this.lastCol = col;
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  handleBoxBgKeyInput() {
    const keys = [KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT];
    const keyboard = KeyboardHandler.getInstance();

    let page = this.lastBoxSelect ? this.lastBoxSelect : 0;

    keyboard.setAllowKey(keys);
    keyboard.setKeyDownCallback(async (key) => {
      const prevPage = page;

      try {
        switch (key) {
          case KEY.DOWN:
            playSound(this.scene, AUDIO.SELECT_0, GM.getUserOption()?.getEffectVolume());

            this.lastBoxSelect = page;
            this.boxTitleDummy.setTexture(TEXTURE.BLANK);
            this.setboxBgArrowsTint(false);
            this.handleKeyInput();
            break;
          case KEY.SELECT:
            playSound(this.scene, AUDIO.SELECT_0, GM.getUserOption()?.getEffectVolume());

            this.lastBoxSelect = page;
            this.handleBg();
            break;
          case KEY.LEFT:
            page = (page - 1 + this.MaxBoxIndex + 1) % (this.MaxBoxIndex + 1);
            break;
          case KEY.RIGHT:
            page = (page + 1) % (this.MaxBoxIndex + 1);
            break;
        }

        if (key === KEY.LEFT || key === KEY.RIGHT) {
          if (page !== prevPage) {
            playSound(this.scene, AUDIO.SELECT_0, GM.getUserOption()?.getEffectVolume());

            await this.renderBox(page);
            this.renderBackground(page);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  handlePartyKeyInput() {
    const keys = [KEY.UP, KEY.DOWN, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];
    const keyboard = KeyboardHandler.getInstance();

    let start = this.lastPartySelect ? this.lastPartySelect : 0;
    let end = MAX_PARTY_SLOT - 1;
    let choice = start;

    this.partyDummys[choice].setTexture(this.finger);
    this.pcSummaryUi.updateSummary(GM.getUserData()?.party[choice]!);

    keyboard.setAllowKey(keys);
    keyboard.setKeyDownCallback((key) => {
      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            if (choice <= MAX_PARTY_SLOT - 1 && choice >= 1) choice--;
            break;
          case KEY.DOWN:
            if (choice < end && choice < MAX_PARTY_SLOT - 1) {
              choice++;
            }
            break;
          case KEY.RIGHT:
            playSound(this.scene, AUDIO.SELECT_0, GM.getUserOption()?.getEffectVolume());

            this.partyDummys[choice].setTexture(TEXTURE.BLANK);
            this.handleKeyInput();
            break;
          case KEY.SELECT:
            const target = GM.getUserData()?.party[choice]!;

            if (target) {
              playSound(this.scene, AUDIO.SELECT_0, GM.getUserOption()?.getEffectVolume());
              this.handleParty(target);
            }

            break;
          case KEY.CANCEL:
            this.clean();
            GM.popUi();
            break;
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }

      if (choice !== prevChoice) {
        this.lastPartySelect = choice;
        playSound(this.scene, AUDIO.SELECT_0, GM.getUserOption()?.getEffectVolume());

        this.partyDummys[prevChoice].setTexture(TEXTURE.BLANK);
        this.partyDummys[choice].setTexture(this.finger);

        this.pcSummaryUi.updateSummary(GM.getUserData()?.party[choice]!);
      }
    });
  }

  async handleMenu(pokemon: PlayerPokemon, idx: number) {
    if (GM.findParty(pokemon)[0]) {
      this.menu.updateInfo(i18next.t('menu:addParty'), i18next.t('menu:removeParty'));
    } else {
      this.menu.updateInfo(i18next.t('menu:removeParty'), i18next.t('menu:addParty'));
    }

    this.menu.show();

    if (pokemon.getEvol().next === null) {
      this.menu.updateInfoColor(i18next.t('menu:evolve'), TEXTSTYLE.MESSAGE_GRAY);
      this.menu.updateEtc(i18next.t('menu:evolve'), TEXTURE.BLANK, '');
    } else {
      this.menu.updateInfoColor(i18next.t('menu:evolve'), TEXTSTYLE.MESSAGE_BLACK);
      this.menu.updateEtc(i18next.t('menu:evolve'), TEXTURE.ICON_CANDY, `x${pokemon.getEvol().cost}`, 1.2, 0.4);
    }

    const ret = await this.menu.handleKeyInput();

    if (ret === i18next.t('menu:addParty')) {
      if (GM.registerParty(pokemon)) {
        this.showPartyIcon();
        this.updateBoxIconAlpha(pokemon, true);
      } else {
        playSound(this.scene, AUDIO.BUZZER, GM.getUserOption()?.getEffectVolume());
        await this.noticeUi.show([{ content: i18next.t('message:warn_full_party') }]);
      }
    } else if (ret === i18next.t('menu:removeParty')) {
      if (GM.findPet(pokemon)) {
        GM.registerCancelPet(pokemon);
        GM.getPlayerObj().getPet()?.changePet(null);
        this.showPartyFollowIcon(pokemon);
      }

      GM.registerCancelParty(pokemon);
      this.showPartyIcon();
      this.updateBoxIconAlpha(pokemon, false);
    } else if (ret === i18next.t('menu:boxJump')) {
      this.boxListMenu.updateInfo(this.createBoxListMenuForm());
      const jump = await this.boxListMenu.handleKeyInput();

      if (typeof jump === 'number' && this.lastBoxSelect !== jump) {
        await this.movePlayerPokemon(pokemon, this.lastBoxSelect, jump as number);
      }
    } else if (ret === i18next.t('menu:evolve')) {
      await this.questionUi.show({
        type: 'default',
        content: replacePercentSymbol(i18next.t('message:evolve_question'), [i18next.t(`pokemon:${pokemon.getPokedex()}.name`), i18next.t(`pokemon:${pokemon.getEvol().next!}.name`)]),
        speed: GM.getUserOption()?.getTextSpeed()!,
        yes: async () => {
          const res = await EvolvePcApi({ target: pokemon.getIdx() });
          if (res?.result) {
            this.cleanupPlayerPokemon(res.data as GetPcRes[]);
            await this.evolveUi.show(pokemon);
          } else {
            if (res?.data === HttpErrorCode.NOT_ENOUGH_CANDY) {
              playSound(this.scene, AUDIO.BUZZER, GM.getUserOption()?.getEffectVolume());
              await this.noticeUi.show([{ content: i18next.t('message:warn_not_enough_candy') }]);
              this.handleKeyInput();
            }
          }
        },
        no: async () => {},
      });
    } else if (ret === i18next.t('menu:rename')) {
      const nicknameContent = pokemon.getNickname() ? pokemon.getNickname() : i18next.t(`pokemon:${pokemon.getPokedex()}.name`);
      const nickname = await this.inputNicknameUi.show({ content: nicknameContent!, title: i18next.t('menu:renamePokemonName') });
      this.handleKeyInput();

      if (nickname !== i18next.t('menu:cancel')) {
        pokemon.setNickname(nickname);
        GM.registerUserPokemonNickname(pokemon.getIdx(), nickname);
        this.pcSummaryUi.updateNickname(pokemon);
      }
    }

    this.handleKeyInput();
  }

  async handleParty(pokemon: PlayerPokemon) {
    if (GM.findPet(pokemon)) {
      this.partyMenu.updateInfo(i18next.t('menu:follow'), i18next.t('menu:removeFollow'));
    } else {
      this.partyMenu.updateInfo(i18next.t('menu:removeFollow'), i18next.t('menu:follow'));
    }

    this.partyMenu.show();

    const ret = await this.partyMenu.handleKeyInput();

    if (ret === i18next.t('menu:removeParty')) {
      if (GM.findPet(pokemon)) {
        GM.registerCancelPet(pokemon);
        GM.getPlayerObj().getPet()?.changePet(null);

        this.showPartyFollowIcon(pokemon);
      }

      GM.registerCancelParty(pokemon);
      this.showPartyIcon();
      this.updateBoxIconAlpha(pokemon, false);
    } else if (ret === i18next.t('menu:follow')) {
      GM.registerPet(pokemon);
      this.showPartyFollowIcon(pokemon);
      GM.getPlayerObj().getPet()?.changePet(pokemon);
      SocketHandler.getInstance().changePet({ idx: pokemon.getIdx(), texture: getOverworldPokemonTexture(pokemon) });
    } else if (ret === i18next.t('menu:removeFollow')) {
      GM.registerCancelPet(pokemon);
      this.showPartyFollowIcon(pokemon);
      GM.getPlayerObj().getPet()?.changePet(null);
      SocketHandler.getInstance().changePet({ idx: pokemon.getIdx(), texture: null });
    }

    this.handlePartyKeyInput();
  }

  async handleBg() {
    this.boxMenu.show();

    const ret = await this.boxMenu.handleKeyInput();

    if (ret === i18next.t('menu:boxJump')) {
      this.boxListMenu.updateInfo(this.createBoxListMenuForm());
      const jump = await this.boxListMenu.handleKeyInput();

      if (typeof jump === 'number' && this.lastBoxSelect !== jump) {
        //jump
        this.lastBoxSelect = jump;
        this.renderBackground(jump);
        await this.renderBox(jump);
      }
    } else if (ret === i18next.t('menu:boxBackground')) {
      this.boxBgListMenu.updateInfo(this.createBoxBgListMenuForm());
      const bgIdx = await this.boxBgListMenu.handleKeyInput();

      if (typeof bgIdx === 'number') {
        GM.registerPcBg(this.lastBoxSelect, bgIdx);
        this.renderBackground(this.lastBoxSelect);
      }
    } else if (ret === i18next.t('menu:rename')) {
      const nicknameContent = GM.getUserData()?.pcName[this.lastBoxSelect] !== '' ? GM.getUserData()?.pcName[this.lastBoxSelect] : i18next.t(`box${this.lastBoxSelect}`);
      const nickname = await this.inputNicknameUi.show({ content: nicknameContent!, title: i18next.t('menu:renameBoxName') });

      this.handleBoxBgKeyInput();

      if (nickname !== i18next.t('menu:cancel')) {
        GM.registerPcName(this.lastBoxSelect, nickname);
        this.renderBackground(this.lastBoxSelect);
      }
    }
    this.handleBoxBgKeyInput();
  }

  private setupBox(width: number, height: number) {
    this.container = this.createContainer(width / 2 - 265, height / 2 + 20);
    this.pokeIconContainer = this.createContainer(width / 2 - 685, height / 2 - 215);

    this.window = addWindow(this.scene, TEXTURE.WINDOW_SYS, 0, 0, 402, 402, 16, 16, 16, 16).setScale(2.4);
    this.boxBg = addImage(this.scene, `box0`, 0, 0).setDisplaySize(954, 954);
    this.boxTitle = addText(this.scene, 0, -405, '', TEXTSTYLE.MESSAGE_BLACK).setScale(0.8).setOrigin(0.5, 0.5);
    this.boxTitleDummy = addImage(this.scene, TEXTURE.BLANK, +10, -380).setScale(3);
    this.boxArrowLeft = addImage(this.scene, TEXTURE.PC_ARROW, -410, -410).setDisplaySize(100, 100);
    this.boxArrowRight = addImage(this.scene, TEXTURE.PC_ARROW, +410, -410).setDisplaySize(100, 100).setFlipX(true);

    this.lastBoxSelect = 0;
    this.lastRow = 0;
    this.lastCol = 0;

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

  private setupParty(width: number, height: number) {
    this.partyContainer = this.createContainer(width / 2 - 850, height / 2);

    const partyWindow = addWindow(this.scene, TEXTURE.WINDOW_SYS, 0, 0, 65, 50 * 6, 16, 16, 16, 16).setScale(2);

    this.partyContainer.add(partyWindow);

    this.partyContainer.setVisible(false);
    this.partyContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 3);
    this.partyContainer.setScrollFactor(0);
  }

  private async renderBox(box: number) {
    const res = await getPcApi({ box: box });
    this.cleanupPlayerPokemon(res?.data as GetPcRes[]);
  }

  private async movePlayerPokemon(pokemon: PlayerPokemon, from: number, to: number) {
    const res = await MovePcApi({ target: pokemon.getIdx(), from: from, to: to });
    this.cleanupPlayerPokemon(res?.data as GetPcRes[]);
  }

  private async evolvePlayerPokemon(target: PlayerPokemon) {}

  private cleanupPlayerPokemon(data: GetPcRes[]) {
    this.showBoxDummyIcon();
    this.boxPokemons = [];

    if (data && data.length > 0) {
      const pokemons = data;

      for (const pokemon of pokemons as GetPcRes[]) {
        const localNickname = GM.findUserPokemonNickname(pokemon.idx);

        const addPokemon = new PlayerPokemon(
          pokemon.idx,
          pokemon.pokedex,
          pokemon.gender,
          pokemon.shiny,
          pokemon.form,
          pokemon.count,
          pokemon.skill,
          pokemon.nickname,
          pokemon.createdLocation,
          pokemon.createdAt,
          pokemon.createdBall,
          pokemon.rank,
          pokemon.evol,
          getPokemonType(pokemon.type_1)!,
          getPokemonType(pokemon.type_2)!,
        );

        if (localNickname) {
          addPokemon.setNickname(localNickname);
        }

        this.boxPokemons.push(addPokemon);
      }
    }

    this.showBoxIcon();
  }

  private createBoxDummyIcon() {
    const contentHeight = 90;
    const spacing = 15;

    let currentX = 0;
    let currentY = 0;

    for (let i = 0; i < this.MaxColumn; i++) {
      for (let j = 0; j < this.MaxRow; j++) {
        const icon = addImage(this.scene, TEXTURE.BLANK, currentX, currentY);
        const dummy = addImage(this.scene, TEXTURE.BLANK, currentX + 20, currentY + 50);
        const shiny = addImage(this.scene, TEXTURE.BLANK, currentX - 50, currentY - 30).setScale(2.8);

        icon.setScale(2.4);
        dummy.setScale(3);

        this.boxIcons.push(icon);
        this.boxDummys.push(dummy);
        this.boxShinyIcons.push(shiny);

        this.pokeIconContainer.add(icon);
        this.pokeIconContainer.add(dummy);
        this.pokeIconContainer.add(shiny);

        currentX += contentHeight + spacing;
      }
      currentX = 0;
      currentY += contentHeight + spacing;
    }
  }

  private showBoxDummyIcon() {
    for (const icon of this.boxIcons) {
      icon.setTexture(TEXTURE.BLANK);
    }

    for (const dummy of this.boxDummys) {
      dummy.setTexture(TEXTURE.BLANK);
    }

    for (const shinyIcon of this.boxShinyIcons) {
      shinyIcon.setTexture(TEXTURE.BLANK);
    }
  }

  private showBoxIcon() {
    let i = 0;
    for (const pokemon of this.boxPokemons) {
      this.boxIcons[i].setTexture(`pokemon_icon${pokemon.getPokedex()}${pokemon.getShiny() ? 's' : ''}`);
      this.boxShinyIcons[i].setTexture(pokemon.getShiny() ? TEXTURE.ICON_SHINY : TEXTURE.BLANK);
      this.updateBoxIconAlpha(pokemon, GM.findParty(pokemon)[0] ? true : false);

      i++;
    }
  }

  private updateBoxIconAlpha(pokemon: PlayerPokemon, onoff: boolean) {
    let i = 0;

    for (const target of this.boxPokemons) {
      if (target.getIdx() === pokemon.getIdx()) {
        this.boxIcons[i].setAlpha(onoff ? 0.5 : 1);
        this.boxShinyIcons[i].setAlpha(onoff ? 0.5 : 1);
      }

      i++;
    }
  }

  private createPartyDummyIcon() {
    const contentHeight = 70;
    const spacing = 20;

    let currentY = -235;

    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      const icon = addImage(this.scene, TEXTURE.BLANK, 0, currentY).setScale(1.4);
      const dummy = addImage(this.scene, TEXTURE.BLANK, +20, currentY + 30).setScale(2.6);
      const shiny = addImage(this.scene, TEXTURE.BLANK, -30, currentY - 20).setScale(1.4);
      const follow = addImage(this.scene, TEXTURE.BLANK, +35, currentY - 20).setScale(1.2);

      this.partyIcons.push(icon);
      this.partyDummys.push(dummy);
      this.partyShinyIcons.push(shiny);
      this.partyFollowIcons.push(follow);

      this.partyContainer.add(icon);
      this.partyContainer.add(dummy);
      this.partyContainer.add(shiny);
      this.partyContainer.add(follow);

      currentY += contentHeight + spacing;
    }
  }

  private showPartyDummyIcon() {
    for (const icon of this.partyIcons) {
      icon.setTexture('pokemon_icon000');
    }

    for (const dummy of this.partyDummys) {
      dummy.setTexture(TEXTURE.BLANK);
    }

    for (const shinyIcon of this.partyShinyIcons) {
      shinyIcon.setTexture(TEXTURE.BLANK);
    }
  }

  private showPartyIcon() {
    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      const party = GM.getUserData()?.party[i];

      if (party) {
        this.partyIcons[i].setTexture(`pokemon_icon${party.getPokedex()}${party.getShiny() ? 's' : ''}`);
        this.partyShinyIcons[i].setTexture(party.getShiny() ? TEXTURE.ICON_SHINY : TEXTURE.BLANK);
      } else {
        this.partyIcons[i].setTexture('pokemon_icon000');
        this.partyShinyIcons[i].setTexture(TEXTURE.BLANK);
      }
    }
  }

  private showPartyFollowIcon(pokemon: PlayerPokemon) {
    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      const party = GM.getUserData()?.party[i];

      if (party && GM.findPet(party)) {
        this.partyFollowIcons[i].setTexture(TEXTURE.ICON_FOLLOW);
      } else {
        this.partyFollowIcons[i].setTexture(TEXTURE.BLANK);
      }
    }
  }

  private setboxBgArrowsTint(onoff: boolean) {
    let tint = onoff ? -1 : 0x6a6a6a;

    if (tint < 0) {
      this.boxArrowLeft.clearTint();
      this.boxArrowRight.clearTint();
      return;
    }

    this.boxArrowLeft.setTint(tint);
    this.boxArrowRight.setTint(tint);
  }

  private renderBackground(index: number) {
    const userData = GM.getUserData();

    if (!userData) return;

    this.boxBg.setTexture(`box${userData.pcBg[index]}`);
    this.boxTitle.setText(userData.pcName[index] === '' ? i18next.t(`menu:box`) + index.toString() : userData.pcName[index]);
  }

  private createBoxListMenuForm() {
    let ret: ListForm[] = [];
    const boxes = GM.getUserData()?.pcName;

    if (boxes) {
      let i = 0;
      for (const box of boxes) {
        if (box === '') ret.push({ name: i18next.t(`menu:box`) + `${i}`, nameImg: '', etc: '', etcImg: '' });
        else ret.push({ name: box, nameImg: '', etc: '', etcImg: '' });

        i++;
      }
    }

    return ret;
  }

  private createBoxBgListMenuForm() {
    let ret: ListForm[] = [];

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
  private skillIcons: Phaser.GameObjects.Image[] = [];
  private skillTexts: Phaser.GameObjects.Text[] = [];

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();
    this.skillContainerPosY = height / 2 + 265;

    this.container = this.scene.add.container(width / 2 + 660, height / 2);
    this.skillContainer = this.scene.add.container(width / 2 + 435, this.skillContainerPosY);

    const topWindow = addImage(this.scene, TEXTURE.PC_NAME, 0, -390).setScale(2.8);
    const bottomWindow = addImage(this.scene, TEXTURE.PC_DESC, -10, +410).setScale(2.8);
    this.sprite = addImage(this.scene, `pokemon_sprite000`, 0, 0).setScale(5);
    this.shiny = addImage(this.scene, TEXTURE.BLANK, +250, -260).setScale(2.8);
    this.name = addText(this.scene, -230, -355, '', TEXTSTYLE.BOX_NAME).setOrigin(0, 0.5).setScale(1);
    this.gender = addText(this.scene, this.name.x + this.name.displayWidth, -350, '', TEXTSTYLE.GENDER_0)
      .setOrigin(0, 0.5)
      .setScale(0.8);
    const pokedexTitle = addText(this.scene, -230, -435, `No.`, TEXTSTYLE.BOX_POKEDEX).setOrigin(0, 0.5).setScale(1.2);
    this.pokedex = addText(this.scene, -160, -445, `0000`, TEXTSTYLE.BOX_POKEDEX).setOrigin(0, 0.5).setScale(1.6);
    this.type1 = addImage(this.scene, TEXTURE.TYPES, +90, -450).setScale(1.8);
    this.type2 = addImage(this.scene, TEXTURE.TYPES, +210, -450).setScale(1.8);
    this.captureCntTitle = addText(this.scene, -230, -190, i18next.t('menu:captureCount'), TEXTSTYLE.BOX_CAPTURE_TITLE).setScale(0.7).setOrigin(0.5, 0.5);
    this.captureCntIcon = addImage(this.scene, `item002`, -230, -250).setScale(1.4).setInteractive();
    const captureCntColon = addText(this.scene, -185, -250, ':', TEXTSTYLE.BOX_CAPTURE_TITLE).setScale(0.7).setOrigin(0, 0.5);
    this.captureCnt = addText(this.scene, -155, -250, '', TEXTSTYLE.SPECIAL).setScale(0.7).setOrigin(0, 0.5);
    const captureTitle = addText(this.scene, -110, +322, i18next.t('menu:capture'), TEXTSTYLE.BOX_POKEDEX).setScale(1);
    this.captureLocation = addText(this.scene, -260, +405, '- ', TEXTSTYLE.SPECIAL).setScale(0.6).setOrigin(0, 0.5);
    this.captureDate = addText(this.scene, -260, +480, '- ' + '', TEXTSTYLE.SPECIAL)
      .setScale(0.6)
      .setOrigin(0, 0.5);

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
    this.container.add(this.captureCntTitle);
    this.container.add(captureCntColon);
    this.container.add(this.captureCnt);
    this.container.add(this.captureDate);
    this.container.add(this.captureLocation);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.container.setScrollFactor(0);

    this.skillContainer.setVisible(false);
    this.skillContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.skillContainer.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.skillContainer.setVisible(true);

    this.handleMousePointer();
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.skillContainer.setVisible(false);

    this.captureCntIcon.off('pointerover');
    this.captureCntIcon.off('pointerout');
    this.captureCntIcon.disableInteractive();
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  updateSummary(pokemon: PlayerPokemon) {
    if (pokemon) {
      const name = pokemon.getNickname();
      const shiny = pokemon.getShiny() ? 's' : '';
      const gender = pokemon.getGender() === 'male' ? 'm' : pokemon.getGender() === 'female' ? 'f' : 'm';

      this.sprite.setTexture(`pokemon_sprite${pokemon.getPokedex()}_${gender}${shiny}`);
      this.shiny.setTexture(pokemon.getShiny() ? TEXTURE.ICON_SHINY : TEXTURE.BLANK);
      this.name.setText(name ? name : i18next.t(`pokemon:${pokemon.getPokedex()}.name`));
      this.pokedex.setText(pokemon.getPokedex());
      this.captureCnt.setText(String(pokemon.getCount()));
      this.captureLocation.setText(`- ` + i18next.t(`menu:${pokemon.getCreatedLocation()}`));
      this.captureDate.setText(`- ` + formatDateTime(pokemon.getCreatedAt()));

      this.updateGenderSummary(pokemon.getGender());
      this.updateTypeSummary(pokemon.getType1()!, pokemon.getType2()!);
      this.updateSkillSummary(pokemon.getSkill());
    } else {
      this.sprite.setTexture(`pokemon_sprite000`);
      this.shiny.setTexture(TEXTURE.BLANK);
      this.name.setText(``);
      this.pokedex.setText(`0000`);
      this.captureCnt.setText(``);
      this.captureLocation.setText(`- `);
      this.captureDate.setText(`- `);
      this.gender.setText(``);
      this.type1.setTexture(TEXTURE.BLANK);
      this.type2.setTexture(TEXTURE.BLANK);
      this.cleanSkills();
    }
  }

  updateNickname(pokemon: PlayerPokemon) {
    this.name.setText(pokemon.getNickname()!);
  }

  private updateGenderSummary(gender: PokemonGender) {
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

  private updateTypeSummary(type_1: TYPE, type_2: TYPE) {
    type_1 ? this.type1.setTexture(TEXTURE.TYPES, `types-${type_1}`) : this.type1.setTexture(TEXTURE.BLANK);
    type_2 ? this.type2.setTexture(TEXTURE.TYPES, `types-${type_2}`) : this.type2.setTexture(TEXTURE.BLANK);
  }

  private updateSkillSummary(skills: PokemonSkill[]) {
    const contentWidth = 35;
    const spacing = 10;
    let currentY = 0;

    this.cleanSkills();

    for (const skill of skills) {
      if (skill === 'none') continue;

      const icon = addImage(this.scene, TEXTURE.BLANK, 0, currentY).setScale(1.2);
      const text = addText(this.scene, +40, currentY, i18next.t(`menu:${skill}`), TEXTSTYLE.BOX_CAPTURE_TITLE);
      text.setScale(0.7).setOrigin(0, 0.5);

      switch (skill) {
        case 'surf':
          icon.setTexture(`item032`);
          break;
        case 'dark_eyes':
          icon.setTexture(`item033`);
          break;
      }

      this.skillIcons.push(icon);
      this.skillTexts.push(text);

      this.skillContainer.add(icon);
      this.skillContainer.add(text);

      currentY += currentY + contentWidth + spacing;
    }

    const length = this.skillIcons.length;
    if (length > 1) {
      this.skillContainer.setY(this.skillContainerPosY - (length - 1) * (contentWidth + spacing));
    } else {
      this.skillContainer.setY(this.skillContainerPosY);
    }
  }

  private cleanSkills() {
    this.skillIcons.forEach((icon) => {
      icon.off('pointerover');
      icon.destroy();
    });
    this.skillTexts.forEach((text) => text.destroy());

    this.skillIcons = [];
    this.skillTexts = [];

    this.skillContainer.removeAll(true);
  }

  private handleMousePointer() {
    this.captureCntIcon.setInteractive().setScrollFactor(0);
    this.captureCntTitle.setVisible(false);

    this.captureCntIcon.on('pointerover', () => {
      this.captureCntTitle.setVisible(true);
    });

    this.captureCntIcon.on('pointerout', () => {
      this.captureCntTitle.setVisible(false);
    });
  }
}
