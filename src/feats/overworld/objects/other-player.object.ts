import type { CurrentUserCostume, UserGender } from '@poposafari/types';
import { GameScene } from '@poposafari/scenes';
import { TEXTCOLOR } from '@poposafari/types';
import { calcOverworldTilePos, DIRECTION } from '../overworld.constants';
import {
  getRideAnimationKey,
  getRunningAnimationKey,
  getSurfAnimationKey,
  getWalkAnimationKey,
} from '../overworld-animation-keys';
import {
  equippedCostumesToParts,
  getDefaultOverworldKeys,
  getHairTextureKey,
  getOutfitTextureKey,
  getSkinTextureKey,
} from '../overworld-costume-keys';
import { BaseObject } from './base.object';
import { PetObject } from './pet.object';

/** 플레이어 스프라이트 스케일 (PlayerObject와 동일) */
const PLAYER_SCALE = 3;

export interface OtherPlayerObjectOptions {
  scale?: number;
  /** 서버에서 오는 JSON 문자열 또는 파싱된 객체 */
  costume?: string | CurrentUserCostume;
  gender?: UserGender;
  name: string;
}

function parseCostume(costume: string | CurrentUserCostume | undefined): CurrentUserCostume | null {
  if (!costume) return null;
  if (typeof costume === 'string') {
    try {
      const parsed = JSON.parse(costume);
      if (Array.isArray(parsed)) {
        return equippedCostumesToParts(parsed);
      }
      return parsed as CurrentUserCostume;
    } catch {
      return null;
    }
  }
  return costume;
}

type MoveDir = 'up' | 'down' | 'left' | 'right';

function toDIRECTION(d: MoveDir): DIRECTION {
  const map: Record<MoveDir, DIRECTION> = {
    up: DIRECTION.UP,
    down: DIRECTION.DOWN,
    left: DIRECTION.LEFT,
    right: DIRECTION.RIGHT,
  };
  return map[d];
}

export class OtherPlayerObject extends BaseObject {
  private moveTween: Phaser.Tweens.Tween | null = null;
  private moveNameTween: Phaser.Tweens.Tween | null = null;
  private outfitSprite: Phaser.GameObjects.Sprite | null = null;
  private hairSprite: Phaser.GameObjects.Sprite | null = null;
  private skinKey = '';
  private outfitKey = '';
  private hairKey = '';
  private lastDirection: MoveDir = 'down';
  private lastMoveType: string = 'walk';
  private animStep = 0;
  private pet: PetObject | null = null;
  private addToContainer: ((obj: Phaser.GameObjects.GameObject) => void) | null = null;
  private lastPetSpeed = 2;

  private static readonly DEFAULT_MOVE_DURATION_MS = 120;
  private static readonly JUMP_ARC_HEIGHT = 60;

