import * as Phaser from "phaser";
import { Direction } from "./constants/Direction";
import { IMAGE_KEY, SPRITE_DEPTH, TILE_SIZE } from "./constants/Game";

export class GridObject{
  constructor(
    private index: string,
    private sprite: Phaser.GameObjects.Sprite,
    private tilePos: Phaser.Math.Vector2,
  ) {
      const offsetX = TILE_SIZE/2;
      const offsetY = TILE_SIZE;

      this.sprite.setOrigin(0.5, 1);
      this.sprite.setPosition(
        tilePos.x * TILE_SIZE + offsetX,
        tilePos.y * TILE_SIZE + offsetY
    );
    this.sprite.setFrame(0);
  }
  getIndex():string{
    return this.index;
  }
  getPosition(): Phaser.Math.Vector2 {
    return this.sprite.getBottomCenter();
  }
  setPosition(position: Phaser.Math.Vector2): void {
    this.sprite.setPosition(position.x, position.y);
  }
  getTilePos(): Phaser.Math.Vector2 {
    return this.tilePos.clone();
  }
  setTilePos(tilePosition: Phaser.Math.Vector2): void {
    this.tilePos = tilePosition.clone();
  }
  getSpriteInfo(){
    return this.sprite;
  }
  standStopAnimation(direction: Direction){
    const splitString = direction.split('_')[2];
    const animationManager = this.sprite.anims.animationManager;
    this.sprite.setFrame(animationManager.get(this.index+`_walk_${splitString}_1`).frames[1].frame.name);
    this.sprite.anims.stop();
  }
  stopAnimation(direction: Direction){
    const animationManager = this.sprite.anims.animationManager;
    this.sprite.setFrame(animationManager.get(this.index+direction).frames[1].frame.name);
    //player run logic should add.
    this.sprite.anims.stop();
  }
  startAnimation(direction: Direction){
    this.sprite.anims.play(this.index+direction);
  }
  setHide(type: boolean){
    if(type){this.sprite.setVisible(false)}
    else{this.sprite.setVisible(true)}
  }
  setDepth(value: SPRITE_DEPTH){
    this.sprite.setDepth(value);
  }
  getDepth(): number{
    return this.sprite.depth;
  }
  destroySprite(){
    this.sprite.destroy();
  }
}