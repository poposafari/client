import { all } from 'axios';
import { KEY } from '../enums/key';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager } from '../managers';
import { TitleMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { titleContinueConfig, titleLogoutConfig, titleMysteryGiftConfig, titleNewGameConfig, titleSettingConfig } from './config';
import { addBackground, addImage, addText, addWindow, UI } from './ui';

export class TitleUi extends UI {
  private mode: TitleMode;
  private bg!: Phaser.GameObjects.Image;
  private btns: Phaser.GameObjects.Image[] = [];
  private containers: Phaser.GameObjects.Container[] = [];

  constructor(scene: InGameScene, mode: TitleMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const ui = this.getUi();
    const width = this.getWidth();
    const height = this.getHeight();

    this.bg = addBackground(this.scene, TEXTURE.BG_LOBBY, width, height);
    this.bg.setVisible(false);
    ui.add(this.bg);

    const btnConfig = [titleContinueConfig, titleNewGameConfig, titleMysteryGiftConfig, titleSettingConfig, titleLogoutConfig];

    for (const config of btnConfig) {
      const btnContainer = this.scene.add.container(width / 4, config.y);
      const btnWindow = addImage(this.scene, TEXTURE.BAR, 0, 0);
      const btnTitle = addText(this.scene, config.contentX - 175, config.contentY, config.content, TEXTSTYLE.TITLE_DEFAULT);
      btnTitle.setOrigin(0, 0.5);

      this.btns.push(btnWindow);

      btnContainer.add(btnWindow);
      btnContainer.add(btnTitle);
      btnContainer.setVisible(false);

      this.containers.push(btnContainer);

      ui.add(btnContainer);
    }
  }

  show(): void {
    const keyboardMananger = KeyboardManager.getInstance();

    this.bg.setVisible(true);

    let startIndex = this.getUserGameData() ? 0 : 1;
    let endIndex = this.getBtnSize();
    let choice = startIndex;

    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT];
    keyboardMananger.setAllowKey(keys);

    keyboardMananger.setCallback((key) => {
      if (key === KEY.UP) {
        choice = Math.max(startIndex, choice - 1);
      } else if (key === KEY.DOWN) {
        choice = Math.min(endIndex, choice + 1);
      } else if (key === KEY.SELECT) {
        this.choiceMenu(choice);
      }

      for (const btn of this.btns) {
        btn.setTexture(TEXTURE.BAR);
      }
      this.btns[choice].setTexture(TEXTURE.BAR_S);
    });

    for (let i = startIndex; i <= endIndex; i++) {
      if (!this.getUserGameData()) {
        this.containers[i].y -= 50;
      }
      this.containers[i].setVisible(true);
    }
    this.btns[choice].setTexture(TEXTURE.BAR_S);
  }

  choiceMenu(choice: number) {
    if (choice === 0) {
    } else if (choice === 1) {
    } else if (choice === 2) {
    } else if (choice === 3) {
    } else if (choice === 4) {
      this.mode.changeLoginMode();
    }
  }

  clean(): void {
    this.bg.setVisible(false);

    for (const container of this.containers) {
      container.setVisible(false);
    }

    KeyboardManager.getInstance().clearCallback();
  }

  pause(onoff: boolean): void {}

  private getUserGameData() {
    return false;
  }

  private getBtnSize() {
    return this.containers.length - 1;
  }
}
