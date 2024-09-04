import { Mode } from "./mode";
import { ModeManager } from "./mode-manager";
import { InGameScene } from "./scenes/ingame-scene";
import { LoginFormUi } from "./ui/login-form-ui";
import { RegistrationFormUi } from "./ui/registration-form-ui";

export class LoginMode extends Mode{
    private loginFormUi: LoginFormUi;

    constructor(scene:InGameScene){
        super(scene);
        this.loginFormUi = scene.ui.getManger(LoginFormUi);
    }

    enter(): void {
        console.log('Login Mode.');
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
        console.log('Registeration Mode');
    }

    exit(): void {
        
    }
}

export class OverworldMode extends Mode{
    enter(): void {
        
    }

    exit(): void {
        
    }
}