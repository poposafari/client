import i18next from 'i18next';
import { Event } from '../../core/manager/event-manager';
import { Option } from '../../core/storage/player-option';
import { AUDIO, DIRECTION, EVENT, ItemCategory, MessageEndDelay, MODE, PLAYER_STATUS } from '../../enums';
import { GroundItemOverworldObj } from '../../obj/ground-item-overworld-obj';
import { NpcOverworldObj } from '../../obj/npc-overworld-obj';
import { PlayerOverworldObj } from '../../obj/player-overworld-obj';
import { PostCheckoutOverworldObj } from '../../obj/post-checkout-overworld-obj';
import { InGameScene } from '../../scenes/ingame-scene';
import { NoticeUi } from '../notice-ui';
import { QuestionMessageUi } from '../question-message-ui';
import { TalkMessageUi } from '../talk-message-ui';
import { PostOfficeType } from '../../types';
import { catchGroundItemApi, getAvailableTicketApi, receiveAvailableTicketApi } from '../../api';
import { playEffectSound } from '../ui';
import { PlayerGlobal } from '../../core/storage/player-storage';
import { replacePercentSymbol } from '../../utils/string-util';
import { Bag } from '../../core/storage/bag-storage';
import { Game } from '../../core/manager/game-manager';
import { PC } from '../../core/storage/pc-storage';
import { SignOverworldObj } from '../../obj/sign-overworld-obj';

export interface OverworldPlayerInteractionContext {
  scene: InGameScene;
  obj: PlayerOverworldObj | null;
  talkMessageUi: TalkMessageUi;
  questionMessageUi: QuestionMessageUi;
  noticeUi: NoticeUi;
}

export class OverworldPlayerInteractionHandler {
  private context: OverworldPlayerInteractionContext;

  constructor(context: OverworldPlayerInteractionContext) {
    this.context = context;
  }

  waitForUiClose(mode: MODE): Promise<void> {
    return new Promise((resolve) => {
      // console.log(`[waitForUiClose] Waiting for UI close, mode: ${mode}`);
      const listener = (data: { mode: MODE }) => {
        // console.log(`[waitForUiClose] UI_CLOSED event received, expected: ${mode}, actual: ${data.mode}`);
        if (data.mode === mode) {
          // console.log(`[waitForUiClose] Mode matched, resolving promise for mode: ${mode}`);
          Event.off(EVENT.UI_CLOSED, listener);
          resolve();
        } else {
          // console.log(`[waitForUiClose] Mode mismatch, continuing to wait...`);
        }
      };
      Event.on(EVENT.UI_CLOSED, listener);
      // console.log(`[waitForUiClose] Event listener registered for mode: ${mode}`);
    });
  }

  async handleSelectEvent(event: SignOverworldObj | NpcOverworldObj | GroundItemOverworldObj): Promise<void> {
    if (event instanceof SignOverworldObj) {
      await event.reaction();
    } else if (event instanceof NpcOverworldObj) {
      await this.talkToNpc(event, this.context.obj!.getLastDirection());
    } else if (event instanceof GroundItemOverworldObj) {
      const groundItemData = event.reaction();
      const res = await catchGroundItemApi({ idx: groundItemData.idx });
      if (res.result) {
        event.caught();
        playEffectSound(this.context.scene, AUDIO.GET_0);
        Bag.getItem(res.data.item)?.setStock(res.data.stock);
        await this.context.talkMessageUi.show({
          type: 'default',
          content: replacePercentSymbol(i18next.t(`message:catch_item`), [PlayerGlobal.getData()?.nickname, i18next.t(`item:${groundItemData.item}.name`)]),
          speed: Option.getTextSpeed()!,
          endDelay: MessageEndDelay.GET,
        });
        await this.context.talkMessageUi.show({
          type: 'default',
          content: replacePercentSymbol(i18next.t(`message:put_item`), [
            PlayerGlobal.getData()?.nickname,
            i18next.t(`item:${groundItemData.item}.name`),
            i18next.t(`menu:pocket_${res.data.category}`),
          ]),
          speed: Option.getTextSpeed()!,
          endDelay: MessageEndDelay.DEFAULT,
        });
      }
    }
  }

