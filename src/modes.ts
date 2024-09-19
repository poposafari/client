import i18next from "i18next";
import { KEYBOARD } from "./enums/keyboard";
import { MODE } from "./enums/mode";
import { Mode } from "./mode";
import { ModeManager } from "./mode-manager";
import { InGameScene } from "./scenes/ingame-scene";
import { LoginFormUi } from "./ui/login-form-ui";
import { MessageFormUi } from "./ui/message-form-ui";
import { RegistrationFormUi } from "./ui/registration-form-ui";
import { ServiceLocator } from "./utils/service-locator";
import { WaitFormUi } from "./ui/wait-form-ui";
import { TitleFormUi } from "./ui/lobby-form-ui";
import { ClosetFormUi } from "./ui/closet-form-ui";

export class LoginMode extends Mode{
    private loginFormUi!: LoginFormUi;

    constructor(scene:InGameScene){
        super(scene);
        this.whitelistkeyboard = [];
        this.loginFormUi = this.scene.ui.getManger(LoginFormUi);
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
    private registrationFormUi!: RegistrationFormUi;

    constructor(scene:InGameScene){
        super(scene);
        this.whitelistkeyboard = [];
        this.registrationFormUi = this.scene.ui.getManger(RegistrationFormUi);

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
    private messageFormUi!: MessageFormUi;
    private loginFormUi!: LoginFormUi;
    private registrationFormUi!: RegistrationFormUi;
    private queue=[];
    private currentIdx!:number;
    private modeManager!:ModeManager;

    constructor(scene:InGameScene){
        super(scene);

        this.messageFormUi = this.scene.ui.getManger(MessageFormUi);
        this.loginFormUi = this.scene.ui.getManger(LoginFormUi);
        this.registrationFormUi = this.scene.ui.getManger(RegistrationFormUi);
        this.modeManager = ServiceLocator.get<ModeManager>('mode-manager');

        this.whitelistkeyboard = [
            KEYBOARD.SELECT,
        ];
    }

    enter(data?:[]): void {
        if(data && Array.isArray(data)){
            this.queue = data;
        }
        this.currentIdx = 0;

        if(this.getModeStack("pre") instanceof LoginMode){
            this.loginFormUi.blockInputs();
        }else if(this.getModeStack("pre") instanceof RegistrationMode){
            this.registrationFormUi.blockInputs();
        }
        this.showCurrentMessage();
    }

    exit(): void {
        const scene = this.getScene();
        scene.modeStack.pop();
        this.messageFormUi.clean();
    }

    actionInput(key:KEYBOARD): void {
        if(key === KEYBOARD.SELECT && this.messageFormUi.getMessageStatus()){
            this.currentIdx++;

            if(this.currentIdx < this.queue.length){
                this.messageFormUi.clean();
                this.showCurrentMessage();
            }else{
                this.exit();
                if(this.getModeStack("top") instanceof LoginMode){
                    this.loginFormUi.unblockInputs();
                }else if(this.getModeStack("top") instanceof RegistrationMode){
                    this.registrationFormUi.unblockInputs();
                }else if(this.getModeStack("top") instanceof TutorialMode){
                    this.modeManager.setMode(MODE.CLOSET,false);
                }
            }

        }
    }

    private showCurrentMessage(){
        if(this.currentIdx < this.queue.length){
            this.messageFormUi.show(this.queue[this.currentIdx]);
        }
    }
}

export class TitleMode extends Mode{
    private titleFormUi!: TitleFormUi;
    constructor(scene:InGameScene){
        super(scene);

        this.titleFormUi = this.scene.ui.getManger(TitleFormUi);

        this.whitelistkeyboard = [
            KEYBOARD.SELECT,
            KEYBOARD.UP,
            KEYBOARD.DOWN
        ];

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
    private waitFormUi!: WaitFormUi;
    private modeManager!:ModeManager;
    constructor(scene:InGameScene){
        super(scene);

        this.modeManager = ServiceLocator.get<ModeManager>('mode-manager');
        this.waitFormUi = this.scene.ui.getManger(WaitFormUi);

        this.whitelistkeyboard = [];
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

export class ClosetMode extends Mode{
    private messageFormUi!: MessageFormUi;
    private closetFormUi!: ClosetFormUi;
    private modeManager!: ModeManager;

    constructor(scene:InGameScene){
        super(scene);

        this.modeManager = ServiceLocator.get<ModeManager>('mode-manager');
        this.messageFormUi = this.scene.ui.getManger(MessageFormUi);
        this.closetFormUi = this.scene.ui.getManger(ClosetFormUi);

        this.whitelistkeyboard=[];
    }

    enter(data?: any): void {
        this.closetFormUi.show();
    }

    exit(): void {
        this.closetFormUi.clean();
    }

    actionInput(key: KEYBOARD): void {
        
    }
}

export class TutorialMode extends Mode{
    private messageFormUi!: MessageFormUi;
    private closetFormUi!: ClosetFormUi;
    private modeManager!: ModeManager;

    constructor(scene:InGameScene){
        super(scene);

        this.modeManager = ServiceLocator.get<ModeManager>('mode-manager');
        this.messageFormUi = this.scene.ui.getManger(MessageFormUi);
        this.closetFormUi = this.scene.ui.getManger(ClosetFormUi);
        
        this.whitelistkeyboard=[];
    }

    enter(data?: any): void {
        this.modeManager.setMode(MODE.MESSAGE,true,[i18next.t("message:welcome1"),i18next.t("message:welcome2"),i18next.t("message:question1")]);
    }   

    exit(): void {
        
    }

    actionInput(key: KEYBOARD): void {
        
    }
}