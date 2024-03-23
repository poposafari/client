import { GridObject } from "./GridObject";

export class Pokemon extends GridObject{
  constructor(
      isWild:boolean,
      index:string,
      sprite: Phaser.GameObjects.Sprite,
      tilePos: Phaser.Math.Vector2,
  ){
    super(index,sprite,tilePos);
  }
  setVisible(type:boolean){
    super.setHide(type);
  }
}