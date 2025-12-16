import { MAX_PARTY_SLOT } from '../../constants';
import { PlayerPokemon } from '../../obj/player-pokemon';
import { EvolPcRes, GetIngameRes, GetPcRes, PokemonHiddenMove } from '../../types';
import { getPokemonType } from '../../utils/string-util';
import { ErrorCode, throwError } from '../errors';
import { SocketIO } from '../manager/socket-manager';
import { Event } from '../manager/event-manager';
import { EVENT } from '../../enums';

export class PcStorage {
  private static instance: PcStorage;

  private party: (PlayerPokemon | null)[] = [];
  private pet: PlayerPokemon | null = null;
  private boxBgs: number[] = [];
  private boxNames: string[] = [];
  private pcMapping: Map<number, (PlayerPokemon | null)[]> = new Map();
  private pokemonNewNicknames: Map<number, string> = new Map();
  private lastBoxIndexOnPcUi: number = 0;
  private lastBoxSelectionOnPcUi: { row: number; col: number } = { row: 0, col: 0 };
  private hiddenMovePokemon: PlayerPokemon | null = null;

  constructor() {}

  static getInstance(): PcStorage {
    if (!PcStorage.instance) {
      PcStorage.instance = new PcStorage();
    }
    return PcStorage.instance;
  }

  setHiddenMovePokemon(pokemon: PlayerPokemon | null) {
    this.hiddenMovePokemon = pokemon;
  }

  getHiddenMovePokemon(): PlayerPokemon | null {
    return this.hiddenMovePokemon;
  }

  setPokemonNewNickname(idx: number, nickname: string) {
    this.pokemonNewNicknames.set(idx, nickname);
  }

  getPokemonNewNickname(idx: number): string | null {
    return this.pokemonNewNicknames.get(idx) || null;
  }

  setLastBoxIndexOnPcUi(lastBoxIndexOnPcUi: number) {
    this.lastBoxIndexOnPcUi = lastBoxIndexOnPcUi;
  }

  getLastBoxIndexOnPcUi(): number {
    return this.lastBoxIndexOnPcUi;
  }

  setLastBoxSelectionOnPcUi(lastBoxSelectionOnPcUi: { row: number; col: number }) {
    this.lastBoxSelectionOnPcUi = lastBoxSelectionOnPcUi;
  }

  getLastBoxSelectionOnPcUi(): { row: number; col: number } {
    return this.lastBoxSelectionOnPcUi;
  }
  init() {}

  setBaseData(data: GetIngameRes) {
    this.party = [];
    this.pet = null;
    this.boxBgs = [];
    this.boxNames = [];
    this.pcMapping = new Map();

    const party = [];
    for (const pokemon of data.party) {
      if (pokemon) {
        party.push(
          new PlayerPokemon(
            pokemon.idx,
            pokemon.pokedex,
            pokemon.gender,
            pokemon.shiny,
            pokemon.count,
            pokemon.friendShip,
            pokemon.skill,
            pokemon.nickname,
            pokemon.region,
            pokemon.createdLocation,
            pokemon.createdAt,
            pokemon.createdBall,
            pokemon.rank,
            pokemon.evol,
            getPokemonType(pokemon.type_1)!,
            getPokemonType(pokemon.type_2) ? getPokemonType(pokemon.type_2)! : null,
          ),
        );
      } else {
        party.push(null);
      }
    }

    this.party = party;
    this.boxBgs = data.pcBg;
    this.boxNames = data.pcName;
    this.pcMapping = new Map();
  }

  clear() {
    this.party = [];
    this.pet = null;
    this.boxBgs = [];
    this.boxNames = [];
    this.pcMapping = new Map();
  }

  getParty(): (PlayerPokemon | null)[] {
    return this.party;
  }

  getPet(): PlayerPokemon | null {
    return this.pet;
  }

  getBoxBgs(): number[] {
    return this.boxBgs;
  }

  getBoxNames(): string[] {
    return this.boxNames;
  }

