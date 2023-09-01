import { Direction } from './Direction';
import {Movements} from './Movements';

export class MovementControls{
    constructor(
        private keyInput:Phaser.Input.InputPlugin,
        private movements:Movements,
    ){}
    update(){
        const cursors = this.keyInput.keyboard.createCursorKeys();
        if(cursors.left.isDown === false || cursors.right.isDown === false || cursors.up.isDown === false || cursors.down.isDown === false){
            this.movements.isKeyUpMovement = true;
        }
        if(cursors.shift.isDown){
            if(cursors.left.isDown){
                if(this.getMovementsStep()) this.movements.movePlayer(Direction.RUN_LEFT_1,cursors.left.getDuration());
                else this.movements.movePlayer(Direction.RUN_LEFT_2,cursors.left.getDuration());
            }
            else if(cursors.right.isDown){
                if(this.getMovementsStep()) this.movements.movePlayer(Direction.RUN_RIGHT_1,cursors.right.getDuration());
                else this.movements.movePlayer(Direction.RUN_RIGHT_2,cursors.right.getDuration());
            }
            else if(cursors.up.isDown){
                if(this.getMovementsStep()) this.movements.movePlayer(Direction.RUN_UP_1,cursors.up.getDuration());
                else this.movements.movePlayer(Direction.RUN_UP_2,cursors.up.getDuration());
            }
            else if(cursors.down.isDown){
                if(this.getMovementsStep()) this.movements.movePlayer(Direction.RUN_DOWN_1,cursors.down.getDuration());
                else this.movements.movePlayer(Direction.RUN_DOWN_2,cursors.down.getDuration());
            }
        }
        else{
            if(cursors.left.isDown){
                if(this.getMovementsStep()) this.movements.movePlayer(Direction.WALK_LEFT_1,cursors.left.getDuration());
                else this.movements.movePlayer(Direction.WALK_LEFT_2,cursors.left.getDuration());
            }
            else if(cursors.right.isDown){
                if(this.getMovementsStep()) this.movements.movePlayer(Direction.WALK_RIGHT_1,cursors.right.getDuration());
                else this.movements.movePlayer(Direction.WALK_RIGHT_2,cursors.right.getDuration());
            }
            else if(cursors.up.isDown){
                if(this.getMovementsStep()) this.movements.movePlayer(Direction.WALK_UP_1,cursors.up.getDuration());
                else this.movements.movePlayer(Direction.WALK_UP_2,cursors.up.getDuration());
            }
            else if(cursors.down.isDown){
                if(this.getMovementsStep()) this.movements.movePlayer(Direction.WALK_DOWN_1,cursors.down.getDuration());
                else this.movements.movePlayer(Direction.WALK_DOWN_2,cursors.down.getDuration());
            }
        }
    }
    private getMovementsStep():number{
        return this.movements.playerMovementCount % 2;
    }
}