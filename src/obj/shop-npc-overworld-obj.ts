import i18next from 'i18next';
import { DIRECTION, MessageEndDelay, MODE, TEXTURE, UI } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { ShopUi } from '../uis/shop-ui';
import { TalkMessageUi } from '../uis/talk-message-ui';
import { NpcOverworldObj } from './npc-overworld-obj';
import { Option } from '../core/storage/player-option';
import { MenuUi } from '../uis/menu-ui';
import { BagSellUi } from '../uis/bag-sell-ui';
import { Game } from '../core/manager/game-manager';

export class ShopNpcOverworldObj extends NpcOverworldObj {
  private data: unknown;

  private shopUi: ShopUi;
  private menu!: MenuUi;

  constructor(scene: InGameScene, map: Phaser.Tilemaps.Tilemap | null, texture: TEXTURE | string, x: number, y: number, name: string, direction: DIRECTION, script: string[], data: unknown) {
    super(scene, map, texture, x, y, name, direction, script);

    this.getShadow().setVisible(texture !== TEXTURE.BLANK);
    this.data = data;

    this.menu = new MenuUi(scene);
    this.menu.setup({ scale: 1.4, offsetX: 240, offsetY: -130, window: Option.getFrame('text') as TEXTURE, windowWidth: 270 });
    this.menu.setupContent([i18next.t('menu:shop_choice_0'), i18next.t('menu:shop_choice_1'), i18next.t('menu:cancelMenu')]);

    this.shopUi = new ShopUi(scene);
    this.shopUi.setup(this.data as string[]);
  }

  async reaction(direction: DIRECTION, talkUi: TalkMessageUi): Promise<void> {
    await super.reaction(direction, talkUi);
    const ret = await this.menu.handleKeyInput();

    if (ret === i18next.t('menu:shop_choice_0')) {
      this.menu.hide();
      await this.shopUi.show(this.data);
    } else if (ret === i18next.t('menu:shop_choice_1')) {
      await Game.changeMode(MODE.BAG_SELL);
    } else {
      this.menu.hide();
    }

    await talkUi.show({ type: 'default', content: i18next.t('npc:shop_4'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
  }
}
