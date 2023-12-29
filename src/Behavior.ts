import { Player } from "./Player";
import { PlayerMovements } from "./PlayerMovements";
import { Direction } from "./Direction";

export enum BEHAVIOR_STATUS {
    NONE_MODE="none",
    WALK_MODE="walk",
    RUN_MODE="run",
    PET_MODE="pet",
    POKEBALL_MODE="pokeball",
}

export class Behavior{
    constructor(
        private player: Player,
        private playerMovement: PlayerMovements
    ){}
    private playerBehaviorStatus: BEHAVIOR_STATUS = BEHAVIOR_STATUS.NONE_MODE;
    private movementKeyDeatailInfo:object;

    public setBehavior(movementKey:object,walk:boolean,run:boolean,pet:boolean,pokeball:boolean){
        this.movementKeyDeatailInfo = movementKey;
        
        if(!walk && this.playerMovement.isMovementFinish){this.playerBehaviorStatus = BEHAVIOR_STATUS.NONE_MODE;}
        if(walk) {this.playerBehaviorStatus = BEHAVIOR_STATUS.WALK_MODE;}
        if(walk && run) {this.playerBehaviorStatus = BEHAVIOR_STATUS.RUN_MODE;}
        if(!(walk && run) && pokeball) {this.playerBehaviorStatus = BEHAVIOR_STATUS.POKEBALL_MODE;}
        if(!(walk && run) && pet) {this.playerBehaviorStatus = BEHAVIOR_STATUS.PET_MODE;}
    }   
    public update(){
        console.log(this.playerBehaviorStatus);
        switch(this.playerBehaviorStatus){
            case BEHAVIOR_STATUS.NONE_MODE:
                this.playerMovement.movementWalkCount = 0;
                this.player.standStopAnimation(this.playerMovement.lastPlayerMovementDirection);
                break;
            case BEHAVIOR_STATUS.WALK_MODE:
                this.readyMovementWalkPlayer(this.movementKeyDeatailInfo);
                break;
            case BEHAVIOR_STATUS.RUN_MODE:
                this.readyMovementRunPlayer(this.movementKeyDeatailInfo);
                break;
            case BEHAVIOR_STATUS.PET_MODE:
                this.player.standStopAnimation(this.playerMovement.lastPlayerMovementDirection);
                break;
            case BEHAVIOR_STATUS.POKEBALL_MODE:
                this.player.standStopAnimation(this.playerMovement.lastPlayerMovementDirection);
                break;
        }
    }
    private readyMovementWalkPlayer(movementKeyDeatailInfo:object){
        this.playerMovement.movementType = this.playerBehaviorStatus; 
        if(movementKeyDeatailInfo["up"]){
            if(this.playerMovement.movementWalkCount % 2){
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_UP_1);
            }
            else{
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_UP_2);
            } 
        }
        if(movementKeyDeatailInfo["down"]){
            if(this.playerMovement.movementWalkCount % 2){
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_DOWN_1);
            }
            else{
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_DOWN_2);
            }
        }
        if(movementKeyDeatailInfo["left"]){
            if(this.playerMovement.movementWalkCount % 2){
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_LEFT_1);
            }
            else {
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_LEFT_2);
            }
        }
        if(movementKeyDeatailInfo["right"]){
            if(this.playerMovement.movementWalkCount % 2){
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_RIGHT_1);
            }
            else {
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_RIGHT_2);
            }
        }
    }
    private readyMovementRunPlayer(movementKeyDeatailInfo:object){
        this.playerMovement.movementType = this.playerBehaviorStatus; 
        if(movementKeyDeatailInfo["up"]){
            if(this.getMovementPlayerStep() === 1) this.playerMovement.checkMovement(Direction.PLAYER_RUN_UP_1);
            if(this.getMovementPlayerStep() === 2) this.playerMovement.checkMovement(Direction.PLAYER_RUN_UP_3);
            if(this.getMovementPlayerStep() === 3) this.playerMovement.checkMovement(Direction.PLAYER_RUN_UP_2);
            if(this.getMovementPlayerStep() === 4) this.playerMovement.checkMovement(Direction.PLAYER_RUN_UP_3);  
        }
        if(movementKeyDeatailInfo["down"]){
            if(this.getMovementPlayerStep() === 1) this.playerMovement.checkMovement(Direction.PLAYER_RUN_DOWN_1);
            if(this.getMovementPlayerStep() === 2) this.playerMovement.checkMovement(Direction.PLAYER_RUN_DOWN_3);
            if(this.getMovementPlayerStep() === 3) this.playerMovement.checkMovement(Direction.PLAYER_RUN_DOWN_2);
            if(this.getMovementPlayerStep() === 4) this.playerMovement.checkMovement(Direction.PLAYER_RUN_DOWN_3);  

        }
        if(movementKeyDeatailInfo["left"]){
            if(this.getMovementPlayerStep() === 1) this.playerMovement.checkMovement(Direction.PLAYER_RUN_LEFT_1);
            if(this.getMovementPlayerStep() === 2) this.playerMovement.checkMovement(Direction.PLAYER_RUN_LEFT_3);
            if(this.getMovementPlayerStep() === 3) this.playerMovement.checkMovement(Direction.PLAYER_RUN_LEFT_2);
            if(this.getMovementPlayerStep() === 4) this.playerMovement.checkMovement(Direction.PLAYER_RUN_LEFT_3);  

        }
        if(movementKeyDeatailInfo["right"]){
            if(this.getMovementPlayerStep() === 1) this.playerMovement.checkMovement(Direction.PLAYER_RUN_RIGHT_1);
            if(this.getMovementPlayerStep() === 2) this.playerMovement.checkMovement(Direction.PLAYER_RUN_RIGHT_3);
            if(this.getMovementPlayerStep() === 3) this.playerMovement.checkMovement(Direction.PLAYER_RUN_RIGHT_2);
            if(this.getMovementPlayerStep() === 4) this.playerMovement.checkMovement(Direction.PLAYER_RUN_RIGHT_3);  
        }
    }
    private getMovementPlayerStep(){
        if(this.playerBehaviorStatus == BEHAVIOR_STATUS.RUN_MODE){
            if(this.playerMovement.movementRunCount === 0) return 1;
            if(this.playerMovement.movementRunCount === 1) return 2;  
            if(this.playerMovement.movementRunCount === 2) return 3;
            if(this.playerMovement.movementRunCount === 3) return 4;
            if(this.playerMovement.movementRunCount === 4){
                this.playerMovement.movementRunCount = 0;
            }
        }
    }
}