import { MessageEndDelay, TextSpeed } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { MessageUi } from './message-ui';

export class DummyMessageUi extends MessageUi {
  constructor(scene: InGameScene) {
    super(scene);
  }

  show(data: string) {
    this.setMessageStyle('default');
    this.container.setVisible(true);
    this.showText(data!, TextSpeed.FAST);
  }

  hide() {
    this.container.setVisible(false);
    this.onClean();
  }
}
