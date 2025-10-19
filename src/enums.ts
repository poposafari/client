export const enum TEXTURE {
  NONE = 'none',

  //window
  WINDOW_BAG = 'window_bag',
  WINDOW_BAG_O = 'window_bag_o',
  WINDOW_SYS = 'window_sys',
  WINDOW_MENU = 'window_menu',
  WINDOW_MENU_S = 'window_menu_s',
  WINDOW_RED = 'window_red',
  WINDOW_REWARD = 'window_reward',
  WINDOW_REWARD_0 = 'window_reward_0',
  WINDOW_WHITE = 'window_white',
  WINDOW_OPACITY = 'window_opacity',
  WINDOW_0 = 'window_0',
  WINDOW_1 = 'window_1',
  WINDOW_2 = 'window_2',
  WINDOW_3 = 'window_3',
  WINDOW_4 = 'window_4',
  WINDOW_5 = 'window_5',
  WINDOW_6 = 'window_6',
  WINDOW_7 = 'window_7',
  WINDOW_8 = 'window_8',
  WINDOW_9 = 'window_9',
  WINDOW_10 = 'window_10',

  //backgrounds
  BG_LOAD = 'bg_load',
  BG_TITLE = 'bg_title',
  BG_BAG = 'bg_bag',
  BG_PC = 'bg_pc',
  BG_HM = 'bg_hm',
  BG_EVOLVE = 'bg_evolve',
  BG_BLACK = 'bg_black',
  BG_STARTER = 'bg_starter',
  BG_TUTORIAL_CHOICE = 'bg_tutorial_choice',

  //tutorial
  TUTORIAL_CHOICE_BALL = 'tutorial_choice_ball',
  TUTORIAL_CHOICE_FINGER = 'tutorial_choice_finger',
  TUTORIAL_CHOICE_INFO = 'tutorial_choice_info',

  //maps
  INDOOR_TILE_FLOOR = 'indoor_floor',
  INDOOR_TILE_OBJECT = 'indoor_object',
  OUTDOOR_TILE_FLOOR = 'outdoor_floor',
  OUTDOOR_TILE_EDGE = 'outdoor_edge',
  OUTDOOR_TILE_OBJECT = 'outdoor_object',
  OUTDOOR_TILE_OBJECT_URBAN = 'outdoor_object_urban',
  OUTDOOR_TILE_URBAN = 'outdoor_urban',
  PLAZA_000 = 'p000',
  PLAZA_001 = 'p001', //포포시티
  PLAZA_002 = 'p002', //호박사 연구소
  PLAZA_003 = 'p003', //프렌들리 숍
  PLAZA_004 = 'p004', //우체국
  PLAZA_005 = 'p005', //비행정
  PLAZA_006 = 'p006', //자전거 가게
  PLAZA_007 = 'p007', //npc집 1
  PLAZA_008 = 'p008', //npc집 2
  PLAZA_009 = 'p009', //npc집 3
  PLAZA_010 = 'p010', //npc집 4
  PLAZA_011 = 'p011', //npc집 5
  PLAZA_012 = 'p012', //npc집 6
  PLAZA_013 = 'p013', //npc집 7
  PLAZA_014 = 'p014', //npc집 8
  PLAZA_015 = 'p015', //npc집 9
  PLAZA_016 = 'p016', //npc집 10
  PLAZA_017 = 'p017', //npc집 11
  PLAZA_018 = 'p018', //npc집 12
  PLAZA_019 = 'p019', //npc집 13
  PLAZA_020 = 'p020', //npc집 14
  SAFARI_000 = 's000', //테스트 사파리 존
  SAFARI_001 = 's001', //숲
  SAFARI_002 = 's002',
  SAFARI_003 = 's003',
  SAFARI_004 = 's004',
  SAFARI_005 = 's005',
  SAFARI_006 = 's006',
  SAFARI_007 = 's007',
  SAFARI_008 = 's008',
  SAFARI_009 = 's009',
  SAFARI_010 = 's010',

  //icons
  ICON_PC = 'icon_pc',
  ICON_BAG_M = 'icon_bag_m',
  ICON_BAG_G = 'icon_bag_g',
  ICON_PROFILE = 'icon_profile',
  ICON_EXIT_0 = 'icon_exit_0',
  ICON_EXIT_1 = 'icon_exit_1',
  ICON_RUNNING = 'icon_running',
  ICON_LOCATION = 'icon_location',
  ICON_CANDY = 'icon_candy',
  ICON_MENU = 'icon_menu',
  ICON_OPTION = 'icon_option',
  ICON_SHINY = 'icon_shiny',
  ICON_OWNED = 'icon_owned',
  ICON_XY = 'icon_xy',
  ICON_FOLLOW = 'icon_follow',
  ICON_CANCEL = 'icon_cancel',
  ICON_REG = 'icon_reg',
  ICON_TALK = 'icon_talk',

  //etc
  LOGO_0 = 'logo_0',
  LOGO_DISCORD = 'logo_discord',
  LOGO_GOOGLE = 'logo_google',
  PC_NAME = 'pc_name',
  PC_DESC = 'pc_desc',
  PC_ARROW = 'pc_arrow',
  PC_BALL_001 = 'pc_ball_001',
  PC_BALL_002 = 'pc_ball_002',
  PC_BALL_003 = 'pc_ball_003',
  PC_BALL_004 = 'pc_ball_004',
  BATTLE_BAR = 'battle_bar',
  GENDER_0 = 'gender_0',
  GENDER_1 = 'gender_1',
  PAUSE_B = 'pause_b',
  PAUSE_W = 'pause_w',
  SEASON_0 = 'season_0',
  SEASON_1 = 'season_1',
  SEASON_2 = 'season_2',
  SEASON_3 = 'season_3',
  OVERWORLD_SHINY = 'overworld_shiny',
  BOY_1_STATUE = 'boy_1_statue',
  BOY_2_STATUE = 'boy_2_statue',
  BOY_3_STATUE = 'boy_3_statue',
  BOY_4_STATUE = 'boy_4_statue',
  GIRL_1_STATUE = 'girl_1_statue',
  GIRL_2_STATUE = 'girl_2_statue',
  GIRL_3_STATUE = 'girl_3_statue',
  GIRL_4_STATUE = 'girl_4_statue',
  BOY_1_MOVEMENT = 'boy_1_movement',
  BOY_2_MOVEMENT = 'boy_2_movement',
  BOY_3_MOVEMENT = 'boy_3_movement',
  BOY_4_MOVEMENT = 'boy_4_movement',
  GIRL_1_MOVEMENT = 'girl_1_movement',
  GIRL_2_MOVEMENT = 'girl_2_movement',
  GIRL_3_MOVEMENT = 'girl_3_movement',
  GIRL_4_MOVEMENT = 'girl_4_movement',
  BOY_1_RIDE = 'boy_1_ride',
  BOY_2_RIDE = 'boy_2_ride',
  BOY_3_RIDE = 'boy_3_ride',
  BOY_4_RIDE = 'boy_4_ride',
  GIRL_1_RIDE = 'girl_1_ride',
  GIRL_2_RIDE = 'girl_2_ride',
  GIRL_3_RIDE = 'girl_3_ride',
  GIRL_4_RIDE = 'girl_4_ride',
  BOY_1_HM = 'boy_1_hm',
  BOY_2_HM = 'boy_2_hm',
  BOY_3_HM = 'boy_3_hm',
  BOY_4_HM = 'boy_4_hm',
  GIRL_1_HM = 'girl_1_hm',
  GIRL_2_HM = 'girl_2_hm',
  GIRL_3_HM = 'girl_3_hm',
  GIRL_4_HM = 'girl_4_hm',
  BOY_1_BACK = 'boy_1_back',
  BOY_2_BACK = 'boy_2_back',
  BOY_3_BACK = 'boy_3_back',
  BOY_4_BACK = 'boy_4_back',
  GIRL_1_BACK = 'girl_1_back',
  GIRL_2_BACK = 'girl_2_back',
  GIRL_3_BACK = 'girl_3_back',
  GIRL_4_BACK = 'girl_4_back',
  BOY_1_SURF = 'boy_1_surf',
  BOY_2_SURF = 'boy_2_surf',
  BOY_3_SURF = 'boy_3_surf',
  BOY_4_SURF = 'boy_4_surf',
  GIRL_1_SURF = 'girl_1_surf',
  GIRL_2_SURF = 'girl_2_surf',
  GIRL_3_SURF = 'girl_3_surf',
  GIRL_4_SURF = 'girl_4_surf',
  SURF = 'surf',
  PARTICLE_HM_0 = 'particle_hm_0',
  PARTICLE_HM_1 = 'particle_hm_1',
  PARTICLE_EVOL = 'particle_evol',
  PARTICLE_BALL_0 = 'particle_ball_0',
  PARTICLE_BALL_1 = 'particle_ball_1',
  PARTICLE_ENTER_BALL = 'particle_enter_ball',
  PARTICLE_BALL_BG = 'particle_ball_bg',
  PARTICLE_STAR = 'particle_star',
  BAG_POCKET_BALL = 'bag_pocket_ball',
  BAG_POCKET_ETC = 'bag_pocket_etc',
  BAG_POCKET_BERRY = 'bag_pocket_berry',
  BAG_POCKET_KEY = 'bag_pocket_key',
  BAG_BAR = 'bag_bar',
  ARROW_W = 'arrow_w',
  ARROW_B = 'arrow_b',
  ARROW_G = 'arrow_g',
  ARROW_R = 'arrow_r',
  FINGER = 'finger',
  BLANK = 'blank',
  TYPES = 'types',
  POKEMON_CALL = 'pokemon_call',
  POKEMON_RECALL = 'pokemon_recall',
  POKEMON_OVERWORLD = 'pokemon_overworld',
  POKEBALL = 'pokeball',
  POKEBALL_GROUND = 'pokeball_ground',
  LEGACY_POKEBALL_THROW = 'legacy_pokeball_throw',
  OVERWORLD_SHADOW = 'overworld_shadow',
  OVERWORLD_SHADOW_WATER = 'overworld_shadow_water',
  BG_OVERLAY_0 = 'bg_overlay_0',
  EMO = 'emo',
  SPARKLE = 'sparkle',
  PROFESSOR = 'professor',
  BATTLE_BALL_0 = 'battle_ball_0',
  BATTLE_BALL_1 = 'battle_ball_1',
  REWARD_WINDOW = 'reward_window',
  REWARD_OVERLAY_0 = 'reward_overlay_0',
  REWARD_OVERLAY_1 = 'reward_overlay_1',
  REWARD_OVERLAY_2 = 'reward_overlay_2',
  REWARD_OVERLAY_3 = 'reward_overlay_3',
  RIBBON = 'ribbon',
  GROUND_ITEM = 'ground_item',
  SHOP_SCREEN = 'shop_screen',
}

