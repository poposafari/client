import { Mode } from "./mode";
import { ModeManager } from "./mode-manager";
import { InGameScene } from "./scenes/ingame-scene";
import { LoginFormUi } from "./ui/login-form-ui";
import { RegistrationFormUi } from "./ui/registration-form-ui";

export class LoginMode extends Mode{
    private loginFormUi: LoginFormUi;
    private modeManager: ModeManager;

    constructor(modeManager: ModeManager, scene:InGameScene){
        super(scene);
        this.loginFormUi = new LoginFormUi(modeManager,scene);
        this.modeManager = modeManager;
    }

    enter(): void {
        console.log('Login Mode.');
        this.loginFormUi.setup();
        this.loginFormUi.show();
    }

    exit(): void {
        this.loginFormUi.clean();
    }
}

export class RegistrationMode extends Mode{
    private registrationFormUi: RegistrationFormUi;
    private modeManager: ModeManager;

    constructor(modeManager:ModeManager, scene:InGameScene){
        super(scene);
        this.registrationFormUi = new RegistrationFormUi(modeManager,scene);
        this.modeManager = modeManager;
    }

    enter(): void {
        console.log('Registeration Mode');
        this.registrationFormUi.setup();
        this.registrationFormUi.show();
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