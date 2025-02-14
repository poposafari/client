import { itemData } from '../data/items';
import { npcData } from '../data/npc';
import { pokemonData } from '../data/pokemon';
import { ANIMATION } from '../enums/animation';
import { AREA } from '../enums/area';
import { TEXTURE } from '../enums/texture';
import { TIME } from '../enums/time';
import { initI18n } from '../i18n';
import { BaseScene } from './base-scene';

export class LoadingScene extends BaseScene {
  constructor() {
    super('LoadingScene');
  }

  async preload() {
    console.log('LoadingScene preload()');

    await initI18n();

    this.loadImage(TEXTURE.INFO_BOX, 'ui', TEXTURE.INFO_BOX);

    this.loadImage(TEXTURE.WINDOW_0, 'ui/windows', TEXTURE.WINDOW_0);
    this.loadImage(TEXTURE.WINDOW_1, 'ui/windows', TEXTURE.WINDOW_1);
    this.loadImage(TEXTURE.WINDOW_2, 'ui/windows', TEXTURE.WINDOW_2);
    this.loadImage(TEXTURE.WINDOW_3, 'ui/windows', TEXTURE.WINDOW_3);
    this.loadImage(TEXTURE.WINDOW_4, 'ui/windows', TEXTURE.WINDOW_4);
    this.loadImage(TEXTURE.WINDOW_5, 'ui/windows', TEXTURE.WINDOW_5);
    this.loadImage(TEXTURE.WINDOW_6, 'ui/windows', TEXTURE.WINDOW_6);
    this.loadImage(TEXTURE.WINDOW_7, 'ui/windows', TEXTURE.WINDOW_7);
    this.loadImage(TEXTURE.WINDOW_8, 'ui/windows', TEXTURE.WINDOW_8);
    this.loadImage(TEXTURE.WINDOW_9, 'ui/windows', TEXTURE.WINDOW_9);
    this.loadImage(TEXTURE.WINDOW_10, 'ui/windows', TEXTURE.WINDOW_10);
    this.loadImage(TEXTURE.WINDOW_11, 'ui/windows', TEXTURE.WINDOW_11);

    this.loadImage(TEXTURE.BG_LOBBY, 'ui', 'bg_lobby');

    this.loadAtlas(TEXTURE.PAUSE_BLACK, 'ui', TEXTURE.PAUSE_BLACK, ANIMATION.PAUSE_BLACK);
    this.loadAtlas(TEXTURE.PAUSE_WHITE, 'ui', TEXTURE.PAUSE_WHITE, ANIMATION.PAUSE_WHITE);

    this.loadImage(TEXTURE.BAR, 'ui', TEXTURE.BAR);
    this.loadImage(TEXTURE.BAR_S, 'ui', TEXTURE.BAR_S);

    this.loadImage(TEXTURE.GENDER_0, 'ui', TEXTURE.GENDER_0);
    this.loadImage(TEXTURE.GENDER_1, 'ui', TEXTURE.GENDER_1);

    this.loadImage(TEXTURE.SELECT, 'ui', TEXTURE.SELECT);

    this.loadImage(TEXTURE.BOY_1_STATUE, 'ui/character/statue', 'boy_1');
    this.loadImage(TEXTURE.BOY_2_STATUE, 'ui/character/statue', 'boy_2');
    this.loadImage(TEXTURE.BOY_3_STATUE, 'ui/character/statue', 'boy_3');
    this.loadImage(TEXTURE.BOY_4_STATUE, 'ui/character/statue', 'boy_4');

    this.loadImage(TEXTURE.GIRL_1_STATUE, 'ui/character/statue', 'girl_1');
    this.loadImage(TEXTURE.GIRL_2_STATUE, 'ui/character/statue', 'girl_2');
    this.loadImage(TEXTURE.GIRL_3_STATUE, 'ui/character/statue', 'girl_3');
    this.loadImage(TEXTURE.GIRL_4_STATUE, 'ui/character/statue', 'girl_4');

    this.loadAtlas(TEXTURE.BOY_1_MOVEMENT, 'ui/character/movement', 'boy_1', ANIMATION.PLAYER_MOVEMENT);
    this.loadAtlas(TEXTURE.BOY_2_MOVEMENT, 'ui/character/movement', 'boy_2', ANIMATION.PLAYER_MOVEMENT);
    this.loadAtlas(TEXTURE.BOY_3_MOVEMENT, 'ui/character/movement', 'boy_3', ANIMATION.PLAYER_MOVEMENT);
    this.loadAtlas(TEXTURE.BOY_4_MOVEMENT, 'ui/character/movement', 'boy_4', ANIMATION.PLAYER_MOVEMENT);

    this.loadAtlas(TEXTURE.GIRL_1_MOVEMENT, 'ui/character/movement', 'girl_1', ANIMATION.PLAYER_MOVEMENT);
    this.loadAtlas(TEXTURE.GIRL_2_MOVEMENT, 'ui/character/movement', 'girl_2', ANIMATION.PLAYER_MOVEMENT);
    this.loadAtlas(TEXTURE.GIRL_3_MOVEMENT, 'ui/character/movement', 'girl_3', ANIMATION.PLAYER_MOVEMENT);
    this.loadAtlas(TEXTURE.GIRL_4_MOVEMENT, 'ui/character/movement', 'girl_4', ANIMATION.PLAYER_MOVEMENT);

    this.loadAtlas(TEXTURE.BOY_1_RIDE, 'ui/character/ride', 'boy_1', ANIMATION.PLAYER_RIDE);
    this.loadAtlas(TEXTURE.BOY_2_RIDE, 'ui/character/ride', 'boy_2', ANIMATION.PLAYER_RIDE);
    this.loadAtlas(TEXTURE.BOY_3_RIDE, 'ui/character/ride', 'boy_3', ANIMATION.PLAYER_RIDE);
    this.loadAtlas(TEXTURE.BOY_4_RIDE, 'ui/character/ride', 'boy_4', ANIMATION.PLAYER_RIDE);

    this.loadAtlas(TEXTURE.GIRL_1_RIDE, 'ui/character/ride', 'girl_1', ANIMATION.PLAYER_RIDE);
    this.loadAtlas(TEXTURE.GIRL_2_RIDE, 'ui/character/ride', 'girl_2', ANIMATION.PLAYER_RIDE);
    this.loadAtlas(TEXTURE.GIRL_3_RIDE, 'ui/character/ride', 'girl_3', ANIMATION.PLAYER_RIDE);
    this.loadAtlas(TEXTURE.GIRL_4_RIDE, 'ui/character/ride', 'girl_4', ANIMATION.PLAYER_RIDE);

    this.loadAtlas(TEXTURE.BOY_1_BACK, 'ui/character/back', 'boy_1', ANIMATION.BOY_1_BACK);
    this.loadAtlas(TEXTURE.BOY_2_BACK, 'ui/character/back', 'boy_2', ANIMATION.BOY_2_BACK);
    this.loadAtlas(TEXTURE.BOY_3_BACK, 'ui/character/back', 'boy_3', ANIMATION.BOY_3_BACK);
    this.loadAtlas(TEXTURE.BOY_4_BACK, 'ui/character/back', 'boy_4', ANIMATION.BOY_4_BACK);

    this.loadAtlas(TEXTURE.GIRL_1_BACK, 'ui/character/back', 'girl_1', ANIMATION.GIRL_1_BACK);
    this.loadAtlas(TEXTURE.GIRL_2_BACK, 'ui/character/back', 'girl_2', ANIMATION.GIRL_2_BACK);
    this.loadAtlas(TEXTURE.GIRL_3_BACK, 'ui/character/back', 'girl_3', ANIMATION.GIRL_3_BACK);
    this.loadAtlas(TEXTURE.GIRL_4_BACK, 'ui/character/back', 'girl_4', ANIMATION.GIRL_4_BACK);

    this.loadImage(TEXTURE.ARROW, 'ui', TEXTURE.ARROW);

    this.loadImage(TEXTURE.BLACK, 'ui', TEXTURE.BLACK);
    this.loadImage(TEXTURE.SEASON_0, 'ui', TEXTURE.SEASON_0);
    this.loadImage(TEXTURE.SEASON_1, 'ui', TEXTURE.SEASON_1);
    this.loadImage(TEXTURE.SEASON_2, 'ui', TEXTURE.SEASON_2);
    this.loadImage(TEXTURE.SEASON_3, 'ui', TEXTURE.SEASON_3);

    this.loadImage(TEXTURE.MAP_L0, 'ui/map', TEXTURE.MAP_L0);
    this.loadImage(TEXTURE.MAP_L1_0, 'ui/map', TEXTURE.MAP_L1_0);
    this.loadMap(TEXTURE.MAP_000, 'ui/map', TEXTURE.MAP_000);
    this.loadMap(TEXTURE.MAP_011, 'ui/map', TEXTURE.MAP_011);

    this.loadImage(TEXTURE.MENU_BOX, 'ui', TEXTURE.MENU_BOX);
    this.loadImage(TEXTURE.MENU_BAG, 'ui', TEXTURE.MENU_BAG);
    this.loadImage(TEXTURE.MENU_POKEDEX, 'ui', TEXTURE.MENU_POKEDEX);
    this.loadImage(TEXTURE.MENU_CARD, 'ui', TEXTURE.MENU_CARD);
    this.loadImage(TEXTURE.MENU_DOLL, 'ui', TEXTURE.MENU_DOLL);
    this.loadImage(TEXTURE.MENU_CHAT, 'ui', TEXTURE.MENU_CHAT);
    this.loadImage(TEXTURE.MENU_LOCATION, 'ui', TEXTURE.MENU_LOCATION);
    this.loadImage(TEXTURE.MENU_MONEY, 'ui', TEXTURE.MENU_MONEY);
    this.loadImage(TEXTURE.MENU_TITLE, 'ui', TEXTURE.MENU_TITLE);
    this.loadImage(TEXTURE.MENU_ICON, 'ui', TEXTURE.MENU_ICON);
    this.loadImage(TEXTURE.MENU_SHOES, 'ui', TEXTURE.MENU_SHOES);

    this.loadImage(TEXTURE.BG_BAG, 'ui', TEXTURE.BG_BAG);
    this.loadImage(TEXTURE.XBOX, 'ui', TEXTURE.XBOX);

    this.loadImage(TEXTURE.ITEM_BOX, 'ui', TEXTURE.ITEM_BOX);
    this.loadImage(TEXTURE.ITEM_BOX_S, 'ui', TEXTURE.ITEM_BOX_S);

    this.loadImage(TEXTURE.CHOICE, 'ui', TEXTURE.CHOICE);
    this.loadImage(TEXTURE.CHOICE_S, 'ui', TEXTURE.CHOICE_S);

    this.loadImage(TEXTURE.CANCEL, 'ui', TEXTURE.CANCEL);
    this.loadImage(TEXTURE.CANCEL_S, 'ui', TEXTURE.CANCEL_S);

    this.loadImage(TEXTURE.BAG, 'ui', TEXTURE.BAG);
    this.loadImage(TEXTURE.BAG_REG, 'ui', TEXTURE.BAG_REG);
    this.loadAtlas(TEXTURE.BAG1, 'ui', TEXTURE.BAG1, ANIMATION.BAG1);
    this.loadAtlas(TEXTURE.BAG2, 'ui', TEXTURE.BAG2, ANIMATION.BAG2);
    this.loadAtlas(TEXTURE.BAG3, 'ui', TEXTURE.BAG3, ANIMATION.BAG3);
    this.loadAtlas(TEXTURE.BAG4, 'ui', TEXTURE.BAG4, ANIMATION.BAG4);

    this.loadImage(TEXTURE.BG_BOX, 'ui', TEXTURE.BG_BOX);
    this.loadImage(TEXTURE.WINDOW_BOX, 'ui', TEXTURE.WINDOW_BOX);
    this.loadImage(TEXTURE.WINDOW_BOX_STORAGE, 'ui', TEXTURE.WINDOW_BOX_STORAGE);
    this.loadImage(TEXTURE.BOX_NAME, 'ui', TEXTURE.BOX_NAME);
    this.loadImage(TEXTURE.BOX_DESC, 'ui', TEXTURE.BOX_DESC);

    this.loadImage(TEXTURE.FINGER, 'ui', TEXTURE.FINGER);
    this.loadImage(TEXTURE.BLANK, 'ui', TEXTURE.BLANK);
    this.loadImage(TEXTURE.SHINY, 'ui', TEXTURE.SHINY);

    this.loadAtlas(TEXTURE.TYPES, 'ui', TEXTURE.TYPES, TEXTURE.TYPES);

    this.loadImage(TEXTURE.ARROW_W_R, 'ui', TEXTURE.ARROW_W_R);
    this.loadImage(TEXTURE.ARROW_B_R, 'ui', TEXTURE.ARROW_B_R);

    this.loadAtlas(TEXTURE.POKEMON_CALL, 'ui', TEXTURE.POKEMON_CALL, ANIMATION.POKEMON_CALL);
    this.loadAtlas(TEXTURE.POKEMON_RECALL, 'ui', TEXTURE.POKEMON_RECALL, ANIMATION.POKEMON_RECALL);

    this.loadAtlas(TEXTURE.POKEBALL_THROW, 'ui', TEXTURE.POKEBALL_THROW, ANIMATION.POKEBALL_THROW);
    this.loadAtlas(TEXTURE.POKEBALL_GROUND, 'ui', TEXTURE.POKEBALL_GROUND, ANIMATION.POKEBALL_GROUND);
    this.loadAtlas(TEXTURE.POKEBALL, 'ui', TEXTURE.POKEBALL, ANIMATION.POKEBALL);

    this.loadImage(TEXTURE.SHADOW, 'ui', TEXTURE.SHADOW);

    this.loadImage(TEXTURE.KEY_S, 'ui', TEXTURE.KEY_S);
    this.loadImage(TEXTURE.KEY_R, 'ui', TEXTURE.KEY_R);

    this.loadAtlas(TEXTURE.EMOTION_0, 'ui', TEXTURE.EMOTION_0, ANIMATION.EMOTION_0);

    this.loadImage(TEXTURE.ENEMY_INFO, 'ui', TEXTURE.ENEMY_INFO);

    for (const key of Object.keys(itemData)) {
      this.loadImage(`item${key}`, 'ui/item', `item${key}`);
    }

    for (const key of Object.keys(npcData)) {
      this.loadAtlas(`${key}`, 'ui/character/npc', `${key}`, `npc`);
    }

    let pokemonIdx = 1;
    for (const pokemon of Object.keys(pokemonData)) {
      this.loadImage(`pokemon_sprite${pokemon}`, 'ui/pokemon/sprite', `${pokemonIdx}`);
      this.loadImage(`pokemon_sprite${pokemon}s`, 'ui/pokemon/sprite/shiny', `${pokemonIdx}`);

      this.loadAtlas(`pokemon_icon${pokemon}`, 'ui/pokemon/icon', `icon${pokemon}`, 'pokemon_icon');
      this.loadAtlas(`pokemon_icon${pokemon}s`, 'ui/pokemon/icon', `icon${pokemon}s`, 'pokemon_icon');

      this.loadAtlas(`pokemon_overworld${pokemon}`, 'ui/pokemon/overworld', `${pokemon}`, `pokemon_overworld_0`);
      this.loadAtlas(`pokemon_overworld${pokemon}s`, 'ui/pokemon/overworld', `${pokemon}s`, `pokemon_overworld_0`);

      pokemonIdx++;
    }

    Object.values(AREA).forEach((area) => {
      Object.values(TIME).forEach((time) => {
        this.loadImage(`bg_${area}_${time}`, 'ui/battle', `bg_${area}_${time}`);
        this.loadImage(`eb_${area}_${time}`, 'ui/battle', `eb_${area}_${time}`);
        this.loadImage(`pb_${area}_${time}`, 'ui/battle', `pb_${area}_${time}`);
      });
    });

    this.load.on('complete', () => {
      this.startInGameScene();
    });

    this.load.start();
  }

  private startInGameScene() {
    this.scene.start('InGameScene');
  }
}
