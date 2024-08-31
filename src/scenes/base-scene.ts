export class BaseScene extends Phaser.Scene{
    constructor(config:string | Phaser.Types.Scenes.SettingsConfig){
        super(config);
    }

    loadImage(key:string, folder:string, filename:string){
        if(!filename){
            filename = `${filename}.png`;
        }
        this.load.image(key,`${folder}/${filename}`);
    }
}