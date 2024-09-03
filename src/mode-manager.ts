import { MODE } from "./enums/mode";
import { Mode } from "./mode";
import { LoginMode, RegistrationMode } from "./modes";
import { InGameScene } from "./scenes/ingame-scene";

export class ModeManager{
    private currentMode: Mode | null = null;
    private scene: InGameScene;

    constructor(scene: InGameScene) {
        this.scene = scene;
    }

    setMode(mode: MODE): void {
        if (this.currentMode) {
            this.currentMode.exit();
        }

        switch (mode) {
            case MODE.LOGIN:
                this.currentMode = new LoginMode(this,this.scene);
                break;
            case MODE.REGISTRATION:
                this.currentMode = new RegistrationMode(this,this.scene);
                break;
            // 다른 모드에 대한 처리
        }

        if (this.currentMode) {
            this.currentMode.enter();
        }
    }
    
}