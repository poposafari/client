import { BaseUi, EXP_CANDY_IDS, pokemonExpProgress } from '@poposafari/core';
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
  TEXTFONT,
  TEXTSHADOW,
  TEXTSTYLE,
  TEXTURE,
  type GrowthGroup,
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
  screenFadeIn,
  showApiErrorAsTalk,
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
import { pokemonCryNames } from '@poposafari/core/master.data.ts';
import { PokemonTypeContainer } from '@poposafari/containers/pokemon-type.container';
import { PokemonSkillContainer } from '@poposafari/containers/pokemon-skill.container';
import { PokemonSlotContainer } from '@poposafari/containers/pokemon-slot.container';
import { KeyGuideBarContainer } from '@poposafari/containers/key-guide-bar.container';
import { ExpBarContainer } from '@poposafari/containers/exp-bar.container';
import { HudTooltipManager } from '@poposafari/feats/overworld/hud-tooltip.manager';

type PcFocusArea = 'grid' | 'party' | 'top' | 'grab';
export type PcMode = 'manage' | 'selectForGive' | 'selectForTeachMove';

const RANK_COLOR: Record<PokemonRank, string> = {
  common: TEXTCOLOR.COMMON,
  rare: TEXTCOLOR.RARE,
  epic: TEXTCOLOR.EPIC,
  legendary: TEXTCOLOR.LEGENDARY,
};

const RANK_LOCALE: Record<PokemonRank, string> = {
  common: 'etc:tierCommon',
  rare: 'etc:tierRare',
  epic: 'etc:tierEpic',
  legendary: 'etc:tierLegendary',
};

export class PokemonPcUi extends BaseUi {
  scene: GameScene;
  private bg!: GImage;
  private inputGuide!: KeyGuideBarContainer;
  private pcBg!: GSprite;
  private pcBgFrame!: GWindow;
  private partyWindow!: GWindow;
  private partyTitle!: GText;

  private info!: GImage;
  private infoPokedex!: GText;
  private infoFront!: GImage;
  private infoPokemonName!: GText;
  private infoCapturePokeball!: GImage;
  private infoShinyIcon!: GImage;
  private infoCaptureLocation!: GText;
  private infoCaptureDate!: GText;
  private infoCaptureDateSymbol!: GText;
  private infoCaptureLocationSymbol!: GText;
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
  private infoLevelSymbol!: GImage;
  private infoLevel!: GText;
  private infoCandySymbol!: GImage;
  private infoCandy!: GText;
  private infoFriendshipSymbol!: GImage;
  private infoFriendship!: GText;
  private infoSkills: PokemonSkillContainer[] = [];

  private topName!: GText;
  private topCursor!: GSprite;
  private topArrowLeft!: GImage;
  private topArrowRight!: GImage;

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
  private enhanceCandyMenu!: MenuListUi;
  private evolveSelect!: EvolveSelectUi;
  private evolveUi!: EvolveUi;
  private menuOpen = false;
  private inputLocked = false;

  // 하단 정보 페이지: 0=ability/nature/heldItem, 1=capture date/location, 2=exp
  private infoPage: 0 | 1 | 2 = 0;

  // EXP 바: infoLevel 위에 항상 표시 (페이지와 무관)
  private infoExpBar!: ExpBarContainer;

  // page 2 (exp) 전용 하단 표시 요소
  private infoExpTotalSymbol!: GText;
  private infoExpTotalValue!: GText;
  private infoExpCurrentSymbol!: GText;
  private infoExpCurrentValue!: GText;
  private infoExpRemainingSymbol!: GText;
  private infoExpRemainingValue!: GText;

  // bottomInfo 우측 하단에 표시되는 N: 다음 키 가이드
  private bottomInfoGuide!: KeyGuideBarContainer;

  private tooltipManager!: HudTooltipManager;
  private currentInfoPokemon: PokemonBoxItem | null = null;

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
  private partySlots: PokemonSlotContainer[] = [];
  private partyCursor!: GSprite;

  // PC set (bg frame + grid + top name): 하나로 묶어 함께 이동 가능
  private pcSet!: GContainer;
  private static readonly PC_SET_OFFSET_X = -80;
  private static readonly PC_SET_OFFSET_Y = +60;

  // Party set (partyWindow + partySlots + partyCursor): 하나로 묶어 함께 이동 가능
  private partySet!: GContainer;
  private static readonly PARTY_SET_OFFSET_X = +30;
  private static readonly PARTY_SET_OFFSET_Y = 0;

  // grabOverlay: grab cursor/icon을 담는 오버레이 컨테이너. pcSet 위치를 미러링.
  private grabOverlay!: GContainer;

