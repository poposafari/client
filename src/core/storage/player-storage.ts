import { itemData } from '../../data';
import { DIRECTION, EVENT, ItemCategory, PLAYER_STATUS } from '../../enums';
import { PlayerItem } from '../../obj/player-item';
import { PlayerOverworldObj } from '../../obj/player-overworld-obj';
import { PlayerPokemon } from '../../obj/player-pokemon';
import { GetIngameRes, GetItemRes, IngameData } from '../../types';
import { getPokemonType } from '../../utils/string-util';
import { Event } from '../manager/event-manager';
import { Bag } from './bag-storage';
import { PC } from './pc-storage';
import { Option } from './player-option';

export class PlayerStorage {
  private static instance: PlayerStorage;

  private data: IngameData | null = null;
  private obj: PlayerOverworldObj | null = null;
  private lastDirection: DIRECTION = DIRECTION.DOWN;
  private lastPlayerStatus: PLAYER_STATUS = PLAYER_STATUS.WALK;
  private lastPlayerStatusWalkOrRunning: PLAYER_STATUS.WALK | PLAYER_STATUS.RUNNING = PLAYER_STATUS.WALK;

  talkMotherFlag: boolean = false;
  appearRunningShoesFlag: boolean = false;
  appearMenuFlag: boolean = false;
  appearItemSlotFlag: boolean = false;

  constructor() {}

  static getInstance(): PlayerStorage {
    if (!PlayerStorage.instance) {
      PlayerStorage.instance = new PlayerStorage();
    }
    return PlayerStorage.instance;
  }

  init() {}

  getData(): IngameData | null {
    return this.data;
  }

  setData(data: GetIngameRes | null) {
    if (!data) {
      this.data = null;
      return;
    }

    Bag.setup(data.bag, data.slotItem);
    PC.setBaseData(data);

    Option.setBackgroundVolume(data.option.backgroundVolume);
    Option.setEffectVolume(data.option.effectVolume);
    Option.setTextSpeed(data.option.textSpeed);
    Option.setFrame(data.option.frame);
    Option.setTutorial(data.option.tutorial);

    this.data = {
      avatar: data.avatar,
      candy: data.candy,
      createdAt: data.createdAt,
      gender: data.gender,
      isStarter0: data.isStarter0,
      isStarter1: data.isStarter1,
      location: data.location,
      lastLocation: null,
      nickname: data.nickname,
      updatedAt: data.updatedAt,
      x: data.x,
      y: data.y,
    };
  }

  updateData(updates: Partial<IngameData>): void {
    if (!this.data) {
      return;
    }

    const candyUpdated = updates.candy !== undefined && updates.candy !== this.data.candy;

    this.data = {
      ...this.data,
      ...updates,
    };

    if (candyUpdated) {
      Event.emit(EVENT.CANDY_UPDATED);
    }
  }

  getObj(): PlayerOverworldObj | null {
    return this.obj;
  }

  setObj(obj: PlayerOverworldObj) {
    this.obj = obj;
  }

  setLastDirection(direction: DIRECTION) {
    this.lastDirection = direction;
  }

  getLastDirection(): DIRECTION {
    return this.lastDirection;
  }

  setLastPlayerStatus(status: PLAYER_STATUS) {
    this.lastPlayerStatus = status;
  }

  getLastPlayerStatus(): PLAYER_STATUS {
    return this.lastPlayerStatus;
  }

  setLastPlayerStatusWalkOrRunning(status: PLAYER_STATUS.WALK | PLAYER_STATUS.RUNNING) {
    this.lastPlayerStatusWalkOrRunning = status;
    this.lastPlayerStatus = status === PLAYER_STATUS.WALK ? PLAYER_STATUS.WALK : PLAYER_STATUS.RUNNING;
  }

  getLastPlayerStatusWalkOrRunning(): PLAYER_STATUS.WALK | PLAYER_STATUS.RUNNING {
    return this.lastPlayerStatusWalkOrRunning;
  }
}

export const PlayerGlobal = PlayerStorage.getInstance();
