import i18next from 'i18next';
import { getAllSafaris, SafariData } from '../data/overworld';
import { InGameScene } from '../scenes/ingame-scene';
import { ListForm } from '../types';
import { ListUi } from './list-ui';
import { Ui } from './ui';
import { eventBus } from '../core/event-bus';
import { EVENT } from '../enums/event';
import { MODE } from '../enums/mode';
import { replacePercentSymbol } from '../utils/string-util';
import { useTicketApi } from '../api';
import { DummyUi } from './dummy-ui';

export class SafariListUi extends Ui {
  private list: ListUi;
  private safaris!: SafariData[];

  private targetSafari!: any;

  constructor(scene: InGameScene) {
    super(scene);

    this.list = new ListUi(scene, new DummyUi(scene));

    eventBus.on(EVENT.READY_TO_SAFARI, async () => {
      const result = await useTicketApi({ overworld: this.targetSafari });

      if (result && result.data) {
        eventBus.emit(EVENT.MOVETO_OVERWORLD_MODE, this.targetSafari);
      }
    });
  }

  setup(data?: any): void {
    this.safaris = getAllSafaris();
    this.list.setupInfo(350, +45, +350, this.createListForm(), 12, 385, 1.4, 0.8);
  }

  show(data?: any): void {
    this.list.show();

    this.handleKeyInput();
  }

  clean(data?: any): void {
    this.list.clean();
  }

  pause(onoff: boolean, data?: any): void {}

  async handleKeyInput(...data: any[]) {
    const ret = await this.list.handleKeyInput();

    if (typeof ret === 'number' && ret >= 0) {
      this.targetSafari = this.safaris[ret].key;

      eventBus.emit(EVENT.OVERLAP_MODE, MODE.MESSAGE, [
        {
          type: 'default',
          format: 'question',
          content: replacePercentSymbol(i18next.t(`npc:npc000_2`), [i18next.t(`menu:overworld_${this.targetSafari}`)]),
          speed: 10,
          questionYes: EVENT.READY_TO_SAFARI,
        },
      ]);
    } else if (ret === i18next.t('menu:cancelMenu')) {
      eventBus.emit(EVENT.POP_MODE);
      eventBus.emit(EVENT.OVERLAP_MODE, MODE.MESSAGE, [
        {
          type: 'default',
          format: 'talk',
          content: i18next.t('npc:npc002_4'),
          speed: 10,
        },
      ]);
      eventBus.emit(EVENT.FINISH_TALK);
    }
  }

  update(time?: number, delta?: number): void {}

  private createListForm() {
    const ret: ListForm[] = [];

    for (const safari of this.safaris) {
      ret.push({
        name: i18next.t(`menu:overworld_${safari.key}`),
        nameImg: '',
        etc: `x${safari.cost}`,
        etcImg: 'item030',
      });
    }

    return ret;
  }
}
