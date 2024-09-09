import { KEYBOARD } from "./enums/keyboard";
import { Mode } from "./mode";
import { InGameScene } from "./scenes/ingame-scene";
import { LoginFormUi } from "./ui/login-form-ui";
import { MessageFormUi } from "./ui/message-form-ui";
import { RegistrationFormUi } from "./ui/registration-form-ui";

export class LoginMode extends Mode{
    private loginFormUi: LoginFormUi;

    constructor(scene:InGameScene){
        super(scene);
        this.loginFormUi = scene.ui.getManger(LoginFormUi);
        this.whitelistkeyboard = [];
    }

    enter(): void {
        this.loginFormUi.show();
        this.disableInput();
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
        this.disableInput();
    }

    exit(): void {
        this.registrationFormUi.clean();
    }

    actionInput(): void {}
}

export class MessageMode extends Mode{
    private messageFormUi: MessageFormUi;

    constructor(scene:InGameScene){
        super(scene);
        this.messageFormUi = scene.ui.getManger(MessageFormUi);
        this.whitelistkeyboard = [
            KEYBOARD.SELECT,
            KEYBOARD.CANCEL
        ];
    }

    enter(): void {
        this.messageFormUi.show("HelloHelloHelloHelloHelloHelloHello\nHelloHello");
        this.enableInput();
    }

    exit(): void {
        this.messageFormUi.clean();
    }

    actionInput(key:KEYBOARD): void {
        console.log(key);
    }
}

export class SubmitMode extends Mode{
    private data:any;

    constructor(scene:InGameScene,data?:any){
        super(scene);
        this.data = data;
        this.whitelistkeyboard = [];
    }

    enter(): void {
        if(this.data[0] === "login"){

        }else if(this.data[0] === "register"){

        }
    }

    exit(): void {
        
    }

    actionInput(): void {}
}
