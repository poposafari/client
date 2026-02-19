import { BaseUi } from '@poposafari/core';
import type { MapConfig, ReactionStep } from '@poposafari/core/map.registry';
import { GameScene } from '@poposafari/scenes';
import {
  DEPTH,
  KEY,
  OverworldDirection,
  OverworldMovementState,
  SFX,
  TEXTURE,
} from '@poposafari/types';
import { DIRECTION, directionToDelta, OVERWORLD_ZOOM } from './overworld.constants';
import { MapView } from './map-view';
import { DoorObject, InteractiveObject, PlayerObject } from './objects';
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
  /** 플레이어·NPC·문만 담는 Container. setScale(OVERWORLD_ZOOM)으로 줌인 (맵은 MAP_LAYER_SCALE_ZOOMED로 별도 적용). */
  private worldContainer: Phaser.GameObjects.Container | null = null;
  /** 닉네임만 담는 Container. FOREGROUND보다 위에 그려져 맵 레이어에 가려지지 않음. */
  private nameContainer: Phaser.GameObjects.Container | null = null;

  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | null = null;

  /** IDLE일 때만 사용. 방향별로 키를 처음 누른 시각 */
  private keyPressStartTime: Partial<Record<DIRECTION, number>> = {};
  private lastFrameKeys: KeyState = { up: false, down: false, left: false, right: false };
  private wasIdleLastFrame = true;

  /** 문 애니메이션 재생 중일 때 true. 이 동안 입력 무시 후 맵 전환 대기. */
  private doorTransitionPending = false;

  /** JUMP 종료 시 SURF로 전환할지 (surf() 호출 시 true) */
  private nextJumpEndGoesToSurf = false;

  /** S키 등으로 메뉴 진입 요청 시 호출. Phase 전환은 OverworldPhase에서 처리. */
  onMenuRequested: (() => void) | null = null;
  /** Z/ENTER 상호작용 객체가 전용 Phase를 요청할 때. (object, phaseKey) → OverworldPhase에서 pushPhase 처리. */
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

  /** 타일 (fx, fy)에 문이 있으면 해당 DoorObject, 없으면 null. 충돌 기준은 항상 한 타일. */
  private getDoorAtTile(fx: number, fy: number): DoorObject | null {
    for (const door of this.doors) {
      if (fx === door.getTileX() && fy === door.getTileY()) {
        return door;
      }
    }
    return null;
  }

  /**
   * 플레이어가 바라보는 방향의 한 타일 앞에 있는 상호작용 가능 오브젝트를 반환.
   * (NPC 등 InteractiveObject. 없으면 null.)
   */
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

  /** BaseUi 입력 스택: InputManager가 keydown 시 여기로 전달 (event.code). Idle일 때만 처리. */
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

  /** Z/ENTER: 앞에 상호작용 객체가 있으면 reaction() 후, Phase 요청이 있으면 콜백 호출, 없으면 대화 스크립트 순차 실행 */
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

  /** 상호작용 객체의 reaction 스크립트(talk/question) 순차 실행 */
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

  /** J키: 바라보는 방향으로 2타일 점프 (앞 타일 건너뛰기) */
  private handleKeyJ(): void {
    if (!this.player) return;
    const dir = this.player.getLastDirection();
    if (this.player.jump(dir)) {
      const speed = SPEED_BY_MOVEMENT_STATE[OverworldMovementState.JUMP] ?? 3;
      this.player.setBaseSpeed(speed);
    }
  }

  /**
   * surf 진입: 플레이어가 바라보는 방향으로 JUMP 진행 후 착지 시 SURF 상태로 전환.
   * 2타일 점프 → 착지 시 SURF, step 0→1 애니메이션.
   */
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

  /** 메뉴 열림/닫힘에 따라 메뉴 토글 아이콘 동기화 (Phase에서 메뉴 닫을 때 false 호출) */
  public syncMenuToggleIcon(open: boolean): void {
    this.hud?.updateToggleIcon(TEXTURE.ICON_MENU, open);
  }

  /** RUNNING 여부에 따라 러닝 토글 아이콘 on/off 동기화 */
  private syncRunningToggleIcon(): void {
    const isRunning =
      this.scene.getUser()?.getOverworldMovementState() === OverworldMovementState.RUNNING;
    this.hud?.updateToggleIcon(TEXTURE.ICON_RUNNING, isRunning);
  }

  /** R키: walk ↔ running 토글 (UserManager 상태 + 플레이어 속도 반영) */
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

  /** 자전거 아이템 사용 시 호출 (추후 연동). RIDE 상태로 전환 */
  enterRideBicycle(): void {
    const user = this.scene.getUser();
    if (!user || !this.player) return;
    user.setOverworldMovementState(OverworldMovementState.RIDE);
    const speed = SPEED_BY_MOVEMENT_STATE[OverworldMovementState.RIDE] ?? 6;
    this.player.setBaseSpeed(speed);
  }

  /** 자전거 내릴 때 호출 (추후 연동). WALK 상태로 전환 */
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

    this.cursorKeys = null;

    if (this.hud) {
      this.hud.destroy();
      this.hud = null;
    }

    for (const door of this.doors) {
      door.destroy();
    }
    this.doors = [];
    // TODO: other-player 배열 순회 destroy 및 배열 비우기
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

  /** 언어 변경 시 HUD(위치·캔디 등)와 현재 맵에 있는 모든 BaseObject 이름(NPC·문·플레이어)을 해당 언어로 갱신. */
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

  /** worldContainer·nameContainer 자식을 depth(tileY) 기준으로 정렬. Container는 자식 depth를 안 쓰므로 리스트 순서로 그리기 순서 결정. */
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

    // Container는 자식의 depth를 정렬하지 않으므로, 매 프레임 depth 기준으로 리스트 정렬 (tileY 작을수록 뒤에 그려짐)
    this.sortWorldContainerByDepth();

    // 스프라이트가 worldContainer 안에 있어 startFollow는 로컬 좌표를 따르므로, 월드 중심으로 카메라 scroll 직접 설정
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
