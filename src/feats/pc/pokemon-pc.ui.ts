import { BaseUi } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import {
  DEPTH,
  EASE,
  IMenuItem,
  KEY,
  PokemonHiddenMove,
  SFX,
  SYMBOL_MALE,
  TEXTCOLOR,
  TEXTSHADOW,
  TEXTSTYLE,
  TEXTURE,
  type PokemonBoxItem,
  type PokemonRank,
} from '@poposafari/types';
import {
  addBackground,
  addImage,
  addSprite,
  addText,
  addWindow,
  getPokedexId,
  getPokemonI18Name,
  getPokemonTexture,
  getPokemonTypeFrame,
  updatePokemonGenderIcon,
} from '@poposafari/utils';
import i18next from 'i18next';
import { PokemonPcGridSelectUi } from './pokemon-pc-grid-select.ui';
import { PcLocalState } from './pc-local-state';
import { MenuListUi } from '../menu/menu-list.ui';
import { MenuUi } from '../menu/menu-ui';
import { NameInputUi } from './name-input.ui';
import { EnhancePanelUi } from './enhance-panel.ui';
import { EvolveSelectUi, parseCostParts } from './evolve-select.ui';
import DayNightFilter from '@poposafari/utils/day-night-filter';
import { EvolveUi } from './evolve.ui';
import { PokemonTypeContainer } from '@poposafari/containers/pokemon-type.container';
import { PokemonSkillContainer } from '@poposafari/containers/pokemon-skill.container';

type PcFocusArea = 'grid' | 'party' | 'top' | 'grab';
export type PcMode = 'manage' | 'selectForGive' | 'selectForTeachMove';

const RANK_COLOR: Record<PokemonRank, string> = {
  common: TEXTCOLOR.COMMON,
  rare: TEXTCOLOR.RARE,
  epic: TEXTCOLOR.EPIC,
  legendary: TEXTCOLOR.LEGENDARY,
};

const RANK_LOCALE: Record<PokemonRank, string> = {
  common: 'menu:tierCommon',
  rare: 'menu:tierRare',
  epic: 'menu:tierEpic',
  legendary: 'menu:tierLegendary',
};

export class PokemonPcUi extends BaseUi {
  scene: GameScene;
  private bg!: GImage;
  private guideFrame!: GWindow;
  private pcBg!: GSprite;
  private pcBgFrame!: GWindow;
  private partyWindow!: GWindow;

  private info!: GImage;
  private infoPokedex!: GText;
  private infoFront!: GImage;
  private infoPokemonName!: GText;
  private infoCapturePokeball!: GImage;
  private infoShinyIcon!: GImage;
  private infoLevel!: GText;
  private infoCaptureLocation!: GText;
  private infoCaptureDate!: GText;
  private infoGender!: GText;
  private infoAbility!: GText;
  private infoNature!: GText;
  private infoType1!: PokemonTypeContainer;
  private infoType2!: PokemonTypeContainer;
  private heldItem!: GText;
  private infoPokedexSymbol!: GText;
  private infoNatureSymbol!: GText;
  private infoAbilitySymbol!: GText;
  private heldItemSymbol!: GText;
  private infoTier!: GText;
  private infoCandySymbol!: GImage;
  private infoCandy!: GText;
  private infoFriendshipSymbol!: GImage;
  private infoFriendship!: GText;
  private infoSkills: PokemonSkillContainer[] = [];

  private topName!: GText;
  private topCursor!: GSprite;

  private gridSelect!: PokemonPcGridSelectUi;
  private focusArea: PcFocusArea = 'grid';
  private partyCursorIndex = 0;
  private boxPokemons: PokemonBoxItem[] = [];
  private currentBoxIndex = 0;
  private totalBoxCount = 1;

  private pcState: PcLocalState;
  private gridMenu: MenuListUi;
  private partyMenu: MenuUi;
  private topMenu: MenuUi;
  private confirmMenu: MenuUi;
  private wallpaperMenu: MenuListUi;
  private nameInput: NameInputUi;
  private enhancePanel!: EnhancePanelUi;
  private evolveSelect!: EvolveSelectUi;
  private evolveUi!: EvolveUi;
  private menuOpen = false;
  private inputLocked = false;

  private partyBaseY = 0;

  // grab mode
  private grabbedPokemonId: number | null = null;
  private grabOrigin: {
    boxNumber: number | null;
    gridNumber: number | null;
    partySlot: number | null;
  } | null = null;
  private grabCursorInParty = false;
  private grabInTop = false;
  private grabGridIndex = 0;
  private grabPartyIndex = 0;
  private grabCursor!: GSprite;
  private grabIcon!: GImage;

  // party slot icons
  private partySlotIcons: GImage[] = [];
  private partySlotLevels: GText[] = [];
  private partyCursor!: GSprite;

  onClose?: () => void;

  /** selectForGive 모드에서 포켓몬이 선택되었을 때 호출 */
  onPokemonSelected?: (pokemon: PokemonBoxItem) => void;

  /** 박스 전환 시 호출 — 외부에서 해당 박스의 PokemonBoxItem[]을 반환 */
  onBoxChange?: (boxIndex: number) => void;

  private mode: PcMode;
  private teachMoveId: string | null = null;

  constructor(
    scene: GameScene,
    pcState: PcLocalState,
    mode: PcMode = 'manage',
    teachMoveId: string | null = null,
  ) {
    super(scene, scene.getInputManager(), DEPTH.MESSAGE - 1);

    this.scene = scene;
    this.pcState = pcState;
    this.mode = mode;
    this.teachMoveId = teachMoveId;

    this.createLayout();

    this.gridSelect = new PokemonPcGridSelectUi(scene, scene.getInputManager());
    this.gridSelect.onExitTop = () => this.switchFocus('top');
    this.gridSelect.onExitBottom = () => this.switchFocus('party');
    this.gridSelect.onCursorMoved = (selectedKey) => this.updateInfo(selectedKey);
    this.gridSelect.onConfirm = () => this.openGridMenu();
    this.gridSelect.onCancel = () => this.onClose?.();

    this.gridMenu = new MenuListUi(scene, scene.getInputManager(), {
      x: +1540,
      y: +700,
      visibleCount: 6,
      itemHeight: 0,
      showCancel: false,
    });
    this.partyMenu = new MenuUi(scene, scene.getInputManager(), { y: +1070 });
    this.topMenu = new MenuUi(scene, scene.getInputManager(), { y: +1070 });
    this.confirmMenu = new MenuUi(scene, scene.getInputManager(), { y: +805, itemHeight: 70 });
    this.wallpaperMenu = new MenuListUi(scene, scene.getInputManager(), {
      x: +1540,
      y: +700,
      visibleCount: 6,
      itemHeight: 0,
      showCancel: false,
    });
    this.nameInput = new NameInputUi(scene);
    this.enhancePanel = new EnhancePanelUi(scene);
    this.evolveSelect = new EvolveSelectUi(scene);
    this.evolveUi = new EvolveUi(scene);

    // 이전 커서 상태 복원
    const user = this.scene.getUser();
    this.currentBoxIndex = user?.getPcBoxIndex() ?? 0;
    this.totalBoxCount = 30;
    this.refreshCurrentBox();
    const savedGridIndex = user?.getPcGridIndex() ?? 0;
    this.gridSelect.setCursorToIndex(savedGridIndex);
    this.updateInfo(this.gridSelect.getSelectedKey());

    this.add([
      this.bg,
      this.pcBgFrame,
      this.pcBg,
      this.partyWindow,
      this.info,
      this.gridSelect,
      this.infoPokedex,
      this.infoFront,
      this.infoPokemonName,
      this.infoLevel,
      this.infoCapturePokeball,
      this.infoCaptureDate,
      this.infoCaptureLocation,
      this.infoShinyIcon,
      this.infoGender,
      this.infoTier,
      this.infoAbility,
      this.infoNature,
      this.infoNatureSymbol,
      this.infoAbilitySymbol,
      this.infoPokedexSymbol,
      this.heldItemSymbol,
      this.infoCandySymbol,
      this.infoCandy,
      this.infoFriendshipSymbol,
      this.infoFriendship,
      this.infoType1,
      this.infoType2,
      this.infoSkills[0],
      this.infoSkills[1],
      this.infoSkills[2],
      this.infoSkills[3],
      this.heldItem,
      this.topName,
      this.topCursor,
      ...this.partySlotIcons,
      ...this.partySlotLevels,
      this.partyCursor,
      this.grabIcon,
      this.grabCursor,
    ]);
  }

