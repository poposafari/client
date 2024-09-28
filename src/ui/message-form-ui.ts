import { KEYBOARD } from "../enums/keyboard";
import { ORDER } from "../enums/order";
import { TEXTSTYLE } from "../enums/textstyle";
import { TEXTURE } from "../enums/texture";
import { InGameScene } from "../scenes/ingame-scene";
import { messageBoxConfig } from "./config";
import { addImage, addText, addWindow, UiManager } from "./ui-manger";

export class MessageFormUi extends UiManager {
    protected messageContainer!: Phaser.GameObjects.Container;
    protected messageEndMarkContainer!: Phaser.GameObjects.Container;
    protected messageText!: Phaser.GameObjects.Text;

    private contentQueue: string[] = [];
    private currentIdx: number = 0;

    public whitelistKey=[
        KEYBOARD.SELECT
    ];

    constructor(scene: InGameScene) {
        super(scene);
    }

    setup(): void {
        const ui = this.getUi();
        const field = messageBoxConfig;

        this.messageContainer = this.scene.add.container(
            this.scene.game.canvas.width / 4,
            this.scene.game.canvas.height / 4
        );
        const messageBg = addWindow(
            this.scene,
            TEXTURE.MESSAGE,
            field.bx,
            field.by,
            field.bw,
            field.bh
        );
        this.messageText = addText(this.scene, field.tx, field.ty, "", TEXTSTYLE.MESSAGE_W);
        this.messageText.setOrigin(0, 0);
        this.messageContainer.add(messageBg);
        this.messageContainer.add(this.messageText);

        this.messageContainer.setVisible(false);
        ui.add(this.messageContainer);

        this.messageEndMarkContainer = this.scene.add.container(
            this.scene.game.canvas.width / 4,
            this.scene.game.canvas.height / 4
        );
        const messageEndMark = addImage(
            this.scene,
            TEXTURE.MESSAGE_MARK,
            field.ex,
            field.ey,
            field.ew,
            field.eh
        );
        this.messageEndMarkContainer.add(messageEndMark);
        this.messageEndMarkContainer.setVisible(false);
        ui.add(this.messageEndMarkContainer);
    }

    show(data?: { type: string; content: string[] }[]): void {
        if (data && Array.isArray(data)) {
            this.contentQueue = data.map(item => item.content.join(" "));
        }

        this.currentIdx = 0;
        this.messageContainer.setVisible(true);
        this.showCurrentMessage();
    }

    clean(): void {
        this.messageText.text = "";
        this.messageEndMarkContainer.setVisible(false);
    }

    getMessageStatus(): boolean {
        return this.messageEndMarkContainer.visible;
    }

    actionInput(key: KEYBOARD): void {
        if (key === KEYBOARD.SELECT && this.getMessageStatus()) {
            this.currentIdx++;
            if (this.currentIdx < this.contentQueue.length) {
                this.clean();
                this.showCurrentMessage();
            } else {
                this.messageContainer.setVisible(false);
                this.mode.order(ORDER.Finish);
            }
        }
    }

    private showCurrentMessage(): void {
        if (this.currentIdx < this.contentQueue.length) {
            const text = this.contentQueue[this.currentIdx];
            let textArray = text.split("");
            let delay = 10;
            let index = 0;

            const addNextChar = () => {
                if (index === textArray.length) {
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
    }
}
