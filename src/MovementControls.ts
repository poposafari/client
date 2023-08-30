import { Direction } from './Direction';
import {Movements} from './Movements';

export class MovementControls{
    constructor(
        private keyInput:Phaser.Input.InputPlugin,
        private movements:Movements,
    ){}
    update(){
        const cursors = this.keyInput.keyboard.createCursorKeys();
        if (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown) {
            if(cursors.left.isDown){
                if(this.getMovementsStep()) this.movements.movePlayer(Direction.WALK_LEFT_1);
                else this.movements.movePlayer(Direction.WALK_LEFT_2);
            }
            else if(cursors.right.isDown){
                if(this.getMovementsStep()) this.movements.movePlayer(Direction.WALK_RIGHT_1);
                else this.movements.movePlayer(Direction.WALK_RIGHT_2);
            }
            else if(cursors.up.isDown){
                if(this.getMovementsStep()) this.movements.movePlayer(Direction.WALK_UP_1);
                else this.movements.movePlayer(Direction.WALK_UP_2);
            }
            else if(cursors.down.isDown){
                if(this.getMovementsStep()) this.movements.movePlayer(Direction.WALK_DOWN_1);
                else this.movements.movePlayer(Direction.WALK_DOWN_2);
            }
        }
    }
    private getMovementsStep():number{
        return this.movements.playerMovementCount % 2;
    }
}