  private isEligibleForTeachMove(pokemon: PokemonBoxItem): boolean {
    if (this.mode !== 'selectForTeachMove' || !this.teachMoveId) return true;
    const data = this.scene.getMasterData().getPokemonData(pokemon.pokedexId);
    if (!data) return false;
    if (!(data.skills as readonly string[]).includes(this.teachMoveId)) return false;
    const skills = (pokemon.skills as string[] | null | undefined) ?? [];
    if (skills.includes(this.teachMoveId)) return false;
    return skills.length < 4;
  }

  private applyTeachMoveFilterToGrid(): void {
    if (this.mode !== 'selectForTeachMove') return;
    const eligible = new Set<string>();
    for (const p of this.boxPokemons) {
      if (this.isEligibleForTeachMove(p)) eligible.add(String(p.id));
    }
    this.gridSelect.applyAlphaFilter(eligible);
  }

  private applyTeachMoveFilterToParty(): void {
    if (this.mode !== 'selectForTeachMove') return;
    const partyPokemons = this.pcState.getPartyPokemons();
    for (let i = 0; i < 6; i++) {
      const pokemon = partyPokemons[i];
      if (!pokemon || !this.partySlotIcons[i]) continue;
      this.partySlotIcons[i].setAlpha(this.isEligibleForTeachMove(pokemon) ? 1 : 0.3);
    }
  }

  private refreshCurrentBox(): void {
    const boxNumber = this.currentBoxIndex + 1;
    this.boxPokemons = this.pcState.getBoxPokemons(boxNumber);
    this.gridSelect.setPokemonItems(this.boxPokemons);
    this.applyTeachMoveFilterToGrid();

    const meta = this.pcState.getBoxMeta(boxNumber);
    const displayName = meta.name || `${i18next.t('pc:box')} ${boxNumber}`;
    this.topName.setText(displayName);
    this.pcBg.setFrame(`pc_bgs-${meta.wallpaper}`);
    this.refreshPartySlots();
    if (this.focusArea === 'top' || this.focusArea === 'grab') {
      this.clearInfo();
    } else if (this.boxPokemons.length > 0) {
      this.updateInfo(String(this.boxPokemons[0].id));
    }
  }

  private refreshPartySlots(): void {
    const partyPokemons = this.pcState.getPartyPokemons();
    for (let i = 0; i < 6; i++) {
      const pokemon = partyPokemons[i];
      if (pokemon && this.partySlotIcons[i]) {
        const key = pokemon.pokedexId;
        const tex = getPokemonTexture('icon', key, { isShiny: pokemon.isShiny });
        this.partySlotIcons[i].setTexture(tex.key, tex.frame + '_0').setVisible(true);
        this.partySlotLevels[i].setText(`(+${pokemon.level})`).setVisible(true);
      } else if (this.partySlotIcons[i]) {
        this.partySlotIcons[i].setVisible(false);
        this.partySlotLevels[i].setVisible(false);
      }
    }
    this.applyTeachMoveFilterToParty();
  }

  private switchFocus(area: PcFocusArea): void {
    if (this.focusArea === area) return;

    // 이전 포커스의 입력만 해제 (visibility 유지)
    if (this.focusArea === 'grid') {
      this.inputManager.pop(this.gridSelect);
      this.gridSelect.setCursorVisible(false);
    } else {
      this.inputManager.pop(this);
    }

    this.focusArea = area;

    // 새 포커스의 입력만 활성화
    if (area === 'grid') {
      this.gridSelect.setCursorVisible(true);
      this.topCursor.setVisible(false);
      this.partyCursor.setVisible(false);
      this.updateInfo(this.gridSelect.getSelectedKey());
      this.inputManager.push(this.gridSelect);
    } else if (area === 'top') {
      this.topCursor.setVisible(true);
      this.partyCursor.setVisible(false);
      this.clearInfo();
      this.inputManager.push(this);
    } else if (area === 'party') {
      this.partyCursor.setVisible(true);
      this.topCursor.setVisible(false);
      this.updatePartyCursorPosition();
      this.updatePartySlotInfo();
      this.inputManager.push(this);
    }
  }

  show(): void {
    super.show();
    this.inputManager.pop(this);
    this.focusArea = 'grid';
    this.gridSelect.setVisible(true);
    this.inputManager.push(this.gridSelect);
  }

  hide(): void {
    const user = this.scene.getUser();
    user?.setPcBoxIndex(this.currentBoxIndex);
    user?.setPcGridIndex(this.gridSelect.getSelectedIndex());

    if (this.focusArea === 'grid') {
      this.inputManager.pop(this.gridSelect);
    } else {
      this.inputManager.pop(this);
    }
    this.gridSelect.setVisible(false);
    super.hide();
  }

  onInput(key: string): void {
    if (this.inputLocked) return;
    if (this.focusArea === 'party') {
      this.handlePartyInput(key);
    } else if (this.focusArea === 'top') {
      this.handleTopInput(key);
    } else if (this.focusArea === 'grab') {
      this.handleGrabInput(key);
    }
  }

  private handlePartyInput(key: string): void {
    switch (key) {
      case KEY.UP:
        this.switchFocus('grid');
        break;
      case KEY.LEFT:
        if (this.partyCursorIndex > 0) {
          this.partyCursorIndex--;
          this.updatePartyCursorPosition();
          this.updatePartySlotInfo();
          this.scene.getAudio().playEffect(SFX.CURSOR_0);
        }
        break;
      case KEY.RIGHT:
        if (this.partyCursorIndex < 5) {
          this.partyCursorIndex++;
          this.updatePartyCursorPosition();
          this.updatePartySlotInfo();
          this.scene.getAudio().playEffect(SFX.CURSOR_0);
        }
        break;
      case KEY.Z:
      case KEY.ENTER: {
        // 빈 슬롯이면 무시
        const slotPokemon = this.pcState.getPokemonAtPartySlot(this.partyCursorIndex);
        if (!slotPokemon) break;
        if (this.mode === 'selectForTeachMove' && !this.isEligibleForTeachMove(slotPokemon)) break;
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.openPartyMenu();
        break;
      }
      case KEY.X:
      case KEY.ESC:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.onClose?.();
        break;
    }
  }

  private handleTopInput(key: string): void {
    switch (key) {
      case KEY.DOWN:
        this.switchFocus('grid');
        this.topCursor.setVisible(false);
        break;
      case KEY.LEFT:
        this.switchBox(-1);
        break;
      case KEY.RIGHT:
        this.switchBox(+1);
        break;
      case KEY.Z:
      case KEY.ENTER:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.openTopMenu();
        break;
      case KEY.X:
      case KEY.ESC:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.onClose?.();
        break;
    }
  }

