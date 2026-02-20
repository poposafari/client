import { GameScene } from '@poposafari/scenes';
import { OverworldMovementState, TEXTSTYLE } from '@poposafari/types';
import type { UserGender } from '@poposafari/types';
import { calcOverworldTilePos, directionToDelta, DIRECTION } from '../overworld.constants';
import {
  getRideAnimationKey,
  getRunningAnimationKey,
  getSurfAnimationKey,
  getWalkAnimationKey,
} from '../overworld-animation-keys';
import {
  getDefaultOverworldKeys,
  getHairTextureKey,
  getOutfitTextureKey,
  getSkinTextureKey,
} from '../overworld-costume-keys';
import type { IOverworldBlockingRef, IOverworldMapAdapter } from './movable.object';
import { MovableObject } from './movable.object';

const PLAYER_SCALE = 3;

export class PlayerObject extends MovableObject {
  private rideStopFrameNumbers: number[] = [];
  private surfStopFrameNumbers: number[] = [];

  private hairSprite: Phaser.GameObjects.Sprite | null = null;
  private outfitSprite: Phaser.GameObjects.Sprite | null = null;
  private skinKey = '';
  private hairKey = '';
  private outfitKey = '';

  constructor(
    scene: GameScene,
    mapAdapter: IOverworldMapAdapter | null,
    tileX: number,
    tileY: number,
    options?: { blockingRefs?: IOverworldBlockingRef[]; initDirection?: DIRECTION },
  ) {
    const profile = scene.getUser()?.getProfile();
    const costume = profile?.lastCostume;
    const gender = profile?.gender ?? 'male';
    const defaults = getDefaultOverworldKeys(scene, gender);

    const skinKeyRequested = costume?.skin ? getSkinTextureKey(costume.skin) : defaults.skin;
    const key = scene.textures.exists(skinKeyRequested) ? skinKeyRequested : defaults.skin;
    const initDirection = options?.initDirection ?? DIRECTION.DOWN;

    super(scene, mapAdapter, key, tileX, tileY, { text: '' }, initDirection, {
      scale: PLAYER_SCALE,
      blockingRefs: options?.blockingRefs,
    });

    const hairKeyRequested = costume
      ? getHairTextureKey(gender, costume.hair, costume.hairColor)
      : defaults.hair;
    const hairKeyResolved = scene.textures.exists(hairKeyRequested)
      ? hairKeyRequested
      : defaults.hair;
    const outfitKeyRequested = costume
      ? getOutfitTextureKey(gender, costume.outfit)
      : defaults.outfit;
    const outfitKeyResolved = scene.textures.exists(outfitKeyRequested)
      ? outfitKeyRequested
      : defaults.outfit;

    const useLayered =
      scene.textures.exists(hairKeyResolved) && scene.textures.exists(outfitKeyResolved);

    if (useLayered) {
      this.skinKey = key;
      this.hairKey = hairKeyResolved;
      this.outfitKey = outfitKeyResolved;
      const [px, py] = calcOverworldTilePos(this.tileX, this.tileY);
      this.outfitSprite = scene.add
        .sprite(px, py, outfitKeyResolved)
        .setOrigin(0.5, 1)
        .setScale(PLAYER_SCALE)
        .setDepth(this.tileY);
      this.hairSprite = scene.add
        .sprite(px, py, hairKeyResolved)
        .setOrigin(0.5, 1)
        .setScale(PLAYER_SCALE)
        .setDepth(this.tileY + 1);
    }

    this.smoothFrameNumbers = [12, 0, 4, 8];
    this.stopFrameNumbers = [12, 0, 4, 8];
    this.rideStopFrameNumbers = [44, 32, 36, 40];
    this.surfStopFrameNumbers = [60, 48, 52, 56];

    const movementState =
      scene.getUser()?.getOverworldMovementState() ?? OverworldMovementState.WALK;
    this.baseSpeed =
      movementState === OverworldMovementState.RIDE
        ? 6
        : movementState === OverworldMovementState.RUNNING
          ? 4
          : movementState === OverworldMovementState.SURF
            ? 4
            : 2;
  }

  protected override onTileMoved(tileX: number, tileY: number): void {
    this.getScene().events.emit('player_tile_moved', { tileX, tileY });
  }

  override setPosition(px: number, py: number): void {
    super.setPosition(px, py);
    this.hairSprite?.setPosition(px, py);
    this.outfitSprite?.setPosition(px, py);
  }

  override refreshPosition(): void {
    super.refreshPosition();
    if (this.hairSprite || this.outfitSprite) {
      const [px, py] = calcOverworldTilePos(this.tileX, this.tileY);
      this.hairSprite?.setPosition(px, py);
      this.outfitSprite?.setPosition(px, py);
      this.outfitSprite?.setDepth(this.tileY);
      this.hairSprite?.setDepth(this.tileY + 1);
    }
  }

