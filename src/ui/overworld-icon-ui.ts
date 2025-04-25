import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';

export class OverworldIconUi extends Ui {
  private mode: OverworldMode;
  private container!: Phaser.GameObjects.Container;
  private icons: Phaser.GameObjects.Image[] = [];
  private iconTitles: Phaser.GameObjects.Text[] = [];
  private readonly contents: string[] = [TEXTURE.MENU_SHOES, TEXTURE.MENU_ICON];
  private readonly guides: string[] = [TEXTURE.KEY_R, TEXTURE.KEY_S];
  private readonly guideTexts: string[] = [i18next.t('menu:guide_runningshoes'), i18next.t('menu:guide_menu')];

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    const slotSize = 55;
    const slotSpacing = 5;

    this.container = this.scene.add.container(width / 2, height / 2 + 507);

    this.contents.forEach((key, index) => {
      const xPosition = index * (slotSize + slotSpacing);
      const yPosition = 0;

      const icon = addImage(this.scene, key, xPosition + 860, yPosition).setScale(2);
      const guideText = addImage(this.scene, this.guides[index], xPosition + 840, yPosition - 20);
      const guideTitle = addText(this.scene, xPosition + 860, yPosition - 45, this.guideTexts[index], TEXTSTYLE.INPUT_GUIDE_WHITE).setScale(0.7);

      icon.setInteractive();
      guideTitle.setVisible(false);

      this.icons.push(icon);
      this.iconTitles.push(guideTitle);

      this.container.add(icon);
      this.container.add(guideText);
      this.container.add(guideTitle);
    });

    for (let i = 0; i < this.icons.length; i++) {
      this.icons[i].setScrollFactor(0);

      this.icons[i].on('pointerover', () => {
        this.iconTitles[i].setVisible(true);
      });

      this.icons[i].on('pointerout', () => {
        this.iconTitles[i].setVisible(false);
      });
    }

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.pause(false);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.pause(true);
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}
}