export const TEXTURE_PLAYER_MAP: Record<string, TEXTURE> = {
  BOY_1_MOVEMENT: TEXTURE.BOY_1_MOVEMENT,
  BOY_2_MOVEMENT: TEXTURE.BOY_2_MOVEMENT,
  BOY_3_MOVEMENT: TEXTURE.BOY_3_MOVEMENT,
  BOY_4_MOVEMENT: TEXTURE.BOY_4_MOVEMENT,
  GIRL_1_MOVEMENT: TEXTURE.GIRL_1_MOVEMENT,
  GIRL_2_MOVEMENT: TEXTURE.GIRL_2_MOVEMENT,
  GIRL_3_MOVEMENT: TEXTURE.GIRL_3_MOVEMENT,
  GIRL_4_MOVEMENT: TEXTURE.GIRL_4_MOVEMENT,
  BOY_1_RIDE: TEXTURE.BOY_1_RIDE,
  BOY_2_RIDE: TEXTURE.BOY_2_RIDE,
  BOY_3_RIDE: TEXTURE.BOY_3_RIDE,
  BOY_4_RIDE: TEXTURE.BOY_4_RIDE,
  GIRL_1_RIDE: TEXTURE.GIRL_1_RIDE,
  GIRL_2_RIDE: TEXTURE.GIRL_2_RIDE,
  GIRL_3_RIDE: TEXTURE.GIRL_3_RIDE,
  GIRL_4_RIDE: TEXTURE.GIRL_4_RIDE,
};

