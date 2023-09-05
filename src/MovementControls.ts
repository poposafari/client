import { Direction } from './Direction';
import {Movements} from './Movements';

export class MovementControls{
    constructor(
        private keyInput:Phaser.Input.InputPlugin,
        private movements:Movements,
    ){}
    update(){
        const cursors = this.keyInput.keyboard.createCursorKeys();
        this.movements.isPlayerPressAnyMovementKey = cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown;
        this.movements.isPlayerPressShiftKey = cursors.shift.isDown;
        if(cursors.up.isDown){
            if(this.movements.isPlayerPressShiftKey){
                if(this.getMovementsStep()) this.movements.movePlayer(Direction.RUN_UP_1,cursors.up.getDuration());
                else this.movements.movePlayer(Direction.RUN_UP_2,cursors.up.getDuration());
            }
            else{
                if(this.getMovementsStep()) this.movements.movePlayer(Direction.WALK_UP_1,cursors.up.getDuration());
                else this.movements.movePlayer(Direction.WALK_UP_2,cursors.up.getDuration());
            }
        }
        if(cursors.down.isDown){
            if(this.movements.isPlayerPressShiftKey){
                if(this.getMovementsStep()) this.movements.movePlayer(Direction.RUN_DOWN_1,cursors.down.getDuration());
                else this.movements.movePlayer(Direction.RUN_DOWN_2,cursors.down.getDuration());
            }
            else{
                if(this.getMovementsStep()) this.movements.movePlayer(Direction.WALK_DOWN_1,cursors.down.getDuration());
                else this.movements.movePlayer(Direction.WALK_DOWN_2,cursors.down.getDuration());
            }
        }
        if(cursors.left.isDown){
            if(this.movements.isPlayerPressShiftKey){
                if(this.getMovementsStep()) this.movements.movePlayer(Direction.RUN_LEFT_1,cursors.left.getDuration());
                else this.movements.movePlayer(Direction.RUN_LEFT_2,cursors.left.getDuration());
            }
            else{
                if(this.getMovementsStep()) this.movements.movePlayer(Direction.WALK_LEFT_1,cursors.left.getDuration());
                else this.movements.movePlayer(Direction.WALK_LEFT_2,cursors.left.getDuration());
            }
        }
        if(cursors.right.isDown){
            if(this.movements.isPlayerPressShiftKey){
                if(this.getMovementsStep()) this.movements.movePlayer(Direction.RUN_RIGHT_1,cursors.right.getDuration());
                else this.movements.movePlayer(Direction.RUN_RIGHT_2,cursors.right.getDuration());    
            }
            else{
                if(this.getMovementsStep()) this.movements.movePlayer(Direction.WALK_RIGHT_1,cursors.right.getDuration());
                else this.movements.movePlayer(Direction.WALK_RIGHT_2,cursors.right.getDuration());
            }
        }
    }
    private getMovementsStep():number{
        return this.movements.playerMovementCount % 2;
    }
}