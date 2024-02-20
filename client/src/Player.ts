import { Behavior } from "./Behavior";
import { OBJECT_TYPE } from "./constants/Game";
import { GridObject } from "./GridObject";
import { DEPTH } from "./manager/ImageManager";
import { Pokemon } from "./Pokemon";

export class Player extends GridObject {
  constructor(
    sprite: Phaser.GameObjects.Sprite,
    tilePos: Phaser.Math.Vector2,
    private nickname: Phaser.GameObjects.Text,
    private pet: Pokemon,
    private type: OBJECT_TYPE,
  ) {
    super(sprite, tilePos);
  }

  setNicknamePosition(position: Phaser.Math.Vector2) {
    this.nickname.setOrigin(0.5, 0.5);
    this.nickname.setX(position.x);
    this.nickname.setY(position.y - 60);
  }
  getType():OBJECT_TYPE{
    return this.type;
  }
  getNickname(): object {
    return this.nickname.data;
  }
  //operandA: Player, operandB: Pet
  setDepthPlayerAndPet(playerDepth: DEPTH, petDepth: DEPTH): void {
    super.setDepth(playerDepth);
    this.pet.setDepth(petDepth);
  }
  getPet(){
    return this.pet;
  }
  destoryAll() {
    this.destroySprite();
    this.pet.destroySprite();
    this.nickname.destroy();
  }
}
