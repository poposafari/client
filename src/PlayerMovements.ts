import { Direction } from "./Direction";
import { GameScene } from "./Main";
import { Pokemon } from "./Pokemon";
import { Player } from "./Player";
import { WildPokemon } from "./WildPokemon";

const Vector2 = Phaser.Math.Vector2;

export class PlayerMovements{
    constructor(
        private player:Player,
        private pet: Pokemon,
        private map: Phaser.Tilemaps.Tilemap,
        private wildPokemonList: Array<WildPokemon>,
    ){}
    private tileSizePixelsWalked:number = 0;
    private pixelsToWalkThisUpdate:number = 0;

    private readonly PLAYER_MOVEMENT_SPEED=2; //default 2.

    private playerMovementDirection: Direction = Direction.NONE;
    playerLastMovementDirection: Direction = Direction.PLAYER_WALK_UP_1;
    playerMovementCount: number=0;
    playerMovementWalkCount: number=0;
    playerMovementRunCount: number=0;
    playerMovementType:string="";
    isMovementFinish:boolean=true;
    
    private petMovementDirection: Direction = Direction.NONE;
    private petMovementHistory: Array<String>=[];
    private isPetMovementChange: boolean = true;

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
        }
    }
    private hasBlockingWildPokemon(direction: Direction):boolean{
        for(let i =0; i<GameScene.MAX_WILDPOKEMON;i++){
            if(this.tilePosInDirection(direction).equals(this.wildPokemonList[i].getTilePos())){
                return true;
            }
        }
    }
    private isBlockingDirection(direction: Direction): boolean {
        this.playerLastMovementDirection = direction;
        return this.hasBlockingTile(this.tilePosInDirection(direction)) || this.hasBlockingWildPokemon(direction);
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
    getMovementHistory():Array<String>{
        return this.petMovementHistory;
    }
    private updatePosition(){
        this.setMovementSpeed();
        if(this.willCrossTileBorderThisUpdate(this.pixelsToWalkThisUpdate)){
            this.moveSprite(this.pixelsToWalkThisUpdate);
            this.isMovementFinish = true;
            if(this.playerMovementType === "walk") this.playerMovementWalkCount++;
            else if(this.playerMovementType === "run") this.playerMovementRunCount++;
            this.playerMovementCount++;
            this.playerLastMovementDirection = this.playerMovementDirection;
            this.stopMoving();
        }
        else{
            this.isMovementFinish = false;
            this.moveSprite(this.pixelsToWalkThisUpdate);
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
        return this.tileSizePixelsWalked+pixelsToWalkThisUpdate >= GameScene.TILE_SIZE;
    }
    private moveSprite(pixelsToWalkThisUpdate:number){
        const petDirectionVector = this.movementDirectionVectors[this.petMovementDirection].clone();
        const petMovementDistance = petDirectionVector.multiply(new Vector2(pixelsToWalkThisUpdate));
        const newPetPos = this.pet.getPosition().add(petMovementDistance);
        this.pet.setPosition(newPetPos);

        const playerDirectionVector = this.movementDirectionVectors[this.playerLastMovementDirection].clone();
        const playerMovementDistance = playerDirectionVector.multiply(new Vector2(pixelsToWalkThisUpdate));
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
        return this.playerMovementDirection != Direction.NONE;
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
    private startMoving(direction:Direction){
        this.playerMovementDirection = direction;
        this.setPetMovementDirection();
        this.setPetMovementHistory();
        this.player.startAnimation(this.playerMovementDirection);
        this.updateTilePosition();
    }
    private updateTilePosition(){
        this.player.setTilePos(this.player.getTilePos().add(this.movementDirectionVectors[this.playerMovementDirection]));
        this.pet.setTilePos(this.pet.getTilePos().add(this.movementDirectionVectors[this.petMovementDirection]));
    }
}