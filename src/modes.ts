import { Mode } from "./mode";
import { ModeManager } from "./mode-manager";
import { InGameScene } from "./scenes/ingame-scene";
import { LoginFormUi } from "./ui/login-form-ui";
import { MessageFormUi } from "./ui/message-form-ui";
import { RegistrationFormUi } from "./ui/registration-form-ui";

export class LoginMode extends Mode{
    private loginFormUi: LoginFormUi;

    constructor(scene:InGameScene){
        super(scene);
        this.loginFormUi = scene.ui.getManger(LoginFormUi);
    }

    enter(): void {
        this.loginFormUi.show();
    }

    exit(): void {
        this.loginFormUi.clean();
    }
}

export class RegistrationMode extends Mode{
    private registrationFormUi: RegistrationFormUi;

    constructor(scene:InGameScene){
        super(scene);
        this.registrationFormUi = scene.ui.getManger(RegistrationFormUi);
    }

    enter(): void {
        this.registrationFormUi.show();
    }

    exit(): void {
        this.registrationFormUi.clean();
    }
}

export class MessageMode extends Mode{
    private messageFormUi: MessageFormUi;

    constructor(scene:InGameScene){
        super(scene);
        this.messageFormUi = scene.ui.getManger(MessageFormUi);
    }

    enter(): void {
        this.messageFormUi.show("Welcome to the poposeop!s\n가나다라마바사아자차카타파하");
    }
    exit(): void {
        this.messageFormUi.clean();
    }
    
}

export class SubmitMode extends Mode{
    private data:any;

    constructor(scene:InGameScene,data?:any){
        super(scene);
        this.data = data;
    }

    enter(): void {
        if(this.data[0] === "login"){

        }else if(this.data[0] === "register"){

        }
    }

    exit(): void {
        
    }
}
