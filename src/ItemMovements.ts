import { Direction } from "./Direction";
import { ITEM_CODE, Item } from "./Item";
import { GameScene } from "./Main";
import { Pokemon } from "./Pokemon";
import { ImageManagement } from "./ImageManagement";
import { WildPokemon } from "./WildPokemon";
import { WILDPOKEMON_STATUS } from "./WildPokemonBehavior";

const Vector2 = Phaser.Math.Vector2;

export class ItemMovements{
    constructor(
        private imageManagement: ImageManagement,
        private wildPokemonList: Array<WildPokemon>,
        private itemCode: ITEM_CODE,
    ){}
    private readonly THROW_SPEED = 8;
    private readonly THROW_RANGE = 8;
    private itemThrowSprite: Phaser.GameObjects.Sprite;
    private itemGroundSprite: Phaser.GameObjects.Sprite;
    private item:Item;
    private item_thrown:ITEM_CODE;
    private item_ground:ITEM_CODE;
    private playerPosition:Phaser.Math.Vector2;
    private playerTilePosition:Phaser.Math.Vector2;
    private movementDirection: Direction = Direction.NONE;
    lastMovementDirection:Direction = Direction.ITEM_UP;
    private tileSizePixelsWalked:number = 0;
    private pixelsToWalkThisUpdate:number = 0;
    isMovementFinish:boolean=true;
    throwItemCount:number = 0;

    private movementDirectionVectors: {
        [key in Direction]?: Phaser.Math.Vector2;
      } = {
        [Direction.ITEM_UP]: Vector2.UP,
        [Direction.ITEM_DOWN]: Vector2.DOWN,
        [Direction.ITEM_LEFT]: Vector2.LEFT,
        [Direction.ITEM_RIGHT]: Vector2.RIGHT,
    };
    
    update(){
        if(this.isMoving()){this.updatePosition();}
    }
    setReadyItem(item_obj:object){
        this.item_thrown = item_obj["thrown"];
        this.item_ground = item_obj["ground"];
    }
    checkMovement(direction: Direction,playerPosition:Phaser.Math.Vector2,playerTilePosition:Phaser.Math.Vector2){
        if(this.isMoving()) {
            return;
        }
        else{
            this.playerPosition = playerPosition;
            this.playerTilePosition = playerTilePosition;
            this.startMoving(direction);
        }
    }
    private updatePosition(){
        this.setMovementSpeed();
        if(this.willCrossTileBorderThisUpdate(this.pixelsToWalkThisUpdate)){
            this.moveSprite(this.pixelsToWalkThisUpdate);
            this.isMovementFinish = true;
            this.throwItemCount++;
            this.lastMovementDirection = this.movementDirection;
            this.movementDirection = Direction.NONE;
            this.itemThrowSprite.destroy();
        }
        else{
            this.isMovementFinish = false;
            this.moveSprite(this.pixelsToWalkThisUpdate);
        }
    }
    private setMovementSpeed(){
        this.pixelsToWalkThisUpdate = this.THROW_SPEED;
    }
    private stopMoving(){
        this.item.stopAnimation(this.movementDirection);
        this.movementDirection = Direction.NONE;
    }
    private willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate: number):boolean{
        return this.tileSizePixelsWalked+pixelsToWalkThisUpdate >= GameScene.TILE_SIZE*this.THROW_RANGE;
    }
    private hasBlockingWildPokemon():boolean{
        for(let i =0;i<GameScene.MAX_WILDPOKEMON;i++){
            if(this.item.getTilePos().equals(this.wildPokemonList[i].getTilePos())){
                this.isMovementFinish = true;
                this.throwItemCount++;
                this.lastMovementDirection = this.movementDirection;
                this.movementDirection = Direction.NONE;
                this.itemThrowSprite.destroy();

                this.itemGroundSprite = this.imageManagement.createItemSprite(this.item_ground);
                this.item = new Item(this.itemGroundSprite,this.wildPokemonList[i].getTilePos());

                this.wildPokemonList[i].setStatus(WILDPOKEMON_STATUS.CAUGHT);
                console.log('conflict!!');
                return true;
            }
        }
    }
    private moveSprite(pixelsToWalkThisUpdate:number){
        const directionVector = this.movementDirectionVectors[this.movementDirection].clone();
        const playerMovementDistance = directionVector.multiply(new Vector2(pixelsToWalkThisUpdate));
        const newPlayerPos = this.item.getPosition().add(playerMovementDistance);
        this.item.setPosition(newPlayerPos);
        this.tileSizePixelsWalked += pixelsToWalkThisUpdate;
        const targetStr = (this.tileSizePixelsWalked / GameScene.TILE_SIZE);
        if(targetStr.toString().length === 1){
            this.item.setTilePos(this.item.getTilePos().add(this.movementDirectionVectors[this.movementDirection]));
            console.log(this.item.getTilePos());
            if(this.hasBlockingWildPokemon()){
                
                return true;
            }
        }
        this.tileSizePixelsWalked %= (GameScene.TILE_SIZE*this.THROW_RANGE);
    }
    private isMoving(){
        return this.movementDirection != Direction.NONE;
    }
    private startMoving(direction:Direction){
        this.itemThrowSprite = this.imageManagement.createItemSprite(this.item_thrown);
        this.item = new Item(this.itemThrowSprite,this.playerTilePosition);
        this.item.setPosition(this.playerPosition);
        this.movementDirection = direction;
        this.item.startAnimation(this.movementDirection);
        this.updateTilePosition();
    }
    private updateTilePosition(){
        this.item.setTilePos(this.item.getTilePos().add(this.movementDirectionVectors[this.movementDirection]));
    }
}