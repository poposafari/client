import { BaseUi } from '@poposafari/core';
import i18next from '@poposafari/i18n';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, SFX, StartingPokemon, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { StartingGridSelectUi } from './starting-grid-select.ui';
import { StartingMenuUi } from './starting-menu.ui';
import {
  addBackground,
  addText,
  replacePlaceholders,
  updateRankTextColor,
} from '@poposafari/utils';

const YES_YES_ITEMS = () => [
  { key: 'yes', label: i18next.t('menu:yes') },
  { key: 'yes', label: i18next.t('menu:yes1') },
  { key: 'yes', label: i18next.t('menu:yes2') },
];

const YES_NO_ITEMS = () => [
  { key: 'yes', label: i18next.t('menu:yes') },
  { key: 'no', label: i18next.t('menu:no') },
];

export class StartingUi extends BaseUi {
  scene: GameScene;
  menuUi: StartingMenuUi;
  gridSelectUi: StartingGridSelectUi;

  private bg!: GImage;
  private title!: GText;
  private pokemonName!: GText;
  private pokemonDesc!: GText;

  private resolveGridSelection: ((result: { key: string; index: number } | null) => void) | null =
    null;

  private lastAnimatedIconKey: string | null = null;

  constructor(scene: GameScene, menuUi: StartingMenuUi, gridSelectUi: StartingGridSelectUi) {
    super(scene, scene.getInputManager(), DEPTH.MESSAGE - 1);
    this.scene = scene;
    this.menuUi = menuUi;
    this.gridSelectUi = gridSelectUi;

    this.createLayout();

    this.add([this.bg, this.title, this.pokemonName, this.pokemonDesc]);
  }

