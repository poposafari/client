import { Behavior } from "./Behavior";

export class KeyControl{
    constructor(
        private keyInput:Phaser.Input.InputPlugin,
        private behavior:Behavior,
    ){
        this.cursorKey = this.keyInput.keyboard.createCursorKeys();
        this.petKey = this.keyInput.keyboard.addKey('P');
        this.throwPokeballKey = this.keyInput.keyboard.addKey('C');
        this.rideKey = this.keyInput.keyboard.addKey('R');
    }
    private isPlayerPressAnyMovementKey:boolean;

    private movementKeyDetail:object;
    private isPlayerPressUpMovementKey:boolean;
    private isPlayerPressDownMovementKey:boolean;
    private isPlayerPressRightMovementKey:boolean;
    private isPlayerPressLeftMovementKey:boolean;

    private isPlayerPressRunKey:boolean;
    private isPlayerPressPetKey:boolean;
    private isPlayerPressThrowPokeballKey:boolean;
    private isPlayerPressRideKey:boolean;
    
    private cursorKey: Phaser.Types.Input.Keyboard.CursorKeys;
    private petKey: Phaser.Input.Keyboard.Key;
    private throwPokeballKey: Phaser.Input.Keyboard.Key;
    private rideKey: Phaser.Input.Keyboard.Key;

    update(){
        this.isPlayerPressAnyMovementKey = this.cursorKey.left.isDown || this.cursorKey.right.isDown || this.cursorKey.up.isDown || this.cursorKey.down.isDown;
        this.movementKeyDetail = {
            up:this.cursorKey.up.isDown,
            down:this.cursorKey.down.isDown,
            right:this.cursorKey.right.isDown,
            left:this.cursorKey.left.isDown,
        };

        this.isPlayerPressRunKey = this.cursorKey.shift.isDown;
        this.isPlayerPressPetKey = this.petKey.isDown;
        this.isPlayerPressThrowPokeballKey = this.throwPokeballKey.isDown;
        this.isPlayerPressRideKey = this.rideKey.isDown;

        this.behavior.setBehavior(
            this.movementKeyDetail,
            this.isPlayerPressAnyMovementKey,
            this.isPlayerPressRunKey,
            this.isPlayerPressPetKey,
            this.isPlayerPressThrowPokeballKey
        );
    }
}