  addPokemonAfterCatch(pc: GetPcRes) {
    const mapping = this.pcMapping.get(pc.box);

    if (mapping) {
      const pokemon = mapping.find((p) => p && p.getIdx() === pc.idx) || null;
      if (pokemon) {
        pokemon.setCount(pc.count);
      } else {
        mapping.push(
          new PlayerPokemon(
            pc.idx,
            pc.pokedex,
            pc.gender,
            pc.shiny,
            pc.count,
            pc.friendShip,
            pc.skill,
            pc.nickname,
            pc.region,
            pc.createdLocation,
            pc.createdAt,
            pc.createdBall,
            pc.rank,
            pc.evol,
            getPokemonType(pc.type_1)!,
            getPokemonType(pc.type_2) ? getPokemonType(pc.type_2)! : null,
          ),
        );
      }
    }
  }

  findParty(pokemon: PlayerPokemon) {
    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      const party = this.party[i];
      if (party && party.getIdx() === pokemon.getIdx()) {
        return [party, i];
      }
    }

    return [null, null];
  }

  findSkillsInParty(target: PokemonHiddenMove) {
    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      const party = this.party[i];
      if (party?.getSkill().includes(target)) {
        return party;
      }
    }

    return null;
  }

  registerParty(pokemon: PlayerPokemon) {
    const [isFound] = this.findParty(pokemon);
    if (isFound) {
      console.error('Pokemon is already in the party');
      return false;
    }

    const firstEmptySlotIndex = this.party.indexOf(null);

    if (firstEmptySlotIndex === -1) {
      console.error('Party is full');
      return false;
    }

    const newParty = [...this.party];
    newParty[firstEmptySlotIndex] = pokemon;
    this.party = newParty;

    SocketIO.changeParty(this.party.map((idx) => (idx ? idx.getIdx() : null)));

    return true;
  }

  registerCancelParty(pokemon: PlayerPokemon) {
    const newParty = this.party.filter((partyMember) => {
      if (!partyMember) {
        return false;
      }
      return partyMember.getIdx() !== pokemon.getIdx();
    });

    if (newParty.length === this.party.filter((p) => p !== null).length) {
      console.warn('Pokemon not found in party, nothing to cancel.');
      return;
    }

    while (newParty.length < MAX_PARTY_SLOT) {
      newParty.push(null);
    }

    this.party = newParty;
    SocketIO.changeParty(this.party.map((idx) => (idx ? idx.getIdx() : null)));
  }

  findPet(pokemon: PlayerPokemon) {
    const pet = this.pet;

    if (pet && pet.getIdx() === pokemon.getIdx()) {
      return true;
    }

    return false;
  }

  registerPet(pokemon: PlayerPokemon) {
    const pet = this.pet;

    this.pet = pokemon;
  }

  setPet(pokemon: PlayerPokemon) {
    this.pet = pokemon;
    Event.emit(EVENT.SET_PET);
  }

  registerCancelPet(pokemon: PlayerPokemon) {
    const pet = this.pet;
    this.pet = null;
  }

  cancelPet() {
    this.pet = null;
    Event.emit(EVENT.SET_PET);
  }

  getPcMappingByKey(key: number): (PlayerPokemon | null)[] | null {
    const mapping = this.pcMapping.get(key);
    return mapping || null;
  }

  addPcMappingByKey(key: number, pokemon: PlayerPokemon): void {
    const mapping = this.pcMapping.get(key);
    if (mapping) {
      mapping.push(pokemon);
    }
  }

  createPcMappingByKey(key: number, data: GetPcRes[]) {
    if (this.pcMapping.has(key)) {
      throwError(ErrorCode.FAIL_CREATE_PC_MAPPING);
    }

    this.pcMapping.set(key, []);

    if (data && data.length > 0) {
      const pokemons = data;

      for (const pokemon of pokemons as GetPcRes[]) {
        const addPokemon = new PlayerPokemon(
          pokemon.idx,
          pokemon.pokedex,
          pokemon.gender,
          pokemon.shiny,
          pokemon.count,
          pokemon.friendShip,
          pokemon.skill,
          pokemon.nickname,
          pokemon.region,
          pokemon.createdLocation,
          pokemon.createdAt,
          pokemon.createdBall,
          pokemon.rank,
          pokemon.evol,
          getPokemonType(pokemon.type_1)!,
          getPokemonType(pokemon.type_2)!,
        );

        this.addPcMappingByKey(key, addPokemon);
      }
    }
  }

  resetPcMappingByKey(key: number, data: GetPcRes[]) {
    this.pcMapping.set(key, []);

    if (data && data.length > 0) {
      const pokemons = data;

      for (const pokemon of pokemons as GetPcRes[]) {
        const addPokemon = new PlayerPokemon(
          pokemon.idx,
          pokemon.pokedex,
          pokemon.gender,
          pokemon.shiny,
          pokemon.count,
          pokemon.friendShip,
          pokemon.skill,
          pokemon.nickname,
          pokemon.region,
          pokemon.createdLocation,
          pokemon.createdAt,
          pokemon.createdBall,
          pokemon.rank,
          pokemon.evol,
          getPokemonType(pokemon.type_1)!,
          getPokemonType(pokemon.type_2)!,
        );

        this.addPcMappingByKey(key, addPokemon);
      }
    }
  }

  movePcMappingByKey(idx: number, from: number, to: number) {
    const fromMapping = this.pcMapping.get(from);
    if (!fromMapping) {
      console.error(`Box ${from} does not exist`);
      return;
    }

    const pokemonIndex = fromMapping.findIndex((pokemon) => pokemon && pokemon.getIdx() === idx);
    if (pokemonIndex === -1) {
      console.error(`Pokemon with idx ${idx} not found in box ${from}`);
      return;
    }

    const pokemon = fromMapping[pokemonIndex];
    if (!pokemon) {
      console.error(`Pokemon at index ${pokemonIndex} is null in box ${from}`);
      return;
    }

    let toMapping = this.pcMapping.get(to);
    if (toMapping) {
      toMapping.push(pokemon);
    }

    fromMapping.splice(pokemonIndex, 1);
  }

  restorePetAndParty(target: number, evolvedDataArray: EvolPcRes[]): PlayerPokemon | null {
    let evolvedPokemonData: GetPcRes | null = null;
    for (const data of evolvedDataArray) {
      const found = data.pokemons.find((p) => p.idx === target);
      if (found) {
        evolvedPokemonData = found;
        break;
      }
    }

    if (!evolvedPokemonData) {
      console.warn(`Evolved pokemon with idx ${target} not found in evolved data`);
      return null;
    }

    const evolvedPokemon = new PlayerPokemon(
      evolvedPokemonData.idx,
      evolvedPokemonData.pokedex,
      evolvedPokemonData.gender,
      evolvedPokemonData.shiny,
      evolvedPokemonData.count,
      evolvedPokemonData.friendShip,
      evolvedPokemonData.skill,
      evolvedPokemonData.nickname,
      evolvedPokemonData.region,
      evolvedPokemonData.createdLocation,
      evolvedPokemonData.createdAt,
      evolvedPokemonData.createdBall,
      evolvedPokemonData.rank,
      evolvedPokemonData.evol,
      getPokemonType(evolvedPokemonData.type_1)!,
      getPokemonType(evolvedPokemonData.type_2) ? getPokemonType(evolvedPokemonData.type_2)! : null,
    );

    if (target === this.pet?.getIdx()) {
      this.pet = evolvedPokemon;
      Event.emit(EVENT.SET_PET);
    }

    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      const pokemon = this.party[i];
      if (pokemon && pokemon.getIdx() === target) {
        this.party[i] = evolvedPokemon;
      }
    }

    return evolvedPokemon;
  }
}

export const PC = PcStorage.getInstance();
