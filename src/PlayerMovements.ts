import { Direction } from "./Direction";
import { GameScene } from "./Main";
import { Pokemon } from "./Pokemon";
import { PokemonMovements } from "./PokemonMovements";
import { Player } from "./Player";

const Vector2 = Phaser.Math.Vector2;

export class PlayerMovements{
    constructor(
        private player:Player,
        private pet:Pokemon,
        private petMovement: PokemonMovements,
        private map: Phaser.Tilemaps.Tilemap,
    ){}
    private readonly PLAYER_SPEED=2; //default 2.
    private movementDirection: Direction = Direction.NONE;
    lastPlayerMovementDirection: Direction = Direction.PLAYER_WALK_UP_1;
    private tileSizePixelsWalked:number = 0;
    private pixelsToWalkThisUpdate:number = 0;
    isMovementFinish:boolean=true;

    movementCount: number=0;
    movementWalkCount: number=0;
    movementRunCount: number=0;

    movementType:string="";

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
    };
    update(){
        if(this.isMoving()){this.updatePosition();}
    }
    private isBlockingDirection(direction: Direction): boolean {
        this.lastPlayerMovementDirection = direction;
        return this.hasBlockingTile(this.tilePosInDirection(direction));
    }    
    private tilePosInDirection(direction: Direction): Phaser.Math.Vector2 {
        return this.player
            .getTilePos()
            .add(this.movementDirectionVectors[direction]);
    }
    private hasBlockingTile(pos: Phaser.Math.Vector2): boolean {
        if (this.hasNoTile(pos)) return true; //Tile이 없다면,
        return this.map.layers.some((layer) => {
            const tile = this.map.getTileAt(pos.x, pos.y, false, layer.name);
            return tile && tile.properties.collides;
        }); 
    }
    private hasNoTile(pos: Phaser.Math.Vector2): boolean {
        return !this.map.layers.some((layer) =>
            this.map.hasTileAt(pos.x, pos.y, layer.name)
        );
    }
    private updatePosition(){
        this.setMovementSpeed();
        if(this.willCrossTileBorderThisUpdate(this.pixelsToWalkThisUpdate)){
            this.moveSprite(this.pixelsToWalkThisUpdate);
            this.petMovement.moveSprite(this.pixelsToWalkThisUpdate);
            this.isMovementFinish = true;
            if(this.movementType === "walk") this.movementWalkCount++;
            else if(this.movementType === "run") this.movementRunCount++;
            this.movementCount++;
            this.lastPlayerMovementDirection = this.movementDirection;
            this.stopMoving();
        }
        else{
            this.isMovementFinish = false;
            this.moveSprite(this.pixelsToWalkThisUpdate);
            this.petMovement.moveSprite(this.pixelsToWalkThisUpdate);
        }
    }
    private setMovementSpeed(){
        if(this.movementType == "walk") this.pixelsToWalkThisUpdate = this.PLAYER_SPEED;
        else if(this.movementType == "run") this.pixelsToWalkThisUpdate = this.PLAYER_SPEED*2;
    }
    private stopMoving(){
        this.player.stopAnimation(this.movementDirection);
        this.movementDirection = Direction.NONE;
    }
    private willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate: number):boolean{
        return this.tileSizePixelsWalked+pixelsToWalkThisUpdate >= GameScene.TILE_SIZE;
    }
    private moveSprite(pixelsToWalkThisUpdate:number){
        const directionVector = this.movementDirectionVectors[this.movementDirection].clone();
        const playerMovementDistance = directionVector.multiply(new Vector2(pixelsToWalkThisUpdate));
        const newPlayerPos = this.player.getPosition().add(playerMovementDistance);
        this.player.setPosition(newPlayerPos);
        this.tileSizePixelsWalked += pixelsToWalkThisUpdate;
        this.tileSizePixelsWalked %= GameScene.TILE_SIZE;
    }
    checkMovement(direction: Direction){
        if(this.isMoving()) {return;}
        if(this.isBlockingDirection(direction)){
            this.player.standStopAnimation(direction);
        }
        else {this.startMoving(direction)}
    }
    private isMoving(){
        return this.movementDirection != Direction.NONE;
    }
    private startMoving(direction:Direction){
        this.movementDirection = direction;
        this.petMovement.setMovementDirection(this.player.getPosition().x,this.player.getPosition().y);
        this.petMovement.setMovementHistory();
        this.player.startAnimation(this.movementDirection);
        this.updateTilePosition();
    }
    private updateTilePosition(){
        this.player.setTilePos(this.player.getTilePos().add(this.movementDirectionVectors[this.movementDirection]));
        this.petMovement.updateTilePosition();
    }
}