  private handleGrabInput(key: string): void {
    if (!this.grabbedPokemonId) return;

    switch (key) {
      case KEY.UP:
        if (this.grabInTop) {
        } else if (this.grabCursorInParty) {
          this.grabCursorInParty = false;
          this.grabGridIndex = 24 + Math.min(this.grabPartyIndex, 5);
        } else {
          if (this.grabGridIndex < 6) {
            this.grabInTop = true;
          } else {
            this.grabGridIndex -= 6;
          }
        }
        this.updateGrabCursorPosition();
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        break;
      case KEY.DOWN:
        if (this.grabInTop) {
          this.grabInTop = false;
        } else if (this.grabCursorInParty) {
        } else {
          if (this.grabGridIndex >= 24) {
            this.grabCursorInParty = true;
            this.grabPartyIndex = this.grabGridIndex % 6;
          } else {
            this.grabGridIndex += 6;
          }
        }
        this.updateGrabCursorPosition();
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        break;
      case KEY.LEFT:
        if (this.grabInTop) {
          this.switchBoxWhileGrabbing(-1);
        } else if (this.grabCursorInParty) {
          if (this.grabPartyIndex > 0) this.grabPartyIndex--;
        } else {
          if (this.grabGridIndex % 6 > 0) this.grabGridIndex--;
        }
        this.updateGrabCursorPosition();
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        break;
      case KEY.RIGHT:
        if (this.grabInTop) {
          this.switchBoxWhileGrabbing(+1);
        } else if (this.grabCursorInParty) {
          if (this.grabPartyIndex < 5) this.grabPartyIndex++;
        } else {
          if (this.grabGridIndex % 6 < 5) {
            this.grabGridIndex++;
          }
        }
        this.updateGrabCursorPosition();
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        break;
      case KEY.Z:
      case KEY.ENTER:
        if (this.grabInTop) break;
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.placeGrabbedPokemon();
        break;
      case KEY.X:
      case KEY.ESC:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.cancelGrab();
        break;
    }
  }

  private switchBoxWhileGrabbing(delta: number): void {
    if (this.totalBoxCount <= 1) return;
    const next = (this.currentBoxIndex + delta + this.totalBoxCount) % this.totalBoxCount;
    if (next === this.currentBoxIndex) return;
    this.currentBoxIndex = next;
    this.refreshCurrentBox();
  }

  private openGridMenu(): void {
    if (this.gridSelect.isEmptySlot(this.gridSelect.getSelectedIndex())) return;
    const selectedKey = this.gridSelect.getSelectedKey();
    const pokemon = this.boxPokemons.find((p) => String(p.id) === selectedKey);
    if (!pokemon) return;

    if (this.mode === 'selectForGive') {
      this.scene.getAudio().playEffect(SFX.CURSOR_0);
      this.onPokemonSelected?.(pokemon);
      return;
    }

    if (this.mode === 'selectForTeachMove') {
      if (!this.isEligibleForTeachMove(pokemon)) return;
      this.scene.getAudio().playEffect(SFX.CURSOR_0);
      this.onPokemonSelected?.(pokemon);
      return;
    }

    const items: IMenuItem[] = [];

    const partySlot = this.pcState.getNextFreePartySlot();
    items.push({
      key: 'pc:addToParty',
      label: i18next.t('pc:addToParty'),
      disabled: partySlot === null,
    });

    const hasHeldItem = pokemon.heldItemId !== null;
    const pokemonData = this.scene.getMasterData().getPokemonData(pokemon.pokedexId);
    const candyKey = pokemonData ? `${pokemonData.type1}-candy` : '';
    const bag = this.scene.getUser()?.getItemBag();
    const hasCandy = (bag?.get(candyKey)?.quantity ?? 0) > 0;
    const canEvolve = !!pokemonData && pokemonData.nextEvol.next.length > 0;

    items.push(
      { key: 'pc:grab', label: i18next.t('pc:grab') },
      { key: 'pc:heldItem', label: i18next.t('pc:heldItem'), disabled: !hasHeldItem },
      { key: 'pc:evolve', label: i18next.t('pc:evolve'), disabled: !canEvolve },
      { key: 'pc:strengthen', label: i18next.t('pc:strengthen'), disabled: !hasCandy },
      { key: 'pc:rename', label: i18next.t('pc:rename') },
      { key: 'pc:sendToProfessor', label: i18next.t('pc:sendToProfessor') },
      { key: 'pc:cancel', label: i18next.t('pc:cancel') },
    );

    this.inputManager.pop(this.gridSelect);

    this.gridMenu.waitForSelect(items).then((selected) => {
      this.gridMenu.hide();

      if (!selected || selected.key === 'pc:cancel') {
        this.inputManager.push(this.gridSelect);
        return;
      }

      switch (selected.key) {
        case 'pc:addToParty': {
          const slot = this.pcState.getNextFreePartySlot();
          if (slot !== null) {
            this.pcState.moveToParty(pokemon.id, slot);
            this.refreshCurrentBox();
          }
          this.inputManager.push(this.gridSelect);
          break;
        }
        case 'pc:grab':
          this.startGrab(pokemon);
          break;
        case 'pc:rename':
          this.renamePokemon(pokemon);
          break;
        case 'pc:sendToProfessor':
          this.sellPokemon(pokemon).then(() => {
            this.inputManager.push(this.gridSelect);
          });
          break;
        case 'pc:strengthen':
          this.enhancePokemon(pokemon).then(() => {
            this.inputManager.push(this.gridSelect);
          });
          break;
        case 'pc:evolve':
          this.evolvePokemon(pokemon).then(() => {
            this.inputManager.push(this.gridSelect);
          });
          break;
        case 'pc:heldItem':
          this.takeHeldItem(pokemon).then(() => {
            this.inputManager.push(this.gridSelect);
          });
          break;
        default:
          this.inputManager.push(this.gridSelect);
          break;
      }
    });
  }

  private async takeHeldItem(pokemon: PokemonBoxItem): Promise<void> {
    const heldItemId = pokemon.heldItemId;
    if (!heldItemId) return;

    const questionUi = this.scene.getMessage('question');
    const itemName = i18next.t(`item:${heldItemId}.name`);

    await questionUi.showMessage(i18next.t('pc:confirmTakeHeldItem', { item: itemName }), {
      resolveWhen: 'displayed',
    });

    const YES_NO_ITEMS = [
      { key: 'yes', label: i18next.t('menu:yes') },
      { key: 'no', label: i18next.t('menu:no') },
    ];

    const choice = await this.confirmMenu.waitForSelect(YES_NO_ITEMS);
    this.confirmMenu.hide();
    questionUi.hide();

    if (choice?.key !== 'yes') return;

    const api = this.scene.getApi();
    const result = await api.takeHeldItem(pokemon.id);
    if (!result) return;

    this.pcState.setHeldItemId(result.pokemonId, null);

    const user = this.scene.getUser();
    if (user) {
      const bag = user.getItemBag();
      const existing = bag?.get(result.returnedItem);
      user.updateItemQuantity(result.returnedItem, (existing?.quantity ?? 0) + 1);

      const cachedBox = user.getPokemonBox();
      if (cachedBox) {
        const idx = cachedBox.findIndex((p) => p.id === result.pokemonId);
        if (idx >= 0) cachedBox[idx] = { ...cachedBox[idx], heldItemId: null };
      }
      const party = user.getParty();
      if (party) {
        const idx = party.findIndex((p) => p.id === result.pokemonId);
        if (idx >= 0) party[idx] = { ...party[idx], heldItemId: null };
      }
    }

    this.refreshCurrentBox();
    this.updateInfo(String(result.pokemonId));

    const talkUi = this.scene.getMessage('talk');
    await talkUi.showMessage(i18next.t('pc:obtainedHeldItem', { item: itemName }));
  }

