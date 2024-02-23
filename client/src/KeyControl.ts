import { Player } from "./Player";
import { BEHAVIOR_STATUS } from "./constants/Game";
import { KeyInput } from "./constants/KeyInput";

export class KeyControl{
    constructor(
        private keyInput:Phaser.Input.InputPlugin,
        private player:Player,
    ){
        this.cursorKey = this.keyInput.keyboard.createCursorKeys();
        this.throwKey = this.keyInput.keyboard.addKey(KeyInput.THROW);
        this.throwPrevKey = this.keyInput.keyboard.addKey(KeyInput.THROW_PREV);
        this.throwNextKey = this.keyInput.keyboard.addKey(KeyInput.THROW_NEXT);

        this.inputEnabled = true;
    }

    private cursorKey: Phaser.Types.Input.Keyboard.CursorKeys;
    private throwKey: Phaser.Input.Keyboard.Key;
    private throwPrevKey: Phaser.Input.Keyboard.Key;
    private throwNextKey: Phaser.Input.Keyboard.Key;

    private isPressAnyMovementKey:boolean;
    private isPressRunKey:boolean;
    private isPressThrowKey:boolean;
    private isPressThrowPrevKey:boolean;
    private isPressThrowNextKey:boolean;

    private cursorKeyState:object;

    private inputEnabled: boolean;

    private test:number=0;

    update(){
        if(this.player.getBehaviorStatus() === BEHAVIOR_STATUS.READY){
            this.isPressAnyMovementKey = this.cursorKey.left.isDown || this.cursorKey.right.isDown || this.cursorKey.up.isDown || this.cursorKey.down.isDown;
            this.isPressRunKey = this.cursorKey.shift.isDown;
            this.isPressThrowKey = Phaser.Input.Keyboard.JustDown(this.throwKey);
            this.isPressThrowPrevKey = Phaser.Input.Keyboard.JustDown(this.throwPrevKey);
            this.isPressThrowNextKey = Phaser.Input.Keyboard.JustDown(this.throwNextKey);
    
            this.cursorKeyState = {
                up: this.cursorKey.up.isDown,
                down: this.cursorKey.down.isDown,
                right: this.cursorKey.right.isDown,
                left: this.cursorKey.left.isDown,
            };

            if(this.isPressAnyMovementKey){
                if(this.isPressRunKey){this.player.setBehavior(BEHAVIOR_STATUS.RUN, this.cursorKeyState);}
                else{this.player.setBehavior(BEHAVIOR_STATUS.WALK, this.cursorKeyState);}
            }
        }
    }
    delayedBehavior(behaviorStatus: BEHAVIOR_STATUS, keyState: object,delay:number) {
        this.inputEnabled = false;
        this.player.setBehavior(behaviorStatus, keyState);
        setTimeout(() => {
            this.inputEnabled = true;
        }, delay);
    }
}