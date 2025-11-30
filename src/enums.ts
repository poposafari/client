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
  WINDOW_NOTICE_0 = 'window_notice_0',
  WINDOW_NOTICE_1 = 'window_notice_1',
  WINDOW_HELP = 'window_help',
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
  OUTDOOR_EVENT = 'outdoor_event',
  INDOOR_EVENT = 'indoor_event',
  GATE_TYPE_0 = 'gate_0', //게이트_타입0(가로형)
  PLAZA_001 = 'p001', //포포시티
  PLAZA_002 = 'p002', //호박사 연구소
  PLAZA_003 = 'p003', //호박사 집
  PLAZA_004 = 'p004', //프렌들리 숍
  PLAZA_005 = 'p005', //자전거 가게
  PLAZA_006 = 'p006', //시청
  PLAZA_007 = 'p007', //플라자 007
  PLAZA_008 = 'p008', //플라자 008
  PLAZA_009 = 'p009', //플라자 009
  PLAZA_010 = 'p010', //플라자 010
  PLAZA_011 = 'p011', //플라자 011
  PLAZA_012 = 'p012', //플라자 012
  PLAZA_013 = 'p013', //플라자 013
  PLAZA_014 = 'p014', //플라자 014
  PLAZA_015 = 'p015', //플라자 015
  PLAZA_016 = 'p016', //플라자 016
  PLAZA_017 = 'p017', //플라자 017
  PLAZA_018 = 'p018', //플라자 018
  PLAZA_019 = 'p019', //플라자 019
  PLAZA_020 = 'p020', //플라자 020
  PLAZA_021 = 'p021', //플라자 021
  PLAZA_022 = 'p022', //플라자 022
  PLAZA_023 = 'p023', //플라자 023
  GATE_001 = 'g001', //1번 게이트
  GATE_002 = 'g002', //2번 게이트
  GATE_003 = 'g003', //3번 게이트
  GATE_004 = 'g004', //4번 게이트
  SAFARI_001 = 's001', //1번 도로
  SAFARI_002 = 's002', //2번 도로
  SAFARI_003 = 's003', //3번 도로
  SAFARI_004 = 's004', //4번 도로
  SAFARI_005 = 's005', //5번 도로
  SAFARI_006 = 's006', //6번 도로
  SAFARI_007 = 's007', //7번 도로
  SAFARI_008 = 's008', //8번 도로
  SAFARI_009 = 's009', //9번 도로
  SAFARI_010 = 's010', //10번 도로
  SAFARI_011 = 's011', //11번 도로

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

  //area
  AREA_0 = 'area_0',
  AREA_1 = 'area_1',
  AREA_2 = 'area_2',
  AREA_3 = 'area_3',
  AREA_4 = 'area_4',
  AREA_5 = 'area_5',
  AREA_6 = 'area_6',
  AREA_7 = 'area_7',
  AREA_8 = 'area_8',
  AREA_9 = 'area_9',
  AREA_10 = 'area_10',
  AREA_11 = 'area_11',
  AREA_12 = 'area_12',
  AREA_13 = 'area_13',
  AREA_14 = 'area_14',
  AREA_15 = 'area_15',
  AREA_16 = 'area_16',

  //etc
  LOGO_0 = 'logo_0',
  LOGO_DISCORD = 'logo_discord',
  LOGO_GOOGLE = 'logo_google',
  HELP_ARROWS = 'help_arrows',
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
  LAMP = 'lamp',
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
  NPC_MOVEMENT = 'npc',
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
  //background sounds
  B000 = 'b000',
  B001 = 'b001',
  B002 = 'b002',
  B003 = 'b003',
  B004 = 'b004',
  B005 = 'b005',
  B006 = 'b006',
  B007 = 'b007',
  B008 = 'b008',
  B009 = 'b009',
  B010 = 'b010',
  B011 = 'b011',
  B012 = 'b012',
  B013 = 'b013',
  B014 = 'b014',
  B015 = 'b015',
  B016 = 'b016',
  B017 = 'b017',
  B018 = 'b018',
  B019 = 'b019',
  B020 = 'b020',
  B021 = 'b021',
  B022 = 'b022',
  B023 = 'b023',
  B024 = 'b024',
  B025 = 'b025',
  B026 = 'b026',
  B027 = 'b027',
  B028 = 'b028',
  B029 = 'b029',
  B030 = 'b030',
  B031 = 'b031',
  B032 = 'b032',
  B033 = 'b033',
  B034 = 'b034',

  //effect sounds
  SELECT_0 = 'select_0',
  SELECT_1 = 'select_1',
  SELECT_2 = 'select_2',
  OPEN_0 = 'open_0',
  OPEN_1 = 'open_1',
  OPEN_2 = 'open_2',
  CANCEL_0 = 'cancel_0',
  CANCEL_1 = 'cancel_1',
  GET_0 = 'get_0',
  BUY = 'buy',
  JUMP = 'jump',
  REACTION_0 = 'reaction_0',
  THROW = 'throw',
  DOOR_ENTER_0 = 'enter_0',
  DOOR_ENTER_1 = 'enter_1',
  DOOR_ENTER_2 = 'enter_2',
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
  A = 65,
  B = 66,
  C = 67,
  D = 68,
  E = 69,
  F = 70,
  G = 71,
  H = 72,
  I = 73,
  J = 74,
  K = 75,
  L = 76,
  M = 77,
  N = 78,
  O = 79,
  P = 80,
  Q = 81,
  R = 82,
  S = 83,
  T = 84,
  U = 85,
  V = 86,
  W = 87,
  X = 88,
  Y = 89,
  Z = 90,

  //숫자 키
  NUMBER_0 = 48,
  NUMBER_1 = 49,
  NUMBER_2 = 50,
  NUMBER_3 = 51,
  NUMBER_4 = 52,
  NUMBER_5 = 53,
  NUMBER_6 = 54,
  NUMBER_7 = 55,
  NUMBER_8 = 56,
  NUMBER_9 = 57,

  // 숫자 패드 키
  NUMPAD_0 = 96,
  NUMPAD_1 = 97,
  NUMPAD_2 = 98,
  NUMPAD_3 = 99,
  NUMPAD_4 = 100,
  NUMPAD_5 = 101,
  NUMPAD_6 = 102,
  NUMPAD_7 = 103,
  NUMPAD_8 = 104,
  NUMPAD_9 = 105,
  NUMPAD_MULTIPLY = 106,
  NUMPAD_ADD = 107,
  NUMPAD_ENTER = 108,
  NUMPAD_SUBTRACT = 109,
  NUMPAD_DECIMAL = 110,
  NUMPAD_DIVIDE = 111,

  ARROW_LEFT = 37,
  ARROW_UP = 38,
  ARROW_RIGHT = 39,
  ARROW_DOWN = 40,

  F1 = 112,
  F2 = 113,
  F3 = 114,
  F4 = 115,
  F5 = 116,
  F6 = 117,
  F7 = 118,
  F8 = 119,
  F9 = 120,
  F10 = 121,
  F11 = 122,
  F12 = 123,

  SPACE = 32,
  ENTER = 13,
  ESC = 27,
  TAB = 9,
  BACKSPACE = 8,
  DELETE = 46,
  INSERT = 45,
  HOME = 36,
  END = 35,
  PAGE_UP = 33,
  PAGE_DOWN = 34,

  SHIFT = 16,
  CTRL = 17,
  ALT = 18,
  CAPS_LOCK = 20,

  SEMICOLON = 186, // ;
  EQUALS = 187, // =
  COMMA = 188, // ,
  MINUS = 189, // -
  PERIOD = 190, // .
  FORWARD_SLASH = 191, // /
  BACKTICK = 192, // `
  OPEN_BRACKET = 219, // [
  BACK_SLASH = 220, // \
  CLOSE_BRACKET = 221, // ]
  QUOTE = 222, // '
}

