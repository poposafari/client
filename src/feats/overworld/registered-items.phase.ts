import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import i18next from '@poposafari/i18n';
import { OverworldUi } from './overworld.ui';
import { RegisteredItemsUi } from './registered-items.ui';

export class RegisteredItemsPhase implements IGamePhase {
  private ui: RegisteredItemsUi | null = null;

  constructor(
    private scene: GameScene,
    private overworldUi: OverworldUi,
  ) {}

  async enter(): Promise<void> {
    this.overworldUi.syncRegistedItemIcon(true);

    const user = this.scene.getUser();
    const bag = user?.getItemBag();
    const registered: string[] = [];
    if (bag) {
      for (const [itemId, entry] of bag) {
        if (entry.register) registered.push(itemId);
      }
    }

    if (registered.length === 0) {
      await this.scene
        .getMessage('talk')
        .showMessage(
          i18next.exists('msg:noRegisteredItem')
            ? i18next.t('msg:noRegisteredItem')
            : 'No registered items.',
        );
      this.scene.popPhase();
      return;
    }

    this.ui = new RegisteredItemsUi(this.scene);
    const selected = await this.ui.waitForSelect(registered);
    this.ui.hide();

    if (selected) {
      this.overworldUi.useRegisteredItem(selected);
    }
    this.scene.popPhase();
  }

  exit(): void {
    this.overworldUi.syncRegistedItemIcon(false);

    if (this.ui) {
      this.ui.destroy();
      this.ui = null;
    }
  }
}
