import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager } from '../managers';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { PokeBoxUi } from './pokebox-ui';
import { addImage, addText, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { PokeboxBoxMenuUi } from './pokebox-box-menu-ui';

export class PokeboxBoxUi extends Ui {
  private mode: OverworldMode;
  private pokeboxUi: PokeBoxUi;
  private pokeboxBoxMenuUi: PokeboxBoxMenuUi;

  private lastPage!: number | null;

  private container!: Phaser.GameObjects.Container;
  private titleContainer!: Phaser.GameObjects.Container;

  private arrowLeft!: Phaser.GameObjects.Image;
  private arrowRight!: Phaser.GameObjects.Image;
  private finger!: Phaser.GameObjects.Image;

  private boxTitle!: Phaser.GameObjects.Text;

  private readonly MaxIndex: number = 17;

  constructor(scene: InGameScene, mode: OverworldMode, pokeboxUi: PokeBoxUi) {
    super(scene);
    this.mode = mode;
    this.pokeboxUi = pokeboxUi;

    this.pokeboxBoxMenuUi = new PokeboxBoxMenuUi(scene, mode, pokeboxUi, this);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.pokeboxBoxMenuUi.setup();

    this.container = this.scene.add.container(width / 2, height / 2);
    this.titleContainer = this.scene.add.container(width / 2, height / 2);

    this.arrowLeft = addImage(this.scene, TEXTURE.ARROW_BOX, -685, -400);
    this.arrowRight = addImage(this.scene, TEXTURE.ARROW_BOX, +225, -400).setFlipX(true);

    this.finger = addImage(this.scene, TEXTURE.FINGER, -200, -370).setScale(3);

    this.arrowLeft.setScale(3);
    this.arrowRight.setScale(3);

    this.boxTitle = addText(this.scene, -290, -390, i18next.t(`menu:box`) + '1', TEXTSTYLE.BOX_NAME)
      .setScale(0.8)
      .setOrigin(0, 0.5);
    this.titleContainer.add(this.boxTitle);

    this.container.add(this.arrowLeft);
    this.container.add(this.arrowRight);
    this.container.add(this.finger);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.container.setScrollFactor(0);

    this.titleContainer.setVisible(false);
    this.titleContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.titleContainer.setScrollFactor(0);

    this.lastPage = null;
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.pause(false);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.pause(true);
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  update(time: number, delta: number): void {}

  showBoxTitle() {
    this.titleContainer.setVisible(true);
  }

  cleanBoxTitle() {
    this.titleContainer.setVisible(false);
  }

  private block() {}

  private unblock() {
    const keys = [KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];
    const keyboardManager = KeyboardManager.getInstance();

    let page = this.lastPage ? this.lastPage : 0;
    // console.log('pokebox-box-ui page is' + page);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback((key) => {
      const prevPage = page;

      try {
        switch (key) {
          case KEY.DOWN:
            this.lastPage = page;
            this.clean();
            this.pokeboxUi.pause(false);
            break;
          case KEY.SELECT:
            this.lastPage = page;
            this.pokeboxBoxMenuUi.show(page + 1);
            break;
          case KEY.LEFT:
            page = (page - 1 + this.MaxIndex + 1) % (this.MaxIndex + 1);
            break;
          case KEY.RIGHT:
            page = (page + 1) % (this.MaxIndex + 1);
            break;
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }

      if (key === KEY.LEFT || key === KEY.RIGHT) {
        if (page !== prevPage) {
          this.pokeboxUi.updateBox(page);
        }
      }
    });
  }

  updateBoxTitle(box: number) {
    this.boxTitle.setText(i18next.t(`menu:box`) + box.toString());
  }

  restoreData() {
    this.lastPage = null;
  }
}
