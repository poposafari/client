import { pokemonCryNames } from '@poposafari/core/master.data.ts';
import { GameScene } from '@poposafari/scenes';
import { ANIMATION, DEPTH, SFX, TEXTURE } from '@poposafari/types';
import { getPokemonTexture } from '@poposafari/utils';
import {
  calcOverworldTilePos,
  directionToDelta,
  DIRECTION,
  TILE_PIXEL,
} from '../overworld.constants';
import { IOverworldBlockingRef, IOverworldMapAdapter, MovableObject } from './movable.object';
import {
  PET_CRY_TONE_BY_EMOTION,
  PET_EMOTION_DURATION_MAX_MS,
  PET_EMOTION_DURATION_MIN_MS,
  PetEmotionId,
  petEmotionAnimKey,
  randomPetEmotionId,
} from './pet-emotion';

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
/** shiny overlay를 포켓몬 표시 크기 대비 얼마나 크게 그릴지(여유 배수). */
const SHINY_SIZE_MARGIN = 0.6;

/** 펫 머리 위(보이는 픽셀 상단) 기준 emote의 y 오프셋(px, setOrigin(0.5,1) 기준 emote 바닥 위치). */
const PET_EMOTE_OFFSET_Y = 10;

/** 펫 부르르 떨기 효과의 최대 진폭(px, 좌우). IDLE 상태에서만 적용된다. */
const PET_TREMBLE_AMPLITUDE_PX = 6;
/** 긍정 감정 점프 높이(px). */
const PET_JUMP_HEIGHT_PX = 22;
/** 한 번의 점프(올라갔다 내려옴) 시간(ms). */
const PET_JUMP_DURATION_MS = 280;
/** 감정별 부르르 떨기 주기(ms). 짧을수록 빠르게 진동한다. */
const PET_TREMBLE_PERIOD_BY_EMOTION: Record<PetEmotionId, number> = {
  1: 1200, // 조용함 — 거의 안 흔들림
  2: 80, // 깜짝 놀람 — 매우 빠른 떨림
  3: 400, // 궁금 — 중간
  4: 250, // 흥얼 — 리듬감 있는 중빠르기
  5: 500, // 하트 — 느린 맥동
  6: 160, // 탈이 남 — 오들오들
  7: 350, // 기분 좋음 — 가볍게
  8: 120, // 매우 기쁨 — 들뜬 빠른 진동
  9: 1500, // 슬픔 — 아주 느리게 축 늘어짐
  10: 220, // 살짝 삐침 — 짧은 경련
  11: 70, // 개빡침 — 격렬한 진동
};

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

  private shinySprite: Phaser.GameObjects.Sprite | null = null;
  private addToContainerFn: ((obj: Phaser.GameObjects.GameObject) => void) | null = null;

  private currentEmotion: PetEmotionId = 1;
  private emotionTimer: Phaser.Time.TimerEvent | null = null;
  private emoteSprite: Phaser.GameObjects.Sprite | null = null;
  private trembleOffsetX = 0;
  private isTrembling = false;
  private jumpOffsetY = 0;

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
      addToContainer,
    );
    addToContainer(pet.getShadow());
    addToContainer(pet.getSprite());
    const shiny = pet.getShinySprite();
    if (shiny) addToContainer(shiny);
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
    addToContainer?: (obj: Phaser.GameObjects.GameObject) => void,
  ) {
    const { key, frame } = getPokemonTexture('overworld', pokedexId, { isShiny });
    super(scene, mapAdapter, key, tileX, tileY, { text: '' }, initDirection, {
      scale: PET_SCALE,
      blockingRefs,
    });
    this.frameBase = frame;
    this.pokedexId = pokedexId;
    this.isShiny = isShiny;
    this.addToContainerFn = addToContainer ?? null;

    this.name.setVisible(false);
    this.shadow.setVisible(true);
    this.refreshPosition();

    this.setBaseSpeed(2);
    this.startSpriteAnimation(this.animKey(initDirection));
    this.snapTrailOffsetToTarget();

    if (isShiny) this.shinySprite = this.createShinySprite();

    this.rollEmotion();
  }

  getCurrentEmotion(): PetEmotionId {
    return this.currentEmotion;
  }

  rollEmotion(): void {
    this.currentEmotion = randomPetEmotionId();
    this.scheduleNextEmotionRoll();
  }

  private scheduleNextEmotionRoll(): void {
    this.emotionTimer?.remove(false);
    const delay = Phaser.Math.Between(PET_EMOTION_DURATION_MIN_MS, PET_EMOTION_DURATION_MAX_MS);
    this.emotionTimer = this.scene.time.addEvent({
      delay,
      callback: () => this.rollEmotion(),
    });
  }

  faceDirection(direction: DIRECTION): void {
    this.lastDirection = direction;
    this.startSpriteAnimation(this.animKey(direction));
  }

  playTremble(durationMs: number): Promise<void> {
    return new Promise<void>((resolve) => {
      this.isTrembling = true;
      this.scene.time.delayedCall(durationMs, () => {
        this.isTrembling = false;
        this.trembleOffsetX = 0;
        resolve();
      });
    });
  }

  playJump(count: number): Promise<void> {
    const jumps = Math.max(1, Math.floor(count));
    return new Promise<void>((resolve) => {
      this.scene.tweens.addCounter({
        from: 0,
        to: 1,
        duration: PET_JUMP_DURATION_MS,
        repeat: jumps - 1,
        onUpdate: (tween) => {
          const v = tween.getValue() ?? 0;
          // sin 곡선으로 올라갔다 내려오는 포물선
          this.jumpOffsetY = -Math.sin(v * Math.PI) * PET_JUMP_HEIGHT_PX;
        },
        onComplete: () => {
          this.jumpOffsetY = 0;
          resolve();
        },
      });
    });
  }

  playEmote(attach?: (sprite: Phaser.GameObjects.Sprite) => void): Promise<void> {
    return new Promise<void>((resolve) => {
      this.emoteSprite?.destroy();
      const sp = this.getSprite();
      const frameData = (sp.frame as unknown as { data?: { spriteSourceSize?: { y?: number } } })
        .data;
      const trimY = frameData?.spriteSourceSize?.y ?? 0;
      const visibleTop = sp.y - sp.displayHeight + trimY * sp.scaleY;
      const emoteX = sp.x;
      const emoteY = visibleTop + PET_EMOTE_OFFSET_Y;
      const sprite = this.scene.add
        .sprite(emoteX, emoteY, TEXTURE.PET_EMO)
        .setOrigin(0.5, 1)
        .setScale(3)
        .setDepth(DEPTH.FOREGROUND + 3);
      this.emoteSprite = sprite;
      attach?.(sprite);

      this.scene.getAudio().playEffect(SFX.EMO);
      const cryKey = pokemonCryNames.includes(this.pokedexId)
        ? this.pokedexId
        : this.pokedexId.split('_')[0];
      if (pokemonCryNames.includes(cryKey)) {
        const tone = PET_CRY_TONE_BY_EMOTION[this.currentEmotion];
        this.scene.getAudio().playEffect(cryKey, tone);
      }

      let elapsedLoops = 0;
      sprite.on(Phaser.Animations.Events.ANIMATION_REPEAT, () => {
        elapsedLoops++;
        if (elapsedLoops >= 2) {
          sprite.off(Phaser.Animations.Events.ANIMATION_REPEAT);
          sprite.stop();
          sprite.destroy();
          if (this.emoteSprite === sprite) this.emoteSprite = null;
          resolve();
        }
      });
      sprite.play(petEmotionAnimKey(this.currentEmotion));
    });
  }

  getShinySprite(): Phaser.GameObjects.Sprite | null {
    return this.shinySprite;
  }

  private createShinySprite(): Phaser.GameObjects.Sprite {
    const s = this.scene.add
      .sprite(this.getSprite().x, this.getSprite().y, TEXTURE.OVERWORLD_SHINY)
      .setOrigin(0.5, 1);
    this.applyShinySize(s);
    s.play(ANIMATION.OVERWORLD_SHINY);
    return s;
  }

  private applyShinySize(s: Phaser.GameObjects.Sprite): void {
    const sp = this.getSprite();
    s.setDisplaySize(sp.displayWidth * SHINY_SIZE_MARGIN, sp.displayHeight * SHINY_SIZE_MARGIN);
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

    if (isShiny && !this.shinySprite) {
      this.shinySprite = this.createShinySprite();
      this.addToContainerFn?.(this.shinySprite);
    } else if (!isShiny && this.shinySprite) {
      this.shinySprite.destroy();
      this.shinySprite = null;
    } else if (isShiny && this.shinySprite) {
      this.applyShinySize(this.shinySprite);
    }

    this.rollEmotion();
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
    this.updateTremble();
    this.smoothTrailOffset(delta);
    super.update(delta);
    this.renderAtLogical();
  }

  private updateTremble(): void {
    if (!this.isTrembling) {
      if (this.trembleOffsetX !== 0) this.trembleOffsetX = 0;
      return;
    }
    const period = PET_TREMBLE_PERIOD_BY_EMOTION[this.currentEmotion] ?? 500;
    const phase = (this.scene.time.now / period) * Math.PI * 2;
    this.trembleOffsetX = Math.sin(phase) * PET_TREMBLE_AMPLITUDE_PX;
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
    const baseX = this.logicalX + ox;
    const baseY = this.logicalY + oy;
    const spriteX = baseX + this.trembleOffsetX;
    const spriteY = baseY + this.jumpOffsetY;
    this.getSprite().setPosition(spriteX, spriteY);
    this.getShadow().setPosition(baseX, baseY);
    this.getName().setPosition(baseX, baseY - this.nameOffsetY);
    if (this.shinySprite) {
      this.shinySprite.setPosition(spriteX, spriteY);
      this.shinySprite.setDepth(this.getSprite().depth + 0.05);
      this.shinySprite.setVisible(this.getSprite().visible);
    }
  }

  destroy(): void {
    this.clearFx();
    this.emotionTimer?.remove(false);
    this.emotionTimer = null;
    this.emoteSprite?.destroy();
    this.emoteSprite = null;
    this.isTrembling = false;
    this.trembleOffsetX = 0;
    this.jumpOffsetY = 0;
    this.shinySprite?.destroy();
    this.shinySprite = null;
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
