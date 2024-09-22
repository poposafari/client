import { MODE } from "../enums/mode";
import { Mode } from "../mode";
import { ModeManager } from "../mode-manager";
import { UI } from "../ui/ui";
import { InputManager } from "../utils/input-manager";
import { ServiceLocator } from "../utils/service-locator";
import { BaseScene } from "./base-scene";

export class InGameScene extends BaseScene{
    public ui!: UI; 
    public modeManager!:ModeManager;
    public currentMode!:Mode;
    public inputManager!:InputManager;

    constructor(){
        super("InGameScene");
    }

    create(){
        this.ui = new UI(this);
        this.add.existing(this.ui);
        this.ui.setScale(2);

        this.modeManager = new ModeManager(this);
        this.inputManager = new InputManager(this);
        
        ServiceLocator.register('mode-manager',this.modeManager);
        ServiceLocator.register('input-manager',this.inputManager);
        
        this.modeManager.setMode(MODE.LOGIN,false);
    }
}