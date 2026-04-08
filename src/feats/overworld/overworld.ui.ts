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
import {
  BaseObject,
  DoorObject,
  GroundItemObject,
  InteractiveObject,
  OtherPlayerObject,
  PlayerObject,
  WildPokemonObject,
} from './objects';
import { OverworldHudUI } from './overworld-hud.ui';
import i18next from '@poposafari/i18n';
import DayNightFilter from '@poposafari/utils/day-night-filter';

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
  // WildPokemonObject는 InteractiveObject를 상속하지 않으므로 BaseObject로 widen.
  private safariObjects: BaseObject[] = [];
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
    for (const obj of this.safariObjects) {
      // 잡기 상호작용은 후속 단계에서 별도 진입점으로 처리. 여기서는 InteractiveObject만 반환.
      if (!(obj instanceof InteractiveObject)) continue;
      const { x: ox, y: oy } = obj.getTilePos();
      if (ox === fx && oy === fy) return obj;
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
    if (obj instanceof GroundItemObject) {
      this.handleGroundItemPick(obj);
      return;
    }
    const steps = obj.reaction(this.player.getLastDirection());
    const phaseKey = obj.getPhaseRequest?.() ?? null;
    if (phaseKey) {
      this.onInteractivePhaseRequested?.(obj, phaseKey);
      return;
    }
    this.runReaction(steps);
  }

  private async handleGroundItemPick(obj: GroundItemObject): Promise<void> {
    const uid = obj.getUid();
    const itemId = obj.getItemId();
    try {
      const result = await this.scene.getApi().pickGroundItem(uid);
      if (!result) return;

      const nickname = this.scene.getUser()?.getProfile().nickname ?? '';
      const itemName = i18next.t(`item:${result.itemId}`, {
        defaultValue: result.itemId,
      });
      this.scene.getAudio().playEffect(SFX.GET_0);

      this.removeSafariObject(obj);
      await this.scene
        .getMessage('talk')
        .showMessage(i18next.t('safari:pickedItem', { name: nickname, item: itemName }));

      // SafariInfo 동기화: picked = true
      const mapKey = this.mapConfig?.key;
      if (mapKey) {
        const info = this.scene.getSafariInfo().get(mapKey);
        const target = info?.items.find((i) => i.uid === uid);
        if (target) target.picked = true;
      }
    } catch (err) {
      console.warn('[Safari] pickGroundItem failed', err);
    }
  }

  private removeSafariObject(obj: InteractiveObject): void {
    if (this.worldContainer) {
      this.worldContainer.remove(obj.getShadow());
      this.worldContainer.remove(obj.getSprite());
    }
    if (this.nameContainer) {
      this.nameContainer.remove(obj.getName());
    }
    const idx = this.safariObjects.indexOf(obj);
    if (idx >= 0) this.safariObjects.splice(idx, 1);
    obj.destroy();
    this.refreshPlayerBlockingRefs();
  }

  private refreshPlayerBlockingRefs(): void {
    if (!this.player || !this.mapView) return;
    this.player.setBlockingRefs([...this.mapView.getNpcs(), ...this.safariObjects]);
  }

  /**
   * 사파리 맵 진입 시 safariInfo 기반으로 GroundItem/WildPokemon 객체를 스폰.
   * items는 properties.spawn === 'land' 타일에만, wilds는 land/water 모두 가능.
   */
  private spawnSafariEntities(): void {
    if (!this.mapView || !this.mapConfig || !this.worldContainer || !this.nameContainer) return;
    if (!this.player) return;

    const mapKey = this.mapConfig.key;
    const info = this.scene.getSafariInfo().get(mapKey);
    if (!info) return;

    const landTiles = this.mapView.getSpawnTilePositions('land');
    const waterTiles = this.mapView.getSpawnTilePositions('water');

    const shuffle = <T>(arr: T[]): T[] => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const occupied = new Set<string>();
    const keyOf = (p: { x: number; y: number }) => `${p.x}:${p.y}`;

    const availableItems = info.items.filter((i) => !i.picked);
    const availableWilds = info.wilds.filter((w) => w.caught === 0);

    // 이미 좌표가 할당된 엔티티들의 좌표를 먼저 occupied로 등록
    for (const it of availableItems) {
      if (it.x != null && it.y != null) occupied.add(keyOf({ x: it.x, y: it.y }));
    }
    for (const w of availableWilds) {
      if (w.x != null && w.y != null) occupied.add(keyOf({ x: w.x, y: w.y }));
    }

    // 1) Items — land only
    const landPool = shuffle(landTiles);
    let landIdx = 0;
    const nextFreeLand = (): { x: number; y: number } | null => {
      while (landIdx < landPool.length) {
        const p = landPool[landIdx++];
        if (!occupied.has(keyOf(p))) return p;
      }
      return null;
    };

    for (const item of availableItems) {
      let px: number;
      let py: number;
      if (item.x != null && item.y != null) {
        px = item.x;
        py = item.y;
      } else {
        const pos = nextFreeLand();
        if (!pos) {
          console.warn(`[Safari] not enough land spawn tiles for items`);
          break;
        }
        px = pos.x;
        py = pos.y;
        item.x = px;
        item.y = py;
        occupied.add(keyOf(pos));
      }

      const obj = new GroundItemObject(this.scene, item.uid, item.itemId, px, py);
      this.safariObjects.push(obj);
      this.worldContainer.add(obj.getShadow());
      this.worldContainer.add(obj.getSprite());
      this.nameContainer.add(obj.getName());
    }

    // 2) Wilds — land ∪ water (점유 좌표 제외)
    const wildPool = shuffle([...landTiles, ...waterTiles].filter((p) => !occupied.has(keyOf(p))));
    let wildIdx = 0;
    const nextFreeWild = (): { x: number; y: number } | null => {
      while (wildIdx < wildPool.length) {
        const p = wildPool[wildIdx++];
        if (!occupied.has(keyOf(p))) return p;
      }
      return null;
    };

    for (const wild of availableWilds) {
      let px: number;
      let py: number;
      if (wild.x != null && wild.y != null) {
        px = wild.x;
        py = wild.y;
      } else {
        const pos = nextFreeWild();
        if (!pos) {
          console.warn(`[Safari] not enough spawn tiles for wilds`);
          break;
        }
        px = pos.x;
        py = pos.y;
        wild.x = px;
        wild.y = py;
        occupied.add(keyOf(pos));
      }

      const obj = new WildPokemonObject(this.scene, this.mapView, wild, mapKey, px, py, []);
      this.safariObjects.push(obj);
      this.worldContainer.add(obj.getShadow());
      this.worldContainer.add(obj.getSprite());
      this.nameContainer.add(obj.getName());
    }

    // wild의 blockingRefs: 다른 safari 객체 + player + npcs.
    // otherPlayer는 tween 기반 + 동적 join/leave로 race 가능성이 있어 제외.
    const npcs = this.mapView.getNpcs();
    for (const obj of this.safariObjects) {
      if (obj instanceof WildPokemonObject) {
        const others = this.safariObjects.filter((o) => o !== obj);
        const refs: BaseObject[] = [...others, ...npcs];
        if (this.player) refs.push(this.player);
        obj.setBlockingRefs(refs);
        obj.startRandomWalk();
      }
    }

    this.refreshPlayerBlockingRefs();
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
      if (this.mapConfig?.dayNightFilter !== false) {
        this.worldContainer.setPostPipeline(DayNightFilter.KEY);
      }

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

      if (this.mapConfig?.type === 'safari') {
        this.spawnSafariEntities();
        // 야생 포켓몬 스폰 직후 1회 emit → 플레이어가 아직 움직이지 않아도
        // 근처 wild들의 이름표 가시성이 초기 평가되도록 한다.
        this.scene.events.emit('player_tile_moved', {
          tileX: this.player.getTileX(),
          tileY: this.player.getTileY(),
        });
      }

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

    for (const obj of this.safariObjects) {
      obj.destroy();
    }
    this.safariObjects = [];
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

  // [MOVE-DEBUG] emit 카운터
  private moveEmitCount = 0;

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

    // [MOVE-DEBUG] 클라이언트 좌표 + emit 횟수 로그
    this.moveEmitCount++;
    const pos = this.player?.getTilePos();
    console.log(
      `[MOVE-DEBUG] #${this.moveEmitCount} emit dir=${dir} type=${moveType} clientPos=(${pos?.x},${pos?.y})`,
    );

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
      this.hud.refreshInfo(mapKey, pos.x, pos.y, profile?.money ?? 0, 0);
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

  /**
   * 사파리 야생 포켓몬의 랜덤 워크 tick. update() 본 경로와 OverworldPhase.tickBackground
   * (메뉴/PC 등 다른 phase가 위에 있을 때) 양쪽에서 호출되며, 호출 경로 단일화를 위해 분리.
   * 정렬과 카메라 갱신은 호출자(또는 update 본문)에서 수행한다.
   */
  tickWildPokemons(delta: number): void {
    for (const obj of this.safariObjects) {
      if (obj instanceof WildPokemonObject) {
        obj.freezeRandomWalk(false);
        obj.update(delta);
      }
    }
  }

  update(_time: number, delta: number): void {
    if (!this.player || !this.cursorKeys) return;

    if (this.doorTransitionPending) {
      this.player.update(delta);
      // door 전환 중에도 wild의 잔여 픽셀 이동은 마저 진행되도록 freeze 모드로 update.
      // 상태 머신(IDLE/WALKING 전이, 신규 스텝 큐잉)은 멈추지만 super.update()는 호출됨.
      for (const obj of this.safariObjects) {
        if (obj instanceof WildPokemonObject) {
          obj.freezeRandomWalk(true);
          obj.update(delta);
        }
      }
      this.sortWorldContainerByDepth();
      const sprite = this.player.getSprite();
      const center = sprite.getCenter(undefined, true);
      const cam = this.scene.cameras.main;
      cam.setScroll(center.x - cam.width / 2, center.y - cam.height / 2);
      this.lastFrameKeys = { up: false, down: false, left: false, right: false };
      return;
    }

    this.player.update(delta);

    // 야생 포켓몬 랜덤 워크 진행. 메뉴/UI push 중에도 계속 움직이는 것이 정책.
    this.tickWildPokemons(delta);

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
            frontDoor.trigger().then(async (result) => {
              if (!result) {
                this.doorTransitionPending = false;
                return;
              }
              const targetMapId = result.location as string;
              if (targetMapId.startsWith('s') && !this.scene.getSafariInfo().has(targetMapId)) {
                try {
                  const safariResult = await this.scene.getApi().enterSafari(targetMapId, false);
                  if (safariResult) {
                    this.scene.mergeSafariInfo({ [safariResult.mapId]: safariResult.mapInfo });
                  }
                } catch {
                  this.doorTransitionPending = false;
                  return;
                }
              }
              this.scene.startMapTransitionWithFade(result);
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
      this.hud.refreshInfo(mapKey, pos.x, pos.y, profile?.money ?? 0, 0);
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
