import { GameScene } from '@poposafari/scenes';
import { getPokemonTexture } from '@poposafari/utils';
import {
  calcOverworldTilePos,
  directionToDelta,
  DIRECTION,
  TILE_PIXEL,
} from '../overworld.constants';
import { IOverworldBlockingRef, IOverworldMapAdapter, MovableObject } from './movable.object';

const PET_SCALE = 1.4;

// IDLE,WALK,RUNNING일 때 펫이 논리 타일에서 진행 방향 반대로 늦게 보일 기본 offset(px)
const PET_RUN_OFFSET_PX = 40;
const PET_WALK_OFFSET_PX = 30;
const PET_IDLE_OFFSET_PX = 10;

const PET_RUNNING_SPEED = 4;
const PET_WALKING_SPEED = 2;

/** IDLE에서 sprite overflow(px)에 곱할 계수. 1:1이면 큰 포켓몬에서 폭주하므로 작게. */
const PET_IDLE_OVERFLOW_GAIN = 0.15;
/** IDLE overflow 가산치 상한(px). IDLE 최대값이 WALK보다 작도록 (IDLE + MAX < WALK) 보장. */
const PET_IDLE_OVERFLOW_MAX_PX = 10;
/** trailing offset lerp 속도(초당 비율). 방향 전환 시 스냅을 피하기 위해 값을 점차 타겟에 수렴시킨다. */
const PET_TRAIL_SMOOTH_PER_SECOND = 17;

export class PetObject extends MovableObject {
  private frameBase: string;
  private pokedexId: string;
  private isShiny: boolean;
  /** 현재 재생 중인 call/recall fx. destroy/재생 시 정리 대상. */
  private pendingFx: Phaser.GameObjects.Sprite | null = null;

  /** 오프셋을 뺀 논리 픽셀 좌표. moveObject의 보간은 이 값을 기준으로 수행된다. */
  private logicalX = 0;
  private logicalY = 0;

  /** 현재 적용 중인 trailing offset. 매 프레임 target 값으로 lerp된다. */
  private trailOffsetX = 0;
  private trailOffsetY = 0;

  static summon(
    scene: GameScene,
    mapAdapter: IOverworldMapAdapter | null,
    tileX: number,
    tileY: number,
    pokedexId: string,
    isShiny: boolean,
    initDirection: DIRECTION,
    blockingRefs: IOverworldBlockingRef[],
    addToContainer: (obj: Phaser.GameObjects.GameObject) => void,
  ): PetObject {
    const pet = new PetObject(
      scene,
      mapAdapter,
      tileX,
      tileY,
      pokedexId,
      isShiny,
      initDirection,
      blockingRefs,
    );
    addToContainer(pet.getShadow());
    addToContainer(pet.getSprite());
    pet.getSprite().setVisible(false);
    pet.getShadow().setVisible(false);
    pet.playFx('pokemon_call', 'pokemon_call.play', addToContainer, () => {
      pet.getSprite().setVisible(true);
      pet.getShadow().setVisible(true).setScale(3);
    });
    return pet;
  }

  constructor(
    scene: GameScene,
    mapAdapter: IOverworldMapAdapter | null,
    tileX: number,
    tileY: number,
    pokedexId: string,
    isShiny: boolean,
    initDirection: DIRECTION,
    blockingRefs: IOverworldBlockingRef[],
  ) {
    const { key, frame } = getPokemonTexture('overworld', pokedexId, { isShiny });
    super(scene, mapAdapter, key, tileX, tileY, { text: '' }, initDirection, {
      scale: PET_SCALE,
      blockingRefs,
    });
    this.frameBase = frame;
    this.pokedexId = pokedexId;
    this.isShiny = isShiny;

    this.name.setVisible(false);
    this.shadow.setVisible(true);
    this.refreshPosition();

    this.setBaseSpeed(2);
    this.startSpriteAnimation(this.animKey(initDirection));
    this.snapTrailOffsetToTarget();
  }

  recall(
    addToContainer: (obj: Phaser.GameObjects.GameObject) => void,
    onComplete?: () => void,
  ): void {
    this.playFx('pokemon_recall', 'pokemon_recall.play', addToContainer, () => {
      this.destroy();
      onComplete?.();
    });
  }

  swap(pokedexId: string, isShiny: boolean): void {
    const { key, frame } = getPokemonTexture('overworld', pokedexId, { isShiny });
    this.frameBase = frame;
    this.pokedexId = pokedexId;
    this.isShiny = isShiny;
    this.getSprite().setTexture(key);
    this.startSpriteAnimation(this.animKey(this.getLastDirection()));
  }

  getPokedexId(): string {
    return this.pokedexId;
  }

  getIsShiny(): boolean {
    return this.isShiny;
  }