export const enum ANIMATION {
  NONE = 'none',
  PAUSE = 'pause',
  PAUSE_W = 'pause_w',
  PAUSE_B = 'pause_b',
  NPC_MOVEMENT = 'npc_movement',
  PLAYER_MOVEMENT = 'player_movement',
  PLAYER_SURF = 'player_surf',
  OVERWORLD_SHADOW = 'overworld_shadow',
  OVERWORLD_SHADOW_WATER = 'overworld_shadow_water',
  SURF = 'surf',
  PLAYER_MOVEMENT_WALK_UP_1 = 'player_movement_walk_up_1',
  PLAYER_MOVEMENT_WALK_UP_2 = 'player_movement_walk_up_2',
  PLAYER_MOVEMENT_WALK_DOWN_1 = 'player_movement_walk_down_1',
  PLAYER_MOVEMENT_WALK_DOWN_2 = 'player_movement_walk_down_2',
  PLAYER_MOVEMENT_WALK_LEFT_1 = 'player_movement_walk_left_1',
  PLAYER_MOVEMENT_WALK_LEFT_2 = 'player_movement_walk_left_2',
  PLAYER_MOVEMENT_WALK_RIGHT_1 = 'player_movement_walk_right_1',
  PLAYER_MOVEMENT_WALK_RIGHT_2 = 'player_movement_walk_right_2',
  PLAYER_MOVEMENT_RUN_UP_1 = 'player_movement_run_up_1',
  PLAYER_MOVEMENT_RUN_UP_2 = 'player_movement_run_up_2',
  PLAYER_MOVEMENT_RUN_UP_3 = 'player_movement_run_up_3',
  PLAYER_MOVEMENT_RUN_DOWN_1 = 'player_movement_run_down_1',
  PLAYER_MOVEMENT_RUN_DOWN_2 = 'player_movement_run_down_2',
  PLAYER_MOVEMENT_RUN_DOWN_3 = 'player_movement_run_down_3',
  PLAYER_MOVEMENT_RUN_LEFT_1 = 'player_movement_run_left_1',
  PLAYER_MOVEMENT_RUN_LEFT_2 = 'player_movement_run_left_2',
  PLAYER_MOVEMENT_RUN_LEFT_3 = 'player_movement_run_left_3',
  PLAYER_MOVEMENT_RUN_RIGHT_1 = 'player_movement_run_right_1',
  PLAYER_MOVEMENT_RUN_RIGHT_2 = 'player_movement_run_right_2',
  PLAYER_MOVEMENT_RUN_RIGHT_3 = 'player_movement_run_right_3',
  PLAYER_RIDE = 'player_ride',
  PLAYER_RIDE_UP_1 = 'player_ride_up_1',
  PLAYER_RIDE_UP_2 = 'player_ride_up_2',
  PLAYER_RIDE_DOWN_1 = 'player_ride_down_1',
  PLAYER_RIDE_DOWN_2 = 'player_ride_down_2',
  PLAYER_RIDE_LEFT_1 = 'player_ride_left_1',
  PLAYER_RIDE_LEFT_2 = 'player_ride_left_2',
  PLAYER_RIDE_RIGHT_1 = 'player_ride_right_1',
  PLAYER_RIDE_RIGHT_2 = 'player_ride_right_2',
  BOY_1_BACK = 'boy_1_back',
  BOY_2_BACK = 'boy_2_back',
  BOY_3_BACK = 'boy_3_back',
  BOY_4_BACK = 'boy_4_back',
  GIRL_1_BACK = 'girl_1_back',
  GIRL_2_BACK = 'girl_2_back',
  GIRL_3_BACK = 'girl_3_back',
  GIRL_4_BACK = 'girl_4_back',
  PLAYER_HM = 'player_hm',
  TYPES = 'types',
  TYPES_1 = 'types_1',
  POKEMON_CALL = 'pokemon_call',
  POKEMON_RECALL = 'pokemon_recall',
  POKEMON_OVERWORLD = `pokemon_overworld_0`,
  POKEMON_OVERWORLD_UP = `pokemon_overworld_up`,
  POKEMON_OVERWORLD_DOWN = `pokemon_overworld_down`,
  POKEMON_OVERWORLD_LEFT = `pokemon_overworld_left`,
  POKEMON_OVERWORLD_RIGHT = `pokemon_overworld_right`,
  POKEMON_OVERWORLD_UP_S = `pokemon_overworld_up_s`,
  POKEMON_OVERWORLD_DOWN_S = `pokemon_overworld_down_s`,
  POKEMON_OVERWORLD_LEFT_S = `pokemon_overworld_left_s`,
  POKEMON_OVERWORLD_RIGHT_S = `pokemon_overworld_right_s`,
  BAG_POCKET_BALL = 'bag_pocket_ball',
  BAG_POCKET_ETC = 'bag_pocket_etc',
  BAG_POCKET_BERRY = 'bag_pocket_berry',
  BAG_POCKET_KEY = 'bag_pocket_key',
  POKEBALL_THROW = 'pokeball_throw',
  POKEBALL_GROUND = 'pokeball_ground',
  EXCLMATION = 'exclamation',
  POKEBALL = 'pokeball',
  OVERWORLD_SHINY = 'overworld_shiny',
  EMO = 'emo',
  SPARKLE = 'sparkle',
  PARTICLE_EVOL = 'particle_evol',
  BATTLE_BALL_0 = 'battle_ball_0',
  BATTLE_BALL_1 = 'battle_ball_1',
  PARTICLE_ENTER_BALL = 'particle_enter_ball',
  GROUND_ITEM = 'ground_item',
  TUTORIAL_CHOICE_BALL = 'tutorial_choice_ball',
  TUTORIAL_CHOICE_FINGER = 'tutorial_choice_finger',
}

