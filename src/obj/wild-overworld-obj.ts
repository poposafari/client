import { ANIMATION, AUDIO, DIRECTION, KEY, OBJECT, TEXTURE } from '../enums';
import i18next from '../i18n';
import { InGameScene } from '../scenes/ingame-scene';
import { WildRes } from '../types';
import { playEffectSound } from '../uis/ui';
import { MovableOverworldObj } from './movable-overworld-obj';
import { PlayerGlobal } from '../core/storage/player-storage';
import { PlayerOverworldObj } from './player-overworld-obj';

export type RangeTile = {
  x: number;
  y: number;
};

export class WildOverworldObj extends MovableOverworldObj {
  private data: WildRes;
  private timer?: Phaser.Time.TimerEvent;
  private againTimer?: Phaser.Time.TimerEvent;
  private currentDirectionIndex?: number;
  private remainingSteps: number = 0;
  private range: number = 7;

  private readonly scale: number = 1.5;
  private readonly speed: number = 2;
  private readonly frameNumbers: number[] = [12, 0, 4, 8];
  private readonly directions: DIRECTION[] = [DIRECTION.UP, DIRECTION.DOWN, DIRECTION.RIGHT, DIRECTION.LEFT];
  private readonly keys: KEY[] = [KEY.ARROW_UP, KEY.ARROW_DOWN, KEY.ARROW_RIGHT, KEY.ARROW_LEFT];

  constructor(scene: InGameScene, map: Phaser.Tilemaps.Tilemap, data: WildRes, x: number, y: number) {
    const texture = `pokemon_overworld${data.pokedex}${data.shiny ? 's' : ''}`;
    super(scene, map, texture, x, y, '', OBJECT.WILD, DIRECTION.DOWN);

    this.data = data;
    this.setSpriteScale(this.scale);
    this.smoothFrameNumbers = this.frameNumbers;
    this.baseSpeed = this.speed;

    this.setEmotion(TEXTURE.BLANK, ANIMATION.NONE);
    if (data.shiny) {
      this.setEffect(TEXTURE.OVERWORLD_SHINY, ANIMATION.OVERWORLD_SHINY, -1, 10, 2);
    }

    this.startSpriteAnimation(`${texture}_down`);

    this.scheduleRandomMovement();
  }

  updateData(data: Partial<WildRes>) {
    if (this.data) {
      this.data = {
        ...this.data,
        ...data,
      };
    }
  }

  getData() {
    return this.data;
  }

  scheduleRandomMovement() {
    const randomDelay = Phaser.Math.Between(2000, 6000);
    const directionIndex = this.getRandomDirection();
    const stepCount = this.getRandomStep();

    this.timer = this.getScene().time.delayedCall(randomDelay, () => {
      this.moveInSteps(directionIndex, stepCount);
    });
  }

  stopMovement() {
    if (this.timer) {
      this.timer.remove(false);
      this.timer = undefined;
    }

    if (this.againTimer) {
      this.againTimer.remove(false);
      this.againTimer = undefined;
    }

    this.currentDirectionIndex = undefined;
    this.remainingSteps = 0;
  }

  caught() {
    this.destroy();
    this.data.catch = true;
  }

  isCatchable() {
    return this.data.catch;
  }

  async reaction(direction: DIRECTION) {
    const pokedex = this.data.pokedex;
    const shiny = this.data.shiny ? 's' : '';

    this.stopMovement();

    switch (direction) {
      case DIRECTION.DOWN:
        this.startSpriteAnimation(`pokemon_overworld${pokedex}${shiny}_up`);
        break;
      case DIRECTION.LEFT:
        this.startSpriteAnimation(`pokemon_overworld${pokedex}${shiny}_right`);
        break;
      case DIRECTION.RIGHT:
        this.startSpriteAnimation(`pokemon_overworld${pokedex}${shiny}_left`);
        break;
      case DIRECTION.UP:
        this.startSpriteAnimation(`pokemon_overworld${pokedex}${shiny}_down`);
        break;
    }

    playEffectSound(this.getScene(), AUDIO.REACTION_0);
    await this.setEmotion('emo_0', 'emo_0');
  }

  private moveInSteps(directionIndex: number, steps: number): void {
    const validDirectionIndex = this.findValidDirection(directionIndex);

    if (validDirectionIndex === null) {
      this.scheduleRandomMovement();
      return;
    }

    this.currentDirectionIndex = validDirectionIndex;
    this.remainingSteps = steps;

    this.executeStep();
  }

  private findValidDirection(preferredIndex: number): number | null {
    const triedDirections = new Set<number>();
    let directionIndex = preferredIndex;

    for (let attempt = 0; attempt < 4; attempt++) {
      if (!this.isBlockingDirection(this.directions[directionIndex])) {
        return directionIndex;
      }

      triedDirections.add(directionIndex);

      const availableDirections = this.directions.map((_, index) => index).filter((index) => !triedDirections.has(index) && !this.isBlockingDirection(this.directions[index]));

      if (availableDirections.length > 0) {
        return availableDirections[Phaser.Math.Between(0, availableDirections.length - 1)];
      }

      directionIndex = this.getRandomDirection();
    }

    return null;
  }