export enum UI {
  CONNECT_BASE = 'ConnectBaseUi',
  CONNECT_ACCOUNT_DELETE = 'ConnectAccountDeleteUi',
  CONNECT_SAFARI = 'ConnectSafariUi',
  FAIL_TOKEN = 'FailTokenUi',
  LOGIN = 'LoginUi',
  REGISTER = 'RegisterUi',
  TITLE = 'TitleUi',
  WELCOME = 'WelcomeUi',
  HELP = 'HelpUi',
  STARTER = 'StarterUi',
  STARTER_POKEMON = 'StarterPokemonUi',
  ACCOUNT_DELETE = 'AccountDeleteUi',
  SEASON_SCREEN = 'SeasonScreenUi',
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
  TRIGGER = 'trigger',
  SIGN = 'sign',
  LAMP = 'lamp',
}

export const enum TRIGGER {
  TRIGGER_000 = 'trigger_000',
  TRIGGER_001 = 'trigger_001',
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
  FAIL_TOKEN,
  SEASON_SCREEN,
  CONTINUE,
  EVOLVE,
  LOGIN,
  REGISTER,
  ACCOUNT_DELETE,
  ACCOUNT_DELETE_RESTORE,
  CHECK_INGAME_DATA,
  LOGOUT,
  CONNECT,
  CONNECT_SAFARI,
  CONNECT_ACCOUNT_DELETE,
  TITLE,
  HELP,
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
  HIDDEN_MOVE,
  STARTER_POKEMON,
  CHECK_OVERWORLD,
}

