import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { ApiError, MONEY_SYMBOL } from '@poposafari/types';
import { MenuUi } from '@poposafari/feats/menu/menu-ui';
import { BaseBagUi, BagEntry } from '@poposafari/feats/bag/base-bag.ui';
import i18next from 'i18next';
import { MartQuantityUi } from './mart-quantity.ui';
import { MartBuyUi } from './mart-buy.ui';
import { MartSellUi } from './mart-sell.ui';
import { MartSellBagUi } from './mart-sell-bag.ui';

const MAX_ITEM_QUANTITY = 9999;
const MAX_BUY_QUANTITY = 99;
const MAX_USER_MONEY = 999_999_999;

const YES_NO_ITEMS = () => [
  { key: 'yes', label: i18next.t('menu:yes') },
  { key: 'no', label: i18next.t('menu:no') },
];

export class MartPhase implements IGamePhase {
  private menuUi: MenuUi | null = null;
  private quantityUi: MartQuantityUi | null = null;
  private bagUi: BaseBagUi | null = null;
  private buyUi: MartBuyUi | null = null;
  private sellUi: MartSellUi | null = null;

  constructor(
    private scene: GameScene,
    private martItems: string[],
    private npcTextureKey: string,
  ) {}

  async enter(): Promise<void> {
    this.menuUi = new MenuUi(this.scene, this.scene.getInputManager(), {
      y: +800,
      itemHeight: 70,
    });
    this.quantityUi = new MartQuantityUi(this.scene, this.scene.getInputManager());

    await this.runMainLoop();
  }

  private async runMainLoop(): Promise<void> {
    const talk = this.scene.getMessage('talk');
    const question = this.scene.getMessage('question');

    let promptKey = 'mart:greeting';

    while (true) {
      await question.showMessage(i18next.t(promptKey), { resolveWhen: 'displayed' });

      const mainItems = [
        { key: 'buy', label: i18next.t('mart:buy') },
        { key: 'sell', label: i18next.t('mart:sell') },
        { key: 'cancel', label: i18next.t('mart:cancel') },
      ];

      const selected = await this.menuUi!.waitForSelect(mainItems);

      this.menuUi!.hide();
      question.hide();

      if (!selected || selected.key === 'cancel') {
        await talk.showMessage(i18next.t('mart:farewell'));
        this.scene.popPhase();
        return;
      }

      if (selected.key === 'buy') {
        await this.runBuyLoop();
      } else if (selected.key === 'sell') {
        await this.runSellLoop();
      }

      promptKey = 'mart:anythingElse';
    }
  }

