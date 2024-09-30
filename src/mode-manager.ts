import { MODE } from "./enums/mode";
import { Mode } from "./mode";
import { LoginMode, MessageMode, NewGameMode, RegistrationMode, TitleMode, WaitMode } from "./modes";
import { InGameScene } from "./scenes/ingame-scene";

export class ModeManager {
    private scene: InGameScene;
    private modeCache: Map<MODE, Mode> = new Map();

    constructor(scene: InGameScene) {
        this.scene = scene;
    }

    setMode(mode: MODE, isChain:boolean, data?: any): void {
        let target = this.getCache(mode);

        if (!target) {
            switch (mode) {
                case MODE.LOGIN: target = new LoginMode(this.scene); break;
                case MODE.REGISTRATION: target = new RegistrationMode(this.scene); break;
                case MODE.MESSAGE: target = new MessageMode(this.scene); break;
                case MODE.WAITING: target = new WaitMode(this.scene); break;
                case MODE.TITLE: target = new TitleMode(this.scene); break;
                case MODE.NEWGAME: target = new NewGameMode(this.scene); break;
                default: throw new Error("Unknown mode");
            }
            target.setup();
            this.setCache(mode, target);
        }

        if(!isChain){
            this.scene.modeStack.pop()?.exit();
        }

        this.scene.currentMode = target;
        this.scene.modeStack.push(target);
        target.enter(data);
    }

    setCache(key: MODE, value: Mode) {
        this.modeCache.set(key, value);
    }

    private getCache(mode: MODE): Mode | null {
        return this.modeCache.get(mode) || null;
    }
}
