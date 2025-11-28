import { AUDIO, DEPTH, EASE, KEY, TEXTSTYLE, TEXTURE } from '../enums';
import { Keyboard, KeyboardManager } from '../core/manager/keyboard-manager';
import { InGameScene } from '../scenes/ingame-scene';
import { Notice } from '../types';
import { addText, addWindow, getTextShadow, getTextStyle, playEffectSound, setTextShadow } from './ui';
import { MessageUi } from './message-ui';

export class NoticeUi extends MessageUi {
  constructor(scene: InGameScene) {
    super(scene);
  }

  protected setupMessageContainer(): void {
    super.setupMessageContainer();
    this.setTextPosition(-425, -35);
  }

  async show(data: Notice): Promise<boolean> {
    this.text.setStyle(getTextStyle(data.textStyle || TEXTSTYLE.SIGN_WHITE));
    setTextShadow(this.text, getTextShadow(TEXTSTYLE.SIGN_WHITE));
    this.window.setTexture(data.window);

    Keyboard.setAllowKey([KEY.Z, KEY.ENTER]);

    await this.showNotice(data);

    playEffectSound(this.scene, AUDIO.SELECT_0);

    this.container.setY(this.getHeight() / 2 + 500);
    this.container.setVisible(true);

    this.scene.tweens.add({
      targets: this.container,
      y: this.getHeight() / 2 + 410,
      duration: 300,
      ease: EASE.QUINT_EASEOUT,
    });

    await new Promise((resolve) => {
      Keyboard.setKeyDownCallback((key) => {
        if (key === KEY.Z || key === KEY.ENTER) {
          this.scene.tweens.add({
            targets: this.container,
            y: this.getHeight() / 2 + 500,
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
    this.text.setText(message.content);
  }
}
