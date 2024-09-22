import { InGameScene } from "../scenes/ingame-scene";

export class UI extends Phaser.GameObjects.Container{

    constructor(scene: InGameScene){
        super(scene,0,0);
    }
}