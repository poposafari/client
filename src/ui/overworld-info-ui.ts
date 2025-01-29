import i18next from 'i18next';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { DEPTH } from '../enums/depth';
import { TEXTURE } from '../enums/texture';

export class OverworldInfoUi extends Ui {
  private mode: OverworldMode;
  private container!: Phaser.GameObjects.Container;
  private titles: Phaser.GameObjects.Text[] = [];
  private textMyMoney!: Phaser.GameObjects.Text;
  private textLocation!: Phaser.GameObjects.Text;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.scene.add.container(width / 2 - 920, height / 2 - 500);

    const iconLocation = addImage(this.scene, TEXTURE.MENU_LOCATION, 0, 0).setScale(0.8);
    const iconMoney = addImage(this.scene, TEXTURE.MENU_MONEY, 0, +50).setScale(1.2);

    this.textLocation = addText(this.scene, +30, 0, '', TEXTSTYLE.MESSAGE_WHITE).setOrigin(0, 0.5);
    this.textMyMoney = addText(this.scene, +30, +50, '', TEXTSTYLE.MESSAGE_WHITE).setOrigin(0, 0.5);

    this.container.add(iconLocation);
    this.container.add(this.textLocation);
    this.container.add(iconMoney);
    this.container.add(this.textMyMoney);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.pause(false);
    this.updateData();
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.pause(true);
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}

  updateData() {
    const playerInfoManager = this.mode.getPlayerInfoManager();
    const playerLocation = playerInfoManager.getInfo().currentOverworld;
    const playerMoney = playerInfoManager.getInfo().money;

    this.textLocation.setText(i18next.t(`menu:overworld_${playerLocation}`));
    this.textMyMoney.setText(`$ ${playerMoney.toString()}`);
  }
}
