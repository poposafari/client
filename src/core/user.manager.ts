import {
  BoxMetaItem,
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

export const MAX_POKEMON_BOX_CAPACITY = 900;
export const MAX_PARTY_SIZE = 6;

export interface MappedProfile {
  nickname: string;
  gender: 'male' | 'female';
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
  private visitedMaps!: Set<string>;
  private pokemonBoxCount!: number;

  // ── Lazy Load 데이터 (UI 열 때 최초 1회 로드 후 캐싱) ──
  private pokemonBox: PokemonBoxItem[] | null = null;
  private boxMeta: BoxMetaItem[] | null = null;
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
  /** 현재 파도타기를 시전 중인 파티 포켓몬의 DB id. SURF 상태일 때만 유효. */
  private activeSurfPokemonId: number | null = null;

  private partyListeners: Array<(party: GetMeRes['party']) => void> = [];

  constructor() {}

  reset(): void {
    this.profile = undefined as unknown as MappedProfile;
    this.equippedCostumes = undefined as unknown as GetMeRes['equippedCostumes'];
    this.party = undefined as unknown as GetMeRes['party'];
    this.itemSlots = undefined as unknown as string[];
    this.visitedMaps = undefined as unknown as Set<string>;
    this.pokemonBoxCount = undefined as unknown as number;

    this.pokemonBox = null;
    this.boxMeta = null;
    this.itemBag = null;
    this.itemBagLoaded = false;
    this.pokedex = null;
    this.townMap = null;
    this.costumeList = null;

    this.pcBoxIndex = 0;
    this.pcGridIndex = 0;

    this.overworldMovementState = OverworldMovementState.WALK;
    this.overworldDirection = OverworldDirection.DOWN;
    this.activeSurfPokemonId = null;

    this.partyListeners = [];
  }

  init(user: GetMeRes) {
    const p = user.profile;
    this.profile = {
      nickname: p.nickname,
      gender: p.gender === 1 ? 'male' : 'female',
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
    this.pokedex = user.pokedex;
    this.visitedMaps = new Set(user.visitedMaps ?? []);
    this.pokemonBoxCount = user.pokemonBoxCount ?? 0;
  }

  getProfile(): MappedProfile {
    return this.profile;
  }

  setMoney(amount: number): void {
    this.profile.money = amount;
  }

  setHasStarter(value: boolean): void {
    this.profile.hasStarter = value;
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

  getVisitedMaps(): string[] {
    return Array.from(this.visitedMaps);
  }

  hasVisitedMap(mapId: string): boolean {
    return this.visitedMaps.has(mapId);
  }

  addVisitedMap(mapId: string): boolean {
    if (this.visitedMaps.has(mapId)) return false;
    this.visitedMaps.add(mapId);
    return true;
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

  getPokemonBoxCount(): number {
    return this.pokemonBoxCount ?? 0;
  }

  setPokemonBoxCount(count: number): void {
    this.pokemonBoxCount = Math.max(0, count);
  }

  adjustPokemonBoxCount(delta: number): void {
    this.pokemonBoxCount = Math.max(0, (this.pokemonBoxCount ?? 0) + delta);
  }

  /** 박스 900칸과 파티 6칸이 모두 가득 차야 true. 둘 중 한 곳이라도 빈 슬롯이 있으면 포획 가능. */
  isPokemonBoxFull(): boolean {
    return (
      (this.pokemonBoxCount ?? 0) >= MAX_POKEMON_BOX_CAPACITY &&
      (this.party?.length ?? 0) >= MAX_PARTY_SIZE
    );
  }

  getBoxMeta(): BoxMetaItem[] | null {
    return this.boxMeta;
  }

  setBoxMeta(data: BoxMetaItem[]): void {
    this.boxMeta = data;
  }

  getItemBag(): Map<string, ItemBagEntry> | null {
    return this.itemBag;
  }

  getItemQuantity(itemId: string): number {
    return this.itemBag?.get(itemId)?.quantity ?? 0;
  }

  hasItem(itemId: string): boolean {
    return this.getItemQuantity(itemId) > 0;
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

  isPokedexRegistered(pokedexId: string): boolean {
    if (!this.pokedex) return false;
    const normalize = (id: string) => id.split('_')[0].padStart(4, '0');
    const target = normalize(pokedexId);
    return this.pokedex.some((p) => p.caughtCount > 0 && normalize(p.pokedexId) === target);
  }

  setPokedex(data: PokedexEntry[]): void {
    this.pokedex = data;
  }

  incrementPokedexCount(pokedexId: string): void {
    if (!this.pokedex) return;
    const existing = this.pokedex.find((p) => p.pokedexId === pokedexId);
    if (existing) {
      existing.caughtCount += 1;
    } else {
      this.pokedex.push({ pokedexId, caughtCount: 1 });
    }
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

  getActiveSurfPokemonId(): number | null {
    return this.activeSurfPokemonId;
  }

  setActiveSurfPokemonId(id: number | null): void {
    this.activeSurfPokemonId = id;
  }
}
