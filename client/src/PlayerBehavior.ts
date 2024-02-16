import { Player } from "./Player";
import { PlayerMovements } from "./PlayerMovements";
import { Direction } from "./Direction";
import { ItemMovements } from "./ItemMovements";
import { DEPTH, ImageManagement } from "./management/ImageManagement";
import { Pokemon } from "./Pokemon";
import { WildPokemon } from "./WildPokemon";
import { ITEM_CODE } from "./Item";
import { Tilemaps } from "phaser";

export enum BEHAVIOR_STATUS {
    NONE_MODE="none",
    WALK_MODE="walk",
    RUN_MODE="run",
    RIDE_MODE="ride",
    PET_MODE="pet",
    THROW_ITEM_MODE="throw",
    CHOICE_ITEM_NEXT="choiceitemnext",
    CHOICE_ITEM_PREV="choiceitemnprev"
}

export class PlayerBehavior{
    constructor(
        private socket:any,
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
    private choiceItemIndex:number = 0;

    private playerBehaviorStatus: BEHAVIOR_STATUS = BEHAVIOR_STATUS.NONE_MODE;
    private movementKeyDeatailInfo:object;
    isBehaviorFinish:boolean = true;
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
    public isReadyBehavior():boolean{
        return this.isBehaviorFinish;
    }
    public setBehavior(keyInfo:object){
        this.isBehaviorFinish = false;
        this.playerBehaviorStatus = keyInfo['type'];
        switch(this.playerBehaviorStatus){
            case BEHAVIOR_STATUS.NONE_MODE:
                this.playerMovement.playerMovementWalkCount = 0;
                this.player.standStopAnimation(this.playerMovement.playerLastMovementDirection);
                this.socket.emit('playerBehavior',{
                    socketId:this.socket.id,
                    behavior: BEHAVIOR_STATUS.NONE_MODE,
                });
                this.isBehaviorFinish = true;
                break;
            case BEHAVIOR_STATUS.WALK_MODE:
                this.movementKeyDeatailInfo = keyInfo['movementDetail'];
                this.readyMovementWalkPlayer(this.movementKeyDeatailInfo);
                this.socket.emit('playerBehavior',{
                    socketId:this.socket.id,
                    behavior: BEHAVIOR_STATUS.WALK_MODE,
                    detail:this.movementKeyDeatailInfo,
                });
                break;
            case BEHAVIOR_STATUS.RUN_MODE:
                this.movementKeyDeatailInfo = keyInfo['movementDetail'];
                this.readyMovementRunPlayer(this.movementKeyDeatailInfo);
                this.socket.emit('playerBehavior',{
                    socketId:this.socket.id,
                    behavior: BEHAVIOR_STATUS.RUN_MODE,
                    detail:this.movementKeyDeatailInfo,
                });
                break;
            case BEHAVIOR_STATUS.THROW_ITEM_MODE:
                this.readyMovementItem(this.itemList[`${this.choiceItemIndex}`]);
                this.socket.emit('playerBehavior',{
                    socketId:this.socket.id,
                    behavior: BEHAVIOR_STATUS.THROW_ITEM_MODE,
                    detail:this.choiceItemIndex,
                });
                this.isBehaviorFinish = true;
                break;
            case BEHAVIOR_STATUS.CHOICE_ITEM_NEXT:
                this.choiceItemIndex++;
                if(this.choiceItemIndex > 3){
                    this.choiceItemIndex = 0;
                }
                this.isBehaviorFinish = true;
                break;
            case BEHAVIOR_STATUS.CHOICE_ITEM_PREV:
                this.choiceItemIndex--;
                if(this.choiceItemIndex < 0){
                    this.choiceItemIndex = 3;
                }
                this.isBehaviorFinish = true;
                break;
        }
    }
    public update(){
        if(this.playerMovement.isMovementFinish){
            this.isBehaviorFinish = true;
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
    private readyMovementWalkPlayer(movementKeyDeatailInfo:object){
        this.playerMovement.playerMovementType = this.playerBehaviorStatus;
        if(movementKeyDeatailInfo["up"]){
            if(this.playerMovement.playerMovementWalkCount % 2){
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_UP_1);
            }
            else{
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_UP_2);
            } 
        }
        if(movementKeyDeatailInfo["down"]){
            if(this.playerMovement.playerMovementWalkCount % 2){
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_DOWN_1);
            }
            else{
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_DOWN_2);
            }
        }
        if(movementKeyDeatailInfo["left"]){
            if(this.playerMovement.playerMovementWalkCount % 2){
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_LEFT_1);
            }
            else {
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_LEFT_2);
            }
        }
        if(movementKeyDeatailInfo["right"]){
            if(this.playerMovement.playerMovementWalkCount % 2){
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_RIGHT_1);
            }
            else {
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_RIGHT_2);
            }
        }
    }
    private readyMovementRunPlayer(movementKeyDeatailInfo:object){
        this.playerMovement.playerMovementType = this.playerBehaviorStatus; 
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
            if(this.playerMovement.playerMovementRunCount === 0) return 1;
            if(this.playerMovement.playerMovementRunCount === 1) return 2;  
            if(this.playerMovement.playerMovementRunCount === 2) return 3;
            if(this.playerMovement.playerMovementRunCount === 3) return 4;
            if(this.playerMovement.playerMovementRunCount === 4){
                this.playerMovement.playerMovementRunCount = 0;
            }
        }
    }
    private readyPet(){
        if(this.imageManagement.petSprite.visible){this.imageManagement.petSprite.visible = false}
        else{this.imageManagement.petSprite.visible = true}
    }
}