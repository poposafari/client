import { Scene } from 'phaser';
import { eventBus } from '../core/event-bus';
import { AUDIO } from '../enums/audio';
import { EVENT } from '../enums/event';
import { KEY } from '../enums/key';
import { InGameScene } from '../scenes/ingame-scene';
import { Message } from '../types';
import { ConnectUi } from '../uis/connect-ui';
import { MessageUi } from '../uis/message-ui';
import { OverworldConnectingUi } from '../uis/overworld/overworld-connecting-ui';
import { OverworldMenuUi } from '../uis/overworld/overworld-menu-ui';
import { playSound, Ui } from '../uis/ui';
import { LoginUi } from '../uis/login-ui';
import { RegisterUi } from '../uis/register-ui';
import { BagUi } from '../uis/bag-ui';
import { PokeboxUi } from '../uis/pokebox-ui';
import { ShopUi } from '../uis/shop-ui';
import { UI } from '../enums/ui';
import { OverworldUi } from '../uis/overworld/overworld-ui';

export class UiHandler {
  private registry = new Map<string, Ui>();
  private stack: Ui[] = [];

  constructor() {
    eventBus.on(EVENT.SHOW_UI_STACK, () => {
      console.log(this.stack);
    });

    eventBus.on(EVENT.CHANGE_UI, (key: string, data?: any) => {
      this.show(key, data);
    });

    eventBus.on(EVENT.OVERLAP_UI, (key: string, data?: any) => {
      this.overlap(key, data);
    });

    eventBus.on(EVENT.POP_UI, () => {
      this.pop();
    });

    eventBus.on(EVENT.PLAYER_MOVEMENT_UPDATE, (delta: number) => {
      const top = this.top();

      if (top instanceof OverworldUi) {
        top.updatePlayer(delta);
      }
    });

    eventBus.on(EVENT.PLAY_SOUND, (scene: InGameScene, key: KEY) => {
      const top = this.top();
      let audio: AUDIO = AUDIO.SELECT_0;

      switch (key) {
        case KEY.UP:
          if (top instanceof OverworldMenuUi) {
            audio = AUDIO.SELECT_1;
          }
          break;
        case KEY.DOWN:
          if (top instanceof OverworldMenuUi) {
            audio = AUDIO.SELECT_1;
          }
          break;
        case KEY.LEFT:
          if (top instanceof BagUi) {
            audio = AUDIO.SELECT_2;
          }
          break;
        case KEY.RIGHT:
          if (top instanceof BagUi) {
            audio = AUDIO.SELECT_2;
          }
          break;
        case KEY.SELECT:
          break;
        case KEY.MENU:
          break;
        case KEY.CANCEL:
          if (top instanceof OverworldMenuUi) audio = AUDIO.CANCEL_0;
          if (top instanceof PokeboxUi) audio = AUDIO.CANCEL_1;
          break;
        default:
          if (top instanceof LoginUi || top instanceof RegisterUi || top instanceof OverworldMenuUi) {
            audio = AUDIO.OPEN_0;
          } else if (top instanceof PokeboxUi) {
            audio = AUDIO.OPEN_1;
          }
          break;
      }
      playSound(scene, audio);
    });
  }

  register(key: string, ui: Ui): void {
    this.registry.set(key, ui);
    ui.setup();
  }

  show(key: string, data?: any): void {
    const ui = this.findOnRegistry(key);

    if (!ui) throw new Error(`Ui not found : ${key}`);

    this.clean();
    this.push(ui);
    ui.show(data);
  }

  overlap(key: string, data?: any): void {
    const ui = this.findOnRegistry(key);

    if (!ui) throw new Error(`Ui not found : ${key}`);

    this.push(ui);
    ui.show(data);
  }

  pop() {
    const ui = this.stack.pop();
    const preUi = this.top();

    if (ui) ui.clean();
    if (preUi) {
      preUi.pause(false);
      preUi.handleKeyInput();
    }
  }

  push(ui: Ui) {
    const top = this.top();
    const nextUi = ui;

    if (top) top.pause(true);

    this.stack.push(nextUi);
  }

  clean(): void {
    for (const ui of this.stack) {
      ui.clean();
    }

    this.stack = [];
  }

  top(): Ui | undefined {
    return this.stack[this.stack.length - 1];
  }

  findOnStack(key: string): Ui | null {
    const ui = this.findOnRegistry(key);

    if (!ui) return null;
    if (!this.stack.includes(ui)) return ui;

    return ui;
  }

  private findOnRegistry(key: string): Ui | undefined {
    return this.registry.get(key);
  }
}
