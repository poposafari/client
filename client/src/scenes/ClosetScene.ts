export class ClosetScene extends Phaser.Scene{
    constructor(){
        super({ key: 'ClosetScene' });
    }
    private selectedGender: 'male' | 'female' = 'male';
    private selectedSkin: number = 1;
    private currentAvatar:number = 1;

    private readonly START_POS_Y = 350;
    
    handleArrow(direction:string,targetObj:Phaser.GameObjects.Text):void{
        if(direction==='left'){
            this.selectedSkin -= 1;
        }else if(direction==='right'){
            this.selectedSkin += 1;
        }
        targetObj.text = `${this.selectedSkin}`;
    }

    handleGender(gender:string,targetText:Phaser.GameObjects.Text,targetIcon:Phaser.GameObjects.Image,startPosX:number,startPosY:number):void{
        if(gender==='male'){
            this.selectedGender = gender;
            targetIcon.x = startPosX-20;
            targetIcon.y = startPosY+30;
            this.selectedSkin = 1;
            targetText.text = `${1}`;
        }else if(gender==='female'){
            this.selectedGender = gender;
            targetIcon.x = startPosX+20;
            targetIcon.y = startPosY+30;
            this.selectedSkin = 1;
            targetText.text = `${1}`;
        }
    }

    createGenderIcon(startPosX:number,startPosY:number){
        return [
            this.add.image(startPosX - 20, startPosY+30, 'maleIcon').setInteractive(),
            this.add.image(startPosX + 20, startPosY+30, 'femaleIcon').setInteractive(),
            this.add.image(startPosX - 20, startPosY+30, 'genderTarget')
        ]
    }

    createSelectText(startPosX:number,startPosY:number){
        return [
            this.add.text(startPosX-13, startPosY+65, 'Skin', { fontFamily: 'Myfont sans-serif'}),
            this.add.text(startPosX-6, startPosY+85, `${this.selectedSkin}`, { fontFamily: 'Myfont sans-serif'}),

        ]
    }

    createSelectArrow(startPosX:number,startPosY:number){
        return [
            this.add.image(startPosX - 60, startPosY+80, 'leftArrow').setInteractive(),
            this.add.image(startPosX + 60, startPosY+80, 'rightArrow').setInteractive()
        ]
    }

    init(){

    }
    create() {
        const nicknameFormHTML = `
            <div class="nickname-form">
                <label for="nickname">Name</label>
                <input type="text" id="nickname">
                <p id="error-msg"></p>
            </div>
        `;
        const [maleIcon,femaleIcon,genderTargetIcon] = this.createGenderIcon(this.cameras.main.centerX,this.START_POS_Y);
        const [selectText0,selectText1] = this.createSelectText(this.cameras.main.centerX,this.START_POS_Y);
        const [selectArrow0,selectArrow1] = this.createSelectArrow(this.cameras.main.centerX,this.START_POS_Y);
        
        selectArrow0.on('pointerdown',()=>this.handleArrow('left',selectText1));
        selectArrow1.on('pointerdown', () =>this.handleArrow('right',selectText1));
        
        maleIcon.on('pointerdown', () => this.handleGender('male',selectText1,genderTargetIcon,this.cameras.main.centerX,this.START_POS_Y));
        femaleIcon.on('pointerdown', () => this.handleGender('female',selectText1,genderTargetIcon,this.cameras.main.centerX,this.START_POS_Y));
        
        const nicknameFormElement = this.add.dom(this.cameras.main.centerX,this.START_POS_Y+200).createFromHTML(nicknameFormHTML);
        
        const okBox = this.add.image(this.cameras.main.centerX,this.START_POS_Y+252,'okBox').setInteractive();

        okBox.on('pointerdown', () => {
            const nicknameInput = document.getElementById('nickname') as HTMLInputElement;
            const nickname = nicknameInput.value;
            if (!nickname) {
                alert('Please enter a nickname.');
                return;
            }
            console.log(`Starting game with nickname: ${nickname}, gender: ${this.selectedGender}, skin: ${this.selectedSkin}`);
        });
    }

}