export class LoadingScene extends Phaser.Scene{
    constructor(){
        super({key:'LoadingScene'});
        console.log('LoadingScene constructor!');
    }

    init(){
        
    }
    preload(){
        this.load.image('leftArrow', '/assets/images/left-arrow.png');
        this.load.image('rightArrow', '/assets/images/right-arrow.png');
        this.load.image('maleIcon', '/assets/images/gender-0.png');
        this.load.image('femaleIcon', '/assets/images/gender-1.png');
        this.load.image('genderTarget','/assets/images/gender-target.png');       
        this.load.image('okBox','/assets/images/okBox.png');
    }
    create(){
        this.scene.launch('SignInScene');
    }
}