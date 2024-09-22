import { MODE } from "./enums/mode";
import { Mode } from "./mode";
import { LoginMode, RegistrationMode } from "./modes";
import { InGameScene } from "./scenes/ingame-scene";

export class ModeManager {
    private scene: InGameScene;
    private modeCache: Map<MODE, Mode> = new Map();

    constructor(scene: InGameScene) {
        this.scene = scene;
    }

    setMode(mode: MODE, data?: any): void {
        let target = this.getCache(mode);

        if (!target) {
            switch (mode) {
                case MODE.LOGIN: target = new LoginMode(this.scene); break;
                case MODE.REGISTRATION: target = new RegistrationMode(this.scene); break;
                default: throw new Error("Unknown mode");
            }
            target.setup();
            this.setCache(mode, target);
        }

        this.scene.currentMode = target;
        target.enter(data);
    }

    setCache(key: MODE, value: Mode) {
        this.modeCache.set(key, value);
    }

    private getCache(mode: MODE): Mode | null {
        return this.modeCache.get(mode) || null;
    }
}
