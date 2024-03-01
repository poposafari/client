import { Behavior } from "./Behavior";
import { Direction } from "./constants/Direction";
import { BEHAVIOR_STATUS, OBJECT_TYPE, SPRITE_DEPTH } from "./constants/Game";
import { GridObject } from "./GridObject";
import EventManager, { EVENTS } from "./manager/EventManager";
import { Movement } from "./Movement";
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
    this.movement = new Movement(this);
  }

  private movement:Movement;
  getMovementFinishCheck():boolean{
    return this.movement.isMovementFinish;
  }
  setBehavior(behavior:BEHAVIOR_STATUS,data?:object){
    if(behavior === BEHAVIOR_STATUS.IDLE){
      super.setBehaviorStatus(BEHAVIOR_STATUS.IDLE);
      super.standStopAnimation(this.movement.lastMovementDirection);
      EventManager.triggerEvent(EVENTS.SAVE_PLAYER,
        super.getTilePos().x,
        super.getTilePos().y,
        this.pet.getTilePos().x,
        this.pet.getTilePos().y
      );
    }
    if(behavior === BEHAVIOR_STATUS.WALK){
      super.setBehaviorStatus(BEHAVIOR_STATUS.WALK);
      this.movement.ready(this.movement.setWalkDirection(data));
      EventManager.triggerEvent(EVENTS.MOVEMENT_PLAYER,this.movement.setWalkDirection(data));
    }
    if(behavior === BEHAVIOR_STATUS.RUN){
      super.setBehaviorStatus(BEHAVIOR_STATUS.RUN);
      this.movement.ready(this.movement.setRunDirection(data));
      EventManager.triggerEvent(EVENTS.MOVEMENT_PLAYER,this.movement.setRunDirection(data));  
    }
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
