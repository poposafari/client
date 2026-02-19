import { GameScene } from '@poposafari/scenes';
import { OverworldMovementState, TEXTSTYLE } from '@poposafari/types';
import type { UserGender } from '@poposafari/types';
import { calcOverworldTilePos, directionToDelta, DIRECTION } from '../overworld.constants';
import type { IOverworldBlockingRef, IOverworldMapAdapter } from './movable.object';
import { MovableObject } from './movable.object';

/** 플레이어 스프라이트 스케일 (레거시 2~3) */
const PLAYER_SCALE = 3;

/** id like "skin_0" | "outfit_0" | "hair_0" -> numeric suffix "0" (loading.phase.ts와 동일 규칙) */
function idToSuffix(id: string): string {
  const match = id.match(/\d+/);
  return match ? match[0] : id;
}

function genderCode(g: UserGender): 'm' | 'f' {
  return g === 'male' ? 'm' : 'f';
}

/** 오버월드 스킨 텍스처 키 (loading.phase.ts loadPlayerCostumeAssets와 동일 규칙) */
function getSkinTextureKey(skinId: string): string {
  return `player_overworld_skin_${idToSuffix(skinId)}`;
}

/** 오버월드 헤어 텍스처 키 */
function getHairTextureKey(gender: UserGender, hair: string, hairColor: string): string {
  return `player_overworld_${genderCode(gender)}_hair_${idToSuffix(hair)}_${hairColor}`;
}

/** 오버월드 아웃핏 텍스처 키 */
function getOutfitTextureKey(gender: UserGender, outfit: string): string {
  return `player_overworld_${genderCode(gender)}_outfit_${idToSuffix(outfit)}`;
}

/** 마스터 데이터 기준 첫 스킨/헤어/아웃핏 키 (폴백용) */
function getDefaultOverworldKeys(
  scene: GameScene,
  gender: UserGender,
): { skin: string; hair: string; outfit: string } {
  const c = scene.getMasterData().getCostume();
  const g = genderCode(gender);
  const skin = c.skin[0];
  const skinKey = skin ? getSkinTextureKey(skin) : `player_overworld_skin_0`;
  const genderData = c[gender];
  const firstOutfit = genderData.outfits[0];
  const outfitKey = firstOutfit
    ? getOutfitTextureKey(gender, firstOutfit)
    : `player_overworld_${g}_outfit_0`;
  const firstHairRow = genderData.hairs[0];
  const firstColor = firstHairRow?.[1];
  const hairKey =
    firstHairRow && firstColor
      ? getHairTextureKey(gender, firstHairRow[0], firstColor)
      : `player_overworld_${g}_hair_0_${firstColor ?? 'c0'}`;
  return { skin: skinKey, hair: hairKey, outfit: outfitKey };
}

function getDirName(direction: DIRECTION): string {
  return direction === DIRECTION.UP
    ? 'up'
    : direction === DIRECTION.DOWN
      ? 'down'
      : direction === DIRECTION.LEFT
        ? 'left'
        : 'right';
}

/**
 * 로딩에서 등록한 walk 애니메이션 키 (loading.phase.ts 참고).
 * 형식: {texture}_walk_{down|left|right|up}_{0|1}
 */
function getWalkAnimationKey(textureKey: string, direction: DIRECTION, animStep: number): string {
  const stepIndex = animStep % 2;
  return `${textureKey}_walk_${getDirName(direction)}_${stepIndex}`;
}

/**
 * 로딩에서 등록한 running 애니메이션 키 (loading.phase.ts 참고).
 * step 0→1→2→0 반복. 형식: {texture}_running_{down|left|right|up}_{0|1|2}
 */
function getRunningAnimationKey(
  textureKey: string,
  direction: DIRECTION,
  animStep: number,
): string {
  const stepIndex = animStep % 3;
  return `${textureKey}_running_${getDirName(direction)}_${stepIndex}`;
}

/**
 * 로딩에서 등록한 ride 애니메이션 키 (loading.phase.ts 참고).
 * step 0→1→2→3→4→0 반복. 형식: {texture}_ride_{down|left|right|up}_{0|1|2|3|4}
 */
function getRideAnimationKey(textureKey: string, direction: DIRECTION, animStep: number): string {
  const stepIndex = animStep % 5;
  return `${textureKey}_ride_${getDirName(direction)}_${stepIndex}`;
}

/**
 * 로딩에서 등록한 surf 애니메이션 키 (loading.phase.ts 참고).
 * step 0→1→0 반복. 형식: {texture}_surf_{down|left|right|up}_{0|1}
 */
function getSurfAnimationKey(textureKey: string, direction: DIRECTION, animStep: number): string {
  const stepIndex = animStep % 2;
  return `${textureKey}_surf_${getDirName(direction)}_${stepIndex}`;
}

/**
 * 오버월드 플레이어 오브젝트 (레거시 PlayerOverworldObj 참고).
 * MovableObject 상속, 타일 단위 위치·이동(ready/update), walk 애니메이션.
 */
export class PlayerObject extends MovableObject {
  /** RIDE 상태일 때 IDLE 프레임: [UP, DOWN, LEFT, RIGHT] = [44, 32, 40, 36] */
  private rideStopFrameNumbers: number[] = [];
  /** SURF 상태일 때 IDLE 프레임: [UP, DOWN, LEFT, RIGHT] = [52, 56, 60, 64] */
  private surfStopFrameNumbers: number[] = [];

  /** 레이어드 아바타용. skin = base sprite, hair/outfit는 동기화해서 같이 이동·애니 (loading.phase.ts 애니 키 규칙) */
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
    /** 이동 끝나고 키가 안 눌렸을 때만: UP=12, DOWN=0, LEFT=4, RIGHT=8 (가만히 멈추는 프레임) */
    this.stopFrameNumbers = [12, 0, 4, 8];
    /** RIDE 상태 IDLE: UP=44, DOWN=32, LEFT=40, RIGHT=36 (자전거 멈춤 프레임) */
    this.rideStopFrameNumbers = [44, 32, 36, 40];
    /** SURF 상태 IDLE: UP=52, DOWN=56, LEFT=60, RIGHT=64 (파도타기 멈춤 프레임) */
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
    // this.getScene().events.emit('player_tile_moved', { tileX, tileY });
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

  /** 방향으로 한 타일 이동 (UserManager 움직임 상태에 따라 walk / running / ride 애니메이션) */
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

  /**
   * 바라보는 방향으로 2타일 점프 (앞 타일 건너뛰고 다음 타일에 착지).
   * IDLE일 때만 가능. 착지 타일이 유효할 때만 실행. 점프 중에는 상태가 JUMP.
   */
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

  /** RIDE/SURF 상태일 때 해당 IDLE 프레임. 그 외에는 walk/run IDLE(12,0,4,8) */
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
