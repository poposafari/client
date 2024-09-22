import { KEYBOARD } from "./enums/keyboard";
import { ORDER } from "./enums/order";
import { ModeManager } from "./mode-manager";
import { InGameScene } from "./scenes/ingame-scene";
import { UiManager } from "./ui/ui-manger";
import { ServiceLocator } from "./utils/service-locator";

export abstract class Mode{
    protected scene:InGameScene;
    protected ui!:UiManager;
    protected manager!:ModeManager;
    public whitelistkeyboard:KEYBOARD[]=[];

    constructor(scene:InGameScene){
        this.scene = scene;
        this.manager = ServiceLocator.get<ModeManager>('mode-manager');
    }
    abstract setup():void;
    abstract enter(data?:any):void;
    abstract exit(): void;
    abstract order(order:ORDER): void;

    getScene(){
        return this.scene;
    }
}