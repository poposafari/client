import { BaseUi } from '@poposafari/core';
import type { MapConfig, ReactionStep } from '@poposafari/core/map.registry';
import { GameScene } from '@poposafari/scenes';
import {
  DEPTH,
  KEY,
  OverworldDirection,
  OverworldMovementState,
  SFX,
  TEXTCOLOR,
  TEXTURE,
} from '@poposafari/types';
import { DIRECTION, directionToDelta, OVERWORLD_ZOOM } from './overworld.constants';
import { MapView } from './map-view';
import {
  DEFAULT_MOVE_DURATION_MS,
  MOVE_TYPE_DURATION_MS,
  type MovePayload,
  type RoomUserState,
  type UserMovedPayload,
} from './overworld-socket.types';
import { DoorObject, InteractiveObject, OtherPlayerObject, PlayerObject } from './objects';
import { OverworldHudUI } from './overworld-hud.ui';
import i18next from '@poposafari/i18n';

/** 트리거 타입별 핸들러 (player, params) => void */
const TRIGGER_HANDLERS: Record<
  string,
  (player: PlayerObject, params: Record<string, unknown>) => void
> = {};

function toDIRECTION(d: OverworldDirection): DIRECTION {
  const map: Record<OverworldDirection, DIRECTION> = {
    [OverworldDirection.UP]: DIRECTION.UP,
    [OverworldDirection.DOWN]: DIRECTION.DOWN,
    [OverworldDirection.LEFT]: DIRECTION.LEFT,
    [OverworldDirection.RIGHT]: DIRECTION.RIGHT,
  };
  return map[d];
}

function toOverworldDirection(d: DIRECTION): OverworldDirection | null {
  if (d === DIRECTION.NONE) return null;
  const map: Record<DIRECTION, OverworldDirection> = {
    [DIRECTION.UP]: OverworldDirection.UP,
    [DIRECTION.DOWN]: OverworldDirection.DOWN,
    [DIRECTION.LEFT]: OverworldDirection.LEFT,
    [DIRECTION.RIGHT]: OverworldDirection.RIGHT,
    [DIRECTION.NONE]: OverworldDirection.DOWN,
  };
  return map[d];
}

/** OverworldMovementState → 서버 moveType 문자열 */
function toMoveType(state: OverworldMovementState): MovePayload['moveType'] {
  const map: Record<OverworldMovementState, MovePayload['moveType']> = {
    [OverworldMovementState.WALK]: 'walk',
    [OverworldMovementState.RUNNING]: 'running',
    [OverworldMovementState.RIDE]: 'ride',
    [OverworldMovementState.JUMP]: 'jump',
    [OverworldMovementState.SURF]: 'surf',
    [OverworldMovementState.FISHING]: 'walk',
  };
  return map[state] ?? 'walk';
}

const DEFAULT_TILE_X = 4;
const DEFAULT_TILE_Y = 4;
/** IDLE일 때 이 시간 이상 누르면 이동, 미만이면 제자리에서 방향만 전환 */
const HOLD_THRESHOLD_MS = 120;

/** 움직임 상태별 타일당 이동 속도 (MovableObject baseSpeed) */
const SPEED_BY_MOVEMENT_STATE: Partial<Record<OverworldMovementState, number>> = {
  [OverworldMovementState.WALK]: 2,
  [OverworldMovementState.RUNNING]: 4,
  [OverworldMovementState.RIDE]: 6,
  [OverworldMovementState.JUMP]: 3,
  [OverworldMovementState.SURF]: 4,
  // FISHING는 추후 정의
};

type KeyState = { up: boolean; down: boolean; left: boolean; right: boolean };

const DIR_KEYS: { dir: DIRECTION; key: keyof KeyState }[] = [
  { dir: DIRECTION.UP, key: 'up' },
  { dir: DIRECTION.DOWN, key: 'down' },
  { dir: DIRECTION.LEFT, key: 'left' },
  { dir: DIRECTION.RIGHT, key: 'right' },
];

export class OverworldUi extends BaseUi {
  scene!: GameScene;
  private hud: OverworldHudUI | null = null;
  private mapView: MapView | null = null;
  private mapConfig: MapConfig | null = null;
  private player: PlayerObject | null = null;
  private doors: DoorObject[] = [];
  private otherPlayers: Map<string, OtherPlayerObject> = new Map();
  private worldContainer: Phaser.GameObjects.Container | null = null;
  private nameContainer: Phaser.GameObjects.Container | null = null;

  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | null = null;

