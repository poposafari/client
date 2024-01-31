import { GridObject } from "./GridObject";
import {OverworldScene} from "./OverworldScene";
import { Pokemon } from "./Pokemon";

export class Player extends GridObject{
  constructor(
    sprite: Phaser.GameObjects.Sprite,
    tilePos: Phaser.Math.Vector2,
    private nickname: Phaser.GameObjects.Text,
    private petSprite: Phaser.GameObjects.Sprite,
    private pet: Pokemon,
  ){
    super(sprite,tilePos);
  }
  setNicknamePosition(position: Phaser.Math.Vector2){
    this.nickname.setOrigin(0.5,0.5);
    this.nickname.setX(position.x);
    this.nickname.setY(position.y-65);
  }
  getNickname():object{
    return this.nickname.data;
  }
}