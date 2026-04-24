import { BaseUi } from '@poposafari/core';
import type { MapConfig, ReactionStep } from '@poposafari/core/map.registry';
import { GameEvent, GameScene } from '@poposafari/scenes';
import {
  DEPTH,
  GetMeRes,
  ItemCategory,
  KEY,
  OverworldDirection,
  OverworldMovementState,
  SFX,
  TEXTURE,
} from '@poposafari/types';
import { DIRECTION, directionToDelta, OVERWORLD_ZOOM } from './overworld.constants';
import { MapView } from './map-view';
import {
  DEFAULT_MOVE_DURATION_MS,
  MOVE_TYPE_DURATION_MS,
  type MovePayload,
  type OtherPetChangedPayload,
  type PetChangePayload,
  type PetState,
  type RoomUserState,
  type UserMovedPayload,
} from './overworld-socket.types';
import {
  BaseObject,
  DoorObject,
  GroundItemObject,
  InteractiveObject,
  isPositivePetEmotion,
  LightObject,
  OtherPlayerObject,
  PetObject,
  PlayerObject,
  WildPokemonObject,
} from './objects';
import { OverworldHudUI } from './overworld-hud.ui';
import i18next from '@poposafari/i18n';
import DayNightFilter from '@poposafari/utils/day-night-filter';
import { getPokemonI18Name } from '@poposafari/utils';
import { KeyItemRegistry } from '../key-items';

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

