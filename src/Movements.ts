import { Game } from "phaser";
import { Direction } from "./Direction";
import { Player } from "./Player";
import { GameScene } from "./main";

const Vector2 = Phaser.Math.Vector2;

export class Movements{
    constructor(
        private player: Player,
        private pet: Player,
        private map: Phaser.Tilemaps.Tilemap,
    ){}
    private readonly PLAYER_SPEED=2; //default 2.

    private playerMovementDirection: Direction = Direction.NONE;
    private petMovementDirection: Direction = Direction.NONE;

    private petMovementHistory: Array<String> = [];
    private playerMovementHistory: Array<String> = [];

    private isChangePetMovement: boolean = false;
    private isChangePlayerMovementDirection: boolean = false;

    private playerTileSizePixelsWalked:number = 0;
    private petTileSizePixelsWalked:number=0;
    private pixelsToWalkThisUpdate:number = 0;
    
    private isPlayerPressAnyMovementKey:boolean = false;
    private isPlayerPressShiftKey:boolean = false;

    isPlayerShortMovement:boolean = false;
    
    playerMovementCount: number = 0;
    playerRunCount: number = 0;
    playerWalkCount: number = 0;
    isPlayerMovementFinish: boolean = true;

    private movementDirectionVectors: {
        [key in Direction]?: Phaser.Math.Vector2;
      } = {
        [Direction.WALK_UP_1]: Vector2.UP,
        [Direction.WALK_UP_2]: Vector2.UP,
        [Direction.WALK_DOWN_1]: Vector2.DOWN,
        [Direction.WALK_DOWN_2]: Vector2.DOWN,
        [Direction.WALK_LEFT_1]: Vector2.LEFT,
        [Direction.WALK_LEFT_2]: Vector2.LEFT,
        [Direction.WALK_RIGHT_1]: Vector2.RIGHT,
        [Direction.WALK_RIGHT_2]: Vector2.RIGHT,
        [Direction.RUN_UP_1]: Vector2.UP,
        [Direction.RUN_UP_2]: Vector2.UP,
        [Direction.RUN_UP_3]: Vector2.UP,
        [Direction.RUN_DOWN_1]: Vector2.DOWN,
        [Direction.RUN_DOWN_2]: Vector2.DOWN,
        [Direction.RUN_DOWN_3]: Vector2.DOWN,
        [Direction.RUN_LEFT_1]: Vector2.LEFT,
        [Direction.RUN_LEFT_2]: Vector2.LEFT,
        [Direction.RUN_LEFT_3]: Vector2.LEFT,
        [Direction.RUN_RIGHT_1]: Vector2.RIGHT,
        [Direction.RUN_RIGHT_2]: Vector2.RIGHT,
        [Direction.RUN_RIGHT_3]: Vector2.RIGHT,
        [Direction.PET_DOWN] : Vector2.DOWN,
        [Direction.PET_LEFT] : Vector2.LEFT,
        [Direction.PET_RIGHT] : Vector2.RIGHT,
        [Direction.PET_UP] : Vector2.UP,
      };
    setPlayerMovementType(isPlayerPressAnyMovementKey:boolean, isPlayerPressShiftKey:boolean):void{
        this.isPlayerPressAnyMovementKey = isPlayerPressAnyMovementKey;
        this.isPlayerPressShiftKey = isPlayerPressShiftKey;
    }
    playerUpdate(){
        if(this.isChangePetMovement){
            this.pet.startAnimation(this.petMovementDirection);
            this.isChangePetMovement = false;
        }
        if(this.isPlayerMoving()){
            this.updatePlayerPosition();
        }
    }
    movePlayer(direction: Direction): void{
        if(this.isPlayerMoving())
            return;
        else{
            this.startPlayerMoving(direction);
        }
    }
    setDirectionPlayer(direction: Direction): void{
        this.playerMovementDirection = direction;
        this.player.startAnimation(this.playerMovementDirection);
        this.player.setTilePos(this.player.getTilePos().add(this.movementDirectionVectors[this.playerMovementDirection]));
        this.stopPlayerMoving();
    }
    private setPlayerMovementHistory(direction: Direction):void{
        this.playerMovementHistory.push(this.getPlayerMovementDirectionType(direction));
    }
    private getPlayerMovementHistory():Array<String>{
        return this.playerMovementHistory;
    }
    private setPetMovementHistory(direction: Direction):void{
        this.petMovementHistory.push(this.petMovementDirection);
        if(this.petMovementHistory.length > 2){
            this.petMovementHistory.shift();
        }
        if(this.petMovementHistory[0] != this.petMovementHistory[1]){
            this.isChangePetMovement = true;
        }
        else{
            this.isChangePetMovement = false;
        }
    }
    private getPetMovementHistory():Array<String>{
        return this.petMovementHistory;
    }
    private setPetMovementDirection(): void{
        if(this.player.getPosition().x - this.pet.getPosition().x > 0){
            this.petMovementDirection = Direction.PET_RIGHT;
        }
        if(this.player.getPosition().x - this.pet.getPosition().x < 0){
            this.petMovementDirection = Direction.PET_LEFT;
        }
        if(this.player.getPosition().y - this.pet.getPosition().y > 0){
            this.petMovementDirection = Direction.PET_DOWN;
        }
        if(this.player.getPosition().y - this.pet.getPosition().y < 0){
            this.petMovementDirection = Direction.PET_UP;
        }
    }
    private startPlayerMoving(direction: Direction): void {
        this.playerMovementDirection = direction;
        this.setPetMovementDirection();
        this.setPlayerMovementHistory(this.playerMovementDirection);
        this.setPetMovementHistory(this.petMovementDirection);
        this.player.startAnimation(this.playerMovementDirection);
        this.updatePlayerTilePos();
    }
    private stopPlayerMoving():void{
        this.player.stopAnimation(this.playerMovementDirection);
        this.playerMovementDirection = Direction.NONE;
    }
    private isPlayerMoving(): boolean{
        return this.playerMovementDirection != Direction.NONE;
    }
    private updatePlayerTilePos(): void{
        this.player.setTilePos(this.player.getTilePos().add(this.movementDirectionVectors[this.playerMovementDirection]));
        this.pet.setTilePos(this.pet.getTilePos().add(this.movementDirectionVectors[this.petMovementDirection]));
    }
    private getPlayerMovementType(direction: Direction):String{
        const tempString = direction.split('_',2);
        return tempString[0];
    }
    private getPlayerMovementDirectionType(direction: Direction):String{
        const tempString = direction.split('_',2);
        return tempString[1];
    }
    private setPlayerMovementSpeed(){
        if(this.getPlayerMovementType(this.playerMovementDirection) === 'run'){
            this.pixelsToWalkThisUpdate = this.PLAYER_SPEED*2;
        }
        else if(this.getPlayerMovementType(this.playerMovementDirection) === 'walk'){
            this.pixelsToWalkThisUpdate = this.PLAYER_SPEED;
        }
    }
    private updatePlayerPosition(){
        this.setPlayerMovementSpeed();
        if(this.willCrossTileBorderThisUpdate(this.pixelsToWalkThisUpdate)){
            this.movePlayerSprite(this.pixelsToWalkThisUpdate);
            this.movePetSprite(this.pixelsToWalkThisUpdate);
            if(this.getPlayerMovementType(this.playerMovementDirection) === 'walk') this.playerWalkCount++;
            if(this.getPlayerMovementType(this.playerMovementDirection) === 'run') this.playerRunCount++;
            this.playerMovementCount++;
            this.stopPlayerMoving();
        }
        else{
            this.movePlayerSprite(this.pixelsToWalkThisUpdate);
            this.movePetSprite(this.pixelsToWalkThisUpdate);
        }
    }
    private movePlayerSprite(pixelsToWalkThisUpdate:number){
        const directionVector = this.movementDirectionVectors[this.playerMovementDirection].clone();
        const playerMovementDistance = directionVector.multiply(new Vector2(pixelsToWalkThisUpdate));
        const newPlayerPos = this.player.getPosition().add(playerMovementDistance);
        this.player.setPosition(newPlayerPos);
        this.playerTileSizePixelsWalked += pixelsToWalkThisUpdate;
        this.playerTileSizePixelsWalked %= GameScene.TILE_SIZE;
    }
    private movePetSprite(pixelsToWalkThisUpdate:number){
        const directionVector = this.movementDirectionVectors[this.petMovementDirection].clone();
        const petMovementDistance = directionVector.multiply(new Vector2(pixelsToWalkThisUpdate));
        const newPetPos = this.pet.getPosition().add(petMovementDistance);
        this.pet.setPosition(newPetPos);
        this.petTileSizePixelsWalked += pixelsToWalkThisUpdate;
        this.petTileSizePixelsWalked %= GameScene.TILE_SIZE;
    }

    private willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate: number):boolean{
        return this.playerTileSizePixelsWalked+pixelsToWalkThisUpdate >= GameScene.TILE_SIZE;
    }
}