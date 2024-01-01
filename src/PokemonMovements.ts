import { Player } from "./Player";
import { Direction } from "./Direction";
import { Pokemon } from "./Pokemon";
import { GameScene } from "./Main";

const Vector2 = Phaser.Math.Vector2;

export class PokemonMovements{
    constructor(
        private pet: Pokemon,
    ){}
    private isChangeMovement:boolean;
    private movementDirection:Direction;
    private movementHistory:Array<String>=[];
    private tileSizePixelsWalked:number=0;
    private movementDirectionVectors: {
        [key in Direction]?: Phaser.Math.Vector2;
      } = {
        [Direction.POKEMON_DOWN] : Vector2.DOWN,
        [Direction.POKEMON_LEFT] : Vector2.LEFT,
        [Direction.POKEMON_RIGHT] : Vector2.RIGHT,
        [Direction.POKEMON_UP] : Vector2.UP,
    };
    update(){
        if(this.isChangeMovement){
            this.pet.startAnimation(this.movementDirection);
            this.isChangeMovement = false;
        }
    }
    setMovementHistory():void{
        this.movementHistory.push(this.movementDirection);
        if(this.movementHistory.length > 2){
            this.movementHistory.shift();
        }
        if(this.movementHistory[0] != this.movementHistory[1]){
            this.isChangeMovement = true;
        }
        else{
            this.isChangeMovement = false;  
        }
    }
    getMovementHistory():Array<String>{
        return this.movementHistory;
    }
    setMovementDirection(playerPositionX:number, playerPositionY:number): void{
        if(playerPositionX - this.pet.getPosition().x > 0){
            this.movementDirection = Direction.POKEMON_RIGHT;
        }
        if(playerPositionX - this.pet.getPosition().x < 0){
            this.movementDirection = Direction.POKEMON_LEFT;
        }
        if(playerPositionY - this.pet.getPosition().y > 0){
            this.movementDirection = Direction.POKEMON_DOWN;
        }
        if(playerPositionY - this.pet.getPosition().y < 0){
            this.movementDirection = Direction.POKEMON_UP;
        }
    }
    updateTilePosition(){
        this.pet.setTilePos(this.pet.getTilePos().add(this.movementDirectionVectors[this.movementDirection]));
    }
    moveSprite(pixelsToWalkThisUpdate:number){
        const directionVector = this.movementDirectionVectors[this.movementDirection].clone();
        const petMovementDistance = directionVector.multiply(new Vector2(pixelsToWalkThisUpdate));
        const newPetPos = this.pet.getPosition().add(petMovementDistance);
        this.pet.setPosition(newPetPos);
        this.tileSizePixelsWalked += pixelsToWalkThisUpdate;
        this.tileSizePixelsWalked %= GameScene.TILE_SIZE;
    }
}