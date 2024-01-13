import { Player } from "./Player";
import { PlayerMovements } from "./PlayerMovements";
import { Direction } from "./Direction";
import { ItemMovements } from "./ItemMovements";
import { ImageManagement } from "./ImageManagement";
import { Pokemon } from "./Pokemon";
import { WildPokemon } from "./WildPokemon";
import { ITEM_CODE } from "./Item";

export enum BEHAVIOR_STATUS {
    NONE_MODE="none",
    WALK_MODE="walk",
    RUN_MODE="run",
    PET_MODE="pet",
    THROW_ITEM_MODE="throwitem",
    CHOICE_ITEM_NEXT="choiceitemnext",
    CHOICE_ITEM_PREV="choiceitemnprev"
}

export class PlayerBehavior{
    constructor(
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


    public create(){
        this.pet = new Pokemon(this.imageManagement.petSprite,new Phaser.Math.Vector2(3,3));
        this.playerMovement = new PlayerMovements(
            this.player,
            this.pet,
            this.imageManagement.map,
            this.wildPokemonList
        );
        this.itemMovement = new ItemMovements(this.imageManagement,this.wildPokemonList,ITEM_CODE.NONE);
    }
    public setBehavior(movementKey:object,walk:boolean,run:boolean,pet:boolean,pokeball:boolean,choiceItemNext:boolean,choiceItemPrev:boolean){
        this.movementKeyDeatailInfo = movementKey;
        if(this.playerMovement.isMovementFinish && !walk){
            this.playerBehaviorStatus = BEHAVIOR_STATUS.NONE_MODE;
        }
        if(this.playerMovement.isMovementFinish){
            if(walk){this.playerBehaviorStatus = BEHAVIOR_STATUS.WALK_MODE;}
            if(walk && run){this.playerBehaviorStatus = BEHAVIOR_STATUS.RUN_MODE;}
            if(!walk && !run && pet){this.playerBehaviorStatus = BEHAVIOR_STATUS.PET_MODE}
            if(!walk && !run && pokeball){this.playerBehaviorStatus = BEHAVIOR_STATUS.THROW_ITEM_MODE}
            if(!walk && !run && !pet && !pokeball){this.playerBehaviorStatus = BEHAVIOR_STATUS.NONE_MODE}
            if(choiceItemNext && !choiceItemPrev && !pokeball){this.playerBehaviorStatus = BEHAVIOR_STATUS.CHOICE_ITEM_NEXT}
            if(choiceItemPrev && !choiceItemNext && !pokeball){this.playerBehaviorStatus = BEHAVIOR_STATUS.CHOICE_ITEM_PREV}
        }
    }
    public update(){
        //console.log(this.playerBehaviorStatus);
        switch(this.playerBehaviorStatus){
            case BEHAVIOR_STATUS.NONE_MODE:
                this.playerMovement.playerMovementWalkCount = 0;
                this.player.standStopAnimation(this.playerMovement.playerLastMovementDirection);
                break;
            case BEHAVIOR_STATUS.WALK_MODE:
                this.readyMovementWalkPlayer(this.movementKeyDeatailInfo);
                break;
            case BEHAVIOR_STATUS.RUN_MODE:
                this.readyMovementRunPlayer(this.movementKeyDeatailInfo);
                break;
            case BEHAVIOR_STATUS.PET_MODE:
                this.readyPet();
                break;
            case BEHAVIOR_STATUS.THROW_ITEM_MODE:
                this.readyMovementItem(this.itemList[`${this.choiceItemIndex}`]);
                break;
            case BEHAVIOR_STATUS.CHOICE_ITEM_NEXT:
                this.choiceItemIndex++;
                if(this.choiceItemIndex > 3){
                    this.choiceItemIndex = 0;
                }
                break;
            case BEHAVIOR_STATUS.CHOICE_ITEM_PREV:
                this.choiceItemIndex--;
                if(this.choiceItemIndex < 0){
                    this.choiceItemIndex = 3;
                }
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
    private readyMovementWalkPlayer(movementKeyDeatailInfo:object){
        this.playerMovement.playerMovementType = this.playerBehaviorStatus; 
        if(movementKeyDeatailInfo["up"]){
            this.imageManagement.playerSprite.setDepth(0);
            this.imageManagement.petSprite.setDepth(1);
            if(this.playerMovement.playerMovementWalkCount % 2){
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_UP_1);
            }
            else{
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_UP_2);
            } 
        }
        if(movementKeyDeatailInfo["down"]){
            this.imageManagement.playerSprite.setDepth(1);
            this.imageManagement.petSprite.setDepth(0);
            if(this.playerMovement.playerMovementWalkCount % 2){
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_DOWN_1);
            }
            else{
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_DOWN_2);
            }
        }
        if(movementKeyDeatailInfo["left"]){
            this.imageManagement.playerSprite.setDepth(1);
            this.imageManagement.petSprite.setDepth(0);
            if(this.playerMovement.playerMovementWalkCount % 2){
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_LEFT_1);
            }
            else {
                this.playerMovement.checkMovement(Direction.PLAYER_WALK_LEFT_2);
            }
        }
        if(movementKeyDeatailInfo["right"]){
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
    private readyMovementRunPlayer(movementKeyDeatailInfo:object){
        this.playerMovement.playerMovementType = this.playerBehaviorStatus; 
        if(movementKeyDeatailInfo["up"]){
            this.imageManagement.playerSprite.setDepth(0);
            this.imageManagement.petSprite.setDepth(1);
            if(this.getMovementPlayerStep() === 1) this.playerMovement.checkMovement(Direction.PLAYER_RUN_UP_1);
            if(this.getMovementPlayerStep() === 2) this.playerMovement.checkMovement(Direction.PLAYER_RUN_UP_3);
            if(this.getMovementPlayerStep() === 3) this.playerMovement.checkMovement(Direction.PLAYER_RUN_UP_2);
            if(this.getMovementPlayerStep() === 4) this.playerMovement.checkMovement(Direction.PLAYER_RUN_UP_3);  
        }
        if(movementKeyDeatailInfo["down"]){
            this.imageManagement.playerSprite.setDepth(1);
            this.imageManagement.petSprite.setDepth(0);
            if(this.getMovementPlayerStep() === 1) this.playerMovement.checkMovement(Direction.PLAYER_RUN_DOWN_1);
            if(this.getMovementPlayerStep() === 2) this.playerMovement.checkMovement(Direction.PLAYER_RUN_DOWN_3);
            if(this.getMovementPlayerStep() === 3) this.playerMovement.checkMovement(Direction.PLAYER_RUN_DOWN_2);
            if(this.getMovementPlayerStep() === 4) this.playerMovement.checkMovement(Direction.PLAYER_RUN_DOWN_3);  
        }
        if(movementKeyDeatailInfo["left"]){
            this.imageManagement.playerSprite.setDepth(1);
            this.imageManagement.petSprite.setDepth(0);
            if(this.getMovementPlayerStep() === 1) this.playerMovement.checkMovement(Direction.PLAYER_RUN_LEFT_1);
            if(this.getMovementPlayerStep() === 2) this.playerMovement.checkMovement(Direction.PLAYER_RUN_LEFT_3);
            if(this.getMovementPlayerStep() === 3) this.playerMovement.checkMovement(Direction.PLAYER_RUN_LEFT_2);
            if(this.getMovementPlayerStep() === 4) this.playerMovement.checkMovement(Direction.PLAYER_RUN_LEFT_3);  
        }
        if(movementKeyDeatailInfo["right"]){
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
    private readyPet(){
        if(this.imageManagement.petSprite.visible){this.imageManagement.petSprite.visible = false}
        else{this.imageManagement.petSprite.visible = true}
    }
}