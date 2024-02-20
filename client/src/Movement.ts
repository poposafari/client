import { Behavior } from "./Behavior";
import { Player } from "./Player";
import { Pokemon } from "./Pokemon";
import { Direction } from "./constants/Direction";
import { MOVEMENT_SPEED, TILE_SIZE } from "./constants/Game";
import { MapScene } from "./scene/MapScene";

const Vector2 = Phaser.Math.Vector2;

export class Movement{
    constructor(
        private owner: Player | Pokemon,
    ){}

    private movementCount:number = 0;
    private walkStep:number = 0;
    private runStep:number = 0;

    private tileSizePixelsWalked:number = 0;
    private pixelsToWalkThisUpdate:number = 0;

    private movementDirection:Direction = Direction.NONE;
    private lastMovementDirection:Direction = Direction.PLAYER_WALK_DOWN_1;

    private petMovementDirection:Direction = Direction.NONE;
    private petMovementHistory: Array<String>=[];
    private isPetMovementChange:boolean = false;

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

    getWalkStep(){
        return this.walkStep % 2;
    }
    getRunStep(){
        if(this.runStep === 0){return 1;}
        if(this.runStep === 1){return 2;}
        if(this.runStep === 2){return 3;}
        if(this.runStep === 3){return 4;}
        if(this.runStep === 4){this.runStep = 0;}
    }
    update(){
        if(this.isMoving()){this.updatePosition();}
    }
    ready(direction: Direction){
        if(this.isMoving()){return;}
        if(this.isBlockingDirection(direction)){this.owner.standStopAnimation(direction);}
        else{
            this.movementDirection = direction;
            this.owner.startAnimation(this.movementDirection);
            this.owner.setTilePos(this.owner.getTilePos().add(this.movementDirectionVectors[this.movementDirection]));
            this.pixelsToWalkThisUpdate = MOVEMENT_SPEED;
            if(this.isPlayer(this.owner)){
                if(this.owner.getPosition().x - this.owner.getPet().getPosition().x > 0){this.petMovementDirection = Direction.POKEMON_RIGHT}
                if(this.owner.getPosition().x - this.owner.getPet().getPosition().x < 0){this.petMovementDirection = Direction.POKEMON_LEFT}
                if(this.owner.getPosition().y - this.owner.getPet().getPosition().y > 0){this.petMovementDirection = Direction.POKEMON_DOWN}
                if(this.owner.getPosition().y - this.owner.getPet().getPosition().y < 0){this.petMovementDirection = Direction.POKEMON_UP}
                this.setPetMovementHistory();
                if(this.isPetMovementChange){
                    this.owner.getPet().startAnimation(this.petMovementDirection);
                    this.isPetMovementChange = false;
                }
                this.owner.getPet().setTilePos(this.owner.getPet().getTilePos().add(this.movementDirectionVectors[this.petMovementDirection]));
            }
        }
    }
    private updatePosition(){
        if(this.willCrossTileBorderThisUpdate(this.pixelsToWalkThisUpdate)){
            this.moveSprite(this.pixelsToWalkThisUpdate);
            this.walkStep++;
            this.lastMovementDirection = this.movementDirection;
            this.stopMoving(); 
            Behavior.isBehaviorFinish = true;
        }
        else{
            this.moveSprite(this.pixelsToWalkThisUpdate);
        }
        
        if(this.isPlayer(this.owner)){
            this.owner.setNicknamePosition(this.owner.getPosition());

        }
    }
    private stopMoving(){
        this.owner.stopAnimation(this.movementDirection);
        this.movementDirection = Direction.NONE;

        if(this.isPlayer(this.owner)){
            this.petMovementDirection = Direction.NONE;
        }
    }
    private moveSprite(pixelsToWalkThisUpdate:number){       
        const playerDirectionVector = this.movementDirectionVectors[this.lastMovementDirection].clone();
        const playerMovementDistance = playerDirectionVector.multiply(new Vector2(pixelsToWalkThisUpdate));
        const newPlayerPos = this.owner.getPosition().add(playerMovementDistance);
        this.owner.setPosition(newPlayerPos);

        if(this.isPlayer(this.owner)){
            const petDirectionVector = this.movementDirectionVectors[this.petMovementDirection].clone();
            const petMovementDistance = petDirectionVector.multiply(new Vector2(pixelsToWalkThisUpdate));
            const newPetPos = this.owner.getPet().getPosition().add(petMovementDistance);
            this.owner.getPet().setPosition(newPetPos);
        }

        this.tileSizePixelsWalked += pixelsToWalkThisUpdate;
        this.tileSizePixelsWalked %= TILE_SIZE;
    }
    private willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate: number):boolean{
        return this.tileSizePixelsWalked+pixelsToWalkThisUpdate >= TILE_SIZE;
    }
    private setPetMovementHistory(): void{
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
    private isBlockingDirection(direction: Direction): boolean {
        this.lastMovementDirection = direction;
        Behavior.isBehaviorFinish = true;
        return this.hasBlockingTile(this.tilePosInDirection(direction));
    }
    private tilePosInDirection(direction: Direction): Phaser.Math.Vector2 {
        return this.owner
            .getTilePos()
            .add(this.movementDirectionVectors[direction]);
    }
    private hasBlockingTile(pos: Phaser.Math.Vector2): boolean {
        if (this.hasNoTile(pos)) return true;
        return MapScene.map.layers.some((layer) => {
            const tile = MapScene.map.getTileAt(pos.x, pos.y, false, layer.name);
            return tile && tile.properties.collides;
        }); 
    }
    private hasNoTile(pos: Phaser.Math.Vector2): boolean {
        return !MapScene.map.layers.some((layer) =>
            MapScene.map.hasTileAt(pos.x, pos.y, layer.name)
        );
    }
    private isPlayer(object:any):object is Player{
        return object instanceof Player;
    }
    private isMoving(){
        return this.movementDirection != Direction.NONE;
    }
}