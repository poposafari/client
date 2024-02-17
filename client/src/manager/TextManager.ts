export class TextManager{
    constructor(
        private scene: Phaser.Scene
    ){}

    public createText(posX:number,posY:number,text:string,font:string,color:string):Phaser.GameObjects.Text{
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
}