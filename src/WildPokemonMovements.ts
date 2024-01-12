import { Direction } from "./Direction";
import { GameScene } from "./Main";
import { Player } from "./Player";
import { Pokemon } from "./Pokemon";
import { WildPokemon } from "./WildPokemon";

const Vector2 = Phaser.Math.Vector2;

export class WildPokemonMovements{
    constructor(
        private index: number,
        private pokemon: Pokemon,
        private wildPokemonList: Array<WildPokemon>,
        private map: Phaser.Tilemaps.Tilemap,
        private player: Player,
    ){}
    private tileSizePixelsWalked:number = 0;
    private pixelsToWalkThisUpdate:number = 0;

    private readonly POKEMON_MOVEMENT_SPEED = 1;

    private wildPokemonMovementDirection: Direction = Direction.NONE;
    wildPokemonLastMovementDirection: Direction = Direction.POKEMON_UP;
    isMovementFinish:boolean=true;
    isMovementChange:boolean=true;
    private wildPokemonMovementHistor: Array<String>=[];
    private movementDirectionVectors: {
        [key in Direction]?: Phaser.Math.Vector2;
      } = {
        [Direction.POKEMON_DOWN] : Vector2.DOWN,
        [Direction.POKEMON_LEFT] : Vector2.LEFT,
        [Direction.POKEMON_RIGHT] : Vector2.RIGHT,
        [Direction.POKEMON_UP] : Vector2.UP,
    };
    update(){
        if(this.isMovementChange){
            this.pokemon.startAnimation(this.wildPokemonMovementDirection);
            this.isMovementChange = false;
        }
        if(this.isMoving()){
            this.updatePosition();
        }
    }
    setMovementHistory():void{
        this.wildPokemonMovementHistor.push(this.wildPokemonMovementDirection);
        if(this.wildPokemonMovementHistor.length > 2){
            this.wildPokemonMovementHistor.shift();
        }
        if(this.wildPokemonMovementHistor[0] != this.wildPokemonMovementHistor[1]){
            this.isMovementChange = true;
        }
        else{
            this.isMovementChange = false;  
        }
    }
    private setMovementSpeed(){
        this.pixelsToWalkThisUpdate = this.POKEMON_MOVEMENT_SPEED;
    }
    private willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate: number):boolean{
        return this.tileSizePixelsWalked+pixelsToWalkThisUpdate >= GameScene.TILE_SIZE;
    }
    private moveSprite(pixelsToWalkThisUpdate:number){
        const wildPokemonDirectionVector = this.movementDirectionVectors[this.wildPokemonMovementDirection].clone();
        const wildPokemonMovementDistance = wildPokemonDirectionVector.multiply(new Vector2(pixelsToWalkThisUpdate));
        const newWildPokemonPos = this.pokemon.getPosition().add(wildPokemonMovementDistance);
        this.pokemon.setPosition(newWildPokemonPos);

        this.tileSizePixelsWalked += pixelsToWalkThisUpdate;
        this.tileSizePixelsWalked %= GameScene.TILE_SIZE;
    }
    private updatePosition(){
        this.setMovementSpeed();
        if(this.willCrossTileBorderThisUpdate(this.pixelsToWalkThisUpdate)){
            this.moveSprite(this.pixelsToWalkThisUpdate);
            this.isMovementFinish = true;
            this.wildPokemonLastMovementDirection = this.wildPokemonMovementDirection;
            this.wildPokemonMovementDirection = Direction.NONE;
        }
        else{
            this.isMovementFinish = false;
            this.moveSprite(this.pixelsToWalkThisUpdate);
        }
    }
    private stopMoving(){
        this.pokemon.stopAnimation(this.wildPokemonMovementDirection);
        this.wildPokemonMovementDirection = Direction.NONE;
    }
    private isMoving(){
        return this.wildPokemonMovementDirection != Direction.NONE;
    }
    private hasBlockingPlayer(direction: Direction):boolean{
        for(let i =0; i<GameScene.MAX_WILDPOKEMON;i++){
            if(this.tilePosInDirection(direction).equals(this.player.getTilePos())){
                return true;
            }
        }
    }
    private hasBlockingWildPokemon(direction: Direction):boolean{
        for(let i =0; i<GameScene.MAX_WILDPOKEMON;i++){
            if(i === this.index) continue;
            if(this.tilePosInDirection(direction).equals(this.wildPokemonList[i].getTilePos())){
                return true;
            }
        }
    }
    private isBlockingDirection(direction: Direction): boolean {
        this.wildPokemonMovementDirection = direction;
        return this.hasBlockingTile(this.tilePosInDirection(direction)) || this.hasBlockingPlayer(direction) || this.hasBlockingWildPokemon(direction);
    }   
    private tilePosInDirection(direction: Direction): Phaser.Math.Vector2 {
        return this.pokemon
            .getTilePos()
            .add(this.movementDirectionVectors[direction]);
    }
    private hasNoTile(pos: Phaser.Math.Vector2): boolean {
        return !this.map.layers.some((layer) =>
            this.map.hasTileAt(pos.x, pos.y, layer.name)
        );
    }
    private hasBlockingTile(pos: Phaser.Math.Vector2): boolean {
        if (this.hasNoTile(pos)) return true; //Tile이 없다면,
        return this.map.layers.some((layer) => {
            const tile = this.map.getTileAt(pos.x, pos.y, false, layer.name);
            return tile && tile.properties.collides;
        }); 
    }
    checkMovement(direction: Direction){
        if(this.isMoving()) {return;}
        if(this.isBlockingDirection(direction)){
            this.stopMoving();
        }
        else {this.startMoving(direction)}
    }
    private startMoving(direction:Direction){
        this.wildPokemonMovementDirection = direction;
        this.setMovementHistory();
        this.pokemon.startAnimation(this.wildPokemonMovementDirection);
        this.updateTilePosition();
    }
    private updateTilePosition(){
        this.pokemon.setTilePos(this.pokemon.getTilePos().add(this.movementDirectionVectors[this.wildPokemonMovementDirection]));
    }
}