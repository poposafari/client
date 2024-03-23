import {ImageManager} from "./ImageManager";
import {TextManager} from "./TextManager";
import {Pokemon} from "../Pokemon";

class WildPokemonManager{
    constructor() {}

    private wildPokemons:object = {};

    setWildPokemonInfo(objects:object){
        this.wildPokemons = objects;
    }

    getWildPokemonInfo(){
        return this.wildPokemons;
    }

    deleteWildPokemon(idx:number){
        delete this.wildPokemons[idx];
    }

    createWildPokemon(im:ImageManager,tm:TextManager,idx:string,info:object):Pokemon{
        return new Pokemon(
            true,
            this.wildPokemons[idx]['pokedex'],
            im.createSpritePokemon(this.wildPokemons[idx]['pokedex']),
            new Phaser.Math.Vector2(info['posX'],info['posY'])
        );
    }
}

export default new WildPokemonManager();