import Phaser from 'phaser';

export class SetAvatarScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ClosetScene' });
    }

    private selectedGender: 'male' | 'female' = 'male';
    private selectedSkin: number = 1;
    private readonly maxSkin: number = 4;
    private readonly START_POS_Y: number = 350;
    private skinImage!: Phaser.GameObjects.Image;

    create() {
        const nicknameFormHTML = `
            <div class="nickname-form">
                <label for="nickname">Name</label>
                <input type="text" id="nickname">
                <p id="error-msg"></p>
            </div>
        `;

        this.skinImage = this.add.image(this.cameras.main.centerX, this.START_POS_Y - 60, `${this.selectedGender}_${this.selectedSkin}`);
        this.skinImage.scale = 2;

        const [maleIcon, femaleIcon, genderTargetIcon] = this.createGenderIcons(this.cameras.main.centerX, this.START_POS_Y);
        const [skinTitle, skinNumber] = this.createSkinSelectionTexts(this.cameras.main.centerX, this.START_POS_Y);
        const [leftArrow, rightArrow] = this.createSkinSelectionArrows(this.cameras.main.centerX, this.START_POS_Y);

        // Event listeners
        leftArrow.on('pointerdown', () => this.handleArrow('left', skinNumber));
        rightArrow.on('pointerdown', () => this.handleArrow('right', skinNumber));

        maleIcon.on('pointerdown', () => this.handleGender('male', skinNumber, genderTargetIcon));
        femaleIcon.on('pointerdown', () => this.handleGender('female', skinNumber, genderTargetIcon));

        const nicknameFormElement = this.add.dom(this.cameras.main.centerX, this.START_POS_Y + 200).createFromHTML(nicknameFormHTML);
        const okBox = this.add.image(this.cameras.main.centerX, this.START_POS_Y + 255, 'okBox').setInteractive();

        okBox.on('pointerdown', this.handleStartButtonClick.bind(this));
    }

    handleArrow(direction: string, skinNumberText: Phaser.GameObjects.Text): void {
        if (direction === 'left') {
            this.selectedSkin = Math.max(1, this.selectedSkin - 1);
        } else if (direction === 'right') {
            this.selectedSkin = Math.min(this.maxSkin, this.selectedSkin + 1);
        }
        skinNumberText.setText(`${this.selectedSkin}`);
        this.skinImage.setTexture(`${this.selectedGender}_${this.selectedSkin}`);
    }

    handleGender(gender: 'male' | 'female', skinNumberText: Phaser.GameObjects.Text, genderTargetIcon: Phaser.GameObjects.Image): void {
        this.selectedGender = gender;
        genderTargetIcon.setPosition(
            this.cameras.main.centerX + (gender === 'male' ? -20 : 20),
            this.START_POS_Y + 30
        );
        this.selectedSkin = 1;
        skinNumberText.setText(`${this.selectedSkin}`);
        this.skinImage.setTexture(`${this.selectedGender}_${this.selectedSkin}`);
    }

    handleStartButtonClick(): void {
        const nicknameInput = document.getElementById('nickname') as HTMLInputElement;
        const nickname = nicknameInput.value;
        const errorMsg = document.getElementById('error-msg') as HTMLElement;

        if (!this.isValidNickname(nickname)) {
            errorMsg.textContent = 'Invalid nickname. Please follow the rules.';
            return;
        }

        console.log(`Starting game with nickname: ${nickname}, gender: ${this.selectedGender}, skin: ${this.selectedSkin}`);
    }

    isValidNickname(nickname: string): boolean {
        const koreanRegex = /^[가-힣]{2,6}$/;
        const englishRegex = /^[a-zA-Z0-9]{4,12}$/;
        return koreanRegex.test(nickname) || englishRegex.test(nickname);
    }

    createGenderIcons(centerX: number, centerY: number): [Phaser.GameObjects.Image, Phaser.GameObjects.Image, Phaser.GameObjects.Image] {
        return [
            this.add.image(centerX - 20, centerY + 30, 'maleIcon').setInteractive(),
            this.add.image(centerX + 20, centerY + 30, 'femaleIcon').setInteractive(),
            this.add.image(centerX - 20, centerY + 30, 'genderTarget')
        ];
    }

    createSkinSelectionTexts(centerX: number, centerY: number): [Phaser.GameObjects.Text, Phaser.GameObjects.Text] {
        return [
            this.add.text(centerX - 13, centerY + 85, 'Skin', { fontFamily: 'Myfont, sans-serif' }),
            this.add.text(centerX - 2.5, centerY + 105, `${this.selectedSkin}`, { fontFamily: 'Myfont, sans-serif' })
        ];
    }

    createSkinSelectionArrows(centerX: number, centerY: number): [Phaser.GameObjects.Image, Phaser.GameObjects.Image] {
        return [
            this.add.image(centerX - 60, centerY + 100, 'leftArrow').setInteractive(),
            this.add.image(centerX + 60, centerY + 100, 'rightArrow').setInteractive()
        ];
    }
}
