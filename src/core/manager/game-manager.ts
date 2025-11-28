import { autoLoginApi, enterSafariZoneApi, getIngameApi, logoutApi } from '../../api';
import { EVENT, MODE, UI } from '../../enums';
import { InGameScene } from '../../scenes/ingame-scene';
import { Ui } from '../../uis/ui';
import { changeTextSpeedToDigit, getCurrentTimeOfDay, getCurrentTimeOfDayValue, getPokemonSpriteKey } from '../../utils/string-util';
import { ErrorCode, ErrorMessage, throwError } from '../errors';
import { PlayerGlobal } from '../storage/player-storage';
import { PC } from '../storage/pc-storage';
import { Bag } from '../storage/bag-storage';
import { Keyboard } from './keyboard-manager';
import { SocketIO } from './socket-manager';
import { Option } from '../storage/player-option';
import { GetIngameRes } from '../../types';
import { OverworldGlobal } from '../storage/overworld-storage';
import { Event } from './event-manager';

export class GameManager {
  private static instance: GameManager;

  private scene: InGameScene | null = null;
  private uiFactories = new Map<string, (scene: InGameScene) => Ui>();
  private activeUiStack: Ui[] = [];

  private modeChangeQueue: Array<{ mode: MODE; data?: unknown }> = [];
  private isProcessingModeChange: boolean = false;
  private preMode: MODE = MODE.NONE;
  private currentMode: MODE = MODE.NONE;
  private connectUiRequestCount: number = 0;

  async showConnectUi(url?: string): Promise<void> {
    this.connectUiRequestCount++;

    if (this.connectUiRequestCount === 1) {
      const targetUi = this.matchUrlToUi(url);
      Keyboard.blockKeys(true);

      if (!this.hasUi(targetUi)) {
        await this.overlapUi(targetUi);
      }
    }
  }

  async hideConnectUi(url?: string): Promise<void> {
    this.connectUiRequestCount = Math.max(0, this.connectUiRequestCount - 1);
    if (this.connectUiRequestCount === 0) {
      Keyboard.blockKeys(false);
      const targetUi = this.matchUrlToUi(url);
      await this.removeUi(targetUi);
    }
  }

  matchUrlToUi(url?: string): string {
    switch (url) {
      case '/account/delete':
        return UI.CONNECT_ACCOUNT_DELETE;
      default:
        return UI.CONNECT_BASE;
    }
  }

  static get(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }

