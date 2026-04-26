import { GameScene } from '@poposafari/scenes';
import type { SafariWildInfo } from '@poposafari/scenes';
import { ANIMATION, DEPTH, SFX, TEXTCOLOR, TEXTURE } from '@poposafari/types';
import { addObjText, addSprite, getPokemonI18Name, getPokemonTexture } from '@poposafari/utils';
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
const SHINY_SIZE_MARGIN = 0.6;

export class WildPokemonObject extends MovableObject {
  private readonly wild: SafariWildInfo;
  private readonly mapId: string;
  private readonly frameBase: string;
  private readonly textureKey: string;

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

  private expiresAt: number | null = null;
  private timerText: Phaser.GameObjects.Text;
  private lastTimerLabel = '';
  private shinySprite: Phaser.GameObjects.Sprite | null = null;
  /** 페이드아웃이 실제로 시작되면 true. OverworldUi.handleWildDespawn이 1회만 실행되도록. */
  private despawning = false;
  /** 클라 자체 TTL 감지로 `wild_ttl_expired`를 이미 emit했는지 (중복 emit 방지). */
  private ttlExpiryEmitted = false;
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
    spawnTile: 'land' | 'water' = 'land',
  ) {
    const textureType = spawnTile === 'water' ? 'overworld_swimming' : 'overworld';
    // scene 인자를 함께 넘겨야 swimming 아뜰라스에 프레임이 없을 때 'pokemon.overworld'로 폴백된다.
    const { key, frame } = getPokemonTexture(
      textureType,
      wild.pokedexId,
      { isShiny: wild.isShiny },
      scene,
    );
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
    this.textureKey = key;
    this.lastMovedDirection = initialDir;
    this.chosenDirection = initialDir;

    this.timerText = addObjText(scene, tileX, tileY, '', 14, TEXTCOLOR.WHITE);
    this.timerText.setDepth(DEPTH.MESSAGE);
    this.timerText.setVisible(false);

    this.name.setVisible(false);
    this.scene.events.on('player_tile_moved', this.onPlayerTileMoved);
    this.shadow.setVisible(true).setScale(3);
    this.refreshPosition();

    this.setBaseSpeed(1.4);

    this.startSpriteAnimation(this.animKey(initialDir));
    this.idleMs = this.randomIdleMs();

    if (wild.expiresAt) this.setExpiresAt(wild.expiresAt);

    if (wild.isShiny) {
      this.shinySprite = this.scene.add
        .sprite(this.sprite.x, this.sprite.y, TEXTURE.OVERWORLD_SHINY)
        .setOrigin(0.5, 1);
      this.shinySprite.setDisplaySize(
        this.sprite.displayWidth * SHINY_SIZE_MARGIN,
        this.sprite.displayHeight * SHINY_SIZE_MARGIN,
      );
      this.shinySprite.play(ANIMATION.OVERWORLD_SHINY);
    }
  }

  setExpiresAt(expiresAt: number | undefined): void {
    this.expiresAt = expiresAt ?? null;
    this.wild.expiresAt = expiresAt;
    this.refreshTimer();
  }

  getTimerText(): Phaser.GameObjects.Text {
    return this.timerText;
  }

  isDespawning(): boolean {
    return this.despawning;
  }

  /** 중복 호출 방지용. OverworldUi가 페이드 시작 직전에 세팅. 걷기도 멈춘다. */
  markDespawning(): void {
    this.despawning = true;
    this.state = 'STOPPED';
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
      this.refreshTimer();
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
    this.refreshTimer();
    this.syncShinyOverlay();
  }

  private syncShinyOverlay(): void {
    if (!this.shinySprite) return;
    this.shinySprite.setPosition(this.sprite.x, this.sprite.y);
    this.shinySprite.setDepth(this.sprite.depth + 0.05);
    this.shinySprite.setVisible(this.sprite.visible);
  }

  /** 타이머 텍스트를 갱신. 이름표 바로 아래 위치를 따라다니게 한다.
   *  남은 시간이 0이면 scene 이벤트(wild_ttl_expired)를 발송해 OverworldUi가 페이드아웃을 시작하게 한다. */
  private refreshTimer(): void {
    if (this.expiresAt == null) {
      if (this.timerText.visible) this.timerText.setVisible(false);
      return;
    }

    const remainingMs = this.expiresAt - Date.now();

    // 클라 자체 TTL 감지: 이 wild에 대한 서버 despawn이 아직 안 왔어도
    // 타이머가 0을 지나면 선제적으로 페이드아웃을 트리거한다.
    // 실제 페이드 시작/`despawning` 세팅은 OverworldUi.handleWildDespawn이 하므로
    // 여기서는 emit만 1회 발생하도록 한다. 이미 페이드 중이면 동작 없음.
    if (remainingMs <= 0 && !this.despawning && !this.ttlExpiryEmitted) {
      this.ttlExpiryEmitted = true;
      this.timerText.setVisible(false);
      this.scene.events.emit('wild_ttl_expired', {
        mapId: this.mapId,
        wildUid: this.wild.uid,
      });
      return;
    }

    // 이름표와 동일한 가시성 규칙 (거리 기반)
    if (!this.name.visible) {
      if (this.timerText.visible) this.timerText.setVisible(false);
      return;
    }

    const totalSec = Math.max(0, Math.floor(remainingMs / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const label = `${m}:${s.toString().padStart(2, '0')}`;
    if (label !== this.lastTimerLabel) {
      this.timerText.setText(label);
      this.lastTimerLabel = label;
    }
    if (totalSec < 15) this.timerText.setColor(TEXTCOLOR.RED);
    else if (totalSec < 45) this.timerText.setColor(TEXTCOLOR.YELLOW);
    else this.timerText.setColor(TEXTCOLOR.WHITE);

    this.timerText.setPosition(this.name.x, this.name.y + 22);
    this.timerText.setVisible(true);
  }

  protected override onTileMoved(tileX: number, tileY: number, _direction: DIRECTION): void {
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

  override refreshNameText(): void {
    if (!this.name?.active) return;
    this.name.setText(getPokemonI18Name(this.wild.pokedexId));
  }

  override destroy(): void {
    this.state = 'STOPPED';
    this.scene.events.off('player_tile_moved', this.onPlayerTileMoved);
    this.emoteSprite?.destroy();
    this.emoteSprite = null;
    this.timerText.destroy();
    this.shinySprite?.destroy();
    this.shinySprite = null;
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
    return `${this.textureKey}.${this.frameBase}.${dir}`;
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
