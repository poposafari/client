import { Game } from '../../core/manager/game-manager';
import { KeyboardManager } from '../../core/manager/keyboard-manager';
import { SocketIO } from '../../core/manager/socket-manager';
import { PlayerGlobal } from '../../core/storage/player-storage';
import { DIRECTION, KEY, MODE, OVERWORLD_ACTION, PLAYER_STATUS, TEXTURE } from '../../enums';
import { DoorOverworldObj } from '../../obj/door-overworld-obj';
import { GroundItemOverworldObj } from '../../obj/ground-item-overworld-obj';
import { NpcOverworldObj } from '../../obj/npc-overworld-obj';
import { PlayerOverworldObj } from '../../obj/player-overworld-obj';
import { PostCheckoutOverworldObj } from '../../obj/post-checkout-overworld-obj';
import { ShopCheckoutOverworldObj } from '../../obj/shop-checkout-overworld-obj';
import { SignOverworldObj } from '../../obj/sign-overworld-obj';
import { StatueOverworldObj } from '../../obj/statue-overworld-obj';
import { WildOverworldObj } from '../../obj/wild-overworld-obj';
import { InGameScene } from '../../scenes/ingame-scene';
import { getBattleArea, matchPlayerStatus, matchPlayerStatusToDirection } from '../../utils/string-util';
import { Battle, startBattleIntro } from '../battle/battle';
import { delay } from '../ui';
import { OverworldActionQueue } from './overworld-action-queue';
import { OverworldHUDUi } from './overworld-hud-ui';

export interface OverworldPlayerInputContext {
  scene: InGameScene;
  obj: PlayerOverworldObj | null;
  actionQueue: OverworldActionQueue;
  getCurrentAction: () => OVERWORLD_ACTION;
  hud: OverworldHUDUi;
  waitForUiClose: (mode: MODE) => Promise<void>;
  handleSelectEvent: (event: any) => Promise<void>;
  showSurfMessage: () => Promise<void>;
  isInputLocked: () => boolean;
}

export class OverworldPlayerInputHandler {
  private scene: InGameScene;
  private cursorKey: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyPressStartTime: { [key: string]: number } = {};
  private readonly SHORT_KEY_THRESHOLD: number = 30;
  private context: OverworldPlayerInputContext;
  private wasMovementFinished: boolean = true;

  constructor(scene: InGameScene, context: OverworldPlayerInputContext) {
    this.scene = scene;
    this.cursorKey = this.scene.input.keyboard!.createCursorKeys();
    this.context = context;
  }

  handleMovement(): void {
    if (!this.context.obj) return;
    if (this.context.getCurrentAction() !== OVERWORLD_ACTION.IDLE) return;
    if (this.context.isInputLocked()) {
      this.resetDirectionalKeyState();
      return;
    }

    const isMovementFinished = this.context.obj.isMovementFinish();
    if (isMovementFinished && !this.wasMovementFinished) {
      PlayerGlobal.updateData({ x: this.context.obj.getTilePos().x, y: this.context.obj.getTilePos().y });

      SocketIO.movementPlayer({
        x: this.context.obj.getTilePos().x,
        y: this.context.obj.getTilePos().y,
        direction: matchPlayerStatusToDirection(this.context.obj.getLastDirection()),
        movement: matchPlayerStatus(this.context.obj.getCurrentStatus()),
        pet: null,
      });
    }
    this.wasMovementFinished = isMovementFinished;

    if (this.cursorKey.up.isDown && !this.keyPressStartTime['up']) {
      this.keyPressStartTime['up'] = this.scene.time.now;
    }
    if (this.cursorKey.down.isDown && !this.keyPressStartTime['down']) {
      this.keyPressStartTime['down'] = this.scene.time.now;
    }
    if (this.cursorKey.left.isDown && !this.keyPressStartTime['left']) {
      this.keyPressStartTime['left'] = this.scene.time.now;
    }
    if (this.cursorKey.right.isDown && !this.keyPressStartTime['right']) {
      this.keyPressStartTime['right'] = this.scene.time.now;
    }

    if (this.cursorKey.up.isDown && this.context.obj.isMovementFinish()) {
      this.handleDirectionInput('up', DIRECTION.UP);
    } else if (this.cursorKey.down.isDown && this.context.obj.isMovementFinish()) {
      this.handleDirectionInput('down', DIRECTION.DOWN);
    } else if (this.cursorKey.left.isDown && this.context.obj.isMovementFinish()) {
      this.handleDirectionInput('left', DIRECTION.LEFT);
    } else if (this.cursorKey.right.isDown && this.context.obj.isMovementFinish()) {
      this.handleDirectionInput('right', DIRECTION.RIGHT);
    }

    if (!this.cursorKey.up.isDown && this.keyPressStartTime['up']) {
      delete this.keyPressStartTime['up'];
    }
    if (!this.cursorKey.down.isDown && this.keyPressStartTime['down']) {
      delete this.keyPressStartTime['down'];
    }
    if (!this.cursorKey.left.isDown && this.keyPressStartTime['left']) {
      delete this.keyPressStartTime['left'];
    }
    if (!this.cursorKey.right.isDown && this.keyPressStartTime['right']) {
      delete this.keyPressStartTime['right'];
    }
  }

