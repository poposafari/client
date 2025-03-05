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
import { PokeboxBoxSelectUi } from './pokebox-box-select-ui';

export class PokeboxBoxChoiceUi extends Ui {
  private mode: OverworldMode;
  private pokeboxUi: PokeBoxUi;
  private pokeboxBoxSelectUi: PokeboxBoxSelectUi;

  private container!: Phaser.GameObjects.Container;
  private choiceContainer!: Phaser.GameObjects.Container;

  private arrowLeft!: Phaser.GameObjects.Image;
  private arrowRight!: Phaser.GameObjects.Image;
  private finger!: Phaser.GameObjects.Image;

  constructor(scene: InGameScene, mode: OverworldMode, pokeboxUi: PokeBoxUi) {
    super(scene);
    this.mode = mode;
    this.pokeboxUi = pokeboxUi;

    this.pokeboxBoxSelectUi = new PokeboxBoxSelectUi(scene, mode, pokeboxUi, this);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.pokeboxBoxSelectUi.setup();

    this.container = this.scene.add.container(width / 2, height / 2);

    this.arrowLeft = addImage(this.scene, TEXTURE.ARROW_BOX, -685, -400);
    this.arrowRight = addImage(this.scene, TEXTURE.ARROW_BOX, +225, -400).setFlipX(true);

    this.finger = addImage(this.scene, TEXTURE.FINGER, -200, -400).setScale(3);

    this.arrowLeft.setScale(3);
    this.arrowRight.setScale(3);

    this.container.add(this.arrowLeft);
    this.container.add(this.arrowRight);
    this.container.add(this.finger);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
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

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  update(time: number, delta: number): void {}

  private block() {}

  private unblock() {
    const keys = [KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];
    const keyboardManager = KeyboardManager.getInstance();

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback((key) => {
      try {
        switch (key) {
          case KEY.DOWN:
            this.clean();
            this.pokeboxUi.pause(false);
            break;
          case KEY.SELECT:
            this.pokeboxBoxSelectUi.show();
            break;
          case KEY.LEFT:
            break;
          case KEY.RIGHT:
            break;
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }
}
