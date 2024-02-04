import { Direction } from "./Direction";
import { ImageManagement } from "./ImageManagement";
import { ITEM_CODE } from "./Item";
import { ItemMovements } from "./ItemMovements";
import { Player } from "./Player";
import { PlayerMovements } from "./PlayerMovements";
import { Pokemon } from "./Pokemon";
import { WildPokemon } from "./WildPokemon";

export enum BEHAVIOR_STATUS {
    NONE_MODE="none",
    WALK_MODE="walk",
    RUN_MODE="run",
    PET_MODE="pet",
    THROW_ITEM_MODE="throwitem",
    CHOICE_ITEM_NEXT="choiceitemnext",
    CHOICE_ITEM_PREV="choiceitemnprev"
}

export class OtherPlayerBehavior{
    constructor(
        private socket: any,
        private player: Player,
        private imageManagement: ImageManagement,
        private wildPokemonList: Array<WildPokemon>,
    ){}
    private pet:Pokemon;
    private playerMovement: PlayerMovements;
    private itemMovement: ItemMovements;
    private itemList: object = {
        0:{thrown: ITEM_CODE.POKE_BALL_THROWN,ground: ITEM_CODE.POKE_BALL_GROUND},
        1:{thrown: ITEM_CODE.GREAT_BALL_THROWN,ground: ITEM_CODE.GREAT_BALL_GROUND},
        2:{thrown: ITEM_CODE.ULTRA_BALL_THROWN,ground: ITEM_CODE.ULTRA_BALL_GROUND},
        3:{thrown: ITEM_CODE.MASTER_BALL_THROWN,ground: ITEM_CODE.MASTER_BALL_GROUND}
    };
    private playerBehaviorStatus: BEHAVIOR_STATUS = BEHAVIOR_STATUS.NONE_MODE;
    private movementKeyDeatailInfo:object;
    private choiceItemIndex:number = 0;
    private otherPlayerBehaviorInfo:object;
    public create(){
        this.pet = this.player['pet'];
        this.playerMovement = new PlayerMovements(
            this.socket,
            this.player,
            this.pet,
            this.imageManagement.map,
            this.wildPokemonList
        );
        this.itemMovement = new ItemMovements(this.imageManagement,this.wildPokemonList,ITEM_CODE.NONE);
    }
    public setBehavior(data:object){
        this.otherPlayerBehaviorInfo = data;
        if(this.otherPlayerBehaviorInfo['behavior'] === 'walk'){this.playerBehaviorStatus = BEHAVIOR_STATUS.WALK_MODE;}
        if(this.otherPlayerBehaviorInfo['behavior'] === 'run'){this.playerBehaviorStatus = BEHAVIOR_STATUS.RUN_MODE;}
        if(this.otherPlayerBehaviorInfo['behavior'] === 'none'){this.playerBehaviorStatus = BEHAVIOR_STATUS.NONE_MODE}
        if(this.otherPlayerBehaviorInfo['behavior'] === 'throwitem'){this.playerBehaviorStatus = BEHAVIOR_STATUS.THROW_ITEM_MODE}
    }
    public update(){
        switch(this.playerBehaviorStatus){
            case BEHAVIOR_STATUS.NONE_MODE:
                this.playerMovement.playerMovementWalkCount = 0;
                this.player.standStopAnimation(this.playerMovement.playerLastMovementDirection);
                break;
            case BEHAVIOR_STATUS.WALK_MODE:
                this.readyMovementWalkPlayer(this.otherPlayerBehaviorInfo['movementType']);
                break;
            case BEHAVIOR_STATUS.RUN_MODE:
                this.readyMovementRunPlayer(this.otherPlayerBehaviorInfo['movementType']);
                break;
            case BEHAVIOR_STATUS.THROW_ITEM_MODE:
                this.readyMovementItem(this.itemList[`${this.otherPlayerBehaviorInfo['choiceItem']}`]);
                break;
        }
        this.playerMovement.update();
        this.itemMovement.update();
    }
    private readyMovementItem(item:object){
        const tempString = this.playerMovement.playerLastMovementDirection.split('_');
        this.itemMovement.setReadyItem(item);
        if(tempString[2] === 'up'){
            this.itemMovement.checkMovement(Direction.ITEM_UP,this.player.getPosition(),this.player.getTilePos());
        }
        if(tempString[2] === 'down'){
            this.itemMovement.checkMovement(Direction.ITEM_DOWN,this.player.getPosition(),this.player.getTilePos());
        }
        if(tempString[2] === 'left'){
            this.itemMovement.checkMovement(Direction.ITEM_LEFT,this.player.getPosition(),this.player.getTilePos());
        }
        if(tempString[2] === 'right'){
            this.itemMovement.checkMovement(Direction.ITEM_RIGHT,this.player.getPosition(),this.player.getTilePos());
        }
    }
    private readyMovementWalkPlayer(movementKeyDeatailInfo:string){
        this.playerMovement.playerMovementType = this.otherPlayerBehaviorInfo['behavior']; 
        if(movementKeyDeatailInfo === "up"){
            this.imageManagement.playerSprite.setDepth(0);
            this.imageManagement.petSprite.setDepth(1);
            if(this.playerMovement.playerMovementWalkCount % 2){
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_UP_1);
            }
            else{
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_UP_2);
            } 
        }
        else if(movementKeyDeatailInfo === "down"){
            this.imageManagement.playerSprite.setDepth(1);
            this.imageManagement.petSprite.setDepth(0);
            if(this.playerMovement.playerMovementWalkCount % 2){
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_DOWN_1);
            }
            else{
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_DOWN_2);
            }
        }
        else if(movementKeyDeatailInfo === "left"){
            this.imageManagement.playerSprite.setDepth(1);
            this.imageManagement.petSprite.setDepth(0);
            if(this.playerMovement.playerMovementWalkCount % 2){
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_LEFT_1);
            }
            else {
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_LEFT_2);
            }
        }
        else if(movementKeyDeatailInfo === "right"){
            this.imageManagement.playerSprite.setDepth(1);
            this.imageManagement.petSprite.setDepth(0);
            if(this.playerMovement.playerMovementWalkCount % 2){
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_RIGHT_1);
            }
            else {
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_RIGHT_2);
            }
        }
    }
    private readyMovementRunPlayer(movementKeyDeatailInfo:string){
        this.playerMovement.playerMovementType = this.playerBehaviorStatus; 
        console.log(movementKeyDeatailInfo);
        if(movementKeyDeatailInfo === "up"){
            this.imageManagement.playerSprite.setDepth(0);
            this.imageManagement.petSprite.setDepth(1);
            if(this.getMovementPlayerStep() === 1) this.playerMovement.checkMovement(Direction.PLAYER_RUN_UP_1);
            if(this.getMovementPlayerStep() === 2) this.playerMovement.checkMovement(Direction.PLAYER_RUN_UP_3);
            if(this.getMovementPlayerStep() === 3) this.playerMovement.checkMovement(Direction.PLAYER_RUN_UP_2);
            if(this.getMovementPlayerStep() === 4) this.playerMovement.checkMovement(Direction.PLAYER_RUN_UP_3);  
        }
        else if(movementKeyDeatailInfo === "down"){
            this.imageManagement.playerSprite.setDepth(1);
            this.imageManagement.petSprite.setDepth(0);
            if(this.getMovementPlayerStep() === 1) this.playerMovement.checkMovement(Direction.PLAYER_RUN_DOWN_1);
            if(this.getMovementPlayerStep() === 2) this.playerMovement.checkMovement(Direction.PLAYER_RUN_DOWN_3);
            if(this.getMovementPlayerStep() === 3) this.playerMovement.checkMovement(Direction.PLAYER_RUN_DOWN_2);
            if(this.getMovementPlayerStep() === 4) this.playerMovement.checkMovement(Direction.PLAYER_RUN_DOWN_3);  
        }
        else if(movementKeyDeatailInfo === "left"){
            this.imageManagement.playerSprite.setDepth(1);
            this.imageManagement.petSprite.setDepth(0);
            if(this.getMovementPlayerStep() === 1) this.playerMovement.checkMovement(Direction.PLAYER_RUN_LEFT_1);
            if(this.getMovementPlayerStep() === 2) this.playerMovement.checkMovement(Direction.PLAYER_RUN_LEFT_3);
            if(this.getMovementPlayerStep() === 3) this.playerMovement.checkMovement(Direction.PLAYER_RUN_LEFT_2);
            if(this.getMovementPlayerStep() === 4) this.playerMovement.checkMovement(Direction.PLAYER_RUN_LEFT_3);  
        }
        else if(movementKeyDeatailInfo === "right"){
            this.imageManagement.playerSprite.setDepth(1);
            this.imageManagement.petSprite.setDepth(0);
            if(this.getMovementPlayerStep() === 1) this.playerMovement.checkMovement(Direction.PLAYER_RUN_RIGHT_1);
            if(this.getMovementPlayerStep() === 2) this.playerMovement.checkMovement(Direction.PLAYER_RUN_RIGHT_3);
            if(this.getMovementPlayerStep() === 3) this.playerMovement.checkMovement(Direction.PLAYER_RUN_RIGHT_2);
            if(this.getMovementPlayerStep() === 4) this.playerMovement.checkMovement(Direction.PLAYER_RUN_RIGHT_3);  
        }
    }
    private getMovementPlayerStep(){
        if(this.playerBehaviorStatus == BEHAVIOR_STATUS.RUN_MODE){
            if(this.playerMovement.playerMovementRunCount === 0) return 1;
            if(this.playerMovement.playerMovementRunCount === 1) return 2;  
            if(this.playerMovement.playerMovementRunCount === 2) return 3;
            if(this.playerMovement.playerMovementRunCount === 3) return 4;
            if(this.playerMovement.playerMovementRunCount === 4){
                this.playerMovement.playerMovementRunCount = 0;
            }
        }
    }
}