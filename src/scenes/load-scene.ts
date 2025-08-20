import { itemData } from '../data/items';
import { npcData } from '../data/npc';
import { females, PokemonData } from '../data/pokemon';
import { ANIMATION } from '../enums/animation';
import { AREA } from '../enums/area';
import { AUDIO } from '../enums/audio';
import { TEXTURE } from '../enums/texture';
import { TIME } from '../enums/time';
import { initI18n } from '../i18n';
import { addBackground, addImage } from '../uis/ui';
import { createZeroPad } from '../utils/string-util';
import { BaseScene } from './base-scene';

export class LoadingScene extends BaseScene {
  private bg!: Phaser.GameObjects.Image;
  private title!: Phaser.GameObjects.Image;

  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private percentText!: Phaser.GameObjects.Text;
  private assetText!: Phaser.GameObjects.Text;

  constructor() {
    super('LoadingScene');
  }

  async preload() {
    console.log('LoadingScene preload()');

    await initI18n();

    this.loadImage(TEXTURE.INFO_BOX, 'ui', TEXTURE.INFO_BOX);

    this.loadImage(TEXTURE.LOGO_0, 'ui', TEXTURE.LOGO_0);
    this.loadImage(TEXTURE.BG_LOAD, 'ui', TEXTURE.BG_LOAD);

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
    this.loadImage(TEXTURE.WINDOW_19, 'ui/windows', TEXTURE.WINDOW_19);
    this.loadImage(TEXTURE.WINDOW_20, 'ui/windows', TEXTURE.WINDOW_20);
    this.loadImage(TEXTURE.WINDOW_REWARD, 'ui/windows', TEXTURE.WINDOW_REWARD);
    this.loadImage(TEXTURE.REWARD, 'ui', TEXTURE.REWARD);
    this.loadImage(TEXTURE.OVERLAY_0, 'ui', TEXTURE.OVERLAY_0);

    this.loadImage(TEXTURE.BOX_NAME, 'ui/box', TEXTURE.BOX_NAME);
    this.loadImage(TEXTURE.BOX_DESC, 'ui/box', TEXTURE.BOX_DESC);

    this.loadImage(TEXTURE.BG_LOBBY, 'ui', 'bg_lobby');

    this.loadAtlas(TEXTURE.PAUSE_BLACK, 'ui', TEXTURE.PAUSE_BLACK, ANIMATION.PAUSE_BLACK);
    this.loadAtlas(TEXTURE.PAUSE_WHITE, 'ui', TEXTURE.PAUSE_WHITE, ANIMATION.PAUSE_WHITE);

    this.loadImage(TEXTURE.BAR, 'ui', TEXTURE.BAR);
    this.loadImage(TEXTURE.BAR_S, 'ui', TEXTURE.BAR_S);

    this.loadImage(TEXTURE.GENDER_0, 'ui', TEXTURE.GENDER_0);
    this.loadImage(TEXTURE.GENDER_1, 'ui', TEXTURE.GENDER_1);

    this.loadImage(TEXTURE.SELECT, 'ui', TEXTURE.SELECT);

    this.loadImage(TEXTURE.BG_HM, 'ui', TEXTURE.BG_HM);

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

    this.loadAtlas(TEXTURE.SURF, 'ui/character/surf', 'surf', ANIMATION.SURF);
    this.loadAtlas(TEXTURE.BOY_1_SURF, 'ui/character/surf', 'boy_1', ANIMATION.PLAYER_SURF);
    this.loadAtlas(TEXTURE.BOY_2_SURF, 'ui/character/surf', 'boy_2', ANIMATION.PLAYER_SURF);
    this.loadAtlas(TEXTURE.BOY_3_SURF, 'ui/character/surf', 'boy_3', ANIMATION.PLAYER_SURF);
    this.loadAtlas(TEXTURE.BOY_4_SURF, 'ui/character/surf', 'boy_4', ANIMATION.PLAYER_SURF);

    this.loadAtlas(TEXTURE.GIRL_1_SURF, 'ui/character/surf', 'girl_1', ANIMATION.PLAYER_SURF);
    this.loadAtlas(TEXTURE.GIRL_2_SURF, 'ui/character/surf', 'girl_2', ANIMATION.PLAYER_SURF);
    this.loadAtlas(TEXTURE.GIRL_3_SURF, 'ui/character/surf', 'girl_3', ANIMATION.PLAYER_SURF);
    this.loadAtlas(TEXTURE.GIRL_4_SURF, 'ui/character/surf', 'girl_4', ANIMATION.PLAYER_SURF);

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

    this.loadAtlas(TEXTURE.BOY_1_HM, 'ui/character/hm', 'boy_1', ANIMATION.PLAYER_HM);
    this.loadAtlas(TEXTURE.BOY_2_HM, 'ui/character/hm', 'boy_2', ANIMATION.PLAYER_HM);
    this.loadAtlas(TEXTURE.BOY_3_HM, 'ui/character/hm', 'boy_3', ANIMATION.PLAYER_HM);
    this.loadAtlas(TEXTURE.BOY_4_HM, 'ui/character/hm', 'boy_4', ANIMATION.PLAYER_HM);

    this.loadAtlas(TEXTURE.GIRL_1_HM, 'ui/character/hm', 'girl_1', ANIMATION.PLAYER_HM);
    this.loadAtlas(TEXTURE.GIRL_2_HM, 'ui/character/hm', 'girl_2', ANIMATION.PLAYER_HM);
    this.loadAtlas(TEXTURE.GIRL_3_HM, 'ui/character/hm', 'girl_3', ANIMATION.PLAYER_HM);
    this.loadAtlas(TEXTURE.GIRL_4_HM, 'ui/character/hm', 'girl_4', ANIMATION.PLAYER_HM);

    this.loadImage(TEXTURE.ARROW, 'ui', TEXTURE.ARROW);

    this.loadImage(TEXTURE.BLACK, 'ui', TEXTURE.BLACK);
    this.loadImage(TEXTURE.SEASON_0, 'ui', TEXTURE.SEASON_0);
    this.loadImage(TEXTURE.SEASON_1, 'ui', TEXTURE.SEASON_1);
    this.loadImage(TEXTURE.SEASON_2, 'ui', TEXTURE.SEASON_2);
    this.loadImage(TEXTURE.SEASON_3, 'ui', TEXTURE.SEASON_3);

    this.loadMap(TEXTURE.OVERWORLD_001, 'ui/map', TEXTURE.OVERWORLD_001);
    this.loadMap(TEXTURE.OVERWORLD_002, 'ui/map', TEXTURE.OVERWORLD_002);
    this.loadMap(TEXTURE.OVERWORLD_003, 'ui/map', TEXTURE.OVERWORLD_003);
    this.loadMap(TEXTURE.OVERWORLD_021, 'ui/map', TEXTURE.OVERWORLD_021);
    this.loadImage(TEXTURE.OUTDOOR_TILE_FLOOR, 'ui/map', TEXTURE.OUTDOOR_TILE_FLOOR);
    this.loadImage(TEXTURE.OUTDOOR_TILE_EDGE, 'ui/map', TEXTURE.OUTDOOR_TILE_EDGE);
    this.loadImage(TEXTURE.OUTDOOR_TILE_OBJECT, 'ui/map', TEXTURE.OUTDOOR_TILE_OBJECT);
    this.loadImage(TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, 'ui/map', TEXTURE.OUTDOOR_TILE_OBJECT_URBAN);
    this.loadImage(TEXTURE.OUTDOOR_TILE_URBAN, 'ui/map', TEXTURE.OUTDOOR_TILE_URBAN);
    this.loadImage(TEXTURE.INDOOR_TILE_FLOOR, 'ui/map', TEXTURE.INDOOR_TILE_FLOOR);
    this.loadImage(TEXTURE.INDOOR_TILE_OBJECT, 'ui/map', TEXTURE.INDOOR_TILE_OBJECT);

    this.loadImage(TEXTURE.MENU_POKEBOX, 'ui/menu', TEXTURE.MENU_POKEBOX);
    this.loadImage(TEXTURE.MENU_BAG_BOY, 'ui/menu', TEXTURE.MENU_BAG_BOY);
    this.loadImage(TEXTURE.MENU_BAG_GIRL, 'ui/menu', TEXTURE.MENU_BAG_GIRL);
    this.loadImage(TEXTURE.MENU_PROFILE, 'ui/menu', TEXTURE.MENU_PROFILE);
    this.loadImage(TEXTURE.MENU_OPTION, 'ui/menu', TEXTURE.MENU_OPTION);
    this.loadImage(TEXTURE.MENU_EXIT, 'ui/menu', TEXTURE.MENU_EXIT);
    this.loadImage(TEXTURE.MENU_SHOES, 'ui/menu', TEXTURE.MENU_SHOES);
    this.loadImage(TEXTURE.MENU_LOCATION, 'ui/menu', TEXTURE.MENU_LOCATION);
    this.loadImage(TEXTURE.MENU_MONEY, 'ui/menu', TEXTURE.MENU_MONEY);
    this.loadImage(TEXTURE.MENU_ICON, 'ui/menu', TEXTURE.MENU_ICON);
    this.loadImage(TEXTURE.MENU_CANDY, 'ui/menu', TEXTURE.MENU_CANDY);

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
    this.loadImage(TEXTURE.BAG_BAR, 'ui', TEXTURE.BAG_BAR);
    this.loadAtlas(TEXTURE.BAG1, 'ui', TEXTURE.BAG1, ANIMATION.BAG1);
    this.loadAtlas(TEXTURE.BAG2, 'ui', TEXTURE.BAG2, ANIMATION.BAG2);
    this.loadAtlas(TEXTURE.BAG3, 'ui', TEXTURE.BAG3, ANIMATION.BAG3);
    this.loadAtlas(TEXTURE.BAG4, 'ui', TEXTURE.BAG4, ANIMATION.BAG4);

    this.loadImage(TEXTURE.BG_BOX, 'ui/box', TEXTURE.BG_BOX);
    this.loadImage(TEXTURE.WINDOW_BOX, 'ui', TEXTURE.WINDOW_BOX);

    this.loadImage(TEXTURE.FINGER, 'ui', TEXTURE.FINGER);
    this.loadImage(TEXTURE.BLANK, 'ui', TEXTURE.BLANK);
    this.loadImage(TEXTURE.SHINY, 'ui', TEXTURE.SHINY);

    this.loadAtlas(TEXTURE.TYPES, 'ui', TEXTURE.TYPES, TEXTURE.TYPES);
    this.loadAtlas(TEXTURE.TYPES_1, 'ui/battle', TEXTURE.TYPES_1, TEXTURE.TYPES_1);

    this.loadImage(TEXTURE.ARROW_RED, 'ui', TEXTURE.ARROW_RED);
    this.loadImage(TEXTURE.ARROW_W_R, 'ui', TEXTURE.ARROW_W_R);
    this.loadImage(TEXTURE.ARROW_B_R, 'ui', TEXTURE.ARROW_B_R);
    this.loadImage(TEXTURE.ARROW_BOX, 'ui/box', TEXTURE.ARROW_BOX);

    this.loadAtlas(TEXTURE.POKEMON_CALL, 'ui', TEXTURE.POKEMON_CALL, ANIMATION.POKEMON_CALL);
    this.loadAtlas(TEXTURE.POKEMON_RECALL, 'ui', TEXTURE.POKEMON_RECALL, ANIMATION.POKEMON_RECALL);

    this.loadAtlas(TEXTURE.POKEBALL_THROW, 'ui', TEXTURE.POKEBALL_THROW, ANIMATION.POKEBALL_THROW);
    this.loadAtlas(TEXTURE.POKEBALL_GROUND, 'ui', TEXTURE.POKEBALL_GROUND, ANIMATION.POKEBALL_GROUND);
    this.loadAtlas(TEXTURE.POKEBALL, 'ui', TEXTURE.POKEBALL, ANIMATION.POKEBALL);

    this.loadAtlas(TEXTURE.SHADOW, 'ui', TEXTURE.SHADOW, ANIMATION.SHADOW);
    this.loadAtlas(TEXTURE.SHADOW_WATER, 'ui', TEXTURE.SHADOW_WATER, ANIMATION.SHADOW_WATER);

    this.loadImage(TEXTURE.KEY_S, 'ui', TEXTURE.KEY_S);
    this.loadImage(TEXTURE.KEY_R, 'ui', TEXTURE.KEY_R);

    this.loadAtlas(TEXTURE.EMOTION_0, 'ui', TEXTURE.EMOTION_0, ANIMATION.EMOTION_0);
    this.loadAtlas(TEXTURE.EMO, 'ui', TEXTURE.EMO, ANIMATION.EMO);

    this.loadImage(TEXTURE.ENEMY_INFO, 'ui', TEXTURE.ENEMY_INFO);

    this.loadAtlas(TEXTURE.OVERWORLD_SHINY, 'ui', TEXTURE.OVERWORLD_SHINY, ANIMATION.OVERWORLD_SHINY);

    this.loadImage(TEXTURE.BOXBALL_001, 'ui/box', TEXTURE.BOXBALL_001);
    this.loadImage(TEXTURE.BOXBALL_002, 'ui/box', TEXTURE.BOXBALL_002);
    this.loadImage(TEXTURE.BOXBALL_003, 'ui/box', TEXTURE.BOXBALL_003);
    this.loadImage(TEXTURE.BOXBALL_004, 'ui/box', TEXTURE.BOXBALL_004);

    this.loadImage(TEXTURE.SYMBOL, 'ui', TEXTURE.SYMBOL);

    this.loadImage(TEXTURE.OWNED, 'ui/battle', TEXTURE.OWNED);
    this.loadImage(TEXTURE.ENEMY_BAR, 'ui/battle', TEXTURE.ENEMY_BAR);

    this.loadAtlas(TEXTURE.SPARKLE, 'ui', TEXTURE.SPARKLE, ANIMATION.SPARKLE);

    this.loadImage(TEXTURE.GOOGLE, 'ui', TEXTURE.GOOGLE);
    this.loadImage(TEXTURE.DISCORD, 'ui', TEXTURE.DISCORD);

    this.loadImage(TEXTURE.BG_HIDDEN_MOVE, 'ui', TEXTURE.BG_HIDDEN_MOVE);

    this.loadImage(TEXTURE.PARTICLE_HM_0, 'ui/particle', TEXTURE.PARTICLE_HM_0);
    this.loadImage(TEXTURE.PARTICLE_HM_1, 'ui/particle', TEXTURE.PARTICLE_HM_1);
    this.loadImage(TEXTURE.PARTICLE_EVOL, 'ui/particle', TEXTURE.PARTICLE_EVOL);

    this.loadImage(TEXTURE.BG_EVOLVE, 'ui', TEXTURE.BG_EVOLVE);

    this.loadAudio(AUDIO.SELECT_0, 'audio', AUDIO.SELECT_0, 'ogg');
    this.loadAudio(AUDIO.SELECT_1, 'audio', AUDIO.SELECT_1, 'ogg');
    this.loadAudio(AUDIO.SELECT_2, 'audio', AUDIO.SELECT_2, 'wav');
    this.loadAudio(AUDIO.OPEN_0, 'audio', AUDIO.OPEN_0, 'wav');
    this.loadAudio(AUDIO.OPEN_1, 'audio', AUDIO.OPEN_1, 'ogg');
    this.loadAudio(AUDIO.CANCEL_0, 'audio', AUDIO.CANCEL_0, 'ogg');
    this.loadAudio(AUDIO.CANCEL_1, 'audio', AUDIO.CANCEL_1, 'ogg');
    this.loadAudio(AUDIO.GET_0, 'audio', AUDIO.GET_0, 'ogg');
    this.loadAudio(AUDIO.BUY, 'audio', AUDIO.BUY, 'ogg');
    this.loadAudio(AUDIO.JUMP, 'audio', AUDIO.JUMP, 'ogg');
    this.loadAudio(AUDIO.REACTION_0, 'audio', AUDIO.REACTION_0, 'ogg');
    this.loadAudio(AUDIO.THROW, 'audio', AUDIO.THROW, 'ogg');
    this.loadAudio(AUDIO.BALL_CATCH, 'audio', AUDIO.BALL_CATCH, 'ogg');
    this.loadAudio(AUDIO.BALL_DROP, 'audio', AUDIO.BALL_DROP, 'ogg');
    this.loadAudio(AUDIO.BALL_ENTER, 'audio', AUDIO.BALL_ENTER, 'ogg');
    this.loadAudio(AUDIO.BALL_ENTER, 'audio', AUDIO.BALL_ENTER, 'ogg');
    this.loadAudio(AUDIO.BALL_EXIT, 'audio', AUDIO.BALL_EXIT, 'ogg');
    this.loadAudio(AUDIO.BALL_SHAKE, 'audio', AUDIO.BALL_SHAKE, 'ogg');
    this.loadAudio(AUDIO.BUZZER, 'audio', AUDIO.BUZZER, 'ogg');
    this.loadAudio(AUDIO.REWARD, 'audio', AUDIO.REWARD, 'ogg');
    this.loadAudio(AUDIO.FLEE, 'audio', AUDIO.FLEE, 'ogg');
    this.loadAudio(AUDIO.SHINY, 'audio', AUDIO.SHINY, 'wav');
    this.loadAudio(AUDIO.EVOL_INTRO, 'audio', AUDIO.EVOL_INTRO, 'ogg');
    this.loadAudio(AUDIO.EVOL, 'audio', AUDIO.EVOL, 'ogg');
    this.loadAudio(AUDIO.CONG, 'audio', AUDIO.CONG, 'ogg');
    this.loadAudio(AUDIO.HATCH, 'audio', AUDIO.HATCH, 'wav');
    this.loadAudio(AUDIO.DOOR_ENTER, 'audio', AUDIO.DOOR_ENTER, 'ogg');

    const maxBox = 15;
    for (let i = 0; i <= maxBox; i++) {
      this.loadImage(`box${i}`, 'ui/box', `box${i}`);
    }

    for (const key of Object.keys(itemData)) {
      this.loadImage(`item${key}`, 'ui/item', `item${key}`);
    }

    for (const key of Object.keys(npcData)) {
      this.loadAtlas(`${key}`, 'ui/character/npc', `${key}`, `npc`);
    }

    this.loadImage(`pokemon_sprite000`, 'ui/pokemon/sprite', `0`);
    this.loadAtlas(`pokemon_icon000`, 'ui/pokemon/icon', `0`, 'pokemon_icon');
    this.loadAtlas(`pokemon_overworld000`, 'ui/pokemon/overworld', '0', `pokemon_overworld_0`);

    for (const pokemon of Object.keys(PokemonData)) {
      const pokedex = createZeroPad(Number(pokemon));

      this.loadImage(`pokemon_sprite${pokedex}_m`, 'ui/pokemon/sprite', `${pokemon}`);
      this.loadImage(`pokemon_sprite${pokedex}_ms`, 'ui/pokemon/sprite/shiny', `${pokemon}`);

      if (females.includes(Number(pokemon))) {
        this.loadImage(`pokemon_sprite${pokedex}_f`, 'ui/pokemon/sprite/female', `${pokemon}`);
        this.loadImage(`pokemon_sprite${pokedex}_fs`, 'ui/pokemon/sprite/female/shiny', `${pokemon}`);
      } else {
        this.loadImage(`pokemon_sprite${pokedex}_f`, 'ui/pokemon/sprite', `${pokemon}`);
        this.loadImage(`pokemon_sprite${pokedex}_fs`, 'ui/pokemon/sprite/shiny', `${pokemon}`);
      }

      this.loadAtlas(`pokemon_icon${pokedex}`, 'ui/pokemon/icon', `${pokemon}`, 'pokemon_icon');
      this.loadAtlas(`pokemon_icon${pokedex}s`, 'ui/pokemon/icon/shiny', `${pokemon}s`, 'pokemon_icon');

      this.loadAtlas(`pokemon_overworld${pokedex}`, 'ui/pokemon/overworld', `${pokemon}`, `pokemon_overworld_0`);
      this.loadAtlas(`pokemon_overworld${pokedex}s`, 'ui/pokemon/overworld', `${pokemon}s`, `pokemon_overworld_0`);
    }

    Object.values(AREA).forEach((area) => {
      Object.values(TIME).forEach((time) => {
        this.loadImage(`bg_${area}_${time}`, 'ui/battle', `bg_${area}_${time}`);
        this.loadImage(`eb_${area}_${time}`, 'ui/battle', `eb_${area}_${time}`);
        this.loadImage(`pb_${area}_${time}`, 'ui/battle', `pb_${area}_${time}`);
      });
    });

    this.createLoadingBar();

    this.load.on('filecomplete', (key: string) => {
      if (key === TEXTURE.BG_LOAD) {
        this.createBg();
        this.children.sendToBack(this.bg);
      }

      if (key === TEXTURE.LOGO_0) {
        this.createTitle();
        this.children.sendToBack(this.bg);
      }
    });

    this.load.on('progress', (value: number) => {
      this.percentText.setText(`${parseInt(String(value * 100), 10)}%`);
    });

    this.load.on('fileprogress', (file: Phaser.Loader.File) => {
      this.assetText.setText(`Loading asset: ${file.key}`);
    });

    this.load.on('complete', () => {
      this.startInGameScene();
    });

    this.load.start();
  }

  private startInGameScene() {
    this.scene.start('InGameScene');
  }

  private createBg() {
    this.bg = addBackground(this, TEXTURE.BG_LOAD);
  }

  private createTitle() {
    const { width, height } = this.cameras.main;

    this.title = addImage(this, TEXTURE.LOGO_0, width / 2, height / 2 - 100);
    this.title.setScale(2.4);
  }

  private createLoadingBar() {
    const { width, height } = this.cameras.main;

    this.percentText = this.make.text({
      x: width / 2,
      y: height / 2 + 30,
      text: '0%',
      style: {
        font: '100px font_4',
        color: '#ffffff',
      },
    });
    this.percentText.setOrigin(0.5, 0.5);

    this.assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 110,
      text: 'ASSET_0',
      style: {
        font: '60px font_4',
        color: '#ffffff',
      },
    });
    this.assetText.setOrigin(0.5, 0.5);
  }
}
