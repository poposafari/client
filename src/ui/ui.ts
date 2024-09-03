// import { InGameScene } from "../scenes/ingame-scene";
// import { LoginFormUi } from "./login-form-ui";
// import { UiManager } from "./ui-manger";

// export class UI extends Phaser.GameObjects.Container{
//     private managers:UiManager[]; 


//     constructor(scene:InGameScene){
//         super(scene,0,0);

//         this.managers = [
//             new LoginFormUi(scene),
//         ];
//     }

//     setup():void{
//         for(const manager of this.managers){
//             manager.setup();
//         }
//     }

//     getManger<T extends UiManager>(constructor: new (...args: any[])=>T ): T{
//         return this.managers.find(manager=>manager instanceof constructor) as T;
//     }
// }