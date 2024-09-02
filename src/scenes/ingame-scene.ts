import { UI } from "../ui/ui";
import { BaseScene } from "./base-scene";

export class InGameScene extends BaseScene{
    public ui!: UI;
    private uiContainer!: Phaser.GameObjects.Container;

    constructor(){
        super("InGameScene");
    }

    create(){
        this.uiContainer = this.add.container(0,0);
        this.uiContainer.setScale(4);
        this.ui = new UI(this);
        this.ui.setup();

        this.uiContainer.add(this.ui);
    }
}