  private keyPressStartTime: Partial<Record<DIRECTION, number>> = {};
  private lastFrameKeys: KeyState = { up: false, down: false, left: false, right: false };
  private wasIdleLastFrame = true;

  private doorTransitionPending = false;

  private nextJumpEndGoesToSurf = false;

  onMenuRequested: (() => void) | null = null;
  onInteractivePhaseRequested: ((object: InteractiveObject, phaseKey: string) => void) | null =
    null;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.DEFAULT);
    this.scene = scene;
    this.setScrollFactor(1);
  }

  setMapView(mapView: MapView): void {
    this.mapView = mapView;
  }

  setMapConfig(config: MapConfig): void {
    this.mapConfig = config;
  }

  getMapView(): MapView | null {
    return this.mapView;
  }

  getPlayer(): PlayerObject | null {
    return this.player;
  }

  private getDoorAtTile(fx: number, fy: number): DoorObject | null {
    for (const door of this.doors) {
      if (fx === door.getTileX() && fy === door.getTileY()) {
        return door;
      }
    }
    return null;
  }

  getFacingInteractiveObject(): InteractiveObject | null {
    if (!this.player || !this.mapView) return null;
    const dir = this.player.getLastDirection();
    if (dir === DIRECTION.NONE) return null;
    const { x: px, y: py } = this.player.getTilePos();
    const { dx, dy } = directionToDelta(dir);
    const fx = px + dx;
    const fy = py + dy;
    const npcs = this.mapView.getNpcs();
    for (const npc of npcs) {
      const { x: nx, y: ny } = npc.getTilePos();
      if (nx === fx && ny === fy) return npc;
    }
    return null;
  }

  createLayout(): void {}

  onInput(key: string): void {
    if (this.doorTransitionPending) return;
    const user = this.scene.getUser();
    const state = user?.getOverworldMovementState();
    if (state === OverworldMovementState.JUMP) {
      return;
    }
    if (!this.player?.isMovementFinish()) {
      return;
    }
    switch (key) {
      case KEY.R:
        this.handleKeyR();
        this.syncRunningToggleIcon();
        break;
      case KEY.S:
        this.syncMenuToggleIcon(true);
        this.scene.getAudio().playEffect(SFX.OPEN_0);
        this.onMenuRequested?.();
        break;
      case KEY.B:
        this.toggleRideBicycle();
        break;
      case KEY.J:
        this.handleKeyJ();
        break;
      case KEY.ONE:
        this.surf();
        break;
      case KEY.Z:
      case KEY.ENTER:
        this.handleTalkAction();
        break;
      // KEY.ESC 등 추가 키는 여기서 처리
      default:
        break;
    }
  }

  private handleTalkAction(): void {
    if (!this.player || !this.player.isMovementFinish()) return;
    const obj = this.getFacingInteractiveObject();
    if (!obj) return;
    const steps = obj.reaction(this.player.getLastDirection());
    const phaseKey = obj.getPhaseRequest?.() ?? null;
    if (phaseKey) {
      this.onInteractivePhaseRequested?.(obj, phaseKey);
      return;
    }
    this.runReaction(steps);
  }

  private runReaction(steps: ReactionStep[]): void {
    if (steps.length === 0) return;
    (async () => {
      for (const step of steps) {
        const text = i18next.t(step.content.text);
        const config = {
          name: step.content.name,
          speed: step.content.speed,
          resolveWhen: step.content.resolveWhen,
        };
        if (step.key === 'talk') {
          await this.scene.getMessage('talk').showMessage(text, config);
        } else if (step.key === 'question') {
          await this.scene.getMessage('question').showMessage(text, config);
        } else {
          await this.scene.getMessage('notice').showMessage(text, {
            ...config,
            window: step.content.window ?? TEXTURE.WINDOW_NOTICE_0,
          });
        }
      }
    })();
  }

  private handleKeyJ(): void {
    if (!this.player) return;
    const dir = this.player.getLastDirection();
    if (this.player.jump(dir)) {
      const speed = SPEED_BY_MOVEMENT_STATE[OverworldMovementState.JUMP] ?? 3;
      this.player.setBaseSpeed(speed);
    }
  }

  surf(): boolean {
    if (!this.player) return false;
    const direction = this.player.getLastDirection();
    this.nextJumpEndGoesToSurf = true;
    if (!this.player.jump(direction)) {
      this.nextJumpEndGoesToSurf = false;
      return false;
    }
    const speed = SPEED_BY_MOVEMENT_STATE[OverworldMovementState.JUMP] ?? 3;
    this.player.setBaseSpeed(speed);
    return true;
  }

  public syncMenuToggleIcon(open: boolean): void {
    this.hud?.updateToggleIcon(TEXTURE.ICON_MENU, open);
  }

  private syncRunningToggleIcon(): void {
    const isRunning =
      this.scene.getUser()?.getOverworldMovementState() === OverworldMovementState.RUNNING;
    this.hud?.updateToggleIcon(TEXTURE.ICON_RUNNING, isRunning);
  }

  private handleKeyR(): void {
    const user = this.scene.getUser();
    if (!user || !this.player) return;

    const current = user.getOverworldMovementState();
    const next =
      current === OverworldMovementState.RUNNING
        ? OverworldMovementState.WALK
        : OverworldMovementState.RUNNING;
    user.setOverworldMovementState(next);

    const speed =
      SPEED_BY_MOVEMENT_STATE[next] ?? SPEED_BY_MOVEMENT_STATE[OverworldMovementState.WALK] ?? 2;
    this.player.setBaseSpeed(speed);
  }

  /**
   * 자전거 ride 토글 (테스트용 B키).
   * RIDE → WALK, 그 외 → RIDE.
   * 추후에는 자전거 아이템 사용 시 enterRideBicycle(), 해제 시 exitRideBicycle() 호출.
   */
  toggleRideBicycle(): void {
    const user = this.scene.getUser();
    if (!user || !this.player) return;

    const current = user.getOverworldMovementState();
    const next =
      current === OverworldMovementState.RIDE
        ? OverworldMovementState.WALK
        : OverworldMovementState.RIDE;
    user.setOverworldMovementState(next);

    const speed =
      SPEED_BY_MOVEMENT_STATE[next] ?? SPEED_BY_MOVEMENT_STATE[OverworldMovementState.WALK] ?? 2;
    this.player.setBaseSpeed(speed);
  }

  enterRideBicycle(): void {
    const user = this.scene.getUser();
    if (!user || !this.player) return;
    user.setOverworldMovementState(OverworldMovementState.RIDE);
    const speed = SPEED_BY_MOVEMENT_STATE[OverworldMovementState.RIDE] ?? 6;
    this.player.setBaseSpeed(speed);
  }

  exitRideBicycle(): void {
    const user = this.scene.getUser();
    if (!user || !this.player) return;
    user.setOverworldMovementState(OverworldMovementState.WALK);
    const speed = SPEED_BY_MOVEMENT_STATE[OverworldMovementState.WALK] ?? 2;
    this.player.setBaseSpeed(speed);
  }

  errorEffect(_errorMsg: string): void {}

  waitForInput(): Promise<unknown> {
    return new Promise(() => {});
  }

  async show(): Promise<void> {
    this.scene.cameras.main.setBackgroundColor('#000000');

    if (this.mapView) {
      this.worldContainer = this.scene.add.container(0, 0);
      this.worldContainer.setScale(OVERWORLD_ZOOM);
      this.worldContainer.setDepth(DEPTH.GROUND);

      this.nameContainer = this.scene.add.container(0, 0);
      this.nameContainer.setScale(OVERWORLD_ZOOM);
      this.nameContainer.setDepth(DEPTH.OVERWORLD_NAME);

      for (const npc of this.mapView.getNpcs()) {
        this.worldContainer!.add(npc.getShadow());
        this.worldContainer!.add(npc.getSprite());
        this.nameContainer!.add(npc.getName());
      }

      const user = this.scene.getUser();
      const lastLocation = user?.getProfile()?.lastLocation;
      const tileX = lastLocation?.x ?? DEFAULT_TILE_X;
      const tileY = lastLocation?.y ?? DEFAULT_TILE_Y;
      const initDirection = user ? toDIRECTION(user.getOverworldDirection()) : DIRECTION.DOWN;
      const blockingRefs = this.mapView.getNpcs();
      this.player = new PlayerObject(this.scene, this.mapView, tileX, tileY, {
        initDirection,
        blockingRefs: blockingRefs.length > 0 ? blockingRefs : undefined,
      });

      this.worldContainer.add(this.player.getShadow());
      this.worldContainer.add(this.player.getSprite());
      this.nameContainer!.add(this.player.getName());
      const outfit = this.player.getOutfitSprite();
      if (outfit) this.worldContainer.add(outfit);
      const hair = this.player.getHairSprite();
      if (hair) this.worldContainer.add(hair);

      this.doors = [];
      if (this.mapConfig?.doors?.length) {
        for (const d of this.mapConfig.doors) {
          this.doors.push(new DoorObject(this.scene, d.startId, d.destId));
        }
      }
      for (const door of this.doors) {
        this.worldContainer.add(door.getShadow());
        this.worldContainer.add(door.getSprite());
        this.nameContainer!.add(door.getName());
      }

      const myUserId = this.scene.getCurrentSocketUserId();
      const pending = this.scene.getPendingRoomState();
      if (pending?.length) {
        for (const u of pending) {
          if (u.userId === myUserId) continue;
          const tileX = parseInt(u.x, 10) || 0;
          const tileY = parseInt(u.y, 10) || 0;
          const other = new OtherPlayerObject(this.scene, tileX, tileY, {
            costume: u.costume,
            gender: u.gender as 'male' | 'female' | undefined,
            name: u.nickname || '',
          });
          other.getName().setText(u.nickname || '');
          this.worldContainer!.add(other.getShadow());
          this.worldContainer!.add(other.getSprite());
          const oSprite = other.getOutfitSprite();
          if (oSprite) this.worldContainer!.add(oSprite);
          const hSprite = other.getHairSprite();
          if (hSprite) this.worldContainer!.add(hSprite);
          this.nameContainer!.add(other.getName());
          this.otherPlayers.set(u.userId, other);
        }
        this.scene.clearPendingRoomState();
      }

      this.scene.events.on('player_tile_moved', this.handlePlayerTileMoved, this);

      this.cursorKeys = this.scene.input.keyboard?.createCursorKeys() ?? null;

      this.keyPressStartTime = {};
      this.lastFrameKeys = { up: false, down: false, left: false, right: false };
      this.wasIdleLastFrame = true;
    }

    this.hud = new OverworldHudUI(this.scene);
    this.hud.create();
    this.hud.show();
    this.syncRunningToggleIcon();

    super.show();
  }

  hide(): void {
    this.doorTransitionPending = false;
    this.scene.cameras.main.setScroll(0, 0);

    if (this.worldContainer) {
      this.worldContainer.removeAll(false);
      this.worldContainer.destroy();
      this.worldContainer = null;
    }
    if (this.nameContainer) {
      this.nameContainer.removeAll(false);
      this.nameContainer.destroy();
      this.nameContainer = null;
    }

    this.scene.events.off('player_tile_moved', this.handlePlayerTileMoved, this);
    this.cursorKeys = null;

    if (this.hud) {
      this.hud.destroy();
      this.hud = null;
    }

    for (const door of this.doors) {
      door.destroy();
    }
    this.doors = [];
    for (const other of this.otherPlayers.values()) {
      other.destroy();
    }
    this.otherPlayers.clear();
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    if (this.mapView) {
      this.mapView.destroy();
      this.mapView = null;
    }
    this.mapConfig = null;
    super.hide();
  }

  /** 실시간으로 들어온 다른 플레이어 한 명 추가 (user_joined 수신 시 호출) */
  addOtherPlayer(u: RoomUserState): void {
    if (!this.worldContainer || !this.nameContainer) return;
    const myUserId = this.scene.getCurrentSocketUserId();
    if (u.userId === myUserId) return;
    if (this.otherPlayers.has(u.userId)) return;

    const tileX = parseInt(u.x, 10) || 0;
    const tileY = parseInt(u.y, 10) || 0;
    const other = new OtherPlayerObject(this.scene, tileX, tileY, {
      costume: u.costume,
      gender: u.gender as 'male' | 'female' | undefined,
      name: u.nickname || '',
    });
    other.getName().setText(u.nickname || '');
    this.worldContainer.add(other.getShadow());
    this.worldContainer.add(other.getSprite());
    const oSprite = other.getOutfitSprite();
    if (oSprite) this.worldContainer.add(oSprite);
    const hSprite = other.getHairSprite();
    if (hSprite) this.worldContainer.add(hSprite);
    this.nameContainer.add(other.getName());
    this.otherPlayers.set(u.userId, other);
    this.sortWorldContainerByDepth();
  }

  /** 나간 다른 플레이어 제거 (user_left 수신 시 호출) */
  removeOtherPlayer(userId: string): void {
    const other = this.otherPlayers.get(userId);
    if (!other) return;
    if (this.worldContainer) {
      this.worldContainer.remove(other.getShadow());
      this.worldContainer.remove(other.getSprite());
      const oSprite = other.getOutfitSprite();
      if (oSprite) this.worldContainer.remove(oSprite);
      const hSprite = other.getHairSprite();
      if (hSprite) this.worldContainer.remove(hSprite);
    }
    if (this.nameContainer) {
      this.nameContainer.remove(other.getName());
    }
    this.otherPlayers.delete(userId);
    other.destroy();
    this.sortWorldContainerByDepth();
  }

  private handlePlayerTileMoved(): void {
    if (!this.player) return;
    const user = this.scene.getUser();
    if (user?.getOverworldMovementState() !== OverworldMovementState.JUMP) return;
    this.emitMoveToServer(this.player.getLastDirection());
  }

  private emitMoveToServer(dir: DIRECTION): void {
    if (dir === DIRECTION.NONE) return;
    const socket = this.scene.getSocket();
    if (!socket?.connected) return;
    const user = this.scene.getUser();
    const moveType = user ? toMoveType(user.getOverworldMovementState()) : 'walk';
    const payload: MovePayload = {
      direction: dir as MovePayload['direction'],
      moveType,
    };
    socket.emit('move', payload);
  }

  onOtherPlayerMoved(payload: UserMovedPayload): void {
    const other = this.otherPlayers.get(payload.userId);
    if (!other) return;
    const dir = payload.direction as 'up' | 'down' | 'left' | 'right' | undefined;
    const validDir = dir && ['up', 'down', 'left', 'right'].includes(dir) ? dir : undefined;
    const rawDuration = payload.moveType ? MOVE_TYPE_DURATION_MS[payload.moveType] : undefined;
    const durationMs = typeof rawDuration === 'number' ? rawDuration : DEFAULT_MOVE_DURATION_MS;
    other.moveToTile(payload.x, payload.y, durationMs, {
      moveType: payload.moveType,
      direction: validDir,
    });
  }

  onRefreshLanguage(): void {
    if (this.hud && this.player) {
      const profile = this.scene.getUser()?.getProfile();
      const mapKey = this.mapConfig?.key ?? profile?.lastLocation?.map ?? '';
      const pos = this.player.getTilePos();
      this.hud.refreshInfo(mapKey, pos.x, pos.y, profile?.money ?? 0, profile?.candy ?? 0);
      this.hud.updateTime();
    }
    if (this.mapView) {
      for (const npc of this.mapView.getNpcs()) npc.refreshNameText();
    }
    for (const door of this.doors) door.refreshNameText();
    this.player?.refreshNameText();
  }

  private sortWorldContainerByDepth(): void {
    const byDepth = (a: Phaser.GameObjects.GameObject, b: Phaser.GameObjects.GameObject) =>
      (a as unknown as { depth: number }).depth - (b as unknown as { depth: number }).depth;
    if (this.worldContainer) this.worldContainer.list.sort(byDepth);
    if (this.nameContainer) this.nameContainer.list.sort(byDepth);
  }

  update(_time: number, delta: number): void {
    if (!this.player || !this.cursorKeys) return;

    if (this.doorTransitionPending) {
      this.player.update(delta);
      this.sortWorldContainerByDepth();
      const sprite = this.player.getSprite();
      const center = sprite.getCenter(undefined, true);
      const cam = this.scene.cameras.main;
      cam.setScroll(center.x - cam.width / 2, center.y - cam.height / 2);
      this.lastFrameKeys = { up: false, down: false, left: false, right: false };
      return;
    }

    this.player.update(delta);

    this.sortWorldContainerByDepth();

    const sprite = this.player.getSprite();
    const center = sprite.getCenter(undefined, true);
    const cam = this.scene.cameras.main;
    cam.setScroll(center.x - cam.width / 2, center.y - cam.height / 2);

    if (!this.scene.getInputManager().isTop(this)) return;

    const isIdle = this.player.isMovementFinish();

    const user = this.scene.getUser();
    const movementState = user?.getOverworldMovementState();

    if (isIdle && movementState === OverworldMovementState.JUMP) {
      if (this.nextJumpEndGoesToSurf) {
        this.nextJumpEndGoesToSurf = false;
        user?.setOverworldMovementState(OverworldMovementState.SURF);
        const speed = SPEED_BY_MOVEMENT_STATE[OverworldMovementState.SURF] ?? 4;
        this.player.setBaseSpeed(speed);
      } else {
        user?.setOverworldMovementState(OverworldMovementState.WALK);
        const speed = SPEED_BY_MOVEMENT_STATE[OverworldMovementState.WALK] ?? 2;
        this.player.setBaseSpeed(speed);
      }
    }

    if (movementState === OverworldMovementState.JUMP) {
      this.lastFrameKeys = {
        up: this.cursorKeys.up.isDown,
        down: this.cursorKeys.down.isDown,
        left: this.cursorKeys.left.isDown,
        right: this.cursorKeys.right.isDown,
      };
      this.wasIdleLastFrame = isIdle;
      return;
    }

    if (isIdle && this.mapView) {
      const triggers = this.mapView.getTriggers();
      const px = this.player.getTilePos().x;
      const py = this.player.getTilePos().y;
      for (const trigger of triggers) {
        if (trigger.canFire(px, py)) {
          const handler = TRIGGER_HANDLERS[trigger.getType()];
          if (handler) {
            handler(this.player, trigger.getParams());
            if (trigger.isOneShot()) trigger.setTriggered(true);
          }
          break;
        }
      }
    }

    const now = this.scene.time.now;
    const keys: KeyState = {
      up: this.cursorKeys.up.isDown,
      down: this.cursorKeys.down.isDown,
      left: this.cursorKeys.left.isDown,
      right: this.cursorKeys.right.isDown,
    };

    if (isIdle) {
      for (const { dir, key } of DIR_KEYS) {
        if (this.lastFrameKeys[key] && !keys[key]) {
          if (this.keyPressStartTime[dir] != null) {
            this.player.setDirectionOnly(dir);
          }
          delete this.keyPressStartTime[dir];
        }
      }

      for (const { dir, key } of DIR_KEYS) {
        if (!keys[key]) continue;
        if (!this.wasIdleLastFrame) {
          this.player.move(dir);
          if (!this.player.isMovementBlocking()) this.emitMoveToServer(dir);
          delete this.keyPressStartTime[dir];
          break;
        }
        if (this.keyPressStartTime[dir] == null) {
          this.keyPressStartTime[dir] = now;
          break;
        }
        if (now - this.keyPressStartTime[dir] >= HOLD_THRESHOLD_MS) {
          const { dx, dy } = directionToDelta(dir);
          const px = this.player.getTilePos().x;
          const py = this.player.getTilePos().y;
          const frontDoor = this.getDoorAtTile(px + dx, py + dy);
          if (frontDoor) {
            this.doorTransitionPending = true;
            this.keyPressStartTime = {};
            this.inputManager.clearInputQueue();
            frontDoor.trigger().then((result) => {
              if (result) this.scene.startMapTransitionWithFade(result);
              this.scene.time.delayedCall(0, () => {
                this.doorTransitionPending = false;
              });
            });
            return;
          } else {
            this.player.move(dir);
            if (!this.player.isMovementBlocking()) this.emitMoveToServer(dir);
          }
          delete this.keyPressStartTime[dir];
          break;
        } else {
          this.player.setDirectionOnly(dir);
          break;
        }
      }
    }

    const lastDir = this.player.getLastDirection();
    const overworldDir = toOverworldDirection(lastDir);

    if (overworldDir !== null && user) {
      user.setOverworldDirection(overworldDir);
    }

    if (this.hud) {
      const profile = user?.getProfile();
      const mapKey = this.mapConfig?.key ?? profile?.lastLocation?.map ?? '';
      const pos = this.player.getTilePos();
      this.hud.refreshInfo(mapKey, pos.x, pos.y, profile?.money ?? 0, profile?.candy ?? 0);
      this.hud.updateTime();
    }

    this.lastFrameKeys = { ...keys };
    this.wasIdleLastFrame = isIdle;
  }

  destroy(fromScene?: boolean): void {
    this.hide();
    super.destroy(fromScene);
  }
}
