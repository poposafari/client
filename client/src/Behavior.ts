import { Movement } from "./Movement";
import { Player } from "./Player";
import { Pokemon } from "./Pokemon";
import { Direction } from "./constants/Direction";
import { BEHAVIOR_STATUS, OBJECT_TYPE } from "./constants/Game";

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
                break;
            case BEHAVIOR_STATUS.WALK: 
                this.setWalkType(data);
                break;
            case BEHAVIOR_STATUS.RUN: break;
            case BEHAVIOR_STATUS.THROW: break;
            case BEHAVIOR_STATUS.THROW_PREV: break;
            case BEHAVIOR_STATUS.THROW_NEXT: break;
        }
    }
    setWalkType(data:object){
        if(data['up']){
            if(this.movement.getWalkStep()){this.movement.ready(Direction.PLAYER_WALK_UP_1)}
            else{this.movement.ready(Direction.PLAYER_WALK_UP_2)}
        }
        if(data['down']){
            if(this.movement.getWalkStep()){this.movement.ready(Direction.PLAYER_WALK_DOWN_1)}
            else{this.movement.ready(Direction.PLAYER_WALK_DOWN_2)}
        }
        if(data['left']){
            if(this.movement.getWalkStep()){this.movement.ready(Direction.PLAYER_WALK_LEFT_1)}
            else{this.movement.ready(Direction.PLAYER_WALK_LEFT_2)}
        }
        if(data['right']){
            if(this.movement.getWalkStep()){this.movement.ready(Direction.PLAYER_WALK_RIGHT_1)}
            else{this.movement.ready(Direction.PLAYER_WALK_RIGHT_2)}
        }  
    }
    update(){
        this.movement.update();
    }
}