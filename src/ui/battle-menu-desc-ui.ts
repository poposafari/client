import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes-test';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { PlayerItem } from '../object/player-item';

export class BattleMenuDescUi extends Ui {
  private mode: OverworldMode;

  private container!: Phaser.GameObjects.Container;
  private window!: Phaser.GameObjects.NineSlice;
  private icon!: Phaser.GameObjects.Image;
  private text!: Phaser.GameObjects.Text;

  private readonly scale: number = 2;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.scene.add.container(width / 2 - 240, height / 2 + 440);

    this.window = addWindow(this.scene, TEXTURE.WINDOW_2, 0, 0, 720, 100, 16, 16, 16, 16).setScale(this.scale);
    this.icon = addImage(this.scene, `item000`, -610, 0).setScale(2.4);
    this.text = addText(this.scene, -500, -20, i18next.t(`item:000.description`), TEXTSTYLE.BATTLE_MENU).setOrigin(0, 0.5).setScale(0.6);

    this.container.add(this.window);
    this.container.add(this.icon);
    this.container.add(this.text);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE_UI + 6);
    this.container.setScrollFactor(0);
  }

  show(data?: PlayerItem): void {
    this.updateDesc(data);

    this.container.setVisible(true);
  }

  clean(data?: any): void {
    this.cleanDesc();
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}

  updateDesc(item: PlayerItem | undefined) {
    if (!item) {
      this.cleanDesc();
      return;
    }
    this.icon.setTexture(`item${item.getKey()}`);
    this.text.setText(i18next.t(`item:${item.getKey()}.description`));
  }

  private cleanDesc() {
    this.icon.setTexture(TEXTURE.BLANK);
    this.text.setText('');
  }
}
