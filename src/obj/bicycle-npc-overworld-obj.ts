import i18next from 'i18next';
import { Bag } from '../core/storage/bag-storage';
import { AUDIO, DIRECTION, ItemCategory, MessageEndDelay, OBJECT, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { QuestionMessageUi } from '../uis/question-message-ui';
import { TalkMessageUi } from '../uis/talk-message-ui';
import { NpcOverworldObj } from './npc-overworld-obj';
import { Option } from '../core/storage/player-option';
import { buyItemApi } from '../api';
import { playEffectSound } from '../uis/ui';
import { replacePercentSymbol } from '../utils/string-util';
import { PlayerGlobal } from '../core/storage/player-storage';
import { OVERWORLD_ZOOM } from '../constants';

export class BicycleNpcOverworldObj extends NpcOverworldObj {
  private questionMessage: QuestionMessageUi;

  constructor(scene: InGameScene, map: Phaser.Tilemaps.Tilemap | null, texture: TEXTURE | string, x: number, y: number, name: string, direction: DIRECTION, script: string[], data: unknown) {
    super(scene, map, texture, x, y, name, direction, script);

    this.getShadow().setVisible(texture !== TEXTURE.BLANK);

    this.questionMessage = new QuestionMessageUi(scene);
    this.questionMessage.setup(OVERWORLD_ZOOM);
  }

  async reaction(direction: DIRECTION, talkUi: TalkMessageUi): Promise<void> {
    await super.reaction(direction, talkUi);

    if (Bag.getItem('bicycle')) {
      await talkUi.show({ type: 'default', content: i18next.t('npc:bicycle_shop_4'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
      await talkUi.show({ type: 'default', content: i18next.t('npc:bicycle_shop_5'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
    } else {
      await talkUi.show({ type: 'default', content: i18next.t('npc:bicycle_shop_0'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
      await this.questionMessage.show({
        type: 'default',
        content: i18next.t('npc:bicycle_shop_1'),
        speed: Option.getTextSpeed()!,
        yes: async () => {
          await talkUi.show({ type: 'default', content: i18next.t('npc:bicycle_shop_3'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });

          const ret = await buyItemApi({ item: 'bicycle', stock: 1 });

          if (ret.result) {
            playEffectSound(this.getScene(), AUDIO.GET_0);
            Bag.addItems(ret.data.idx, ret.data.item, ret.data.stock, ret.data.category);
            await talkUi.show({
              type: 'default',
              content: replacePercentSymbol(i18next.t(`message:catch_item`), [PlayerGlobal.getData()?.nickname, i18next.t(`item:bicycle.name`)]),
              speed: Option.getTextSpeed()!,
              endDelay: MessageEndDelay.GET,
            });
            await talkUi.show({
              type: 'default',
              content: replacePercentSymbol(i18next.t(`message:put_item`), [PlayerGlobal.getData()?.nickname, i18next.t(`item:bicycle.name`), i18next.t(`menu:pocket_${ItemCategory.KEY}`)]),
              speed: Option.getTextSpeed()!,
              endDelay: MessageEndDelay.DEFAULT,
            });
          } else {
            await talkUi.show({ type: 'default', content: i18next.t('npc:bicycle_shop_2'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
          }
        },
        no: async () => {
          await talkUi.show({ type: 'default', content: i18next.t('npc:bicycle_shop_2'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        },
      });
    }
  }
}