  private openPartyMenu(): void {
    const partyPokemons = this.pcState.getPartyPokemons();
    const pokemon = partyPokemons[this.partyCursorIndex];
    if (!pokemon) return;

    if (this.mode === 'selectForGive') {
      this.scene.getAudio().playEffect(SFX.CURSOR_0);
      this.onPokemonSelected?.(pokemon);
      return;
    }

    if (this.mode === 'selectForTeachMove') {
      if (!this.isEligibleForTeachMove(pokemon)) return;
      this.scene.getAudio().playEffect(SFX.CURSOR_0);
      this.onPokemonSelected?.(pokemon);
      return;
    }

    const items: IMenuItem[] = [
      { key: 'pc:removeFromParty', label: i18next.t('pc:removeFromParty') },
      { key: 'pc:grab', label: i18next.t('pc:grab') },
      { key: 'pc:cancel', label: i18next.t('pc:cancel') },
    ];

    this.inputManager.pop(this);

    this.partyMenu.waitForSelect(items).then((selected) => {
      this.partyMenu.hide();

      if (!selected || selected.key === 'pc:cancel') {
        this.inputManager.push(this);
        return;
      }

      switch (selected.key) {
        case 'pc:removeFromParty': {
          const boxNumber = this.currentBoxIndex + 1;
          const freeGrid = this.pcState.getNextFreeGridSlot(boxNumber);
          if (freeGrid !== null) {
            this.pcState.moveToBox(pokemon.id, boxNumber, freeGrid);
            this.refreshCurrentBox();
            const partyCount = this.pcState.getPartyCount();
            if (this.partyCursorIndex >= partyCount && partyCount > 0) {
              this.partyCursorIndex = partyCount - 1;
            }
            this.updatePartyCursorPosition();
          }
          this.inputManager.push(this);
          break;
        }
        case 'pc:grab':
          this.startGrab(pokemon);
          break;
        default:
          this.inputManager.push(this);
          break;
      }
    });
  }

  private static readonly PC_BGS_FRAME_COUNT = 33;

  private openTopMenu(): void {
    const items: IMenuItem[] = [
      { key: 'pc:changeWallpaper', label: i18next.t('pc:changeWallpaper') },
      { key: 'pc:rename', label: i18next.t('pc:rename') },
      { key: 'pc:cancel', label: i18next.t('pc:cancel') },
    ];

    this.inputManager.pop(this);

    this.topMenu.waitForSelect(items).then((selected) => {
      this.topMenu.hide();

      if (!selected || selected.key === 'pc:cancel') {
        this.inputManager.push(this);
        return;
      }

      switch (selected.key) {
        case 'pc:changeWallpaper':
          this.openWallpaperMenu();
          break;
        case 'pc:rename':
          this.renameBox();
          break;
        default:
          this.inputManager.push(this);
          break;
      }
    });
  }

  private openWallpaperMenu(): void {
    const items: IMenuItem[] = [];
    for (let i = 0; i < PokemonPcUi.PC_BGS_FRAME_COUNT; i++) {
      items.push({
        key: `wallpaper_${i}`,
        label: `${i18next.t('pc:wallpaper')} ${i + 1}`,
      });
    }

    this.wallpaperMenu.waitForSelect(items).then((selected) => {
      this.wallpaperMenu.hide();

      if (!selected) {
        this.inputManager.push(this);
        return;
      }

      const index = Number(selected.key.split('_')[1]);
      const boxNumber = this.currentBoxIndex + 1;
      this.pcState.setBoxWallpaper(boxNumber, index);
      this.pcBg.setFrame(`pc_bgs-${index}`);
      this.inputManager.push(this);
    });
  }

  private renameBox(): void {
    const boxNumber = this.currentBoxIndex + 1;
    const meta = this.pcState.getBoxMeta(boxNumber);
    const defaultName = meta.name || `${i18next.t('pc:box')} ${boxNumber}`;

    this.nameInput.open(i18next.t('pc:enterBoxName'), defaultName).then((result) => {
      if (result.confirmed) {
        const newName = result.value || '';
        this.pcState.setBoxName(boxNumber, newName);
        const displayName = newName || `${i18next.t('pc:box')} ${boxNumber}`;
        this.topName.setText(displayName);
      }
      this.inputManager.push(this);
    });
  }

  private renamePokemon(pokemon: PokemonBoxItem): void {
    const defaultName = pokemon.nickname ?? getPokemonI18Name(pokemon.pokedexId);

    this.nameInput.open(i18next.t('pc:enterPokemonName'), defaultName).then((result) => {
      if (result.confirmed) {
        const i18Name = getPokemonI18Name(pokemon.pokedexId);
        const newNickname = result.value === i18Name || result.value === '' ? null : result.value;
        this.pcState.setNickname(pokemon.id, newNickname);
        this.refreshCurrentBox();
        this.updateInfo(String(pokemon.id));
      }
      this.inputManager.push(this.gridSelect);
    });
  }

  private startGrab(pokemon: PokemonBoxItem): void {
    const slotState = this.pcState.getSlotState(pokemon.id);
    if (!slotState) return;

    this.grabbedPokemonId = pokemon.id;
    this.grabOrigin = {
      boxNumber: slotState.boxNumber,
      gridNumber: slotState.gridNumber,
      partySlot: slotState.partySlot,
    };
    this.grabCursorInParty = slotState.partySlot !== null;
    this.grabInTop = false;
    this.grabGridIndex = slotState.gridNumber ?? 0;
    this.grabPartyIndex = slotState.partySlot ?? 0;

    // pcState에서 포켓몬을 떼어냄 (원래 자리 비움)
    this.pcState.detachPokemon(pokemon.id);
    this.refreshCurrentBox();

    // 잡은 포켓몬 아이콘 설정
    const pokedexKey = pokemon.pokedexId;
    const tex = getPokemonTexture('icon', pokedexKey, { isShiny: pokemon.isShiny });
    this.grabIcon
      .setTexture(tex.key, tex.frame + '_0')
      .setScale(3)
      .setVisible(true);
    this.grabCursor.setVisible(true);

    this.playGrabFingerAnim(this.grabCursor);

    this.focusArea = 'grab';
    this.gridSelect.setCursorVisible(false);
    this.topCursor.setVisible(false);
    this.partyCursor.setVisible(false);
    this.updateGrabCursorPosition();

    const cellY = this.getGrabDropY();
    this.grabIcon.setY(cellY);
    this.scene.tweens.add({
      targets: this.grabIcon,
      y: cellY - PokemonPcUi.GRAB_ICON_LIFT,
      duration: 200,
      ease: EASE.LINEAR,
    });

    this.updateInfo(String(pokemon.id));
    this.inputManager.push(this);
  }

  private placeGrabbedPokemon(): void {
    if (!this.grabbedPokemonId || !this.grabOrigin) return;

    const boxNumber = this.currentBoxIndex + 1;

    if (this.grabCursorInParty) {
      const targetPokemon = this.pcState.getPokemonAtPartySlot(this.grabPartyIndex);
      if (targetPokemon) {
        this.pcState.attachPokemon(
          targetPokemon.id,
          this.grabOrigin.boxNumber,
          this.grabOrigin.gridNumber,
          this.grabOrigin.partySlot,
        );
        this.pcState.moveToParty(this.grabbedPokemonId, this.grabPartyIndex);
      } else {
        this.pcState.moveToParty(this.grabbedPokemonId, this.grabPartyIndex);
      }
    } else {
      const targetPokemon = this.pcState.getPokemonAt(boxNumber, this.grabGridIndex);
      if (targetPokemon) {
        this.pcState.attachPokemon(
          targetPokemon.id,
          this.grabOrigin.boxNumber,
          this.grabOrigin.gridNumber,
          this.grabOrigin.partySlot,
        );
        this.pcState.movePokemon(this.grabbedPokemonId, boxNumber, this.grabGridIndex);
      } else {
        this.pcState.movePokemon(this.grabbedPokemonId, boxNumber, this.grabGridIndex);
        // 파티 → 빈 그리드 셀 이동 시, 비게 된 파티 슬롯 이후를 앞으로 당김
        if (this.grabOrigin.partySlot !== null) {
          this.pcState.compactPartyAfter(this.grabOrigin.partySlot);
        }
      }
    }

    if (!this.grabCursorInParty) {
      this.endGrab(this.grabGridIndex);
    } else {
      this.endGrab(null, this.grabPartyIndex);
    }
  }