  private handleDirectionInput(keyName: string, direction: DIRECTION): void {
    const currentTime = this.scene.time.now;
    const keyPressDuration = currentTime - (this.keyPressStartTime[keyName] || currentTime);

    if (keyPressDuration <= this.SHORT_KEY_THRESHOLD) {
      this.context.obj!.changeDirectionOnly(direction);
    } else {
      const door = this.context.obj!.getObjectInFront(direction);
      if (door instanceof DoorOverworldObj) {
        this.context.obj!.changeDirectionOnly(direction);
        this.context.actionQueue.enqueue(async () => {
          await this.context.obj!.isDoorInFront(direction);
        }, OVERWORLD_ACTION.OPEN_DOOR);
      } else {
        this.context.obj?.move(direction);
      }
    }
  }

  handleKeyInput(): void {
    const keyboard = KeyboardManager.getInstance();
    const keys = [KEY.Z, KEY.ENTER, KEY.R, KEY.S, KEY.A];

    const keydownCallback = async (key: KEY) => {
      try {
        if (this.context.isInputLocked()) {
          return;
        }
        switch (key) {
          case KEY.ENTER:
          case KEY.Z:
            if (this.context.obj && this.context.obj.isMovementFinish() && this.context.getCurrentAction() === OVERWORLD_ACTION.IDLE) {
              const event = this.context.obj.getEvent();

              if (event === 'surf') {
                await this.context.actionQueue.enqueue(async () => {
                  await this.context.showSurfMessage();
                }, OVERWORLD_ACTION.SURF);
                keyboard.setAllowKey(keys);
                keyboard.setKeyDownCallback(keydownCallback);
              } else if (event instanceof SignOverworldObj || event instanceof NpcOverworldObj || event instanceof GroundItemOverworldObj) {
                await this.context.actionQueue.enqueue(async () => {
                  await this.context.handleSelectEvent(event);
                }, OVERWORLD_ACTION.TALK);
                keyboard.setAllowKey(keys);
                keyboard.setKeyDownCallback(keydownCallback);
              } else if (event instanceof WildOverworldObj) {
                const direction = this.context.obj.getLastDirection();
                await this.context.actionQueue.enqueue(async () => {
                  const closePromise = this.context.waitForUiClose(MODE.BATTLE);
                  await event.reaction(direction);
                  await startBattleIntro(this.context.scene);
                  await Game.changeMode(MODE.BATTLE, event);
                  await closePromise;
                }, OVERWORLD_ACTION.BATTLE);
              }
            }
            break;
          case KEY.S:
            if (!PlayerGlobal.appearMenuFlag) return;
            if (this.context.obj && this.context.obj.isMovementFinish() && this.context.getCurrentAction() === OVERWORLD_ACTION.IDLE) {
              await this.context.actionQueue.enqueue(async () => {
                this.context.hud.updateIconTint(TEXTURE.ICON_MENU, true);
                const closePromise = this.context.waitForUiClose(MODE.OVERWORLD_MENU);
                await Game.changeMode(MODE.OVERWORLD_MENU);
                await closePromise;
                this.context.hud.updateIconTint(TEXTURE.ICON_MENU, false);
              }, OVERWORLD_ACTION.MENU);
            }
            break;
          case KEY.R:
            if (!PlayerGlobal.appearRunningShoesFlag) return;
            if (this.context.obj && this.context.obj.isMovementFinish() && this.context.getCurrentAction() === OVERWORLD_ACTION.IDLE) {
              this.context.obj.setMovement(PLAYER_STATUS.RUNNING);
              this.context.hud.updateIconTint(TEXTURE.ICON_RUNNING, this.context.obj.getCurrentStatus() === PLAYER_STATUS.RUNNING);
            }
            break;
          case KEY.A:
            if (!PlayerGlobal.appearItemSlotFlag) return;
            if (this.context.obj && this.context.obj.isMovementFinish() && this.context.getCurrentAction() === OVERWORLD_ACTION.IDLE) {
              await this.context.actionQueue.enqueue(async () => {
                this.context.hud.updateIconTint(TEXTURE.ICON_REG, true);
                const closePromise = this.context.waitForUiClose(MODE.QUICK_SLOT_ITEM);
                await Game.changeMode(MODE.QUICK_SLOT_ITEM);
                await closePromise;
                this.context.hud.updateIconTint(TEXTURE.ICON_REG, false);
              }, OVERWORLD_ACTION.QUICK_SLOT);
            }
            break;
        }
      } catch (err: any) {
        throw new Error(`Error handling key input: ${err}`);
      }
    };

    keyboard.setAllowKey(keys);
    keyboard.setKeyDownCallback(keydownCallback);
  }

  updateContext(context: Partial<OverworldPlayerInputContext>): void {
    this.context = { ...this.context, ...context };
  }

  private resetDirectionalKeyState(): void {
    this.keyPressStartTime = {};
  }
}
