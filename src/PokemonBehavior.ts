import { Vector } from "matter";
import { Direction } from "./Direction";
import { Pokemon } from "./Pokemon";
import { PokemonMovements } from "./PokemonMovements";

const POKEMON_BEHAVIOR_STATUS=[
    Direction.POKEMON_UP,
    Direction.POKEMON_DOWN,
    Direction.POKEMON_LEFT,
    Direction.POKEMON_RIGHT,
    Direction.NONE,
];

export class PokemonBehavior{
    constructor(
        private phaser: Phaser.Scene,
        private map: Phaser.Tilemaps.Tilemap,
        private spriteList: Array<Phaser.GameObjects.Sprite>,
        private pokemonList: Array<Pokemon>,
        private pokemonMovementList: Array<PokemonMovements>,
    ){}
    private readonly MAX_WILDPOKEMON = 10;
    private checksum: boolean = false;
    private nextBehaviorTimeList: Array<number> = [];
    private timedEventList:Array<any>=[];
    update(){
        if(!this.checksum){
            this.generateWildPokemon();
        }
        this.readyWildPokemon();
    }
    private generateWildPokemon(){
        for(let i=0;i<this.MAX_WILDPOKEMON;i++){
            this.spriteList.push(this.phaser.add.sprite(0,0,'wild'));
            this.pokemonList.push(new Pokemon(this.spriteList[i],new Phaser.Math.Vector2(10,10)));
            this.pokemonMovementList.push(new PokemonMovements(this.pokemonList[i],this.map));
            this.nextBehaviorTimeList.push(0);
            this.timedEventList.push(this.phaser.time.addEvent({ delay: Phaser.Math.Between(1000, 8000), callback:this.onEvent,loop: true }));
        }
        this.checksum = true;
    }
    private readyWildPokemon(){
        for(let i=0;i<this.MAX_WILDPOKEMON;i++){
            if(this.pokemonMovementList[i].isMovementFinish){
                this.timedEventList[i].delay = Phaser.Math.Between(1000,5000);
                this.timedEventList[i].callback = this.onEvent.bind(this, i);
            }
        }        
    }
    private formatTime(seconds){
        let minutes = Math.floor(seconds/60);
        let partInSeconds = seconds%60;
        return `${minutes}:${partInSeconds}`;
    }
    private onEvent(index)
    {
        console.log('finish??');
        this.pokemonMovementList[index].checkMovement(POKEMON_BEHAVIOR_STATUS[Math.floor(Math.random() * 4)]);
    }
}