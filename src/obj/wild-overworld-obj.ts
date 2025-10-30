import { ANIMATION, AUDIO, DIRECTION, KEY, OBJECT, TEXTURE } from '../enums';
import i18next from '../i18n';
import { InGameScene } from '../scenes/ingame-scene';
import { WildRes } from '../types';
import { playEffectSound } from '../uis/ui';
import { MovableOverworldObj } from './movable-overworld-obj';

export class WildOverworldObj extends MovableOverworldObj {
  private data: WildRes;
  private timer?: Phaser.Time.TimerEvent;
  private againTimer?: Phaser.Time.TimerEvent;

  private readonly scale: number = 1.5;
  private readonly speed: number = 2;
  private readonly frameNumbers: number[] = [12, 0, 4, 8];
  private readonly directions: DIRECTION[] = [DIRECTION.UP, DIRECTION.DOWN, DIRECTION.RIGHT, DIRECTION.LEFT];
  private readonly keys: KEY[] = [KEY.UP, KEY.DOWN, KEY.RIGHT, KEY.LEFT];

  constructor(scene: InGameScene, map: Phaser.Tilemaps.Tilemap, data: WildRes, x: number, y: number) {
    const texture = `pokemon_overworld${data.pokedex}${data.shiny ? 's' : ''}`;
    super(scene, map, texture, x, y, i18next.t(`pokemon:${data.pokedex}.name`), OBJECT.WILD, DIRECTION.DOWN);

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
    this.setEmotion('emo_0', 'emo_0');
  }

  private moveInSteps(directionIndex: number, steps: number): void {
    if (steps <= 0) {
      this.scheduleRandomMovement();
      return;
    }

    const direction = this.directions[directionIndex];

    if (this.isBlockingDirection(direction)) {
      const newDirectionIndex = this.getRandomDirection();
      const newSteps = this.getRandomStep();
      return this.moveInSteps(newDirectionIndex, newSteps);
    }

    this.ready(direction, this.getAnimation(this.keys[directionIndex]));
    this.againTimer = this.getScene().time.delayedCall(200, () => {
      this.moveInSteps(directionIndex, steps - 1);
    });
  }

  private getAnimation(key: KEY) {
    const pokedex = this.data.pokedex;
    const shiny = this.data.shiny ? 's' : '';

    switch (key) {
      case KEY.UP:
        return `pokemon_overworld${pokedex}${shiny}_up`;
      case KEY.DOWN:
        return `pokemon_overworld${pokedex}${shiny}_down`;
      case KEY.LEFT:
        return `pokemon_overworld${pokedex}${shiny}_left`;
      case KEY.RIGHT:
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
}
