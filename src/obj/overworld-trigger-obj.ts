import i18next from 'i18next';
import { AUDIO, DIRECTION, ItemCategory, MessageEndDelay, OBJECT, TextSpeed, TEXTURE, TRIGGER } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { TalkMessageUi } from '../uis/talk-message-ui';
import { ImmovableOverworldObj } from './immovable-overworld-obj';
import { Option } from '../core/storage/player-option';
import { NpcOverworldObj } from './npc-overworld-obj';
import { PlayerOverworldObj } from './player-overworld-obj';
import { playBackgroundMusic, playEffectSound } from '../uis/ui';
import { replacePercentSymbol } from '../utils/string-util';
import { PlayerGlobal } from '../core/storage/player-storage';
import { StarterPokemonUi } from '../uis/starter-pokemon-ui';
import { SocketIO } from '../core/manager/socket-manager';
import { Bag } from '../core/storage/bag-storage';

export class OverworldTriggerObj extends ImmovableOverworldObj {
  private key: TRIGGER;
  private targetNpc: string | null = null;
  private objs: { message?: TalkMessageUi; npc?: NpcOverworldObj; player?: PlayerOverworldObj } = {};

  private starterPokemonUi: StarterPokemonUi | null = null;

  constructor(scene: InGameScene, x: number, y: number, trigger: TRIGGER, targetNpc: string | null) {
    super(scene, TEXTURE.BLANK, x, y, '', OBJECT.TRIGGER);

    this.key = trigger;
    this.targetNpc = targetNpc;
    this.setSpriteScale(1.6);
    this.getShadow().setVisible(false);
  }

  async reaction(objs: { message?: TalkMessageUi; npc?: NpcOverworldObj[]; player?: PlayerOverworldObj }) {
    const targetNpc = this.findNpc(objs.npc!, this.targetNpc!);

    switch (this.key) {
      case TRIGGER.TRIGGER_000:
        if (!PlayerGlobal.getData()?.isStarter0) return;

        playEffectSound(this.getScene(), AUDIO.REACTION_0);
        playBackgroundMusic(this.getScene(), AUDIO.B002);
        this.lookUser(targetNpc!, objs.player!.getLastDirection());
        targetNpc?.changeDirectionOnly(DIRECTION.LEFT);
        await targetNpc?.setEmotion('emo_0', 'emo_0');
        await targetNpc?.autoWalkTo(objs.player!.getTilePos().x + 1, objs.player!.getTilePos().y);
        objs.player?.changeDirectionOnly(DIRECTION.RIGHT);
        targetNpc?.changeDirectionOnly(DIRECTION.LEFT);
        await objs.message?.show({
          type: 'default',
          content: replacePercentSymbol(i18next.t(`npc:script046_0`), [PlayerGlobal.getData()?.nickname]),
          speed: Option.getTextSpeed()!,
          endDelay: MessageEndDelay.DEFAULT,
        });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script046_1`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script046_2`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script046_3`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script046_4`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script046_5`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        playEffectSound(this.getScene(), AUDIO.OPEN_2);
        await objs.player?.showHUDForStarter(TEXTURE.ICON_MENU);
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script046_6`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        playEffectSound(this.getScene(), AUDIO.OPEN_2);
        await objs.player?.showHUDForStarter(TEXTURE.ICON_REG);
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script046_7`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        playEffectSound(this.getScene(), AUDIO.OPEN_2);
        await objs.player?.showHUDForStarter(TEXTURE.ICON_RUNNING);
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script046_8`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script046_9`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script046_10`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script046_11`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script046_12`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        await targetNpc?.autoWalkTo(18, 13);
        targetNpc?.changeDirectionOnly(DIRECTION.DOWN);
        PlayerGlobal.appearMenuFlag = true;
        PlayerGlobal.appearItemSlotFlag = true;
        PlayerGlobal.appearRunningShoesFlag = true;
        PlayerGlobal.updateData({ isStarter0: false });
        SocketIO.updateIsStarter0();
        playBackgroundMusic(this.getScene(), AUDIO.B001);
        break;
      case TRIGGER.TRIGGER_001:
        if (!PlayerGlobal.getData()?.isStarter1) return;

        await objs.player?.autoWalkTo(16, 8);
        await objs.message?.show({
          type: 'default',
          content: replacePercentSymbol(i18next.t(`npc:script047_0`), [PlayerGlobal.getData()?.nickname]),
          speed: Option.getTextSpeed()!,
          endDelay: MessageEndDelay.DEFAULT,
        });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script047_1`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script047_2`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script047_3`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script047_4`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script047_5`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script047_6`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script047_7`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script047_8`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        await objs.message?.show({
          type: 'default',
          content: replacePercentSymbol(i18next.t(`npc:script047_9`), [PlayerGlobal.getData()?.nickname]),
          speed: Option.getTextSpeed()!,
          endDelay: MessageEndDelay.DEFAULT,
        });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script047_10`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script047_11`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script047_12`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script047_13`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });

        this.starterPokemonUi = new StarterPokemonUi(this.getScene());

        this.starterPokemonUi?.setup();
        const ret = await this.starterPokemonUi?.show();

        playEffectSound(this.getScene(), AUDIO.CONG);
        await objs.message?.show({
          type: 'default',
          content: replacePercentSymbol(i18next.t(`message:catch_starter_pokemon`), [PlayerGlobal.getData()?.nickname, i18next.t(`pokemon:${ret?.pokedex}.name`)]),
          speed: TextSpeed.CONG,
          endDelay: MessageEndDelay.CONG,
        });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script047_14`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        playEffectSound(this.getScene(), AUDIO.GET_0);
        await objs.message?.show({
          type: 'default',
          content: replacePercentSymbol(i18next.t(`message:catch_starter_item`), [PlayerGlobal.getData()?.nickname]),
          speed: Option.getTextSpeed()!,
          endDelay: MessageEndDelay.GET,
        });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script047_15`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        await objs.message?.show({ type: 'default', content: i18next.t(`npc:script047_16`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        PlayerGlobal.updateData({ isStarter1: false });
        Bag.addItems(0, '002', 30, ItemCategory.POKEBALL);
        Bag.addItems(0, '003', 10, ItemCategory.POKEBALL);
        Bag.addItems(0, '004', 5, ItemCategory.POKEBALL);
        Bag.addItems(0, '011', 3, ItemCategory.BERRY);
        Bag.addItems(0, '012', 3, ItemCategory.BERRY);
        Bag.addItems(0, '014', 3, ItemCategory.BERRY);
        Bag.addItems(0, '029', 3, ItemCategory.BERRY);
        SocketIO.updateIsStarter1();
        break;
    }
  }

  getKey() {
    return this.key;
  }

  private lookUser(npc: NpcOverworldObj, playerDirection: DIRECTION) {
    if (!npc) return;

    switch (playerDirection) {
      case DIRECTION.LEFT:
        npc.stopSpriteAnimation(8);
        break;
      case DIRECTION.RIGHT:
        npc.stopSpriteAnimation(4);
        break;
      case DIRECTION.DOWN:
        npc.stopSpriteAnimation(12);
        break;
      case DIRECTION.UP:
        npc.stopSpriteAnimation(0);
        break;
    }
  }

  private findNpc(npc: NpcOverworldObj[], targetNpc: string) {
    return npc.find((npc) => npc.getKey() === targetNpc);
  }
}
