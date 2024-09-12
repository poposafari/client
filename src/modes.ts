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
            console.log(this.getTopModeStack());
            if(this.getTopModeStack() instanceof LoginMode){
                this.loginFormUi.unblockInputs();
            }else if(this.getTopModeStack() instanceof RegistrationMode){
                this.registrationFormUi.unblockInputs();
            }
        }
    }
}

export class SubmitMode extends Mode{
    private data:any;
    private modeManager:ModeManager;
    private registrationFormUi:RegistrationFormUi;

    constructor(scene:InGameScene,data?:any){
        super(scene);
        this.data = data;
        this.whitelistkeyboard = [];
        this.modeManager = ServiceLocator.get<ModeManager>('mode-manager');
        this.registrationFormUi = scene.ui.getManger(RegistrationFormUi);
    }

    enter(): void {
        if(this.data[0] === "login"){
            const [username,password] = this.data[1];
            console.log(username.text,password.text);

        }else if(this.data[0] === "registration"){
            const [username,password] = this.data[1];
            apiPost("/account/register",{"username":username.text,"password":password.text})
                .then((value)=>{console.log(value);})
                .catch((value)=>{
                    if(value.status === 409){
                        const scene = this.getScene();
                        scene.modeStack.pop();
                        this.modeManager.setMode(MODE.MESSAGE,true,i18next.t("message:registrationError2"));
                        this.registrationFormUi.blockInputs();
                    }else{
                        const scene = this.getScene();
                        scene.modeStack.pop();
                        this.modeManager.setMode(MODE.MESSAGE,true,i18next.t("message:serverError"));
                        this.registrationFormUi.blockInputs();
                    }
                });
        }
    }

    exit(): void {
        
    }

    actionInput(): void {}
}

export class TitleMode extends Mode{
    constructor(scene:InGameScene){
        super(scene);
        this.whitelistkeyboard = [
            KEYBOARD.SELECT,
            KEYBOARD.UP,
            KEYBOARD.DOWN
        ];
    }

    enter(): void{
        
    }

    exit(): void{

    }

    actionInput(key: KEYBOARD): void {}
}