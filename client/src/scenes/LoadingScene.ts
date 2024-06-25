export class LoadingScene extends Phaser.Scene{
    constructor(){
        super({key:'LoadingScene'});
        console.log('LoadingScene constructor!');
    }

    init(){
           
    }
    preload(){
        
    }
    create(){
        this.scene.launch('SignInScene');
    }
}