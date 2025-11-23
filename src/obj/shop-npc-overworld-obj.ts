import i18next from 'i18next';
import { DIRECTION, MessageEndDelay, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { ShopUi } from '../uis/shop-ui';
import { TalkMessageUi } from '../uis/talk-message-ui';
import { NpcOverworldObj } from './npc-overworld-obj';
import { Option } from '../core/storage/player-option';

export class ShopNpcOverworldObj extends NpcOverworldObj {
  private data: unknown;

  private shopUi: ShopUi;

  constructor(scene: InGameScene, map: Phaser.Tilemaps.Tilemap | null, texture: TEXTURE | string, x: number, y: number, name: string, direction: DIRECTION, script: string[], data: unknown) {
    super(scene, map, texture, x, y, name, direction, script);

    this.getShadow().setVisible(texture !== TEXTURE.BLANK);
    this.data = data;

    this.shopUi = new ShopUi(scene);
    this.shopUi.setup(this.data as string[]);
  }

  async reaction(direction: DIRECTION, talkUi: TalkMessageUi): Promise<void> {
    await super.reaction(direction, talkUi);
    await this.shopUi.show(this.data);

    await talkUi.show({ type: 'default', content: i18next.t('npc:shop_4'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
  }
}
