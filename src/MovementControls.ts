import { Direction } from './Direction';
import {Movements} from './Movements';
import { Player } from './Player';

export class MovementControls{
    constructor(
        private keyInput:Phaser.Input.InputPlugin,
        private movements:Movements,
    ){}
    update(){
        const cursors = this.keyInput.keyboard.createCursorKeys();
        this.movements.isPlayerPressAnyMovementKey = cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown;
        this.movements.isPlayerPressShiftKey = cursors.shift.isDown;
        
        if(!this.movements.isPlayerPressAnyMovementKey){
            this.movements.playerMovementCount = 0;
        }
        if(cursors.up.isDown){
            if(this.movements.isPlayerPressShiftKey){
                if(this.getMovementsStep('r') === 1) this.movements.movePlayer(Direction.RUN_UP_1,cursors.up.getDuration());
                if(this.getMovementsStep('r') === 2) this.movements.movePlayer(Direction.RUN_UP_3,cursors.up.getDuration());
                if(this.getMovementsStep('r') === 3) this.movements.movePlayer(Direction.RUN_UP_2,cursors.up.getDuration());
                if(this.getMovementsStep('r') === 4) this.movements.movePlayer(Direction.RUN_UP_3,cursors.up.getDuration());
            }
            else{
                if(this.getMovementsStep('w')) this.movements.movePlayer(Direction.WALK_UP_1,cursors.up.getDuration());
                else this.movements.movePlayer(Direction.WALK_UP_2,cursors.up.getDuration());
            }
        }
        if(cursors.down.isDown){
            if(this.movements.isPlayerPressShiftKey){
                if(this.getMovementsStep('r') === 1) this.movements.movePlayer(Direction.RUN_DOWN_1,cursors.down.getDuration());
                if(this.getMovementsStep('r') === 2) this.movements.movePlayer(Direction.RUN_DOWN_3,cursors.down.getDuration());
                if(this.getMovementsStep('r') === 3) this.movements.movePlayer(Direction.RUN_DOWN_2,cursors.down.getDuration());
                if(this.getMovementsStep('r') === 4) this.movements.movePlayer(Direction.RUN_DOWN_3,cursors.down.getDuration());
            }
            else{
                if(this.getMovementsStep('w')) this.movements.movePlayer(Direction.WALK_DOWN_1,cursors.down.getDuration());
                else this.movements.movePlayer(Direction.WALK_DOWN_2,cursors.down.getDuration());
            }
        }
        if(cursors.left.isDown){
            if(this.movements.isPlayerPressShiftKey){
                if(this.getMovementsStep('r') === 1) this.movements.movePlayer(Direction.RUN_LEFT_1,cursors.left.getDuration());
                if(this.getMovementsStep('r') === 2) this.movements.movePlayer(Direction.RUN_LEFT_3,cursors.left.getDuration());
                if(this.getMovementsStep('r') === 3) this.movements.movePlayer(Direction.RUN_LEFT_2,cursors.left.getDuration());
                if(this.getMovementsStep('r') === 4) this.movements.movePlayer(Direction.RUN_LEFT_3,cursors.left.getDuration());
            }
            else{
                if(this.getMovementsStep('w')) this.movements.movePlayer(Direction.WALK_LEFT_1,cursors.left.getDuration());
                else this.movements.movePlayer(Direction.WALK_LEFT_2,cursors.left.getDuration());
            }
        }
        if(cursors.right.isDown){
            if(this.movements.isPlayerPressShiftKey){
                if(this.getMovementsStep('r') === 1) this.movements.movePlayer(Direction.RUN_RIGHT_1,cursors.right.getDuration());
                if(this.getMovementsStep('r') === 2) this.movements.movePlayer(Direction.RUN_RIGHT_3,cursors.right.getDuration());
                if(this.getMovementsStep('r') === 3) this.movements.movePlayer(Direction.RUN_RIGHT_2,cursors.right.getDuration());
                if(this.getMovementsStep('r') === 4) this.movements.movePlayer(Direction.RUN_RIGHT_3,cursors.right.getDuration());
            }
            else{
                if(this.getMovementsStep('w')) this.movements.movePlayer(Direction.WALK_RIGHT_1,cursors.right.getDuration());
                else this.movements.movePlayer(Direction.WALK_RIGHT_2,cursors.right.getDuration());
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