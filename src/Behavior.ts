import { Player } from "./Player";

export enum BEHAVIOR_STATUS {
    NONE_MODE="none",
    WALK_MODE="walk",
    RUN_MODE="run",
    PET_MODE="pet",
    POKEBALL_MODE="pokeball",
}

export class Behavior{
    constructor(
        player: Player,
    ){}
    private playerBehaviorStatus: BEHAVIOR_STATUS = BEHAVIOR_STATUS.NONE_MODE;
    private movementKeyDeatailInfo:object;

    public setBehavior(movementKey:object,walk:boolean,run:boolean,pet:boolean,pokeball:boolean){
        this.movementKeyDeatailInfo = movementKey;
        
        if(walk){this.playerBehaviorStatus = BEHAVIOR_STATUS.WALK_MODE;}
        else this.playerBehaviorStatus = BEHAVIOR_STATUS.NONE_MODE;
        if(walk && run){this.playerBehaviorStatus = BEHAVIOR_STATUS.RUN_MODE;}
        else this.playerBehaviorStatus = BEHAVIOR_STATUS.NONE_MODE;
        if(!(walk && run) && pokeball){this.playerBehaviorStatus = BEHAVIOR_STATUS.POKEBALL_MODE;}
        else this.playerBehaviorStatus = BEHAVIOR_STATUS.NONE_MODE;
        if(!(walk && run) && pet){this.playerBehaviorStatus = BEHAVIOR_STATUS.PET_MODE;}
        else this.playerBehaviorStatus = BEHAVIOR_STATUS.NONE_MODE;
    }   
    public update(){
        console.log(this.playerBehaviorStatus);
        switch(this.playerBehaviorStatus){
            case BEHAVIOR_STATUS.NONE_MODE:
                break;
            case BEHAVIOR_STATUS.WALK_MODE:
                this.readyMovementPlayer(this.movementKeyDeatailInfo);
                break;
            case BEHAVIOR_STATUS.RUN_MODE:
                break;
            case BEHAVIOR_STATUS.PET_MODE:
                break;
            case BEHAVIOR_STATUS.POKEBALL_MODE:
                break;
        }
    }
    private readyMovementPlayer(movementKeyDeatailInfo:object){
        console.log(movementKeyDeatailInfo);
    }
}