export const enum EASE {
  LINEAR = 'Linear',

  POWER1 = 'Power1',

  QUAD_EASEIN = 'Quad.easeIn',
  QUAD_EASEOUT = 'Quad.easeOut',
  QUAD_EASEINOUT = 'Quad.easeInOut',

  CUBIC_EASEIN = 'Cubic.easeIn',
  CUBIC_EASEOUT = 'Cubic.easeOut',
  CUBIC_EASEINOUT = 'Cubic.easeInOut',

  QUART_EASEIN = 'Quart.easeIn',
  QUART_EASEOUT = 'Quart.easeOut',
  QUART_EASEINOUT = 'Quart.easeInOut',

  QUINT_EASEIN = 'Quint.easeIn',
  QUINT_EASEOUT = 'Quint.easeOut',
  QUINT_EASEINOUT = 'Quint.easeInOut',

  SINE_EASEIN = 'Sine.easeIn',
  SINE_EASEOUT = 'Sine.easeOut',
  SINE_EASEINOUT = 'Sine.easeInOut',

  EXPO_EASEIN = 'Expo.easeIn',
  EXPO_EASEOUT = 'Expo.easeOut',
  EXPO_EASEINOUT = 'Expo.easeInOut',

  CIRC_EASEIN = 'Circ.easeIn',
  CIRC_EASEOUT = 'Circ.easeOut',
  CIRC_EASEINOUT = 'Circ.easeInOut',

  ELASTIC_EASEIN = 'Elastic.easeIn',
  ELASTIC_EASEOUT = 'Elastic.easeOut',
  ELASTIC_EASEINOUT = 'Elastic.easeInOut',

  BACK_EASEIN = 'Back.easeIn',
  BACK_EASEOUT = 'Back.easeOut',
  BACK_EASEINOUT = 'Back.easeInOut',

  BOUNCE_EASEIN = 'Bounce.easeIn',
  BOUNCE_EASEOUT = 'Bounce.easeOut',
  BOUNCE_EASEINOUT = 'Bounce.easeInOut',

  STEPPED = 'Stepped',
}

