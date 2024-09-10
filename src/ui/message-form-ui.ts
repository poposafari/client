import { TEXTSTYLE } from "../enums/textstyle";
import { TEXTURE } from "../enums/texture";
import { InGameScene } from "../scenes/ingame-scene";
import { addText, addWindow, UiManager } from "./ui-manger";

export class MessageFormUi extends UiManager{
    protected messageContainer!:Phaser.GameObjects.Container;
    protected messageEndMarkContainer!:Phaser.GameObjects.Container;
    protected messageText!:Phaser.GameObjects.Text

    constructor(scene:InGameScene){
        super(scene);
    }

    setup(): void {
        const ui = this.getUi();

        this.messageContainer = this.scene.add.container(0,0);
        const messageBg = addWindow(this.scene,TEXTURE.MESSAGE,this.scene.game.canvas.width/8,this.scene.game.canvas.height/8+105,400,50);
        this.messageText = addText(this.scene,this.scene.game.canvas.width/8-190,this.scene.game.canvas.height/8+90,"",TEXTSTYLE.MESSAGE);
        
        this.messageContainer.add(messageBg);
        this.messageContainer.add(this.messageText);
        
        this.messageContainer.setVisible(false);
        ui.add(this.messageContainer);

        this.messageEndMarkContainer = this.scene.add.container(0,0);
        const messageEndMark = addWindow(this.scene,TEXTURE.ACCOUNT_WINDOW,this.scene.game.canvas.width/8+188,this.scene.game.canvas.height/8+120,10,10);
        this.messageEndMarkContainer.add(messageEndMark);
        this.messageEndMarkContainer.setVisible(false);
        ui.add(this.messageEndMarkContainer);   
    }

    show(content?:string): void {
        console.log(content);
        this.messageContainer.setVisible(true);
        if(content === undefined) content = "";

        let textArray = content.split("");
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