  private cancelGrab(): void {
    if (this.grabbedPokemonId && this.grabOrigin) {
      this.pcState.attachPokemon(
        this.grabbedPokemonId,
        this.grabOrigin.boxNumber,
        this.grabOrigin.gridNumber,
        this.grabOrigin.partySlot,
      );
    }
    if (this.grabOrigin?.partySlot !== null && this.grabOrigin?.partySlot !== undefined) {
      this.endGrab(null, this.grabOrigin.partySlot);
    } else {
      this.endGrab(this.grabOrigin?.gridNumber);
    }
  }

  private endGrab(toGridIndex?: number | null, toPartyIndex?: number | null): void {
    this.grabbedPokemonId = null;
    this.grabOrigin = null;
    this.grabInTop = false;

    this.inputManager.pop(this);

    let animDone = false;
    let tweenDone = false;

    const onAllDone = () => {
      if (!animDone || !tweenDone) return;

      this.grabCursor.setVisible(false);
      this.grabIcon.setVisible(false);
      this.refreshCurrentBox();

      if (toPartyIndex !== undefined && toPartyIndex !== null) {
        this.partyCursorIndex = toPartyIndex;
        this.focusArea = 'party';
        this.partyCursor.setVisible(true);
        this.gridSelect.setCursorVisible(false);
        this.updatePartyCursorPosition();
        this.updatePartySlotInfo();
        this.inputManager.push(this);
      } else {
        this.focusArea = 'grid';
        if (toGridIndex !== undefined && toGridIndex !== null) {
          this.gridSelect.setCursorToIndex(toGridIndex);
        }
        this.gridSelect.setCursorVisible(true);
        this.updateInfo(this.gridSelect.getSelectedKey());
        this.inputManager.push(this.gridSelect);
      }
    };

    this.playReleaseFingerAnim(this.grabCursor, () => {
      animDone = true;
      onAllDone();
    });

    const dropY = this.getGrabDropY();
    this.scene.tweens.add({
      targets: this.grabIcon,
      y: dropY,
      duration: 200,
      ease: EASE.LINEAR,
      onComplete: () => {
        tweenDone = true;
        onAllDone();
      },
    });
  }

  private async sellPokemon(pokemon: PokemonBoxItem): Promise<void> {
    const questionUi = this.scene.getMessage('question');
    const pokemonName = pokemon.nickname ?? getPokemonI18Name(pokemon.pokedexId);

    await questionUi.showMessage(i18next.t('pc:confirmSendToProfessor', { name: pokemonName }), {
      resolveWhen: 'displayed',
    });

    const YES_NO_ITEMS = [
      { key: 'yes', label: i18next.t('menu:yes') },
      { key: 'no', label: i18next.t('menu:no') },
    ];

    const choice = await this.confirmMenu.waitForSelect(YES_NO_ITEMS);
    this.confirmMenu.hide();
    questionUi.hide();

    if (choice?.key !== 'yes') return;

    const api = this.scene.getApi();
    const result = await api.sellPokemon(pokemon.id);
    if (!result) return;

    this.pcState.removePokemon(pokemon.id);

    const user = this.scene.getUser();
    if (user) {
      const cachedBox = user.getPokemonBox();
      if (cachedBox) {
        user.setPokemonBox(cachedBox.filter((p) => p.id !== pokemon.id));
      }

      const bag = user.getItemBag();
      const existing = bag?.get(result.candyId);
      user.updateItemQuantity(result.candyId, (existing?.quantity ?? 0) + result.quantity);
    }

    this.refreshCurrentBox();
    this.clearInfo();

    const talkUi = this.scene.getMessage('talk');
    const itemName = i18next.t(`item:${result.candyId}.name`);
    await talkUi.showMessage(
      i18next.t('pc:obtainedCandy', { item: itemName, quantity: result.quantity }),
    );
  }

  private static readonly POKEMON_MAX_LEVEL = 999;

  private async enhancePokemon(pokemon: PokemonBoxItem): Promise<void> {
    const masterPokemon = this.scene.getMasterData().getPokemonData(pokemon.pokedexId);
    if (!masterPokemon) return;

    const candyId = `${masterPokemon.type1}-candy`;
    const user = this.scene.getUser();
    const bag = user?.getItemBag();
    const candyMax = bag?.get(candyId)?.quantity ?? 0;
    if (candyMax <= 0) return;
    if (pokemon.level >= PokemonPcUi.POKEMON_MAX_LEVEL) return;

    const questionUi = this.scene.getMessage('question');

    let chosenAmount = 0;
    while (true) {
      const currentCandy = user?.getItemBag()?.get(candyId)?.quantity ?? 0;
      const result = await this.enhancePanel.open({
        candyId,
        candyMax: currentCandy,
        currentLevel: pokemon.level,
        maxLevel: PokemonPcUi.POKEMON_MAX_LEVEL,
      });

      if (!result.confirmed) {
        return;
      }

      // 확인 다이얼로그
      await questionUi.showMessage(i18next.t('pc:confirmEnhance'), { resolveWhen: 'displayed' });
      const YES_NO_ITEMS = [
        { key: 'yes', label: i18next.t('menu:yes') },
        { key: 'no', label: i18next.t('menu:no') },
      ];
      const choice = await this.confirmMenu.waitForSelect(YES_NO_ITEMS);
      this.confirmMenu.hide();
      questionUi.hide();

      if (choice?.key === 'yes') {
        chosenAmount = result.amount;
        break;
      }
      // 아니오면 다시 수량 입력 루프
    }

    // 애니메이션 종료 전까지 grid select 포함 어떤 입력도 받지 못하도록 잠금
    this.inputLocked = true;
    this.inputManager.push(this);

    const api = this.scene.getApi();
    const resp = await api.enhancePokemon(pokemon.id, chosenAmount);
    if (!resp) {
      this.inputManager.pop(this);
      this.inputLocked = false;
      return;
    }

    // 로컬 상태 동기화
    const oldLevel = pokemon.level;
    this.pcState.setLevel(resp.id, resp.level);
    user?.updateItemQuantity(candyId, resp.candyRemaining);

    const cachedBox = user?.getPokemonBox();
    if (cachedBox) {
      const idx = cachedBox.findIndex((p) => p.id === resp.id);
      if (idx >= 0) cachedBox[idx] = { ...cachedBox[idx], level: resp.level };
    }
    const party = user?.getParty();
    if (party) {
      const idx = party.findIndex((p) => p.id === resp.id);
      if (idx >= 0) party[idx] = { ...party[idx], level: resp.level };
    }

    // 레벨업 이펙트 + 카운터 틱업 애니메이션
    await this.playEnhanceAnimation(oldLevel, resp.level);

    this.refreshCurrentBox();
    this.updateInfo(String(resp.id));

    this.inputManager.pop(this);
    this.inputLocked = false;
  }

