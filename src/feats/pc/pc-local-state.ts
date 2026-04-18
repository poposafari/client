import type { BoxMetaItem, GetMeRes, PcSlotState, PokemonBoxItem } from '@poposafari/types/dto';

export interface BoxMeta {
  wallpaper: number;
  name: string;
}

export class PcLocalState {
  private original = new Map<number, PcSlotState>();
  private current = new Map<number, PcSlotState>();
  private allPokemons = new Map<number, PokemonBoxItem>();
  private boxMeta = new Map<number, BoxMeta>(); // boxNumber(1~30) → meta
  private originalBoxMeta = new Map<number, BoxMeta>();
  private originalNicknames = new Map<number, string | null>(); // id → 진입 시 닉네임

  init(
    boxPokemons: PokemonBoxItem[],
    partyPokemons: GetMeRes['party'],
    boxMetaItems?: BoxMetaItem[],
  ) {
    this.original.clear();
    this.current.clear();
    this.allPokemons.clear();
    this.originalNicknames.clear();

    // 박스 메타 초기화
    this.boxMeta.clear();
    this.originalBoxMeta.clear();
    for (let i = 1; i <= 30; i++) {
      this.boxMeta.set(i, { wallpaper: 0, name: '' });
      this.originalBoxMeta.set(i, { wallpaper: 0, name: '' });
    }
    if (boxMetaItems) {
      for (const m of boxMetaItems) {
        this.boxMeta.set(m.boxNumber, { wallpaper: m.wallpaper, name: m.name });
        this.originalBoxMeta.set(m.boxNumber, { wallpaper: m.wallpaper, name: m.name });
      }
    }

    for (const p of boxPokemons) {
      const state: PcSlotState = {
        id: p.id,
        boxNumber: p.boxNumber,
        gridNumber: p.gridNumber,
        partySlot: null,
      };
      this.original.set(p.id, { ...state });
      this.current.set(p.id, { ...state });
      this.allPokemons.set(p.id, p);
      this.originalNicknames.set(p.id, p.nickname);
    }

    for (const p of partyPokemons) {
      const state: PcSlotState = {
        id: p.id,
        boxNumber: null,
        gridNumber: null,
        partySlot: p.partySlot,
      };
      this.original.set(p.id, { ...state });
      this.current.set(p.id, { ...state });
      this.allPokemons.set(p.id, {
        ...p,
        boxNumber: null,
        gridNumber: null,
        caughtLocation: '',
        caughtAt: '',
      });
      this.originalNicknames.set(p.id, p.nickname);
    }
  }

  getAllBoxPokemons(): PokemonBoxItem[] {
    const result: PokemonBoxItem[] = [];
    for (const [id, state] of this.current) {
      if (state.partySlot === null && state.boxNumber !== null) {
        result.push({
          ...this.allPokemons.get(id)!,
          boxNumber: state.boxNumber,
          gridNumber: state.gridNumber,
        });
      }
    }
    return result;
  }

  getBoxPokemons(boxNumber: number): PokemonBoxItem[] {
    const result: PokemonBoxItem[] = [];
    for (const [id, state] of this.current) {
      if (state.boxNumber === boxNumber) {
        const pokemon = this.allPokemons.get(id)!;
        result.push({ ...pokemon, boxNumber: state.boxNumber, gridNumber: state.gridNumber });
      }
    }
    return result;
  }

  getPartyPokemons(): PokemonBoxItem[] {
    const result: PokemonBoxItem[] = [];
    for (const [id, state] of this.current) {
      if (state.partySlot !== null) {
        result.push(this.allPokemons.get(id)!);
      }
    }
    return result.sort(
      (a, b) => (this.current.get(a.id)!.partySlot ?? 0) - (this.current.get(b.id)!.partySlot ?? 0),
    );
  }

  getPartyCount(): number {
    let count = 0;
    for (const [, state] of this.current) {
      if (state.partySlot !== null) count++;
    }
    return count;
  }

  movePokemon(id: number, toBox: number, toGrid: number): void {
    const state = this.current.get(id);
    if (!state) return;
    state.boxNumber = toBox;
    state.gridNumber = toGrid;
    state.partySlot = null;
  }

  swapPokemons(idA: number, idB: number): void {
    const a = this.current.get(idA)!;
    const b = this.current.get(idB)!;
    const temp = {
      boxNumber: a.boxNumber,
      gridNumber: a.gridNumber,
      partySlot: a.partySlot,
    };
    a.boxNumber = b.boxNumber;
    a.gridNumber = b.gridNumber;
    a.partySlot = b.partySlot;
    b.boxNumber = temp.boxNumber;
    b.gridNumber = temp.gridNumber;
    b.partySlot = temp.partySlot;
  }

  moveToParty(id: number, partySlot: number): void {
    const state = this.current.get(id);
    if (!state) return;
    state.boxNumber = null;
    state.gridNumber = null;
    state.partySlot = partySlot;
  }

