import Phaser from 'phaser';

declare global {
  type GImage = Phaser.GameObjects.Image;
  type GSprite = Phaser.GameObjects.Sprite;
  type GText = Phaser.GameObjects.Text;
  type GContainer = Phaser.GameObjects.Container;
  type GWindow = Phaser.GameObjects.NineSlice;
}
