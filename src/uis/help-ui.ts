import { AUDIO, DEPTH, TEXTSTYLE, TEXTURE } from '../enums';
import i18next from '../i18n';
import { InGameScene } from '../scenes/ingame-scene';
import { playEffectSound, runFadeEffect, Ui } from './ui';

export class HelpUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private windows: Phaser.GameObjects.NineSlice[] = [];
  private texts: Phaser.GameObjects.Text[] = [];
  private bg!: Phaser.GameObjects.Image;

  private contents: string[] = [i18next.t('menu:helpTitle0'), i18next.t('menu:helpTitle1'), i18next.t('menu:helpTitle2')];
  private resolveShow: (() => void) | null = null;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);

    this.bg = this.addBackground(TEXTURE.BG_TITLE).setOrigin(0.5, 0.5);
    this.container.add(this.bg);

    this.setupMenus(width, height);

    this.container.setVisible(true);
    this.container.setDepth(DEPTH.TITLE);
    this.container.setScrollFactor(0);
  }

  async show(data?: any): Promise<void> {
    runFadeEffect(this.scene, 1000, 'in');
    this.container.setVisible(true);

    for (const window of this.windows) {
      window.setTexture(TEXTURE.WINDOW_MENU);
    }

    return new Promise<void>((resolve) => {
      this.resolveShow = resolve;
    });
  }

  protected onClean(): void {
    for (const window of this.windows) {
      window.removeAllListeners('pointerup');
      window.disableInteractive();
    }

    this.resolveShow = null;
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  private setupMenus(width: number, height: number) {
    let currentY = 0;
    let spacing = 120;
    const scale: number = 4;
    const contentWidth: number = 1000;
    let contentHeight = 30;

    for (let i = 0; i < this.contents.length; i++) {
      const window = this.addWindow(TEXTURE.WINDOW_MENU, 0, currentY, contentWidth / scale, contentHeight / scale).setScale(scale);
      const text = this.addText(0, currentY, this.contents[i], TEXTSTYLE.MESSAGE_BLACK).setOrigin(0.5, 0.5);
      text.setScale(0.8);

      window.setInteractive({ cursor: 'pointer' });
      window.on('pointerup', () => {
        this.handleWindowClick(i);
      });
      window.on('pointerover', () => {
        window.setTexture(TEXTURE.WINDOW_MENU_S);
      });
      window.on('pointerout', () => {
        window.setTexture(TEXTURE.WINDOW_MENU);
      });

      this.windows.push(window);
      this.texts.push(text);
      this.container.add(window);
      this.container.add(text);

      currentY += contentHeight + spacing;
    }
  }

  private handleWindowClick(index: number): void {
    playEffectSound(this.scene, AUDIO.SELECT_0);

    for (const window of this.windows) {
      window.setTexture(TEXTURE.WINDOW_MENU);
    }

    this.windows[index].setTexture(TEXTURE.WINDOW_MENU_S);

    const isLastWindow = index === this.windows.length - 1;
    if (isLastWindow && this.resolveShow) {
      this.resolveShow();
      this.resolveShow = null;
    }
  }
}

export class HelpGoalUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);

    const bg = this.addBackground(TEXTURE.BG_TITLE).setOrigin(0.5, 0.5);
    this.container.add(bg);
  }

  show(data?: any) {}

  protected onClean(): void {}

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}
}
