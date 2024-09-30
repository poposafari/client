import { InGameScene } from "../scenes/ingame-scene";
import { NewGameFormUi } from "./newgame-form-ui";
import { LoginFormUi } from "./login-form-ui";
import { MessageFormUi } from "./message-form-ui";
import { RegistrationFormUi } from "./registration-form-ui";
import { TitleFormUi } from "./title-form-ui";
import { UiManager } from "./ui-manger";
import { WaitFormUi } from "./wait-form-ui";

export class UI extends Phaser.GameObjects.Container{
    private managers:UiManager[]; 

    constructor(scene: InGameScene){
        super(scene,0,0);

        this.managers = [
            new LoginFormUi(scene),
            new RegistrationFormUi(scene),
            new MessageFormUi(scene),
            new WaitFormUi(scene),
            new TitleFormUi(scene),
            new NewGameFormUi(scene),
        ];
    }

    setup():void{
        for(const manager of this.managers){
            manager.setup();
        }
    }

    getManger<T extends UiManager>(constructor: new (...args: any[])=>T ): T{
        return this.managers.find(manager=>manager instanceof constructor) as T;
    }
}