  // bottomInfoSet: ability/nature/heldItem, capture date/location, exp page를 묶은 컨테이너.
  // 통째로 좌표 이동 가능.
  private bottomInfoSet!: GContainer;
  private static readonly BOTTOM_INFO_OFFSET_X = 0;
  private static readonly BOTTOM_INFO_OFFSET_Y = -20;

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
    this.gridSelect.onExitRight = () => {
      const partyCount = this.pcState.getPartyCount();
      if (partyCount === 0) return;
      const gridCols = 6;
      const row = Math.floor(this.gridSelect.getSelectedIndex() / gridCols);
      this.partyCursorIndex = Math.min(row, partyCount - 1);
      this.switchFocus('party');
    };
    this.gridSelect.onCursorMoved = (selectedKey) => this.updateInfo(selectedKey);
    this.gridSelect.onConfirm = () => this.openGridMenu();
    this.gridSelect.onCancel = () => this.onClose?.();
    this.gridSelect.onPageToggle = () => this.cycleInfoPage();

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
      x: +1575,
      y: +695,
      visibleCount: 6,
      itemHeight: 0,
      showCancel: false,
    });
    this.nameInput = new NameInputUi(scene);
    this.enhancePanel = new EnhancePanelUi(scene);
    this.enhanceCandyMenu = new MenuListUi(scene, scene.getInputManager(), {
      x: +1580,
      y: +748,
      visibleCount: 5,
      itemHeight: 0,
      showCancel: false,
    });
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

    this.pcSet = this.scene.add.container(PokemonPcUi.PC_SET_OFFSET_X, PokemonPcUi.PC_SET_OFFSET_Y);
    this.pcSet.add([
      this.pcBgFrame,
      this.pcBg,
      this.gridSelect,
      this.topName,
      this.topCursor,
      this.topArrowLeft,
      this.topArrowRight,
    ]);

    this.partySet = this.scene.add.container(
      PokemonPcUi.PARTY_BASE_X + PokemonPcUi.PARTY_SET_OFFSET_X,
      this.partyBaseY + PokemonPcUi.PARTY_SET_OFFSET_Y,
    );
    this.partySet.add([this.partyWindow, this.partyTitle, ...this.partySlots, this.partyCursor]);

    this.grabOverlay = this.scene.add.container(this.pcSet.x, this.pcSet.y);
    this.grabOverlay.add([this.grabIcon, this.grabCursor]);

    this.bottomInfoSet = this.scene.add.container(
      PokemonPcUi.BOTTOM_INFO_OFFSET_X,
      PokemonPcUi.BOTTOM_INFO_OFFSET_Y,
    );
    this.bottomInfoSet.add([
      // page 0: ability / nature / heldItem
      this.infoAbilitySymbol,
      this.infoAbility,
      this.infoNatureSymbol,
      this.infoNature,
      this.heldItemSymbol,
      this.heldItem,
      // page 1: capture date / location
      this.infoCaptureDateSymbol,
      this.infoCaptureDate,
      this.infoCaptureLocationSymbol,
      this.infoCaptureLocation,
      // page 2: total / current / remaining exp
      this.infoExpTotalSymbol,
      this.infoExpTotalValue,
      this.infoExpCurrentSymbol,
      this.infoExpCurrentValue,
      this.infoExpRemainingSymbol,
      this.infoExpRemainingValue,
      // 우측 하단 N: 다음 가이드
      this.bottomInfoGuide,
    ]);

    this.add([
      this.bg,
      this.pcSet,
      this.partySet,
      this.info,
      this.infoPokedex,
      this.infoFront,
      this.infoPokemonName,
      this.infoCapturePokeball,
      this.infoShinyIcon,
      this.infoGender,
      this.infoTier,
      this.infoPokedexSymbol,
      this.infoLevelSymbol,
      this.infoLevel,
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
      this.infoExpBar,
      this.bottomInfoSet,
      this.grabOverlay,
      this.inputGuide,
    ]);

    this.tooltipManager = new HudTooltipManager(this.scene, this);
    this.tooltipManager.register(this.infoLevelSymbol, 'etc:tooltip_level');
    this.tooltipManager.register(this.infoFriendshipSymbol, 'etc:tooltip_friendship');
    this.tooltipManager.register(this.infoCandySymbol, 'etc:tooltip_candy');
    this.tooltipManager.register(this.infoAbility, () => {
      const p = this.currentInfoPokemon;
      if (!p || !p.abilityId) return '';
      return `${i18next.t(`ability:${p.abilityId}`)}\n`;
    });
    this.tooltipManager.register(this.heldItem, () => {
      const p = this.currentInfoPokemon;
      if (!p || !p.heldItemId) return '';
      const name = i18next.t(`item:${p.heldItemId}.name`);
      const desc = i18next.t(`item:${p.heldItemId}.description`);
      return `${name}\n${desc}`;
    });

    this.once('destroy', () => {
      this.tooltipManager?.destroy();
    });
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
      if (!pokemon || !this.partySlots[i]) continue;
      this.partySlots[i].setIconAlpha(this.isEligibleForTeachMove(pokemon) ? 1 : 0.3);
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
    } else if (this.focusArea === 'party') {
      this.updatePartySlotInfo();
    } else {
      // focusArea === 'grid' — 커서가 가리키는 슬롯 기준으로 갱신
      this.updateInfo(this.gridSelect.getSelectedKey());
    }
  }

  private refreshPartySlots(): void {
    const partyPokemons = this.pcState.getPartyPokemons();
    for (let i = 0; i < 6; i++) {
      this.partySlots[i]?.setPokemon(partyPokemons[i] ?? null);
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

    this.syncTopArrowAlpha();

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
    this.scene.getAudio().playEffect(SFX.PC_ACCESS);
    screenFadeIn(this.scene, { duration: 800 });
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
    this.scene.getAudio().playEffect(SFX.PC_CLOSE);
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

  public lockInput(): void {
    this.inputLocked = true;
  }

  private handlePartyInput(key: string): void {
    switch (key) {
      case KEY.LEFT:
        this.switchFocus('grid');
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        break;
      case KEY.UP:
        if (this.partyCursorIndex > 0) {
          this.partyCursorIndex--;
          this.updatePartyCursorPosition();
          this.updatePartySlotInfo();
          this.scene.getAudio().playEffect(SFX.CURSOR_0);
        }
        break;
      case KEY.DOWN: {
        const maxIdx = this.pcState.getPartyCount() - 1;
        if (this.partyCursorIndex < maxIdx) {
          this.partyCursorIndex++;
          this.updatePartyCursorPosition();
          this.updatePartySlotInfo();
          this.scene.getAudio().playEffect(SFX.CURSOR_0);
        }
        break;
      }
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
      case KEY.N:
        this.cycleInfoPage();
        break;
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
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        break;
      case KEY.LEFT:
        this.switchBox(-1);
        break;
      case KEY.RIGHT:
        this.switchBox(+1);
        break;
      case KEY.Z:
      case KEY.ENTER:
        if (this.mode !== 'manage') break;
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
          if (this.grabPartyIndex > 0) this.grabPartyIndex--;
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
          const maxIdx = this.pcState.getPartyCount() - 1;
          if (this.grabPartyIndex < maxIdx) this.grabPartyIndex++;
        } else {
          if (this.grabGridIndex < 24) {
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
          this.grabCursorInParty = false;
          const row = Math.min(this.grabPartyIndex, 4);
          this.grabGridIndex = row * 6 + 5;
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
        } else {
          if (this.grabGridIndex % 6 < 5) {
            this.grabGridIndex++;
          } else {
            const partyCount = this.pcState.getPartyCount();
            if (partyCount > 0) {
              this.grabCursorInParty = true;
              this.grabPartyIndex = Math.min(Math.floor(this.grabGridIndex / 6), partyCount - 1);
            }
          }
        }
        this.updateGrabCursorPosition();
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        break;
      case KEY.Z:
      case KEY.ENTER:
        if (this.grabInTop) break;
        this.placeGrabbedPokemon();
        break;
      case KEY.X:
      case KEY.ESC:
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
    const bag = this.scene.getUser()?.getItemBag();
    const hasExpCandy = EXP_CANDY_IDS.some((id) => (bag?.get(id)?.quantity ?? 0) > 0);
    const isMaxLevel = pokemon.level >= PokemonPcUi.POKEMON_MAX_LEVEL;
    const hasCandy = hasExpCandy && !isMaxLevel;
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
      { key: 'yes', label: i18next.t('etc:yes') },
      { key: 'no', label: i18next.t('etc:no') },
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

    this.partyMenu.waitForSelect(items).then(async (selected) => {
      this.partyMenu.hide();

      if (!selected || selected.key === 'pc:cancel') {
        this.inputManager.push(this);
        return;
      }

      switch (selected.key) {
        case 'pc:removeFromParty': {
          const activeSurfId = this.scene.getUser()?.getActiveSurfPokemonId() ?? null;
          if (activeSurfId === pokemon.id) {
            const talkUi = this.scene.getMessage('talk');
            await talkUi.showMessage(i18next.t('pc:surfInUse'));
            this.inputManager.push(this);
            break;
          }
          const boxNumber = this.currentBoxIndex + 1;
          const freeGrid = this.pcState.getNextFreeGridSlot(boxNumber);
          if (freeGrid !== null) {
            this.pcState.moveToBox(pokemon.id, boxNumber, freeGrid);
            this.refreshCurrentBox();
            const partyCount = this.pcState.getPartyCount();
            if (partyCount === 0) {
              this.partyCursor.setVisible(false);
              this.focusArea = 'grid';
              this.gridSelect.setCursorVisible(true);
              this.updateInfo(this.gridSelect.getSelectedKey());
              this.inputManager.push(this.gridSelect);
              break;
            }
            if (this.partyCursorIndex >= partyCount) {
              this.partyCursorIndex = partyCount - 1;
            }
            this.updatePartyCursorPosition();
          }
          this.inputManager.push(this);
          break;
        }
        case 'pc:grab': {
          const activeSurfId = this.scene.getUser()?.getActiveSurfPokemonId() ?? null;
          if (activeSurfId === pokemon.id) {
            const talkUi = this.scene.getMessage('talk');
            await talkUi.showMessage(i18next.t('pc:surfInUse'));
            this.inputManager.push(this);
            break;
          }
          this.startGrab(pokemon);
          break;
        }
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
      const nameKey = `pc:wallpaperName_${i}`;
      const label = i18next.exists(nameKey)
        ? i18next.t(nameKey)
        : `${i18next.t('pc:wallpaper')} ${i + 1}`;
      items.push({
        key: `wallpaper_${i}`,
        label,
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

    this.scene.getAudio().playEffect(SFX.PC_PICK_UP);
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

    // 빈 파티 슬롯에 잡기 커서가 머물지 않도록 보정
    if (this.grabCursorInParty) {
      const partyCount = this.pcState.getPartyCount();
      if (partyCount === 0) {
        this.grabCursorInParty = false;
        this.grabGridIndex = this.gridSelect.getSelectedIndex();
      } else if (this.grabPartyIndex > partyCount - 1) {
        this.grabPartyIndex = partyCount - 1;
      }
    }

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

  private async placeGrabbedPokemon(): Promise<void> {
    if (!this.grabbedPokemonId || !this.grabOrigin) return;

    if (this.grabCursorInParty) {
      const targetPokemon = this.pcState.getPokemonAtPartySlot(this.grabPartyIndex);
      const activeSurfId = this.scene.getUser()?.getActiveSurfPokemonId() ?? null;
      if (targetPokemon && activeSurfId === targetPokemon.id) {
        const talkUi = this.scene.getMessage('talk');
        await talkUi.showMessage(i18next.t('pc:surfInUse'));
        return;
      }
    }

    this.scene.getAudio().playEffect(SFX.PC_PUT_DOWN);
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
    this.scene.getAudio().playEffect(SFX.PC_PUT_DOWN);
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
    this.syncTopArrowAlpha();

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
      { key: 'yes', label: i18next.t('etc:yes') },
      { key: 'no', label: i18next.t('etc:no') },
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
      user.adjustPokemonBoxCount(-1);

      const bag = user.getItemBag();
      for (const reward of result.rewards) {
        const existing = bag?.get(reward.itemId);
        user.updateItemQuantity(reward.itemId, (existing?.quantity ?? 0) + reward.quantity);
      }
    }

    this.refreshCurrentBox();
    this.clearInfo();

    const talkUi = this.scene.getMessage('talk');
    const messages = result.rewards.map((reward) => {
      const itemName = i18next.t(`item:${reward.itemId}.name`);
      const key = reward.itemId.startsWith('experience-candy-')
        ? 'pc:obtainedExpCandy'
        : 'pc:obtainedCandy';
      return i18next.t(key, { item: itemName, quantity: reward.quantity });
    });
    await talkUi.showMessage(messages);
  }

  private static readonly POKEMON_MAX_LEVEL = 100;

  private async enhancePokemon(pokemon: PokemonBoxItem): Promise<void> {
    const masterPokemon = this.scene.getMasterData().getPokemonData(pokemon.pokedexId);
    if (!masterPokemon) return;
    if (pokemon.level >= PokemonPcUi.POKEMON_MAX_LEVEL) return;

    const user = this.scene.getUser();
    const group = masterPokemon.growthGroup;
    const questionUi = this.scene.getMessage('question');

    let chosenCandy: { itemId: string; count: number } | null = null;
    candyLoop: while (true) {
      const candyChoice = await this.openEnhanceCandyMenu();
      if (!candyChoice) return;

      const candyMax = user?.getItemBag()?.get(candyChoice)?.quantity ?? 0;
      if (candyMax <= 0) {
        continue;
      }

      const amountResult = await this.enhancePanel.open({
        candyId: candyChoice,
        candyMax,
        currentLevel: pokemon.level,
        currentExp: pokemon.exp ?? 0,
        group,
      });
      if (!amountResult.confirmed) {
        continue;
      }

      // 확인 다이얼로그
      await questionUi.showMessage(i18next.t('pc:confirmEnhance'), { resolveWhen: 'displayed' });
      const YES_NO_ITEMS = [
        { key: 'yes', label: i18next.t('etc:yes') },
        { key: 'no', label: i18next.t('etc:no') },
      ];
      const choice = await this.confirmMenu.waitForSelect(YES_NO_ITEMS);
      this.confirmMenu.hide();
      questionUi.hide();

      if (choice?.key === 'yes') {
        chosenCandy = { itemId: candyChoice, count: amountResult.amount };
        break candyLoop;
      }
      // 아니오 → 사탕 선택으로 복귀
    }

    // 애니메이션 종료 전까지 어떤 입력도 받지 못하도록 잠금
    this.inputLocked = true;
    this.inputManager.push(this);

    const api = this.scene.getApi();
    const resp = await api.enhancePokemon(pokemon.id, [chosenCandy]);
    if (!resp) {
      this.inputManager.pop(this);
      this.inputLocked = false;
      return;
    }

    const prevQty = user?.getItemBag()?.get(chosenCandy.itemId)?.quantity ?? 0;
    user?.updateItemQuantity(chosenCandy.itemId, Math.max(0, prevQty - chosenCandy.count));

    // 로컬 상태 동기화
    const oldLevel = pokemon.level;
    const oldExp = pokemon.exp ?? 0;
    this.pcState.setLevel(resp.id, resp.level);
    this.pcState.setExp(resp.id, resp.exp);

    const cachedBox = user?.getPokemonBox();
    if (cachedBox) {
      const idx = cachedBox.findIndex((p) => p.id === resp.id);
      if (idx >= 0) cachedBox[idx] = { ...cachedBox[idx], level: resp.level, exp: resp.exp };
    }
    const party = user?.getParty();
    if (party) {
      const idx = party.findIndex((p) => p.id === resp.id);
      if (idx >= 0) party[idx] = { ...party[idx], level: resp.level, exp: resp.exp };
    }

    await this.playEnhanceAnimation(oldLevel, oldExp, resp.level, resp.exp, group);

    this.refreshCurrentBox();
    this.updateInfo(String(resp.id));

    const displayName = pokemon.nickname ?? getPokemonI18Name(pokemon.pokedexId);
    const expGained = Math.max(0, resp.exp - oldExp);
    const talkUi = this.scene.getMessage('talk');
    await talkUi.showMessage(
      i18next.t('pc:enhanceGainedExp', { name: displayName, exp: expGained }),
    );
    if (resp.leveledUp) {
      this.scene.getAudio().playEffect(SFX.LEVEL_UP);
      await talkUi.showMessage(
        i18next.t('pc:enhanceLeveledUp', { name: displayName, level: resp.level }),
      );
    }

    this.inputManager.pop(this);
    this.inputLocked = false;
  }

  private async openEnhanceCandyMenu(): Promise<string | null> {
    const bag = this.scene.getUser()?.getItemBag();
    const items: IMenuItem[] = EXP_CANDY_IDS.map((id) => {
      const qty = bag?.get(id)?.quantity ?? 0;
      const disabled = qty <= 0;
      return {
        key: id,
        label: i18next.t(`item:${id}.name`),
        count: `x${qty}`,
        disabled,
        color: disabled ? TEXTCOLOR.GRAY : undefined,
      };
    });

    const selected = await this.enhanceCandyMenu.waitForSelect(items);
    this.enhanceCandyMenu.hide();
    if (!selected) return null;
    return selected.key;
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
      { key: 'yes', label: i18next.t('etc:yes') },
      { key: 'no', label: i18next.t('etc:no') },
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
    } catch (err) {
      await showApiErrorAsTalk(this.scene, err);
      this.inputManager.pop(this);
      this.inputLocked = false;
      return;
    }
    if (!resp) {
      this.inputManager.pop(this);
      this.inputLocked = false;
      return;
    }

    await this.ensureCriesLoaded(pokemon.pokedexId, resp.pokedexId);

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

  private async ensureCriesLoaded(...pokedexIds: string[]): Promise<void> {
    const keysToLoad = new Set<string>();
    for (const id of pokedexIds) {
      const key = pokemonCryNames.includes(id) ? id : id.split('_')[0];
      if (!pokemonCryNames.includes(key)) continue;
      if (this.scene.cache.audio.has(key)) continue;
      keysToLoad.add(key);
    }
    if (keysToLoad.size === 0) return;

    const waits = [...keysToLoad].map(
      (key) =>
        new Promise<void>((resolve) => {
          const event = `filecomplete-audio-${key}`;
          const handler = () => resolve();
          this.scene.load.once(event, handler);
          this.scene.time.delayedCall(5000, () => {
            this.scene.load.off(event, handler);
            resolve();
          });
          this.scene.loadAudio(key, 'audio/pokemon', key, 'ogg');
        }),
    );
    this.scene.load.start();
    await Promise.all(waits);
  }

  private async playEnhanceAnimation(
    fromLevel: number,
    fromExp: number,
    toLevel: number,
    toExp: number,
    group: GrowthGroup,
  ): Promise<void> {
    const expDelta = toExp - fromExp;
    const levelDelta = toLevel - fromLevel;
    if (expDelta <= 0 && levelDelta <= 0) return;

    const leveledUp = levelDelta > 0;
    if (leveledUp) {
      this.infoLevel.setTint(0xfff28a);
    }

    this.infoExpBar.setProgress(fromLevel, fromExp, group);

    const audio = this.scene.getAudio();
    const expGainLoop = audio.playEffectLoop(SFX.EXP_GAIN);
    try {
      await this.infoExpBar.animate({
        beforeLevel: fromLevel,
        beforeExp: fromExp,
        afterLevel: toLevel,
        afterExp: toExp,
        group,
        totalDuration: 1500,
        onLevelUp: (newLevel) => {
          this.infoLevel.setText(`${newLevel}`);
          audio.playEffect(SFX.EXP_FULL);
        },
      });
    } finally {
      audio.stopEffectLoop(expGainLoop);
    }

    // 최종 표시 정리
    this.infoLevel.setText(`${toLevel}`);
    this.infoLevel.clearTint();
    this.updateInfoExpBar(toLevel, toExp, group);
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
    this.createPartySlotLayout();
    this.createInfoLayout();
    this.createTopLayout();
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
    this.partyBaseY = 25;
    this.partyWindow = addWindow(
      this.scene,
      TEXTURE.WINDOW_PC,
      0,
      0,
      170,
      840,
      1.6,
      16,
      16,
      16,
      16,
    );

    this.partyTitle = addText(
      this.scene,
      0,
      -460,
      i18next.t('pc:party'),
      60,
      100,
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    this.info = addImage(this.scene, TEXTURE.PC_INFO, undefined, -445, 0).setScale(3.17);

    // 바를 화면 우측에 배치. align: 'right' → setPosition(x,y) 의 (x,y) 가 바의 우측 끝.
    // maxWidth 는 BaseUi 좌측 끝(- cameraHalfWidth) + 좌측 패딩 30 ~ 우측 끝 사이의 가용 폭.
    const barRightX = +930; // 화면 우측(+960) 안쪽 30px
    const leftPadding = 30;
    const cameraHalfWidth = this.scene.cameras.main.width / 2; // BaseUi 원점 = 카메라 중심
    const barMaxWidth = barRightX - (-cameraHalfWidth + leftPadding);

    this.inputGuide = new KeyGuideBarContainer(this.scene);
    this.inputGuide.create({
      entries: [
        { keys: [i18next.t('etc:arrowKey')], description: i18next.t('etc:move') },
        { keys: ['Z', 'ENTER'], description: i18next.t('etc:confirm') },
        { keys: ['X', 'ESC'], description: i18next.t('etc:saveAndQuit') },
      ],
      keycapTextSize: 30,
      keycapPaddingX: 50,
      keycapPaddingY: 40,
      keycapScale: 2,
      keycapTextYOffset: -5,
      descriptionTextSize: 40,
      gapKeyToDescription: 5,
      gapBetweenEntries: 25,
      gapInsideEntry: 4,
      align: 'right',
      maxWidth: barMaxWidth, // 콘텐츠 총 폭이 이보다 길면 자동 축소(setScale).
    });

    this.inputGuide.setPosition(barRightX, +500);
  }

  private createInfoLayout() {
    this.infoPokedexSymbol = addText(
      this.scene,
      -950,
      -490,
      ``,
      70,
      100,
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    ).setFontFamily(TEXTFONT.DP);
    this.infoPokedex = addText(
      this.scene,
      -860,
      -495,
      `0000`,
      85,
      100,
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    ).setFontFamily(TEXTFONT.DP);
    this.infoFront = addImage(
      this.scene,
      getPokemonTexture('sprite', '0006', { isShiny: true, isFemale: false }).key,
      undefined,
      -640,
      -20,
    ).setScale(2.6);

    this.infoShinyIcon = addImage(this.scene, TEXTURE.ICON_SHINY, undefined, -395, -265).setScale(
      3.4,
    );

    this.infoPokemonName = addText(
      this.scene,
      -875,
      -413,
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
      -415,
    ).setScale(2);

    this.infoGender = addText(
      this.scene,
      -390,
      -412,
      SYMBOL_MALE,
      90,
      100,
      'center',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );

    this.infoTier = addText(
      this.scene,
      -365,
      -350,
      '',
      50,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.SIG_0,
    ).setOrigin(1, 0);

    this.infoLevelSymbol = addImage(this.scene, TEXTURE.ICON_LV, undefined, -930, -305).setScale(
      2.4,
    );
    this.infoLevel = addText(
      this.scene,
      -890,
      -305,
      ``,
      55,
      100,
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );

    this.infoCandySymbol = addImage(this.scene, 'fire-candy', undefined, -930, -260).setScale(2.6);
    this.infoCandy = addText(
      this.scene,
      -890,
      -260,
      `x100`,
      55,
      100,
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );

    this.infoFriendshipSymbol = addImage(this.scene, 'soothe-bell', undefined, -930, -208).setScale(
      2.6,
    );
    this.infoFriendship = addText(
      this.scene,
      -890,
      -206,
      ` 100`,
      55,
      100,
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );

    this.infoCaptureDateSymbol = addText(
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
    this.infoCaptureDate = addText(
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

    this.infoCaptureLocationSymbol = addText(
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
    this.infoCaptureLocation = addText(
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

    this.infoExpBar = new ExpBarContainer(this.scene, -800, -343, {
      width: 320,
      height: 22,
    });

    this.infoExpTotalSymbol = addText(
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
    this.infoExpTotalValue = addText(
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
    this.infoExpCurrentSymbol = addText(
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
    this.infoExpCurrentValue = addText(
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
    this.infoExpRemainingSymbol = addText(
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
    this.infoExpRemainingValue = addText(
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

    // this.infoType1 = addImage(this.scene, TEXTURE.TYPES, undefined, -890, +240).setScale(2);
    // this.infoType2 = addImage(this.scene, TEXTURE.TYPES, undefined, -755, +240).setScale(2);

    this.infoType1 = new PokemonTypeContainer(this.scene, -890, +245);
    this.infoType2 = new PokemonTypeContainer(this.scene, -755, +245);

    this.infoSkills.push(new PokemonSkillContainer(this.scene, -470, +245));
    this.infoSkills.push(new PokemonSkillContainer(this.scene, -470, +200));
    this.infoSkills.push(new PokemonSkillContainer(this.scene, -470, +155));
    this.infoSkills.push(new PokemonSkillContainer(this.scene, -470, +110));

    this.bottomInfoGuide = new KeyGuideBarContainer(this.scene);
    this.bottomInfoGuide.create({
      entries: [{ keys: ['N'], description: i18next.t('etc:next') }],
      keycapTextSize: 32,
      keycapPaddingX: 40,
      keycapPaddingY: 30,
      keycapScale: 2,
      keycapTextYOffset: -4,
      descriptionTextSize: 32,
      gapKeyToDescription: 2,
      gapInsideEntry: 4,
      align: 'right',
    });
    this.bottomInfoGuide.setPosition(-330, +535);

    this.setSymbol();
  }

  setSymbol() {
    this.infoPokedexSymbol.setText(`No.`);
    this.infoNatureSymbol.setText(i18next.t(`etc:natureSymbol`));
    this.infoAbilitySymbol.setText(i18next.t(`etc:abilitySymbol`));
    this.heldItemSymbol.setText(i18next.t(`etc:heldItemSymbol`));
    this.infoExpTotalSymbol.setText(i18next.t(`etc:expSymbol`));
    this.infoExpCurrentSymbol.setText(i18next.t(`etc:currentExpSymbol`));
    this.infoExpRemainingSymbol.setText(i18next.t(`etc:remainingExpSymbol`));
    this.infoCaptureDateSymbol.setText(i18next.t(`etc:captureDateSymbol`));
    this.infoCaptureLocationSymbol.setText(i18next.t(`etc:captureLocationSymbol`));

    const GAP = 30;
    const placeValue = (symbol: GText, value: GText) => {
      value.setX(symbol.x + symbol.displayWidth + GAP);
    };
    placeValue(this.infoAbilitySymbol, this.infoAbility);
    placeValue(this.infoNatureSymbol, this.infoNature);
    placeValue(this.heldItemSymbol, this.heldItem);
    placeValue(this.infoExpTotalSymbol, this.infoExpTotalValue);
    placeValue(this.infoExpCurrentSymbol, this.infoExpCurrentValue);
    placeValue(this.infoExpRemainingSymbol, this.infoExpRemainingValue);
    placeValue(this.infoCaptureDateSymbol, this.infoCaptureDate);
    placeValue(this.infoCaptureLocationSymbol, this.infoCaptureLocation);
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

  private updateInfoExpBar(level: number, exp: number, group: GrowthGroup): void {
    this.infoExpBar.setProgress(level, exp, group);
    const prog = pokemonExpProgress(level, exp, group);
    this.infoExpTotalValue.setText(`${prog.next}`);
    this.infoExpCurrentValue.setText(`${exp}`);
    this.infoExpRemainingValue.setText(`${prog.remaining}`);
  }

  private clearInfo(): void {
    this.currentInfoPokemon = null;
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
    this.infoLevelSymbol.setVisible(false);
    this.infoCandySymbol.setVisible(false);
    this.infoCandy.setVisible(false);
    this.infoFriendshipSymbol.setVisible(false);
    this.infoFriendship.setVisible(false);
    this.infoCaptureDate.setVisible(false);
    this.infoCaptureLocation.setVisible(false);
    this.infoCaptureDateSymbol.setVisible(false);
    this.infoCaptureLocationSymbol.setVisible(false);
    this.infoExpBar.setVisible(false);
    this.infoExpTotalSymbol.setVisible(false);
    this.infoExpTotalValue.setVisible(false);
    this.infoExpCurrentSymbol.setVisible(false);
    this.infoExpCurrentValue.setVisible(false);
    this.infoExpRemainingSymbol.setVisible(false);
    this.infoExpRemainingValue.setVisible(false);
  }

  private restoreInfoSymbols(): void {
    this.infoFront.setVisible(true);
    this.infoCapturePokeball.setVisible(true);
    this.infoLevelSymbol.setVisible(true);
    this.infoFriendshipSymbol.setVisible(true);
    this.infoFriendship.setVisible(true);
    this.infoExpBar.setVisible(true);
    this.setSymbol();
    this.applyInfoPageVisibility();
  }

  private applyInfoPageVisibility(): void {
    const page = this.infoPage;
    // page 0: ability / nature / held item
    const show0 = page === 0;
    this.infoAbilitySymbol.setVisible(show0);
    this.infoAbility.setVisible(show0);
    this.infoNatureSymbol.setVisible(show0);
    this.infoNature.setVisible(show0);
    this.heldItemSymbol.setVisible(show0);
    this.heldItem.setVisible(show0);

    const show1 = page === 1;
    this.infoCaptureDateSymbol.setVisible(show1);
    this.infoCaptureDate.setVisible(show1);
    this.infoCaptureLocationSymbol.setVisible(show1);
    this.infoCaptureLocation.setVisible(show1);

    const show2 = page === 2;
    this.infoExpTotalSymbol.setVisible(show2);
    this.infoExpTotalValue.setVisible(show2);
    this.infoExpCurrentSymbol.setVisible(show2);
    this.infoExpCurrentValue.setVisible(show2);
    this.infoExpRemainingSymbol.setVisible(show2);
    this.infoExpRemainingValue.setVisible(show2);
  }

  private cycleInfoPage(): void {
    this.infoPage = ((this.infoPage + 1) % 3) as 0 | 1 | 2;
    if (this.focusArea === 'grid') {
      this.updateInfo(this.gridSelect.getSelectedKey());
    } else if (this.focusArea === 'party') {
      this.updatePartySlotInfo();
    } else {
      this.applyInfoPageVisibility();
    }
    this.scene.getAudio().playEffect(SFX.CURSOR_0);
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
    if (!pokemon) {
      this.currentInfoPokemon = null;
      return;
    }

    this.currentInfoPokemon = pokemon;

    const pokedexKey = pokemon.pokedexId;

    this.infoPokedex.setText(getPokedexId(pokemon.pokedexId));

    const name = pokemon.nickname ?? getPokemonI18Name(pokedexKey);
    this.infoPokemonName.setText(name);
    this.infoLevel.setText(`${pokemon.level}`);
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
    const caught = pokemon.caughtAt ? new Date(pokemon.caughtAt) : null;
    this.infoCaptureDate.setText(
      caught && !isNaN(caught.getTime())
        ? `${caught.getFullYear()}-${String(caught.getMonth() + 1).padStart(2, '0')}-${String(caught.getDate()).padStart(2, '0')}`
        : '',
    );
    this.infoCaptureLocation.setText(i18next.t(`map:${pokemon.caughtLocation}`));
    this.infoAbility.setText(i18next.t(`ability:${pokemon.abilityId}`));
    this.infoNature.setText(i18next.t(`nature:${pokemon.natureId}`));
    this.heldItem.setText(pokemon.heldItemId ? i18next.t(`item:${pokemon.heldItemId}.name`) : '-');

    const pokemonData = this.scene.getMasterData().getPokemonData(pokedexKey);
    this.updateInfoExpBar(
      pokemon.level,
      pokemon.exp ?? 0,
      pokemonData?.growthGroup ?? 'medium_fast',
    );
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

    // this.infoLevel.setX(this.infoPokemonName.x + this.infoPokemonName.displayWidth + 10);

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

    this.topArrowLeft = addImage(
      this.scene,
      TEXTURE.CURSOR_BLACK,
      undefined,
      this.topName.x - PokemonPcUi.TOP_ARROW_OFFSET_X,
      this.topName.y - 10,
    )
      .setScale(5)
      .setFlipX(true)
      .setAlpha(PokemonPcUi.TOP_ARROW_DIM_ALPHA);
    this.topArrowRight = addImage(
      this.scene,
      TEXTURE.CURSOR_BLACK,
      undefined,
      this.topName.x + PokemonPcUi.TOP_ARROW_OFFSET_X,
      this.topName.y - 10,
    )
      .setScale(5)
      .setAlpha(PokemonPcUi.TOP_ARROW_DIM_ALPHA);
  }

  private static readonly TOP_ARROW_OFFSET_X = 420;
  private static readonly TOP_ARROW_DIM_ALPHA = 0.6;

  private static readonly PARTY_BASE_X = 830;
  private static readonly PARTY_SLOT_GAP = 120;
  private static readonly PARTY_CURSOR_OFFSET_Y = -50;

  // partySet 컨테이너 내부 로컬 좌표
  private getPartySlotLocalPosition(partyIndex: number): { x: number; y: number } {
    const centerOffset = (6 - 1) / 2;
    return {
      x: 0,
      y: (partyIndex - centerOffset) * PokemonPcUi.PARTY_SLOT_GAP,
    };
  }

  private createPartySlotLayout() {
    for (let i = 0; i < 6; i++) {
      const { x, y } = this.getPartySlotLocalPosition(i);
      const slot = new PokemonSlotContainer(this.scene, x, y);
      slot.create({
        iconScale: 2.4,
        showLevel: true,
        levelOffsetY: 60,
        levelSize: 50,
        levelWeight: 100,
        levelIconScale: 2,
        heldItemScale: 2.4,
        heldItemOffset: { x: 30, y: 35 },
      });
      this.partySlots.push(slot);
    }

    const first = this.getPartySlotLocalPosition(0);
    this.partyCursor = addSprite(
      this.scene,
      TEXTURE.PC_FINGER_0,
      'pc_finger_0-0',
      first.x,
      first.y + PokemonPcUi.PARTY_CURSOR_OFFSET_Y,
    )
      .setScale(3.8)
      .setVisible(false);
    this.playFingerAnim(this.partyCursor);
  }

  private updatePartyCursorPosition(): void {
    const { x, y } = this.getPartySlotLocalPosition(this.partyCursorIndex);
    this.partyCursor.setX(x);
    this.partyCursor.setY(y + PokemonPcUi.PARTY_CURSOR_OFFSET_Y);
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

  // pcSet(=grabOverlay) 로컬 좌표 기준 그리드 셀 위치
  private getGridCellLocalPosition(gridIndex: number): { x: number; y: number } {
    const gridX = 340; // GridSelectUi config.x
    const gridY = -5; // GridSelectUi config.y
    const cols = 6;
    const cellW = 80;
    const cellH = 80;
    const gapW = 70;
    const gapH = 60;
    const totalContentW = cols * cellW + (cols - 1) * gapW;
    const rows = 5;
    const totalContentH = rows * cellH + (rows - 1) * gapH;

    const startX = -totalContentW / 2 + cellW / 2;
    const startY = -totalContentH / 2 + cellH / 2;
    const row = Math.floor(gridIndex / cols);
    const col = gridIndex % cols;
    return {
      x: gridX + startX + col * (cellW + gapW),
      y: gridY + startY + row * (cellH + gapH),
    };
  }

  // grabOverlay 로컬 기준 파티 슬롯 위치 (partySet 씬 좌표를 grabOverlay 로컬로 변환)
  private getPartySlotGrabLocalPosition(partyIndex: number): { x: number; y: number } {
    const partyLocal = this.getPartySlotLocalPosition(partyIndex);
    return {
      x: this.partySet.x - this.grabOverlay.x + partyLocal.x,
      y: this.partySet.y - this.grabOverlay.y + partyLocal.y,
    };
  }

  private static readonly GRAB_ICON_LIFT = 40;

  private updateGrabCursorPosition(): void {
    this.grabOverlay.setPosition(this.pcSet.x, this.pcSet.y);

    let pos: { x: number; y: number };
    if (this.grabInTop) {
      pos = { x: 285, y: -420 };
    } else if (this.grabCursorInParty) {
      pos = this.getPartySlotGrabLocalPosition(this.grabPartyIndex);
    } else {
      pos = this.getGridCellLocalPosition(this.grabGridIndex);
    }
    this.grabCursor.setPosition(pos.x, pos.y - 90);
    this.grabIcon.setPosition(pos.x, pos.y - PokemonPcUi.GRAB_ICON_LIFT);

    this.syncTopArrowAlpha();
  }

  private syncTopArrowAlpha(): void {
    const active = this.focusArea === 'top' || this.grabInTop;
    const alpha = active ? 1 : PokemonPcUi.TOP_ARROW_DIM_ALPHA;
    this.topArrowLeft.setAlpha(alpha);
    this.topArrowRight.setAlpha(alpha);
  }

  private getGrabDropY(): number {
    if (this.grabInTop) return -40;
    if (this.grabCursorInParty) return this.getPartySlotGrabLocalPosition(this.grabPartyIndex).y;
    return this.getGridCellLocalPosition(this.grabGridIndex).y;
  }
}
