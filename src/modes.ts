import i18next from 'i18next';
import { autoLoginApi, buyItemApi, deleteAccountApi, getIngameApi, ingameRegisterApi, loginApi, moveToOverworldApi, receiveAvailableTicketApi, registerApi } from './api';
import { eventBus } from './core/event-bus';
import { EVENT } from './enums/event';
import { MODE } from './enums/mode';
import { UiHandler } from './handlers/ui-handler';
import { Mode } from './mode';
import { PlayerInfo } from './storage/player-info';
import { OverworldUi } from './uis/overworld/overworld-ui';
import { playSound, runFadeEffect } from './uis/ui';
import { replacePercentSymbol } from './utils/string-util';
import { Bag } from './storage/bag';
import { UI } from './enums/ui';
import { GroundItemInfo, Message, PlayerAvatar, PlayerGender } from './types';
import { InGameScene } from './scenes/ingame-scene';
import { AUDIO } from './enums/audio';
import { PlayerObject } from './object/player-object';
import { OverworldInfo } from './storage/overworld-info';
import { Battle } from './storage/battle';
import { PokemonObject } from './object/pokemon-object';

export class NoneMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);
  }

  async enter(): Promise<void> {
    const result = await autoLoginApi();
    if (result && result.data) {
      eventBus.emit(EVENT.CHANGE_MODE, MODE.TITLE, result.data);
    }
  }

  exit(): void {}

  update(): void {}
}

export class MessageMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);
  }

  enter(data?: Message[]): void {
    eventBus.emit(EVENT.OVERLAP_UI, UI.MESSAGE, data);
  }

  exit(): void {
    eventBus.emit(EVENT.POP_UI);
  }

  update(time?: number, delta?: number): void {}
}

export class ConnectMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);
  }

  enter(data?: any): void {
    eventBus.emit(EVENT.OVERLAP_UI, UI.CONNECT);
  }

  exit(): void {
    eventBus.emit(EVENT.POP_UI);
  }

  update(time?: number, delta?: number): void {}
}

export class LoginMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);

    eventBus.on(EVENT.SUBMIT_LOGIN, async (username: string, pw: string) => {
      const result = await loginApi({ username: username, password: pw });
      if (result) {
        eventBus.emit(EVENT.CHANGE_MODE, MODE.TITLE);
      }
    });
  }

  enter(): void {
    eventBus.emit(EVENT.CHANGE_UI, UI.LOGIN);
  }

  exit(): void {}

  update(): void {}
}

export class RegisterMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);

    eventBus.on(EVENT.SUBMIT_REGISTER, async (username: string, pw: string) => {
      const result = await registerApi({ username: username, password: pw });
      if (result) {
        eventBus.emit(EVENT.CHANGE_MODE, MODE.WELCOME);
      }
    });
  }

  enter(): void {
    eventBus.emit(EVENT.CHANGE_UI, UI.REGISTER);
  }

  exit(): void {}

  update(): void {}
}

export class WelcomeMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);
  }

  enter(): void {
    eventBus.emit(EVENT.CHANGE_UI, UI.WELCOME);
  }

  exit(): void {
    eventBus.emit(EVENT.POP_UI);
  }

  update(): void {}
}

export class NewgameMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);

    eventBus.on(EVENT.SUBMIT_INGAME, async (nickname: string, gender: PlayerGender, avatar: PlayerAvatar) => {
      const result = await ingameRegisterApi({ nickname: nickname, gender: gender, avatar: avatar });
      if (result) {
        eventBus.emit(EVENT.CHANGE_MODE, MODE.TITLE, result.data);
      }
    });
  }

  enter(): void {
    eventBus.emit(EVENT.CHANGE_UI, UI.NEWGAME);
  }

  exit(): void {
    eventBus.emit(EVENT.POP_UI);
  }

  update(): void {}
}

export class TitleMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);
  }

  async enter(data: any): Promise<void> {
    const result = await getIngameApi();
    const playerInfo = result?.data;

    console.log(playerInfo);

    PlayerInfo.getInstance().setup(playerInfo);
    Bag.getInstance().setup(playerInfo.items);

    eventBus.emit(EVENT.CHANGE_UI, UI.TITLE);
  }

  exit(): void {}
  update(): void {}
}

export class AccountDeleteMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);
  }

  enter(data: any): void {
    eventBus.emit(EVENT.CHANGE_UI, UI.ACCOUNT_DELETE);
  }

  exit(): void {}

  update(): void {}
}

export class ConnectAccountDeleteMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);

    eventBus.on(EVENT.ACCOUNT_DELETE, async () => {
      const result = await deleteAccountApi();

      if (result) {
        eventBus.emit(EVENT.POP_MODE);
        eventBus.emit(EVENT.OVERLAP_MODE, MODE.MESSAGE, [{ type: 'sys', format: 'talk', content: i18next.t('message:deleteAccount4'), speed: 10, end: EVENT.MOVETO_LOGIN_MODE }]);
      }
    });
  }

  enter(data: any): void {
    eventBus.emit(EVENT.CHANGE_UI, UI.CONNECT_ACCOUNT_DELETE);
  }

  exit(): void {}

  update(): void {}
}

