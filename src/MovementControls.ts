import { Direction } from './Direction';
import {Movements} from './Movements';
import { Player } from './Player';

export class MovementControls{
    constructor(
        private keyInput:Phaser.Input.InputPlugin,
        private movements:Movements,
    ){}
    private isPlayerPressAnyMovementKey:boolean = false;
    private isPlayerPressShiftKey:boolean = false;
    update(){
        const cursors = this.keyInput.keyboard.createCursorKeys();
        this.isPlayerPressAnyMovementKey = cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown;
        this.isPlayerPressShiftKey = cursors.shift.isDown;
        this.movements.setPlayerMovementType(this.isPlayerPressAnyMovementKey,this.isPlayerPressShiftKey);
        if(!this.isPlayerPressAnyMovementKey){
            this.movements.playerMovementCount = 0;
        }
        if(cursors.up.isDown){
            if(this.isPlayerPressShiftKey){
                if(this.getMovementsStep('r') === 1) this.movements.movePlayer(Direction.RUN_UP_1);
                if(this.getMovementsStep('r') === 2) this.movements.movePlayer(Direction.RUN_UP_3);
                if(this.getMovementsStep('r') === 3) this.movements.movePlayer(Direction.RUN_UP_2);
                if(this.getMovementsStep('r') === 4) this.movements.movePlayer(Direction.RUN_UP_3);
            }
            else{
                if(this.getMovementsStep('w')) this.movements.movePlayer(Direction.WALK_UP_1);
                else this.movements.movePlayer(Direction.WALK_UP_2);
            }
        }
        if(cursors.down.isDown){
            if(this.isPlayerPressShiftKey){
                if(this.getMovementsStep('r') === 1) this.movements.movePlayer(Direction.RUN_DOWN_1);
                if(this.getMovementsStep('r') === 2) this.movements.movePlayer(Direction.RUN_DOWN_3);
                if(this.getMovementsStep('r') === 3) this.movements.movePlayer(Direction.RUN_DOWN_2);
                if(this.getMovementsStep('r') === 4) this.movements.movePlayer(Direction.RUN_DOWN_3);
            }
            else{
                if(this.getMovementsStep('w')) this.movements.movePlayer(Direction.WALK_DOWN_1);
                else this.movements.movePlayer(Direction.WALK_DOWN_2);
            }
        }
        if(cursors.left.isDown){
            if(this.isPlayerPressShiftKey){
                if(this.getMovementsStep('r') === 1) this.movements.movePlayer(Direction.RUN_LEFT_1);
                if(this.getMovementsStep('r') === 2) this.movements.movePlayer(Direction.RUN_LEFT_3);
                if(this.getMovementsStep('r') === 3) this.movements.movePlayer(Direction.RUN_LEFT_2);
                if(this.getMovementsStep('r') === 4) this.movements.movePlayer(Direction.RUN_LEFT_3);
            }
            else{
                if(this.getMovementsStep('w')) this.movements.movePlayer(Direction.WALK_LEFT_1);
                else this.movements.movePlayer(Direction.WALK_LEFT_2);
            }
        }
        if(cursors.right.isDown){
            if(this.isPlayerPressShiftKey){
                if(this.getMovementsStep('r') === 1) this.movements.movePlayer(Direction.RUN_RIGHT_1);
                if(this.getMovementsStep('r') === 2) this.movements.movePlayer(Direction.RUN_RIGHT_3);
                if(this.getMovementsStep('r') === 3) this.movements.movePlayer(Direction.RUN_RIGHT_2);
                if(this.getMovementsStep('r') === 4) this.movements.movePlayer(Direction.RUN_RIGHT_3);
            }
            else{
                if(this.getMovementsStep('w')) this.movements.movePlayer(Direction.WALK_RIGHT_1);
                else this.movements.movePlayer(Direction.WALK_RIGHT_2);
            }
        }
    }
    private getMovementsStep(playerMovementType:string):number{
        if(playerMovementType === 'w'){
            return this.movements.playerMovementCount % 2;
        }
        if(playerMovementType === 'r'){
            if(this.movements.playerMovementCount === 0) return 1;
            if(this.movements.playerMovementCount === 1) return 2;  
            if(this.movements.playerMovementCount === 2) return 3;
            if(this.movements.playerMovementCount === 3) return 4;
            if(this.movements.playerMovementCount === 4){
                this.movements.playerMovementCount = 0;
            }
        }
    }
}