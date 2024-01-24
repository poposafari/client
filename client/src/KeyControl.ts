import { PlayerBehavior } from "./PlayerBehavior";

export class KeyControl{
    constructor(
        private keyInput:Phaser.Input.InputPlugin,
        private behavior:PlayerBehavior,
    ){
        this.cursorKey = this.keyInput.keyboard.createCursorKeys();
        this.petKey = this.keyInput.keyboard.addKey('P');
        this.throwPokeballKey = this.keyInput.keyboard.addKey('C');
        this.rideKey = this.keyInput.keyboard.addKey('R');
        this.choiceNextItemKey = this.keyInput.keyboard.addKey('M');
        this.choicePrevItemKey = this.keyInput.keyboard.addKey('N');
    }
    private isPressAnyMovementKey:boolean;

    private movementKeyDetail:object;
    private isPressUpMovementKey:boolean;
    private isPressDownMovementKey:boolean;
    private isPressRightMovementKey:boolean;
    private isPressLeftMovementKey:boolean;

    private isPressRunKey:boolean;
    private isPressPetKey:boolean;
    private isPressThrowPokeballKey:boolean;
    private isPressRideKey:boolean;
    private isPressChoiceNextItemKey:boolean;
    private isPressChoicePrevItemKey:boolean;

    private cursorKey: Phaser.Types.Input.Keyboard.CursorKeys;
    private petKey: Phaser.Input.Keyboard.Key;
    private throwPokeballKey: Phaser.Input.Keyboard.Key;
    private rideKey: Phaser.Input.Keyboard.Key;
    private choiceNextItemKey: Phaser.Input.Keyboard.Key;
    private choicePrevItemKey: Phaser.Input.Keyboard.Key;

    update(){
        this.isPressAnyMovementKey = this.cursorKey.left.isDown || this.cursorKey.right.isDown || this.cursorKey.up.isDown || this.cursorKey.down.isDown;
        this.movementKeyDetail = {
            up:this.cursorKey.up.isDown,
            down:this.cursorKey.down.isDown,
            right:this.cursorKey.right.isDown,
            left:this.cursorKey.left.isDown,
        };

        this.isPressRunKey = this.cursorKey.shift.isDown;
        this.isPressPetKey = this.petKey.isDown;
        this.isPressThrowPokeballKey = this.throwPokeballKey.isDown;
        this.isPressRideKey = this.rideKey.isDown;
        this.isPressChoiceNextItemKey = Phaser.Input.Keyboard.JustDown(this.choiceNextItemKey);
        this.isPressChoicePrevItemKey = Phaser.Input.Keyboard.JustDown(this.choicePrevItemKey);
        this.behavior.setBehavior(
            this.movementKeyDetail,
            this.isPressAnyMovementKey,
            this.isPressRunKey,
            this.isPressPetKey,
            this.isPressThrowPokeballKey,
            this.isPressChoiceNextItemKey,
            this.isPressChoicePrevItemKey
        );
    }
}