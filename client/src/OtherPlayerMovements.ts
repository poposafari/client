import { Direction } from "./Direction";
import { OverworldScene } from "./OverworldScene";
import { Player } from "./Player";
import { Pokemon } from "./Pokemon";

const Vector2 = Phaser.Math.Vector2;

export class OtherPlayerMovements{
    constructor(
        private socket:any,
        private player:Player,
        private pet: Pokemon,  
    ){}
    private tileSizePixelsWalked:number = 0;
    private pixelsToWalkThisUpdate:number = 0;

    private readonly PLAYER_MOVEMENT_SPEED=2; //default 2.

    private playerMovementDirection: Direction = Direction.NONE;
    playerLastMovementDirection: Direction = Direction.PLAYER_WALK_DOWN_1;
    private petMovementDirection: Direction = Direction.NONE;
    private petMovementHistory: Array<String>=[];
    private isPetMovementChange: boolean = true;

    playerMovementType:string="";
    isMovementFinish:boolean=true;
    playerMovementCount: number=0;
    playerMovementWalkCount: number=0;
    playerMovementRunCount: number=0;

    private movementDirectionVectors: {
        [key in Direction]?: Phaser.Math.Vector2;
      } = {
        [Direction.PLAYER_WALK_UP_1]: Vector2.UP,
        [Direction.PLAYER_WALK_UP_2]: Vector2.UP,
        [Direction.PLAYER_WALK_DOWN_1]: Vector2.DOWN,
        [Direction.PLAYER_WALK_DOWN_2]: Vector2.DOWN,
        [Direction.PLAYER_WALK_LEFT_1]: Vector2.LEFT,
        [Direction.PLAYER_WALK_LEFT_2]: Vector2.LEFT,
        [Direction.PLAYER_WALK_RIGHT_1]: Vector2.RIGHT,
        [Direction.PLAYER_WALK_RIGHT_2]: Vector2.RIGHT,
        [Direction.PLAYER_RUN_UP_1]: Vector2.UP,
        [Direction.PLAYER_RUN_UP_2]: Vector2.UP,
        [Direction.PLAYER_RUN_UP_3]: Vector2.UP,
        [Direction.PLAYER_RUN_DOWN_1]: Vector2.DOWN,
        [Direction.PLAYER_RUN_DOWN_2]: Vector2.DOWN,
        [Direction.PLAYER_RUN_DOWN_3]: Vector2.DOWN,
        [Direction.PLAYER_RUN_LEFT_1]: Vector2.LEFT,
        [Direction.PLAYER_RUN_LEFT_2]: Vector2.LEFT,
        [Direction.PLAYER_RUN_LEFT_3]: Vector2.LEFT,
        [Direction.PLAYER_RUN_RIGHT_1]: Vector2.RIGHT,
        [Direction.PLAYER_RUN_RIGHT_2]: Vector2.RIGHT,
        [Direction.PLAYER_RUN_RIGHT_3]: Vector2.RIGHT,
        [Direction.POKEMON_DOWN] : Vector2.DOWN,
        [Direction.POKEMON_LEFT] : Vector2.LEFT,
        [Direction.POKEMON_RIGHT] : Vector2.RIGHT,
        [Direction.POKEMON_UP] : Vector2.UP,
    };

    update(){
        if(this.isPetMovementChange){
            this.pet.startAnimation(this.petMovementDirection);
            this.isPetMovementChange = false;
        }
        if(this.isMoving()){
            this.updatePosition();
            this.player.setNicknamePosition(this.player.getPosition());
        }
    }
    private setMovementSpeed(){
        if(this.playerMovementType == "walk") this.pixelsToWalkThisUpdate = this.PLAYER_MOVEMENT_SPEED;
        else if(this.playerMovementType == "run") this.pixelsToWalkThisUpdate = this.PLAYER_MOVEMENT_SPEED*2;
    }
    private stopMoving(){
        this.player.stopAnimation(this.playerMovementDirection);
        this.playerMovementDirection = Direction.NONE;
        this.petMovementDirection = Direction.NONE;
    }
    private willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate: number):boolean{
        return this.tileSizePixelsWalked+pixelsToWalkThisUpdate >= OverworldScene.TILE_SIZE;
    }
    private moveSprite(pixelsToWalkThisUpdate:number){
        this.socket.on('playerMovement',(data)=>{
            this.player.setPosition(data['playerPos']);
            this.pet.setPosition(data['petPos']);
        });       
        this.tileSizePixelsWalked += pixelsToWalkThisUpdate;
        this.tileSizePixelsWalked %= OverworldScene.TILE_SIZE;
    }
    private updatePosition(){
        this.setMovementSpeed();
        if(this.willCrossTileBorderThisUpdate(this.pixelsToWalkThisUpdate)){
            this.moveSprite(this.pixelsToWalkThisUpdate);
            if(this.playerMovementType === "walk") this.playerMovementWalkCount++;
            else if(this.playerMovementType === "run") this.playerMovementRunCount++;
            this.playerMovementCount++;
            this.playerLastMovementDirection = this.playerMovementDirection;
            this.stopMoving(); 
            this.isMovementFinish = true;
        }
        else{
            this.moveSprite(this.pixelsToWalkThisUpdate);
            this.isMovementFinish = false;
        }
    }
    private isMoving(){
        return this.playerMovementDirection != Direction.NONE;
    }
    checkMovement(direction: Direction){
        this.startMoving(direction);
    }
    setPetMovementDirection(): void{
        if(this.player.getPosition().x - this.pet.getPosition().x > 0){
            this.petMovementDirection = Direction.POKEMON_RIGHT;
        }
        if(this.player.getPosition().x - this.pet.getPosition().x < 0){
            this.petMovementDirection = Direction.POKEMON_LEFT;
        }
        if(this.player.getPosition().y - this.pet.getPosition().y > 0){
            this.petMovementDirection = Direction.POKEMON_DOWN;
        }
        if(this.player.getPosition().y - this.pet.getPosition().y < 0){
            this.petMovementDirection = Direction.POKEMON_UP;
        }
    }
    setPetMovementHistory():void{
        this.petMovementHistory.push(this.petMovementDirection);
        if(this.petMovementHistory.length > 2){
            this.petMovementHistory.shift();
        }
        if(this.petMovementHistory[0] != this.petMovementHistory[1]){
            this.isPetMovementChange = true;
        }
        else{
            this.isPetMovementChange = false;  
        }
    }
    private startMoving(direction:Direction){
        this.playerMovementDirection = direction;
        this.setPetMovementDirection();
        this.setPetMovementHistory();
        this.player.startAnimation(this.playerMovementDirection);
    }
} 