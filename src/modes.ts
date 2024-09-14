import i18next from "i18next";
import { KEYBOARD } from "./enums/keyboard";
import { MODE } from "./enums/mode";
import { Mode } from "./mode";
import { ModeManager } from "./mode-manager";
import { InGameScene } from "./scenes/ingame-scene";
import { LoginFormUi } from "./ui/login-form-ui";
import { MessageFormUi } from "./ui/message-form-ui";
import { RegistrationFormUi } from "./ui/registration-form-ui";
import { apiPost, Axios } from "./utils/api";
import { ServiceLocator } from "./utils/service-locator";
import { TEXTURE } from "./enums/texture";
import { WaitFormUi } from "./ui/wait-form-ui";
import { TitleFormUi } from "./ui/title-form-ui";

export class LoginMode extends Mode{
    private loginFormUi: LoginFormUi;

    constructor(scene:InGameScene){
        super(scene);
        this.loginFormUi = scene.ui.getManger(LoginFormUi);
        this.whitelistkeyboard = [];
    }

    enter(): void {
        this.loginFormUi.show();
    }

    exit(): void {
        this.loginFormUi.clean();
    }

    actionInput(): void {
        console.log('??');
    }
}

export class RegistrationMode extends Mode{
    private registrationFormUi: RegistrationFormUi;

    constructor(scene:InGameScene){
        super(scene);
        this.registrationFormUi = scene.ui.getManger(RegistrationFormUi);
        this.whitelistkeyboard = [];
    }

    enter(): void {
        this.registrationFormUi.show();
    }

    exit(): void {
        this.registrationFormUi.clean();
    }

    actionInput(): void {}
}

export class MessageMode extends Mode{
    private messageFormUi: MessageFormUi;
    private loginFormUi: LoginFormUi;
    private registrationFormUi: RegistrationFormUi;

    constructor(scene:InGameScene){
        super(scene);
        this.messageFormUi = scene.ui.getManger(MessageFormUi);
        this.loginFormUi = scene.ui.getManger(LoginFormUi);
        this.registrationFormUi = scene.ui.getManger(RegistrationFormUi);
        
        this.whitelistkeyboard = [
            KEYBOARD.SELECT,
        ];
    }

    enter(data?:any): void {
        console.log(this.getModeStack("pre"));
        if(this.getModeStack("pre") instanceof LoginMode){
            this.loginFormUi.blockInputs();
        }else if(this.getModeStack("pre") instanceof RegistrationMode){
            this.registrationFormUi.blockInputs();
        }
        this.messageFormUi.show(data);
    }

    exit(): void {
        const scene = this.getScene();
        scene.modeStack.pop();
        this.messageFormUi.clean();
    }

    actionInput(key:KEYBOARD): void {
        if(key === KEYBOARD.SELECT && this.messageFormUi.getMessageStatus()){
            this.exit();
            if(this.getModeStack("top") instanceof LoginMode){
                this.loginFormUi.unblockInputs();
            }else if(this.getModeStack("top") instanceof RegistrationMode){
                this.registrationFormUi.unblockInputs();
            }
        }
    }
}

export class TitleMode extends Mode{
    private titleFormUi: TitleFormUi;
    constructor(scene:InGameScene){
        super(scene);
        this.whitelistkeyboard = [
            KEYBOARD.SELECT,
            KEYBOARD.UP,
            KEYBOARD.DOWN
        ];
        this.titleFormUi = scene.ui.getManger(TitleFormUi);
    }

    enter(data:any): void{
        this.titleFormUi.show(data);
    }

    exit(): void{
        this.titleFormUi.clean();
    }

    actionInput(key: KEYBOARD): void {
        if(key === KEYBOARD.SELECT){
            this.titleFormUi.updateMenu();
        }else if(key === KEYBOARD.UP){
            this.titleFormUi.updateChoice(true);
        }else if(key === KEYBOARD.DOWN){
            this.titleFormUi.updateChoice(false);
        }
    }
}

export class WaitMode extends Mode{
    private waitFormUi: WaitFormUi;
    private modeManager:ModeManager;
    constructor(scene:InGameScene){
        super(scene);
        this.whitelistkeyboard = [];
        this.modeManager = ServiceLocator.get<ModeManager>('mode-manager');
        this.waitFormUi = scene.ui.getManger(WaitFormUi);

    }
    enter(data?: any): void {
        this.waitFormUi.show();
    }
    exit(): void {
        this.waitFormUi.clean();
    }
    actionInput(key: KEYBOARD): void {
        
    }

    
}