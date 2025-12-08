import { females, itemData, npcData, PokemonData } from '../data';
import { ANIMATION, AUDIO, BATTLE_AREA, TEXTURE, TIME } from '../enums';
import { initI18n } from '../i18n';
import { addBackground, addImage } from '../uis/ui';
import { createZeroPad } from '../utils/string-util';
import { BaseScene } from './base-scene';
import { Game } from '../core/manager/game-manager';

export class LoadingScene extends BaseScene {
  private bg!: Phaser.GameObjects.Image;
  private title!: Phaser.GameObjects.Image;
  private percentText!: Phaser.GameObjects.Text;
  private assetText!: Phaser.GameObjects.Text;

  constructor() {
    super('LoadingScene');
  }

  async preload() {
    await initI18n();

    //windows
    this.loadImage(TEXTURE.WINDOW_BAG, 'ui/windows', TEXTURE.WINDOW_BAG);
    this.loadImage(TEXTURE.WINDOW_BAG_O, 'ui/windows', TEXTURE.WINDOW_BAG_O);
    this.loadImage(TEXTURE.WINDOW_SYS, 'ui/windows', TEXTURE.WINDOW_SYS);
    this.loadImage(TEXTURE.WINDOW_MENU, 'ui/windows', TEXTURE.WINDOW_MENU);
    this.loadImage(TEXTURE.WINDOW_MENU_S, 'ui/windows', TEXTURE.WINDOW_MENU_S);
    this.loadImage(TEXTURE.WINDOW_RED, 'ui/windows', TEXTURE.WINDOW_RED);
    this.loadImage(TEXTURE.WINDOW_WHITE, 'ui/windows', TEXTURE.WINDOW_WHITE);
    this.loadImage(TEXTURE.WINDOW_OPACITY, 'ui/windows', TEXTURE.WINDOW_OPACITY);
    this.loadImage(TEXTURE.REWARD_WINDOW, 'ui/windows', TEXTURE.REWARD_WINDOW);
    this.loadImage(TEXTURE.REWARD_OVERLAY_0, 'ui/windows', TEXTURE.REWARD_OVERLAY_0);
    this.loadImage(TEXTURE.REWARD_OVERLAY_1, 'ui/windows', TEXTURE.REWARD_OVERLAY_1);
    this.loadImage(TEXTURE.REWARD_OVERLAY_2, 'ui/windows', TEXTURE.REWARD_OVERLAY_2);
    this.loadImage(TEXTURE.REWARD_OVERLAY_3, 'ui/windows', TEXTURE.REWARD_OVERLAY_3);
    this.loadImage(TEXTURE.WINDOW_NOTICE_0, 'ui/windows', TEXTURE.WINDOW_NOTICE_0);
    this.loadImage(TEXTURE.WINDOW_NOTICE_1, 'ui/windows', TEXTURE.WINDOW_NOTICE_1);
    this.loadImage(TEXTURE.WINDOW_NOTICE_2, 'ui/windows', TEXTURE.WINDOW_NOTICE_2);
    this.loadImage(TEXTURE.WINDOW_HELP, 'ui/windows', TEXTURE.WINDOW_HELP);
    this.loadImage(TEXTURE.WINDOW_0, 'ui/windows', TEXTURE.WINDOW_0);
    this.loadImage(TEXTURE.WINDOW_1, 'ui/windows', TEXTURE.WINDOW_1);
    this.loadImage(TEXTURE.WINDOW_2, 'ui/windows', TEXTURE.WINDOW_2);
    this.loadImage(TEXTURE.WINDOW_3, 'ui/windows', TEXTURE.WINDOW_3);
    this.loadImage(TEXTURE.WINDOW_4, 'ui/windows', TEXTURE.WINDOW_4);

    //backgrounds
    this.loadImage(TEXTURE.BG_LOAD, 'ui/bg', TEXTURE.BG_LOAD);
    this.loadImage(TEXTURE.BG_TITLE, 'ui/bg', TEXTURE.BG_TITLE);
    this.loadImage(TEXTURE.BG_BAG, 'ui/bg', TEXTURE.BG_BAG);
    this.loadImage(TEXTURE.BG_PC, 'ui/bg', TEXTURE.BG_PC);
    this.loadImage(TEXTURE.BG_HM, 'ui/bg', TEXTURE.BG_HM);
    this.loadImage(TEXTURE.BG_EVOLVE, 'ui/bg', TEXTURE.BG_EVOLVE);
    this.loadImage(TEXTURE.BG_BLACK, 'ui/bg', TEXTURE.BG_BLACK);
    this.loadImage(TEXTURE.BG_STARTER, 'ui/bg', TEXTURE.BG_STARTER);
    this.loadImage(TEXTURE.BG_TUTORIAL_CHOICE, 'ui/bg', TEXTURE.BG_TUTORIAL_CHOICE);

    //maps
    this.loadImage(TEXTURE.INDOOR_TILE_FLOOR, 'ui/map', TEXTURE.INDOOR_TILE_FLOOR);
    this.loadImage(TEXTURE.INDOOR_TILE_OBJECT, 'ui/map', TEXTURE.INDOOR_TILE_OBJECT);
    this.loadImage(TEXTURE.OUTDOOR_TILE_FLOOR, 'ui/map', TEXTURE.OUTDOOR_TILE_FLOOR);
    this.loadImage(TEXTURE.OUTDOOR_TILE_EDGE, 'ui/map', TEXTURE.OUTDOOR_TILE_EDGE);
    this.loadImage(TEXTURE.OUTDOOR_TILE_OBJECT, 'ui/map', TEXTURE.OUTDOOR_TILE_OBJECT);
    this.loadImage(TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, 'ui/map', TEXTURE.OUTDOOR_TILE_OBJECT_URBAN);
    this.loadImage(TEXTURE.OUTDOOR_TILE_URBAN, 'ui/map', TEXTURE.OUTDOOR_TILE_URBAN);
    this.loadImage(TEXTURE.OUTDOOR_EVENT, 'ui/map', TEXTURE.OUTDOOR_EVENT);
    this.loadImage(TEXTURE.INDOOR_EVENT, 'ui/map', TEXTURE.INDOOR_EVENT);
    this.loadMap(TEXTURE.PLAZA_001, 'ui/map', TEXTURE.PLAZA_001);
    this.loadMap(TEXTURE.PLAZA_002, 'ui/map', TEXTURE.PLAZA_002);
    this.loadMap(TEXTURE.PLAZA_003, 'ui/map', TEXTURE.PLAZA_003);
    this.loadMap(TEXTURE.PLAZA_004, 'ui/map', TEXTURE.PLAZA_004);
    this.loadMap(TEXTURE.PLAZA_005, 'ui/map', TEXTURE.PLAZA_005);
    this.loadMap(TEXTURE.PLAZA_006, 'ui/map', TEXTURE.PLAZA_006);
    this.loadMap(TEXTURE.PLAZA_007, 'ui/map', TEXTURE.PLAZA_007);
    this.loadMap(TEXTURE.PLAZA_008, 'ui/map', TEXTURE.PLAZA_008);
    this.loadMap(TEXTURE.PLAZA_009, 'ui/map', TEXTURE.PLAZA_009);
    this.loadMap(TEXTURE.PLAZA_010, 'ui/map', TEXTURE.PLAZA_010);
    this.loadMap(TEXTURE.PLAZA_011, 'ui/map', TEXTURE.PLAZA_011);
    this.loadMap(TEXTURE.PLAZA_012, 'ui/map', TEXTURE.PLAZA_012);
    // this.loadMap(TEXTURE.PLAZA_013, 'ui/map', TEXTURE.PLAZA_013);
    // this.loadMap(TEXTURE.PLAZA_014, 'ui/map', TEXTURE.PLAZA_014);
    // this.loadMap(TEXTURE.PLAZA_015, 'ui/map', TEXTURE.PLAZA_015);
    // this.loadMap(TEXTURE.PLAZA_016, 'ui/map', TEXTURE.PLAZA_016);
    // this.loadMap(TEXTURE.PLAZA_017, 'ui/map', TEXTURE.PLAZA_017);
    // this.loadMap(TEXTURE.PLAZA_018, 'ui/map', TEXTURE.PLAZA_018);
    this.loadMap(TEXTURE.PLAZA_019, 'ui/map', TEXTURE.PLAZA_019);
    this.loadMap(TEXTURE.PLAZA_020, 'ui/map', TEXTURE.PLAZA_020);
    this.loadMap(TEXTURE.PLAZA_021, 'ui/map', TEXTURE.PLAZA_021);
    this.loadMap(TEXTURE.PLAZA_022, 'ui/map', TEXTURE.PLAZA_022);
    this.loadMap(TEXTURE.PLAZA_023, 'ui/map', TEXTURE.PLAZA_023);

    this.loadMap(TEXTURE.GATE_001, 'ui/map', TEXTURE.GATE_001);
    this.loadMap(TEXTURE.GATE_002, 'ui/map', TEXTURE.GATE_002);
    this.loadMap(TEXTURE.GATE_003, 'ui/map', TEXTURE.GATE_003);
    this.loadMap(TEXTURE.GATE_004, 'ui/map', TEXTURE.GATE_004);

    this.loadMap(TEXTURE.SAFARI_001, 'ui/map', TEXTURE.SAFARI_001);
    this.loadMap(TEXTURE.SAFARI_002, 'ui/map', TEXTURE.SAFARI_002);
    this.loadMap(TEXTURE.SAFARI_003, 'ui/map', TEXTURE.SAFARI_003);
    this.loadMap(TEXTURE.SAFARI_004, 'ui/map', TEXTURE.SAFARI_004);
    this.loadMap(TEXTURE.SAFARI_005, 'ui/map', TEXTURE.SAFARI_005);
    this.loadMap(TEXTURE.SAFARI_006, 'ui/map', TEXTURE.SAFARI_006);
    this.loadMap(TEXTURE.SAFARI_007, 'ui/map', TEXTURE.SAFARI_007);
    this.loadMap(TEXTURE.SAFARI_008, 'ui/map', TEXTURE.SAFARI_008);
    this.loadMap(TEXTURE.SAFARI_009, 'ui/map', TEXTURE.SAFARI_009);
    this.loadMap(TEXTURE.SAFARI_010, 'ui/map', TEXTURE.SAFARI_010);
    this.loadMap(TEXTURE.SAFARI_011, 'ui/map', TEXTURE.SAFARI_011);

    //tutorial
    this.loadAtlas(TEXTURE.TUTORIAL_CHOICE_BALL, 'ui/tutorial', TEXTURE.TUTORIAL_CHOICE_BALL, ANIMATION.TUTORIAL_CHOICE_BALL);
    this.loadAtlas(TEXTURE.TUTORIAL_CHOICE_FINGER, 'ui/tutorial', TEXTURE.TUTORIAL_CHOICE_FINGER, ANIMATION.TUTORIAL_CHOICE_FINGER);
    this.loadImage(TEXTURE.TUTORIAL_CHOICE_INFO, 'ui/tutorial', TEXTURE.TUTORIAL_CHOICE_INFO);

    //icons
    this.loadImage(TEXTURE.ICON_PC, 'ui/icon', TEXTURE.ICON_PC);
    this.loadImage(TEXTURE.ICON_BAG_M, 'ui/icon', TEXTURE.ICON_BAG_M);
    this.loadImage(TEXTURE.ICON_BAG_G, 'ui/icon', TEXTURE.ICON_BAG_G);
    this.loadImage(TEXTURE.ICON_PROFILE, 'ui/icon', TEXTURE.ICON_PROFILE);
    this.loadImage(TEXTURE.ICON_EXIT_0, 'ui/icon', TEXTURE.ICON_EXIT_0);
    this.loadImage(TEXTURE.ICON_EXIT_1, 'ui/icon', TEXTURE.ICON_EXIT_1);
    this.loadImage(TEXTURE.ICON_RUNNING, 'ui/icon', TEXTURE.ICON_RUNNING);
    this.loadImage(TEXTURE.ICON_LOCATION, 'ui/icon', TEXTURE.ICON_LOCATION);
    this.loadImage(TEXTURE.ICON_CANDY, 'ui/icon', TEXTURE.ICON_CANDY);
    this.loadImage(TEXTURE.ICON_MONEY, 'ui/icon', TEXTURE.ICON_MONEY);
    this.loadImage(TEXTURE.ICON_MENU, 'ui/icon', TEXTURE.ICON_MENU);
    this.loadImage(TEXTURE.ICON_OPTION, 'ui/icon', TEXTURE.ICON_OPTION);
    this.loadImage(TEXTURE.ICON_SHINY, 'ui/icon', TEXTURE.ICON_SHINY);
    this.loadImage(TEXTURE.ICON_OWNED, 'ui/icon', TEXTURE.ICON_OWNED);
    this.loadImage(TEXTURE.ICON_XY, 'ui/icon', TEXTURE.ICON_XY);
    this.loadImage(TEXTURE.ICON_FOLLOW, 'ui/icon', TEXTURE.ICON_FOLLOW);
    this.loadImage(TEXTURE.ICON_CANCEL, 'ui/icon', TEXTURE.ICON_CANCEL);
    this.loadImage(TEXTURE.ICON_REG, 'ui/icon', TEXTURE.ICON_REG);
    this.loadImage(TEXTURE.ICON_TALK, 'ui/icon', TEXTURE.ICON_TALK);

    //doors
    this.loadAtlas('door_1', 'ui/door', 'door_1', 'door');
    this.loadAtlas('door_2', 'ui/door', 'door_2', 'door');
    this.loadAtlas('door_3', 'ui/door', 'door_3', 'door');
    this.loadAtlas('door_4', 'ui/door', 'door_4', 'door');
    this.loadAtlas('door_5', 'ui/door', 'door_5', 'door');
    this.loadAtlas('door_6', 'ui/door', 'door_6', 'door');
    this.loadAtlas('door_7', 'ui/door', 'door_7', 'door');
    this.loadAtlas('door_8', 'ui/door', 'door_8', 'door');
    this.loadAtlas('door_9', 'ui/door', 'door_9', 'door');
    this.loadAtlas('door_10', 'ui/door', 'door_10', 'door');
    this.loadAtlas('door_11', 'ui/door', 'door_11', 'door');
    this.loadAtlas('door_12', 'ui/door', 'door_12', 'door');
    this.loadAtlas('door_13', 'ui/door', 'door_13', 'door');
    this.loadAtlas('door_14', 'ui/door', 'door_14', 'door');
    this.loadAtlas('door_15', 'ui/door', 'door_15', 'door');
    this.loadAtlas('door_16', 'ui/door', 'door_16', 'door');
    this.loadAtlas('door_17', 'ui/door', 'door_17', 'door');
    this.loadAtlas('door_18', 'ui/door', 'door_18', 'door');
    this.loadAtlas('door_19', 'ui/door', 'door_19', 'door');
    this.loadAtlas('door_20', 'ui/door', 'door_20', 'door');
    this.loadAtlas('door_21', 'ui/door', 'door_21', 'door');
    this.loadAtlas('door_22', 'ui/door', 'door_22', 'door');

    //area
    this.loadImage(TEXTURE.AREA_0, 'ui/area', TEXTURE.AREA_0);
    this.loadImage(TEXTURE.AREA_1, 'ui/area', TEXTURE.AREA_1);
    this.loadImage(TEXTURE.AREA_2, 'ui/area', TEXTURE.AREA_2);
    this.loadImage(TEXTURE.AREA_3, 'ui/area', TEXTURE.AREA_3);
    this.loadImage(TEXTURE.AREA_4, 'ui/area', TEXTURE.AREA_4);
    this.loadImage(TEXTURE.AREA_5, 'ui/area', TEXTURE.AREA_5);
    this.loadImage(TEXTURE.AREA_6, 'ui/area', TEXTURE.AREA_6);
    this.loadImage(TEXTURE.AREA_7, 'ui/area', TEXTURE.AREA_7);
    this.loadImage(TEXTURE.AREA_8, 'ui/area', TEXTURE.AREA_8);
    this.loadImage(TEXTURE.AREA_9, 'ui/area', TEXTURE.AREA_9);
    this.loadImage(TEXTURE.AREA_10, 'ui/area', TEXTURE.AREA_10);
    this.loadImage(TEXTURE.AREA_11, 'ui/area', TEXTURE.AREA_11);
    this.loadImage(TEXTURE.AREA_12, 'ui/area', TEXTURE.AREA_12);
    this.loadImage(TEXTURE.AREA_13, 'ui/area', TEXTURE.AREA_13);
    this.loadImage(TEXTURE.AREA_14, 'ui/area', TEXTURE.AREA_14);
    this.loadImage(TEXTURE.AREA_15, 'ui/area', TEXTURE.AREA_15);
    this.loadImage(TEXTURE.AREA_16, 'ui/area', TEXTURE.AREA_16);

    //etc
    this.loadImage(TEXTURE.LOGO_0, 'ui', TEXTURE.LOGO_0);
    this.loadImage(TEXTURE.LOGO_DISCORD, 'ui', TEXTURE.LOGO_DISCORD);
    this.loadImage(TEXTURE.LOGO_GOOGLE, 'ui', TEXTURE.LOGO_GOOGLE);
    this.loadImage(TEXTURE.HELP_ARROWS, 'ui', TEXTURE.HELP_ARROWS);
    this.loadImage(TEXTURE.PC_NAME, 'ui', TEXTURE.PC_NAME);
    this.loadImage(TEXTURE.PC_DESC, 'ui', TEXTURE.PC_DESC);
    this.loadImage(TEXTURE.PC_ARROW, 'ui', TEXTURE.PC_ARROW);
    this.loadImage(TEXTURE.PC_BALL_001, 'ui/pc', TEXTURE.PC_BALL_001);
    this.loadImage(TEXTURE.PC_BALL_002, 'ui/pc', TEXTURE.PC_BALL_002);
    this.loadImage(TEXTURE.PC_BALL_003, 'ui/pc', TEXTURE.PC_BALL_003);
    this.loadImage(TEXTURE.PC_BALL_004, 'ui/pc', TEXTURE.PC_BALL_004);
    this.loadImage(TEXTURE.BATTLE_BAR, 'ui/battle', TEXTURE.BATTLE_BAR);
    this.loadImage(TEXTURE.GENDER_0, 'ui', TEXTURE.GENDER_0);
    this.loadImage(TEXTURE.GENDER_1, 'ui', TEXTURE.GENDER_1);
    this.loadAtlas(TEXTURE.PAUSE_B, 'ui', TEXTURE.PAUSE_B, ANIMATION.PAUSE_B);
    this.loadAtlas(TEXTURE.PAUSE_W, 'ui', TEXTURE.PAUSE_W, ANIMATION.PAUSE_W);
    this.loadImage(TEXTURE.SEASON_0, 'ui', TEXTURE.SEASON_0);
    this.loadImage(TEXTURE.SEASON_1, 'ui', TEXTURE.SEASON_1);
    this.loadImage(TEXTURE.SEASON_2, 'ui', TEXTURE.SEASON_2);
    this.loadImage(TEXTURE.SEASON_3, 'ui', TEXTURE.SEASON_3);
    this.loadAtlas(TEXTURE.OVERWORLD_SHINY, 'ui', TEXTURE.OVERWORLD_SHINY, ANIMATION.OVERWORLD_SHINY);
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
    this.loadAtlas(TEXTURE.BOY_1_HM, 'ui/character/hm', 'boy_1', ANIMATION.PLAYER_HM);
    this.loadAtlas(TEXTURE.BOY_2_HM, 'ui/character/hm', 'boy_2', ANIMATION.PLAYER_HM);
    this.loadAtlas(TEXTURE.BOY_3_HM, 'ui/character/hm', 'boy_3', ANIMATION.PLAYER_HM);
    this.loadAtlas(TEXTURE.BOY_4_HM, 'ui/character/hm', 'boy_4', ANIMATION.PLAYER_HM);
    this.loadAtlas(TEXTURE.GIRL_1_HM, 'ui/character/hm', 'girl_1', ANIMATION.PLAYER_HM);
    this.loadAtlas(TEXTURE.GIRL_2_HM, 'ui/character/hm', 'girl_2', ANIMATION.PLAYER_HM);
    this.loadAtlas(TEXTURE.GIRL_3_HM, 'ui/character/hm', 'girl_3', ANIMATION.PLAYER_HM);
    this.loadAtlas(TEXTURE.GIRL_4_HM, 'ui/character/hm', 'girl_4', ANIMATION.PLAYER_HM);
    this.loadAtlas(TEXTURE.BOY_1_BACK, 'ui/character/back', 'boy_1', ANIMATION.BOY_1_BACK);
    this.loadAtlas(TEXTURE.BOY_2_BACK, 'ui/character/back', 'boy_2', ANIMATION.BOY_2_BACK);
    this.loadAtlas(TEXTURE.BOY_3_BACK, 'ui/character/back', 'boy_3', ANIMATION.BOY_3_BACK);
    this.loadAtlas(TEXTURE.BOY_4_BACK, 'ui/character/back', 'boy_4', ANIMATION.BOY_4_BACK);
    this.loadAtlas(TEXTURE.GIRL_1_BACK, 'ui/character/back', 'girl_1', ANIMATION.GIRL_1_BACK);
    this.loadAtlas(TEXTURE.GIRL_2_BACK, 'ui/character/back', 'girl_2', ANIMATION.GIRL_2_BACK);
    this.loadAtlas(TEXTURE.GIRL_3_BACK, 'ui/character/back', 'girl_3', ANIMATION.GIRL_3_BACK);
    this.loadAtlas(TEXTURE.GIRL_4_BACK, 'ui/character/back', 'girl_4', ANIMATION.GIRL_4_BACK);
    this.loadAtlas(TEXTURE.BOY_1_SURF, 'ui/character/surf', 'boy_1', ANIMATION.PLAYER_SURF);
    this.loadAtlas(TEXTURE.BOY_2_SURF, 'ui/character/surf', 'boy_2', ANIMATION.PLAYER_SURF);
    this.loadAtlas(TEXTURE.BOY_3_SURF, 'ui/character/surf', 'boy_3', ANIMATION.PLAYER_SURF);
    this.loadAtlas(TEXTURE.BOY_4_SURF, 'ui/character/surf', 'boy_4', ANIMATION.PLAYER_SURF);
    this.loadAtlas(TEXTURE.GIRL_1_SURF, 'ui/character/surf', 'girl_1', ANIMATION.PLAYER_SURF);
    this.loadAtlas(TEXTURE.GIRL_2_SURF, 'ui/character/surf', 'girl_2', ANIMATION.PLAYER_SURF);
    this.loadAtlas(TEXTURE.GIRL_3_SURF, 'ui/character/surf', 'girl_3', ANIMATION.PLAYER_SURF);
    this.loadAtlas(TEXTURE.GIRL_4_SURF, 'ui/character/surf', 'girl_4', ANIMATION.PLAYER_SURF);
    this.loadAtlas(TEXTURE.SURF, 'ui/character/surf', 'surf', ANIMATION.SURF);
    this.loadImage(TEXTURE.PARTICLE_HM_0, 'ui/particle', TEXTURE.PARTICLE_HM_0);
    this.loadImage(TEXTURE.PARTICLE_HM_1, 'ui/particle', TEXTURE.PARTICLE_HM_1);
    this.loadImage(TEXTURE.PARTICLE_EVOL, 'ui/particle', TEXTURE.PARTICLE_EVOL);
    this.loadImage(TEXTURE.PARTICLE_BALL_0, 'ui/particle', TEXTURE.PARTICLE_BALL_0);
    this.loadImage(TEXTURE.PARTICLE_BALL_1, 'ui/particle', TEXTURE.PARTICLE_BALL_1);
    this.loadImage(TEXTURE.PARTICLE_BALL_BG, 'ui/particle', TEXTURE.PARTICLE_BALL_BG);
    this.loadImage(TEXTURE.PARTICLE_STAR, 'ui/particle', TEXTURE.PARTICLE_STAR);
    this.loadAtlas(TEXTURE.PARTICLE_ENTER_BALL, 'ui/particle', TEXTURE.PARTICLE_ENTER_BALL, ANIMATION.PARTICLE_ENTER_BALL);
    this.loadAtlas(TEXTURE.BAG_POCKET_BALL, 'ui', TEXTURE.BAG_POCKET_BALL, ANIMATION.BAG_POCKET_BALL);
    this.loadAtlas(TEXTURE.BAG_POCKET_ETC, 'ui', TEXTURE.BAG_POCKET_ETC, ANIMATION.BAG_POCKET_ETC);
    this.loadAtlas(TEXTURE.BAG_POCKET_BERRY, 'ui', TEXTURE.BAG_POCKET_BERRY, ANIMATION.BAG_POCKET_BERRY);
    this.loadAtlas(TEXTURE.BAG_POCKET_KEY, 'ui', TEXTURE.BAG_POCKET_KEY, ANIMATION.BAG_POCKET_KEY);
    this.loadAtlas(TEXTURE.BAG_POCKET_TM_HM, 'ui', TEXTURE.BAG_POCKET_TM_HM, ANIMATION.BAG_POCKET_TM_HM);
    this.loadImage(TEXTURE.BAG_BAR, 'ui', TEXTURE.BAG_BAR);
    this.loadImage(TEXTURE.ARROW_W, 'ui', TEXTURE.ARROW_W);
    this.loadImage(TEXTURE.ARROW_B, 'ui', TEXTURE.ARROW_B);
    this.loadImage(TEXTURE.ARROW_G, 'ui', TEXTURE.ARROW_G);
    this.loadImage(TEXTURE.ARROW_R, 'ui', TEXTURE.ARROW_R);
    this.loadImage(TEXTURE.FINGER, 'ui', TEXTURE.FINGER);
    this.loadImage(TEXTURE.BLANK, 'ui', TEXTURE.BLANK);
    this.loadAtlas(TEXTURE.TYPES, 'ui', TEXTURE.TYPES, TEXTURE.TYPES);
    this.loadAtlas(TEXTURE.POKEMON_CALL, 'ui', TEXTURE.POKEMON_CALL, ANIMATION.POKEMON_CALL);
    this.loadAtlas(TEXTURE.POKEMON_RECALL, 'ui', TEXTURE.POKEMON_RECALL, ANIMATION.POKEMON_RECALL);
    this.loadAtlas(TEXTURE.POKEBALL, 'ui', TEXTURE.POKEBALL, ANIMATION.POKEBALL);
    this.loadAtlas(TEXTURE.POKEBALL_GROUND, 'ui', TEXTURE.POKEBALL_GROUND, ANIMATION.POKEBALL_GROUND);
    this.loadAtlas(TEXTURE.OVERWORLD_SHADOW, 'ui', TEXTURE.OVERWORLD_SHADOW, ANIMATION.OVERWORLD_SHADOW);
    this.loadAtlas(TEXTURE.OVERWORLD_SHADOW_WATER, 'ui', TEXTURE.OVERWORLD_SHADOW_WATER, ANIMATION.OVERWORLD_SHADOW_WATER);
    this.loadAtlas(TEXTURE.EMO, 'ui', TEXTURE.EMO, ANIMATION.EMO);
    this.loadImage(TEXTURE.BG_OVERLAY_0, 'ui', TEXTURE.BG_OVERLAY_0);
    this.loadAtlas(TEXTURE.SPARKLE, 'ui', TEXTURE.SPARKLE, ANIMATION.SPARKLE);
    this.loadImage(TEXTURE.PROFESSOR, 'ui', TEXTURE.PROFESSOR);
    this.loadAtlas(TEXTURE.BATTLE_BALL_0, 'ui', TEXTURE.BATTLE_BALL_0, ANIMATION.BATTLE_BALL_0);
    this.loadAtlas(TEXTURE.BATTLE_BALL_1, 'ui', TEXTURE.BATTLE_BALL_1, ANIMATION.BATTLE_BALL_1);
    this.loadImage(TEXTURE.RIBBON, 'ui', TEXTURE.RIBBON);
    this.loadAtlas(TEXTURE.SPARKLE, 'ui', TEXTURE.SPARKLE, ANIMATION.SPARKLE);
    this.loadAtlas(TEXTURE.GROUND_ITEM, 'ui', TEXTURE.GROUND_ITEM, ANIMATION.GROUND_ITEM);
    this.loadImage(TEXTURE.SHOP_SCREEN, 'ui', TEXTURE.SHOP_SCREEN);
    this.loadImage('battle_shadow_0', 'ui/battle', 'battle_shadow_0');
    this.loadImage('battle_shadow_1', 'ui/battle', 'battle_shadow_1');
    this.loadImage('battle_shadow_2', 'ui/battle', 'battle_shadow_2');
    this.loadImage(TEXTURE.LAMP, 'ui', TEXTURE.LAMP);

    const maxBox = 15;
    for (let i = 0; i <= maxBox; i++) {
      this.loadImage(`box${i}`, 'ui/pc', `box${i}`);
    }

    for (const key of Object.keys(itemData)) {
      this.loadImage(`${key}`, 'ui/item', `${key}`);
    }

    for (const key of Object.keys(npcData)) {
      this.loadAtlas(`${key}`, 'ui/character/npc', `${key}`, `npc`);
    }

    this.loadImage(`pokemon_sprite000`, 'ui/pokemon/sprite', `0`);
    this.loadAtlas(`pokemon_icon000`, 'ui/pokemon/icon', `0`, 'pokemon_icon');
    this.loadAtlas(`pokemon_overworld000`, 'ui/pokemon/overworld', '0', `pokemon_overworld_0`);

    for (const pokemon of Object.keys(PokemonData)) {
      const pokedex = createZeroPad(Number(pokemon));

      this.loadAudio(`${pokemon}`, 'audio/pokemon', `${pokemon}`, 'wav');
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

    Object.values(BATTLE_AREA).forEach((area) => {
      Object.values(TIME).forEach((time) => {
        if (time !== TIME.DAWN) {
          if (area === BATTLE_AREA.CAVE) {
            this.loadImage(`bg_${area}_day`, 'ui/battle', `bg_${area}_day`);
            this.loadImage(`eb_${area}_day`, 'ui/battle', `eb_${area}_day`);
            this.loadImage(`pb_${area}_day`, 'ui/battle', `pb_${area}_day`);
          } else {
            this.loadImage(`bg_${area}_${time}`, 'ui/battle', `bg_${area}_${time}`);
            this.loadImage(`eb_${area}_${time}`, 'ui/battle', `eb_${area}_${time}`);
            this.loadImage(`pb_${area}_${time}`, 'ui/battle', `pb_${area}_${time}`);
          }
        }
      });
    });

    //background sounds
    this.loadAudio(AUDIO.B000, 'audio/background', AUDIO.B000, 'wav');
    this.loadAudio(AUDIO.B001, 'audio/background', AUDIO.B001, 'wav');
    this.loadAudio(AUDIO.B002, 'audio/background', AUDIO.B002, 'wav');
    this.loadAudio(AUDIO.B003, 'audio/background', AUDIO.B003, 'wav');
    this.loadAudio(AUDIO.B004, 'audio/background', AUDIO.B004, 'wav');
    this.loadAudio(AUDIO.B005, 'audio/background', AUDIO.B005, 'wav');
    this.loadAudio(AUDIO.B006, 'audio/background', AUDIO.B006, 'wav');
    this.loadAudio(AUDIO.B007, 'audio/background', AUDIO.B007, 'wav');
    this.loadAudio(AUDIO.B008, 'audio/background', AUDIO.B008, 'wav');
    this.loadAudio(AUDIO.B009, 'audio/background', AUDIO.B009, 'wav');
    this.loadAudio(AUDIO.B010, 'audio/background', AUDIO.B010, 'wav');
    this.loadAudio(AUDIO.B011, 'audio/background', AUDIO.B011, 'wav');
    this.loadAudio(AUDIO.B012, 'audio/background', AUDIO.B012, 'wav');
    this.loadAudio(AUDIO.B013, 'audio/background', AUDIO.B013, 'wav');
    this.loadAudio(AUDIO.B014, 'audio/background', AUDIO.B014, 'wav');
    this.loadAudio(AUDIO.B015, 'audio/background', AUDIO.B015, 'wav');
    this.loadAudio(AUDIO.B016, 'audio/background', AUDIO.B016, 'wav');
    this.loadAudio(AUDIO.B017, 'audio/background', AUDIO.B017, 'wav');
    this.loadAudio(AUDIO.B018, 'audio/background', AUDIO.B018, 'wav');
    this.loadAudio(AUDIO.B019, 'audio/background', AUDIO.B019, 'wav');
    this.loadAudio(AUDIO.B020, 'audio/background', AUDIO.B020, 'wav');
    this.loadAudio(AUDIO.B021, 'audio/background', AUDIO.B021, 'wav');
    this.loadAudio(AUDIO.B022, 'audio/background', AUDIO.B022, 'wav');
    this.loadAudio(AUDIO.B023, 'audio/background', AUDIO.B023, 'wav');
    this.loadAudio(AUDIO.B024, 'audio/background', AUDIO.B024, 'wav');
    this.loadAudio(AUDIO.B025, 'audio/background', AUDIO.B025, 'wav');
    this.loadAudio(AUDIO.B026, 'audio/background', AUDIO.B026, 'wav');
    this.loadAudio(AUDIO.B027, 'audio/background', AUDIO.B027, 'wav');
    this.loadAudio(AUDIO.B028, 'audio/background', AUDIO.B028, 'wav');
    this.loadAudio(AUDIO.B029, 'audio/background', AUDIO.B029, 'wav');
    this.loadAudio(AUDIO.B030, 'audio/background', AUDIO.B030, 'wav');
    this.loadAudio(AUDIO.B031, 'audio/background', AUDIO.B031, 'wav');
    this.loadAudio(AUDIO.B032, 'audio/background', AUDIO.B032, 'wav');
    this.loadAudio(AUDIO.B033, 'audio/background', AUDIO.B033, 'wav');
    this.loadAudio(AUDIO.B034, 'audio/background', AUDIO.B034, 'wav');

    //effect sounds
    this.loadAudio(AUDIO.SELECT_0, 'audio/effect', AUDIO.SELECT_0, 'ogg');
    this.loadAudio(AUDIO.SELECT_1, 'audio/effect', AUDIO.SELECT_1, 'ogg');
    this.loadAudio(AUDIO.SELECT_2, 'audio/effect', AUDIO.SELECT_2, 'wav');
    this.loadAudio(AUDIO.OPEN_0, 'audio/effect', AUDIO.OPEN_0, 'wav');
    this.loadAudio(AUDIO.OPEN_1, 'audio/effect', AUDIO.OPEN_1, 'ogg');
    this.loadAudio(AUDIO.OPEN_2, 'audio/effect', AUDIO.OPEN_2, 'ogg');
    this.loadAudio(AUDIO.CANCEL_0, 'audio/effect', AUDIO.CANCEL_0, 'ogg');
    this.loadAudio(AUDIO.CANCEL_1, 'audio/effect', AUDIO.CANCEL_1, 'ogg');
    this.loadAudio(AUDIO.GET_0, 'audio/effect', AUDIO.GET_0, 'ogg');
    this.loadAudio(AUDIO.BUY, 'audio/effect', AUDIO.BUY, 'ogg');
    this.loadAudio(AUDIO.JUMP, 'audio/effect', AUDIO.JUMP, 'ogg');
    this.loadAudio(AUDIO.REACTION_0, 'audio/effect', AUDIO.REACTION_0, 'ogg');
    this.loadAudio(AUDIO.THROW, 'audio/effect', AUDIO.THROW, 'ogg');
    this.loadAudio(AUDIO.BALL_CATCH, 'audio/effect', AUDIO.BALL_CATCH, 'ogg');
    this.loadAudio(AUDIO.BALL_DROP, 'audio/effect', AUDIO.BALL_DROP, 'ogg');
    this.loadAudio(AUDIO.BALL_ENTER, 'audio/effect', AUDIO.BALL_ENTER, 'ogg');
    this.loadAudio(AUDIO.BALL_ENTER, 'audio/effect', AUDIO.BALL_ENTER, 'ogg');
    this.loadAudio(AUDIO.BALL_EXIT, 'audio/effect', AUDIO.BALL_EXIT, 'ogg');
    this.loadAudio(AUDIO.BALL_SHAKE, 'audio/effect', AUDIO.BALL_SHAKE, 'ogg');
    this.loadAudio(AUDIO.BUZZER, 'audio/effect', AUDIO.BUZZER, 'ogg');
    this.loadAudio(AUDIO.REWARD, 'audio/effect', AUDIO.REWARD, 'ogg');
    this.loadAudio(AUDIO.FLEE, 'audio/effect', AUDIO.FLEE, 'ogg');
    this.loadAudio(AUDIO.SHINY, 'audio/effect', AUDIO.SHINY, 'wav');
    this.loadAudio(AUDIO.EVOL_INTRO, 'audio/effect', AUDIO.EVOL_INTRO, 'ogg');
    this.loadAudio(AUDIO.EVOL, 'audio/effect', AUDIO.EVOL, 'ogg');
    this.loadAudio(AUDIO.CONG, 'audio/effect', AUDIO.CONG, 'ogg');
    this.loadAudio(AUDIO.HATCH, 'audio/effect', AUDIO.HATCH, 'wav');
    this.loadAudio(AUDIO.DOOR_ENTER_0, 'audio/effect', AUDIO.DOOR_ENTER_0, 'ogg');
    this.loadAudio(AUDIO.DOOR_ENTER_1, 'audio/effect', AUDIO.DOOR_ENTER_1, 'ogg');
    this.loadAudio(AUDIO.DOOR_ENTER_2, 'audio/effect', AUDIO.DOOR_ENTER_2, 'ogg');

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

    this.load.on('complete', async () => {
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