  private async evolvePokemon(pokemon: PokemonBoxItem): Promise<void> {
    const masterPokemon = this.scene.getMasterData().getPokemonData(pokemon.pokedexId);
    if (!masterPokemon || masterPokemon.nextEvol.next.length === 0) return;

    // 진화 옵션 구성
    const options = masterPokemon.nextEvol.next.map((nextId, i) => ({
      cost: masterPokemon.nextEvol.cost[i],
      nextPokedexId: nextId,
      type1: masterPokemon.type1,
    }));

    // 진화 선택 UI 열기
    const selectedIndex = await this.evolveSelect.open(options, {
      pokemonFriendship: pokemon.friendship ?? 0,
      currentTimeOfDay: DayNightFilter.getCurrentTimeLabel(),
    });
    if (selectedIndex === null) return;

    const selectedOption = options[selectedIndex];
    const nextName = i18next.t(`pokemon:${selectedOption.nextPokedexId}.name`);

    // 확인 메시지
    const questionUi = this.scene.getMessage('question');
    await questionUi.showMessage(i18next.t('pc:confirmEvolve', { name: nextName }), {
      resolveWhen: 'displayed',
    });
    const YES_NO_ITEMS = [
      { key: 'yes', label: i18next.t('menu:yes') },
      { key: 'no', label: i18next.t('menu:no') },
    ];
    const choice = await this.confirmMenu.waitForSelect(YES_NO_ITEMS);
    this.confirmMenu.hide();
    questionUi.hide();

    if (choice?.key !== 'yes') return;

    // 입력 잠금
    this.inputLocked = true;
    this.inputManager.push(this);

    const api = this.scene.getApi();
    let resp: { id: number; pokedexId: string } | null = null;
    try {
      resp = await api.evolvePokemon(pokemon.id, selectedOption.cost);
    } catch (err: any) {
      const talkUi = this.scene.getMessage('talk');
      await talkUi.showMessage(err?.message ?? i18next.t('error:INTERNAL_SERVER_ERROR'));
      this.inputManager.pop(this);
      this.inputLocked = false;
      return;
    }
    if (!resp) {
      this.inputManager.pop(this);
      this.inputLocked = false;
      return;
    }

    // 진화 애니메이션 재생
    await this.evolveUi.play(pokemon.pokedexId, resp.pokedexId);

    // 로컬 상태 동기화
    this.pcState.setPokedexId(resp.id, resp.pokedexId);

    const user = this.scene.getUser();

    // 진화 비용(아이템) 로컬 차감
    const costParts = parseCostParts(selectedOption.cost, selectedOption.type1);
    for (const p of costParts) {
      if (p.itemId === null) continue;
      user?.decreaseItemQuantity(p.itemId, p.count ?? 1);
    }

    const cachedBox = user?.getPokemonBox();
    if (cachedBox) {
      const idx = cachedBox.findIndex((p) => p.id === resp.id);
      if (idx >= 0) cachedBox[idx] = { ...cachedBox[idx], pokedexId: resp.pokedexId };
    }
    const party = user?.getParty();
    if (party) {
      const idx = party.findIndex((p) => p.id === resp.id);
      if (idx >= 0) party[idx] = { ...party[idx], pokedexId: resp.pokedexId };
    }

    this.refreshCurrentBox();
    this.updateInfo(String(resp.id));

    this.inputManager.pop(this);
    this.inputLocked = false;
  }

  private playEnhanceAnimation(fromLevel: number, toLevel: number): Promise<void> {
    return new Promise((resolve) => {
      const delta = toLevel - fromLevel;
      if (delta <= 0) {
        resolve();
        return;
      }

      // 레벨 숫자 tick-up
      const totalDuration = Math.min(1200, 120 + delta * 20);
      const ticks = Math.min(delta, 30);
      const stepDuration = totalDuration / ticks;
      let current = fromLevel;
      let count = 0;

      let tickDone = false;
      let tweenDone = false;
      let settled = false;
      const tryResolve = () => {
        if (settled) return;
        if (!tickDone || !tweenDone) return;
        settled = true;
        this.infoLevel.clearTint();
        resolve();
      };

      const timer = this.scene.time.addEvent({
        delay: stepDuration,
        repeat: ticks - 1,
        callback: () => {
          count++;
          current = Math.round(fromLevel + (delta * count) / ticks);
          this.infoLevel.setText(`(+${current})`);
          this.scene.getAudio().playEffect(SFX.CURSOR_0);
          if (count >= ticks) {
            this.infoLevel.setText(`(+${toLevel})`);
            tickDone = true;
            timer.remove();
            tryResolve();
          }
        },
      });

      // 텍스트 틴트 플래시
      this.infoLevel.setTint(0xfff28a);

      // 스프라이트 바운스 이펙트
      this.scene.tweens.add({
        targets: this.infoFront,
        scale: this.infoFront.scale * 1.15,
        duration: totalDuration / 2,
        yoyo: true,
        ease: EASE.LINEAR,
        onComplete: () => {
          tweenDone = true;
          tryResolve();
        },
      });
    });
  }

  private switchBox(delta: number): void {
    if (this.totalBoxCount <= 1) return;
    const next = (this.currentBoxIndex + delta + this.totalBoxCount) % this.totalBoxCount;
    if (next === this.currentBoxIndex) return;
    this.currentBoxIndex = next;
    this.scene.getAudio().playEffect(SFX.CURSOR_0);
    this.refreshCurrentBox();
  }

  setTotalBoxCount(count: number): void {
    this.totalBoxCount = Math.max(1, count);
  }

  getCurrentBoxIndex(): number {
    return this.currentBoxIndex;
  }

  errorEffect(errorMsg: string): void {}

