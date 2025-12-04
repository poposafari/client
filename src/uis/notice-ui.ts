import { AUDIO, DEPTH, EASE, KEY, TEXTSTYLE, TEXTURE } from '../enums';
import { Keyboard, KeyboardManager } from '../core/manager/keyboard-manager';
import { InGameScene } from '../scenes/ingame-scene';
import { Notice } from '../types';
import { addText, addWindow, getTextShadow, getTextStyle, playEffectSound, setTextShadow } from './ui';
import { MessageUi } from './message-ui';

export class NoticeUi extends MessageUi {
  private currentZoom: number = 1;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data: number = 1): void {
    this.currentZoom = data;
    super.setup(data);
  }

  protected setupMessageContainer(zoom: number = 1): void {
    super.setupMessageContainer(zoom);

    if (zoom === 1.5) {
      this.setTextPosition(-380, -30);
    } else {
      this.setTextPosition(-425, -35);
    }
  }

  async show(data: Notice): Promise<boolean> {
    this.text.setStyle(getTextStyle(data.textStyle || TEXTSTYLE.SIGN_WHITE));
    setTextShadow(this.text, getTextShadow(TEXTSTYLE.SIGN_WHITE));
    this.window.setTexture(data.window);

    Keyboard.setAllowKey([KEY.Z, KEY.ENTER]);

    await this.showNotice(data);

    playEffectSound(this.scene, AUDIO.SELECT_0);

    const zoom = this.currentZoom;
    const height = this.getHeight();

    let startY: number;
    let targetY: number;
    let endY: number;

    if (zoom === 1.5) {
      startY = height / 2 + 368;
      targetY = height / 2 + 278;
      endY = height / 2 + 368;
    } else {
      startY = height / 2 + 500;
      targetY = height / 2 + 410;
      endY = height / 2 + 500;
    }

    this.container.setY(startY);
    this.container.setVisible(true);

    this.scene.tweens.add({
      targets: this.container,
      y: targetY,
      duration: 300,
      ease: EASE.QUINT_EASEOUT,
    });

    await new Promise((resolve) => {
      Keyboard.setKeyDownCallback((key) => {
        if (key === KEY.Z || key === KEY.ENTER) {
          this.scene.tweens.add({
            targets: this.container,
            y: endY,
            duration: 200,
            ease: EASE.QUINT_EASEIN,
            onComplete: () => {
              this.container.setVisible(false);
              resolve(true);
            },
          });
        }
      });
      this.trackKeyboardCallback(() => Keyboard.clearCallbacks());
    });

    return true;
  }

  protected onClean(): void {
    super.onClean();
  }

  private async showNotice(message: Notice): Promise<void> {
    if (this.currentZoom === 1.5) {
      this.text.setScale(0.43);
    } else {
      this.text.setScale(0.5);
    }

    this.text.setText(message.content);
  }
}