  override startSpriteAnimation(key: string): void {
    super.startSpriteAnimation(key);
    if (!this.skinKey) return;
    const outfitAnimKey = key.replace(this.skinKey, this.outfitKey);
    const hairAnimKey = key.replace(this.skinKey, this.hairKey);
    if (this.scene.anims.exists(outfitAnimKey)) this.outfitSprite?.play(outfitAnimKey);
    if (this.scene.anims.exists(hairAnimKey)) this.hairSprite?.play(hairAnimKey);
  }

  override stopSpriteAnimation(frameIndex: number): void {
    super.stopSpriteAnimation(frameIndex);
    if (!this.hairSprite && !this.outfitSprite) return;
    const textureKey = this.getSprite().texture.key;
    const frameKeys = this.getScene().textures.get(textureKey).getFrameNames();
    const frameName = frameKeys[frameIndex];
    if (frameName) {
      this.hairSprite?.anims.stop();
      this.outfitSprite?.anims.stop();
      this.hairSprite?.setFrame(frameName);
      this.outfitSprite?.setFrame(frameName);
    }
  }

  override setSpriteDepth(value: number): void {
    super.setSpriteDepth(value);
    this.outfitSprite?.setDepth(value);
    this.hairSprite?.setDepth(value + 1);
  }

  override destroy(): void {
    this.hairSprite?.destroy();
    this.outfitSprite?.destroy();
    this.hairSprite = null;
    this.outfitSprite = null;
    super.destroy();
  }

  move(direction: DIRECTION): void {
    if (direction !== this.getLastDirection()) {
      this.animStep = 0;
    }
    const textureKey = this.getSprite().texture.key;
    const movementState =
      this.getScene().getUser()?.getOverworldMovementState() ?? OverworldMovementState.WALK;
    const animationKey =
      movementState === OverworldMovementState.RIDE
        ? getRideAnimationKey(textureKey, direction, this.animStep)
        : movementState === OverworldMovementState.SURF
          ? getSurfAnimationKey(textureKey, direction, this.animStep)
          : movementState === OverworldMovementState.RUNNING
            ? getRunningAnimationKey(textureKey, direction, this.animStep)
            : getWalkAnimationKey(textureKey, direction, this.animStep);
    this.ready(direction, animationKey);
  }

  jump(direction: DIRECTION): boolean {
    if (!this.isMovementFinish()) return false;
    const user = this.getScene().getUser();
    if (!user || user.getOverworldMovementState() === OverworldMovementState.JUMP) return false;
    const delta = directionToDelta(direction);
    const destX = this.tileX + delta.dx * 2;
    const destY = this.tileY + delta.dy * 2;
    if (!this.canLandAt(destX, destY)) return false;
    user.setOverworldMovementState(OverworldMovementState.JUMP);
    const textureKey = this.getSprite().texture.key;
    const animationKey = getRunningAnimationKey(textureKey, direction, this.animStep);
    this.ready(direction, animationKey, 2);
    return true;
  }

  override getStopFrameNumberFromDirection(direction: DIRECTION): number | undefined {
    const state =
      this.getScene().getUser()?.getOverworldMovementState() ?? OverworldMovementState.WALK;
    if (state === OverworldMovementState.RIDE && this.rideStopFrameNumbers.length === 4) {
      switch (direction) {
        case DIRECTION.UP:
          return this.rideStopFrameNumbers[0];
        case DIRECTION.DOWN:
          return this.rideStopFrameNumbers[1];
        case DIRECTION.LEFT:
          return this.rideStopFrameNumbers[2];
        case DIRECTION.RIGHT:
          return this.rideStopFrameNumbers[3];
        default:
          return undefined;
      }
    }
    if (state === OverworldMovementState.SURF && this.surfStopFrameNumbers.length === 4) {
      switch (direction) {
        case DIRECTION.UP:
          return this.surfStopFrameNumbers[0];
        case DIRECTION.DOWN:
          return this.surfStopFrameNumbers[1];
        case DIRECTION.LEFT:
          return this.surfStopFrameNumbers[2];
        case DIRECTION.RIGHT:
          return this.surfStopFrameNumbers[3];
        default:
          return undefined;
      }
    }
    return super.getStopFrameNumberFromDirection(direction);
  }

  getTileX(): number {
    return this.tileX;
  }

  getTileY(): number {
    return this.tileY;
  }

  getOutfitSprite(): Phaser.GameObjects.Sprite | null {
    return this.outfitSprite;
  }

  getHairSprite(): Phaser.GameObjects.Sprite | null {
    return this.hairSprite;
  }
}
