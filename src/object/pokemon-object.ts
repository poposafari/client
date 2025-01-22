import { DIRECTION } from '../enums/direction';
import { KEY } from '../enums/key';
import { OBJECT } from '../enums/object-type';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { MovableObject } from './movable-object';

export class PokemonObject extends MovableObject {
  private pokedex: string;
  private readonly directions: DIRECTION[] = [DIRECTION.UP, DIRECTION.DOWN, DIRECTION.RIGHT, DIRECTION.LEFT];
  private readonly keys: KEY[] = [KEY.UP, KEY.DOWN, KEY.RIGHT, KEY.LEFT];
  private timer?: Phaser.Time.TimerEvent;
  private againTimer?: Phaser.Time.TimerEvent;

  constructor(scene: InGameScene, texture: TEXTURE | string, pokedex: string, x: number, y: number, map: Phaser.Tilemaps.Tilemap, nickname: string) {
    super(scene, texture, x, y, map, nickname, OBJECT.POKEMON);
    this.pokedex = pokedex;
    this.setScale(1.5);
    this.setSpeed(2);
    this.setSmoothFrames([12, 0, 4, 8]);
    this.scheduleRandomMovement();
  }

  move() {
    this.movementStop = false;
  }

  private getAnimation(key: KEY) {
    switch (key) {
      case KEY.UP:
        return `pokemon_overworld${this.pokedex}_up`;
      case KEY.DOWN:
        return `pokemon_overworld${this.pokedex}_down`;
      case KEY.LEFT:
        return `pokemon_overworld${this.pokedex}_left`;
      case KEY.RIGHT:
        return `pokemon_overworld${this.pokedex}_right`;
    }
  }

  private scheduleRandomMovement() {
    const randomDelay = Phaser.Math.Between(1000, 6000);
    const directionIndex = this.getRandomDirection();
    const stepCount = this.getRandomStep();

    this.timer = this.getScene().time.delayedCall(randomDelay, () => {
      this.moveInSteps(directionIndex, stepCount);
    });
  }

  private moveInSteps(directionIndex: number, steps: number) {
    if (steps <= 0) {
      this.scheduleRandomMovement();
      return;
    }

    this.ready(this.directions[directionIndex], this.getAnimation(this.keys[directionIndex])!);

    this.againTimer = this.getScene().time.delayedCall(200, () => {
      this.moveInSteps(directionIndex, steps - 1);
    });
  }

  stopMovement() {
    this.movementStop = true;

    if (this.timer) {
      this.timer.remove(false);
      this.timer = undefined;
    }

    if (this.againTimer) {
      this.againTimer.remove(false);
      this.againTimer = undefined;
    }
  }

  private getRandomDirection() {
    return Phaser.Math.Between(0, 3);
  }

  private getRandomStep() {
    return Phaser.Math.Between(1, 5);
  }
}
