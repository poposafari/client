import {ImageManager} from "../manager/ImageManager";
import {TextManager} from "../manager/TextManager";
import WildPokemonManager from "../manager/WildPokemonManager";
import {MAX_WILD_POKEMON} from "../constants/Game";
import PlayerManager from "../manager/PlayerManager";
import {KeyControl} from "../KeyControl";

export class WildPokemonScene extends Phaser.Scene{
    constructor() {
        super({key:'WildPokemonScene'});
    }

    private im: ImageManager;
    private tm: TextManager;

    create(data:object){
        this.im = data['im'];
        this.tm = data['tm'];
        Object.keys(WildPokemonManager.getWildPokemonInfo()).forEach((id)=>{
            WildPokemonManager.createWildPokemon(this.im,this.tm,id,WildPokemonManager.getWildPokemonInfo()[id]);
        });
    }
}
