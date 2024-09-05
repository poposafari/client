import { MODE } from "./enums/mode";
import { Mode } from "./mode";
import { LoginMode, MessageMode, RegistrationMode, SubmitMode } from "./modes";
import { InGameScene } from "./scenes/ingame-scene";

export class ModeManager{
    private currentMode: Mode | null = null;
    private scene: InGameScene;

    constructor(scene: InGameScene) {
        this.scene = scene;
    }

    setMode(mode: MODE, data?: any): void {
        if (this.currentMode) {
            this.currentMode.exit();
        }

        switch (mode) {
            case MODE.LOGIN:
                this.currentMode = new LoginMode(this.scene);
                break;
            case MODE.REGISTRATION:
                this.currentMode = new RegistrationMode(this.scene);
                break;
            case MODE.SUBMIT:
                this.currentMode = new SubmitMode(this.scene,data);
                break;
            case MODE.MESSAGE:
                this.currentMode = new MessageMode(this.scene);
                break;
            case MODE.OVERWORLD:
                this.currentMode = new MessageMode(this.scene);
                break;
        }

        if (this.currentMode) {
            this.currentMode.enter();
        }
    }
    
}