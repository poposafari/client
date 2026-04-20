import {
  CostumeEntry,
  GetMeRes,
  ItemBagItem,
  ItemCategory,
  OverworldDirection,
  OverworldMovementState,
  PokedexEntry,
  PokemonBoxItem,
  TownMapEntry,
} from '@poposafari/types';
import { MasterData } from './master.data.ts';

export interface ItemBagEntry {
  quantity: number;
  register: boolean;
}

export interface MappedProfile {
  nickname: string;
  gender: 'male' | 'female';
  level: number;
  exp: number;
  money: number;
  playtime: number;
  hasStarter: boolean;
  lastLocation: { map: string; x: number; y: number };
}

export class UserManager {
  // ── 게임 진입 시 즉시 로드되는 데이터 ──
  private profile!: MappedProfile;
  private equippedCostumes!: GetMeRes['equippedCostumes'];
  private party!: GetMeRes['party'];
  private itemSlots!: string[];

  // ── Lazy Load 데이터 (UI 열 때 최초 1회 로드 후 캐싱) ──
  private pokemonBox: PokemonBoxItem[] | null = null;
  private itemBag: Map<string, ItemBagEntry> | null = null;
  private itemBagLoaded = false;
  private pokedex: PokedexEntry[] | null = null;
  private townMap: TownMapEntry[] | null = null;
  private costumeList: CostumeEntry[] | null = null;

  /** PC 박스 커서 상태 (세션 내 유지) */
  private pcBoxIndex = 0;
  private pcGridIndex = 0;

  /** 플레이어 오버월드 움직임 상태 (walk / running / ride / fishing / surf) */
  private overworldMovementState: OverworldMovementState = OverworldMovementState.WALK;
  /** 마지막으로 바라본 방향 (맵 전환 후 플레이어 초기 방향으로 사용) */
  private overworldDirection: OverworldDirection = OverworldDirection.DOWN;

  private partyListeners: Array<(party: GetMeRes['party']) => void> = [];

  constructor() {}

  init(user: GetMeRes) {
    const p = user.profile;
    this.profile = {
      nickname: p.nickname,
      gender: p.gender === 1 ? 'male' : 'female',
      level: p.level,
      exp: p.exp,
      money: p.money,
      playtime: p.playtime,
      hasStarter: p.hasStarter,
      lastLocation: {
        map: String(p.lastMapId),
        x: p.lastX,
        y: p.lastY,
      },
    };
    this.equippedCostumes = user.equippedCostumes;
    this.party = user.party;
    this.itemSlots = user.itemSlots.map((s) => String(s.itemId));
    this.setItemBag([
      ...(user.itemSlots as unknown as ItemBagItem[]),
      ...(user.essentialItems as unknown as ItemBagItem[]),
    ]);
  }

  getProfile(): MappedProfile {
    return this.profile;
  }

  setMoney(amount: number): void {
    this.profile.money = amount;
  }

  setLevelAndExp(level: number, exp: number): void {
    this.profile.level = level;
    this.profile.exp = exp;
  }

  getEquippedCostumes(): GetMeRes['equippedCostumes'] {
    return this.equippedCostumes;
  }

  getParty(): GetMeRes['party'] {
    return this.party;
  }

  setParty(party: GetMeRes['party']): void {
    this.party = party;
    for (const l of this.partyListeners) l(party);
  }

  onPartyChanged(listener: (party: GetMeRes['party']) => void): () => void {
    this.partyListeners.push(listener);
    return () => {
      const i = this.partyListeners.indexOf(listener);
      if (i >= 0) this.partyListeners.splice(i, 1);
    };
  }

  getItemSlots(): string[] {
    return this.itemSlots;
  }

  // ── Lazy Load getter/setter ──

  getPokemonBox(): PokemonBoxItem[] | null {
    return this.pokemonBox;
  }

  setPokemonBox(data: PokemonBoxItem[]): void {
    this.pokemonBox = data;
  }

  /** 포획 성공해서 박스에 포켓몬 1마리 추가. 캐시가 없으면 무시(다음 PC 진입 시 API로 로드). */
  addPokemonToBox(pokemon: PokemonBoxItem): void {
    if (!this.pokemonBox) return;
    this.pokemonBox.push(pokemon);
  }

  getItemBag(): Map<string, ItemBagEntry> | null {
    return this.itemBag;
  }

  setItemBag(data: ItemBagItem[]): void {
    this.itemBag = new Map();
    for (const item of data) {
      this.itemBag.set(String(item.itemId), {
        quantity: item.quantity,
        register: item.register,
      });
    }
  }

  isItemBagLoaded(): boolean {
    return this.itemBagLoaded;
  }

  setItemBagLoaded(loaded: boolean): void {
    this.itemBagLoaded = loaded;
  }

  clearItemBag(): void {
    this.itemBag = new Map();
    this.itemBagLoaded = false;
  }

  hydrateItemBag(data: ItemBagItem[]): void {
    this.setItemBag(data);
    this.itemBagLoaded = true;
  }

  getItemBagByCategory(
    masterData: MasterData,
    category: ItemCategory,
  ): { itemId: string; quantity: number; register: boolean }[] {
    if (!this.itemBag) return [];
    const result: { itemId: string; quantity: number; register: boolean }[] = [];
    for (const [itemId, entry] of this.itemBag) {
      const data = masterData.getItemData(itemId);
      if (data && data.category === category) {
        result.push({ itemId, ...entry });
      }
    }
    return result;
  }

  updateItemQuantity(itemId: string, quantity: number, register?: boolean): void {
    if (!this.itemBag) return;
    if (quantity <= 0) {
      this.itemBag.delete(itemId);
      return;
    }
    const existing = this.itemBag.get(itemId);
    this.itemBag.set(itemId, {
      quantity,
      register: register !== undefined ? register : (existing?.register ?? false),
    });
  }

  decreaseItemQuantity(itemId: string, amount: number): void {
    if (!this.itemBag) return;
    const entry = this.itemBag.get(itemId);
    if (!entry) return;
    const newQuantity = entry.quantity - amount;
    if (newQuantity <= 0) {
      this.itemBag.delete(itemId);
    } else {
      entry.quantity = newQuantity;
    }
  }

  getPokedex(): PokedexEntry[] | null {
    return this.pokedex;
  }

  setPokedex(data: PokedexEntry[]): void {
    this.pokedex = data;
  }

  getTownMap(): TownMapEntry[] | null {
    return this.townMap;
  }

  setTownMap(data: TownMapEntry[]): void {
    this.townMap = data;
  }

  getCostumeList(): CostumeEntry[] | null {
    return this.costumeList;
  }

  setCostumeList(data: CostumeEntry[]): void {
    this.costumeList = data;
  }

  // ── PC 커서 상태 ──

  getPcBoxIndex(): number {
    return this.pcBoxIndex;
  }

  setPcBoxIndex(index: number): void {
    this.pcBoxIndex = index;
  }

  getPcGridIndex(): number {
    return this.pcGridIndex;
  }

  setPcGridIndex(index: number): void {
    this.pcGridIndex = index;
  }

  // ── 오버월드 상태 ──

  getOverworldMovementState(): OverworldMovementState {
    return this.overworldMovementState;
  }

  setOverworldMovementState(state: OverworldMovementState): void {
    this.overworldMovementState = state;
  }

  getOverworldDirection(): OverworldDirection {
    return this.overworldDirection;
  }

  setOverworldDirection(direction: OverworldDirection): void {
    this.overworldDirection = direction;
  }
}
