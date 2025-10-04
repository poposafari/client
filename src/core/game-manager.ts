import { autoLoginApi, enterSafariZoneApi, logoutApi } from '../api';
import { MAX_ITEM_SLOT, MAX_PARTY_SLOT } from '../constants';
import { EVENT, HttpErrorCode, MODE, TEXTURE, UI } from '../enums';
import { PlayerItem } from '../obj/player-item';
import { PlayerOption } from '../obj/player-option';
import { PlayerOverworldObj } from '../obj/player-overworld-obj';
import { PlayerPokemon } from '../obj/player-pokemon';
import { BagStorage, OverworldStorage } from '../storage';
import { GetIngameRes, IngameData, PokemonSkill } from '../types';
import { Ui } from '../uis/ui';
import { getPokemonType } from '../utils/string-util';
import { eventBus } from './event-bus';

export class GameManager {
  private static instance: GameManager;

  private registryUi = new Map<string, Ui>();
  private stackUi: Ui[] = [];
  private preMode: MODE = MODE.NONE;
  private currenctMode: MODE = MODE.NONE;
  private user!: IngameData | null;
  private userPokemonNicknames = new Map<number, string>();

  private token!: string;

  private effectVolume: number = 0.1;
  private bgVolume: number = 0.1;
  private messageSpeed: number = 1000;
  private msgWindow!: TEXTURE;

  private isRegisterPet!: boolean;

  private tempPlayerObj!: PlayerOverworldObj;
  private tempRunningToggle!: boolean;

  static get(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }

