import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import type { CostumeData } from '@poposafari/types';
import { ANIMATION, MAP, SFX, TEXTURE, TILE } from '@poposafari/types';
import {
  createAnimationFromFrameNames,
  createSpriteAnimation,
  getSpriteAnimationFrames,
} from '@poposafari/utils';
import { LoadingUi } from './loading.ui';
import { WelcomePhase } from '../welcome/welcome.phase';
import {
  p001Config,
  p002Config,
  p003Config,
  p004Config,
  p005Config,
  p006Config,
  p007Config,
  p008Config,
  p009Config,
  p010Config,
  p011Config,
  p012Config,
  p013Config,
  p014Config,
  p015Config,
  p016Config,
  p017Config,
  p019Config,
  p020Config,
  p021Config,
  p022Config,
  p023Config,
} from '../overworld';

import {
  bigSizePokemonOverworldPokedex,
  femalePokemonFrontPokedex,
  femalePokemonIconPokedex,
  femalePokemonOverworldPokedex,
  pokemonCryNames,
} from '@poposafari/core/master.data.ts';

const MAX_NPC = 1;
const MAX_DOOR = 19;

/** id like "skin_0" | "outfit_0" | "hair_0" -> numeric suffix "0" */
function idToSuffix(id: string): string {
  const match = id.match(/\d+/);
  return match ? match[0] : id;
}

export class LoadingPhase implements IGamePhase {
  private ui!: LoadingUi;

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    this.ui = new LoadingUi(this.scene);
    this.ui.show();

    await this.loadAssets();
    this.createSprite();

