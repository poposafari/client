import { InGameScene } from "./scenes/ingame-scene";

export abstract class Mode{
    private scene:InGameScene;
    constructor(scene:InGameScene){
        this.scene = scene;
    }
    abstract enter():void; //모드 실행 시 실행되는 메소드
    abstract exit(): void; //모드 종료 시 실행되는 메소드

    getScene(){
        return this.scene;
    }
}