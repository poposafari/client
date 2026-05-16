import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { IMenuItem, SFX, TEXTCOLOR } from '@poposafari/types';
import { MenuUi } from '@poposafari/feats/menu/menu-ui';
import { MenuListUi } from '@poposafari/feats/menu/menu-list.ui';
import { getPokemonI18Name, showApiErrorAsTalk } from '@poposafari/utils';
import i18next from 'i18next';
import { FOSSIL_RECIPES, type FossilRecipe } from './fossil.recipe';

const YES_NO_ITEMS = () => [
  { key: 'yes', label: i18next.t('etc:yes') },
  { key: 'no', label: i18next.t('etc:no') },
];

function getItemLocaleName(itemId: string): string {
  const key = `item:${itemId}.name`;
  return i18next.exists(key) ? i18next.t(key) : itemId;
}

function buildRecipeLabel(recipe: FossilRecipe): string {
  return recipe.ingredients.map(getItemLocaleName).join(' + ');
}

export class FossilPhase implements IGamePhase {
  private menuUi: MenuUi | null = null;
  private recipeListUi: MenuListUi | null = null;

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    this.menuUi = new MenuUi(this.scene, this.scene.getInputManager(), {
      y: +800,
      itemHeight: 70,
    });

    const question = this.scene.getMessage('question');

    await question.showMessage(i18next.t('fossil:greeting'), { resolveWhen: 'displayed' });
    const choice = await this.menuUi.waitForSelect(YES_NO_ITEMS());
    this.menuUi.hide();
    question.hide();

    if (choice?.key !== 'yes') {
      this.scene.popPhase();
      return;
    }

    await this.runRecipeLoop();
    this.scene.popPhase();
  }

  private async runRecipeLoop(): Promise<void> {
    const user = this.scene.getUser();
    if (!user) return;

    if (!user.isItemBagLoaded()) {
      const bagData = await this.scene.getApi().getItemBag();
      if (bagData) user.hydrateItemBag(bagData);
    }

    this.recipeListUi = new MenuListUi(this.scene, this.scene.getInputManager(), {
      x: +1665,
      y: +390,
      visibleCount: 6,
      itemHeight: 0,
      showCancel: true,
    });

    while (true) {
      const items = this.buildMenuItems();
      this.recipeListUi.setItems(items);
      const selected = await this.recipeListUi.waitForSelect();
      this.recipeListUi.hide();

      if (!selected || selected.key === 'cancel') return;

      const recipeId = Number(selected.key);
      const recipe = FOSSIL_RECIPES.find((r) => r.id === recipeId);
      if (!recipe) continue;

      const proceeded = await this.confirmAndRestore(recipe);
      if (!proceeded) continue;
    }
  }

  private buildMenuItems(): IMenuItem[] {
    const user = this.scene.getUser();
    const bag = user?.getItemBag();

    return FOSSIL_RECIPES.map((recipe) => {
      const insufficient = recipe.ingredients.some((id) => (bag?.get(id)?.quantity ?? 0) < 1);
      const item: IMenuItem = {
        key: String(recipe.id),
        label: buildRecipeLabel(recipe),
      };
      if (insufficient) {
        item.disabled = true;
        item.color = TEXTCOLOR.GRAY;
      }
      return item;
    });
  }

  private async confirmAndRestore(recipe: FossilRecipe): Promise<boolean> {
    const question = this.scene.getMessage('question');
    const talk = this.scene.getMessage('talk');

    const confirmKey = recipe.ingredients.length === 1 ? 'fossil:confirmOne' : 'fossil:confirmTwo';
    const ingredientNames = recipe.ingredients.map(getItemLocaleName);
    const confirmVars =
      recipe.ingredients.length === 1
        ? { name: ingredientNames[0] }
        : { name1: ingredientNames[0], name2: ingredientNames[1] };

    await question.showMessage(i18next.t(confirmKey, confirmVars), {
      resolveWhen: 'displayed',
    });
    const confirm = await this.menuUi!.waitForSelect(YES_NO_ITEMS());
    this.menuUi!.hide();
    question.hide();

    if (confirm?.key !== 'yes') return false;

    let result;
    try {
      result = await this.scene.getApi().restoreFossil(recipe.id);
    } catch (e) {
      await showApiErrorAsTalk(this.scene, e);
      return false;
    }
    if (!result) {
      await talk.showMessage(i18next.t('error:INTERNAL_SERVER_ERROR'));
      return false;
    }

    const user = this.scene.getUser();
    if (!user) return false;

    const p = result.pokemon;
    user.addPokemonToBox({
      id: p.id,
      pokedexId: p.pokedexId,
      level: p.level,
      friendship: p.friendship ?? 0,
      gender: p.gender,
      isShiny: p.isShiny,
      nickname: p.nickname,
      abilityId: p.abilityId,
      natureId: p.natureId,
      skills: p.skills,
      heldItemId: p.heldItemId ?? null,
      boxNumber: p.boxNumber,
      gridNumber: p.gridNumber,
      ballId: p.ballId,
      caughtLocation: p.caughtLocation,
      caughtAt: p.caughtAt ?? new Date().toISOString(),
    });
    user.incrementPokedexCount(p.pokedexId);
    for (const ingredientId of recipe.ingredients) {
      user.decreaseItemQuantity(ingredientId, 1);
    }

    const audio = this.scene.getAudio();
    const sfxDone = audio.playEffectAwaitable(SFX.CONGRATULATIONS);

    const nickname = user.getProfile().nickname;
    const pokemonName = getPokemonI18Name(p.pokedexId);
    await talk.showMessage(i18next.t('fossil:received', { nickname, name: pokemonName }), {
      unlockInputAfter: sfxDone,
    });

    return true;
  }

  exit(): void {
    this.scene.getMessage('question').hide();
    this.menuUi?.hide();
    this.menuUi?.destroy();
    this.menuUi = null;
    this.recipeListUi?.hide();
    this.recipeListUi?.destroy();
    this.recipeListUi = null;
  }

  onPause?(): void {}
  onResume?(): void {}
  onRefreshLanguage?(): void {}
}
