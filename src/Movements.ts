import { Direction } from "./Direction";
import { Player } from "./Player";
import { GameScene } from "./main";

const Vector2 = Phaser.Math.Vector2;

export class Movements{
    constructor(
        private player: Player,
        private map: Phaser.Tilemaps.Tilemap,
    ){}
    private playerMovementDirection: Direction = Direction.NONE;
    private playerMovementHistory: Array<String>=[];
    private speedPixelsPerSecond: number = GameScene.TILE_SIZE*3.5;
    private playerTileSizePixelsWalked:number = 0;
    private playerMovementDirectionString:String="";
    private isPlayerChangeDirection:boolean=false;
    private isPlayerShortKey:boolean = false;
    playerMovementCount: number = 0;
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
        [Direction.RUN_DOWN_1]: Vector2.DOWN,
        [Direction.RUN_DOWN_2]: Vector2.DOWN,
        [Direction.RUN_LEFT_1]: Vector2.LEFT,
        [Direction.RUN_LEFT_2]: Vector2.LEFT,
        [Direction.RUN_RIGHT_1]: Vector2.RIGHT,
        [Direction.RUN_RIGHT_2]: Vector2.RIGHT,
      };
    playerUpdate(delta:number){
        if(this.isPlayerMoving()){
            this.updatePlayerPosition(delta);
        }
    }
    movePlayer(direction: Direction,keyDuration:number): void{
        console.log(direction+" "+keyDuration);
        if(keyDuration < 80){
            this.isPlayerShortKey = true;
        }
        else{
            this.isPlayerShortKey = false;
        }

        if(this.isPlayerMoving())
            return;
        else{
            this.startPlayerMoving(direction);
        }
    }
    private startPlayerMoving(direction: Direction): void {
        this.playerMovementDirectionString = this.getPlayerDirectionString(direction);
        this.playerMovementDirection = direction;
        this.playerMovementHistory.push(this.playerMovementDirectionString);
        if(this.playerMovementHistory.length > 2){
            this.playerMovementHistory.shift();
        }
        if(this.playerMovementHistory[0] != this.playerMovementHistory[1]){
            // this.playerMovementCount = 1;
            this.isPlayerChangeDirection = true;
        }
        else{
            this.isPlayerChangeDirection = false;
        }
        // console.log(this.isPlayerChangeDirection);
        // console.log(this.playerMovementHistory);
        this.player.startAnimation(direction);
        this.updatePlayerTilePos();
    }
    private stopPlayerMoving():void{
        this.player.stopAnimation(this.playerMovementDirection);
        this.playerMovementDirection = Direction.NONE;
    }
    private getPlayerDirectionString(str: String):String{
        const tempString = str.split('_',2);
        return tempString[1];
    }
    private isPlayerMoving(): boolean{
        return this.playerMovementDirection != Direction.NONE;
    }
    private updatePlayerTilePos(): void{
        this.player.setTilePos(this.player.getTilePos().add(this.movementDirectionVectors[this.playerMovementDirection]));
    }
    private updatePlayerPosition(delta:number){
        const deltaToSeconds = delta/1000;
        const pixelsToWalkThisUpdate = this.speedPixelsPerSecond*deltaToSeconds;
        if(this.willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate)){
            this.movePlayerSprite(pixelsToWalkThisUpdate);
            this.stopPlayerMoving();
            this.playerMovementCount++;
        }
        else{
            this.movePlayerSprite(pixelsToWalkThisUpdate);
        }
    }
    private movePlayerSprite(pixelsToWalkThisUpdate:number){
        const directionVector = this.movementDirectionVectors[this.playerMovementDirection].clone();
        const playerMovementDistance = directionVector.multiply(new Vector2(pixelsToWalkThisUpdate));
        if(this.isPlayerShortKey && this.isPlayerChangeDirection){
            playerMovementDistance.x=0;
            playerMovementDistance.y=0;
        }
        const newPlayerPos = this.player.getPosition().add(playerMovementDistance);
        this.player.setPosition(newPlayerPos);
        this.playerTileSizePixelsWalked += pixelsToWalkThisUpdate;
        this.playerTileSizePixelsWalked %= GameScene.TILE_SIZE;

    }
    private willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate: number):boolean{
        return this.playerTileSizePixelsWalked+pixelsToWalkThisUpdate >= GameScene.TILE_SIZE;
    }
}