import {
  CostumeEntry,
  GetMeRes,
  ItemBagItem,
  OverworldDirection,
  OverworldMovementState,
  PokedexEntry,
  PokemonBoxItem,
  TownMapEntry,
} from '@poposafari/types';

/**
 * 기존 UI 코드가 접근하는 프로필 형태.
 * GetMeRes.profile → MappedProfile로 변환하여 하위 호환 유지.
 */
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
  private itemSlots!: GetMeRes['itemSlots'];

  // ── Lazy Load 데이터 (UI 열 때 최초 1회 로드 후 캐싱) ──
  private pokemonBox: PokemonBoxItem[] | null = null;
  private itemBag: ItemBagItem[] | null = null;
  private pokedex: PokedexEntry[] | null = null;
  private townMap: TownMapEntry[] | null = null;
  private costumeList: CostumeEntry[] | null = null;

  /** 플레이어 오버월드 움직임 상태 (walk / running / ride / fishing / surf) */
  private overworldMovementState: OverworldMovementState =
    OverworldMovementState.WALK;
  /** 마지막으로 바라본 방향 (맵 전환 후 플레이어 초기 방향으로 사용) */
  private overworldDirection: OverworldDirection = OverworldDirection.DOWN;

  constructor() {}

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
    this.itemSlots = user.itemSlots;
  }

  getProfile(): MappedProfile {
    return this.profile;
  }

  getEquippedCostumes(): GetMeRes['equippedCostumes'] {
    return this.equippedCostumes;
  }

  getParty(): GetMeRes['party'] {
    return this.party;
  }

  getItemSlots(): GetMeRes['itemSlots'] {
    return this.itemSlots;
  }

  // ── Lazy Load getter/setter ──

  getPokemonBox(): PokemonBoxItem[] | null {
    return this.pokemonBox;
  }

  setPokemonBox(data: PokemonBoxItem[]): void {
    this.pokemonBox = data;
  }

  getItemBag(): ItemBagItem[] | null {
    return this.itemBag;
  }

  setItemBag(data: ItemBagItem[]): void {
    this.itemBag = data;
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