export function isMode(data: any): data is MODE {
  return Object.values(MODE).includes(data);
}

export enum EVENT {
  HUD_SHOW_OVERWORLD,
  UPDATE_OVERWORLD_ICON_TINT,
  BATTLE_FINISH,
  BATTLE_UI_FINISH,
  SHOW_BATTLE_MENU,
  FORCE_CHANGE_BATTLE_MESSAGE,
  UI_CLOSED,
  USE_ITEM,
  SET_PET,
  FINISH_MOVEMENT_PLAYER,

  DISABLE_DAY_NIGHT_FILTER,
  ENABLE_DAY_NIGHT_FILTER,
  LANGUAGE_CHANGED,

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
  FOREST = 'forest',
  CAVE = 'cave',
  ROCKY = 'rocky',
  SNOW = 'snow',
  ICE = 'ice',
  SAND = 'sand',
  WATER = 'water',
}

export enum TIME {
  DAWN = 'dawn',
  DAY = 'day',
  DUSK = 'dusk',
  NIGHT = 'night',
}

export const enum TEXTSTYLE {
  SPLASH_TEXT,
  OVERWORLD_AREA_B,
  OVERWORLD_AREA_W,
  BAG_DESC,
  BAG_REGISTER,
  DEFAULT,
  DEFAULT_GRAY,
  DEFAULT_BLACK,
  SPECIAL,
  TITLE_MODAL,
  LOBBY_INPUT,
  SIGN_WHITE,
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
  RANK_COMMON,
  RANK_RARE,
  RANK_EPIC,
  RANK_LEGENDARY,
}

export const enum OVERWORLD_TYPE {
  NONE,
  PLAZA,
  SAFARI,
}