  moveToBox(id: number, boxNumber: number, gridNumber: number): void {
    const state = this.current.get(id);
    if (!state) return;
    const oldPartySlot = state.partySlot;
    state.boxNumber = boxNumber;
    state.gridNumber = gridNumber;
    state.partySlot = null;

    // 파티 슬롯 재정렬: 빠진 슬롯 이후의 포켓몬을 앞으로 당김
    if (oldPartySlot !== null) {
      for (const [, s] of this.current) {
        if (s.partySlot !== null && s.partySlot > oldPartySlot) {
          s.partySlot--;
        }
      }
    }
  }

  getNextFreePartySlot(): number | null {
    const used = new Set<number>();
    for (const [, state] of this.current) {
      if (state.partySlot !== null) used.add(state.partySlot);
    }
    for (let i = 0; i < 6; i++) {
      if (!used.has(i)) return i;
    }
    return null;
  }

  getNextFreeGridSlot(boxNumber: number): number | null {
    const used = new Set<number>();
    for (const [, state] of this.current) {
      if (state.boxNumber === boxNumber && state.gridNumber !== null) {
        used.add(state.gridNumber);
      }
    }
    for (let i = 0; i < 30; i++) {
      if (!used.has(i)) return i;
    }
    return null;
  }

  getPokemonAt(boxNumber: number, gridNumber: number): PokemonBoxItem | null {
    for (const [id, state] of this.current) {
      if (state.boxNumber === boxNumber && state.gridNumber === gridNumber) {
        return this.allPokemons.get(id) ?? null;
      }
    }
    return null;
  }

  getPokemonAtPartySlot(partySlot: number): PokemonBoxItem | null {
    for (const [id, state] of this.current) {
      if (state.partySlot === partySlot) {
        return this.allPokemons.get(id) ?? null;
      }
    }
    return null;
  }

  getPokemonById(id: number): PokemonBoxItem | null {
    return this.allPokemons.get(id) ?? null;
  }

  getSlotState(id: number): PcSlotState | null {
    return this.current.get(id) ?? null;
  }

  compactPartyAfter(removedSlot: number): void {
    for (const [, s] of this.current) {
      if (s.partySlot !== null && s.partySlot > removedSlot) {
        s.partySlot--;
      }
    }
  }

  detachPokemon(id: number): void {
    const state = this.current.get(id);
    if (!state) return;
    state.boxNumber = null;
    state.gridNumber = null;
    state.partySlot = null;
  }

  attachPokemon(
    id: number,
    boxNumber: number | null,
    gridNumber: number | null,
    partySlot: number | null,
  ): void {
    const state = this.current.get(id);
    if (!state) return;
    state.boxNumber = boxNumber;
    state.gridNumber = gridNumber;
    state.partySlot = partySlot;
  }

  getBoxMeta(boxNumber: number): BoxMeta {
    return this.boxMeta.get(boxNumber) ?? { wallpaper: boxNumber - 1, name: '' };
  }

  setBoxWallpaper(boxNumber: number, wallpaper: number): void {
    const meta = this.getBoxMeta(boxNumber);
    meta.wallpaper = wallpaper;
    this.boxMeta.set(boxNumber, meta);
  }

  setBoxName(boxNumber: number, name: string): void {
    const meta = this.getBoxMeta(boxNumber);
    meta.name = name;
    this.boxMeta.set(boxNumber, meta);
  }

  setLevel(id: number, level: number): void {
    const pokemon = this.allPokemons.get(id);
    if (pokemon) {
      pokemon.level = level;
    }
  }

  setPokedexId(id: number, pokedexId: string): void {
    const pokemon = this.allPokemons.get(id);
    if (pokemon) {
      pokemon.pokedexId = pokedexId;
    }
  }

  setNickname(id: number, nickname: string | null): void {
    const pokemon = this.allPokemons.get(id);
    if (pokemon) {
      pokemon.nickname = nickname;
    }
  }

  setHeldItemId(id: number, heldItemId: string | null): void {
    const pokemon = this.allPokemons.get(id);
    if (pokemon) {
      pokemon.heldItemId = heldItemId;
    }
  }

  getNicknameChanges(): { id: number; nickname: string | null }[] {
    const changes: { id: number; nickname: string | null }[] = [];
    for (const [id, pokemon] of this.allPokemons) {
      const orig = this.originalNicknames.get(id);
      if (orig !== pokemon.nickname) {
        changes.push({ id, nickname: pokemon.nickname });
      }
    }
    return changes;
  }

  removePokemon(id: number): void {
    this.current.delete(id);
    this.allPokemons.delete(id);
  }

  getChanges(): PcSlotState[] {
    const changes: PcSlotState[] = [];
    for (const [id, cur] of this.current) {
      const orig = this.original.get(id);
      if (
        !orig ||
        orig.boxNumber !== cur.boxNumber ||
        orig.gridNumber !== cur.gridNumber ||
        orig.partySlot !== cur.partySlot
      ) {
        changes.push({ ...cur });
      }
    }
    return changes;
  }

  getBoxMetaChanges(): BoxMetaItem[] {
    const changes: BoxMetaItem[] = [];
    for (const [boxNumber, cur] of this.boxMeta) {
      const orig = this.originalBoxMeta.get(boxNumber);
      if (!orig || orig.wallpaper !== cur.wallpaper || orig.name !== cur.name) {
        changes.push({ boxNumber, wallpaper: cur.wallpaper, name: cur.name });
      }
    }
    return changes;
  }
}
