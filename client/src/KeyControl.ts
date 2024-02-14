import { BEHAVIOR_STATUS, PlayerBehavior } from "./PlayerBehavior";

export class KeyControl{
    constructor(
        private keyInput:Phaser.Input.InputPlugin,
        private behavior:PlayerBehavior,
    ){
        this.cursorKey = this.keyInput.keyboard.createCursorKeys();
        this.petKey = this.keyInput.keyboard.addKey('P');
        this.throwItemKey = this.keyInput.keyboard.addKey('C');
        this.rideKey = this.keyInput.keyboard.addKey('R');
        this.choiceNextItemKey = this.keyInput.keyboard.addKey('M');
        this.choicePrevItemKey = this.keyInput.keyboard.addKey('N');
    }
    private isPressAnyMovementKey:boolean;

    private movementKeyDetail:object;

    private isPressRunKey:boolean;
    private isPressPetKey:boolean;
    private isPressThrowItemKey:boolean;
    private isPressRideKey:boolean;
    private isPressChoiceNextItemKey:boolean;
    private isPressChoicePrevItemKey:boolean;

    private cursorKey: Phaser.Types.Input.Keyboard.CursorKeys;
    private petKey: Phaser.Input.Keyboard.Key;
    private throwItemKey: Phaser.Input.Keyboard.Key;
    private rideKey: Phaser.Input.Keyboard.Key;
    private choiceNextItemKey: Phaser.Input.Keyboard.Key;
    private choicePrevItemKey: Phaser.Input.Keyboard.Key;
    update(){
        this.isPressAnyMovementKey = this.cursorKey.left.isDown || this.cursorKey.right.isDown || this.cursorKey.up.isDown || this.cursorKey.down.isDown;
        this.movementKeyDetail = {
            up: this.cursorKey.up.isDown,
            down: this.cursorKey.down.isDown,
            right: this.cursorKey.right.isDown,
            left: this.cursorKey.left.isDown,
        };
        this.isPressRunKey = this.cursorKey.shift.isDown;
        this.isPressPetKey = Phaser.Input.Keyboard.JustDown(this.petKey);
        this.isPressThrowItemKey = Phaser.Input.Keyboard.JustDown(this.throwItemKey);
        this.isPressRideKey = Phaser.Input.Keyboard.JustDown(this.rideKey);
        this.isPressChoiceNextItemKey = Phaser.Input.Keyboard.JustDown(this.choiceNextItemKey);
        this.isPressChoicePrevItemKey = Phaser.Input.Keyboard.JustDown(this.choicePrevItemKey);
        if(this.behavior.isReadyBehavior()){
            if(this.isPressAnyMovementKey){
                if(this.isPressRunKey){
                    this.behavior.setBehavior({type:BEHAVIOR_STATUS.RUN_MODE,movementDetail: this.movementKeyDetail});
                }
                else{
                    this.behavior.setBehavior({type:BEHAVIOR_STATUS.WALK_MODE,movementDetail: this.movementKeyDetail});
                }
            }
            else if(this.isPressRideKey){
                this.behavior.setBehavior({type:BEHAVIOR_STATUS.RIDE_MODE});
            }
            else if(this.isPressThrowItemKey){
                this.behavior.setBehavior({type:BEHAVIOR_STATUS.THROW_ITEM_MODE});
            }
            else if(this.isPressChoiceNextItemKey){
                this.behavior.setBehavior({type:BEHAVIOR_STATUS.CHOICE_ITEM_NEXT});
            }
            else if(this.isPressChoicePrevItemKey){
                this.behavior.setBehavior({type:BEHAVIOR_STATUS.CHOICE_ITEM_PREV});
            }
            else{
                this.behavior.setBehavior({type:BEHAVIOR_STATUS.NONE_MODE});
            }
        }
    }    
}