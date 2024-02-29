import { Behavior } from "./Behavior";
import { Player } from "./Player";
import { Pokemon } from "./Pokemon";
import { Direction } from "./constants/Direction";
import { BEHAVIOR_STATUS, MOVEMENT_SPEED, TILE_SIZE } from "./constants/Game";
import EventManager, { EVENTS } from "./manager/EventManager";
import { MapScene } from "./scene/MapScene";

const Vector2 = Phaser.Math.Vector2;

export class Movement{
    constructor(
        private owner: Player | Pokemon,
    ){}
    
    private movementType:string = null;

    private movementStep:number = 0;
    private walkStep:number = 0;
    private runStep:number = 0;

    private tileSizePixelsWalked:number = 0;
    private pixelsToWalkThisUpdate:number = 0;

    isMovementFinish:boolean = true;

    private movementDirectionQueue:Array<Direction> = [];
    private movementDirection:Direction = Direction.NONE;
    lastMovementDirection:Direction = Direction.WALK_DOWN_1;

    private petMovementDirection:Direction = Direction.NONE;
    private petMovementHistory: Array<String>=[];
    private isPetMovementChange:boolean = false;

    private movementDirectionVectors: {
        [key in Direction]?: Phaser.Math.Vector2;
      } = {
        [Direction.WALK_UP_1]: Vector2.UP,
        [Direction.WALK_UP_2]: Vector2.UP,
        [Direction.WALK_DOWN_1]: Vector2.DOWN,
        [Direction.WALK_DOWN_2]: Vector2.DOWN,
        [Direction.WALK_LEFT_1]: Vector2.LEFT,
        [Direction.WALK_LEFT_2]: Vector2.LEFT,
        [Direction.WALK_RIGHT_1]: Vector2.RIGHT,
        [Direction.WALK_RIGHT_2]: Vector2.RIGHT,
        [Direction.RUN_UP_1]: Vector2.UP,
        [Direction.RUN_UP_2]: Vector2.UP,
        [Direction.RUN_UP_3]: Vector2.UP,
        [Direction.RUN_DOWN_1]: Vector2.DOWN,
        [Direction.RUN_DOWN_2]: Vector2.DOWN,
        [Direction.RUN_DOWN_3]: Vector2.DOWN,
        [Direction.RUN_LEFT_1]: Vector2.LEFT,
        [Direction.RUN_LEFT_2]: Vector2.LEFT,
        [Direction.RUN_LEFT_3]: Vector2.LEFT,
        [Direction.RUN_RIGHT_1]: Vector2.RIGHT,
        [Direction.RUN_RIGHT_2]: Vector2.RIGHT,
        [Direction.RUN_RIGHT_3]: Vector2.RIGHT,
    };
    setWalkDirection(data:object):Direction{
        if(data['up']){
            if(this.getWalkStep()){return Direction.WALK_UP_1}
            else{return Direction.WALK_UP_2}
        }
        if(data['down']){
            if(this.getWalkStep()){return Direction.WALK_DOWN_1}
            else{return Direction.WALK_DOWN_2}
        }
        if(data['left']){
            if(this.getWalkStep()){return Direction.WALK_LEFT_1}
            else{return Direction.WALK_LEFT_2}
        }
        if(data['right']){
            if(this.getWalkStep()){return Direction.WALK_RIGHT_1}
            else{return Direction.WALK_RIGHT_2}
        }
    }
    setRunDirection(data:object):Direction{
        if(data['up']){
            if(this.getRunStep() === 1){return Direction.RUN_UP_1}
            if(this.getRunStep() === 2){return Direction.RUN_UP_3}
            if(this.getRunStep() === 3){return Direction.RUN_UP_2}
            if(this.getRunStep() === 4){return Direction.RUN_UP_3}
        }
        if(data['down']){
            if(this.getRunStep() === 1){return Direction.RUN_DOWN_1}
            if(this.getRunStep() === 2){return Direction.RUN_DOWN_3}
            if(this.getRunStep() === 3){return Direction.RUN_DOWN_2}
            if(this.getRunStep() === 4){return Direction.RUN_DOWN_3}
        }
        if(data['left']){
            if(this.getRunStep() === 1){return Direction.RUN_LEFT_1}
            if(this.getRunStep() === 2){return Direction.RUN_LEFT_3}
            if(this.getRunStep() === 3){return Direction.RUN_LEFT_2}
            if(this.getRunStep() === 4){return Direction.RUN_LEFT_3}
        }
        if(data['right']){
            if(this.getRunStep() === 1){return Direction.RUN_RIGHT_1}
            if(this.getRunStep() === 2){return Direction.RUN_RIGHT_3}
            if(this.getRunStep() === 3){return Direction.RUN_RIGHT_2}
            if(this.getRunStep() === 4){return Direction.RUN_RIGHT_3}
        }
    }
    addMovementDirectionQueue(direction:Direction){
        this.movementDirectionQueue.push(direction);
    }
    private getWalkStep(){
        if(this.walkStep === 0){return 1;}
        if(this.walkStep === 1){return 0;}
        if(this.walkStep === 2){
            this.walkStep = 0;
            return 1;
        }
    }
    private getRunStep(){
        if(this.runStep === 0){return 1;}
        if(this.runStep === 1){return 2;}
        if(this.runStep === 2){return 3;}
        if(this.runStep === 3){return 4;}
        if(this.runStep === 4){
            this.runStep = 0;
            return 1;
        }
    }
    update(){
        if(this.isMovementFinish && this.movementDirectionQueue.length > 0){
            this.ready(this.movementDirectionQueue.shift());
        }
        if(this.isMoving()){this.updatePosition();}
    }
    ready(direction: Direction){
        if(this.isMoving()){return;}
        if(this.isBlockingDirection(direction)){this.owner.standStopAnimation(direction);}
        else{
            this.movementType = this.getMovementType(direction);
            this.setMovementSpeed();
            this.movementDirection = direction;
            this.owner.startAnimation(this.movementDirection);
            this.owner.setTilePos(this.owner.getTilePos().add(this.movementDirectionVectors[this.movementDirection]));
    
            if(this.isPlayer(this.owner)){
                if(this.owner.getPosition().x - this.owner.getPet().getPosition().x > 0){this.petMovementDirection = Direction.WALK_RIGHT_1}
                if(this.owner.getPosition().x - this.owner.getPet().getPosition().x < 0){this.petMovementDirection = Direction.WALK_LEFT_1}
                if(this.owner.getPosition().y - this.owner.getPet().getPosition().y > 0){this.petMovementDirection = Direction.WALK_DOWN_1}
                if(this.owner.getPosition().y - this.owner.getPet().getPosition().y < 0){this.petMovementDirection = Direction.WALK_UP_1}
                
                this.setPetMovementHistory();
                this.owner.getPet().setTilePos(this.owner.getPet().getTilePos().add(this.movementDirectionVectors[this.petMovementDirection]));
                
                if(this.isPetMovementChange){
                    this.owner.getPet().startAnimation(this.petMovementDirection);
                    this.isPetMovementChange = false;
                }
            }
        }
    }
    getDirection():Direction{
        return this.movementDirection;
    }
    getPostion():Phaser.Math.Vector2{
        return this.owner.getPosition();
    }
    standStopMoving(direction:Direction){
        this.owner.standStopAnimation(direction);
    }
    private getMovementType(direction: Direction):string{
        return direction.split('_')[1];
    }
    private setMovementSpeed(){
        if(this.movementType === 'walk'){this.pixelsToWalkThisUpdate = MOVEMENT_SPEED}
        if(this.movementType === 'run'){this.pixelsToWalkThisUpdate = MOVEMENT_SPEED*2}
    }
    private updatePosition(){
        if(this.willCrossTileBorderThisUpdate(this.pixelsToWalkThisUpdate)){
            this.moveSprite(this.pixelsToWalkThisUpdate);

            if(this.movementType === 'walk'){this.walkStep++;}
            if(this.movementType === 'run'){this.runStep++;}
            this.movementStep++;
        
            this.lastMovementDirection = this.movementDirection;
            this.stopMoving();
            this.isMovementFinish = true;
        }
        else{
            this.moveSprite(this.pixelsToWalkThisUpdate);
            this.isMovementFinish = false;
        }

        if(this.isPlayer(this.owner)){
            this.owner.setNicknamePosition(this.owner.getPosition());
        }
    }
    private stopMoving(){
        this.owner.stopAnimation(this.movementDirection);
        this.movementDirection = Direction.NONE;

        if(this.isPlayer(this.owner)){
            this.petMovementDirection = Direction.NONE;
        }
    }
    private moveSprite(pixelsToWalkThisUpdate:number){       
        const playerDirectionVector = this.movementDirectionVectors[this.lastMovementDirection].clone();
        const playerMovementDistance = playerDirectionVector.multiply(new Vector2(pixelsToWalkThisUpdate));
        const newPlayerPos = this.owner.getPosition().add(playerMovementDistance);
        this.owner.setPosition(newPlayerPos);

        if(this.isPlayer(this.owner)){
            const petDirectionVector = this.movementDirectionVectors[this.petMovementDirection].clone();
            const petMovementDistance = petDirectionVector.multiply(new Vector2(pixelsToWalkThisUpdate));
            const newPetPos = this.owner.getPet().getPosition().add(petMovementDistance);
            this.owner.getPet().setPosition(newPetPos);
        }

        this.tileSizePixelsWalked += pixelsToWalkThisUpdate;
        this.tileSizePixelsWalked %= TILE_SIZE;
    }
    private willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate: number):boolean{
        return this.tileSizePixelsWalked+pixelsToWalkThisUpdate >= TILE_SIZE;
    }
    private setPetMovementHistory(): void{
        this.petMovementHistory.push(this.petMovementDirection);
        if(this.petMovementHistory.length > 2){this.petMovementHistory.shift();}
        if(this.petMovementHistory[0] != this.petMovementHistory[1]){this.isPetMovementChange = true;}
        else{this.isPetMovementChange = false;}
    }
    private isBlockingDirection(direction: Direction): boolean {
        this.isMovementFinish = true;
        this.lastMovementDirection = direction;
        return this.hasBlockingTile(this.tilePosInDirection(direction));
    }
    private tilePosInDirection(direction: Direction): Phaser.Math.Vector2 {
        return this.owner
            .getTilePos()
            .add(this.movementDirectionVectors[direction]);
    }
    private hasBlockingTile(pos: Phaser.Math.Vector2): boolean {
        if (this.hasNoTile(pos)) return true;
        return MapScene.map.layers.some((layer) => {
            const tile = MapScene.map.getTileAt(pos.x, pos.y, false, layer.name);
            return tile && tile.properties.collides;
        }); 
    }
    private hasNoTile(pos: Phaser.Math.Vector2): boolean {
        return !MapScene.map.layers.some((layer) =>
            MapScene.map.hasTileAt(pos.x, pos.y, layer.name)
        );
    }
    private isPlayer(object:any):object is Player{
        return object instanceof Player;
    }
    private isMoving(){
        return this.movementDirection != Direction.NONE;
    }
}