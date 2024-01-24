import { GridObject } from "./GridObject";

export const enum ITEM_CODE{
  NONE = "none",
  POKE_BALL_IMAGE = "item_0_image",
  POKE_BALL_THROWN = "item_0_thrown",
  POKE_BALL_GROUND = "item_0_ground",
  GREAT_BALL_IMAGE = "item_1_image",
  GREAT_BALL_THROWN = "item_1_thrown",
  GREAT_BALL_GROUND = "item_1_ground",
  ULTRA_BALL_IMAGE = "item_2_image",
  ULTRA_BALL_THROWN = "item_2_thrown",
  ULTRA_BALL_GROUND = "item_2_ground",
  MASTER_BALL_IMAGE = "item_3_image",
  MASTER_BALL_THROWN = "item_3_thrown",
  MASTER_BALL_GROUND = "item_3_ground",
}

export class Item extends GridObject{
  constructor(
    sprite: Phaser.GameObjects.Sprite,
    tilePos: Phaser.Math.Vector2
  ){
    super(sprite,tilePos);
  }
}