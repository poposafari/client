export class LoadingScene extends Phaser.Scene{
    constructor(){
        super({key:'LoadingScene'});
        console.log('LoadingScene constructor!');
    }

    init(){
        
    }
    preload(){
        this.load.image('messageBox','/assets/images/message_box.png')
        this.load.image('maleIcon', '/assets/images/gender-0.png');
        this.load.image('femaleIcon', '/assets/images/gender-1.png');
        this.load.image('genderTarget','/assets/images/gender-target.png');
        this.load.image('leftArrow', '/assets/images/left-arrow.png');
        this.load.image('rightArrow', '/assets/images/right-arrow.png');
        this.load.image('okBox','/assets/images/okBox.png');

        this.load.image('male_1','/assets/images/male_1.png');
        this.load.image('male_2','/assets/images/male_2.png');
        this.load.image('male_3','/assets/images/male_3.png');
        this.load.image('male_4','/assets/images/male_4.png');

        this.load.image('female_1','/assets/images/female_1.png');
        this.load.image('female_2','/assets/images/female_2.png');
        this.load.image('female_3','/assets/images/female_3.png');
        this.load.image('female_4','/assets/images/female_4.png');
    }
    create(){
        this.scene.start('SignInScene');
    }
}