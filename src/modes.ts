import { MODE } from "./enums/mode";
import { Mode } from "./mode";
import { InGameScene } from "./scenes/ingame-scene";
import { LoginFormUi } from "./ui/login-form-ui";
import { ORDER } from "./enums/order";
import { MessageFormUi } from "./ui/message-form-ui";
import { RegistrationFormUi } from "./ui/registration-form-ui";
import { ModeSet } from "./interfaces/mode";
import { apiGet, apiPost } from "./utils/api";
import { WaitFormUi } from "./ui/wait-form-ui";
import { TitleFormUi } from "./ui/title-form-ui";
import { newGameMsg } from "./ui/config";

export class MessageMode extends Mode{
    constructor(scene:InGameScene){
        super(scene);
    }

    setup(): void {
        this.ui = this.scene.ui.getManger(MessageFormUi);
        this.ui.setMode(this);
    }

    enter(data?: any): void {
        this.scene.getModeStack("pre")?.ui.pause(true);
        this.ui.show(data);
    }

    exit(): void {
        this.scene.getModeStack("pre")?.ui.pause(false);
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

    async order(order: ORDER, data?:any): Promise<any> {
        switch(order){
            case ORDER.Submit: return await this.submit(data);
            case ORDER.ChangeMode: return this.changeMode(data);
        }
    }
    
    private async submit(data:any){
        try { return await apiPost("account/register", { "username": data[0], "password": data[1]});} 
        catch (error) { return error;}
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

    order(order: ORDER): void {}
}

export class TitleMode extends Mode{
    constructor(scene:InGameScene){
        super(scene);
    }

    setup():void {
        this.ui = this.scene.ui.getManger(TitleFormUi);
        this.ui.setMode(this);
    }
    async enter(data?: any): Promise<void> {
        const userData = await this.getUserData();
        this.ui.show(userData);
    }

    exit(): void {
        this.ui.clean();
    }

    order(order: ORDER, data?: any) {
        switch(order){
            case ORDER.ChangeMode: this.changeMode(data); break;
        }
    }

    private async getUserData(){
        try { return await apiGet("account/check-account");} 
        catch (error) { return error;}
    }

    private changeMode(val:ModeSet){
        this.manager.setMode(val.mode,val.isChain,val.data);
    }
}

export class NewGameMode extends Mode{
    constructor(scene:InGameScene){
        super(scene);
    }
    setup(): void {
        
    }
    enter(data?: any): void {
        this.order(ORDER.ChangeMode,{mode:MODE.MESSAGE,isChain:true,data:newGameMsg});
        console.log('test!');
    }
    exit(): void {
        
    }
    order(order: ORDER, data?: any) {
        switch(order){
            case ORDER.ChangeMode: this.changeMode(data); break;
        }
    }

    private changeMode(val:ModeSet){
        this.manager.setMode(val.mode,val.isChain,val.data);
    }
    
}