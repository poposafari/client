import type { KeyItemContext, KeyItemHandler } from './key-item.types';

const HANDLERS: Record<string, KeyItemHandler> = {
  bicycle: {
    use: (ctx) => ctx.overworldUi.toggleRideBicycle(),
  },
};

export const KeyItemRegistry = {
  has(itemId: string): boolean {
    return itemId in HANDLERS;
  },
  async use(itemId: string, ctx: KeyItemContext): Promise<void> {
    const h = HANDLERS[itemId];
    if (!h) return;
    await h.use(ctx);
  },
};
