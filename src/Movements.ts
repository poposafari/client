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
    private isChangePetMovement: boolean;
    private playerTileSizePixelsWalked:number = 0;
    private petTileSizePixelsWalked:number=0;
    private pixelsToWalkThisUpdate:number = 0;

    isPlayerPressAnyMovementKey:boolean = false;
    isPlayerPressShiftKey:boolean = false;
    playerMovementCount: number = 0;
    isKeyUpMovement:boolean = false;

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
    playerUpdate(delta:number){
        this.pet.startAnimation(this.petMovementDirection);
        if(this.isPlayerMoving()){
            this.updatePlayerPosition(delta);
        }
    }
    movePlayer(direction: Direction,keyDuration:number): void{
        if(this.isPlayerMoving())
            return;
        else{
            this.startPlayerMoving(direction);
        }
    }
    private startPlayerMoving(direction: Direction): void {
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
        this.playerMovementDirection = direction;
        this.player.startAnimation(direction);
        this.updatePlayerTilePos();
    }
    private stopPlayerMoving():void{
        this.player.stopAnimation(this.playerMovementDirection,this.isPlayerPressShiftKey,this.isPlayerPressAnyMovementKey);
        this.playerMovementDirection = Direction.NONE;
        //this.petMovementDirection = Direction.NONE;
    }
    private getPlayerDirectionType(direction: Direction):String{
        const tempString = direction.split('_',2);
        return tempString[1];
    }
    private getPlayerMovementType(direction: Direction):String{
        const tempString = direction.split('_',2);
        return tempString[0];
    }
    private isPlayerMoving(): boolean{
        return this.playerMovementDirection != Direction.NONE;
    }
    private updatePlayerTilePos(): void{
        this.player.setTilePos(this.player.getTilePos().add(this.movementDirectionVectors[this.playerMovementDirection]));
        this.pet.setTilePos(this.pet.getTilePos().add(this.movementDirectionVectors[this.petMovementDirection]));
    }
    private updatePlayerPosition(delta:number){
        if(this.isPlayerPressShiftKey){
            this.pixelsToWalkThisUpdate = this.PLAYER_SPEED*2;
        }  
        else{
            this.pixelsToWalkThisUpdate = this.PLAYER_SPEED;
        }

        if(this.willCrossTileBorderThisUpdate(this.pixelsToWalkThisUpdate)){
            this.movePlayerSprite(this.pixelsToWalkThisUpdate);
            this.movePetSprite(this.pixelsToWalkThisUpdate);
            this.stopPlayerMoving();
            this.playerMovementCount++;
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