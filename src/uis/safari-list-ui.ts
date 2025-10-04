import { useSafariTicketApi } from '../api';
import { GM } from '../core/game-manager';
import { getAllSafaris, SafariData } from '../data';
import { DEPTH, HttpErrorCode, TEXTURE } from '../enums';
import i18next from '../i18n';
import { InGameScene } from '../scenes/ingame-scene';
import { BagStorage } from '../storage';
import { GetItemRes, ListForm } from '../types';
import { replacePercentSymbol } from '../utils/string-util';
import { MenuListUi } from './menu-list-ui';
import { QuestionMessageUi } from './question-message-ui';
import { TalkMessageUi } from './talk-message-ui';
import { Ui } from './ui';

export class SafariListUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private list: MenuListUi;
  private talkMessageUi: TalkMessageUi;
  private questionMessageUi: QuestionMessageUi;

  private safaris!: SafariData[];

  constructor(scene: InGameScene) {
    super(scene);

    this.list = new MenuListUi(scene);
    this.talkMessageUi = new TalkMessageUi(scene);
    this.questionMessageUi = new QuestionMessageUi(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.talkMessageUi.setup();
    this.questionMessageUi.setup();

    this.list.setup({ scale: 1.6, etcScale: 0.9, windowWidth: 400, offsetX: +100, offsetY: +250, depth: DEPTH.MENU + 1, per: 10, info: [], window: TEXTURE.WINDOW_MENU });

    this.container = this.createContainer(width / 2, height / 2);

    this.container.setVisible(false);
    this.container.setScrollFactor(0);
  }

  async show(data?: any): Promise<'cancel' | 'use' | SafariData> {
    this.safaris = getAllSafaris();
    this.list.updateInfo(this.createListForm());

    while (true) {
      const selectedIndex = await this.list.handleKeyInput();

      if (typeof selectedIndex !== 'number' || selectedIndex < 0) break;

      const targetSafari = this.safaris[selectedIndex];
      const result = await this.promptForSafariTicket(targetSafari);

      if (result === 'use') return targetSafari;
    }

    return 'cancel';
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}

  private async promptForSafariTicket(safari: SafariData): Promise<'use' | 'cancel'> {
    return new Promise(async (resolve) => {
      await this.questionMessageUi.show({
        type: 'default',
        content: replacePercentSymbol(i18next.t('npc:npc000_2'), [i18next.t(`menu:overworld_${safari.key}`)]),
        speed: GM.getUserOption()?.getTextSpeed()!,
        yes: async () => {
          const res = await useSafariTicketApi({ item: '030', cost: safari.cost });

          if (res.result) {
            const data = res.data as GetItemRes;

            if (data.stock === 0) {
              BagStorage.getInstance().removeItem('030');
            } else {
              BagStorage.getInstance().addItems(data.idx, data.item, data.stock, data.category);
            }

            resolve('use');
          } else {
            if (res.data === HttpErrorCode.INGAME_ITEM_STOCK_LIMIT_EXCEEDED || res.data === HttpErrorCode.NOT_FOUND_INGAME_ITEM) {
              await this.talkMessageUi.show({
                type: 'default',
                content: i18next.t('npc:npc000_3'),
                speed: GM.getUserOption()?.getTextSpeed()!,
              });
            }
            resolve('cancel');
          }
        },
        no: async () => {
          resolve('cancel');
        },
      });
    });
  }

  private createListForm(): ListForm[] {
    const ret: ListForm[] = [];
    const ticketIcon = 'item030';

    for (const safari of this.safaris) {
      ret.push({
        name: i18next.t(`menu:overworld_${safari.key}`),
        nameImg: '',
        etc: `x${safari.cost}`,
        etcImg: ticketIcon,
      });
    }

    return ret;
  }
}