    this.scene.switchPhase(new WelcomePhase(this.scene));
  }

  exit(): void {
    this.ui.hide();
    this.ui.destroy();
  }

  private loadMasterData(): void {
    const item = this.scene.cache.json.get('item');
    const pokemon = this.scene.cache.json.get('pokemon');
    const costume = this.scene.cache.json.get('costume');

    this.scene.getMasterData().loadJsonDataFromCache(costume, item, pokemon);
  }

  /** 1차: JSON만 로드(0→50%). 2차: Master 반영 후 포켓몬+나머지(50→100%). */
  private async loadAssets(): Promise<void> {
    return new Promise((resolve) => {
      let phase: 1 | 2 = 1;

      this.scene.load.on('progress', (value: number) => {
        const normalized = phase === 1 ? value * 0.5 : 0.5 + value * 0.5;
        this.ui.setPercentText(normalized);
      });

      this.scene.load.on('fileprogress', (file: Phaser.Loader.File) => {
        this.ui.setAssetText(file.key);
      });

      this.scene.load.on('complete', () => {
        if (phase === 1) {
          phase = 2;
          this.loadMasterData();
          this.loadPokemonAssets();
          this.loadImageAndSprite();
          this.loadMap();
          this.loadAudio();
          this.scene.load.start();
        } else {
          this.scene.load.off('progress');
          this.scene.load.off('fileprogress');
          this.scene.load.off('complete');
          resolve();
        }
      });

      this.loadJson();
      this.scene.load.start();
    });
  }

  private loadJson() {
    this.scene.loadJson('item', 'master', 'item');
    this.scene.loadJson('pokemon', 'master', 'pokemon');
    this.scene.loadJson('costume', 'master', 'costume');
  }

  private loadPokemonAssets(): void {
    let pokedex = '0000';
    let form = '';

    const pokemonKeys = this.scene.getMasterData().getPokemonDataKeys();

    const path = 'ui/pokemons';
    this.scene.load.multiatlas('pokemon.front', `${path}/pokemon.front.json`, path);
    this.scene.load.multiatlas('pokemon.icon', `${path}/pokemon.icon.json`, path);
    this.scene.load.multiatlas('pokemon.overworld', `${path}/pokemon.overworld.json`, path);

    for (const pokemon of pokemonKeys) {
      if (
        !pokemon.includes('mega') &&
        !pokemon.includes('primal') &&
        !pokemon.includes('sunshine') &&
        !pokemon.includes('zen') &&
        !pokemon.includes('ash') &&
        !pokemon.includes('blade') &&
        !pokemon.includes('complete') &&
        !pokemon.includes('school') &&
        !pokemon.includes('ultra') &&
        !pokemon.includes('gulping') &&
        !pokemon.includes('gorging') &&
        !pokemon.includes('noice') &&
        !pokemon.includes('dada') &&
        !pokemon.includes('stella')
      ) {
        if (pokemonCryNames.includes(pokedex))
          this.scene.loadAudio(`${pokedex}`, 'audio/pokemon', `${pokedex}`, 'ogg');
      }
    }
  }

  // private loadPokemonAssets(): void {
  //   console.log('이거 설마? 2번 호출되나?');
  //   let pokedex = '0000';
  //   let form = '';
  //   this.scene.loadImage(`pokemon.front.${pokedex}`, 'ui/pokemon/front', `${pokedex}`);
  //   this.scene.loadAtlas(
  //     `pokemon.icon.${pokedex}`,
  //     'ui/pokemon/icon',
  //     `${pokedex}`,
  //     'pokemon_icon',
  //   );
  //   this.scene.loadAtlas(
  //     `pokemon.overworld.${pokedex}`,
  //     'ui/pokemon/overworld',
  //     `${pokedex}`,
  //     `pokemon_overworld_0`,
  //   );

  //   for (const pokemon of this.scene.getMasterData().getPokemonDataKeys()) {
  //     const firstUnderscoreIndex = pokemon.indexOf('_');
  //     let pokedex = pokemon;
  //     form = '';
  //     if (firstUnderscoreIndex !== -1) {
  //       pokedex = pokemon.substring(0, firstUnderscoreIndex);
  //       form = '_' + pokemon.substring(firstUnderscoreIndex + 1);
  //     }

  //     this.scene.loadImage(`pokemon.front.${pokedex}${form}`, 'ui/pokemon/front', `${pokemon}`);
  //     this.scene.loadImage(
  //       `pokemon.front.${pokedex}s${form}`,
  //       'ui/pokemon/front/shiny',
  //       `${pokemon}`,
  //     );

  //     if (femalePokemonFrontPokedex.includes(pokedex)) {
  //       this.scene.loadImage(
  //         `pokemon.front.${pokedex}${form}_female`,
  //         'ui/pokemon/front',
  //         `${pokemon}`,
  //       );
  //       this.scene.loadImage(
  //         `pokemon.front.${pokedex}s${form}_female`,
  //         'ui/pokemon/front/shiny',
  //         `${pokemon}`,
  //       );
  //     }

  //     this.scene.loadAtlas(
  //       `pokemon.icon.${pokedex}${form}`,
  //       'ui/pokemon/icon',
  //       `${pokemon}`,
  //       'pokemon_icon',
  //     );
  //     this.scene.loadAtlas(
  //       `pokemon.icon.${pokedex}s${form}`,
  //       'ui/pokemon/icon/shiny',
  //       `${pokemon}`,
  //       'pokemon_icon',
  //     );

  //     if (femalePokemonIconPokedex.includes(pokedex)) {
  //       this.scene.loadAtlas(
  //         `pokemon.icon.${pokedex}${form}_female`,
  //         'ui/pokemon/icon',
  //         `${pokemon}`,
  //         'pokemon_icon',
  //       );
  //       this.scene.loadAtlas(
  //         `pokemon.icon.${pokedex}s${form}_female`,
  //         'ui/pokemon/icon/shiny',
  //         `${pokemon}`,
  //         'pokemon_icon',
  //       );
  //     }

  //     if (
  //       !pokemon.includes('mega') &&
  //       !pokemon.includes('primal') &&
  //       !pokemon.includes('sunshine') &&
  //       !pokemon.includes('zen') &&
  //       !pokemon.includes('ash') &&
  //       !pokemon.includes('blade') &&
  //       !pokemon.includes('complete') &&
  //       !pokemon.includes('school') &&
  //       !pokemon.includes('ultra') &&
  //       !pokemon.includes('gulping') &&
  //       !pokemon.includes('gorging') &&
  //       !pokemon.includes('noice') &&
  //       !pokemon.includes('dada') &&
  //       !pokemon.includes('stella')
  //     ) {
  //       if (pokemonCryNames.includes(pokedex))
  //         this.scene.loadAudio(`${pokedex}`, 'audio/pokemon', `${pokedex}`, 'ogg');

  //       if (bigSizePokemonOverworldPokedex.includes(pokedex)) {
  //         this.scene.loadAtlas(
  //           `pokemon.overworld.${pokedex}${form}`,
  //           'ui/pokemon/overworld',
  //           `${pokemon}`,
  //           `pokemon_overworld_1`,
  //         );
  //         this.scene.loadAtlas(
  //           `pokemon.overworld.${pokedex}s${form}`,
  //           'ui/pokemon/overworld/shiny',
  //           `${pokemon}`,
  //           `pokemon_overworld_1`,
  //         );

  //         if (femalePokemonOverworldPokedex.includes(pokedex)) {
  //           this.scene.loadAtlas(
  //             `pokemon.overworld.${pokedex}${form}_female`,
  //             'ui/pokemon/overworld',
  //             `${pokemon}`,
  //             `pokemon_overworld_1`,
  //           );
  //           this.scene.loadAtlas(
  //             `pokemon.overworld.${pokedex}s${form}_female`,
  //             'ui/pokemon/overworld/shiny',
  //             `${pokemon}`,
  //             `pokemon_overworld_1`,
  //           );
  //         }
  //       } else {
  //         this.scene.loadAtlas(
  //           `pokemon.overworld.${pokedex}${form}`,
  //           'ui/pokemon/overworld',
  //           `${pokemon}`,
  //           `pokemon_overworld_0`,
  //         );
  //         this.scene.loadAtlas(
  //           `pokemon.overworld.${pokedex}s${form}`,
  //           'ui/pokemon/overworld/shiny',
  //           `${pokemon}`,
  //           `pokemon_overworld_0`,
  //         );

  //         if (femalePokemonOverworldPokedex.includes(pokedex)) {
  //           this.scene.loadAtlas(
  //             `pokemon.overworld.${pokedex}${form}_female`,
  //             'ui/pokemon/overworld',
  //             `${pokemon}`,
  //             `pokemon_overworld_0`,
  //           );
  //           this.scene.loadAtlas(
  //             `pokemon.overworld.${pokedex}s${form}_female`,
  //             'ui/pokemon/overworld/shiny',
  //             `${pokemon}`,
  //             `pokemon_overworld_0`,
  //           );
  //         }
  //       }
  //     }
  //   }
  // }

  /** pokemon.icon 텍스처의 _0, _1 프레임을 그룹별로 애니메이션 등록 (Texture Packer 패킹 결과 기준) */
  private createPokemonIconAnimations(): void {
    const textureKey = 'pokemon.icon';
    const texture = this.scene.textures.get(textureKey);
    if (!texture || !texture.getFrameNames) return;

    const frameNames = texture.getFrameNames();
    const byBase = new Map<string, string[]>();

    for (const name of frameNames) {
      const match = name.match(/^(.+)_[01]$/);
      const base = match ? match[1] : name;
      if (!byBase.has(base)) byBase.set(base, []);
      byBase.get(base)!.push(name);
    }

    for (const [base, frames] of byBase) {
      const sorted = frames.sort((a, b) => a.localeCompare(b));
      const animKey = `pokemon.icon.${base}`;
      createAnimationFromFrameNames(this.scene, textureKey, animKey, sorted, 6, -1);
    }
  }

  /** pokemon.overworld: 0~3=DOWN, 4~7=LEFT, 8~11=RIGHT, 12~15=UP. 방향별 애니메이션 등록 */
  private createPokemonOverworldAnimations(): void {
    const textureKey = 'pokemon.overworld';
    const texture = this.scene.textures.get(textureKey);
    if (!texture?.getFrameNames) return;

    const frameNames = texture.getFrameNames();
    const byBase = new Map<string, Map<number, string>>();

    for (const name of frameNames) {
      const match = name.match(/^(.+)_(\d+)$/);
      if (!match) continue;
      const base = match[1];
      const index = parseInt(match[2], 10);
      if (index < 0 || index > 15) continue;
      if (!byBase.has(base)) byBase.set(base, new Map());
      byBase.get(base)!.set(index, name);
    }

    const directionRanges = [
      ['down', 0, 3],
      ['left', 4, 7],
      ['right', 8, 11],
      ['up', 12, 15],
    ] as const;

    for (const [base, indexToFrame] of byBase) {
      for (const [dir, start, end] of directionRanges) {
        const frames: string[] = [];
        for (let i = start; i <= end; i++) {
          const frame = indexToFrame.get(i);
          if (!frame) break;
          frames.push(frame);
        }
        if (frames.length === end - start + 1) {
          const animKey = `pokemon.overworld.${base}.${dir}`;
          createAnimationFromFrameNames(this.scene, textureKey, animKey, frames, 8, -1);
        }
      }
    }
  }

  private loadPlayerCostumeAssets(): void {
    const costume = this.scene.getMasterData().getCostume();
    const backBase = 'ui/players/back';
    const overworldBase = 'ui/players/overworld';

    // --- back ---
    for (const skinId of costume.skin) {
      const s = idToSuffix(skinId);
      this.scene.loadAtlas(
        `player_back_m_skin_${s}`,
        `${backBase}/skin`,
        `m_skin_${s}`,
        ANIMATION.PLAYER_BACK_SKIN,
        backBase,
      );
      this.scene.loadAtlas(
        `player_back_f_skin_${s}`,
        `${backBase}/skin`,
        `f_skin_${s}`,
        ANIMATION.PLAYER_BACK_SKIN,
        backBase,
      );
    }
    for (const g of ['m', 'f'] as const) {
      const genderKey = g === 'm' ? 'male' : 'female';
      const data = costume[genderKey];
      for (const outfitId of data.outfits) {
        const s = idToSuffix(outfitId);
        this.scene.loadAtlas(
          `player_back_${g}_outfit_${s}`,
          `${backBase}/outfit`,
          `${g}_outfit_${s}`,
          ANIMATION.PLAYER_BACK_SKIN,
          backBase,
        );
      }
      for (const row of data.hairs) {
        const [hairId, ...colors] = row;
        const hairSuffix = idToSuffix(hairId);
        for (const color of colors) {
          this.scene.loadAtlas(
            `player_back_${g}_hair_${hairSuffix}_${color}`,
            `${backBase}/hair`,
            `${g}_hair_${hairSuffix}_${color}`,
            ANIMATION.PLAYER_BACK_SKIN,
            backBase,
          );
        }
      }
    }

    // --- overworld (skin: no m/f in filename; outfit/hair: m/f) ---
    for (const skinId of costume.skin) {
      const s = idToSuffix(skinId);
      this.scene.loadAtlas(
        `player_overworld_skin_${s}`,
        `${overworldBase}/skin`,
        skinId,
        ANIMATION.PLAYER_OVERWORLD_SKIN,
        overworldBase,
      );
    }
    for (const g of ['m', 'f'] as const) {
      const genderKey = g === 'm' ? 'male' : 'female';
      const data = costume[genderKey];
      for (const outfitId of data.outfits) {
        const s = idToSuffix(outfitId);
        this.scene.loadAtlas(
          `player_overworld_${g}_outfit_${s}`,
          `${overworldBase}/outfit`,
          `${g}_outfit_${s}`,
          ANIMATION.PLAYER_OVERWORLD_SKIN,
          overworldBase,
        );
      }
      for (const row of data.hairs) {
        const [hairId, ...colors] = row;
        const hairSuffix = idToSuffix(hairId);
        for (const color of colors) {
          this.scene.loadAtlas(
            `player_overworld_${g}_hair_${hairSuffix}_${color}`,
            `${overworldBase}/hair`,
            `${g}_hair_${hairSuffix}_${color}`,
            ANIMATION.PLAYER_OVERWORLD_SKIN,
            overworldBase,
          );
        }
      }
    }
  }

  private loadImageAndSprite() {
    this.scene.loadImage(TEXTURE.BG_1, 'ui/bgs', 'bg_1');
    this.scene.loadImage(TEXTURE.BG_2, 'ui/bgs', 'bg_2');
    this.scene.loadImage(TEXTURE.BG_3, 'ui/bgs', 'bg_3');
    this.scene.loadImage(TEXTURE.BG_4, 'ui/bgs', 'bg_4');
    this.scene.loadImage(TEXTURE.BG_5, 'ui/bgs', 'bg_5');
    this.scene.loadImage(TEXTURE.BG_6, 'ui/bgs', 'bg_6');
    this.scene.loadImage(TEXTURE.BG_BLACK, 'ui/bgs', 'bg_black');

    this.scene.loadImage(TEXTURE.BLANK, 'ui', 'blank');

    this.scene.loadImage(TEXTURE.WINDOW_1, 'ui/windows', 'window_1');
    this.scene.loadImage(TEXTURE.WINDOW_2, 'ui/windows', 'window_2');
    this.scene.loadImage(TEXTURE.WINDOW_3, 'ui/windows', 'window_3');
    this.scene.loadImage(TEXTURE.WINDOW_GUIDE, 'ui/windows', 'window_guide');
    this.scene.loadImage(TEXTURE.WINDOW_WHITE, 'ui/windows', 'window_white');
    this.scene.loadImage(TEXTURE.WINDOW_CURSOR, 'ui/windows', 'window_cursor');
    this.scene.loadImage(TEXTURE.WINDOW_HUD, 'ui/windows', 'window_hud');
    this.scene.loadImage(TEXTURE.WINDOW_NOTICE_0, 'ui/windows', 'window_notice_0');
    this.scene.loadImage(TEXTURE.WINDOW_NOTICE_1, 'ui/windows', 'window_notice_1');

    this.scene.loadImage(TEXTURE.KEYCAP, 'ui', 'keycap');

    this.scene.loadImage(TEXTURE.SLIDER, 'ui', 'slider');
    this.scene.loadImage(TEXTURE.SLIDER_BG, 'ui', 'slider_b');

    this.scene.loadImage(TEXTURE.ICON_CHECK, 'ui/icons', 'icon_check');
    this.scene.loadImage(TEXTURE.ICON_RUNNING, 'ui/icons', 'icon_running');
    this.scene.loadImage(TEXTURE.ICON_CANCEL, 'ui/icons', 'icon_cancel');
    this.scene.loadImage(TEXTURE.ICON_POKEDEX, 'ui/icons', 'icon_pokedex');
    this.scene.loadImage(TEXTURE.ICON_PC, 'ui/icons', 'icon_pc');
    this.scene.loadImage(TEXTURE.ICON_BAG_M, 'ui/icons', 'icon_bag_m');
    this.scene.loadImage(TEXTURE.ICON_BAG_F, 'ui/icons', 'icon_bag_f');
    this.scene.loadImage(TEXTURE.ICON_OPTION, 'ui/icons', 'icon_option');
    this.scene.loadImage(TEXTURE.ICON_EXIT, 'ui/icons', 'icon_exit');
    this.scene.loadImage(TEXTURE.ICON_MENU, 'ui/icons', 'icon_menu');
    this.scene.loadImage(TEXTURE.ICON_TALK, 'ui/icons', 'icon_talk');
    this.scene.loadImage(TEXTURE.ICON_LOCATION, 'ui/icons', 'icon_location');
    this.scene.loadImage(TEXTURE.ICON_MONEY, 'ui/icons', 'icon_money');
    this.scene.loadImage(TEXTURE.ICON_XY, 'ui/icons', 'icon_xy');
    this.scene.loadImage(TEXTURE.ICON_CANDY, 'ui/icons', 'icon_candy');
    this.scene.loadImage(TEXTURE.ICON_DAWN, 'ui/icons', 'icon_dawn');
    this.scene.loadImage(TEXTURE.ICON_DAY, 'ui/icons', 'icon_day');
    this.scene.loadImage(TEXTURE.ICON_DUSK, 'ui/icons', 'icon_dusk');
    this.scene.loadImage(TEXTURE.ICON_NIGHT, 'ui/icons', 'icon_night');

    this.scene.loadImage(TEXTURE.OVERWORLD_SHADOW, 'ui', 'overworld_shadow');

    this.loadPlayerCostumeAssets();

    //npc
    for (let i = 0; i <= MAX_NPC; i++) {
      this.scene.loadAtlas(`npc${i}`, 'ui/npcs', `npc${i}`, ANIMATION.NPC, 'ui/npcs');
    }

    //door
    for (let i = 0; i <= MAX_DOOR; i++) {
      this.scene.loadAtlas(`door${i}`, 'ui/doors', `door_${i}`, ANIMATION.DOOR, 'ui/doors');
    }
  }

  private loadMap() {
    this.scene.loadImage(TILE.INDOOR_FLOOR, 'ui/maps', TILE.INDOOR_FLOOR);
    this.scene.loadImage(TILE.INDOOR_OBJECT, 'ui/maps', TILE.INDOOR_OBJECT);
    this.scene.loadImage(TILE.INDOOR_EVENT, 'ui/maps', TILE.INDOOR_EVENT);

    this.scene.loadImage(TILE.OUTDOOR_FLOOR, 'ui/maps', TILE.OUTDOOR_FLOOR);
    this.scene.loadImage(TILE.OUTDOOR_OBJECT, 'ui/maps', TILE.OUTDOOR_OBJECT);
    this.scene.loadImage(TILE.OUTDOOR_EDGE, 'ui/maps', TILE.OUTDOOR_EDGE);
    this.scene.loadImage(TILE.OUTDOOR_OBJECT_URBAN, 'ui/maps', TILE.OUTDOOR_OBJECT_URBAN);
    this.scene.loadImage(TILE.OUTDOOR_URBAN, 'ui/maps', TILE.OUTDOOR_URBAN);
    this.scene.loadImage(TILE.OUTDOOR_EVENT, 'ui/maps', TILE.OUTDOOR_EVENT);

    //plaza
    this.scene.loadMap(MAP.PLAZA_001, 'ui/maps', MAP.PLAZA_001);
    this.scene.loadMap(MAP.PLAZA_002, 'ui/maps', MAP.PLAZA_002);
    this.scene.loadMap(MAP.PLAZA_003, 'ui/maps', MAP.PLAZA_003);
    this.scene.loadMap(MAP.PLAZA_004, 'ui/maps', MAP.PLAZA_004);
    this.scene.loadMap(MAP.PLAZA_005, 'ui/maps', MAP.PLAZA_005);
    this.scene.loadMap(MAP.PLAZA_006, 'ui/maps', MAP.PLAZA_006);
    this.scene.loadMap(MAP.PLAZA_007, 'ui/maps', MAP.PLAZA_007);
    this.scene.loadMap(MAP.PLAZA_008, 'ui/maps', MAP.PLAZA_008);
    this.scene.loadMap(MAP.PLAZA_009, 'ui/maps', MAP.PLAZA_009);
    this.scene.loadMap(MAP.PLAZA_010, 'ui/maps', MAP.PLAZA_010);
    this.scene.loadMap(MAP.PLAZA_011, 'ui/maps', MAP.PLAZA_011);
    this.scene.loadMap(MAP.PLAZA_012, 'ui/maps', MAP.PLAZA_012);
    this.scene.loadMap(MAP.PLAZA_013, 'ui/maps', MAP.PLAZA_013);
    this.scene.loadMap(MAP.PLAZA_014, 'ui/maps', MAP.PLAZA_014);
    this.scene.loadMap(MAP.PLAZA_015, 'ui/maps', MAP.PLAZA_015);
    this.scene.loadMap(MAP.PLAZA_016, 'ui/maps', MAP.PLAZA_016);
    this.scene.loadMap(MAP.PLAZA_017, 'ui/maps', MAP.PLAZA_017);
    this.scene.loadMap(MAP.PLAZA_019, 'ui/maps', MAP.PLAZA_019);
    this.scene.loadMap(MAP.PLAZA_020, 'ui/maps', MAP.PLAZA_020);
    this.scene.loadMap(MAP.PLAZA_021, 'ui/maps', MAP.PLAZA_021);
    this.scene.loadMap(MAP.PLAZA_022, 'ui/maps', MAP.PLAZA_022);
    this.scene.loadMap(MAP.PLAZA_023, 'ui/maps', MAP.PLAZA_023);

    // register maps
    const mapRegistry = this.scene.getMapRegistry();
    mapRegistry.register(p001Config);
    mapRegistry.register(p002Config);
    mapRegistry.register(p003Config);
    mapRegistry.register(p004Config);
    mapRegistry.register(p005Config);
    mapRegistry.register(p006Config);
    mapRegistry.register(p007Config);
    mapRegistry.register(p008Config);
    mapRegistry.register(p009Config);
    mapRegistry.register(p010Config);
    mapRegistry.register(p011Config);
    mapRegistry.register(p012Config);
    mapRegistry.register(p013Config);
    mapRegistry.register(p014Config);
    mapRegistry.register(p015Config);
    mapRegistry.register(p016Config);
    mapRegistry.register(p017Config);
    mapRegistry.register(p019Config);
    mapRegistry.register(p020Config);
    mapRegistry.register(p021Config);
    mapRegistry.register(p022Config);
    mapRegistry.register(p023Config);
  }

  private loadAudio() {
    this.scene.loadAudio(SFX.OPEN_0, 'audio/se', 'open_0', 'ogg');
    this.scene.loadAudio(SFX.CURSOR_0, 'audio/se', 'cursor_0', 'ogg');
    this.scene.loadAudio(SFX.BUZZER, 'audio/se', 'buzzer', 'ogg');
    this.scene.loadAudio(SFX.DOOR_0, 'audio/se', 'door_0', 'ogg');
    this.scene.loadAudio(SFX.DOOR_1, 'audio/se', 'door_1', 'ogg');
    this.scene.loadAudio(SFX.DOOR_2, 'audio/se', 'door_2', 'ogg');
    this.scene.loadAudio(SFX.CONGRATULATIONS, 'audio/se', 'cong', 'ogg');
    this.scene.loadAudio(SFX.GET_0, 'audio/se', 'get_0', 'ogg');
  }

  private createSprite() {
    this.createPlayerOverworldSprite();
    this.createPlayerBackSprite();
    this.createNpcSprite();
    this.createDoorSprite();
    this.createPokemonIconAnimations();
    this.createPokemonOverworldAnimations();
  }

  private createDoorSprite() {
    for (let i = 0; i <= MAX_DOOR; i++) {
      createSpriteAnimation(this.scene, `door${i}`, ANIMATION.DOOR);
    }
  }

  private getOverworldTextureKeys(): string[] {
    const c = this.scene.getMasterData().getCostume();
    const keys: string[] = [];
    for (const skinId of c.skin) keys.push(`player_overworld_skin_${idToSuffix(skinId)}`);
    for (const g of ['m', 'f'] as const) {
      const data = c[g === 'm' ? 'male' : 'female'];
      for (const outfitId of data.outfits)
        keys.push(`player_overworld_${g}_outfit_${idToSuffix(outfitId)}`);
      for (const row of data.hairs) {
        const [hairId, ...colors] = row;
        const s = idToSuffix(hairId);
        for (const color of colors) keys.push(`player_overworld_${g}_hair_${s}_${color}`);
      }
    }
    return keys;
  }

  private getBackTextureKeys(): string[] {
    const c = this.scene.getMasterData().getCostume();
    const keys: string[] = [];
    for (const skinId of c.skin) {
      keys.push(
        `player_back_m_skin_${idToSuffix(skinId)}`,
        `player_back_f_skin_${idToSuffix(skinId)}`,
      );
    }
    for (const g of ['m', 'f'] as const) {
      const data = c[g === 'm' ? 'male' : 'female'];
      for (const outfitId of data.outfits)
        keys.push(`player_back_${g}_outfit_${idToSuffix(outfitId)}`);
      for (const row of data.hairs) {
        const [hairId, ...colors] = row;
        const s = idToSuffix(hairId);
        for (const color of colors) keys.push(`player_back_${g}_hair_${s}_${color}`);
      }
    }
    return keys;
  }

  private createPlayerOverworldSprite() {
    const overworldTextures = this.getOverworldTextureKeys();

    for (const texture of overworldTextures) {
      createSpriteAnimation(this.scene, texture, ANIMATION.PLAYER_OVERWORLD_SKIN);

      const frames = getSpriteAnimationFrames(this.scene, texture, ANIMATION.PLAYER_OVERWORLD_SKIN);

      //walk frames
      const walkDown = [
        [frames[1], frames[0]],
        [frames[3], frames[2]],
      ];
      const walkLeft = [
        [frames[5], frames[4]],
        [frames[7], frames[6]],
      ];
      const walkRight = [
        [frames[9], frames[8]],
        [frames[11], frames[10]],
      ];
      const walkUp = [
        [frames[13], frames[12]],
        [frames[15], frames[14]],
      ];

      //running frames
      const runningDown = [
        [frames[17], frames[16]],
        [frames[19], frames[18]],
        [frames[18], frames[18]],
      ];
      const runningLeft = [
        [frames[21], frames[20]],
        [frames[23], frames[22]],
        [frames[22], frames[22]],
      ];
      const runningRight = [
        [frames[25], frames[24]],
        [frames[27], frames[26]],
        [frames[26], frames[26]],
      ];
      const runningUp = [
        [frames[29], frames[28]],
        [frames[31], frames[30]],
        [frames[30], frames[30]],
      ];

      //ride frames
      const rideDown = [
        [frames[34], frames[34]],
        [frames[33], frames[32]],
        [frames[34], frames[34]],
        [frames[35], frames[34]],
        [frames[34], frames[34]],
      ];
      const rideLeft = [
        [frames[38], frames[38]],
        [frames[37], frames[36]],
        [frames[38], frames[38]],
        [frames[39], frames[38]],
        [frames[38], frames[38]],
      ];
      const rideRight = [
        [frames[42], frames[42]],
        [frames[41], frames[40]],
        [frames[42], frames[42]],
        [frames[43], frames[42]],
        [frames[42], frames[42]],
      ];
      const rideUp = [
        [frames[46], frames[46]],
        [frames[45], frames[44]],
        [frames[46], frames[46]],
        [frames[47], frames[46]],
        [frames[46], frames[46]],
      ];

      //surf frames
      const surfDown = [
        [frames[49], frames[48]],
        [frames[51], frames[50]],
      ];
      const surfLeft = [
        [frames[53], frames[52]],
        [frames[55], frames[54]],
      ];
      const surfRight = [
        [frames[57], frames[56]],
        [frames[59], frames[58]],
      ];
      const surfUp = [
        [frames[61], frames[60]],
        [frames[63], frames[62]],
      ];

      //fishing frames
      const fishingDown = [
        [frames[65], frames[64]],
        [frames[67], frames[66]],
      ];
      const fishingLeft = [
        [frames[69], frames[68]],
        [frames[71], frames[70]],
      ];
      const fishingRight = [
        [frames[73], frames[72]],
        [frames[75], frames[74]],
      ];
      const fishingUp = [
        [frames[77], frames[76]],
        [frames[79], frames[78]],
      ];

      // ==================================================================================
      // Walk Animations
      // ==================================================================================
      createSpriteAnimation(
        this.scene,
        texture + '_walk' + '_down_0',
        ANIMATION.PLAYER_OVERWORLD_WALK_DOWN + '_0',
        walkDown[0],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_walk' + '_down_1',
        ANIMATION.PLAYER_OVERWORLD_WALK_DOWN + '_1',
        walkDown[1],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_walk' + '_left_0',
        ANIMATION.PLAYER_OVERWORLD_WALK_LEFT + '_0',
        walkLeft[0],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_walk' + '_left_1',
        ANIMATION.PLAYER_OVERWORLD_WALK_LEFT + '_1',
        walkLeft[1],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_walk' + '_right_0',
        ANIMATION.PLAYER_OVERWORLD_WALK_RIGHT + '_0',
        walkRight[0],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_walk' + '_right_1',
        ANIMATION.PLAYER_OVERWORLD_WALK_RIGHT + '_1',
        walkRight[1],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_walk' + '_up_0',
        ANIMATION.PLAYER_OVERWORLD_WALK_UP + '_0',
        walkUp[0],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_walk' + '_up_1',
        ANIMATION.PLAYER_OVERWORLD_WALK_UP + '_1',
        walkUp[1],
      );

      // ==================================================================================
      // Running Animations
      // ==================================================================================
      createSpriteAnimation(
        this.scene,
        texture + '_running' + '_down_0',
        ANIMATION.PLAYER_OVERWORLD_RUNNING_DOWN + '_0',
        runningDown[0],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_running' + '_down_1',
        ANIMATION.PLAYER_OVERWORLD_RUNNING_DOWN + '_1',
        runningDown[1],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_running' + '_down_2',
        ANIMATION.PLAYER_OVERWORLD_RUNNING_DOWN + '_2',
        runningDown[2],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_running' + '_left_0',
        ANIMATION.PLAYER_OVERWORLD_RUNNING_LEFT + '_0',
        runningLeft[0],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_running' + '_left_1',
        ANIMATION.PLAYER_OVERWORLD_RUNNING_LEFT + '_1',
        runningLeft[1],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_running' + '_left_2',
        ANIMATION.PLAYER_OVERWORLD_RUNNING_LEFT + '_2',
        runningLeft[2],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_running' + '_right_0',
        ANIMATION.PLAYER_OVERWORLD_RUNNING_RIGHT + '_0',
        runningRight[0],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_running' + '_right_1',
        ANIMATION.PLAYER_OVERWORLD_RUNNING_RIGHT + '_1',
        runningRight[1],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_running' + '_right_2',
        ANIMATION.PLAYER_OVERWORLD_RUNNING_RIGHT + '_2',
        runningRight[2],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_running' + '_up_0',
        ANIMATION.PLAYER_OVERWORLD_RUNNING_UP + '_0',
        runningUp[0],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_running' + '_up_1',
        ANIMATION.PLAYER_OVERWORLD_RUNNING_UP + '_1',
        runningUp[1],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_running' + '_up_2',
        ANIMATION.PLAYER_OVERWORLD_RUNNING_UP + '_2',
        runningUp[2],
      );

      // ==================================================================================
      // Ride Animations
      // ==================================================================================
      createSpriteAnimation(
        this.scene,
        texture + '_ride' + '_down_0',
        ANIMATION.PLAYER_OVERWORLD_RIDE_DOWN + '_0',
        rideDown[0],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_ride' + '_down_1',
        ANIMATION.PLAYER_OVERWORLD_RIDE_DOWN + '_1',
        rideDown[1],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_ride' + '_down_2',
        ANIMATION.PLAYER_OVERWORLD_RIDE_DOWN + '_2',
        rideDown[2],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_ride' + '_down_3',
        ANIMATION.PLAYER_OVERWORLD_RIDE_DOWN + '_3',
        rideDown[3],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_ride' + '_down_4',
        ANIMATION.PLAYER_OVERWORLD_RIDE_DOWN + '_4',
        rideDown[4],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_ride' + '_left_0',
        ANIMATION.PLAYER_OVERWORLD_RIDE_LEFT + '_0',
        rideLeft[0],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_ride' + '_left_1',
        ANIMATION.PLAYER_OVERWORLD_RIDE_LEFT + '_1',
        rideLeft[1],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_ride' + '_left_2',
        ANIMATION.PLAYER_OVERWORLD_RIDE_LEFT + '_2',
        rideLeft[2],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_ride' + '_left_3',
        ANIMATION.PLAYER_OVERWORLD_RIDE_LEFT + '_3',
        rideLeft[3],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_ride' + '_left_4',
        ANIMATION.PLAYER_OVERWORLD_RIDE_LEFT + '_4',
        rideLeft[4],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_ride' + '_right_0',
        ANIMATION.PLAYER_OVERWORLD_RIDE_RIGHT + '_0',
        rideRight[0],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_ride' + '_right_1',
        ANIMATION.PLAYER_OVERWORLD_RIDE_RIGHT + '_1',
        rideRight[1],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_ride' + '_right_2',
        ANIMATION.PLAYER_OVERWORLD_RIDE_RIGHT + '_2',
        rideRight[2],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_ride' + '_right_3',
        ANIMATION.PLAYER_OVERWORLD_RIDE_RIGHT + '_3',
        rideRight[3],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_ride' + '_right_4',
        ANIMATION.PLAYER_OVERWORLD_RIDE_RIGHT + '_4',
        rideRight[4],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_ride' + '_up_0',
        ANIMATION.PLAYER_OVERWORLD_RIDE_UP + '_0',
        rideUp[0],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_ride' + '_up_1',
        ANIMATION.PLAYER_OVERWORLD_RIDE_UP + '_1',
        rideUp[1],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_ride' + '_up_2',
        ANIMATION.PLAYER_OVERWORLD_RIDE_UP + '_2',
        rideUp[2],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_ride' + '_up_3',
        ANIMATION.PLAYER_OVERWORLD_RIDE_UP + '_3',
        rideUp[3],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_ride' + '_up_4',
        ANIMATION.PLAYER_OVERWORLD_RIDE_UP + '_4',
        rideUp[4],
      );

      // ==================================================================================
      // Surf Animations
      // ==================================================================================
      createSpriteAnimation(
        this.scene,
        texture + '_surf' + '_down_0',
        ANIMATION.PLAYER_OVERWORLD_SURF_DOWN + '_0',
        surfDown[0],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_surf' + '_down_1',
        ANIMATION.PLAYER_OVERWORLD_SURF_DOWN + '_1',
        surfDown[1],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_surf' + '_left_0',
        ANIMATION.PLAYER_OVERWORLD_SURF_LEFT + '_0',
        surfLeft[0],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_surf' + '_left_1',
        ANIMATION.PLAYER_OVERWORLD_SURF_LEFT + '_1',
        surfLeft[1],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_surf' + '_right_0',
        ANIMATION.PLAYER_OVERWORLD_SURF_RIGHT + '_0',
        surfRight[0],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_surf' + '_right_1',
        ANIMATION.PLAYER_OVERWORLD_SURF_RIGHT + '_1',
        surfRight[1],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_surf' + '_up_0',
        ANIMATION.PLAYER_OVERWORLD_SURF_UP + '_0',
        surfUp[0],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_surf' + '_up_1',
        ANIMATION.PLAYER_OVERWORLD_SURF_UP + '_1',
        surfUp[1],
      );

      // ==================================================================================
      // Fishing Animations
      // ==================================================================================
      createSpriteAnimation(
        this.scene,
        texture + '_fishing' + '_down_0',
        ANIMATION.PLAYER_OVERWORLD_FISHING_DOWN + '_0',
        fishingDown[0],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_fishing' + '_down_1',
        ANIMATION.PLAYER_OVERWORLD_FISHING_DOWN + '_1',
        fishingDown[1],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_fishing' + '_left_0',
        ANIMATION.PLAYER_OVERWORLD_FISHING_LEFT + '_0',
        fishingLeft[0],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_fishing' + '_left_1',
        ANIMATION.PLAYER_OVERWORLD_FISHING_LEFT + '_1',
        fishingLeft[1],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_fishing' + '_right_0',
        ANIMATION.PLAYER_OVERWORLD_FISHING_RIGHT + '_0',
        fishingRight[0],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_fishing' + '_right_1',
        ANIMATION.PLAYER_OVERWORLD_FISHING_RIGHT + '_1',
        fishingRight[1],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_fishing' + '_up_0',
        ANIMATION.PLAYER_OVERWORLD_FISHING_UP + '_0',
        fishingUp[0],
      );
      createSpriteAnimation(
        this.scene,
        texture + '_fishing' + '_up_1',
        ANIMATION.PLAYER_OVERWORLD_FISHING_UP + '_1',
        fishingUp[1],
      );
    }
  }

  private createPlayerBackSprite() {
    const textures = this.getBackTextureKeys();

    for (const texture of textures) {
      createSpriteAnimation(this.scene, texture, ANIMATION.PLAYER_BACK_SKIN);
    }
  }

  private createNpcSprite() {
    for (let i = 0; i <= MAX_NPC; i++) {
      createSpriteAnimation(this.scene, `npc${i}`, ANIMATION.NPC);
    }
  }

  private createPokemonIconSprite() {}

  private createPokemonOverworldSprite() {}

  onRefreshLanguage(): void {
    this.ui.onRefreshLanguage();
  }
}
