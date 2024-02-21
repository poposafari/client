import { Movement } from "./Movement";
import { Player } from "./Player";
import { Pokemon } from "./Pokemon";
import { Direction } from "./constants/Direction";
import { BEHAVIOR_STATUS, OBJECT_TYPE } from "./constants/Game";
import EventManager, { EVENTS } from "./manager/EventManager";

export class Behavior{
    constructor(
        private type: OBJECT_TYPE,
        private owner: Player | Pokemon,
    ){
        this.create();
    }

    static isBehaviorFinish:boolean = true;

    private movement:Movement = null;

    create(){
        if(this.type === OBJECT_TYPE.PLAYER){this.movement = new Movement(this.owner);}
    }
    setBehavior(behaviorStatus:BEHAVIOR_STATUS, data?: object){
        Behavior.isBehaviorFinish = false;
        switch(behaviorStatus){
            case BEHAVIOR_STATUS.NONE:
                Behavior.isBehaviorFinish = true;
                this.movement.standStopMoving(this.movement.lastMovementDirection);
                break;
            case BEHAVIOR_STATUS.WALK:
                this.setWalkType(data);
                EventManager.triggerEvent(EVENTS.MOVEMENT_PLAYER,this.movement.getDirection());  
                break;
            case BEHAVIOR_STATUS.RUN: 
                this.setRunType(data);
                EventManager.triggerEvent(EVENTS.MOVEMENT_PLAYER,this.movement.getDirection());  
                break;
            case BEHAVIOR_STATUS.THROW: break;
            case BEHAVIOR_STATUS.THROW_PREV: break;
            case BEHAVIOR_STATUS.THROW_NEXT: break;
        }
    }
    setDirectMovementType(direction:Direction){
        this.movement.ready(direction);
    }
    setWalkType(data:object){
        if(data['up']){
            if(this.movement.getWalkStep()){this.movement.ready(Direction.WALK_UP_1)}
            else{this.movement.ready(Direction.WALK_UP_2)}
        }
        if(data['down']){
            if(this.movement.getWalkStep()){this.movement.ready(Direction.WALK_DOWN_1)}
            else{this.movement.ready(Direction.WALK_DOWN_2)}
        }
        if(data['left']){
            if(this.movement.getWalkStep()){this.movement.ready(Direction.WALK_LEFT_1)}
            else{this.movement.ready(Direction.WALK_LEFT_2)}
        }
        if(data['right']){
            if(this.movement.getWalkStep()){this.movement.ready(Direction.WALK_RIGHT_1)}
            else{this.movement.ready(Direction.WALK_RIGHT_2)}
        }
    }
    setRunType(data:object){
        if(data['up']){
            if(this.movement.getRunStep() === 1){this.movement.ready(Direction.RUN_UP_1)}
            if(this.movement.getRunStep() === 2){this.movement.ready(Direction.RUN_UP_3)}
            if(this.movement.getRunStep() === 3){this.movement.ready(Direction.RUN_UP_2)}
            if(this.movement.getRunStep() === 4){this.movement.ready(Direction.RUN_UP_3)}
        }
        if(data['down']){
            if(this.movement.getRunStep() === 1){this.movement.ready(Direction.RUN_DOWN_1)}
            if(this.movement.getRunStep() === 2){this.movement.ready(Direction.RUN_DOWN_3)}
            if(this.movement.getRunStep() === 3){this.movement.ready(Direction.RUN_DOWN_2)}
            if(this.movement.getRunStep() === 4){this.movement.ready(Direction.RUN_DOWN_3)}
        }
        if(data['left']){
            if(this.movement.getRunStep() === 1){this.movement.ready(Direction.RUN_LEFT_1)}
            if(this.movement.getRunStep() === 2){this.movement.ready(Direction.RUN_LEFT_3)}
            if(this.movement.getRunStep() === 3){this.movement.ready(Direction.RUN_LEFT_2)}
            if(this.movement.getRunStep() === 4){this.movement.ready(Direction.RUN_LEFT_3)}
        }
        if(data['right']){
            if(this.movement.getRunStep() === 1){this.movement.ready(Direction.RUN_RIGHT_1)}
            if(this.movement.getRunStep() === 2){this.movement.ready(Direction.RUN_RIGHT_3)}
            if(this.movement.getRunStep() === 3){this.movement.ready(Direction.RUN_RIGHT_2)}
            if(this.movement.getRunStep() === 4){this.movement.ready(Direction.RUN_RIGHT_3)}
        }
    }
    update(){
        this.movement.update();
    }
}