function parsePetField(value: string | PetState | null | undefined): PetState | null {
  if (!value) return null;
  if (typeof value === 'object') {
    if (!value.pokedexId) return null;
    return { pokedexId: value.pokedexId, isShiny: !!value.isShiny };
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'null') return null;
  try {
    const parsed = JSON.parse(trimmed) as Partial<PetState>;
    if (!parsed || !parsed.pokedexId) return null;
    return { pokedexId: String(parsed.pokedexId), isShiny: !!parsed.isShiny };
  } catch {
    return null;
  }
}

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
  private lightContainer: Phaser.GameObjects.Container | null = null;
  private lightObjects: LightObject[] = [];

  // 사파리 타일 점유 추적 (incremental spawn 용). 맵 입장 시 초기화, 퇴장 시 비움.
  private spawnOccupied: Set<string> = new Set();
  private spawnLandPool: { x: number; y: number }[] = [];
  private spawnWaterPool: { x: number; y: number }[] = [];
  private spawnPoolsInitialized = false;

  // TTL/포획 경로 동시 종료 경합 방어: 핸들러/해소 양쪽 모두 봐야 한다.
  private pendingDespawnUids: Set<string> = new Set();

  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | null = null;

  private keyPressStartTime: Partial<Record<DIRECTION, number>> = {};
  private lastFrameKeys: KeyState = { up: false, down: false, left: false, right: false };
  private wasIdleLastFrame = true;

  private doorTransitionPending = false;
  private wildEncounterPending = false;
  private petTalkPending = false;

  private nextJumpEndGoesToSurf = false;

  private pet: PetObject | null = null;
  private petOwnerPokemonId: number | null = null;
  private petOwnerSignature: string | null = null;
  private petSummoning = false;
  private petRecalling = false;
  private unsubscribeParty: (() => void) | null = null;
  private prevMovementState: OverworldMovementState | null = null;

  onMenuRequested: (() => void) | null = null;
  onInteractivePhaseRequested: ((object: InteractiveObject, phaseKey: string) => void) | null =
    null;
  onWildEncounterRequested: ((wild: WildPokemonObject) => void) | null = null;
  onRegisteredItemsRequested: (() => void) | null = null;

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

  private getFacingWildPokemon(): WildPokemonObject | null {
    if (!this.player) return null;
    const dir = this.player.getLastDirection();
    if (dir === DIRECTION.NONE) return null;
    const { x: px, y: py } = this.player.getTilePos();
    const { dx, dy } = directionToDelta(dir);
    const fx = px + dx;
    const fy = py + dy;
    for (const obj of this.safariObjects) {
      if (!(obj instanceof WildPokemonObject)) continue;
      const { x: ox, y: oy } = obj.getTilePos();
      if (ox === fx && oy === fy) return obj;
    }
    return null;
  }

  private oppositeDirection(dir: DIRECTION): DIRECTION {
    switch (dir) {
      case DIRECTION.UP:
        return DIRECTION.DOWN;
      case DIRECTION.DOWN:
        return DIRECTION.UP;
      case DIRECTION.LEFT:
        return DIRECTION.RIGHT;
      case DIRECTION.RIGHT:
        return DIRECTION.LEFT;
      default:
        return dir;
    }
  }

  createLayout(): void {}

  onInput(key: string): void {
    if (this.doorTransitionPending) return;
    if (this.wildEncounterPending) return;
    if (this.petTalkPending) return;
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
      case KEY.A:
        this.syncRegistedItemIcon(true);
        this.onRegisteredItemsRequested?.();
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
    if (!obj) {
      if (this.isFacingPet()) {
        void this.handlePetTalk();
        return;
      }
      const wild = this.getFacingWildPokemon();
      if (wild && wild.isCatchable() && !wild.isInteractionLocked()) {
        void this.handleWildTalk(wild);
      }
      return;
    }
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

  private isFacingPet(): boolean {
    if (!this.player || !this.pet) return false;
    const dir = this.player.getLastDirection();
    if (dir === DIRECTION.NONE) return false;
    const { x: px, y: py } = this.player.getTilePos();
    const { dx, dy } = directionToDelta(dir);
    const { x: tx, y: ty } = this.pet.getTilePos();
    return tx === px + dx && ty === py + dy;
  }

  private getPetDisplayName(): string {
    const first = this.scene
      .getUser()
      ?.getParty()
      .find((p) => p.partySlot === 0);
    if (!first) return '';
    if (first.nickname) return first.nickname;

    return getPokemonI18Name(first.pokedexId);
  }

  private async handlePetTalk(): Promise<void> {
    const pet = this.pet;
    if (!pet || !this.player) return;
    if (this.petTalkPending) return;

    this.petTalkPending = true;
    try {
      pet.faceDirection(this.oppositeDirection(this.player.getLastDirection()));

      const emotion = pet.getCurrentEmotion();

      if (isPositivePetEmotion(emotion)) {
        const jumpCount = Phaser.Math.Between(2, 3);
        await pet.playJump(jumpCount);
      } else {
        await pet.playTremble(500);
      }

      await pet.playEmote((sprite) => this.worldContainer?.add(sprite));

      const variants = i18next.t(`petEmotion:${emotion}`, {
        returnObjects: true,
      }) as unknown;
      if (Array.isArray(variants) && variants.length > 0) {
        const idx = Math.floor(Math.random() * variants.length);
        const name = this.getPetDisplayName();
        const line = i18next.t(`petEmotion:${emotion}.${idx}`, { name });
        await this.scene.getMessage('talk').showMessage(line);
      }
    } finally {
      this.petTalkPending = false;
    }
  }

  private async handleWildTalk(wild: WildPokemonObject): Promise<void> {
    if (!this.player) return;
    if (!wild.tryLockInteraction()) return;

    this.wildEncounterPending = true;
    wild.freezeRandomWalk(true);
    wild.faceDirection(this.oppositeDirection(this.player.getLastDirection()));
    await wild.playEmote('emo_0', (sprite) => this.worldContainer?.add(sprite));
    this.onWildEncounterRequested?.(wild);
  }

  private async handleGroundItemPick(obj: GroundItemObject): Promise<void> {
    const uid = obj.getUid();
    const itemId = obj.getItemId();
    try {
      const result = await this.scene.getApi().pickGroundItem(uid);
      if (!result) return;

      const nickname = this.scene.getUser()?.getProfile().nickname ?? '';
      const itemName = i18next.t(`item:${result.itemId}.name`, {
        defaultValue: result.itemId,
      });
      this.scene.getAudio().playEffect(SFX.GET_0);

      this.removeSafariObject(obj);

      await this.scene
        .getMessage('talk')
        .showMessage(i18next.t('safari:pickedItem', { name: nickname, item: itemName }));

      const category = this.scene.getMasterData().getItemData(result.itemId)?.category ?? null;
      if (category) {
        await this.scene.getMessage('pocketTalk').showPocketMessage({
          name: nickname,
          item: itemName,
          category: category as ItemCategory,
        });
      }

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

  resolveWildEncounter(
    wild: WildPokemonObject,
    reason: 'catch' | 'flee_wild' | 'flee_player',
  ): void {
    this.wildEncounterPending = false;
    const uid = wild.getWild().uid;
    // 배틀 도중 TTL로 이미 사라졌을 수 있음 — 모든 분기에서 idempotent 처리.
    const stillThere = this.findWildByUid(uid);

    if (reason === 'flee_player') {
      if (stillThere) {
        stillThere.freezeRandomWalk(false);
        stillThere.unlockInteraction();
      }
      return;
    }

    // catch / flee_wild
    if (stillThere) {
      const pos = { x: stillThere.getTilePos().x, y: stillThere.getTilePos().y };
      this.removeSafariObject(stillThere as unknown as InteractiveObject);
      this.markTileFree(pos);
    }
    this.pendingDespawnUids.delete(uid);
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
    this.refreshPetBlockingRefs();
    this.refreshWildBlockingRefs();
  }

  private refreshPlayerBlockingRefs(): void {
    if (!this.player || !this.mapView) return;
    this.player.setBlockingRefs([...this.mapView.getNpcs(), ...this.safariObjects]);
  }

  private refreshPetBlockingRefs(): void {
    if (!this.pet || !this.mapView) return;
    this.pet.setBlockingRefs([...this.mapView.getNpcs(), ...this.safariObjects]);
  }

  private refreshWildBlockingRefs(): void {
    if (!this.mapView) return;
    const npcs = this.mapView.getNpcs();
    for (const obj of this.safariObjects) {
      if (obj instanceof WildPokemonObject) {
        const others = this.safariObjects.filter((o) => o !== obj);
        const refs: BaseObject[] = [...others, ...npcs];
        if (this.player) refs.push(this.player);
        if (this.pet) refs.push(this.pet);
        obj.setBlockingRefs(refs);
      }
    }
  }

  private static tileKey(p: { x: number; y: number }): string {
    return `${p.x}:${p.y}`;
  }

  private static shuffleInPlace<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /** 맵 입장 시 한 번 호출. land/water 풀과 점유 상태를 필드에 세팅. */
  private initSpawnPools(): void {
    if (!this.mapView) return;
    this.spawnLandPool = OverworldUi.shuffleInPlace(
      this.mapView.getSpawnTilePositions('land').slice(),
    );
    this.spawnWaterPool = OverworldUi.shuffleInPlace(
      this.mapView.getSpawnTilePositions('water').slice(),
    );
    this.spawnOccupied.clear();
    this.spawnPoolsInitialized = true;
  }

  /**
   * 점유되지 않은 타일 하나를 반환. target이 'land'면 land 풀만, 'any'면 land → water 순으로 탐색.
   * 호출자가 반환값의 좌표를 실제로 사용할 경우 반드시 markTileOccupied를 호출해야 한다.
   */
  private computeFreeSpawnTile(target: 'land' | 'any'): { x: number; y: number } | null {
    const tryFrom = (pool: { x: number; y: number }[]): { x: number; y: number } | null => {
      for (const p of pool) {
        if (!this.spawnOccupied.has(OverworldUi.tileKey(p))) return p;
      }
      return null;
    };
    const land = tryFrom(this.spawnLandPool);
    if (land) return land;
    if (target === 'land') return null;
    return tryFrom(this.spawnWaterPool);
  }

  private markTileOccupied(p: { x: number; y: number }): void {
    this.spawnOccupied.add(OverworldUi.tileKey(p));
  }

  private markTileFree(p: { x: number; y: number }): void {
    this.spawnOccupied.delete(OverworldUi.tileKey(p));
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

    this.initSpawnPools();

    const availableItems = info.items.filter((i) => !i.picked);
    const availableWilds = info.wilds.filter((w) => w.caught === 0);

    // 기존 좌표가 있는 엔티티를 먼저 점유 마킹
    for (const it of availableItems) {
      if (it.x != null && it.y != null) this.markTileOccupied({ x: it.x, y: it.y });
    }
    for (const w of availableWilds) {
      if (w.x != null && w.y != null) this.markTileOccupied({ x: w.x, y: w.y });
    }

    // 1) Items — land only
    for (const item of availableItems) {
      let px: number;
      let py: number;
      if (item.x != null && item.y != null) {
        px = item.x;
        py = item.y;
      } else {
        const pos = this.computeFreeSpawnTile('land');
        if (!pos) {
          console.warn(`[Safari] not enough land spawn tiles for items`);
          break;
        }
        px = pos.x;
        py = pos.y;
        item.x = px;
        item.y = py;
        this.markTileOccupied(pos);
      }

      const obj = new GroundItemObject(this.scene, item.uid, item.itemId, px, py);
      this.safariObjects.push(obj);
      this.worldContainer.add(obj.getShadow());
      this.worldContainer.add(obj.getSprite());
      this.nameContainer.add(obj.getName());
    }

    // 2) Wilds — land ∪ water
    for (const wild of availableWilds) {
      let px: number;
      let py: number;
      if (wild.x != null && wild.y != null) {
        px = wild.x;
        py = wild.y;
      } else {
        const pos = this.computeFreeSpawnTile('any');
        if (!pos) {
          console.warn(`[Safari] not enough spawn tiles for wilds`);
          break;
        }
        px = pos.x;
        py = pos.y;
        wild.x = px;
        wild.y = py;
        this.markTileOccupied(pos);
      }

      const obj = new WildPokemonObject(this.scene, this.mapView, wild, mapKey, px, py, []);
      this.safariObjects.push(obj);
      this.worldContainer.add(obj.getShadow());
      this.worldContainer.add(obj.getSprite());
      this.nameContainer.add(obj.getName());
      this.nameContainer.add(obj.getTimerText());
    }

    this.refreshWildBlockingRefs();
    for (const obj of this.safariObjects) {
      if (obj instanceof WildPokemonObject) obj.startRandomWalk();
    }

    this.refreshPlayerBlockingRefs();
  }

  // ── wild:spawn / wild:despawn 소켓 이벤트 처리 ──

  private findWildByUid(uid: string): WildPokemonObject | null {
    for (const obj of this.safariObjects) {
      if (obj instanceof WildPokemonObject && obj.getWild().uid === uid) return obj;
    }
    return null;
  }

  handleWildSpawn(payload: {
    mapId: string;
    wild: import('@poposafari/scenes').SafariWildInfo;
  }): void {
    const mapKey = this.mapConfig?.key;
    const info = this.scene.getSafariInfo().get(payload.mapId);

    // 내가 해당 맵에 없는 경우: 다음 진입 시 반영되도록 safariInfo에만 merge.
    if (info) {
      if (!info.wilds.some((w) => w.uid === payload.wild.uid)) {
        info.wilds.push(payload.wild);
      }
    }
    if (mapKey !== payload.mapId) return;
    if (!this.mapView || !this.worldContainer || !this.nameContainer) return;
    if (!this.spawnPoolsInitialized) return;

    // 중복 스폰 방지
    if (this.findWildByUid(payload.wild.uid)) return;

    const pos = this.computeFreeSpawnTile('any');
    if (!pos) {
      console.warn('[Safari] handleWildSpawn: no free tile for new wild');
      return;
    }
    payload.wild.x = pos.x;
    payload.wild.y = pos.y;
    this.markTileOccupied(pos);

    const obj = new WildPokemonObject(
      this.scene,
      this.mapView,
      payload.wild,
      payload.mapId,
      pos.x,
      pos.y,
      [],
    );
    this.safariObjects.push(obj);
    this.worldContainer.add(obj.getShadow());
    this.worldContainer.add(obj.getSprite());
    this.nameContainer.add(obj.getName());
    this.nameContainer.add(obj.getTimerText());

    this.refreshWildBlockingRefs();
    this.refreshPlayerBlockingRefs();
    this.refreshPetBlockingRefs();

    // 스폰 연출: scale/alpha 0→본래값. WildPokemonObject의 기본 scale은 생성자에서 결정(1.4).
    // 하드코딩하지 않고 현재 scale을 읽어 원복하도록 한다.
    const sprite = obj.getSprite();
    const shadow = obj.getShadow();
    const nameTag = obj.getName();
    const timerText = obj.getTimerText();
    const targetScale = sprite.scaleX;
    sprite.setAlpha(0);
    sprite.setScale(0);
    shadow.setAlpha(0);
    nameTag.setAlpha(0);
    timerText.setAlpha(0);
    this.scene.tweens.add({
      targets: [sprite, shadow, nameTag, timerText],
      alpha: 1,
      duration: 450,
      ease: 'Sine.easeOut',
    });
    this.scene.tweens.add({
      targets: sprite,
      scale: targetScale,
      duration: 450,
      ease: 'Back.easeOut',
      onComplete: () => obj.startRandomWalk(),
    });
  }

  /** 클라이언트가 자체 타이머로 0을 감지했을 때 호출. 서버 despawn이 늦어도 선제적으로 정리. */
  private handleWildTtlExpired = (payload: { mapId: string; wildUid: string }): void => {
    this.handleWildDespawn({ mapId: payload.mapId, wildUid: payload.wildUid, reason: 'ttl' });
  };

  handleWildDespawn(payload: { mapId: string; wildUid: string; reason: string }): void {
    // scene-wide 전역 상태에서도 제거
    const info = this.scene.getSafariInfo().get(payload.mapId);
    if (info) {
      const i = info.wilds.findIndex((w) => w.uid === payload.wildUid);
      if (i >= 0) info.wilds.splice(i, 1);
    }

    const mapKey = this.mapConfig?.key;
    if (mapKey !== payload.mapId) return;

    const obj = this.findWildByUid(payload.wildUid);
    if (!obj) {
      // 이미 제거된 상태 (ex: catch 경로로 먼저 removeSafariObject됨)
      this.pendingDespawnUids.add(payload.wildUid);
      return;
    }

    // 클라 자체 TTL 감지 또는 서버 이벤트가 중복 도착했을 때 페이드 재트리거 방지
    if (obj instanceof WildPokemonObject) {
      if (obj.isDespawning()) return;
      obj.markDespawning();
    }

    // 배틀 중이라도 overworld의 wild 오브젝트만 페이드아웃.
    // 배틀 UI는 그대로 유지하고, 사용자가 볼/bait/rock을 사용하면 서버가 flee로 응답하는 기획.

    const pos = { x: obj.getTilePos().x, y: obj.getTilePos().y };
    const sprite = obj.getSprite();
    const shadow = obj.getShadow();
    const nameTag = obj.getName();
    const timerText = obj instanceof WildPokemonObject ? obj.getTimerText() : null;

    // 서서히 사라지는 효과: alpha/scale 함께, 500ms
    const fadeTargets: Phaser.GameObjects.GameObject[] = [sprite, shadow, nameTag];
    if (timerText) fadeTargets.push(timerText);
    this.scene.tweens.add({
      targets: fadeTargets,
      alpha: 0,
      duration: 500,
      ease: 'Sine.easeIn',
    });
    this.scene.tweens.add({
      targets: sprite,
      scale: 0,
      duration: 500,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.removeSafariObject(obj as unknown as InteractiveObject);
        this.markTileFree(pos);
      },
    });
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

  public syncRegistedItemIcon(open: boolean): void {
    this.hud?.updateToggleIcon(TEXTURE.ICON_REGISTER, open);
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
    this.pet?.setBaseSpeed(next === OverworldMovementState.RUNNING ? 4 : 2);
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

    this.syncRunningToggleIcon();
  }

  useRegisteredItem(itemId: string): void {
    void KeyItemRegistry.use(itemId, { scene: this.scene, overworldUi: this });
  }

  enterRideBicycle(): void {
    const user = this.scene.getUser();
    if (!user || !this.player) return;
    user.setOverworldMovementState(OverworldMovementState.RIDE);
    const speed = SPEED_BY_MOVEMENT_STATE[OverworldMovementState.RIDE] ?? 6;
    this.player.setBaseSpeed(speed);

    this.syncRunningToggleIcon();
  }

  exitRideBicycle(): void {
    const user = this.scene.getUser();
    if (!user || !this.player) return;
    user.setOverworldMovementState(OverworldMovementState.WALK);
    const speed = SPEED_BY_MOVEMENT_STATE[OverworldMovementState.WALK] ?? 2;
    this.player.setBaseSpeed(speed);

    this.syncRunningToggleIcon();
  }

  private handlePartyChanged = (party: GetMeRes['party']) => {
    const first = party.find((p) => p.partySlot === 0) ?? null;
    const newId = first?.id ?? null;
    const newSig = first ? `${first.pokedexId}|${first.isShiny ? 1 : 0}` : null;

    if (newId === this.petOwnerPokemonId && newSig === this.petOwnerSignature) return;

    if (newId === null) {
      const clearOwner = () => {
        this.petOwnerPokemonId = null;
        this.petOwnerSignature = null;
        this.emitPetChange(null, false);
      };
      if (this.pet) {
        this.recallPet(clearOwner);
      } else {
        clearOwner();
      }
      return;
    }

    // 진화(같은 party id, pokedexId/isShiny 변화) — 텍스처만 스왑, call/recall 스킵.
    if (newId === this.petOwnerPokemonId && newSig !== this.petOwnerSignature) {
      this.petOwnerSignature = newSig;
      this.pet?.swap(String(first!.pokedexId), first!.isShiny);
      this.emitPetChange(String(first!.pokedexId), first!.isShiny);
      return;
    }

    // 교체/최초 소환: 기존 펫이 있으면 recall 애니메이션 없이 즉시 제거 후 call.
    // RIDE/SURF/JUMP/FISHING 상태면 owner 갱신만 하고 실제 소환은 WALK/RUNNING 복귀 시로 미룬다.
    const doSummon = () => {
      this.petOwnerPokemonId = newId;
      this.petOwnerSignature = newSig;
      if (this.isFieldState()) {
        this.summonPet(String(first!.pokedexId), first!.isShiny);
      }
      this.emitPetChange(String(first!.pokedexId), first!.isShiny);
    };
    if (this.pet) {
      this.pet.destroy();
      this.pet = null;
      this.refreshWildBlockingRefs();
    }
    doSummon();
  };

  private emitPetChange(pokedexId: string | null, isShiny: boolean): void {
    const socket = this.scene.getSocket();
    if (!socket?.connected) return;
    const payload: PetChangePayload = { pokedexId, isShiny };
    socket.emit('pet-change', payload);
  }

  private isFieldStateValue(state: OverworldMovementState): boolean {
    return state === OverworldMovementState.WALK || state === OverworldMovementState.RUNNING;
  }

  private isFieldState(): boolean {
    const state = this.scene.getUser()?.getOverworldMovementState();
    return state ? this.isFieldStateValue(state) : false;
  }

  private handleMovementStateTransition(currentState: OverworldMovementState | undefined): void {
    if (currentState == null) return;
    const prev = this.prevMovementState;
    if (prev === currentState) return;
    this.prevMovementState = currentState;

    const wasField = prev != null && this.isFieldStateValue(prev);
    const isField = this.isFieldStateValue(currentState);

    if (wasField && !isField) {
      // 필드 → 비필드: 펫 회수. petOwnerPokemonId/Signature는 유지해서 복귀 시 재소환.
      if (this.pet) this.recallPet();
      return;
    }
    if (!wasField && isField) {
      // 비필드 → 필드: 저장된 owner sig가 있으면 자동 재소환.
      if (this.petOwnerSignature && !this.pet && !this.petSummoning) {
        const [pokedexId, shinyFlag] = this.petOwnerSignature.split('|');
        this.summonPet(pokedexId, shinyFlag === '1');
      }
      return;
    }
    if (isField && this.pet) {
      // WALK ↔ RUNNING: 속도 동기화만.
      this.pet.setBaseSpeed(currentState === OverworldMovementState.RUNNING ? 4 : 2);
    }
  }

  private isTileOccupiedForPet(tileX: number, tileY: number): boolean {
    if (!this.mapView) return false;
    if (!this.mapView.hasTileAt(tileX, tileY)) return true;
    if (this.mapView.hasBlockingTileAt(tileX, tileY)) return true;
    for (const npc of this.mapView.getNpcs()) {
      const p = npc.getTilePos();
      if (p.x === tileX && p.y === tileY) return true;
    }
    for (const obj of this.safariObjects) {
      const p = obj.getTilePos();
      if (p.x === tileX && p.y === tileY) return true;
    }
    return false;
  }

  private summonPet(pokedexId: string, isShiny: boolean): void {
    if (!this.player || !this.mapView || !this.worldContainer) return;
    if (this.petSummoning) return;

    const dir = this.player.getLastDirection();
    const { dx, dy } = directionToDelta(dir === DIRECTION.NONE ? DIRECTION.DOWN : dir);
    const { x: px, y: py } = this.player.getTilePos();
    let tileX = px - dx;
    let tileY = py - dy;

    if (this.isTileOccupiedForPet(tileX, tileY)) {
      tileX = px;
      tileY = py;
    }

    const playerDir = this.player.getLastDirection();
    const initDir = playerDir === DIRECTION.NONE ? DIRECTION.DOWN : playerDir;
    const refs = [...this.mapView.getNpcs(), ...this.safariObjects];

    this.petSummoning = true;
    const pet = PetObject.summon(
      this.scene,
      this.mapView,
      tileX,
      tileY,
      pokedexId,
      isShiny,
      initDir,
      refs,
      (obj) => this.worldContainer?.add(obj),
    );
    this.pet = pet;
    const user = this.scene.getUser();
    pet.setBaseSpeed(user?.getOverworldMovementState() === OverworldMovementState.RUNNING ? 4 : 2);
    this.petSummoning = false;
    this.refreshWildBlockingRefs();
  }

  private recallPet(onComplete?: () => void): void {
    const pet = this.pet;
    if (!pet || !this.worldContainer) {
      onComplete?.();
      return;
    }
    if (this.petRecalling) {
      // 회수 중복 호출 — 콜백만 즉시 흘려보내 체인이 끊기지 않게.
      onComplete?.();
      return;
    }
    this.petRecalling = true;

    pet.recall(
      (obj) => this.worldContainer?.add(obj),
      () => {
        if (this.pet === pet) {
          this.pet = null;
          this.refreshWildBlockingRefs();
        }
        this.petRecalling = false;
        onComplete?.();
      },
    );
  }

  private spawnLights(): void {
    if (!this.mapView || !this.lightContainer) return;
    const positions = this.mapView.getLightTilePositions();
    if (positions.length === 0) return;

    const isNight = DayNightFilter.getCurrentTimeLabel() === 'night';
    for (const { x, y } of positions) {
      const light = new LightObject(this.scene, x, y, { offsetX: +5, offsetY: +110 });
      light.getSprite().setVisible(isNight);
      this.lightContainer.add(light.getSprite());
      this.lightObjects.push(light);
    }
  }

  private handleGameTimeChanged = (timeOfDay: string): void => {
    const isNight = timeOfDay === 'night';
    for (const light of this.lightObjects) {
      light.getSprite().setVisible(isNight);
    }
  };

  private handlePlayerTileMovedForPet = (payload: {
    tileX: number;
    tileY: number;
    direction: DIRECTION;
  }) => {
    if (!this.pet || !this.player) return;
    this.pet.followStep(payload.tileX, payload.tileY, payload.direction);
  };

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

      this.lightContainer = this.scene.add.container(0, 0);
      this.lightContainer.setScale(OVERWORLD_ZOOM);
      this.lightContainer.setDepth(DEPTH.FOREGROUND + 0.1);

      this.spawnLights();

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
          other.setContainerAdd((obj) => this.worldContainer?.add(obj));
          this.otherPlayers.set(u.userId, other);

          const initialPet = parsePetField(u.pet);
          if (initialPet) {
            other.setPet(initialPet.pokedexId, initialPet.isShiny, false);
          }
        }
        this.scene.clearPendingRoomState();
      }

      this.scene.events.on('player_tile_moved', this.handlePlayerTileMoved, this);
      this.scene.events.on('player_tile_moved', this.handlePlayerTileMovedForPet);
      this.scene.events.on('wild_ttl_expired', this.handleWildTtlExpired);
      this.scene.events.on(GameEvent.GAME_TIME_CHANGED, this.handleGameTimeChanged, this);

      this.cursorKeys = this.scene.input.keyboard?.createCursorKeys() ?? null;

      this.keyPressStartTime = {};
      this.lastFrameKeys = { up: false, down: false, left: false, right: false };
      this.wasIdleLastFrame = true;
    }

    this.hud = new OverworldHudUI(this.scene);
    this.hud.create();
    this.hud.show();
    this.syncRunningToggleIcon();

    if (this.mapConfig) {
      const area = this.scene.getMasterData().getMapArea(this.mapConfig.key);
      this.hud.showLocationBanner(area, this.mapConfig.key);
    }

    const user = this.scene.getUser();
    if (user) {
      this.prevMovementState = user.getOverworldMovementState();
      this.unsubscribeParty = user.onPartyChanged(this.handlePartyChanged);
      this.handlePartyChanged(user.getParty());
    }

    super.show();
  }

  hide(): void {
    this.doorTransitionPending = false;
    this.wildEncounterPending = false;
    this.petTalkPending = false;
    this.scene.cameras.main.setScroll(0, 0);

    this.unsubscribeParty?.();
    this.unsubscribeParty = null;

    this.pet?.destroy();
    this.pet = null;
    this.petOwnerPokemonId = null;
    this.petOwnerSignature = null;
    this.petSummoning = false;
    this.petRecalling = false;
    this.prevMovementState = null;

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

    for (const light of this.lightObjects) {
      light.destroy();
    }
    this.lightObjects = [];
    if (this.lightContainer) {
      this.lightContainer.removeAll(false);
      this.lightContainer.destroy();
      this.lightContainer = null;
    }

    this.scene.events.off('player_tile_moved', this.handlePlayerTileMoved, this);
    this.scene.events.off('player_tile_moved', this.handlePlayerTileMovedForPet);
    this.scene.events.off('wild_ttl_expired', this.handleWildTtlExpired);
    this.scene.events.off(GameEvent.GAME_TIME_CHANGED, this.handleGameTimeChanged, this);
    this.cursorKeys = null;

    if (this.hud) {
      this.hud.destroy();
      this.hud = null;
    }

    for (const obj of this.safariObjects) {
      obj.destroy();
    }
    this.safariObjects = [];
    this.spawnOccupied.clear();
    this.spawnLandPool = [];
    this.spawnWaterPool = [];
    this.spawnPoolsInitialized = false;
    this.pendingDespawnUids.clear();
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
    other.setContainerAdd((obj) => this.worldContainer?.add(obj));
    this.otherPlayers.set(u.userId, other);

    const initialPet = parsePetField(u.pet);
    if (initialPet) {
      other.setPet(initialPet.pokedexId, initialPet.isShiny, false);
    }
    this.sortWorldContainerByDepth();
  }

  onOtherPetChanged(payload: OtherPetChangedPayload): void {
    const other = this.otherPlayers.get(payload.userId);
    if (!other) return;
    if (!payload.pokedexId) {
      other.clearPet(true);
    } else {
      other.setPet(payload.pokedexId, !!payload.isShiny, true);
    }
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
      this.hud.refreshInfo(mapKey, pos.x, pos.y, profile?.money ?? 0);
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

  tickWildPokemons(delta: number): void {
    for (const obj of this.safariObjects) {
      if (obj instanceof WildPokemonObject) {
        if (!obj.isInteractionLocked()) {
          obj.freezeRandomWalk(false);
        }
        obj.update(delta);
      }
    }
  }

  update(_time: number, delta: number): void {
    if (!this.player || !this.cursorKeys) return;

    if (this.doorTransitionPending) {
      this.player.update(delta);
      this.pet?.update(delta);
      for (const other of this.otherPlayers.values()) other.update(delta);

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
    this.pet?.update(delta);
    for (const other of this.otherPlayers.values()) other.update(delta);

    // 야생 포켓몬 랜덤 워크 진행. 메뉴/UI push 중에도 계속 움직이는 것이 정책.
    this.tickWildPokemons(delta);

    this.sortWorldContainerByDepth();

    const sprite = this.player.getSprite();
    const center = sprite.getCenter(undefined, true);
    const cam = this.scene.cameras.main;
    cam.setScroll(center.x - cam.width / 2, center.y - cam.height / 2);

    if (!this.scene.getInputManager().isTop(this)) return;

    if (this.wildEncounterPending || this.petTalkPending) {
      this.lastFrameKeys = { up: false, down: false, left: false, right: false };
      this.wasIdleLastFrame = this.player.isMovementFinish();
      return;
    }

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

    // 상태 전이 감지: WALK/RUNNING ↔ RIDE/SURF/JUMP/FISHING. JUMP idle 핸들러가
    // JUMP→WALK/SURF로 상태를 바꿨을 수 있으므로 그 직후 시점에서 다시 가져온다.
    this.handleMovementStateTransition(user?.getOverworldMovementState());

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
      this.hud.refreshInfo(mapKey, pos.x, pos.y, profile?.money ?? 0);
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