export enum AUDIO {
  SELECT_0 = 'select_0',
  SELECT_1 = 'select_1',
  SELECT_2 = 'select_2',
  OPEN_0 = 'open_0',
  OPEN_1 = 'open_1',
  CANCEL_0 = 'cancel_0',
  CANCEL_1 = 'cancel_1',
  GET_0 = 'get_0',
  BUY = 'buy',
  JUMP = 'jump',
  REACTION_0 = 'reaction_0',
  THROW = 'throw',
  DOOR_ENTER = 'enter',
  BALL_CATCH = 'ball_catch',
  BALL_DROP = 'ball_drop',
  BALL_ENTER = 'ball_enter',
  BALL_EXIT = 'ball_exit',
  BALL_SHAKE = 'ball_shake',
  BUZZER = 'buzzer',
  REWARD = 'reward',
  SHINY = 'shiny',
  FLEE = 'flee',
  EVOL_INTRO = 'evol_0',
  EVOL = 'evol_1',
  CONG = 'cong',
  HATCH = 'hatch',
}

export const enum DEPTH {
  TITLE = 1,
  GROUND = 0,
  NICKNAME = 10001,
  FOREGROND = 10000,
  OVERWORLD_UI = 10002,
  OVERWORLD_MENU = 10003,
  OVERWORLD_NEW_PAGE = 10004,
  MENU = 10049,
  BATTLE = 10050,
  MESSAGE = 20000,
  BATTLE_UI = 10020,
  BATTLE_STATUS = 10021,
  TOP = 11000,
}