  followStep(playerTileX: number, playerTileY: number, playerDir: DIRECTION): void {
    const dir = playerDir === DIRECTION.NONE ? DIRECTION.DOWN : playerDir;
    const { dx: pdx, dy: pdy } = directionToDelta(dir);
    const behindX = playerTileX - pdx;
    const behindY = playerTileY - pdy;
    const myPos = this.getTilePos();
    if (myPos.x === behindX && myPos.y === behindY) return;

    const dx = behindX - myPos.x;
    const dy = behindY - myPos.y;
    if (dx > 0) {
      this.ready(DIRECTION.RIGHT, this.animKey(DIRECTION.RIGHT), 1);
    } else if (dx < 0) {
      this.ready(DIRECTION.LEFT, this.animKey(DIRECTION.LEFT), 1);
    } else if (dy > 0) {
      this.ready(DIRECTION.DOWN, this.animKey(DIRECTION.DOWN), 1);
    } else if (dy < 0) {
      this.ready(DIRECTION.UP, this.animKey(DIRECTION.UP), 1);
    }
  }

  update(delta: number): void {
    this.smoothTrailOffset(delta);
    super.update(delta);
    this.renderAtLogical();
  }

  getSpritePos(): { x: number; y: number } {
    return { x: this.logicalX, y: this.logicalY };
  }

  setPosition(px: number, py: number): void {
    this.logicalX = px;
    this.logicalY = py;
    this.renderAtLogical();
  }

  refreshPosition(): void {
    super.refreshPosition();
    this.getSprite().setDepth(this.tileY - 0.05);
    this.getShadow().setDepth(this.tileY - 0.15);
    const [px, py] = calcOverworldTilePos(this.getTileX(), this.getTileY());
    this.logicalX = px;
    this.logicalY = py;
    this.renderAtLogical();
  }

  override setSpriteDepth(value: number): void {
    this.getSprite().setDepth(value - 0.05);
    this.getShadow().setDepth(value - 0.15);
  }

  private smoothTrailOffset(delta: number): void {
    const { dx: targetX, dy: targetY } = this.computeTargetTrailOffset();
    const k = Math.min(1, (delta / 1000) * PET_TRAIL_SMOOTH_PER_SECOND);
    this.trailOffsetX += (targetX - this.trailOffsetX) * k;
    this.trailOffsetY += (targetY - this.trailOffsetY) * k;
  }

  private snapTrailOffsetToTarget(): void {
    const { dx, dy } = this.computeTargetTrailOffset();
    this.trailOffsetX = dx;
    this.trailOffsetY = dy;
    this.renderAtLogical();
  }

  private computeTargetTrailOffset(): { dx: number; dy: number } {
    const magnitude = this.getTargetOffsetMagnitude();
    if (magnitude === 0) return { dx: 0, dy: 0 };
    const delta = directionToDelta(this.lastDirection);
    return {
      dx: -delta.dx * magnitude,
      dy: -delta.dy * magnitude,
    };
  }

  private getTargetOffsetMagnitude(): number {
    if (!this.isInMotion()) {
      const overflow = Math.max(0, this.getSprite().displayHeight - TILE_PIXEL);
      const extra = Math.min(PET_IDLE_OVERFLOW_MAX_PX, overflow * PET_IDLE_OVERFLOW_GAIN);
      return PET_IDLE_OFFSET_PX + extra;
    }
    if (this.baseSpeed === PET_RUNNING_SPEED) return PET_RUN_OFFSET_PX;
    if (this.baseSpeed === PET_WALKING_SPEED) return PET_WALK_OFFSET_PX;
    return 0;
  }

  private renderAtLogical(): void {
    const ox = this.trailOffsetX ?? 0;
    const oy = this.trailOffsetY ?? 0;
    const x = this.logicalX + ox;
    const y = this.logicalY + oy;
    this.getSprite().setPosition(x, y);
    this.getShadow().setPosition(x, y);
    this.getName().setPosition(x, y - this.nameOffsetY);
  }

  destroy(): void {
    this.clearFx();
    super.destroy();
  }

  private playFx(
    texture: string,
    animKey: string,
    addToContainer: (obj: Phaser.GameObjects.GameObject) => void,
    onComplete?: () => void,
  ): void {
    this.clearFx();
    const { x: tileX, y: tileY } = this.getTilePos();
    const [px, py] = calcOverworldTilePos(tileX, tileY);
    const fx = this.scene.add
      .sprite(px, py, texture, `${texture}-0`)
      .setOrigin(0.5, 0.5)
      .setScale(PET_SCALE)
      .setDepth(tileY + 0.5);
    addToContainer(fx);
    this.pendingFx = fx;
    fx.once('animationcomplete', () => {
      if (this.pendingFx === fx) this.pendingFx = null;
      if (fx.active) fx.destroy();
      onComplete?.();
    });
    fx.play(animKey);
  }

  private clearFx(): void {
    const fx = this.pendingFx;
    if (!fx) return;
    this.pendingFx = null;
    fx.removeAllListeners('animationcomplete');
    if (fx.active) fx.destroy();
  }

  private animKey(dir: DIRECTION): string {
    return `pokemon.overworld.${this.frameBase}.${dir}`;
  }
}
