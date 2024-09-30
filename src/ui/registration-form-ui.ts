import InputText from "phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText";
import { InGameScene } from "../scenes/ingame-scene";
import { ModalFormUi } from "./modal-form-ui";
import { addText, addTextInput, addWindow } from "./ui-manger";
import { TEXTURE } from "../enums/texture";
import { TEXTSTYLE } from "../enums/textstyle"
import { MODE } from "../enums/mode";
import { registerBtnsConfig, registerErrorMsg1, registerErrorMsg2, registerErrorMsg3, registerErrorMsg5, registerErrorMsg6, registerInputsConfig, registerSuccessMsg, serverErrorMsg } from "./config";
import { ORDER } from "../enums/order";

export class RegistrationFormUi extends ModalFormUi{
    private inputContainers:Phaser.GameObjects.Container[]=[];
    private inputs: InputText[]=[];
    private btns: Phaser.GameObjects.NineSlice[]=[];

    constructor(scene:InGameScene){
        super(scene);
    }

    setup(): void {
        super.setup();
        super.adjustSize(MODE.REGISTRATION);
        const field1 = registerInputsConfig;
        const field2 = registerBtnsConfig;

        //inputs
        for(const item of field1){
            const inputContainer = this.scene.add.container(item.x,item.y);
            const inputBg = addWindow(this.scene,TEXTURE.INPUT_0,0,0,item.w,item.h);
            const input = addTextInput(this.scene,0,0,item.w-10,item.h,TEXTSTYLE.INPUT,{
                type:item.type,
                fontSize:'16px',
                placeholder:item.placeholder
            });
            const label = addText(this.scene, item.labelX!,item.labelY!,item.label!, TEXTSTYLE.ACCOUNT);
            
            inputContainer.add(inputBg);
            inputContainer.add(input);
            inputContainer.add(label);
            inputContainer.setVisible(false);

            this.inputs.push(input);
            this.inputContainers.push(inputContainer);
            this.modalContainer.add(inputContainer);
        }

        for(const item of field2){
            const btnContainer = this.scene.add.container(item.x, item.y);
            const btnBg = addWindow(this.scene, TEXTURE.BTN_0,0, 0, item.w, item.h);
            const btnText = addText(this.scene, 0, 0, item.content, TEXTSTYLE.ACCOUNT);
            btnText.setOrigin(0.5, 0.5);

            this.btns.push(btnBg);
            btnContainer.add(btnBg);
            btnContainer.add(btnText);
            this.modalContainer.add(btnContainer);
        }
    }

    show(): void {
        super.show();

        for(const item of this.inputContainers){
            item.setVisible(true);
        }

        for(const item of this.btns){
            item.setInteractive();
        }

        this.inputs[0].text = "";
        this.inputs[1].text = "";
        this.inputs[2].text = "";

        this.btns[0].on("pointerdown",async ()=>{
            const [username,password,repassword] = this.inputs;
            
            const isValidUsername = (username: string): boolean => {
                const usernameRegex = /^[a-zA-Z0-9]{5,16}$/;
                return usernameRegex.test(username);
            };

            const isValidPassword = (password: string): boolean => {
                const passwordRegex = /^(?=.*[!@#$%^&*()\-_=+])(?=.*[a-zA-Z0-9])[a-zA-Z0-9!@#$%^&*()\-_=+]{5,16}$/;
                return passwordRegex.test(password);
            };

            if(username.text.length === 0 || password.text.length === 0 || repassword.text.length === 0){
                this.mode.order(ORDER.ChangeMode,{mode:MODE.MESSAGE,isChain:true,data:registerErrorMsg1});
                return;
            }
            if(password.text !== repassword.text){
                this.mode.order(ORDER.ChangeMode,{mode:MODE.MESSAGE,isChain:true,data:registerErrorMsg3});
                return;
            }
            if(!isValidUsername(username.text)){
                this.mode.order(ORDER.ChangeMode,{mode:MODE.MESSAGE,isChain:true,data:registerErrorMsg5});
                return;
            }
            if(!isValidPassword(password.text)){
                this.mode.order(ORDER.ChangeMode,{mode:MODE.MESSAGE,isChain:true,data:registerErrorMsg6});
                return;
            }

            this.mode.order(ORDER.ChangeMode,{mode:MODE.WAITING,isChain:false})

            const res = await this.mode.order(ORDER.Submit,[username.text,password.text]);
            if(res.status){
                this.mode.order(ORDER.ChangeMode,{mode:MODE.LOGIN,isChain:false});
                this.mode.order(ORDER.ChangeMode,{mode:MODE.MESSAGE,isChain:true,data:registerSuccessMsg});

            }else if(res.status === 409){
                this.mode.order(ORDER.ChangeMode,{mode:MODE.REGISTRATION,isChain:false});
                this.mode.order(ORDER.ChangeMode,{mode:MODE.MESSAGE,isChain:true,data:registerErrorMsg2});
            }else{
                this.mode.order(ORDER.ChangeMode,{mode:MODE.REGISTRATION,isChain:false});
                this.mode.order(ORDER.ChangeMode,{mode:MODE.MESSAGE,isChain:true,data:serverErrorMsg});
            }
        });
        this.btns[1].on("pointerdown",()=>{this.mode.order(ORDER.ChangeMode,{mode:MODE.LOGIN,isChain:false});});
    }

    clean(): void {  
        super.clean();

        for(const item of this.inputContainers){
            item.setVisible(false);
        }

        for(const item of this.btns){
            item.off('pointerdown');
        }
    }

    pause(onoff: boolean): void {
        super.pause(onoff);
        onoff ? this.blockInputs() : this.unblockInputs();
    }
    
    private blockInputs(): void {
        for (const input of this.inputs) {
            input.setBlur();
            input.pointerEvents = 'none';
        }
        for (const btn of this.btns) {
            btn.disableInteractive();
        }
    }

    private unblockInputs(): void{
        for (const input of this.inputs) {
            input.pointerEvents = 'auto';
        }
        for (const btn of this.btns) {
            btn.setInteractive();
        }
    }
}