export enum DIRECTION {
  NONE = 'none',
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

export const enum KEY {
  MENU = 83,
  SELECT = 88,
  CANCEL = 90,
  RUNNING = 82,
  ENTER = 13,
  LEFT = 37,
  UP = 38,
  RIGHT = 39,
  DOWN = 40,
  USE_1 = 49,
  USE_2 = 50,
  USE_3 = 51,
  USE_4 = 52,
  USE_5 = 53,
  USE_6 = 54,
  USE_7 = 55,
  USE_8 = 56,
  USE_9 = 57,
  QUICK_SLOT = 65, //A
}

export enum UI {
  CONNECT = 'ConnectUi',
  MESSAGE = 'MessageUi',
  LOGIN = 'LoginUi',
  REGISTER = 'RegisterUi',
  TITLE = 'TitleUi',
  WELCOME = 'WelcomeUi',
  NEWGAME = 'NewgameUi',
  STARTER = 'StarterUi',
  ACCOUNT_DELETE = 'AccountDeleteUi',
  CONNECT_ACCOUNT_DELETE = 'ConnectAccountDeleteUi',
  OVERWORLD = 'OverworldUi',
  OVERWORLD_HUD = 'OverworldHUDUi',
  OVERWORLD_MENU = 'OverworldMenuUi',
  OVERWORLD_CONNECTING = 'OverworldConnectingUi',
  BAG = 'BagUi',
  BAG_MENU = 'BagMenuUi',
  BAG_REGISTER = 'BagRegisterUi',
  SHOP = 'ShopUi',
  PC = 'PokePCUi',
  SAFARI_LIST = 'SafariListUi',
  HIDDEN_MOVE = 'HiddenMoveUi',
  DUMMY = 'DummyUi',
  BATTLE = 'BattleUi',
  EVOLVE = 'EvolveUi',
  INPUT_NICKNAME = 'InputNicknameUi',
  NOTICE = 'NoticeUi',
  OPTION = 'OptionUi',
  BLACK_SCREEN = 'BlackScreenUi',
  ACCOUNT_DELETE_RESTORE = 'AccountDeleteRestoreUi',
  QUICK_SLOT_ITEM = 'QuickSlotItemUi',
}

export const enum POKEMON_TYPE {
  NONE,
  FIRE,
  WATER,
  ELECTRIC,
  GRASS,
  ICE,
  FIGHT,
  POISON,
  GROUND,
  FLYING,
  PSYCHIC,
  BUG,
  ROCK,
  GHOST,
  DRAGON,
  DARK,
  STEEL,
  FAIRY,
  NORMAL,
}

export const enum OBJECT {
  NONE = 'none',
  PET = 'pet',
  WILD = 'wild',
  POKEMON = 'pokemon',
  PLAYER = 'player',
  OTHER_PLAYER = 'other-player',
  DOOR = 'door',
  NPC = 'npc',
  ITEM_THROW = 'item-throw',
  GROUND_ITEM = 'item-ground',
  STATUE = 'statue',
  SHOP_CHECKOUT = 'shop-checkout',
  POST_CHECKOUT = 'post-checkout',
}

export const enum ITEM {
  POKEBALL,
  KEY,
  BERRY,
  ETC,
}

export const enum ITEM_USAGE_TYPE {
  CONSUMABLE = 'CONSUMABLE',
  NON_CONSUMABLE = 'NON_CONSUMABLE',
  TICKET = 'ticket',
}

export enum MODE {
  NONE,
  AUTO_LOGIN,
  LOGIN,
  REGISTER,
  ACCOUNT_DELETE,
  ACCOUNT_DELETE_RESTORE,
  LOGOUT,
  CONNECT,
  CONNECT_SAFARI,
  CONNECT_ACCOUNT_DELETE,
  TITLE,
  NEWGAME,
  WELCOME,
  STARTER,
  OVERWORLD,
  OVERWORLD_MENU,
  BAG,
  PC,
  OPTION,
  BLACK_SCREEN,
  BATTLE,
  QUICK_SLOT_ITEM,
}

export function isMode(data: any): data is MODE {
  return Object.values(MODE).includes(data);
}

export enum EVENT {
  HUD_LOCATION_UPDATE,
  HUD_ITEMSLOT_UPDATE,
  HUD_PARTY_UPDATE,
  HUD_CANDY_UPDATE,
  HUD_SHOW_OVERWORLD,
  UPDATE_OVERWORLD_ICON_TINT,
  BATTLE_FINISH,
  BATTLE_UI_FINISH,
  SHOW_BATTLE_MENU,
  FORCE_CHANGE_BATTLE_MESSAGE,
  EVOLVE_FINISH_IN_PC,
  UPDATE_CATCHRATE,

