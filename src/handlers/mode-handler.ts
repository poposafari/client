import i18next from 'i18next';
import { deleteAccountApi } from '../api';
import { eventBus } from '../core/event-bus';
import { EVENT } from '../enums/event';
import { MODE } from '../enums/mode';
import { Mode } from '../mode';

export class ModeHandler {
  private registry = new Map<MODE, Mode>();
  private stack: Mode[] = [];
  private current!: Mode;

  constructor() {
    eventBus.on(EVENT.CHANGE_MODE, (mode: MODE, data: any) => this.change(mode, data));
    eventBus.on(EVENT.OVERLAP_MODE, (mode: MODE, data: any) => this.overlap(mode, data));
    eventBus.on(EVENT.POP_MODE, () => this.pop());
    eventBus.on(EVENT.SHOW_MODE_STACK, () => console.log(this.stack));
    eventBus.on(EVENT.MOVETO_LOGIN_MODE, () => eventBus.emit(EVENT.CHANGE_MODE, MODE.LOGIN));
    eventBus.on(EVENT.MOVETO_CONNECT_ACCOUNT_DELETE_MODE, () => eventBus.emit(EVENT.CHANGE_MODE, MODE.CONNECT_ACCOUNT_DELETE));
    eventBus.on(EVENT.MOVETO_NEWGAME_MODE, () => eventBus.emit(EVENT.CHANGE_MODE, MODE.NEWGAME));
    eventBus.on(EVENT.MOVETO_TITLE_MODE, () => eventBus.emit(EVENT.CHANGE_MODE, MODE.TITLE));
    eventBus.on(EVENT.MOVETO_SHOP_MODE, () => eventBus.emit(EVENT.OVERLAP_MODE, MODE.SHOP));
    eventBus.on(EVENT.MOVETO_SAFARI_LIST_MODE, () => eventBus.emit(EVENT.OVERLAP_MODE, MODE.SAFARI_LIST));
    eventBus.on(EVENT.MOVETO_OVERWORLD_MODE, (overworld: string) => eventBus.emit(EVENT.OVERLAP_MODE, MODE.OVERWORLD_CONNECTING, overworld));
    eventBus.on(EVENT.MOVETO_OVERWORLD_MENU_MODE, () => eventBus.emit(EVENT.OVERLAP_MODE, MODE.OVERWORLD_MENU));
    eventBus.on(EVENT.MOVETO_HIDDENMOVE_MODE, () => eventBus.emit(EVENT.OVERLAP_MODE, MODE.HIDDEN_MOVE));
  }

  register(key: MODE, mode: Mode): void {
    this.registry.set(key, mode);
  }

  change(key: MODE, data?: any) {
    this.clean();

    const nextMode = this.registry.get(key);

    if (!nextMode) throw new Error(`Mode not found : ${key}`);

    nextMode.enter(data);
    this.stack.push(nextMode);

    eventBus.emit(EVENT.SHOW_MODE_STACK);
  }

  overlap(key: MODE, data?: any) {
    const nextMode = this.registry.get(key);
    const top = this.getTop();

    if (!nextMode) throw new Error(`Mode not found : ${key}`);
    if(top && top.constructor === nextMode.constructor) return;
    
    nextMode.enter(data);
    this.stack.push(nextMode);

    eventBus.emit(EVENT.SHOW_MODE_STACK);
  }

  pop() {
    const top = this.stack.pop();

    if (top) top.exit();

    eventBus.emit(EVENT.SHOW_MODE_STACK);
  }

  getCurrent(): Mode {
    return this.stack[this.stack.length - 1];
  }

  getTop(): Mode | null {
    const mode = this.stack[this.stack.length - 1];

    if (mode) return mode;

    console.log('Mode stack is empty');
    
    return null;
  }

  private clean() {
    for (const mode of this.stack) {
      mode.exit();
    }

    this.stack = [];
  }
}
