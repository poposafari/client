import { Direction } from "./Direction";
import { Pokemon } from "./Pokemon";
import { PokemonMovements } from "./PokemonMovements";

const MOVEMENT_STATUS=[
    Direction.POKEMON_UP,
    Direction.POKEMON_DOWN,
    Direction.POKEMON_LEFT,
    Direction.POKEMON_RIGHT,
];

export class WildPokemon{
    constructor(
        private pokemon: Pokemon,
        private pokemonMovement: PokemonMovements,
        private timeEvent: any,
    ){}
    private delayList:Array<number>=[1000,1500,2000,2500,3000,3500,4000,4500,5000];
    updateMovement(){
        this.pokemonMovement.update();
    }
    getMovementFinish(){
        return this.pokemonMovement.isMovementFinish;
    }
    setRestTime(){
        this.timeEvent.delay = this.delayList[Math.floor(Math.random() * this.delayList.length)];
        this.timeEvent.callback = this.onEvent.bind(this);
    }
    getTilePos(){
        return this.pokemon.getTilePos();
    }
    private onEvent()
    {
        this.pokemonMovement.checkMovement(MOVEMENT_STATUS[Math.floor(Math.random() * 4)]);
    }
}