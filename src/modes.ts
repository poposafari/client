import { MODE } from "./enums/mode";
import { Mode } from "./mode";
import { InGameScene } from "./scenes/ingame-scene";
import { LoginFormUi } from "./ui/login-form-ui";
import { ORDER } from "./enums/order";
import { MessageFormUi } from "./ui/message-form-ui";
import { RegistrationFormUi } from "./ui/registration-form-ui";
import { ModeSet } from "./interfaces/mode";
import { apiPost } from "./utils/api";
import { WaitFormUi } from "./ui/wait-form-ui";

export class MessageMode extends Mode{
    constructor(scene:InGameScene){
        super(scene);
    }

    setup(): void {
        this.ui = this.scene.ui.getManger(MessageFormUi);
        this.ui.setMode(this);
    }

    enter(data?: any): void {
        this.ui.show(data);
    }

    exit(): void {
        this.scene.modeStack.pop();
        this.ui.clean();
    }

    order(order: ORDER, data?: any): void {
        switch(order){
            case ORDER.Finish: this.exit(); break;
        }
    }
}

export class LoginMode extends Mode{

    constructor(scene:InGameScene){
        super(scene);
    }

    setup(): void {
        this.ui = this.scene.ui.getManger(LoginFormUi);
        this.ui.setMode(this);
    }

    enter(): void {
        this.ui.show();
    }

    exit(): void {
        this.scene.modeStack.pop();
        this.ui.clean();
    }

    async order(order: ORDER, data?:any): Promise<any> {
        switch(order){
            case ORDER.Submit: return await this.submit(data);
            case ORDER.ChangeMode: return this.changeMode(data);
        }
    }
    
    private async submit(data: any): Promise<any> {
        try { return await apiPost("account/login", { "username": data[0], "password": data[1] });} 
        catch (error) { return error;}
    }

    private changeMode(val:ModeSet){
        this.manager.setMode(val.mode,val.isChain,val.data);
    }
}

export class RegistrationMode extends Mode{

    constructor(scene:InGameScene){
        super(scene);
    }

    setup(): void {
        this.ui = this.scene.ui.getManger(RegistrationFormUi);
        this.ui.setMode(this);
    }

    enter(): void {
        this.ui.show();
    }

    exit(): void {
        this.ui.clean();
    }

    order(order: ORDER, data?:any): any {
        switch(order){
            case ORDER.Submit: return this.submit();
            case ORDER.ChangeMode: return this.changeMode(data);
        }
    }
    
    private submit(){
        return 0;
    }

    private changeMode(val:ModeSet){
        this.manager.setMode(val.mode,val.isChain,val.data);
    }
}

export class WaitMode extends Mode{
    constructor(scene:InGameScene){
        super(scene);
    }

    setup(): void {
        this.ui = this.scene.ui.getManger(WaitFormUi);
        this.ui.setup();
    }

    enter(data?: any): void {
        this.ui.show();
    }

    exit(): void {
        this.ui.clean();
    }

    order(order: ORDER): void {
        
    }
}


// export class TitleMode extends Mode{
//     constructor(scene:InGameScene){
//         super(scene);
//     }

//     setup(): void {
//         this.ui = new TitleFormUi(this.scene);
//         this.ui.setup();
//     }

//     enter(data:any): void{
//         this.ui.show();
//     }

//     exit(): void{
//         this.ui.clean();
//     }

//     order(order: ORDER): void {
        
//     }
// }


// export class ClosetMode extends Mode{

//     constructor(scene:InGameScene){
//         super(scene);

//         this.modeManager = ServiceLocator.get<ModeManager>('mode-manager');
//         this.messageFormUi = this.scene.ui.getManger(MessageFormUi);
//         this.closetFormUi = this.scene.ui.getManger(ClosetFormUi);

//         this.whitelistkeyboard=[];
//     }

//     enter(data?: any): void {
//         this.closetFormUi.show();
//     }

//     exit(): void {
//         this.closetFormUi.clean();
//     }

//     actionInput(key: KEYBOARD): void {
        
//     }
// }

// export class TutorialMode extends Mode{
//     private messageFormUi!: MessageFormUi;
//     private closetFormUi!: ClosetFormUi;
//     private modeManager!: ModeManager;

//     constructor(scene:InGameScene){
//         super(scene);

//         this.modeManager = ServiceLocator.get<ModeManager>('mode-manager');
//         this.messageFormUi = this.scene.ui.getManger(MessageFormUi);
//         this.closetFormUi = this.scene.ui.getManger(ClosetFormUi);
        
//         this.whitelistkeyboard=[];
//     }

//     enter(data?: any): void {
//         this.modeManager.setMode(MODE.MESSAGE,true,[i18next.t("message:welcome1"),i18next.t("message:welcome2"),i18next.t("message:question1")]);
//     }

//     exit(): void {

//     }

//     actionInput(key: KEYBOARD): void {
        
//     }
// }