    return GameManager.instance;
  }

  private findUiOnRegistry(key: string) {
    return this.registryUi.get(key);
  }

  private pushUi(ui: Ui) {
    const top = this.getTopUiStack();
    const nextUi = ui;

    if (top) top.pause(true);

    this.stackUi.push(nextUi);
  }

  getTopUiStack(): Ui | null {
    const ret = this.stackUi[this.stackUi.length - 1];

    if (!ret) return null;

    return ret;
  }

  getPreviousMode(): MODE {
    return this.preMode;
  }

  getCurrentMode(): MODE {
    return this.currenctMode;
  }

  private cleanUi(): void {
    for (const ui of this.stackUi) {
      ui.clean();
    }

    this.stackUi = [];
  }

  registerUi(key: string, ui: Ui) {
    this.registryUi.set(key, ui);
    ui.setup();
  }

  showUi(key: string, data?: unknown) {
    const ui = this.findUiOnRegistry(key);

    if (!ui) throw new Error(`Ui not found : ${key}`);

    this.cleanUi();
    this.pushUi(ui);
    ui.show(data);
  }

  overlapUi(key: string, data?: unknown) {
    const ui = this.findUiOnRegistry(key);

    if (!ui) throw new Error(`Ui not found : ${key}`);

    this.pushUi(ui);
    ui.show(data);
  }

  popUi() {
    const ui = this.stackUi.pop();
    const preUi = this.getTopUiStack();

    if (ui) ui.clean();
    if (preUi) {
      preUi.pause(false);
      preUi.handleKeyInput();
    }
  }

  async changeMode(mode: MODE, data?: unknown) {
    let ret;

    this.preMode = this.currenctMode;
    this.currenctMode = mode;

    switch (mode) {
      case MODE.AUTO_LOGIN:
        ret = await autoLoginApi();
        if (ret!.result) {
          this.changeMode(MODE.TITLE);
        } else if (ret?.data === HttpErrorCode.NOT_FOUND_TOKEN || ret?.data === HttpErrorCode.LOGIN_FAIL) this.changeMode(MODE.LOGIN);
        break;
      case MODE.LOGIN:
        this.showUi(UI.LOGIN);
        break;
      case MODE.REGISTER:
        this.showUi(UI.REGISTER);
        break;
      case MODE.ACCOUNT_DELETE:
        this.showUi(UI.ACCOUNT_DELETE);
        break;
      case MODE.ACCOUNT_DELETE_RESTORE:
        this.showUi(UI.ACCOUNT_DELETE_RESTORE, data as string);
        break;
      case MODE.LOGOUT:
        ret = await logoutApi();
        if (ret!.result) {
          localStorage.removeItem('access_token');
          this.changeMode(MODE.LOGIN);
        }
        break;
      case MODE.CONNECT:
        this.overlapUi(UI.CONNECT);
        break;
      case MODE.CONNECT_ACCOUNT_DELETE:
        break;
      case MODE.CONNECT_SAFARI:
        const location = GM.getUserData()?.location;
        if (!location) return;

        const res = await enterSafariZoneApi({ overworld: location });

        if (res.result) {
          const wilds = res.data.wilds;
          const groundItems = res.data.groundItems;

          OverworldStorage.getInstance().setupWildData(wilds);
          OverworldStorage.getInstance().setupGroundItemInfo(groundItems);
        }

        GM.changeMode(MODE.OVERWORLD);
        break;
      case MODE.TITLE:
        this.showUi(UI.TITLE);
        break;
      case MODE.NEWGAME:
        this.showUi(UI.NEWGAME);
        break;
      case MODE.WELCOME:
        this.showUi(UI.WELCOME);
        break;
      case MODE.STARTER:
        this.showUi(UI.STARTER);
        break;
      case MODE.OVERWORLD:
        const overworld = OverworldStorage.getInstance().getMap(this.user?.location!);
        this.showUi(UI.OVERWORLD_HUD);
        overworld?.setup();
        this.overlapUi(UI.OVERWORLD);
        eventBus.emit(EVENT.HUD_SHOW_OVERWORLD);
        break;
      case MODE.OVERWORLD_MENU:
        this.overlapUi(UI.OVERWORLD_MENU);
        break;
      case MODE.BAG:
        this.overlapUi(UI.BAG);
        break;
      case MODE.PC:
        this.overlapUi(UI.PC);
        break;
      case MODE.OPTION:
        this.overlapUi(UI.OPTION);
        break;
      case MODE.BLACK_SCREEN:
        this.showUi(UI.BLACK_SCREEN);
        break;
    }
  }

  findUiOnStack(key: string): Ui | null {
    const ui = this.findUiOnRegistry(key);

    if (!ui) return null;
    if (!this.stackUi.includes(ui)) return ui;

    return ui;
  }

  setToken(access: string) {
    this.token = access;
  }

  getToken() {
    return this.token;
  }

  setVolume(type: 'bg' | 'effect', volume: number = 0.1) {
    if (type === 'bg') {
      this.bgVolume = volume;
    } else if (type === 'effect') {
      this.effectVolume = volume;
    }
  }

  getVolume(type: 'bg' | 'effect') {
    if (type === 'bg') {
      return this.bgVolume;
    } else if (type === 'effect') {
      return this.effectVolume;
    }
  }

  setMessageSpeed(value: number) {
    this.messageSpeed = value;
  }

  getMessageSpeed() {
    return this.messageSpeed;
  }

  setUserData(data: IngameData | null) {
    this.user = null;
    this.user = data;
  }

  initUserData(data: GetIngameRes) {
    BagStorage.getInstance().setup(data.bag);

    const party: (PlayerPokemon | null)[] = [];
    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      const pokemon = data.party[i];
      if (pokemon) {
        party.push(
          new PlayerPokemon(
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
            getPokemonType(pokemon.type_2) ? getPokemonType(pokemon.type_2)! : null,
          ),
        );
      } else {
        party.push(null);
      }
    }

    const pet = data.pet
      ? new PlayerPokemon(
          data.pet.idx,
          data.pet.pokedex,
          data.pet.gender,
          data.pet.shiny,
          data.pet.form,
          data.pet.count,
          data.pet.skill,
          data.pet.nickname,
          data.pet.createdLocation,
          data.pet.createdAt,
          data.pet.createdBall,
          data.pet.rank,
          data.pet.evol,
          getPokemonType(data.pet.type_1)!,
          getPokemonType(data.pet.type_2) ? getPokemonType(data.pet.type_2)! : null,
        )
      : null;

    const slotItem: (PlayerItem | null)[] = [];
    for (let i = 0; i < MAX_ITEM_SLOT; i++) {
      const item = data.slotItem[i];
      if (item) {
        slotItem.push(new PlayerItem(item.idx, item.item, item.stock));
      } else {
        slotItem.push(null);
      }
    }

    this.setUserData({
      avatar: data.avatar,
      candy: data.candy,
      gender: data.gender,
      isStarter: data.isStarter,
      location: data.location,
      nickname: data.nickname,
      party: party,
      pcBg: data.pcBg,
      pcName: data.pcName,
      pet: pet,
      slotItem: slotItem,
      x: data.x,
      y: data.y,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      option: new PlayerOption(data.option.textSpeed, data.option.backgroundVolume, data.option.effectVolume, data.option.frame),
    });
  }

  getUserData() {
    return this.user;
  }

  getUserOption() {
    return this.user?.option;
  }

  setMsgWindow(texture: TEXTURE) {
    this.msgWindow = texture;
  }

  getMsgWindow() {
    return this.msgWindow;
  }

  updateUserData(data: Partial<IngameData>) {
    if (this.user) {
      this.user = {
        ...this.user,
        ...data,
      };
    }
  }

  findSlotItem(item: PlayerItem) {
    if (this.user) {
      for (let i = 0; i < MAX_ITEM_SLOT; i++) {
        const slot = this.user.slotItem[i];
        if (slot && slot.getKey() === item.getKey()) {
          return [slot, i];
        }
      }
    }

    return [null, null];
  }

  registerSlotItem(item: PlayerItem, idx: number): void {
    if (!this.user) {
      console.error('User data does not exist. Cannot register item.');
      return;
    }

    if (idx < 0 || idx >= MAX_ITEM_SLOT) {
      console.error(`Invalid slot index: ${idx}. Index must be between 0 and ${MAX_ITEM_SLOT - 1}.`);
      return;
    }

    const [find, i] = this.findSlotItem(item);
    const newSlotItem = [...this.user.slotItem];

    if (find && (i as number) >= 0) {
      newSlotItem[i as number] = null;
    }

    newSlotItem[idx] = item;
    this.updateUserData({ slotItem: newSlotItem });
  }

  registerCancelSlotItem(item: PlayerItem) {
    if (!this.user) {
      console.error('User data does not exist. Cannot register item.');
      return;
    }

    const [find, i] = this.findSlotItem(item);
    const newSlotItem = [...this.user.slotItem];

    if (find && (i as number) >= 0) {
      newSlotItem[i as number] = null;
    }

    this.updateUserData({ slotItem: newSlotItem });
  }

  findParty(pokemon: PlayerPokemon) {
    if (!this.user) {
      return [null, null];
    }

    if (this.user) {
      for (let i = 0; i < MAX_PARTY_SLOT; i++) {
        const party = this.user.party[i];
        if (party && party.getIdx() === pokemon.getIdx()) {
          return [party, i];
        }
      }
    }

    return [null, null];
  }

  findSkillsInParty(target: PokemonSkill) {
    if (!this.user) return null;

    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      const party = this.user?.party[i];
      if (party?.getSkill().includes(target)) {
        return party;
      }
    }

    return null;
  }

  registerParty(pokemon: PlayerPokemon) {
    if (!this.user) {
      console.error('User data does not exist. Cannot register item.');
      return false;
    }

    const [isFound] = this.findParty(pokemon);
    if (isFound) {
      console.error('Pokemon is already in the party');
      return false;
    }

    const firstEmptySlotIndex = this.user.party.indexOf(null);

    if (firstEmptySlotIndex === -1) {
      console.error('Party is full');
      return false;
    }

    const newParty = [...this.user.party];
    newParty[firstEmptySlotIndex] = pokemon;
    this.updateUserData({ party: newParty });
    return true;
  }

  registerCancelParty(pokemon: PlayerPokemon) {
    if (!this.user) {
      console.error('User data does not exist. Cannot cancel party member.');
      return;
    }

    const newParty = this.user.party.filter((partyMember) => {
      if (!partyMember) {
        return false;
      }
      return partyMember.getIdx() !== pokemon.getIdx();
    });

    if (newParty.length === this.user.party.filter((p) => p !== null).length) {
      console.warn('Pokemon not found in party, nothing to cancel.');
      return;
    }

    while (newParty.length < MAX_PARTY_SLOT) {
      newParty.push(null);
    }

    this.updateUserData({ party: newParty });
  }

  findPet(pokemon: PlayerPokemon) {
    if (!this.user) {
      console.error('User data does not exist. Cannot find pet.');
      return;
    }

    const pet = this.user.pet;

    if (pet && pet.getIdx() === pokemon.getIdx()) {
      return true;
    }

    return false;
  }

  registerPet(pokemon: PlayerPokemon) {
    if (!this.user) {
      console.error('User data does not exist. Cannot register pet.');
      return;
    }

    const pet = this.user.pet;

    if (pet && pet.getIdx() === pokemon.getIdx()) {
      this.isRegisterPet = false;
    } else if (pet && pet.getIdx() !== pokemon.getIdx()) {
      this.isRegisterPet = true;
    }

    this.updateUserData({ pet: pokemon });
  }

  registerCancelPet(pokemon: PlayerPokemon) {
    if (!this.user) {
      console.error('User data does not exist. Cannot register cancel pet.');
      return;
    }

    const pet = this.user.pet;

    if (pet && pet.getIdx() === pokemon.getIdx()) {
      this.isRegisterPet = false;
    }

    this.updateUserData({ pet: null });
  }

  setIsRegisterPet(onoff: boolean) {
    this.isRegisterPet = onoff;
  }

  getIsRegisterPet() {
    return this.isRegisterPet;
  }

  setPlayerObj(obj: PlayerOverworldObj) {
    this.tempPlayerObj = obj;
  }

  getPlayerObj() {
    return this.tempPlayerObj;
  }

  setRunningToggle(toggle: boolean) {
    this.tempRunningToggle = toggle;
  }

  getRunningToggle() {
    return this.tempRunningToggle;
  }

  registerUserPokemonNickname(key: number, value: string) {
    this.userPokemonNicknames.set(key, value);
  }

  findUserPokemonNickname(key: number) {
    return this.userPokemonNicknames.get(key);
  }

  registerPcBg(box: number, bg: number) {
    if (!this.user) {
      console.error('User data does not exist. Cannot register pc bg.');
      return;
    }

    const newPcBg = [...this.user.pcBg];
    newPcBg[box] = bg;
    this.updateUserData({ pcBg: newPcBg });
  }

  registerPcName(box: number, name: string) {
    if (!this.user) {
      console.error('User data does not exist. Cannot register pc name.');
      return;
    }

    const newPcName = [...this.user.pcName];
    newPcName[box] = name;
    this.updateUserData({ pcName: newPcName });
  }
}

export const GM = GameManager.get();
