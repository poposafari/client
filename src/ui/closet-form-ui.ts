import { MODE } from "../enums/mode";
import { TEXTURE } from "../enums/texture";
import { ModeManager } from "../mode-manager";
import { InGameScene } from "../scenes/ingame-scene";
import { ModalFormUi } from "./modal-form-ui";
import { addWindow, UiManager } from "./ui-manger";

export class ClosetFormUi extends ModalFormUi{
    constructor(scene:InGameScene){
        super(scene);
    }

    setup(): void {
        super.setup();
        super.adjustSize(MODE.CLOSET);
    }

    show(): void {
        super.show();
    }

    clean(): void {
        super.clean();
    }


}