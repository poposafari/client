// import i18next from 'i18next';
// import { OverworldMode } from '../modes-test';
// import { InGameScene } from '../scenes/ingame-scene';
// import { addImage, addText, Ui } from './ui';
// import { TEXTSTYLE } from '../enums/textstyle';
// import { DEPTH } from '../enums/depth';
// import { TEXTURE } from '../enums/texture';
// import { PlayerInfo } from '../storage/player-info';

// export class OverworldInfoUi extends Ui {
//   private mode: OverworldMode;
//   private container!: Phaser.GameObjects.Container;
//   private titles: Phaser.GameObjects.Text[] = [];
//   private textMyCandy!: Phaser.GameObjects.Text;
//   private textLocation!: Phaser.GameObjects.Text;
//   private textPosition!: Phaser.GameObjects.Text;

//   constructor(scene: InGameScene, mode: OverworldMode) {
//     super(scene);
//     this.mode = mode;
//   }

//   setup(): void {
//     const width = this.getWidth();
//     const height = this.getHeight();

//     this.container = this.scene.add.container(width / 2 - 920, height / 2 - 500);

//     const iconLocation = addImage(this.scene, TEXTURE.MENU_LOCATION, 0, 0).setScale(2);
//     const iconCandy = addImage(this.scene, TEXTURE.MENU_CANDY, 0, +50).setScale(2);

//     this.textLocation = addText(this.scene, +30, 0, '', TEXTSTYLE.MESSAGE_WHITE).setOrigin(0, 0.5);
//     this.textMyCandy = addText(this.scene, +30, +50, '', TEXTSTYLE.MESSAGE_WHITE).setOrigin(0, 0.5);
//     this.textPosition = addText(this.scene, this.textMyCandy.displayWidth, +50, '', TEXTSTYLE.MESSAGE_WHITE).setOrigin(0, 0.5);

//     this.container.add(iconLocation);
//     this.container.add(this.textLocation);
//     this.container.add(this.textPosition);
//     this.container.add(iconCandy);
//     this.container.add(this.textMyCandy);

//     this.container.setVisible(false);
//     this.container.setDepth(DEPTH.OVERWORLD_UI);
//     this.container.setScrollFactor(0);
//   }

//   show(data?: any): void {
//     this.container.setVisible(true);
//     this.pause(false);
//   }

//   clean(data?: any): void {
//     this.container.setVisible(false);
//     this.pause(true);
//   }

//   pause(onoff: boolean, data?: any): void {
//     onoff ? this.block() : this.unblock();
//   }

//   update(): void {}

//   private block() {}

//   private unblock() {}

//   updateMyCandy() {
//     const playerInfo = PlayerInfo.getInstance();

//     if (!playerInfo) {
//       throw Error('Player Info does not exist.');
//     }

//     const playerCandy = playerInfo.getCandy();
//     this.textMyCandy.setText(`${playerCandy.toString()}${i18next.t('menu:candy')}`);
//   }

//   updateLocation() {
//     const playerInfo = PlayerInfo.getInstance();

//     if (!playerInfo) {
//       throw Error('Player Info does not exist.');
//     }

//     this.textLocation.setText(i18next.t(`menu:overworld_${playerInfo.getLocation()}`));
//     this.textPosition.setPosition(this.textLocation.displayWidth + 35, this.textLocation.y);
//   }

//   updatePosition() {
//     const playerInfo = PlayerInfo.getInstance();
//     this.textPosition.setText(`(X:${playerInfo.getPosX()}/Y:${playerInfo.getPosY()})`);
//   }
// }
