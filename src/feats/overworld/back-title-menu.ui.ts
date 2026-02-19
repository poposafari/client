import { GameScene } from '@poposafari/scenes';
import { MenuUi } from '../menu/menu-ui';
import i18next from '@poposafari/i18n';

const YES_NO_ITEMS = () => [
  { key: 'yes', label: i18next.t('menu:yes') },
  { key: 'no', label: i18next.t('menu:no') },
];

export class BackTitleMenuUi extends MenuUi {
  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), {
      y: +800,
      itemHeight: 80,
    });
  }

  async waitForInput(): Promise<any> {
    const question = this.scene.getMessage('question');
    await question.showMessage(i18next.t('msg:backToTitle'), {
      resolveWhen: 'displayed',
    });

    const ret = await this.waitForSelect(YES_NO_ITEMS());

    return ret?.key ?? 'no';
  }

  public onRefreshWindow(): void {
    this.updateWindow();
  }
}
