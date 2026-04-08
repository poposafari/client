import { GameScene } from '@poposafari/scenes';
import type { SafariWildInfo } from '@poposafari/scenes';
import { TEXTCOLOR } from '@poposafari/types';
import { getPokemonTexture } from '@poposafari/utils';
import { DIRECTION } from '../overworld.constants';
import { IOverworldBlockingRef, IOverworldMapAdapter, MovableObject } from './movable.object';
import i18next from 'i18next';

type WalkState = 'IDLE' | 'WALKING' | 'STOPPED';

const IDLE_MIN_MS = 3000;
const IDLE_MAX_MS = 6000;
const STEP_MIN = 1;
const STEP_MAX = 4;

const DIRS: DIRECTION[] = [DIRECTION.UP, DIRECTION.DOWN, DIRECTION.LEFT, DIRECTION.RIGHT];

/** 플레이어가 이 거리(타일) 이내에 들어오면 이름표를 표시. Chebyshev 거리 기준. */
const NAME_VISIBLE_RANGE = 3;

/**
 * 사파리 존 야생 포켓몬.
 * MovableObject 위에 IDLE/WALKING 랜덤 워크 상태머신을 얹어 자율 이동을 구현.
 * 한 스텝 이동이 끝날 때마다 onTileMoved 훅에서 GameScene.updateSafariWildPos로
 * SafariInfo와 좌표/방향을 동기화한다 (직접 대입 금지, 헬퍼 단일 경로).
 */
export class WildPokemonObject extends MovableObject {
  private readonly wild: SafariWildInfo;
  private readonly mapId: string;
  private readonly frameBase: string;

  private state: WalkState = 'IDLE';
  /** door 전환 등 외부 요인으로 상태머신만 일시 정지할 때 true. */
  private frozen = false;
  private idleElapsed = 0;
  private idleMs = 0;
  private chosenDirection: DIRECTION = DIRECTION.DOWN;
  /** 실제 한 칸 이동이 끝난 마지막 방향. 벽에 막혔을 때 IDLE 애니메이션 fallback용. */
  private lastMovedDirection: DIRECTION = DIRECTION.DOWN;
  private remainingSteps = 0;
  /** 마지막으로 통보받은 플레이어 타일 좌표. 자기 이동 시 재계산에 사용. */
  private lastPlayerTileX: number | null = null;
  private lastPlayerTileY: number | null = null;
  private readonly onPlayerTileMoved = (payload: { tileX: number; tileY: number }): void => {
    this.lastPlayerTileX = payload.tileX;
    this.lastPlayerTileY = payload.tileY;
    this.refreshNameVisibility();
  };

  constructor(
    scene: GameScene,
    mapAdapter: IOverworldMapAdapter | null,
    wild: SafariWildInfo,
    mapId: string,
    tileX: number,
    tileY: number,
    blockingRefs: IOverworldBlockingRef[],
  ) {
    const { key, frame } = getPokemonTexture('overworld', wild.pokedexId, {
      isShiny: wild.isShiny,
    });
    const initialDir = wild.lastDirection ?? DIRECTION.DOWN;
    super(
      scene,
      mapAdapter,
      key,
      tileX,
      tileY,
      { text: i18next.t(`pokemon:${wild.pokedexId}.name`), color: TEXTCOLOR.WHITE },
      initialDir,
      { scale: 1.4, blockingRefs, nameOffsetY: 70 },
    );
    this.wild = wild;
    this.mapId = mapId;
    this.frameBase = frame;
    this.lastMovedDirection = initialDir;
    this.chosenDirection = initialDir;

    this.name.setVisible(false);
    this.scene.events.on('player_tile_moved', this.onPlayerTileMoved);
    this.shadow.setVisible(true);
    const shadowWidth = this.sprite.displayWidth * 0.24;
    const ratio = this.shadow.height / this.shadow.width;
    this.shadow.displayWidth = shadowWidth;
    this.shadow.displayHeight = shadowWidth * ratio;
    this.setBaseSpeed(1.4);

    // 생성 직후 마지막 방향(혹은 down)의 워크 애니메이션을 무한 루프 재생.
    this.startSpriteAnimation(this.animKey(initialDir));
    this.idleMs = this.randomIdleMs();
  }

  startRandomWalk(): void {
    this.state = 'IDLE';
    this.idleElapsed = 0;
    this.idleMs = this.randomIdleMs();
  }

  freezeRandomWalk(frozen: boolean): void {
    this.frozen = frozen;
  }

