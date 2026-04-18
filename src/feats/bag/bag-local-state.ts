import type { ItemBagEntry } from '@poposafari/core/user.manager.ts';

export class BagLocalState {
  private original = new Map<string, boolean>();
  private current = new Map<string, boolean>();

  init(bag: Map<string, ItemBagEntry> | null): void {
    this.original.clear();
    this.current.clear();
    if (!bag) return;
    for (const [itemId, entry] of bag) {
      this.original.set(itemId, entry.register);
      this.current.set(itemId, entry.register);
    }
  }

  isRegistered(itemId: string): boolean {
    return this.current.get(itemId) ?? false;
  }

  toggleRegister(itemId: string): void {
    this.current.set(itemId, !this.isRegistered(itemId));
  }

  getChanges(): { itemId: string; register: boolean }[] {
    const changes: { itemId: string; register: boolean }[] = [];
    for (const [itemId, cur] of this.current) {
      const orig = this.original.get(itemId) ?? false;
      if (orig !== cur) changes.push({ itemId, register: cur });
    }
    return changes;
  }

  markCommitted(itemId: string, register: boolean): void {
    this.original.set(itemId, register);
    this.current.set(itemId, register);
  }
}
