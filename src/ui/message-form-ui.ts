import { TEXTSTYLE } from "../enums/textstyle";
import { TEXTURE } from "../enums/texture";
import { InGameScene } from "../scenes/ingame-scene";
import { messageBoxConfig } from "./config";
import { addImage, addText, addWindow, UiManager } from "./ui-manger";

export class MessageFormUi extends UiManager{
    protected messageContainer!:Phaser.GameObjects.Container;
    protected messageEndMarkContainer!:Phaser.GameObjects.Container;
    protected messageText!:Phaser.GameObjects.Text

    constructor(scene:InGameScene){
        super(scene);
    }

    setup(): void {
        const ui = this.getUi();
        const field = messageBoxConfig;

        this.messageContainer = this.scene.add.container(this.scene.game.canvas.width/4,this.scene.game.canvas.height/4);
        const messageBg = addWindow(this.scene,TEXTURE.MESSAGE,field.bx,field.by,field.bw,field.bh);
        this.messageText = addText(this.scene,field.tx,field.ty,"",TEXTSTYLE.MESSAGE_W);
        this.messageText.setOrigin(0,0);
        this.messageContainer.add(messageBg);
        this.messageContainer.add(this.messageText);
        
        this.messageContainer.setVisible(false);
        ui.add(this.messageContainer);

        this.messageEndMarkContainer = this.scene.add.container(this.scene.game.canvas.width/4,this.scene.game.canvas.height/4);
        const messageEndMark = addImage(this.scene,TEXTURE.MESSAGE_MARK,field.ex,field.ey,field.ew,field.eh);
        this.messageEndMarkContainer.add(messageEndMark);
        this.messageEndMarkContainer.setVisible(false);
        ui.add(this.messageEndMarkContainer);
    }

    show(data?:any): void {
        this.messageContainer.setVisible(true);
        if(data === undefined) data = "";

        let textArray = data.split("");
        let delay = 10;
        let index = 0;

        const addNextChar = () => {
            if (index === textArray.length){
                this.messageEndMarkContainer.setVisible(true);
            }

            if (index < textArray.length) {
                this.messageText.text += textArray[index];
                index++;

                this.scene.time.delayedCall(delay, addNextChar, [], this);
            }
        };

        addNextChar();
    }

    clean(): void {
        this.messageContainer.setVisible(false);
        this.messageEndMarkContainer.setVisible(false);
        this.messageText.text = "";
    }

    getMessageStatus(){
        return this.messageEndMarkContainer.visible;
    }
}