  /** 잡기 등 상호작용 게이트. WALKING 도중에는 상호작용 불가. */
  isCatchable(): boolean {
    return this.state === 'IDLE';
  }

  update(delta: number): void {
    if (this.state === 'STOPPED') return;

    // frozen: 상태 머신은 멈추되, 진행 중이던 스텝의 픽셀 보간은 끝까지 재생되도록
    // super.update(delta)는 호출한다. 타일 사이에 낀 채 프리즈되는 것을 방지.
    if (this.frozen) {
      super.update(delta);
      return;
    }

    if (this.state === 'IDLE') {
      this.idleElapsed += delta;
      if (this.idleElapsed >= this.idleMs) {
        this.beginNewCycle();
      }
    } else if (this.state === 'WALKING') {
      // 직전 스텝의 픽셀 이동이 끝나 다음 한 칸을 받을 수 있는 시점에만 큐잉.
      if (this.isMovementFinish()) {
        if (this.remainingSteps > 0) {
          if (this.isBlockingDirection(this.chosenDirection)) {
            this.endCycle();
          } else {
            this.ready(this.chosenDirection, this.animKey(this.chosenDirection), 1);
            this.remainingSteps--;
          }
        } else {
          this.endCycle();
        }
      }
    }

    super.update(delta);
  }

  protected override onTileMoved(tileX: number, tileY: number): void {
    // 실제 한 칸 이동이 완료된 시점 → 마지막 "이동에 성공한" 방향 기록.
    this.lastMovedDirection = this.chosenDirection;
    // SafariInfo 동기화는 헬퍼 단일 경로로만 수행 (this.wild 직접 대입 금지).
    this.scene.updateSafariWildPos(
      this.mapId,
      this.wild.uid,
      tileX,
      tileY,
      this.lastMovedDirection,
    );
    // 자기 자신이 이동했을 때도 플레이어와의 거리가 바뀌므로 재평가.
    this.refreshNameVisibility();
  }

  override destroy(): void {
    this.state = 'STOPPED';
    this.scene.events.off('player_tile_moved', this.onPlayerTileMoved);
    super.destroy();
  }

  private refreshNameVisibility(): void {
    if (this.lastPlayerTileX === null || this.lastPlayerTileY === null) {
      this.name.setVisible(false);
      return;
    }
    const dx = Math.abs(this.tileX - this.lastPlayerTileX);
    const dy = Math.abs(this.tileY - this.lastPlayerTileY);
    this.name.setVisible(Math.max(dx, dy) <= NAME_VISIBLE_RANGE);
  }

  private beginNewCycle(): void {
    // 막히지 않은 방향만 후보로 둔다 → 벽 보고 떠는 상황 방지.
    const candidates = DIRS.filter((d) => !this.isBlockingDirection(d));
    if (candidates.length === 0) {
      // 사방이 막혀 있으면 IDLE을 다시 누적해 다음 사이클에서 재시도.
      this.idleElapsed = 0;
      this.idleMs = this.randomIdleMs();
      return;
    }
    this.chosenDirection = candidates[Math.floor(Math.random() * candidates.length)];
    this.remainingSteps = this.randomSteps();
    this.state = 'WALKING';
    this.startSpriteAnimation(this.animKey(this.chosenDirection));
  }

  private endCycle(): void {
    this.remainingSteps = 0;
    this.idleElapsed = 0;
    this.idleMs = this.randomIdleMs();
    this.state = 'IDLE';
    // IDLE이어도 애니메이션은 계속 돌리되, "실제 이동에 성공한 마지막 방향"을 사용.
    // chosenDirection을 그대로 쓰면 벽을 보고 제자리걸음하는 것처럼 보이므로 lastMovedDirection 사용.
    this.startSpriteAnimation(this.animKey(this.lastMovedDirection));
  }

  private animKey(dir: DIRECTION): string {
    return `pokemon.overworld.${this.frameBase}.${dir}`;
  }

  private randomIdleMs(): number {
    return IDLE_MIN_MS + Math.floor(Math.random() * (IDLE_MAX_MS - IDLE_MIN_MS + 1));
  }

  private randomSteps(): number {
    return STEP_MIN + Math.floor(Math.random() * (STEP_MAX - STEP_MIN + 1));
  }

  getUid(): string {
    return this.wild.uid;
  }

  getPokedexId(): string {
    return this.wild.pokedexId;
  }

  getWild(): SafariWildInfo {
    return this.wild;
  }
}