  private async runBuyLoop(): Promise<void> {
    const talk = this.scene.getMessage('talk');
    const question = this.scene.getMessage('question');

    const user = this.scene.getUser();
    if (!user) return;

    if (!user.isItemBagLoaded()) {
      const bagData = await this.scene.getApi().getItemBag();
      if (bagData) user.hydrateItemBag(bagData);
    }

    if (!this.buyUi) {
      this.buyUi = new MartBuyUi(this.scene, this.scene.getInputManager());
    }

    this.buyUi.setNpcTextureKey(this.npcTextureKey);
    this.buyUi.setQuantityLookup((id) => user.getItemBag()?.get(id)?.quantity ?? 0);
    this.buyUi.setMoneyLookup(() => user.getProfile().money);

    const items = this.martItems.map((itemId) => {
      const itemData = this.scene.getMasterData().getItemData(itemId);
      const label = i18next.exists(`item:${itemId}.name`)
        ? i18next.t(`item:${itemId}.name`)
        : itemId;
      const count = itemData ? `${MONEY_SYMBOL} ${itemData.buyPrice}` : '';
      return { key: itemId, label, count };
    });
    this.buyUi.setItems(items);

    while (true) {
      const selectedKey = await this.buyUi.waitForSelect();

      if (!selectedKey) {
        this.buyUi.hide();
        return;
      }

      const itemId = selectedKey;
      const itemData = this.scene.getMasterData().getItemData(itemId);
      if (!itemData) continue;

      const owned = user.getItemBag()?.get(itemId)?.quantity ?? 0;
      const maxQty = Math.min(MAX_ITEM_QUANTITY - owned, MAX_BUY_QUANTITY);

      if (maxQty < 1) {
        await talk.showMessage(i18next.t('mart:itemMaxExceeded'));
        continue;
      }

      const qty = await this.quantityUi!.open({
        mode: 'buy',
        itemId,
        unitPrice: itemData.buyPrice,
        min: 1,
        max: maxQty,
      });

      if (!qty) {
        continue;
      }

      const total = qty * itemData.buyPrice;
      const itemName = i18next.exists(`item:${itemId}.name`)
        ? i18next.t(`item:${itemId}.name`)
        : itemId;

      await question.showMessage(
        i18next.t('mart:confirmBuy', { name: itemName, qty, total: total.toLocaleString() }),
        { resolveWhen: 'displayed' },
      );

      const confirm = await this.menuUi!.waitForSelect(YES_NO_ITEMS());

      this.menuUi!.hide();
      question.hide();

      if (confirm?.key !== 'yes') {
        continue;
      }

      // 클라 사전 검증
      const currentMoney = user.getProfile().money;
      const currentOwned = user.getItemBag()?.get(itemId)?.quantity ?? 0;
      if (currentMoney < total) {
        await talk.showMessage(i18next.t('mart:notEnoughMoney'));
        continue;
      }
      if (currentOwned + qty > MAX_ITEM_QUANTITY) {
        await talk.showMessage(i18next.t('mart:itemMaxExceeded'));
        continue;
      }

      try {
        const result = await this.scene.getApi().buyItem(itemId, qty);
        if (!result) {
          await talk.showMessage(i18next.t('error:INTERNAL_SERVER_ERROR'));
          continue;
        }
        user.setMoney(result.money);
        user.updateItemQuantity(result.item.itemId, result.item.quantity, result.item.register);
        this.buyUi.refresh();
        await talk.showMessage(i18next.t('mart:thanksBuy'));
      } catch (e) {
        const msg = this.resolveErrorMessage(e);
        await talk.showMessage(msg);
      }
    }
  }

