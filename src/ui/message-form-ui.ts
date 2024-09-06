import { TEXTSTYLE } from "../enums/textstyle";
import { TEXTURE } from "../enums/texture";
import { InGameScene } from "../scenes/ingame-scene";
import { addText, addWindow, UiManager } from "./ui-manger";

export class MessageFormUi extends UiManager{
    protected messageContainer!:Phaser.GameObjects.Container;
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
    }
    show(content?:string): void {
        this.messageContainer.setVisible(true);
        
        if(content === undefined) content = "";

        let textArray = content.split("");
        let delay = 20; 
        let index = 0;

        const addNextChar = () => {
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
        this.messageText.text = "";
    }
}