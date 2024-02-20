import { Behavior } from "./Behavior";
import { OBJECT_TYPE, SPRITE_DEPTH } from "./constants/Game";
import { GridObject } from "./GridObject";
import { Pokemon } from "./Pokemon";

export class Player extends GridObject {
  constructor(
    index: string,
    sprite: Phaser.GameObjects.Sprite,
    tilePos: Phaser.Math.Vector2,
    private nickname: Phaser.GameObjects.Text,
    private pet: Pokemon,
  ) {
    super(index,sprite,tilePos);
  }

  setNicknamePosition(position: Phaser.Math.Vector2) {
    this.nickname.setOrigin(0.5, 0.5);
    this.nickname.setX(position.x);
    this.nickname.setY(position.y - 60);
  }
  getNickname(): object {
    return this.nickname.data;
  }
  //operandA: Player, operandB: Pet
  setDepthPlayerAndPet(playerDepth: SPRITE_DEPTH, petDepth: SPRITE_DEPTH): void {
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
