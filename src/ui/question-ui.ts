import i18next from 'i18next';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, Ui } from './ui';
import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { KeyboardManager } from '../managers';

export class QuestionUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private texts: Phaser.GameObjects.Text[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];
  private selectedIndex: number = 0;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();
    const contentHeight = 50;
    const spacing = 5;
    const lists = [i18next.t('menu:accept'), i18next.t('menu:reject')];
    const totalContentsHeight = lists.length * (contentHeight + spacing) - spacing;
    const windowWidth = 300;

    this.container = this.scene.add.container(width / 2, height / 2);

    const window = addWindow(this.scene, TEXTURE.WINDOW_0, 0, 0, windowWidth, totalContentsHeight, 8, 8, 8, 8);

    lists.forEach((key, index) => {
      const yPosition = contentHeight / 2 + index * (contentHeight + spacing);
      const text = addText(this.scene, 0, yPosition, key, TEXTSTYLE.OVERWORLD_LIST).setOrigin(0.5, 0.5);
      const dummy = addImage(this.scene, TEXTURE.BLANK, -180, yPosition).setScale(1.5);

      this.texts.push(text);
      this.dummys.push(dummy);
    });

    this.container.add(window);
    this.container.add(this.texts);
    this.container.add(this.dummys);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI + 2);
    this.container.setScrollFactor(0);
  }

  async show(): Promise<string> {
    this.container.setVisible(true);

    return new Promise((resolve) => {
      const keyboardManager = KeyboardManager.getInstance();
      const keys = [KEY.UP, KEY.DOWN, KEY.SELECT];

      keyboardManager.setAllowKey(keys);
      keyboardManager.setKeyDownCallback((key) => {
        const prevIndex = this.selectedIndex;

        switch (key) {
          case KEY.UP:
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
            break;
          case KEY.DOWN:
            this.selectedIndex = Math.min(this.texts.length - 1, this.selectedIndex + 1);
            break;
          case KEY.SELECT:
            this.container.setVisible(false);
            resolve(this.selectedIndex === 0 ? 'accept' : 'reject');
            break;
        }

        if (this.selectedIndex !== prevIndex) {
          this.updateSelection(prevIndex, this.selectedIndex);
        }
      });
    });
  }

  private updateSelection(prevIndex: number, currentIndex: number): void {
    this.dummys[prevIndex].setTexture(TEXTURE.BLANK);
    this.dummys[currentIndex].setTexture(TEXTURE.WINDOW_3);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}
}