  private executeStep(): void {
    if (this.remainingSteps <= 0 || this.currentDirectionIndex === undefined) {
      this.scheduleRandomMovement();
      return;
    }

    const direction = this.directions[this.currentDirectionIndex];

    if (this.isBlockingDirection(direction)) {
      const newDirectionIndex = this.findValidDirection(this.getRandomDirection());

      if (newDirectionIndex === null) {
        this.scheduleRandomMovement();
        return;
      }

      this.currentDirectionIndex = newDirectionIndex;
    }

    const finalDirection = this.directions[this.currentDirectionIndex];
    this.ready(finalDirection, this.getAnimation(this.keys[this.currentDirectionIndex]));

    this.remainingSteps--;
    this.againTimer = this.getScene().time.delayedCall(200, () => {
      this.executeStep();
    });
  }

  private getAnimation(key: KEY) {
    const pokedex = this.data.pokedex;
    const shiny = this.data.shiny ? 's' : '';

    switch (key) {
      case KEY.ARROW_UP:
        return `pokemon_overworld${pokedex}${shiny}_up`;
      case KEY.ARROW_DOWN:
        return `pokemon_overworld${pokedex}${shiny}_down`;
      case KEY.ARROW_LEFT:
        return `pokemon_overworld${pokedex}${shiny}_left`;
      case KEY.ARROW_RIGHT:
        return `pokemon_overworld${pokedex}${shiny}_right`;
    }

    return `pokemon_overworld${pokedex}${shiny}_up`;
  }

  private getRandomDirection() {
    return Phaser.Math.Between(0, 3);
  }

  private getRandomStep() {
    return Phaser.Math.Between(1, 5);
  }

  update(delta: number): void {
    const movementCheck = (this as any).movementCheck as boolean;
    const movementDirectionQueue = (this as any).movementDirectionQueue as Array<{ direction: DIRECTION; animationKey: ANIMATION | string }>;

    if (movementCheck && movementDirectionQueue.length > 0) {
      const nextMovement = movementDirectionQueue[0];
      if (nextMovement) {
        const direction = nextMovement.direction;
        if (this.isBlockingDirection(direction)) {
          movementDirectionQueue.length = 0;
          (this as any).movementBlocking = true;
          this.stopMovement();
          this.scheduleRandomMovement();
          return;
        }
      }
    }

    super.update(delta);
  }

  updateName() {
    if (this.data) {
      const newName = i18next.t(`pokemon:${this.data.pokedex}.name`);
      this.setName(newName);
    }
  }

  updateNameBasedOnRange(playerObj: PlayerOverworldObj | null): void {
    if (!playerObj) {
      this.setName('');
      return;
    }

    const wildTilePos = this.getTilePos();
    const playerTilePos = playerObj.getTilePos();

    const wildX = Math.floor(wildTilePos.x);
    const wildY = Math.floor(wildTilePos.y);
    const playerX = Math.floor(playerTilePos.x);
    const playerY = Math.floor(playerTilePos.y);

    const halfRange = Math.floor((this.range - 1) / 2);
    const deltaX = Math.abs(playerX - wildX);
    const deltaY = Math.abs(playerY - wildY);

    const isPlayerInRange = deltaX <= halfRange && deltaY <= halfRange;

    if (isPlayerInRange) {
      if (this.data) {
        const pokemonName = i18next.t(`pokemon:${this.data.pokedex}.name`);
        this.setName(pokemonName);
      }
    } else {
      this.setName('');
    }
  }

  setRange(range: number): void {
    this.range = range;
  }

  getRange(): number {
    return this.range;
  }

  getRangeTiles(): RangeTile[] {
    const centerTile = this.getTilePos();
    const centerX = Math.floor(centerTile.x);
    const centerY = Math.floor(centerTile.y);
    const halfRange = Math.floor((this.range - 1) / 2);

    const tiles: RangeTile[] = [];

    for (let y = centerY - halfRange; y <= centerY + halfRange; y++) {
      for (let x = centerX - halfRange; x <= centerX + halfRange; x++) {
        tiles.push({ x, y });
      }
    }

    return tiles;
  }

  isInRange(tileX: number, tileY: number): boolean {
    const centerTile = this.getTilePos();
    const centerX = Math.floor(centerTile.x);
    const centerY = Math.floor(centerTile.y);
    const halfRange = Math.floor((this.range - 1) / 2);

    const deltaX = Math.abs(tileX - centerX);
    const deltaY = Math.abs(tileY - centerY);

    return deltaX <= halfRange && deltaY <= halfRange;
  }

  isInRangeVector(tilePos: Phaser.Math.Vector2): boolean {
    return this.isInRange(Math.floor(tilePos.x), Math.floor(tilePos.y));
  }

  getRangeBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
    const centerTile = this.getTilePos();
    const centerX = Math.floor(centerTile.x);
    const centerY = Math.floor(centerTile.y);
    const halfRange = Math.floor((this.range - 1) / 2);

    return {
      minX: centerX - halfRange,
      minY: centerY - halfRange,
      maxX: centerX + halfRange,
      maxY: centerY + halfRange,
    };
  }
}
