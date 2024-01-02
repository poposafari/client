import { Direction } from "./Direction";
import { Pokemon } from "./Pokemon";

const POKEMON_BEHAVIOR_STATUS=[
    Direction.POKEMON_UP,
    Direction.POKEMON_DOWN,
    Direction.POKEMON_LEFT,
    Direction.POKEMON_RIGHT,
];

export class PokemonBehavior{
    constructor(
        private phaser: Phaser.Scene,
        
    ){}
    update(){

    }
}