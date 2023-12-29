import { GridObject } from "./GridObject";

export class Pet extends GridObject{
  constructor(
    sprite: Phaser.GameObjects.Sprite,
    tilePos: Phaser.Math.Vector2
  ){
    super(sprite,tilePos);
  }
}