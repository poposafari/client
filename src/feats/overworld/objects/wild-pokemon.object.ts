import { GameScene } from '@poposafari/scenes';
import type { SafariWildInfo } from '@poposafari/scenes';
import { DEPTH, SFX, TEXTCOLOR, TEXTURE } from '@poposafari/types';
import { addSprite, getPokemonI18Name, getPokemonTexture } from '@poposafari/utils';
import { calcOverworldTilePos, DIRECTION } from '../overworld.constants';
import { IOverworldBlockingRef, IOverworldMapAdapter, MovableObject } from './movable.object';
import i18next from 'i18next';

type WalkState = 'IDLE' | 'WALKING' | 'STOPPED';

const IDLE_MIN_MS = 3000;
const IDLE_MAX_MS = 6000;
const STEP_MIN = 1;
const STEP_MAX = 4;

const DIRS: DIRECTION[] = [DIRECTION.UP, DIRECTION.DOWN, DIRECTION.LEFT, DIRECTION.RIGHT];
const NAME_VISIBLE_RANGE = 3;

export class WildPokemonObject extends MovableObject {
  private readonly wild: SafariWildInfo;
  private readonly mapId: string;
  private readonly frameBase: string;

  private state: WalkState = 'IDLE';
  private frozen = false;
  private idleElapsed = 0;
  private idleMs = 0;
  private chosenDirection: DIRECTION = DIRECTION.DOWN;
  private lastMovedDirection: DIRECTION = DIRECTION.DOWN;
  private remainingSteps = 0;
  private interactionLocked = false;
  private emoteSprite: Phaser.GameObjects.Sprite | null = null;
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
      { text: getPokemonI18Name(wild.pokedexId), color: TEXTCOLOR.WHITE, raw: true },
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
    this.refreshPosition();

    this.setBaseSpeed(1.4);

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

  isCatchable(): boolean {
    return this.state === 'IDLE';
  }

  isInteractionLocked(): boolean {
    return this.interactionLocked;
  }

  faceDirection(direction: DIRECTION): void {
    this.lastDirection = direction;
    this.lastMovedDirection = direction;
    this.chosenDirection = direction;
    const animKey = this.animKey(direction);
    if (this.scene.anims.exists(animKey)) {
      this.sprite.anims.stop();
      const anim = this.scene.anims.get(animKey);
      const firstFrame = anim?.frames[0];
      if (firstFrame) this.sprite.setFrame(firstFrame.frame.name);
    }
  }

  tryLockInteraction(): boolean {
    if (this.interactionLocked) return false;
    this.interactionLocked = true;
    return true;
  }

  unlockInteraction(): void {
    this.interactionLocked = false;
  }

  playEmote(
    animationKey: string,
    attach?: (sprite: Phaser.GameObjects.Sprite) => void,
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      // 이전 emote가 남아 있으면 정리.
      this.emoteSprite?.destroy();
      const [px, py] = calcOverworldTilePos(this.tileX, this.tileY);
      const sprite = this.scene.add
        .sprite(px, py - this.sprite.displayHeight + 30, TEXTURE.EMO)
        .setOrigin(0.5, 1)
        .setScale(1.4)
        .setDepth(DEPTH.FOREGROUND + 3);
      this.emoteSprite = sprite;
      attach?.(sprite);
      sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        sprite.destroy();
        if (this.emoteSprite === sprite) this.emoteSprite = null;
        resolve();
      });
      sprite.play(animationKey);
      this.scene.getAudio().playEffect(SFX.EMO);
    });
  }

  update(delta: number): void {
    if (this.state === 'STOPPED') return;

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
    this.lastMovedDirection = this.chosenDirection;
    this.scene.updateSafariWildPos(
      this.mapId,
      this.wild.uid,
      tileX,
      tileY,
      this.lastMovedDirection,
    );
    this.refreshNameVisibility();
  }

  override destroy(): void {
    this.state = 'STOPPED';
    this.scene.events.off('player_tile_moved', this.onPlayerTileMoved);
    this.emoteSprite?.destroy();
    this.emoteSprite = null;
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
    const candidates = DIRS.filter((d) => !this.isBlockingDirection(d));
    if (candidates.length === 0) {
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
