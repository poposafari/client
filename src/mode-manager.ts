import { MODE } from "./enums/mode";
import { Mode } from "./mode";
import { ClosetMode, LoginMode, MessageMode, RegistrationMode, TitleMode, WaitMode } from "./modes";
import { InGameScene } from "./scenes/ingame-scene";

export class ModeManager{
    private scene: InGameScene;

    private modeCache: Map<MODE, Mode> = new Map();

    constructor(scene: InGameScene) {
        this.scene = scene;
    }

    setMode(mode: MODE,isChain:boolean,data?: any): void {
        const newMode = this.getCacheMode(mode,data);

        if(newMode){
            if(!isChain){
                this.scene.modeStack.pop()?.exit();
            }

            this.scene.modeStack.push(newMode);
            newMode.enter(data);
        }
    }

    private getCacheMode(mode:MODE,data?:any):Mode{
        if (this.modeCache.has(mode)) {
            return this.modeCache.get(mode)!;
        }

        const newMode = this.createMode(mode, data);
        if (newMode) {
            this.modeCache.set(mode, newMode);
        }

        return newMode!;
    }

    private createMode(mode:MODE,data?:any):Mode | null{
        switch (mode) {
            case MODE.LOGIN:
                return new LoginMode(this.scene);
            case MODE.REGISTRATION:
                return new RegistrationMode(this.scene);
            case MODE.MESSAGE:
                return new MessageMode(this.scene);
            case MODE.TITLE:
                return new TitleMode(this.scene);
            case MODE.WAITING:
                return new WaitMode(this.scene);
            case MODE.CLOSET:
                return new ClosetMode(this.scene);
            default:
                return null;
        }
    }
}