  //socket event
  ADD_OTHER_PLAYER,
  REMOVE_OTHER_PLAYER,
  CURRENT_PLAYERS_IN_ROOM,
  UPDATE_OTHER_PLAYER_MOVEMENT,
}

export function isEvent(data: any): data is EVENT {
  return Object.values(EVENT).includes(data);
}

export enum BATTLE_AREA {
  FIELD = 'field',
}

export enum TIME {
  DAY = 'day',
  //   DUSK = 'dusk',
  //   NIGHT = 'night',
}

export const enum TEXTSTYLE {
  BAG_DESC,
  BAG_REGISTER,
  DEFAULT,
  DEFAULT_GRAY,
  DEFAULT_BLACK,
  SPECIAL,
  TITLE_MODAL,
  LOBBY_INPUT,
  MESSAGE_WHITE,
  MESSAGE_BLACK,
  MESSAGE_GRAY,
  MESSAGE_BLUE,
  ITEM_NOTICE,
  CHOICE_DEFAULT,
  BOX_POKEDEX,
  BOX_NAME,
  INPUT_GUIDE_WHITE,
  BOX_CAPTURE_TITLE,
  GENDER_0,
  GENDER_1,
  SPRING,
  SUMMER,
  FALL,
  WINTER,
  SEASON_SYMBOL,
  ONLY_WHITE,
  TYPE_FIRE,
  TYPE_WATER,
  TYPE_ELECTRIC,
  TYPE_GRASS,
  TYPE_ICE,
  TYPE_FIGHTING,
  TYPE_POISON,
  TYPE_GROUND,
  TYPE_FLYING,
  TYPE_PSYCHIC,
  TYPE_BUG,
  TYPE_ROCK,
  TYPE_GHOST,
  TYPE_DRAGON,
  TYPE_DARK,
  TYPE_STEEL,
  TYPE_FAIRY,
  TYPE_NORMAL,
}

export const enum OVERWORLD_TYPE {
  NONE,
  PLAZA,
  SAFARI,
}

export const enum PIPELINES {
  WIPE_RIGHTLEFT_SHADER = 'WipeRightToLeftShader',
}

export const enum PLAYER_STATUS {
  WALK = 'walk',
  RUNNING = 'running',
  RIDE = 'ride',
  SURF = 'surf',
  FISHING = 'fishing',
  TALK = 'talk',
  WARP = 'warp',
  JUMP = 'jump',
}

export enum POKEMON_STATUS {
  CAPTURED,
  ROAMING,
}

export const enum HttpErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  NOT_FOUND_INGAME = 'NOT_FOUND_INGAME',
  NOT_FOUND_INGAME_ITEM = 'NOT_FOUND_INGAME_ITEM',
  NOT_FOUND_INGAME_ITEM_TYPE = 'NOT_FOUND_INGAME_ITEM_TYPE',
  INGAME_ITEM_STOCK_LIMIT_EXCEEDED = 'INGAME_ITEM_STOCK_LIMIT_EXCEEDED',
  ALREADY_EXIST_ACCOUNT = 'ALREADY_EXIST_ACCOUNT',
  ALREADY_EXIST_NICKNAME = 'ALREADY_EXIST_NICKNAME',
  LOGIN_FAIL = 'LOGIN_FAIL',
  NOT_FOUND_ACCOUNT = 'NOT_FOUND_ACCOUNT',
  NOT_FOUND_ACCESS_TOKEN = 'NOT_FOUND_ACCESS_TOKEN',
  NOT_FOUND_REFRESH_TOKEN = 'NOT_FOUND_REFRESH_TOKEN',
  NOT_FOUND_TOKEN = 'NOT_FOUND_TOKEN',
  INVALID_ACCESS_TOKEN = 'INVALID_ACCESS_TOKEN',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  INGAME_PC_IS_FULL = 'INGAME_PC_IS_FULL',
  NOT_FOUND_INGAME_PC = 'NOT_FOUND_INGAME_PC',
  NOT_FOUND_POKEMON_DATA = 'NOT_FOUND_POKEMON_DATA',
  NO_MORE_EVOLVE = 'NO_MORE_EVOLVE',
  NOT_ENOUGH_CANDY = 'NOT_ENOUGH_CANDY',
  NOT_PURCHASABLE_INGAME_ITEM = 'NOT_PURCHASABLE_INGAME_ITEM',
}

export enum ItemCategory {
  POKEBALL = 'pokeball',
  ETC = 'etc',
  BERRY = 'berry',
  KEY = 'key',
}

export type ItemData = {
  key: string;
  usable: boolean;
  purchasable: boolean;
  registerable: boolean;
  price: number;
};

export type NpcData = {
  movable: boolean;
};

export const enum TYPE {
  NONE,
  FIRE,
  WATER,
  ELECTRIC,
  GRASS,
  ICE,
  FIGHT,
  POISON,
  GROUND,
  FLYING,
  PSYCHIC,
  BUG,
  ROCK,
  GHOST,
  DRAGON,
  DARK,
  STEEL,
  FAIRY,
  NORMAL,
}

export const enum DOOR_TYPE {
  ENTER,
  EXIT,
}

export enum Season {
  SPRING,
  SUMMER,
  FALL,
  WINTER,
}

export enum TextSpeed {
  SLOW = 100,
  MID = 50,
  FAST = 10,
}