  private async runSellLoop(): Promise<void> {
    const talk = this.scene.getMessage('talk');
    const question = this.scene.getMessage('question');

    const user = this.scene.getUser();
    if (!user) return;

    if (!user.isItemBagLoaded()) {
      const bagData = await this.scene.getApi().getItemBag();
      if (bagData) user.hydrateItemBag(bagData);
    }

    if (!this.bagUi) {
      this.bagUi = new MartSellBagUi(this.scene, this.scene.getInputManager());
    }

    const masterData = this.scene.getMasterData();

    // BagUi에 데이터 주입
    const bag = user.getItemBag();
    if (!bag) return;

    const entries: BagEntry[] = Array.from(bag.entries()).map(([itemId, entry]) => ({
      itemId,
      quantity: entry.quantity,
      register: entry.register,
    }));
    this.bagUi.setBagData(entries, (id) => masterData.getItemData(id)?.category ?? null);

    if (!this.sellUi) {
      this.sellUi = new MartSellUi(this.scene, this.scene.getInputManager());
    }
    this.sellUi.setMoneyLookup(() => user.getProfile().money);
    this.sellUi.show();

    while (true) {
      const selection = await this.bagUi.showBag();

      if (!selection) {
        this.bagUi.hide();
        this.sellUi!.hide();
        return;
      }

      const { entry } = selection;
      const itemId = entry.itemId;
      const itemData = masterData.getItemData(itemId);

      if (!itemData) continue;

      if (!itemData.sellable || itemData.sellPrice <= 0) {
        await talk.showMessage(i18next.t('mart:notSellable'));
        continue;
      }

      const money = user.getProfile().money;
      const maxByMoney = Math.floor((MAX_USER_MONEY - money) / itemData.sellPrice);
      const maxQty = Math.min(entry.quantity, maxByMoney);

      if (maxQty < 1) {
        await talk.showMessage(i18next.t('mart:moneyMaxExceeded'));
        continue;
      }

      const qty = await this.quantityUi!.open({
        mode: 'sell',
        itemId,
        unitPrice: itemData.sellPrice,
        min: 1,
        max: maxQty,
      });

      if (!qty) {
        continue;
      }

      const total = qty * itemData.sellPrice;
      const itemName = i18next.exists(`item:${itemId}.name`)
        ? i18next.t(`item:${itemId}.name`)
        : itemId;

      await question.showMessage(
        i18next.t('mart:confirmSell', { name: itemName, qty, total: total.toLocaleString() }),
        { resolveWhen: 'displayed' },
      );

      const confirm = await this.menuUi!.waitForSelect(YES_NO_ITEMS());

      this.menuUi!.hide();
      question.hide();

      if (confirm?.key !== 'yes') {
        continue;
      }

      // 클라 사전 검증
      const currentMoney = user.getProfile().money;
      const currentOwned = user.getItemBag()?.get(itemId)?.quantity ?? 0;
      if (currentOwned < qty) {
        await talk.showMessage(i18next.t('mart:notEnoughItems'));
        continue;
      }
      if (currentMoney + total > MAX_USER_MONEY) {
        await talk.showMessage(i18next.t('mart:moneyMaxExceeded'));
        continue;
      }

      try {
        const result = await this.scene.getApi().sellItem(itemId, qty);
        if (!result) {
          await talk.showMessage(i18next.t('error:INTERNAL_SERVER_ERROR'));
          continue;
        }
        user.setMoney(result.money);
        user.decreaseItemQuantity(itemId, qty);
        this.sellUi!.refreshMoney();

        // BagUi 데이터 갱신
        const updatedBag = user.getItemBag();
        if (updatedBag) {
          const updatedEntries: BagEntry[] = Array.from(updatedBag.entries()).map(([id, e]) => ({
            itemId: id,
            quantity: e.quantity,
            register: e.register,
          }));
          this.bagUi.setBagData(
            updatedEntries,
            (id) => masterData.getItemData(id)?.category ?? null,
          );
        }

        await talk.showMessage(i18next.t('mart:thanksSell'));
      } catch (e) {
        const msg = this.resolveErrorMessage(e);
        await talk.showMessage(msg);
      }
    }
  }

  private resolveErrorMessage(e: unknown): string {
    if (e instanceof ApiError) {
      const martKey = this.errorCodeToMartKey(e.code);
      if (martKey) {
        const key = `mart:${martKey}`;
        if (i18next.exists(key)) return i18next.t(key);
      }
      const errKey = `error:${e.code}`;
      if (i18next.exists(errKey)) return i18next.t(errKey);
    }
    return i18next.t('error:INTERNAL_SERVER_ERROR');
  }

  private errorCodeToMartKey(code: string): string {
    const map: Record<string, string> = {
      INSUFFICIENT_MONEY: 'notEnoughMoney',
      ITEM_QUANTITY_LIMIT_EXCEEDED: 'itemMaxExceeded',
      MONEY_LIMIT_EXCEEDED: 'moneyMaxExceeded',
      ITEM_NOT_SELLABLE: 'notSellable',
      ITEM_NOT_PURCHASABLE: 'notPurchasable',
      ITEM_NOT_FOUND: 'itemNotFound',
      ITEM_INSUFFICIENT_QUANTITY: 'notEnoughItems',
    };
    return map[code] ?? '';
  }

  exit(): void {
    this.scene.getMessage('question').hide();
    this.menuUi?.hide();
    this.menuUi?.destroy();
    this.menuUi = null;
    this.quantityUi?.hide();
    this.quantityUi?.destroy();
    this.quantityUi = null;
    this.bagUi?.hide();
    this.bagUi?.destroy();
    this.bagUi = null;
    this.buyUi?.hide();
    this.buyUi?.destroy();
    this.buyUi = null;
    this.sellUi?.hide();
    this.sellUi?.destroy();
    this.sellUi = null;
  }

  onPause?(): void {}
  onResume?(): void {}
  onRefreshLanguage?(): void {}
}