  onInput(key: string): void {
    throw new Error('Method not implemented.');
  }
  errorEffect(errorMsg: string): void {
    throw new Error('Method not implemented.');
  }
  waitForInput(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  createLayout(): void {
    this.bg = addBackground(this.scene, TEXTURE.BG_BLACK).setAlpha(0.5);
    this.title = addText(
      this.scene,
      0,
      -420,
      i18next.t('menu:pickStartingPokemon'),
      70,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    this.pokemonName = addText(
      this.scene,
      0,
      +250,
      '이상해씨',
      90,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.pokemonDesc = addText(
      this.scene,
      0,
      +320,
      '태어날 때부터 등에 씨앗을 짊어지고 있다. 몸이 크게 성장함에 따라 씨앗도 커진다.',
      60,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    ).setOrigin(0.5, 0);
  }

  waitForGridSelect(): Promise<{ key: string; index: number } | null> {
    this.lastAnimatedIconKey = null;
    this.gridSelectUi.onCursorMoved = (key) => this.onGridCursorMoved(key);
    this.gridSelectUi.onConfirm = () => this.onSelectPokemon(this.gridSelectUi.getSelectedKey());
    // this.gridSelectUi.onCancel = () => this.finishGridSelection(null);

    this.gridSelectUi.show();
    this.onGridCursorMoved(this.gridSelectUi.getSelectedKey());
    return new Promise<{ key: string; index: number } | null>((resolve) => {
      this.resolveGridSelection = resolve;
    });
  }

  private onGridCursorMoved(selectedKey: string): void {
    this.stopPreviousIconAnimation();
    this.playIconAnimation(selectedKey);
    this.lastAnimatedIconKey = selectedKey;

    const name = i18next.t(`pokemon:${selectedKey}.name`);
    const description = i18next.t(`pokemon:${selectedKey}.description`);
    const rank = this.scene.getMasterData().getPokemonData(selectedKey)?.rank;

    updateRankTextColor(this.pokemonName, rank!);

    this.pokemonName.setText(name);
    this.pokemonDesc.setText(description);
  }

  private stopPreviousIconAnimation(): void {
    if (!this.lastAnimatedIconKey) return;
    const item = this.gridSelectUi.getItemByKey(this.lastAnimatedIconKey);
    const sprite = item?.image as Phaser.GameObjects.Sprite | undefined;
    if (!sprite?.anims) return;

    sprite.anims.stop();
    const animKey = this.gridSelectUi.getIconAnimationKey(this.lastAnimatedIconKey);
    if (animKey) {
      const anim = this.scene.anims.get(animKey);
      const firstFrame = anim?.frames?.[0]?.frame?.name;
      if (firstFrame) sprite.setFrame(firstFrame);
    }
  }

  private playIconAnimation(key: string): void {
    const animKey = this.gridSelectUi.getIconAnimationKey(key);
    const item = this.gridSelectUi.getItemByKey(key);
    const sprite = item?.image as Phaser.GameObjects.Sprite | undefined;
    if (animKey && sprite?.play) sprite.play(animKey);
  }

  private async onSelectPokemon(key: string | null): Promise<void> {
    const name = i18next.t(`pokemon:${key}.name`);
    const question = this.scene.getMessage('question');

    await question.showMessage(replacePlaceholders(i18next.t('msg:pickStartingPokemon_0'), name), {
      name: 'professor',
      resolveWhen: 'displayed',
    });
    const choice = await this.menuUi.waitForSelect(YES_NO_ITEMS());

    if (choice?.key === 'yes') {
      if (this.resolveGridSelection) {
        this.resolveGridSelection({
          key: key!,
          index: this.gridSelectUi.getSelectedIndex(),
        });
        this.resolveGridSelection = null;
      }
      this.menuUi.hide();
      question.hide();
      this.gridSelectUi.hide();
      this.bg.setVisible(false);
      this.title.setVisible(false);
      this.pokemonName.setVisible(false);
      this.pokemonDesc.setVisible(false);
    } else {
      this.menuUi.hide();
      question.hide();
    }
  }

  async runStartingFlow(): Promise<boolean> {
    const talk = this.scene.getMessage('talk');
    const question = this.scene.getMessage('question');

    await talk.showMessage(i18next.t('msg:professor_0'), { name: 'professor' });
    await talk.showMessage(i18next.t('msg:professor_1'), { name: 'professor' });
    await talk.showMessage(i18next.t('msg:professor_2'), { name: 'professor' });
    await talk.showMessage(i18next.t('msg:professor_3'), { name: 'professor' });
    await question.showMessage(i18next.t('msg:professor_4'), {
      name: 'professor',
      resolveWhen: 'displayed',
    });
    const choice = await this.menuUi.waitForSelect(YES_YES_ITEMS());
    this.menuUi.hide();
    question.hide();

    if (!choice || choice?.key === 'yes') {
      await talk.showMessage(i18next.t('msg:professor_5'), { name: 'professor' });

      return true;
    }

    return false;
  }

  async runCongratulationsFlow(key: string): Promise<void> {
    const talk = this.scene.getMessage('talk');
    const playerNickname = this.scene.getUser()?.getProfile()?.nickname ?? '';
    const pokemonName = i18next.t(`pokemon:${key}.name`);

    this.scene.getAudio().playEffect(SFX.CONGRATULATIONS);
    await talk.showMessage(
      replacePlaceholders(i18next.t('msg:receiveProfessor'), playerNickname, pokemonName),
      { speed: 80 },
    );
    await talk.showMessage(
      replacePlaceholders(i18next.t('msg:professor_6'), playerNickname, pokemonName),
      { name: 'professor' },
    );

    this.scene.getAudio().playEffect(SFX.GET_0);
    await talk.showMessage(
      replacePlaceholders(
        i18next.t('msg:receiveProfessor'),
        playerNickname,
        i18next.t('menu:startingItem'),
      ),
      { speed: 80 },
    );

    await talk.showMessage(
      replacePlaceholders(i18next.t('msg:professor_7'), playerNickname, pokemonName),
      { name: 'professor' },
    );
  }

  async runStartingPokemonFlow(
    pokemons: StartingPokemon[],
  ): Promise<{ key: string; index: number } | null> {
    this.gridSelectUi.setPokemonItems(pokemons);
    return this.waitForGridSelect();
  }

  onRefreshLanguage(): void {
    this.menuUi.onRefreshLanguage();
    this.gridSelectUi.onRefreshLanguage();
  }
}