  constructor(scene: GameScene, tileX: number, tileY: number, options?: OtherPlayerObjectOptions) {
    const gender: UserGender = options?.gender === 'female' ? 'female' : 'male';
    const costume = parseCostume(options?.costume);
    const defaults = getDefaultOverworldKeys(scene, gender);

    const skinKeyRequested = costume?.skin ? getSkinTextureKey(costume.skin) : defaults.skin;
    const skinKey = scene.textures.exists(skinKeyRequested) ? skinKeyRequested : defaults.skin;
    const scale = options?.scale ?? PLAYER_SCALE;

    super(
      scene,
      skinKey,
      tileX,
      tileY,
      { text: options?.name || '', color: TEXTCOLOR.WHITE },
      100,
      { scale },
    );

    this.skinKey = skinKey;

    const hairKeyRequested = costume ? getHairTextureKey(gender, costume.hair) : defaults.hair;
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
      this.outfitKey = outfitKeyResolved;
      this.hairKey = hairKeyResolved;
      const [px, py] = calcOverworldTilePos(this.tileX, this.tileY);
      this.outfitSprite = scene.add
        .sprite(px, py, outfitKeyResolved)
        .setOrigin(0.5, 1)
        .setScale(scale)
        .setDepth(this.tileY + 0.1);
      this.hairSprite = scene.add
        .sprite(px, py, hairKeyResolved)
        .setOrigin(0.5, 1)
        .setScale(scale)
        .setDepth(this.tileY + 0.2);
    }
  }

  getOutfitSprite(): Phaser.GameObjects.Sprite | null {
    return this.outfitSprite;
  }

  getHairSprite(): Phaser.GameObjects.Sprite | null {
    return this.hairSprite;
  }

  setFacingDirection(direction: MoveDir): void {
    this.lastDirection = direction;
    const frameIndex =
      direction === 'down' ? 0 : direction === 'up' ? 12 : direction === 'left' ? 4 : 8;
    this.setFrameByIndex(this.sprite, frameIndex);
    if (this.outfitSprite) this.setFrameByIndex(this.outfitSprite, frameIndex);
    if (this.hairSprite) this.setFrameByIndex(this.hairSprite, frameIndex);
  }

  private setFrameByIndex(sprite: Phaser.GameObjects.Sprite, frameIndex: number): void {
    const textureKey = sprite.texture.key;
    const frameNames = this.scene.textures.get(textureKey)?.getFrameNames();
    if (frameNames?.[frameIndex]) sprite.setFrame(frameNames[frameIndex]);
  }

  override stopSpriteAnimation(frameIndex: number): void {
    super.stopSpriteAnimation(frameIndex);
    if (!this.outfitSprite && !this.hairSprite) return;
    const textureKey = this.sprite.texture.key;
    const frameKeys = this.scene.textures.get(textureKey)?.getFrameNames();
    const frameName = frameKeys?.[frameIndex];
    if (frameName) {
      this.outfitSprite?.anims.stop();
      this.hairSprite?.anims.stop();
      this.outfitSprite?.setFrame(frameName);
      this.hairSprite?.setFrame(frameName);
    }
  }

  private static readonly RIDE_IDLE_FRAMES: Record<MoveDir, number> = {
    up: 44,
    down: 32,
    left: 36,
    right: 40,
  };
  private static readonly SURF_IDLE_FRAMES: Record<MoveDir, number> = {
    up: 60,
    down: 48,
    left: 52,
    right: 56,
  };
  private static readonly WALK_IDLE_FRAMES: Record<MoveDir, number> = {
    down: 0,
    up: 12,
    left: 4,
    right: 8,
  };

  private getIdleFrameIndex(direction: MoveDir, moveType?: string): number {
    if (moveType === 'ride') return OtherPlayerObject.RIDE_IDLE_FRAMES[direction];
    if (moveType === 'surf') return OtherPlayerObject.SURF_IDLE_FRAMES[direction];
    return OtherPlayerObject.WALK_IDLE_FRAMES[direction];
  }

  override setPosition(px: number, py: number): void {
    super.setPosition(px, py);
    this.outfitSprite?.setPosition(px, py);
    this.hairSprite?.setPosition(px, py);
  }

  override refreshPosition(): void {
    super.refreshPosition();
    if (this.hairSprite || this.outfitSprite) {
      const [px, py] = calcOverworldTilePos(this.tileX, this.tileY);
      this.outfitSprite?.setPosition(px, py);
      this.hairSprite?.setPosition(px, py);
      this.outfitSprite?.setDepth(this.tileY + 0.1);
      this.hairSprite?.setDepth(this.tileY + 0.2);
    }
  }

  override setSpriteDepth(value: number): void {
    super.setSpriteDepth(value);
    this.outfitSprite?.setDepth(value + 0.1);
    this.hairSprite?.setDepth(value + 0.2);
  }

  moveToTile(
    tileX: number,
    tileY: number,
    durationMs?: number,
    options?: { moveType?: string; direction?: MoveDir },
  ): void {
    this.stopMoveTween();

    const dir = options?.direction ?? this.lastDirection;
    if (dir !== this.lastDirection) this.animStep = 0;
    this.lastDirection = dir;
    const moveType = options?.moveType;
    if (moveType) this.lastMoveType = moveType;

    const targetX = Math.floor(tileX);
    const targetY = Math.floor(tileY);
    const [px, py] = calcOverworldTilePos(targetX, targetY);
    const duration = durationMs ?? OtherPlayerObject.DEFAULT_MOVE_DURATION_MS;

    this.startMoveAnimation(moveType, dir);
    if (moveType && moveType !== 'jump') this.animStep++;

    if (this.pet) {
      const nonFieldMove = moveType === 'ride' || moveType === 'surf' || moveType === 'jump';
      if (nonFieldMove) {
        this.clearPet(false);
      } else {
        this.syncPetSpeed(moveType);
        this.pet.followStep(targetX, targetY, toDIRECTION(dir));
      }
    }

    const targets: Phaser.GameObjects.GameObject[] = [this.shadow, this.sprite];
    if (this.outfitSprite) targets.push(this.outfitSprite);
    if (this.hairSprite) targets.push(this.hairSprite);

    if (moveType === 'jump') {
      const [startX, startY] = calcOverworldTilePos(this.tileX, this.tileY);
      this.moveTween = this.scene.tweens.addCounter({
        from: 0,
        to: 1,
        duration,
        ease: 'Linear',
        onUpdate: (tween) => {
          const progress = tween.progress;
          const linearX = startX + (px - startX) * progress;
          const linearY = startY + (py - startY) * progress;
          const arcY = -OtherPlayerObject.JUMP_ARC_HEIGHT * Math.sin(Math.PI * progress);
          const y = linearY + arcY;
          for (const t of targets) (t as Phaser.GameObjects.Sprite).setPosition(linearX, y);
          this.name.setPosition(linearX, y - this.nameOffsetY);
        },
        onComplete: () => {
          this.setTilePos(targetX, targetY);
          this.setSpriteDepth(targetY);
          this.refreshPosition();
          this.stopSpriteAnimation(this.getIdleFrameIndex(this.lastDirection, this.lastMoveType));
          this.moveTween = null;
          this.moveNameTween = null;
        },
      });
      this.moveNameTween = null;
      return;
    }

    this.moveTween = this.scene.tweens.add({
      targets,
      x: px,
      y: py,
      duration,
      ease: Phaser.Math.Easing.Linear,
      onComplete: () => {
        this.setTilePos(targetX, targetY);
        this.setSpriteDepth(targetY);
        this.refreshPosition();
        this.stopSpriteAnimation(this.getIdleFrameIndex(this.lastDirection, this.lastMoveType));
        this.moveTween = null;
        this.moveNameTween = null;
      },
    });

    this.moveNameTween = this.scene.tweens.add({
      targets: [this.name],
      x: px,
      y: py - this.nameOffsetY,
      duration,
      ease: Phaser.Math.Easing.Linear,
    });
  }

  private startMoveAnimation(moveType: string | undefined, direction: MoveDir): void {
    if (!moveType || moveType === 'jump') return;
    const dir = toDIRECTION(direction);
    let key: string;
    switch (moveType) {
      case 'walk':
        key = getWalkAnimationKey(this.skinKey, dir, this.animStep);
        break;
      case 'running':
        key = getRunningAnimationKey(this.skinKey, dir, this.animStep);
        break;
      case 'ride':
        key = getRideAnimationKey(this.skinKey, dir, this.animStep);
        break;
      case 'surf':
        key = getSurfAnimationKey(this.skinKey, dir, this.animStep);
        break;
      default:
        return;
    }
    if (this.scene.anims.exists(key)) this.sprite.play(key);
    if (this.outfitKey && this.outfitSprite) {
      const outfitKey = key.replace(this.skinKey, this.outfitKey);
      if (this.scene.anims.exists(outfitKey)) this.outfitSprite.play(outfitKey);
    }
    if (this.hairKey && this.hairSprite) {
      const hairKey = key.replace(this.skinKey, this.hairKey);
      if (this.scene.anims.exists(hairKey)) this.hairSprite.play(hairKey);
    }
  }

  private stopMoveTween(): void {
    if (this.moveTween) {
      this.moveTween.stop();
      this.moveTween = null;
    }
    if (this.moveNameTween) {
      this.moveNameTween.stop();
      this.moveNameTween = null;
    }
    this.stopSpriteAnimation(this.getIdleFrameIndex(this.lastDirection, this.lastMoveType));
  }

  setContainerAdd(addToContainer: (obj: Phaser.GameObjects.GameObject) => void): void {
    this.addToContainer = addToContainer;
  }

  getPet(): PetObject | null {
    return this.pet;
  }

  setPet(pokedexId: string, isShiny: boolean, withFx: boolean): void {
    if (!this.addToContainer) return;
    // 이미 같은 포켓몬이면 무시.
    if (
      this.pet &&
      this.pet.getPokedexId?.() === pokedexId &&
      this.pet.getIsShiny?.() === isShiny
    ) {
      return;
    }

    const spawn = () => {
      if (!this.addToContainer) return;
      const initDir = toDIRECTION(this.lastDirection);
      // OtherPlayer의 이동은 서버 권위(tween)로 보장되므로 펫은 맵/차단 검사 없이 따라가게 한다.
      if (withFx) {
        this.pet = PetObject.summon(
          this.scene,
          null,
          this.tileX,
          this.tileY,
          pokedexId,
          isShiny,
          initDir,
          [],
          this.addToContainer,
        );
      } else {
        this.pet = new PetObject(
          this.scene,
          null,
          this.tileX,
          this.tileY,
          pokedexId,
          isShiny,
          initDir,
          [],
          this.addToContainer,
        );
        this.addToContainer(this.pet.getShadow());
        this.addToContainer(this.pet.getSprite());
        const shiny = this.pet.getShinySprite();
        if (shiny) this.addToContainer(shiny);
      }
      this.pet.setBaseSpeed(this.lastPetSpeed);
    };

    if (this.pet) {
      this.clearPet(withFx, spawn);
    } else {
      spawn();
    }
  }

  clearPet(withFx: boolean, onComplete?: () => void): void {
    const pet = this.pet;
    if (!pet) {
      onComplete?.();
      return;
    }
    this.pet = null;
    if (withFx && this.addToContainer) {
      pet.recall(this.addToContainer, () => onComplete?.());
    } else {
      pet.destroy();
      onComplete?.();
    }
  }

  update(delta: number): void {
    this.pet?.update(delta);
  }

  private syncPetSpeed(moveType?: string): void {
    if (!this.pet) return;
    const speed = moveType === 'running' ? 4 : 2;
    if (speed !== this.lastPetSpeed) {
      this.lastPetSpeed = speed;
      this.pet.setBaseSpeed(speed);
    }
  }

  override destroy(): void {
    this.stopMoveTween();
    this.pet?.destroy();
    this.pet = null;
    this.outfitSprite?.destroy();
    this.hairSprite?.destroy();
    this.outfitSprite = null;
    this.hairSprite = null;
    super.destroy();
  }
}