export const enum PIPELINES {
  WIPE_RIGHTLEFT_SHADER = 'WipeRightToLeftShader',
  DAY_NIGHT_FILTER = 'DayNightFilter',
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

export const enum OVERWORLD_ACTION {
  IDLE = 'IDLE',
  TALK = 'TALK',
  MENU = 'MENU',
  QUICK_SLOT = 'QUICK_SLOT',
  OPEN_DOOR = 'OPEN_DOOR',
  SURF = 'SURF',
  AUTO_WALK = 'AUTO_WALK',
  TRIGGER = 'TRIGGER',
  BATTLE = 'BATTLE',
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
  CONG = 60,
}

export enum MessageEndDelay {
  DEFAULT = 0,
  CONG = 2300,
  GET = 1200,
  FLEE = 400,
}

export enum OVERWORLD_DOOR {
  P001_WEST_GATE_0 = 'P001_WEST_GATE_0',
  P001_WEST_GATE_1 = 'P001_WEST_GATE_1',
  P001_SOUTH_GATE_0 = 'P001_SOUTH_GATE_0',
  P001_SOUTH_GATE_1 = 'P001_SOUTH_GATE_1',
  P001_NORTH_GATE_0 = 'P001_NORTH_GATE_0',
  P001_NORTH_GATE_1 = 'P001_NORTH_GATE_1',
  P001_EAST_GATE_0 = 'P001_EAST_GATE_0',
  P001_EAST_GATE_1 = 'P001_EAST_GATE_1',
  P001_LAB_0 = 'P001_LAB_0',
  P001_POKE_MART_0 = 'P001_POKE_MART_0',
  P001_RIDE_MART_0 = 'P001_RIDE_MART_0',
  P001_CITY_HALL_0 = 'P001_CITY_HALL_0',
  P001_CITY_HALL_1 = 'P001_CITY_HALL_1',
  P001_NPC1_0 = 'P001_NPC1_0',
  P001_BOUTIQUE_0 = 'P001_BOUTIQUE_0',
  P001_NPC2_0 = 'P001_NPC2_0',
  P001_CAFE_0 = 'P001_CAFE_0',
  P001_MUSEUM_0 = 'P001_MUSEUM_0',
  P001_BIG_MART_0 = 'P001_BIG_MART_0',
  P001_NPC3_0 = 'P001_NPC3_0',
  P001_NPC4_0 = 'P001_NPC4_0',
  P001_CLUB_ROOM_0 = 'P001_CLUB_ROOM_0',

  P002_EXIT_0 = 'P002_EXIT_0',
  P002_EXIT_1 = 'P002_EXIT_1',
  P002_EXIT_2 = 'P002_EXIT_2',
  P002_STAIR_0 = 'P002_STAIR_0',

  P003_STAIR_0 = 'P003_STAIR_0',
  P003_STAIR_1 = 'P003_STAIR_1',

  P004_EXIT_0 = 'P004_EXIT_0',
  P004_EXIT_1 = 'P004_EXIT_1',
  P004_EXIT_2 = 'P004_EXIT_2',

  P005_EXIT_0 = 'P005_EXIT_0',
  P005_EXIT_1 = 'P005_EXIT_1',

  P006_EXIT_0 = 'P006_EXIT_0',
  P006_EXIT_1 = 'P006_EXIT_1',
  P006_EXIT_2 = 'P006_EXIT_2',

  P007_EXIT_0 = 'P007_EXIT_0',
  P007_EXIT_1 = 'P007_EXIT_1',
  P007_EXIT_2 = 'P007_EXIT_2',
  P007_STAIR_0 = 'P007_STAIR_0',

  P008_STAIR_0 = 'P008_STAIR_0',
  P008_STAIR_1 = 'P008_STAIR_1',

  P009_EXIT_0 = 'P009_EXIT_0',
  P009_EXIT_1 = 'P009_EXIT_1',
  P009_EXIT_2 = 'P009_EXIT_2',

  P010_EXIT_0 = 'P010_EXIT_0',
  P010_EXIT_1 = 'P010_EXIT_1',

  P011_EXIT_0 = 'P011_EXIT_0',
  P011_EXIT_1 = 'P011_EXIT_1',
  P011_EXIT_2 = 'P011_EXIT_2',
  P011_STAIR_0 = 'P011_STAIR_0',
  P011_STAIR_1 = 'P011_STAIR_1',

  P012_STAIR_0 = 'P012_STAIR_0',
  P012_STAIR_1 = 'P012_STAIR_1',
  P012_STAIR_2 = 'P012_STAIR_2',
  P012_STAIR_3 = 'P012_STAIR_3',

  P019_EXIT_0 = 'P019_EXIT_0',
  P019_EXIT_1 = 'P019_EXIT_1',

  P020_EXIT_0 = 'P020_EXIT_0',
  P020_EXIT_1 = 'P020_EXIT_1',
  P020_STAIR_0 = 'P020_STAIR_0',

  P021_STAIR_0 = 'P021_STAIR_0',
  P021_STAIR_1 = 'P021_STAIR_1',

  P022_EXIT_0 = 'P022_EXIT_0',
  P022_EXIT_1 = 'P022_EXIT_1',
  P022_EXIT_2 = 'P022_EXIT_2',
  P022_STAIR_0 = 'P022_STAIR_0',

  P023_STAIR_0 = 'P023_STAIR_0',
  P023_STAIR_1 = 'P023_STAIR_1',

  G001_RIGHT_0 = 'G001_RIGHT_0',
  G001_RIGHT_1 = 'G001_RIGHT_1',
  G001_RIGHT_2 = 'G001_RIGHT_2',
  G001_LEFT_0 = 'G001_LEFT_0',
  G001_LEFT_1 = 'G001_LEFT_1',
  G001_LEFT_2 = 'G001_LEFT_2',

  G002_UP_0 = 'G002_UP_0',
  G002_UP_1 = 'G002_UP_1',
  G002_UP_2 = 'G002_UP_2',
  G002_DOWN_0 = 'G002_DOWN_0',
  G002_DOWN_1 = 'G002_DOWN_1',
  G002_DOWN_2 = 'G002_DOWN_2',

  G003_RIGHT_0 = 'G003_RIGHT_0',
  G003_RIGHT_1 = 'G003_RIGHT_1',
  G003_RIGHT_2 = 'G003_RIGHT_2',
  G003_LEFT_0 = 'G003_LEFT_0',
  G003_LEFT_1 = 'G003_LEFT_1',
  G003_LEFT_2 = 'G003_LEFT_2',

  G004_UP_0 = 'G004_UP_0',
  G004_UP_1 = 'G004_UP_1',
  G004_UP_2 = 'G004_UP_2',
  G004_DOWN_0 = 'G004_DOWN_0',
  G004_DOWN_1 = 'G004_DOWN_1',
  G004_DOWN_2 = 'G004_DOWN_2',

  S001_RIGHT_ROAD_0 = 'S001_RIGHT_ROAD_0',
  S001_RIGHT_ROAD_1 = 'S001_RIGHT_ROAD_1',
  S001_UP_ROAD_0 = 'S001_UP_ROAD_0',
  S001_UP_ROAD_1 = 'S001_UP_ROAD_1',
  S001_LEFT_ROAD_0 = 'S001_LEFT_ROAD_0',
  S001_LEFT_ROAD_1 = 'S001_LEFT_ROAD_1',
  S001_LEFT_ROAD_2 = 'S001_LEFT_ROAD_2',
  S001_LEFT_ROAD_3 = 'S001_LEFT_ROAD_3',
  S001_LEFT_ROAD_4 = 'S001_LEFT_ROAD_4',
  S001_LEFT_ROAD_5 = 'S001_LEFT_ROAD_5',

  S002_DOWN_ROAD_0 = 'S002_DOWN_ROAD_0',
  S002_DOWN_ROAD_1 = 'S002_DOWN_ROAD_1',
  S002_LEFT_ROAD_0 = 'S002_LEFT_ROAD_0',
  S002_LEFT_ROAD_1 = 'S002_LEFT_ROAD_1',
  S002_CAVE_0 = 'S002_CAVE_0',

  S003_DOWN_ROAD_0 = 'S003_DOWN_ROAD_0',
  S003_UP_ROAD_0 = 'S003_UP_ROAD_0',
  S003_RIGHT_ROAD_0 = 'S003_RIGHT_ROAD_0',

  S004_LEFT_ROAD_0 = 'S004_LEFT_ROAD_0',

  S005_DOWN_ROAD_0 = 'S005_DOWN_ROAD_0',
  S005_UP_ROAD_0 = 'S005_UP_ROAD_0',

  S006_DOWN_ROAD_0 = 'S006_DOWN_ROAD_0',

  S007_RIGHT_ROAD_0 = 'S007_RIGHT_ROAD_0',
  S007_RIGHT_ROAD_1 = 'S007_RIGHT_ROAD_1',
  S007_UP_ROAD_0 = 'S007_UP_ROAD_0',
  S007_UP_ROAD_1 = 'S007_UP_ROAD_1',
  S007_UP_ROAD_2 = 'S007_UP_ROAD_2',
  S007_UP_ROAD_3 = 'S007_UP_ROAD_3',
  S007_UP_ROAD_4 = 'S007_UP_ROAD_4',
  S007_UP_ROAD_5 = 'S007_UP_ROAD_5',

  S008_DOWN_ROAD_0 = 'S008_DOWN_ROAD_0',
  S008_DOWN_ROAD_1 = 'S008_DOWN_ROAD_1',
  S008_DOWN_ROAD_2 = 'S008_DOWN_ROAD_2',
  S008_DOWN_ROAD_3 = 'S008_DOWN_ROAD_3',
  S008_DOWN_ROAD_4 = 'S008_DOWN_ROAD_4',
  S008_DOWN_ROAD_5 = 'S008_DOWN_ROAD_5',
  S008_LEFT_ROAD_0 = 'S008_LEFT_ROAD_0',
  S008_LEFT_ROAD_1 = 'S008_LEFT_ROAD_1',
  S008_LEFT_ROAD_2 = 'S008_LEFT_ROAD_2',
  S008_LEFT_ROAD_3 = 'S008_LEFT_ROAD_3',
  S008_LEFT_ROAD_4 = 'S008_LEFT_ROAD_4',

  S009_RIGHT_ROAD_0 = 'S009_RIGHT_ROAD_0',
  S009_RIGHT_ROAD_1 = 'S009_RIGHT_ROAD_1',
  S009_RIGHT_ROAD_2 = 'S009_RIGHT_ROAD_2',
  S009_RIGHT_ROAD_3 = 'S009_RIGHT_ROAD_3',

  S010_RIGHT_ROAD_0 = 'S010_RIGHT_ROAD_0',
  S010_RIGHT_ROAD_1 = 'S010_RIGHT_ROAD_1',
  S010_RIGHT_ROAD_2 = 'S010_RIGHT_ROAD_2',
  S010_RIGHT_ROAD_3 = 'S010_RIGHT_ROAD_3',
  S010_RIGHT_ROAD_4 = 'S010_RIGHT_ROAD_4',
  S010_RIGHT_ROAD_5 = 'S010_RIGHT_ROAD_5',
  S010_DOWN_ROAD_0 = 'S010_DOWN_ROAD_0',
  S010_DOWN_ROAD_1 = 'S010_DOWN_ROAD_1',

  S011_UP_ROAD_0 = 'S011_UP_ROAD_0',
  S011_UP_ROAD_1 = 'S011_UP_ROAD_1',
}

export enum OVERWORLD_INIT_POS {
  P001_WEST_GATE_0 = 'P001_WEST_GATE_0',
  P001_WEST_GATE_1 = 'P001_WEST_GATE_1',
  P001_SOUTH_GATE_0 = 'P001_SOUTH_GATE_0',
  P001_SOUTH_GATE_1 = 'P001_SOUTH_GATE_1',
  P001_NORTH_GATE_0 = 'P001_NORTH_GATE_0',
  P001_NORTH_GATE_1 = 'P001_NORTH_GATE_1',
  P001_EAST_GATE_0 = 'P001_EAST_GATE_0',
  P001_EAST_GATE_1 = 'P001_EAST_GATE_1',
  P001_LAB_0 = 'P001_LAB_0',
  P001_POKE_MART_0 = 'P001_POKE_MART_0',
  P001_RIDE_MART_0 = 'P001_RIDE_MART_0',
  P001_CITY_HALL_0 = 'P001_CITY_HALL_0',
  P001_CITY_HALL_1 = 'P001_CITY_HALL_1',
  P001_NPC1_0 = 'P001_NPC1_0',
  P001_BOUTIQUE_0 = 'P001_BOUTIQUE_0',
  P001_NPC2_0 = 'P001_NPC2_0',
  P001_CAFE_0 = 'P001_CAFE_0',
  P001_MUSEUM_0 = 'P001_MUSEUM_0',
  P001_BIG_MART_0 = 'P001_BIG_MART_0',
  P001_NPC3_0 = 'P001_NPC3_0',
  P001_NPC4_0 = 'P001_NPC4_0',
  P001_CLUB_ROOM_0 = 'P001_CLUB_ROOM_0',

  P002_EXIT_0 = 'P002_EXIT_0',
  P002_STAIR_0 = 'P002_STAIR_0',

  P003_STAIR_0 = 'P003_STAIR_0',

  P004_EXIT_0 = 'P004_EXIT_0',

  P005_EXIT_0 = 'P005_EXIT_0',

  P006_EXIT_0 = 'P006_EXIT_0',

  P007_EXIT_0 = 'P007_EXIT_0',
  P007_STAIR_0 = 'P007_STAIR_0',

  P008_STAIR_0 = 'P008_STAIR_0',

  P009_EXIT_0 = 'P009_EXIT_0',

  P010_EXIT_0 = 'P010_EXIT_0',

  P011_EXIT_0 = 'P011_EXIT_0',
  P011_STAIR_0 = 'P011_STAIR_0',
  P011_STAIR_1 = 'P011_STAIR_1',

  P012_STAIR_0 = 'P012_STAIR_0',
  P012_STAIR_1 = 'P012_STAIR_1',

  P019_EXIT_0 = 'P019_EXIT_0',

  P020_EXIT_0 = 'P020_EXIT_0',
  P020_STAIR_0 = 'P020_STAIR_0',

  P021_STAIR_0 = 'P021_STAIR_0',

  P022_EXIT_0 = 'P022_EXIT_0',
  P022_STAIR_0 = 'P022_STAIR_0',

  P023_STAIR_0 = 'P023_STAIR_0',

  G001_RIGHT_0 = 'G001_RIGHT_0',
  G001_LEFT_0 = 'G001_LEFT_0',

  G002_UP_0 = 'G002_UP_0',
  G002_DOWN_0 = 'G002_DOWN_0',

  G003_RIGHT_0 = 'G003_RIGHT_0',
  G003_LEFT_0 = 'G003_LEFT_0',

  G004_UP_0 = 'G004_UP_0',
  G004_DOWN_0 = 'G004_DOWN_0',

  S001_RIGHT_ROAD_0 = 'S001_RIGHT_ROAD_0',
  S001_RIGHT_ROAD_1 = 'S001_RIGHT_ROAD_1',
  S001_UP_ROAD_0 = 'S001_UP_ROAD_0',
  S001_UP_ROAD_1 = 'S001_UP_ROAD_1',
  S001_LEFT_ROAD_0 = 'S001_LEFT_ROAD_0',
  S001_LEFT_ROAD_1 = 'S001_LEFT_ROAD_1',
  S001_LEFT_ROAD_2 = 'S001_LEFT_ROAD_2',
  S001_LEFT_ROAD_3 = 'S001_LEFT_ROAD_3',
  S001_LEFT_ROAD_4 = 'S001_LEFT_ROAD_4',
  S001_LEFT_ROAD_5 = 'S001_LEFT_ROAD_5',

  S002_DOWN_ROAD_0 = 'S002_DOWN_ROAD_0',
  S002_DOWN_ROAD_1 = 'S002_DOWN_ROAD_1',
  S002_LEFT_ROAD_0 = 'S002_LEFT_ROAD_0',
  S002_LEFT_ROAD_1 = 'S002_LEFT_ROAD_1',
  S002_CAVE_0 = 'S002_CAVE_0',

  S003_DOWN_ROAD_0 = 'S003_DOWN_ROAD_0',
  S003_UP_ROAD_0 = 'S003_UP_ROAD_0',
  S003_RIGHT_ROAD_0 = 'S003_RIGHT_ROAD_0',

  S004_LEFT_ROAD_0 = 'S004_LEFT_ROAD_0',

  S005_DOWN_ROAD_0 = 'S005_DOWN_ROAD_0',
  S005_UP_ROAD_0 = 'S005_UP_ROAD_0',

  S006_DOWN_ROAD_0 = 'S006_DOWN_ROAD_0',

  S007_RIGHT_ROAD_0 = 'S007_RIGHT_ROAD_0',
  S007_RIGHT_ROAD_1 = 'S007_RIGHT_ROAD_1',
  S007_UP_ROAD_0 = 'S007_UP_ROAD_0',
  S007_UP_ROAD_1 = 'S007_UP_ROAD_1',
  S007_UP_ROAD_2 = 'S007_UP_ROAD_2',
  S007_UP_ROAD_3 = 'S007_UP_ROAD_3',
  S007_UP_ROAD_4 = 'S007_UP_ROAD_4',
  S007_UP_ROAD_5 = 'S007_UP_ROAD_5',

  S008_DOWN_ROAD_0 = 'S008_DOWN_ROAD_0',
  S008_DOWN_ROAD_1 = 'S008_DOWN_ROAD_1',
  S008_DOWN_ROAD_2 = 'S008_DOWN_ROAD_2',
  S008_DOWN_ROAD_3 = 'S008_DOWN_ROAD_3',
  S008_DOWN_ROAD_4 = 'S008_DOWN_ROAD_4',
  S008_DOWN_ROAD_5 = 'S008_DOWN_ROAD_5',
  S008_LEFT_ROAD_0 = 'S008_LEFT_ROAD_0',
  S008_LEFT_ROAD_1 = 'S008_LEFT_ROAD_1',
  S008_LEFT_ROAD_2 = 'S008_LEFT_ROAD_2',
  S008_LEFT_ROAD_3 = 'S008_LEFT_ROAD_3',
  S008_LEFT_ROAD_4 = 'S008_LEFT_ROAD_4',

  S009_RIGHT_ROAD_0 = 'S009_RIGHT_ROAD_0',
  S009_RIGHT_ROAD_1 = 'S009_RIGHT_ROAD_1',
  S009_RIGHT_ROAD_2 = 'S009_RIGHT_ROAD_2',
  S009_RIGHT_ROAD_3 = 'S009_RIGHT_ROAD_3',

  S010_RIGHT_ROAD_0 = 'S010_RIGHT_ROAD_0',
  S010_RIGHT_ROAD_1 = 'S010_RIGHT_ROAD_1',
  S010_RIGHT_ROAD_2 = 'S010_RIGHT_ROAD_2',
  S010_RIGHT_ROAD_3 = 'S010_RIGHT_ROAD_3',
  S010_RIGHT_ROAD_4 = 'S010_RIGHT_ROAD_4',
  S010_RIGHT_ROAD_5 = 'S010_RIGHT_ROAD_5',
  S010_DOWN_ROAD_0 = 'S010_DOWN_ROAD_0',
  S010_DOWN_ROAD_1 = 'S010_DOWN_ROAD_1',

  S011_UP_ROAD_0 = 'S011_UP_ROAD_0',
  S011_UP_ROAD_1 = 'S011_UP_ROAD_1',
}