    return GameManager.instance;
  }

  init(scene: InGameScene): void {
    this.scene = scene;
  }

  async initializeGame(): Promise<void> {
    await this.changeMode(MODE.AUTO_LOGIN);
  }

  getScene(): InGameScene | null {
    return this.scene;
  }

  registerUiFactory(key: string, factory: (scene: InGameScene) => Ui): void {
    this.uiFactories.set(key, factory);
  }

  getTopActiveUi(): Ui | null {
    if (this.activeUiStack.length > 0) {
      return this.activeUiStack[this.activeUiStack.length - 1];
    }

    return null;
  }

  findUiInStack<T extends Ui>(predicate: (ui: Ui) => ui is T): T | null {
    for (let i = this.activeUiStack.length - 1; i >= 0; i--) {
      const ui = this.activeUiStack[i];
      if (predicate(ui)) {
        return ui;
      }
    }
    return null;
  }

  getPreviousMode(): MODE {
    return this.preMode;
  }

  async changeMode(mode: MODE, data?: unknown): Promise<void> {
    this.modeChangeQueue.push({ mode, data });

    if (this.isProcessingModeChange) {
      return;
    }

    await this.processModeChangeQueue();
  }

  async showUi(key: string, data?: unknown): Promise<void> {
    const factory = this.uiFactories.get(key);

    if (factory) {
      await this.showUiFactory(key, factory, data);
      return;
    }

    throwError(ErrorCode.UI_NOT_FOUND, { key });
  }

  async overlapUi(key: string, data?: unknown): Promise<void> {
    const factory = this.uiFactories.get(key);
    if (factory) {
      await this.overlapUiFactory(key, factory, data);
      return;
    }

    throwError(ErrorCode.UI_NOT_FOUND, { key });
  }

  private hasUi(key: string): boolean {
    if (!this.scene) {
      return false;
    }

    const factory = this.uiFactories.get(key);
    if (!factory) {
      return false;
    }

    const tempInstance = factory(this.scene);
    const expectedClassName = tempInstance.constructor.name;

    return this.activeUiStack.some((ui) => ui.constructor.name === expectedClassName);
  }

  async removeUi(key: string): Promise<boolean> {
    if (!this.scene) {
      return false;
    }

    const factory = this.uiFactories.get(key);

    if (!factory) {
      return false;
    }

    for (let i = this.activeUiStack.length - 1; i >= 0; i--) {
      const ui = this.activeUiStack[i];

      const tempInstance = factory(this.scene);
      const expectedClassName = tempInstance.constructor.name;

      if (ui.constructor.name === expectedClassName) {
        const uiMode = this.getUiMode(ui);
        const preUi = i > 0 ? this.activeUiStack[i - 1] : null;

        ui.clean();
        this.activeUiStack.splice(i, 1);

        if (preUi) {
          preUi.pause(false);
        }

        if (uiMode) {
          Event.emit(EVENT.UI_CLOSED, { mode: uiMode });
        }

        return true;
      }
    }
    return false;
  }

  async popUi(): Promise<void> {
    if (this.activeUiStack.length > 0) {
      const topUi = this.activeUiStack.pop();
      if (topUi) {
        const uiMode = this.getUiMode(topUi);
        topUi.clean();

        const preUi = this.getTopActiveUi();
        if (preUi) {
          preUi.pause(false);
          await preUi.handleKeyInput?.();
        }

        if (uiMode) {
          Event.emit(EVENT.UI_CLOSED, { mode: uiMode });
        }
      }
    }
  }

  private getUiMode(ui: Ui): MODE | null {
    const className = ui.constructor.name;

    const uiModeMap: Record<string, MODE> = {
      OverworldMenuUi: MODE.OVERWORLD_MENU,
      QuickSlotItemUi: MODE.QUICK_SLOT_ITEM,
      BagUi: MODE.BAG,
      PokePCUi: MODE.PC,
      OptionUi: MODE.OPTION,
      Battle: MODE.BATTLE,
      BattleUi: MODE.BATTLE,
      HiddenMoveUi: MODE.HIDDEN_MOVE,
    };

    return uiModeMap[className] || null;
  }

  private async showUiFactory(key: string, factory: (scene: InGameScene) => Ui, data?: unknown): Promise<void> {
    if (!this.scene) {
      throwError(ErrorCode.SCENE_NOT_SET);
    }

    try {
      await this.cleanupActiveUis();

      const newUi = factory(this.scene);
      await newUi.setup();
      await newUi.show(data);

      this.activeUiStack = [newUi];
    } catch (error) {
      console.error('Error show ui', error);
    }
  }

  private async overlapUiFactory(key: string, factory: (scene: InGameScene) => Ui, data?: unknown): Promise<void> {
    if (!this.scene) {
      throwError(ErrorCode.SCENE_NOT_SET);
    }

    let newUi: Ui | null = null;
    try {
      const topUi = this.getTopActiveUi();
      if (topUi) {
        topUi.pause(true);
      }

      newUi = factory(this.scene);

      await newUi.setup();
      this.activeUiStack.push(newUi);

      await newUi.show(data);
    } catch (error) {
      if (newUi) {
        const index = this.activeUiStack.indexOf(newUi);
        if (index !== -1) {
          this.activeUiStack.splice(index, 1);
        }
      }
    }
  }

  private async cleanupActiveUis(): Promise<void> {
    const cleanupPromises = this.activeUiStack.map((ui) => {
      try {
        ui.clean();
      } catch (error) {
        console.error('Error', error);
      }
    });

    await Promise.all(cleanupPromises);
    this.activeUiStack = [];
    this.connectUiRequestCount = 0;
  }

  private async processModeChangeQueue(): Promise<void> {
    this.isProcessingModeChange = true;

    try {
      while (this.modeChangeQueue.length > 0) {
        const { mode, data } = this.modeChangeQueue.shift()!;

        this.preMode = this.currentMode;
        this.currentMode = mode;

        await this.processModeChange(mode, data);
      }
    } catch (error) {
      console.error('Error process mode change queue', error);
    } finally {
      this.isProcessingModeChange = false;
    }
  }

  private async processModeChange(mode: MODE, data?: unknown): Promise<void> {
    let ret;

    Keyboard.blockKeys(false);

    switch (mode) {
      case MODE.AUTO_LOGIN:
        ret = await autoLoginApi();

        if (ret!.result) this.modeChangeQueue.push({ mode: MODE.CHECK_INGAME_DATA });
        else this.modeChangeQueue.push({ mode: MODE.LOGIN });
        break;
      case MODE.CHECK_INGAME_DATA:
        ret = await getIngameApi();
        if (ret!.result) {
          await this.handleSuccessfulIngameData(ret!.data);
          this.modeChangeQueue.push({ mode: MODE.TITLE });
        } else {
          if (ret!.data === ErrorCode.NOT_FOUND_INGAME) {
            this.modeChangeQueue.push({ mode: MODE.WELCOME });
            this.modeChangeQueue.push({ mode: MODE.TITLE });
          }
        }
        break;
      case MODE.FAIL_TOKEN:
        await this.showUi(UI.FAIL_TOKEN);
        this.modeChangeQueue.push({ mode: MODE.LOGOUT });
        break;
      case MODE.CONNECT:
        await this.showConnectUi();
        break;
      case MODE.CHECK_OVERWORLD:
        if (PlayerGlobal.getData()?.location.includes('s')) {
          this.modeChangeQueue.push({ mode: MODE.CONNECT_SAFARI });
        } else {
          this.modeChangeQueue.push({ mode: MODE.OVERWORLD });
        }
        break;
      case MODE.CONNECT_SAFARI:
        await this.overlapUi(UI.CONNECT_SAFARI);

        const location = PlayerGlobal.getData()?.location;
        if (!location) return;

        const res = await enterSafariZoneApi({ overworld: location, time: getCurrentTimeOfDay() });

        console.log('enterSafariZoneApi', res);

        if (res.result) {
          const wilds = res.data.wilds;
          const groundItems = res.data.groundItems;

          OverworldGlobal.setupWildData(wilds);
          OverworldGlobal.setupGroundItemInfo(groundItems);
        }

        this.modeChangeQueue.push({ mode: MODE.OVERWORLD });
        break;
      case MODE.CONNECT_ACCOUNT_DELETE:
        await this.overlapUi(UI.CONNECT_ACCOUNT_DELETE);
        break;
      case MODE.CONTINUE:
        await this.showUi(UI.SEASON_SCREEN);

        this.modeChangeQueue.push({ mode: MODE.CHECK_OVERWORLD });

        break;
      case MODE.WELCOME:
        await this.showUi(UI.WELCOME);
        break;
      case MODE.SEASON_SCREEN:
        await this.overlapUi(UI.SEASON_SCREEN);
        this.modeChangeQueue.push({ mode: MODE.CHECK_OVERWORLD });
        break;
      case MODE.LOGIN:
        await this.showUi(UI.LOGIN);
        break;
      case MODE.LOGOUT:
        ret = await logoutApi();
        if (ret!.result) {
          localStorage.removeItem('access_token');
          Keyboard.clearCallbacks();
          Keyboard.setAllowKey([]);
          Keyboard.blockKeys(true);
          PlayerGlobal.setData(null);
          Option.clear();
          PC.clear();
          Bag.clear();
          if (SocketIO.isSocketConnected()) SocketIO.disconnect();
          await this.showUi(UI.LOGIN);
        }
        break;
      case MODE.REGISTER:
        await this.showUi(UI.REGISTER);
        break;
      case MODE.TITLE:
        await this.showUi(UI.TITLE);
        break;
      case MODE.STARTER:
        await this.showUi(UI.STARTER);
        break;
      case MODE.OPTION:
        await this.overlapUi(UI.OPTION);
        break;
      case MODE.ACCOUNT_DELETE:
        await this.showUi(UI.ACCOUNT_DELETE);
        break;
      case MODE.ACCOUNT_DELETE_RESTORE:
        await this.showUi(UI.ACCOUNT_DELETE_RESTORE, data);
        break;
      case MODE.OVERWORLD:
        SocketIO.enterLocation({
          from: PlayerGlobal.getData()?.lastLocation ?? null,
          to: PlayerGlobal.getData()?.location!,
          toX: PlayerGlobal.getData()?.x!,
          toY: PlayerGlobal.getData()?.y!,
        });

        await this.showUi(UI.OVERWORLD);
        break;
      case MODE.OVERWORLD_MENU:
        await this.overlapUi(UI.OVERWORLD_MENU);
        break;
      case MODE.BAG:
        await this.overlapUi(UI.BAG);
        break;
      case MODE.PC:
        await this.overlapUi(UI.PC);
        break;
      case MODE.QUICK_SLOT_ITEM:
        await this.overlapUi(UI.QUICK_SLOT_ITEM);
        break;
      case MODE.CONNECT_SAFARI:
        await this.showUi(UI.CONNECT_SAFARI);
        break;
      case MODE.EVOLVE:
        await this.overlapUi(UI.EVOLVE, data);
        break;
      case MODE.HIDDEN_MOVE:
        await this.overlapUi(UI.HIDDEN_MOVE, data);
        break;
      case MODE.STARTER_POKEMON:
        await this.overlapUi(UI.STARTER_POKEMON, data);
        break;
      case MODE.BATTLE:
        await this.overlapUi(UI.BATTLE, data);
        break;
    }
  }

  async handleSuccessfulIngameData(data: GetIngameRes): Promise<void> {
    PlayerGlobal.setData(data);

    try {
      await SocketIO.connectAndInit(this.getScene()!, {
        location: data.location,
        x: data.x,
        y: data.y,
        nickname: data.nickname,
        gender: data.gender,
        avatar: data.avatar,
        pet: null,
        party: data.party.map((p: any) => (p ? p.idx : null)),
        slotItem: data.slotItem.map((s: any) => (s ? s.idx : null)),
        option: {
          textSpeed: changeTextSpeedToDigit(data.option.textSpeed),
          frame: data.option.frame as number,
          backgroundVolume: data.option.backgroundVolume,
          effectVolume: data.option.effectVolume,
          tutorial: data.option.tutorial,
        },
        pBgs: data.pcBg,
        pcNames: data.pcName,
        isStarter0: data.isStarter0,
        isStarter1: data.isStarter1,
      });

      console.log('Socket connection and init completed successfully');
    } catch (error) {
      console.error('Socket connection failed:', error);
    }
  }
}

export const Game = GameManager.get();