  async showSurfMessage(): Promise<void> {
    if (this.context.obj?.getCurrentStatus() === PLAYER_STATUS.SURF) {
      if (!this.context.obj?.canSurfOff(this.context.obj.getLastDirection())) {
        this.context.obj?.setIsEvent(false);
        return;
      }

      return new Promise((resolve) => {
        this.context.questionMessageUi.show({
          type: 'default',
          content: i18next.t('message:surfOff'),
          speed: Option.getTextSpeed()!,
          yes: async () => {
            PC.setHiddenMovePokemon(null);
            this.context.obj?.setMovement(PLAYER_STATUS.SURF);
            await this.context.obj?.jump();
            this.context.obj?.handlePetForStatusChange();
            this.context.obj?.movePetBehind();
            this.context.obj?.setIsEvent(false);
            resolve();
          },
          no: async () => {
            this.context.obj?.setIsEvent(false);
            resolve();
          },
        });
      });
    } else {
      return new Promise((resolve) => {
        this.context.questionMessageUi.show({
          type: 'default',
          content: i18next.t('message:surfOn'),
          speed: Option.getTextSpeed()!,
          yes: async () => {
            const closePromise = this.waitForUiClose(MODE.HIDDEN_MOVE);
            await Game.changeMode(MODE.HIDDEN_MOVE, 'surf');
            await closePromise;

            this.context.obj?.recallPet();
            await this.context.obj?.forceSetTexture(PLAYER_STATUS.WALK);
            await this.context.obj?.jump();
            this.context.obj?.setMovement(PLAYER_STATUS.SURF);
            this.context.obj?.setSurf();
            this.context.obj?.setIsEvent(false);
            resolve();
          },
          no: async () => {
            this.context.obj?.setIsEvent(false);
            resolve();
          },
        });
      });
    }
  }

  private async processSafariTicket(ticketObj: PostCheckoutOverworldObj): Promise<void> {
    return new Promise(async (resolve) => {
      if (ticketObj.reaction() === PostOfficeType.POST_0) {
        await this.context.talkMessageUi.show({ type: 'default', content: i18next.t('npc:npc001_0'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
        const ticket = await getAvailableTicketApi();
        if (ticket.result) {
          if (ticket.data > 0) {
            await this.context.talkMessageUi.show({
              type: 'default',
              content: replacePercentSymbol(i18next.t('npc:npc001_1'), [ticket.data]),
              speed: Option.getTextSpeed()!,
              endDelay: MessageEndDelay.DEFAULT,
            });
            await this.context.questionMessageUi.show({
              type: 'default',
              content: i18next.t('npc:npc001_3'),
              speed: Option.getTextSpeed()!,
              yes: async () => {
                const receive = await receiveAvailableTicketApi();
                if (receive.result) {
                  await this.receiveItem('030', receive.data.category);
                  resolve();
                }
              },
              no: async () => {
                resolve();
              },
            });
          } else {
            await this.context.talkMessageUi.show({ type: 'default', content: i18next.t('npc:npc001_2'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
            resolve();
          }
        } else {
          resolve();
        }
      }
    });
  }

  private async receiveItem(item: string, category: ItemCategory): Promise<void> {
    return new Promise(async (resolve) => {
      playEffectSound(this.context.scene, AUDIO.GET_0);
      await this.context.talkMessageUi.show({
        type: 'default',
        content: replacePercentSymbol(i18next.t('message:catch_item'), [PlayerGlobal.getData()?.nickname, i18next.t(`item:${item}.name`)]),
        speed: Option.getTextSpeed()!,
        endDelay: MessageEndDelay.GET,
      });
      await this.context.talkMessageUi.show({
        type: 'default',
        content: replacePercentSymbol(i18next.t('message:put_item'), [PlayerGlobal.getData()?.nickname, i18next.t(`item:${item}.name`), i18next.t(`menu:${category}`)]),
        speed: Option.getTextSpeed()!,
        endDelay: MessageEndDelay.DEFAULT,
      });
      resolve();
    });
  }

  private async talkToNpc(npc: NpcOverworldObj, playerDirection: DIRECTION): Promise<void> {
    await npc.reaction(playerDirection, this.context.talkMessageUi);
  }

  async showTutorialMessages(): Promise<void> {
    await this.context.talkMessageUi.show({ type: 'default', content: i18next.t('message:tutorial_overworld_0'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
    await this.context.talkMessageUi.show({ type: 'default', content: i18next.t('message:tutorial_overworld_1'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
    await this.context.talkMessageUi.show({ type: 'default', content: i18next.t('message:tutorial_overworld_2'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
  }

  updateContext(context: Partial<OverworldPlayerInteractionContext>): void {
    this.context = { ...this.context, ...context };
  }
}
