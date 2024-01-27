import { GridObject } from "./GridObject";

export class Pokemon extends GridObject{
  constructor(
    sprite: Phaser.GameObjects.Sprite,
    tilePos: Phaser.Math.Vector2,
  ){
    super(sprite,tilePos);
  }
  setVisible(type:boolean){
    super.setHide(type);
  }
}