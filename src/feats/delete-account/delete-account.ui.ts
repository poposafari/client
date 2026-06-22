import { BaseUi, IInputHandler } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, TEXTURE } from '@poposafari/types';
import { addBackground, getSessionBackgroundKey } from '@poposafari/utils';
import { DeleteAccountMenuUi } from './delete-account-menu.ui';
import i18next from 'i18next';

export type DeleteAccountResult = 'confirmed' | 'cancelled';

const YES_NO_ITEMS = () => [
  { key: 'yes', label: i18next.t('etc:yes') },
  { key: 'no', label: i18next.t('etc:no') },
];

export class DeleteAccountUi extends BaseUi implements IInputHandler {
  scene: GameScene;
  private menuUi: DeleteAccountMenuUi;

  private bg!: GImage;

  constructor(scene: GameScene, menuUi: DeleteAccountMenuUi) {
    super(scene, scene.getInputManager(), DEPTH.DEFAULT);
    this.scene = scene;
    this.menuUi = menuUi;
    this.createLayout();

    this.add([this.bg]);
  }

  onInput(key: string): void {
    throw new Error('Method not implemented.');
  }
  errorEffect(errorMsg: string): void {
    throw new Error('Method not implemented.');
  }
  waitForInput(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  createLayout(): void {
    this.bg = addBackground(this.scene, TEXTURE.BG_1);
  }

  async runDeleteAccountFlow(): Promise<DeleteAccountResult> {
    const questionUi = this.scene.getMessage('question');
    const talk = this.scene.getMessage('talk');

    const ask = async (msgKey: string) => {
      await questionUi.showMessage(i18next.t(msgKey), {
        resolveWhen: 'displayed',
      });

      const choice = await this.menuUi.waitForSelect(YES_NO_ITEMS());
      this.menuUi.hide();
      questionUi.hide();

      return choice?.key === 'yes';
    };

    await talk.showMessage(i18next.t('etc:deleteAccount_0'));

    if (!(await ask('etc:deleteAccount_1'))) return 'cancelled';
    if (!(await ask('etc:deleteAccount_2'))) return 'cancelled';
    if (!(await ask('etc:deleteAccount_3'))) return 'cancelled';

    return 'confirmed';
  }

  onRefreshLanguage(): void {
    this.menuUi.onRefreshLanguage();
  }

  show(): void {
    this.bg.setTexture(getSessionBackgroundKey());
    super.show();
  }
}