  waitForInput(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  createLayout(): void {
    this.bg = addBackground(this.scene, TEXTURE.BG_PC);

    this.createPcLayout();
    this.createInfoLayout();
    this.createTopLayout();
    this.createPartySlotLayout();
    this.createGrabLayout();
  }

  getGridSelect(): PokemonPcGridSelectUi {
    return this.gridSelect;
  }

  private createPcLayout() {
    // this.pcBg = addSprite(this.scene, `pc_bgs`, undefined, +290, -60).setScale(2.9);
    this.pcBg = addSprite(this.scene, TEXTURE.PC_BGS, undefined, +338, -65).setScale(5.8);
    this.pcBgFrame = addWindow(
      this.scene,
      TEXTURE.WINDOW_PC,
      +338,
      -65,
      this.pcBg.displayWidth + 70,
      this.pcBg.displayHeight + 70,
      1.6,
      16,
      16,
      16,
      16,
    );
    this.partyBaseY = this.pcBgFrame.y + this.pcBgFrame.displayHeight / 2 + 60;
    this.partyWindow = addWindow(
      this.scene,
      TEXTURE.WINDOW_PC,
      +340,
      this.partyBaseY,
      700,
      140,
      1.6,
      16,
      16,
      16,
      16,
    );

    this.info = addImage(this.scene, TEXTURE.PC_INFO, undefined, -445, 0).setScale(3.17);
    this.guideFrame = addWindow(
      this.scene,
      TEXTURE.WINDOW_PC,
      -650,
      -484,
      720,
      113,
      1.6,
      16,
      16,
      16,
      16,
    );
  }

  private createInfoLayout() {
    this.infoPokedexSymbol = addText(
      this.scene,
      -940,
      -500,
      ``,
      90,
      100,
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.infoPokedex = addText(
      this.scene,
      -830,
      -500,
      `0000`,
      90,
      100,
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.infoFront = addImage(
      this.scene,
      getPokemonTexture('sprite', '0006', { isShiny: true, isFemale: false }).key,
      undefined,
      -640,
      -20,
    ).setScale(2.6);

    this.infoShinyIcon = addImage(this.scene, TEXTURE.ICON_SHINY, undefined, -395, -225).setScale(
      3.4,
    );

    this.infoPokemonName = addText(
      this.scene,
      -870,
      -398,
      ``,
      75,
      100,
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );

    this.infoCapturePokeball = addImage(
      this.scene,
      `pc_safari-ball`,
      undefined,
      -915,
      -400,
    ).setScale(2.15);

    this.infoGender = addText(
      this.scene,
      -390,
      -400,
      SYMBOL_MALE,
      120,
      100,
      'center',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );

    this.infoTier = addText(
      this.scene,
      -375,
      -315,
      '',
      70,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    ).setOrigin(1, 0);

    this.infoLevel = addText(
      this.scene,
      -860,
      -398,
      ``,
      70,
      100,
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );

    this.infoCandySymbol = addImage(this.scene, 'fire-candy', undefined, -920, -280).setScale(2.8);
    this.infoCandy = addText(
      this.scene,
      -885,
      -285,
      `x100`,
      70,
      100,
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );

    this.infoFriendshipSymbol = addImage(this.scene, 'soothe-bell', undefined, -920, -215).setScale(
      2.8,
    );
    this.infoFriendship = addText(
      this.scene,
      -885,
      -210,
      ` 100`,
      70,
      100,
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );

    this.infoCaptureDate = addText(
      this.scene,
      -940,
      +307,
      ``,
      50,
      100,
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    this.infoCaptureLocation = addText(
      this.scene,
      -630,
      +307,
      ``,
      50,
      100,
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    this.heldItemSymbol = addText(
      this.scene,
      -940,
      +505,
      ``,
      60,
      100,
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.heldItem = addText(
      this.scene,
      -750,
      +505,
      ``,
      60,
      100,
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );

    this.infoAbilitySymbol = addText(
      this.scene,
      -940,
      +385,
      ``,
      60,
      100,
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.infoAbility = addText(
      this.scene,
      -750,
      +385,
      ``,
      60,
      100,
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.infoNatureSymbol = addText(
      this.scene,
      -940,
      +445,
      ``,
      60,
      100,
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.infoNature = addText(
      this.scene,
      -750,
      +445,
      ``,
      60,
      100,
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );

    // this.infoType1 = addImage(this.scene, TEXTURE.TYPES, undefined, -890, +240).setScale(2);
    // this.infoType2 = addImage(this.scene, TEXTURE.TYPES, undefined, -755, +240).setScale(2);

    this.infoType1 = new PokemonTypeContainer(this.scene, -890, +245);
    this.infoType2 = new PokemonTypeContainer(this.scene, -755, +245);

    this.infoSkills.push(new PokemonSkillContainer(this.scene, -470, +245));
    this.infoSkills.push(new PokemonSkillContainer(this.scene, -470, +200));
    this.infoSkills.push(new PokemonSkillContainer(this.scene, -470, +155));
    this.infoSkills.push(new PokemonSkillContainer(this.scene, -470, +110));

    this.setSymbol();
  }

  setSymbol() {
    this.infoPokedexSymbol.setText(`No.`);
    this.infoNatureSymbol.setText(i18next.t(`menu:natureSymbol`));
    this.infoAbilitySymbol.setText(i18next.t(`menu:abilitySymbol`));
    this.heldItemSymbol.setText(i18next.t(`menu:heldItemSymbol`));

    const maxWidth = Math.max(
      this.infoNatureSymbol.displayWidth,
      this.infoAbilitySymbol.displayWidth,
      this.heldItemSymbol.displayWidth,
    );
    const valueX = this.infoNatureSymbol.x + maxWidth + 30;
    this.infoAbility.setX(valueX);
    this.infoNature.setX(valueX);
    this.heldItem.setX(valueX);
  }

  setBoxPokemons(pokemons: PokemonBoxItem[]): void {
    this.boxPokemons = pokemons;
    this.gridSelect.setPokemonItems(pokemons);
    if (pokemons.length > 0) {
      this.updateInfo(String(pokemons[0].id));
    }
  }

  private pokedexIdToKey(pokedexId: string): string {
    return getPokedexId(pokedexId);
  }

  private clearInfo(): void {
    this.infoPokedex.setText('');
    this.infoPokedexSymbol.setText('');
    this.infoPokemonName.setText('');
    this.infoLevel.setText('');
    this.infoFront.setVisible(false);
    this.infoGender.setText('');
    this.infoTier.setText('');
    this.infoShinyIcon.setVisible(false);
    this.infoCaptureDate.setText('');
    this.infoCaptureLocation.setText('');
    this.infoCapturePokeball.setVisible(false);
    this.infoAbility.setText('');
    this.infoNature.setText('');
    this.infoAbilitySymbol.setText('');
    this.infoNatureSymbol.setText('');
    this.infoType1.setVisible(false);
    this.infoType2.setVisible(false);
    for (const skill of this.infoSkills) skill.clear();
    this.heldItemSymbol.setVisible(false);
    this.heldItem.setVisible(false);
    this.infoCandySymbol.setVisible(false);
    this.infoCandy.setVisible(false);
    this.infoFriendshipSymbol.setVisible(false);
    this.infoFriendship.setVisible(false);
  }

  private restoreInfoSymbols(): void {
    this.infoFront.setVisible(true);
    this.infoCapturePokeball.setVisible(true);
    this.heldItemSymbol.setVisible(true);
    this.heldItem.setVisible(true);
    this.infoFriendshipSymbol.setVisible(true);
    this.infoFriendship.setVisible(true);
    this.setSymbol();
  }

  updateInfo(selectedKey: string): void {
    if (selectedKey.startsWith('__empty_')) {
      this.clearInfo();
      return;
    }

    this.restoreInfoSymbols();

    const pokemon =
      this.boxPokemons.find((p) => String(p.id) === selectedKey) ??
      this.pcState.getPokemonById(Number(selectedKey));
    if (!pokemon) return;

    const pokedexKey = pokemon.pokedexId;

    this.infoPokedex.setText(getPokedexId(pokemon.pokedexId));

    const name = pokemon.nickname ?? getPokemonI18Name(pokedexKey);
    this.infoPokemonName.setText(name);
    this.infoLevel.setText(`(+${pokemon.level})`);
    this.infoFriendship.setText(`${pokemon.friendship ?? 0}`);

    const spriteTexture = getPokemonTexture(
      'sprite',
      pokedexKey,
      { isShiny: pokemon.isShiny, isFemale: pokemon.gender === 2 },
      this.scene,
    );
    this.infoFront.setTexture(spriteTexture.key, spriteTexture.frame);
    updatePokemonGenderIcon(pokemon.gender, this.infoGender);
    this.infoShinyIcon.setVisible(pokemon.isShiny);
    this.infoCaptureDate.setText(pokemon.caughtAt?.split('T')[0] ?? '');
    this.infoCaptureLocation.setX(this.infoCaptureDate.x + this.infoCaptureDate.displayWidth + 20);
    this.infoCaptureLocation.setText(i18next.t(`menu:${pokemon.caughtLocation}`));
    this.infoAbility.setText(i18next.t(`ability:${pokemon.abilityId}`));
    this.infoNature.setText(i18next.t(`nature:${pokemon.natureId}`));
    this.heldItem.setText(pokemon.heldItemId ? i18next.t(`item:${pokemon.heldItemId}.name`) : '-');

    const pokemonData = this.scene.getMasterData().getPokemonData(pokedexKey);
    if (pokemonData) {
      // this.infoType1.setFrame(getPokemonTypeFrame(pokemonData.type1)).setVisible(true);
      this.infoType1.setType(pokemonData.type1);
      if (pokemonData.type2) {
        // this.infoType2.setFrame(getPokemonTypeFrame(pokemonData.type2)).setVisible(true);
        this.infoType2.setType(pokemonData.type2);
      } else {
        this.infoType2.setVisible(false);
      }
    } else {
      this.infoType1.setVisible(false);
      this.infoType2.setVisible(false);
    }

    if (pokemonData) {
      const rank = pokemonData.rank;
      this.infoTier.setText(i18next.t(RANK_LOCALE[rank])).setStyle({ color: RANK_COLOR[rank] });
    } else {
      this.infoTier.setText('');
    }

    this.infoLevel.setX(this.infoPokemonName.x + this.infoPokemonName.displayWidth + 10);

    const skills = (pokemon.skills as PokemonHiddenMove[] | null | undefined) ?? [];
    for (let i = 0; i < this.infoSkills.length; i++) {
      if (i < skills.length) {
        this.infoSkills[i].setType(skills[i]);
      } else {
        this.infoSkills[i].clear();
      }
    }

    if (pokemonData) {
      const candyKey = `${pokemonData.type1}-candy`;
      this.infoCandySymbol.setTexture(candyKey).setVisible(true);
      const user = this.scene.getUser();
      const bag = user?.getItemBag();
      const entry = bag?.get(candyKey);
      const quantity = entry?.quantity ?? 0;
      this.infoCandy.setText(`x${quantity}`).setVisible(true);
    } else {
      this.infoCandySymbol.setVisible(false);
      this.infoCandy.setVisible(false);
    }
  }

  private createTopLayout() {
    this.topName = addText(
      this.scene,
      +335,
      -425,
      `${i18next.t('pc:box')} 1`,
      70,
      100,
      'center',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.topCursor = addSprite(this.scene, TEXTURE.PC_FINGER_0, 'pc_finger_0-0', +335, -465)
      .setScale(3.8)
      .setVisible(false);
    this.playFingerAnim(this.topCursor);
  }

  private createPartySlotLayout() {
    const baseX = +75;
    const baseY = this.partyBaseY;
    const slotGap = 110;

    for (let i = 0; i < 6; i++) {
      const x = baseX + i * slotGap;
      const icon = addImage(this.scene, TEXTURE.BLANK, undefined, x, baseY)
        .setScale(2.4)
        .setVisible(false);
      const lvText = addText(
        this.scene,
        x,
        baseY + 35,
        '',
        40,
        100,
        'center',
        TEXTSTYLE.YELLOW,
        TEXTSHADOW.GRAY,
      ).setVisible(false);
      this.partySlotIcons.push(icon);
      this.partySlotLevels.push(lvText);
    }

    this.partyCursor = addSprite(this.scene, TEXTURE.PC_FINGER_0, 'pc_finger_0-0', 0, baseY - 50)
      .setScale(3.8)
      .setVisible(false);
    this.playFingerAnim(this.partyCursor);
  }

  private updatePartyCursorPosition(): void {
    const baseX = +75;
    const baseY = this.partyBaseY;
    const slotGap = 110;
    this.partyCursor.setX(baseX + this.partyCursorIndex * slotGap);
    this.partyCursor.setY(baseY - 50);
  }

  private updatePartySlotInfo(): void {
    const pokemon = this.pcState.getPokemonAtPartySlot(this.partyCursorIndex);
    if (pokemon) {
      this.updateInfo(String(pokemon.id));
    } else {
      this.clearInfo();
    }
  }

  private playFingerAnim(sprite: GSprite): void {
    const animKey = 'pc_finger_0_anim';
    if (!this.scene.anims.exists(animKey)) {
      this.scene.anims.create({
        key: animKey,
        frames: this.scene.anims.generateFrameNames(TEXTURE.PC_FINGER_0, {
          prefix: 'pc_finger_0-',
          start: 0,
          end: 1,
        }),
        duration: 500,
        repeat: -1,
      });
    }
    sprite.play(animKey);
  }

  private playGrabFingerAnim(sprite: GSprite): void {
    const animKey = 'pc_finger_1_grab_anim';
    if (!this.scene.anims.exists(animKey)) {
      this.scene.anims.create({
        key: animKey,
        frames: this.scene.anims.generateFrameNames(TEXTURE.PC_FINGER_1, {
          prefix: 'pc_finger_1-',
          start: 0,
          end: 1,
        }),
        duration: 300,
        repeat: 0,
      });
    }
    sprite.play(animKey);
  }

  private playReleaseFingerAnim(sprite: GSprite, onComplete?: () => void): void {
    const reverseAnimKey = 'pc_finger_1_release_anim';
    if (!this.scene.anims.exists(reverseAnimKey)) {
      this.scene.anims.create({
        key: reverseAnimKey,
        frames: this.scene.anims.generateFrameNames(TEXTURE.PC_FINGER_1, {
          prefix: 'pc_finger_1-',
          start: 1,
          end: 0,
        }),
        duration: 300,
        repeat: 0,
      });
    }
    sprite.play(reverseAnimKey);
    sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.playFingerAnim(sprite);
      onComplete?.();
    });
  }

  private createGrabLayout(): void {
    this.grabCursor = addSprite(this.scene, TEXTURE.PC_FINGER_0, 'pc_finger_0-0', 0, 0)
      .setScale(4)
      .setVisible(false);
    this.playFingerAnim(this.grabCursor);
    this.grabIcon = addImage(this.scene, TEXTURE.BLANK, undefined, 0, 0)
      .setScale(3)
      .setVisible(false);
  }

  private getGridCellScenePosition(gridIndex: number): { x: number; y: number } {
    const gridX = 340; // GridSelectUi config.x
    const gridY = 5; // GridSelectUi config.y
    const cols = 6;
    const cellW = 80;
    const cellH = 80;
    const gapW = 70; // GridSelectUi config.columnGap
    const gapH = 60; // GridSelectUi config.rowGap
    const totalContentW = cols * cellW + (cols - 1) * gapW;
    const rows = 5;
    const totalContentH = rows * cellH + (rows - 1) * gapH;

    const startX = -totalContentW / 2 + cellW / 2;
    const startY = -totalContentH / 2 + cellH / 2;
    const row = Math.floor(gridIndex / cols);
    const col = gridIndex % cols;
    const x = gridX + startX + col * (cellW + gapW);
    const y = gridY + startY + row * (cellH + gapH);
    return { x, y };
  }

  private getPartySlotScenePosition(partyIndex: number): { x: number; y: number } {
    const baseX = 90;
    const baseY = this.partyBaseY;
    const slotGap = 100;
    return { x: baseX + partyIndex * slotGap, y: baseY };
  }

  private static readonly GRAB_ICON_LIFT = 20;

  private updateGrabCursorPosition(): void {
    let pos: { x: number; y: number };
    if (this.grabInTop) {
      pos = { x: 285, y: -420 };
    } else if (this.grabCursorInParty) {
      pos = this.getPartySlotScenePosition(this.grabPartyIndex);
    } else {
      pos = this.getGridCellScenePosition(this.grabGridIndex);
    }
    this.grabCursor.setPosition(pos.x, pos.y - 50);
    this.grabIcon.setPosition(pos.x, pos.y - PokemonPcUi.GRAB_ICON_LIFT);
  }

  private getGrabDropY(): number {
    if (this.grabInTop) return -420;
    if (this.grabCursorInParty) return this.getPartySlotScenePosition(this.grabPartyIndex).y;
    return this.getGridCellScenePosition(this.grabGridIndex).y;
  }
}
