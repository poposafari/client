import InputText from "phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText";
import { InGameScene } from "../scenes/ingame-scene";
import { ModalFormUi } from "./modal-form-ui";
import { addText, addTextInput, addWindow } from "./ui-manger";
import { TEXTURE } from "../enums/texture";
import { TEXTSTYLE } from "../enums/textstyle";
import { MODE } from "../enums/mode";
import { loginBtnsConfig,loginErrorMsg1,loginErrorMsg2,loginInputsConfig } from "./config";
import { ORDER } from "../enums/order";

export class LoginFormUi extends ModalFormUi{
    private inputContainers:Phaser.GameObjects.Container[]=[];
    private inputs: InputText[] = [];
    private btns: Phaser.GameObjects.NineSlice[] = [];

    constructor(scene:InGameScene){
        super(scene);
    }

    setup(): void {
        super.setup();
        super.adjustSize(MODE.LOGIN);

        const field1 = loginInputsConfig;
        const field2 = loginBtnsConfig;

        //inputs
        for (const item of field1!) {
            const inputContainer = this.scene.add.container(item.x,item.y);
            const inputBg = addWindow(this.scene, TEXTURE.INPUT_0, 0, 0, item.w, item.h);
            const input = addTextInput(this.scene, 0, 0, item.w-10, item.h, TEXTSTYLE.INPUT, {
                type: item.type,
                fontSize: '18px',
                placeholder: item.placeholder,
                minLength:6,
                maxLength:16
            });
                
            inputContainer.add(inputBg);
            inputContainer.add(input);
            inputContainer.setVisible(false);
    
            this.inputs.push(input);
            this.inputContainers.push(inputContainer);
            this.modalContainer.add(inputContainer);
        }

        //btns
        for (const item of field2) {
            const btnContainer = this.scene.add.container(item.x,item.y);
            const btnBg = addWindow(this.scene, TEXTURE.BTN_0, 0, 0, item.w, item.h);
            const btnText = addText(this.scene, 0, 0, item.content, TEXTSTYLE.ACCOUNT);

            this.btns.push(btnBg);
            btnContainer.add(btnBg);
            btnContainer.add(btnText);
            this.modalContainer.add(btnContainer);
        }
    }

    show(): void {
        super.show();

        this.setBackground(TEXTURE.BG_0);

        for(const item of this.inputContainers){
            item.setVisible(true);
        }

        for(const item of this.btns){
            item.setInteractive();
        }
        
        this.btns[0].on("pointerdown",async ()=>{
            if(this.inputs[0].text.length===0 || this.inputs[1].text.length===0){
                this.mode.order(ORDER.ChangeMode,{mode:MODE.MESSAGE,isChain:true,data:loginErrorMsg1});
                return;
            }

            this.mode.order(ORDER.ChangeMode,{mode:MODE.WAITING,isChain:false})
            
            const res = await this.mode.order(ORDER.Submit,[this.inputs[0].text,this.inputs[1].text]);
            if(res.status === 200){
                console.log('로그인 성공!');
            }else if(res.status === 401){
                this.mode.order(ORDER.ChangeMode,{mode:MODE.LOGIN,isChain:false});
                this.mode.order(ORDER.ChangeMode,{mode:MODE.MESSAGE,isChain:true,data:loginErrorMsg2});
            }else{
                this.mode.order(ORDER.ChangeMode,{mode:MODE.LOGIN,isChain:false});
                this.mode.order(ORDER.ChangeMode,{mode:MODE.MESSAGE,isChain:true,data:loginErrorMsg2});
            }
        });
        
        this.btns[1].on("pointerdown",()=>{this.mode.order(ORDER.ChangeMode,{mode:MODE.REGISTRATION,isChain:false})});
        this.btns[2].on("pointerdown",()=>{console.log('moveToFindAccount');});
    }

    blockInputs(): void {
        for (const input of this.inputs) {
            input.setBlur();
            input.pointerEvents = 'none';
        }
        for (const btn of this.btns) {
            btn.disableInteractive();
        }
    }

    unblockInputs(): void{
        for (const input of this.inputs) {
            input.pointerEvents = 'auto';
        }
        for (const btn of this.btns) {
            btn.setInteractive();
        }
    }

    pause(onoff:boolean):void{
        
    }

    clean():void{
        super.clean();

        for(const item of this.inputContainers){
            item.setVisible(false);
        }

        for(const item of this.btns){
            item.off('pointerdown')
        }
    }
}