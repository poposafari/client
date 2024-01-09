import { Vector } from "matter";
import { Direction } from "./Direction";
import { Pokemon } from "./Pokemon";
import { PokemonMovements } from "./PokemonMovements";
import { GameScene } from "./Main";
import { Game } from "phaser";

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
    private checksum: boolean = false;
    private nextBehaviorTimeList: Array<number> = [];
    private timedEventList:Array<any>=[];
    private delayList:Array<number>=[1000,1500,2000,2500,3000,3500,4000,4500,5000];
    update(){
        if(!this.checksum){
            this.generateWildPokemon();
        }
        this.readyWildPokemon();
    }
    private generateWildPokemon(){
        for(let i=0;i<GameScene.MAX_WILDPOKEMON;i++){
            this.spriteList.push(this.phaser.add.sprite(0,0,"wild"));
            this.pokemonList.push(new Pokemon(this.spriteList[i],new Phaser.Math.Vector2(10,10)));
            this.pokemonMovementList.push(new PokemonMovements(this.pokemonList[i],this.map));
            this.nextBehaviorTimeList.push(0);
            this.timedEventList.push(this.phaser.time.addEvent({ delay: Phaser.Math.Between(1000, 8000), callback:this.onEvent,loop: true }));
        }
        this.checksum = true;
    }
    private readyWildPokemon(){
        for(let i=0;i<GameScene.MAX_WILDPOKEMON;i++){
            if(this.pokemonMovementList[i].isMovementFinish){
                this.timedEventList[i].delay = this.delayList[Math.floor(Math.random() * this.delayList.length)];
                this.timedEventList[i].callback = this.onEvent.bind(this, i);
            }
        }        
    }
    private onEvent(index)
    {
        this.pokemonMovementList[index].checkMovement(POKEMON_BEHAVIOR_STATUS[Math.floor(Math.random() * 4)]);
    }
}