import { GM } from '../core/game-manager';
import { DEPTH, MODE, TEXTSTYLE, TEXTURE } from '../enums';
import i18next from '../i18n';
import { InGameScene } from '../scenes/ingame-scene';
import { ConnectAccountDeleteUi } from './connect-account-delete-ui';
import { ConnectBaseUi } from './connect-base-ui';
import { ConnectSafariUi } from './connect-safari-ui';
import { addText, addWindow, Ui } from './ui';

export class ConnectUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private baseUi: ConnectBaseUi;
  private accountDeleteUi: ConnectAccountDeleteUi;
  private safariUi: ConnectSafariUi;

  constructor(scene: InGameScene) {
    super(scene);

    this.baseUi = new ConnectBaseUi(scene);
    this.accountDeleteUi = new ConnectAccountDeleteUi(scene);
    this.safariUi = new ConnectSafariUi(scene);
  }

  setup(): void {
    this.baseUi.setup();
    this.accountDeleteUi.setup();
    this.safariUi.setup();
  }

  show(data?: any): void {
    const mode = GM.getPreviousMode();

    switch (mode) {
      case MODE.CONNECT_SAFARI:
        this.safariUi.show();
        break;
      case MODE.CONNECT_ACCOUNT_DELETE:
        this.accountDeleteUi.show();
        break;
      default:
        this.baseUi.show();
        break;
    }
  }

  clean(data?: any): void {
    this.safariUi.clean();
    this.accountDeleteUi.clean();
    this.baseUi.clean();
  }

  pause(data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}
}
