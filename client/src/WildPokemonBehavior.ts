import { Pokemon } from "./Pokemon";
import { WildPokemonMovements } from "./WildPokemonMovements";
import {OverworldScene} from "./OverworldScene";
import { Player } from "./Player";
import { ImageManagement } from "./ImageManagement";
import { WildPokemon } from "./WildPokemon";

export const enum WILDPOKEMON_STATUS{
    TERMINATED = 0,
    MOVEMENT = 1,
    CAUGHT = 2,
    ESCAPE = 3,
}

export class WildPokemonBehavior{
    constructor(
        private player: Player,
        private imageManagement: ImageManagement,
        private wildPokemonList: Array<WildPokemon>,
        private phaserTime: Phaser.Time.Clock,
    ){}
    create(){
        this.generateWildPokemon();
    }
    update(){
        for(let i=0;i<OverworldScene.MAX_WILDPOKEMON;i++){
            if(this.wildPokemonList[i].getMovementFinish() && this.wildPokemonList[i].getStatus() === 1){
                this.wildPokemonList[i].setHidePokemon(false);
                this.wildPokemonList[i].setRestTime();
            }
            if(this.wildPokemonList[i].getStatus() === 2){
                this.wildPokemonList[i].setHidePokemon(true);
            }
            this.wildPokemonList[i].updateMovement();
        }
    }
    private generateWildPokemon(){
        for(let i=0;i<OverworldScene.MAX_WILDPOKEMON;i++){
            const wildPokemonSprite = this.imageManagement.createPokemonSprite('007');
            this.imageManagement.createPokemonSpriteAnimation('007');
            const wildPokemon = new Pokemon(wildPokemonSprite,new Phaser.Math.Vector2(Phaser.Math.Between(1,10),Phaser.Math.Between(1,10)));
            const wildPokemonMovement = new WildPokemonMovements(i,wildPokemon,this.wildPokemonList,this.imageManagement.map,this.player);
            this.wildPokemonList.push(new WildPokemon(
                wildPokemon,
                wildPokemonMovement,
                this.phaserTime.addEvent({ delay: 1000, callback: null,loop: true }),
                WILDPOKEMON_STATUS.MOVEMENT
            ));
        }
    }
}