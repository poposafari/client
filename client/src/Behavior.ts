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
    private movement:Movement = null;

    create(){
        if(this.type === OBJECT_TYPE.PLAYER){this.movement = new Movement(this.owner);}
    }
    setBehavior(behavior:string, data?: object){
        switch(behavior){
            case 'walk':
                this.movement.setWalkDirection(data);
                break;
            case 'run': 
                this.movement.setRunDirection(data);
                EventManager.triggerEvent(EVENTS.MOVEMENT_PLAYER,this.movement.getDirection());  
                break;
            case 'throw': break;
            case 'throw-prev': break;
            case 'throw-next': break;
        }
    }
    setDirectMovementType(direction:Direction){
        this.movement.ready(direction);
    }
    update(){
        this.movement.update();
    }
}