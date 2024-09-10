import { KEYBOARD } from "./enums/keyboard";
import { InGameScene } from "./scenes/ingame-scene";

export abstract class Mode{
    private scene:InGameScene;
    public whitelistkeyboard:KEYBOARD[]=[];

    constructor(scene:InGameScene){
        this.scene = scene;
    }
    abstract enter(data?:any):void;
    abstract exit(): void;
    abstract actionInput(key:KEYBOARD): void;

    getScene(){
        return this.scene;
    }

    getTopModeStack(){
        return this.scene.modeStack[this.scene.modeStack.length-1];
    }
}