export class OverworldMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);

    eventBus.on(EVENT.RECEIVE_AVAILABLE_TICKET, async () => {
      const result = await receiveAvailableTicketApi();

      if (result) {
        playSound(this.scene, AUDIO.GET_0);
        eventBus.emit(EVENT.OVERLAP_MODE, MODE.MESSAGE, [
          { type: 'sys', format: 'talk', content: replacePercentSymbol(i18next.t('message:receiveTicket'), [PlayerInfo.getInstance().getNickname()]), speed: 80 },
          {
            type: 'sys',
            format: 'talk',
            content: replacePercentSymbol(i18next.t('message:putPocket'), [PlayerInfo.getInstance().getNickname(), i18next.t('item:030.name'), i18next.t('menu:etc')]),
            speed: 10,
            end: EVENT.FINISH_TALK,
          },
        ]);
      }
    });
  }

  enter(data: any): void {
    const overworld = data;

    if (!overworld) console.error('not found overworld key on OverworldConnectingMode');

    runFadeEffect(this.scene, 700, 'in');

    eventBus.emit(EVENT.CHANGE_UI, UI.OVERWORLD_HUD);
    eventBus.emit(EVENT.OVERLAP_UI, `Overworld${overworld}`);

    eventBus.emit(EVENT.HUD_SHOW_OVERWORLD);
  }

  exit(): void {}

  update(time: number, delta: number): void {
    eventBus.emit(EVENT.HUD_LOCATION_UPDATE);
    eventBus.emit(EVENT.HUD_CANDY_UPDATE);
    eventBus.emit(EVENT.PLAYER_MOVEMENT_UPDATE, delta);
    eventBus.emit(EVENT.WILD_MOVEMENT_UPDATE, delta);

    // console.log('----------CURRENT_STACK-----------');
    // eventBus.emit(EVENT.SHOW_MODE_STACK);
    // eventBus.emit(EVENT.SHOW_UI_STACK);
  }
}

export class OverworldConnectingMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);
  }

  async enter(data?: any): Promise<void> {
    const overworld = data;

    if (!overworld) console.error('not found overworld key on OverworldConnectingMode');

    eventBus.emit(EVENT.CHANGE_UI, UI.OVERWORLD_CONNECTING);

    const result = await moveToOverworldApi({ overworld: overworld });
    if (result && result.data) {
      console.log(result.data);

      PlayerInfo.getInstance().setX(result.data.entryX);
      PlayerInfo.getInstance().setY(result.data.entryY);
      PlayerInfo.getInstance().setLocation(overworld);

      if (result.data.pokemons) OverworldInfo.getInstance().setupWildPokemonInfo(result.data.pokemons);
      if (result.data.items) OverworldInfo.getInstance().setupGroundItemInfo(result.data.items);

      eventBus.emit(EVENT.CHANGE_MODE, MODE.OVERWORLD, overworld);
    }
  }

  exit(): void {}

  update(time?: number, delta?: number): void {}
}

export class OverworldMenuMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);
  }

  enter(data?: any): void {
    eventBus.emit(EVENT.OVERLAP_UI, UI.OVERWORLD_MENU, data);
  }

  exit(): void {
    eventBus.emit(EVENT.POP_UI);
  }

  update(time?: number, delta?: number): void {}
}

export class BagMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);
  }

  enter(data?: any): void {
    runFadeEffect(this.scene, 700, 'in');

    eventBus.emit(EVENT.OVERLAP_UI, UI.BAG);
  }

  exit(): void {
    eventBus.emit(EVENT.POP_UI);
  }

  update(time?: number, delta?: number): void {}
}

export class ShopMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);
  }

  enter(data?: any): void {
    eventBus.emit(EVENT.OVERLAP_UI, UI.SHOP);
  }

  exit(): void {
    eventBus.emit(EVENT.POP_UI);
  }

  update(time?: number, delta?: number): void {}
}

export class PokeboxMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);
  }

  enter(data?: PlayerObject): void {
    runFadeEffect(this.scene, 700, 'in');

    eventBus.emit(EVENT.OVERLAP_UI, UI.POKEBOX, data);
  }

  exit(): void {
    eventBus.emit(EVENT.POP_UI);
  }

  update(time?: number, delta?: number): void {}
}

export class SafariListMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);
  }

  enter(data?: any): void {
    eventBus.emit(EVENT.OVERLAP_UI, UI.SAFARI_LIST);
  }

  exit(): void {
    eventBus.emit(EVENT.POP_UI);
  }

  update(time?: number, delta?: number): void {}
}

export class HiddenMoveMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);
  }

  enter(data?: any): void {
    eventBus.emit(EVENT.OVERLAP_UI, UI.HIDDEN_MOVE);
  }

  exit(): void {
    eventBus.emit(EVENT.POP_UI);
  }

  update(time?: number, delta?: number): void {}
}

export class BattleMode extends Mode {
  private wild: PokemonObject | null;

  constructor(scene: InGameScene) {
    super(scene);

    this.wild = null;
  }

  enter(data?: PokemonObject) {
    if (data) {
      this.wild = null;
      this.wild = data;
    }

    eventBus.emit(EVENT.OVERLAP_UI, UI.BATTLE, this.wild);
  }

  exit(): void {
    eventBus.emit(EVENT.POP_UI);
  }

  update(time?: number, delta?: number): void {}
}
