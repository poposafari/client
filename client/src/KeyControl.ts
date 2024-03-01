import { DOWN } from "phaser";
import { Player } from "./Player";
import { BEHAVIOR_STATUS } from "./constants/Game";
import { KeyInput } from "./constants/KeyInput";
import { Direction } from "./constants/Direction";
import EventManager from "./manager/EventManager";

export class KeyControl{
    constructor(
        private keyInput:Phaser.Input.InputPlugin,
        private player:Player,
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

    private cursorKeyState:object;

    update(){
        if(this.player.getBehaviorStatus() !== BEHAVIOR_STATUS.IDLE){return;}

        this.isPressAnyMovementKey = this.cursorKey.left.isDown || this.cursorKey.right.isDown || this.cursorKey.up.isDown || this.cursorKey.down.isDown;
        this.isPressRunKey = this.cursorKey.shift.isDown;
        this.isPressThrowKey = Phaser.Input.Keyboard.JustDown(this.throwKey);
        this.isPressThrowPrevKey = Phaser.Input.Keyboard.JustDown(this.throwPrevKey);
        this.isPressThrowNextKey = Phaser.Input.Keyboard.JustDown(this.throwNextKey);

        this.cursorKeyState={
            up:this.cursorKey.up.isDown,
            down:this.cursorKey.down.isDown,
            left:this.cursorKey.left.isDown,
            right:this.cursorKey.right.isDown,
        }

        if(this.isPressAnyMovementKey && this.player.getMovementFinishCheck()){
            this.setMovementDirection(this.cursorKeyState,this.isPressRunKey);
        }
        else if(!this.isPressAnyMovementKey && this.player.getMovementFinishCheck()){
            this.player.setBehavior(BEHAVIOR_STATUS.IDLE);
        }
    }
    setMovementDirection(cursorState:object, isShiftPressed: boolean){
        const behaviorStatus = isShiftPressed ? BEHAVIOR_STATUS.RUN : BEHAVIOR_STATUS.WALK;
        this.player.setBehavior(behaviorStatus, cursorState);
    }
}