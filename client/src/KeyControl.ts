import { Behavior } from "./Behavior";
import { BEHAVIOR_STATUS } from "./constants/Game";
import { KeyInput } from "./constants/KeyInput";

export class KeyControl{
    constructor(
        private keyInput:Phaser.Input.InputPlugin,
        private behavior:Behavior,
    ){
        this.cursorKey = this.keyInput.keyboard.createCursorKeys();
        this.throwKey = this.keyInput.keyboard.addKey(KeyInput.THROW);
        this.throwPrevKey = this.keyInput.keyboard.addKey(KeyInput.THROW_PREV);
        this.throwNextKey = this.keyInput.keyboard.addKey(KeyInput.THROW_NEXT);
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

    private pressMovementKeyDetail:object;

    update(){
        if(Behavior.isBehaviorFinish){
            this.isPressAnyMovementKey = this.cursorKey.left.isDown || this.cursorKey.right.isDown || this.cursorKey.up.isDown || this.cursorKey.down.isDown;
            this.isPressRunKey = this.cursorKey.shift.isDown;
            this.isPressThrowKey = Phaser.Input.Keyboard.JustDown(this.throwKey);
            this.isPressThrowPrevKey = Phaser.Input.Keyboard.JustDown(this.throwPrevKey);
            this.isPressThrowNextKey = Phaser.Input.Keyboard.JustDown(this.throwNextKey);
    
            this.pressMovementKeyDetail = {
                up: this.cursorKey.up.isDown,
                down: this.cursorKey.down.isDown,
                right: this.cursorKey.right.isDown,
                left: this.cursorKey.left.isDown,
            };

            if(this.isPressAnyMovementKey){
                if(this.isPressRunKey){this.behavior.setBehavior(BEHAVIOR_STATUS.RUN,this.pressMovementKeyDetail)}
                else{this.behavior.setBehavior(BEHAVIOR_STATUS.WALK,this.pressMovementKeyDetail)}
            }
            else if(this.isPressThrowKey){this.behavior.setBehavior(BEHAVIOR_STATUS.THROW)}
            else if(this.isPressThrowPrevKey){this.behavior.setBehavior(BEHAVIOR_STATUS.THROW_PREV)}
            else if(this.isPressThrowNextKey){this.behavior.setBehavior(BEHAVIOR_STATUS.THROW_NEXT)}
            else{this.behavior.setBehavior(BEHAVIOR_STATUS.NONE)}
        }
    }
}