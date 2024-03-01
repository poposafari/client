import { SPRITE_DEPTH } from "../constants/Game";
import { nicknameConfig } from "../constants/Text";

export class TextManager{
    constructor(
        private scene: Phaser.Scene
    ){}

    public makeText(posX:number,posY:number,text:string,font:string,color:string):Phaser.GameObjects.Text{
        return this.scene.make.text({
            x: posX,
            y: posY,
            text: text,
            style:{
                font: font,
                color: color,
            }
        });
    }

    public addText(x:number,y:number,nickname:string){
        const text = this.scene.add.text(
            x,
            y,
            nickname,
            nicknameConfig
        );
        text.depth = SPRITE_DEPTH.NICKNAME;
        text.setAlign('center');
        return text;
    }
}