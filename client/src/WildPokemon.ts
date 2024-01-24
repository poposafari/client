import { Direction } from "./Direction";
import { Pokemon } from "./Pokemon";
import { WildPokemonMovements } from "./WildPokemonMovements";
import { WILDPOKEMON_STATUS } from "./WildPokemonBehavior";

const MOVEMENT_STATUS=[
    Direction.POKEMON_UP,
    Direction.POKEMON_DOWN,
    Direction.POKEMON_LEFT,
    Direction.POKEMON_RIGHT,
];

export class WildPokemon{
    constructor(
        private pokemon: Pokemon,
        private wildPokemonMovement: WildPokemonMovements,
        private timeEvent: any,
        private status: WILDPOKEMON_STATUS,
    ){}
    private delayList:Array<number>=[1000,1500,2000,2500,3000,3500,4000,4500,5000];
    updateMovement(){
        this.wildPokemonMovement.update();
    }
    getStatus(){
        return this.status;
    }
    setHidePokemon(type: boolean){
        this.pokemon.setVisible(type);
    }
    setStatus(status: WILDPOKEMON_STATUS){
        this.status = status;
    }
    getMovementFinish(){
        return this.wildPokemonMovement.isMovementFinish;
    }
    setRestTime(){
        this.timeEvent.delay = this.delayList[Math.floor(Math.random() * this.delayList.length)];
        this.timeEvent.callback = this.onEvent.bind(this);
        this.timeEvent.paused = false; 
    }
    getTilePos(){
        return this.pokemon.getTilePos();
    }
    private onEvent()
    {
        if(this.getStatus() === 1){
            this.wildPokemonMovement.checkMovement(MOVEMENT_STATUS[Math.floor(Math.random() * 4)]);
        }
        else{
            this.timeEvent.paused = true;
        }
    }
}