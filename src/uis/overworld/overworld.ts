import { AUDIO, BATTLE_AREA, DEPTH, DIRECTION, OVERWORLD_DOOR, OVERWORLD_INIT_POS, OVERWORLD_TYPE, TEXTURE, TRIGGER } from '../../enums';
import { OverworldGlobal } from '../../core/storage/overworld-storage';
import { OverworldUi } from './overworld-ui';
import { PlayerGlobal } from '../../core/storage/player-storage';

export abstract class Overworld {
  protected initPlayerDirection!: DIRECTION;
  protected key!: TEXTURE | string;
  protected sound!: AUDIO | string;
  protected isIndoor: boolean;
  protected area: TEXTURE | string;
  protected battleArea: BATTLE_AREA | null = null;
  protected isDayNightFilterEnabled: boolean = true;
  protected isAllowedRide: boolean = true;

  constructor(initPlayerDirection: DIRECTION, key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string, isDayNightFilterEnabled: boolean = true) {
    this.initPlayerDirection = initPlayerDirection;
    this.key = key;
    this.sound = sound;
    this.isIndoor = isIndoor;
    this.area = area;
    this.isDayNightFilterEnabled = isDayNightFilterEnabled;
  }

  abstract setup(ui: OverworldUi): void;

  setIsAllowedRide(isAllowedRide: boolean) {
    this.isAllowedRide = isAllowedRide;
  }

  getIsAllowedRide() {
    return this.isAllowedRide;
  }

  setBattleArea(battleArea: BATTLE_AREA) {
    this.battleArea = battleArea;
  }

  getBattleArea() {
    return this.battleArea;
  }

  getIsDayNightFilterEnabled() {
    return this.isDayNightFilterEnabled;
  }

  getInitPlayerDirection() {
    return this.initPlayerDirection;
  }

  getSound() {
    return this.sound;
  }

  getIsIndoor() {
    return this.isIndoor;
  }

  getArea() {
    return this.area;
  }
}

export class Plaza001 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.DOWN, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [
      TEXTURE.OUTDOOR_TILE_FLOOR,
      TEXTURE.OUTDOOR_TILE_OBJECT,
      TEXTURE.OUTDOOR_TILE_EDGE,
      TEXTURE.OUTDOOR_TILE_OBJECT_URBAN,
      TEXTURE.OUTDOOR_TILE_URBAN,
      TEXTURE.OUTDOOR_EVENT,
    ]);
    ui.getMap().setLayer(0, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND + 1);
    ui.getMap().setLayer(2, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 2);
    ui.getMap().setLayer(3, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 3);
    ui.getMap().setLayer(4, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 4);
    ui.getMap().setLayer(5, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 5);
    ui.getMap().setLayer(6, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 6);
    ui.getMap().setLayer(7, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 7);
    ui.getMap().setLayer(8, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 8);
    ui.getMap().setLayer(9, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 9);
    ui.getMap().setLayer(10, TEXTURE.OUTDOOR_EVENT, DEPTH.GROUND + 10);
    ui.getMap().setForegroundLayer(11, [TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_URBAN, TEXTURE.OUTDOOR_TILE_EDGE], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(12, [TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_URBAN], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.P001_WEST_GATE_0, OVERWORLD_INIT_POS.G001_RIGHT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P001_WEST_GATE_1, OVERWORLD_INIT_POS.G001_RIGHT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P001_LAB_0, OVERWORLD_INIT_POS.P002_EXIT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P001_POKE_MART_0, OVERWORLD_INIT_POS.P004_EXIT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P001_RIDE_MART_0, OVERWORLD_INIT_POS.P005_EXIT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P001_CITY_HALL_0, OVERWORLD_INIT_POS.P006_EXIT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P001_CITY_HALL_1, OVERWORLD_INIT_POS.P006_EXIT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P001_NPC1_0, OVERWORLD_INIT_POS.P007_EXIT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P001_BOUTIQUE_0, OVERWORLD_INIT_POS.P009_EXIT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P001_NPC2_0, OVERWORLD_INIT_POS.P010_EXIT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P001_CAFE_0, OVERWORLD_INIT_POS.P011_EXIT_0);
    // ui.getStatue().setupDoor(OVERWORLD_DOOR.P001_MUSEUM_0, OVERWORLD_INIT_POS.P011_EXIT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P001_BIG_MART_0, OVERWORLD_INIT_POS.P011_EXIT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P001_CLUB_ROOM_0, OVERWORLD_INIT_POS.P019_EXIT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P001_NPC3_0, OVERWORLD_INIT_POS.P020_EXIT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P001_NPC4_0, OVERWORLD_INIT_POS.P022_EXIT_0);

    ui.getStatue().setupSign(TEXTURE.BLANK, 18, 17, '', TEXTURE.WINDOW_NOTICE_0, undefined, 'menu:sign_0', ['menu:sign000']);
    ui.getStatue().setupSign(TEXTURE.BLANK, 40, 26, '', TEXTURE.WINDOW_NOTICE_0, undefined, 'menu:sign_0', ['menu:sign001']);
    ui.getStatue().setupSign(TEXTURE.BLANK, 40, 42, '', TEXTURE.WINDOW_NOTICE_0, undefined, 'menu:sign_0', ['menu:sign002']);
    ui.getStatue().setupSign(TEXTURE.BLANK, 35, 42, '', TEXTURE.WINDOW_NOTICE_0, undefined, 'menu:sign_0', ['menu:sign003']);
    ui.getStatue().setupSign(TEXTURE.BLANK, 23, 42, '', TEXTURE.WINDOW_NOTICE_0, undefined, 'menu:sign_0', ['menu:sign004']);

    ui.getStatue().setupSign(TEXTURE.BLANK, 15, 25, '', TEXTURE.WINDOW_NOTICE_1, undefined, 'menu:sign_1', ['menu:s001']);
    ui.getStatue().setupSign(TEXTURE.BLANK, 49, 32, '', TEXTURE.WINDOW_NOTICE_0, undefined, 'menu:sign_2');
    ui.getStatue().setupSign(TEXTURE.BLANK, 32, 40, '', TEXTURE.WINDOW_NOTICE_0, undefined, 'menu:sign_2');
    ui.getStatue().setupSign(TEXTURE.BLANK, 26, 40, '', TEXTURE.WINDOW_NOTICE_0, undefined, 'menu:sign_2');
  }
}

export class Plaza002 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area, false);
    this.setIsAllowedRide(false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND + 1);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND + 2);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND + 3);
    ui.getMap().setLayer(4, TEXTURE.INDOOR_EVENT, DEPTH.GROUND + 4);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT], DEPTH.FOREGROND);

    ui.getNpc().setup('npc029', 'npc:special001', 16, 6, DIRECTION.DOWN, ['script047_17', 'script047_18']);
    ui.getStatue().setupTrigger(23, 10, TRIGGER.TRIGGER_001, '');
    ui.getStatue().setupTrigger(23, 11, TRIGGER.TRIGGER_001, '');
    ui.getStatue().setupTrigger(23, 12, TRIGGER.TRIGGER_001, '');
    ui.getStatue().setupTrigger(23, 13, TRIGGER.TRIGGER_001, '');
    ui.getStatue().setupTrigger(23, 14, TRIGGER.TRIGGER_001, '');

    ui.getStatue().setupDoor(OVERWORLD_DOOR.P002_EXIT_0, OVERWORLD_INIT_POS.P001_LAB_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P002_EXIT_1, OVERWORLD_INIT_POS.P001_LAB_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P002_EXIT_2, OVERWORLD_INIT_POS.P001_LAB_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P002_STAIR_0, OVERWORLD_INIT_POS.P003_STAIR_0);
  }
}

export class Plaza003 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area, false);
    this.setIsAllowedRide(false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.INDOOR_EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getNpc().setup('npc024', '', 18, 13, DIRECTION.DOWN, PlayerGlobal.getData()?.isStarter1 ? ['script046_13'] : ['script046_14', 'script046_15', 'script046_16']);
    ui.getStatue().setupTrigger(11, 15, TRIGGER.TRIGGER_000, 'npc024');
    ui.getStatue().setupTrigger(11, 16, TRIGGER.TRIGGER_000, 'npc024');
    ui.getStatue().setupTrigger(11, 17, TRIGGER.TRIGGER_000, 'npc024');
    ui.getStatue().setupTrigger(11, 18, TRIGGER.TRIGGER_000, 'npc024');
    ui.getStatue().setupTrigger(11, 19, TRIGGER.TRIGGER_000, 'npc024');

    ui.getStatue().setupDoor(OVERWORLD_DOOR.P003_STAIR_0, OVERWORLD_INIT_POS.P002_STAIR_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P003_STAIR_1, OVERWORLD_INIT_POS.P002_STAIR_0);
  }
}

export class Plaza004 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area, false);
    this.setIsAllowedRide(false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.INDOOR_EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.P004_EXIT_0, OVERWORLD_INIT_POS.P001_POKE_MART_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P004_EXIT_1, OVERWORLD_INIT_POS.P001_POKE_MART_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P004_EXIT_2, OVERWORLD_INIT_POS.P001_POKE_MART_0);

    ui.getNpc().setup('npc002', '', 2, 5, DIRECTION.RIGHT, []);
    ui.getNpc().setup('npc002', '', 2, 7, DIRECTION.RIGHT, []);
    ui.getNpc().setupSpecial('shop', TEXTURE.BLANK, '', 3, 5, DIRECTION.RIGHT, ['shop_0'], ['poke-ball', 'great-ball', 'ultra-ball']);
    ui.getNpc().setupSpecial(
      'shop',
      TEXTURE.BLANK,
      '',
      3,
      7,
      DIRECTION.RIGHT,
      ['shop_0'],
      [
        'occa-berry',
        'passho-berry',
        'wacan-berry',
        'rindo-berry',
        'yache-berry',
        'chople-berry',
        'kebia-berry',
        'shuca-berry',
        'coba-berry',
        'payapa-berry',
        'tanga-berry',
        'charti-berry',
        'kasib-berry',
        'haban-berry',
        'colbur-berry',
        'babiri-berry',
        'roseli-berry',
        'chilan-berry',
        'enigma-berry',
      ],
    );
    ui.getNpc().setupSpecial('post', 'npc001', '', 2, 9, DIRECTION.DOWN, []);
  }
}

export class Plaza005 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area, false);
    this.setIsAllowedRide(false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.INDOOR_EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.P005_EXIT_0, OVERWORLD_INIT_POS.P001_RIDE_MART_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P005_EXIT_1, OVERWORLD_INIT_POS.P001_RIDE_MART_0);

    ui.getNpc().setupSpecial('bicycle_shop', 'npc004', '', 11, 6, DIRECTION.DOWN, []);
  }
}

export class Plaza006 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area, false);
    this.setIsAllowedRide(false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.INDOOR_EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.P006_EXIT_0, OVERWORLD_INIT_POS.P001_CITY_HALL_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P006_EXIT_1, OVERWORLD_INIT_POS.P001_CITY_HALL_1);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P006_EXIT_2, OVERWORLD_INIT_POS.P001_CITY_HALL_1);
  }
}
export class Plaza007 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area, false);
    this.setIsAllowedRide(false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.INDOOR_EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.P007_EXIT_0, OVERWORLD_INIT_POS.P001_NPC1_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P007_EXIT_1, OVERWORLD_INIT_POS.P001_NPC1_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P007_EXIT_2, OVERWORLD_INIT_POS.P001_NPC1_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P007_STAIR_0, OVERWORLD_INIT_POS.P008_STAIR_0);
  }
}

export class Plaza008 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area, false);
    this.setIsAllowedRide(false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.INDOOR_EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.P008_STAIR_0, OVERWORLD_INIT_POS.P007_STAIR_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P008_STAIR_1, OVERWORLD_INIT_POS.P007_STAIR_0);
  }
}

export class Plaza009 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area, false);
    this.setIsAllowedRide(false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.INDOOR_EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.P009_EXIT_0, OVERWORLD_INIT_POS.P001_BOUTIQUE_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P009_EXIT_1, OVERWORLD_INIT_POS.P001_BOUTIQUE_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P009_EXIT_2, OVERWORLD_INIT_POS.P001_BOUTIQUE_0);
  }
}

export class Plaza010 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area, false);
    this.setIsAllowedRide(false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.INDOOR_EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.P010_EXIT_0, OVERWORLD_INIT_POS.P001_NPC2_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P010_EXIT_1, OVERWORLD_INIT_POS.P001_NPC2_0);
  }
}

export class Plaza011 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area, false);
    this.setIsAllowedRide(false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.INDOOR_EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.P011_EXIT_0, OVERWORLD_INIT_POS.P001_CAFE_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P011_EXIT_1, OVERWORLD_INIT_POS.P001_CAFE_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P011_EXIT_2, OVERWORLD_INIT_POS.P001_CAFE_0);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.P011_STAIR_0, OVERWORLD_INIT_POS.P012_STAIR_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P011_STAIR_1, OVERWORLD_INIT_POS.P012_STAIR_1);
  }
}

export class Plaza012 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area, false);
    this.setIsAllowedRide(false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.INDOOR_EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.P012_STAIR_0, OVERWORLD_INIT_POS.P011_STAIR_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P012_STAIR_1, OVERWORLD_INIT_POS.P011_STAIR_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P012_STAIR_2, OVERWORLD_INIT_POS.P011_STAIR_1);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P012_STAIR_3, OVERWORLD_INIT_POS.P011_STAIR_1);
  }
}

export class Plaza019 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area, false);
    this.setIsAllowedRide(false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.INDOOR_EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.P019_EXIT_0, OVERWORLD_INIT_POS.P001_CLUB_ROOM_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P019_EXIT_1, OVERWORLD_INIT_POS.P001_CLUB_ROOM_0);
  }
}

export class Plaza020 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area, false);
    this.setIsAllowedRide(false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.INDOOR_EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.P020_EXIT_0, OVERWORLD_INIT_POS.P001_NPC3_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P020_EXIT_1, OVERWORLD_INIT_POS.P001_NPC3_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P020_STAIR_0, OVERWORLD_INIT_POS.P021_STAIR_0);
  }
}

export class Plaza021 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area, false);
    this.setIsAllowedRide(false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.INDOOR_EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.P021_STAIR_0, OVERWORLD_INIT_POS.P020_STAIR_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P021_STAIR_1, OVERWORLD_INIT_POS.P020_STAIR_0);
  }
}

export class Plaza022 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area, false);
    this.setIsAllowedRide(false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.INDOOR_EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.P022_EXIT_0, OVERWORLD_INIT_POS.P001_NPC4_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P022_EXIT_1, OVERWORLD_INIT_POS.P001_NPC4_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P022_EXIT_2, OVERWORLD_INIT_POS.P001_NPC4_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P022_STAIR_0, OVERWORLD_INIT_POS.P023_STAIR_0);
  }
}

export class Plaza023 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area, false);
    this.setIsAllowedRide(false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.INDOOR_EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.P023_STAIR_0, OVERWORLD_INIT_POS.P022_STAIR_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.P023_STAIR_1, OVERWORLD_INIT_POS.P022_STAIR_0);
  }
}

export class Gate001 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.DOWN, key, sound, isIndoor, area, false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.INDOOR_EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.G001_LEFT_0, OVERWORLD_INIT_POS.S001_RIGHT_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.G001_LEFT_1, OVERWORLD_INIT_POS.S001_RIGHT_ROAD_1);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.G001_LEFT_2, OVERWORLD_INIT_POS.S001_RIGHT_ROAD_1);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.G001_RIGHT_0, OVERWORLD_INIT_POS.P001_WEST_GATE_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.G001_RIGHT_1, OVERWORLD_INIT_POS.P001_WEST_GATE_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.G001_RIGHT_2, OVERWORLD_INIT_POS.P001_WEST_GATE_1);
  }
}

export class Gate002 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.DOWN, key, sound, isIndoor, area, false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.INDOOR_EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.G002_DOWN_0, OVERWORLD_INIT_POS.S001_UP_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.G002_DOWN_1, OVERWORLD_INIT_POS.S001_UP_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.G002_DOWN_2, OVERWORLD_INIT_POS.S001_UP_ROAD_1);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.G002_UP_0, OVERWORLD_INIT_POS.S002_DOWN_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.G002_UP_1, OVERWORLD_INIT_POS.S002_DOWN_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.G002_UP_2, OVERWORLD_INIT_POS.S002_DOWN_ROAD_1);
  }
}

export class Gate003 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.DOWN, key, sound, isIndoor, area, false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.INDOOR_EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.G003_RIGHT_0, OVERWORLD_INIT_POS.S002_LEFT_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.G003_RIGHT_1, OVERWORLD_INIT_POS.S002_LEFT_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.G003_RIGHT_2, OVERWORLD_INIT_POS.S002_LEFT_ROAD_1);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.G003_LEFT_0, OVERWORLD_INIT_POS.S007_RIGHT_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.G003_LEFT_1, OVERWORLD_INIT_POS.S007_RIGHT_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.G003_LEFT_2, OVERWORLD_INIT_POS.S007_RIGHT_ROAD_1);
  }
}

export class Gate004 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.DOWN, key, sound, isIndoor, area, false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.INDOOR_EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.G004_DOWN_0, OVERWORLD_INIT_POS.S011_UP_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.G004_DOWN_1, OVERWORLD_INIT_POS.S011_UP_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.G004_DOWN_2, OVERWORLD_INIT_POS.S011_UP_ROAD_1);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.G004_UP_0, OVERWORLD_INIT_POS.S010_DOWN_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.G004_UP_1, OVERWORLD_INIT_POS.S010_DOWN_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.G004_UP_2, OVERWORLD_INIT_POS.S010_DOWN_ROAD_1);
  }
}

export class Gate005 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.DOWN, key, sound, isIndoor, area, false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.INDOOR_EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.INDOOR_EVENT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.G005_RIGHT_0, OVERWORLD_INIT_POS.S001_LEFT_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.G005_RIGHT_1, OVERWORLD_INIT_POS.S001_LEFT_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.G005_RIGHT_2, OVERWORLD_INIT_POS.S001_LEFT_ROAD_0);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.G005_LEFT_0, OVERWORLD_INIT_POS.S010_RIGHT_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.G005_LEFT_1, OVERWORLD_INIT_POS.S010_RIGHT_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.G005_LEFT_2, OVERWORLD_INIT_POS.S010_RIGHT_ROAD_0);
  }
}

export class Safari001 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.DOWN, key, sound, isIndoor, area);
    this.setBattleArea(BATTLE_AREA.FIELD);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.SAFARI);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [
      TEXTURE.OUTDOOR_TILE_FLOOR,
      TEXTURE.OUTDOOR_TILE_EDGE,
      TEXTURE.OUTDOOR_TILE_URBAN,
      TEXTURE.OUTDOOR_TILE_OBJECT,
      TEXTURE.OUTDOOR_TILE_OBJECT_URBAN,
      TEXTURE.OUTDOOR_EVENT,
    ]);
    ui.getMap().setLayer(0, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND + 1);
    ui.getMap().setLayer(2, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 2);
    ui.getMap().setLayer(3, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 3);
    ui.getMap().setLayer(4, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 4);
    ui.getMap().setLayer(5, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 5);
    ui.getMap().setLayer(6, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 6);
    ui.getMap().setLayer(7, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 7);
    ui.getMap().setLayer(8, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 8);
    ui.getMap().setLayer(9, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 9);
    ui.getMap().setLayer(10, TEXTURE.OUTDOOR_EVENT, DEPTH.GROUND + 10);
    ui.getMap().setForegroundLayer(11, [TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_FLOOR, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, TEXTURE.OUTDOOR_TILE_URBAN], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(12, [TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_FLOOR, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, TEXTURE.OUTDOOR_TILE_URBAN], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.S001_RIGHT_ROAD_0, OVERWORLD_INIT_POS.G001_LEFT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S001_RIGHT_ROAD_1, OVERWORLD_INIT_POS.G001_LEFT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S001_UP_ROAD_0, OVERWORLD_INIT_POS.G002_DOWN_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S001_UP_ROAD_1, OVERWORLD_INIT_POS.G002_DOWN_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S001_LEFT_ROAD_0, OVERWORLD_INIT_POS.G005_RIGHT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S001_LEFT_ROAD_1, OVERWORLD_INIT_POS.G005_RIGHT_0);

    ui.getStatue().setupSign(TEXTURE.BLANK, 76, 14, '', TEXTURE.WINDOW_NOTICE_1, undefined, 'menu:sign_1', ['menu:p001']);
    ui.getStatue().setupSign(TEXTURE.BLANK, 77, 14, '', TEXTURE.WINDOW_NOTICE_1, undefined, 'menu:sign_1', ['menu:p001']);
    ui.getStatue().setupSign(TEXTURE.BLANK, 26, 14, '', TEXTURE.WINDOW_NOTICE_1, undefined, 'menu:sign_up_left', ['menu:s002', 'menu:s010']);
    ui.getStatue().setupSign(TEXTURE.BLANK, 27, 14, '', TEXTURE.WINDOW_NOTICE_1, undefined, 'menu:sign_up_left', ['menu:s002', 'menu:s010']);
  }
}

export class Safari002 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.DOWN, key, sound, isIndoor, area);
    this.setBattleArea(BATTLE_AREA.FIELD);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.SAFARI);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [
      TEXTURE.OUTDOOR_TILE_FLOOR,
      TEXTURE.OUTDOOR_TILE_EDGE,
      TEXTURE.OUTDOOR_TILE_URBAN,
      TEXTURE.OUTDOOR_TILE_OBJECT,
      TEXTURE.OUTDOOR_TILE_OBJECT_URBAN,
      TEXTURE.OUTDOOR_EVENT,
    ]);
    ui.getMap().setLayer(0, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND + 1);
    ui.getMap().setLayer(2, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 2);
    ui.getMap().setLayer(3, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 3);
    ui.getMap().setLayer(4, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 4);
    ui.getMap().setLayer(5, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 5);
    ui.getMap().setLayer(6, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 6);
    ui.getMap().setLayer(7, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 7);
    ui.getMap().setLayer(8, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 8);
    ui.getMap().setLayer(9, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 9);
    ui.getMap().setLayer(10, TEXTURE.OUTDOOR_EVENT, DEPTH.GROUND + 10);
    ui.getMap().setForegroundLayer(
      11,
      [TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_FLOOR, TEXTURE.OUTDOOR_TILE_EDGE, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, TEXTURE.OUTDOOR_TILE_URBAN],
      DEPTH.FOREGROND,
    );
    ui.getMap().setForeground1Layer(
      12,
      [TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_FLOOR, TEXTURE.OUTDOOR_TILE_EDGE, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, TEXTURE.OUTDOOR_TILE_URBAN],
      DEPTH.FOREGROND,
    );

    ui.getStatue().setupDoor(OVERWORLD_DOOR.S002_DOWN_ROAD_0, OVERWORLD_INIT_POS.G002_UP_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S002_DOWN_ROAD_1, OVERWORLD_INIT_POS.G002_UP_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S002_CAVE_0, OVERWORLD_INIT_POS.S003_DOWN_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S002_LEFT_ROAD_0, OVERWORLD_INIT_POS.G003_RIGHT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S002_LEFT_ROAD_1, OVERWORLD_INIT_POS.G003_RIGHT_0);

    ui.getStatue().setupSign(TEXTURE.BLANK, 20, 42, '', TEXTURE.WINDOW_NOTICE_1, undefined, 'menu:sign_up_down', ['menu:s003', 'menu:s001']);
    ui.getStatue().setupSign(TEXTURE.BLANK, 21, 42, '', TEXTURE.WINDOW_NOTICE_1, undefined, 'menu:sign_up_down', ['menu:s003', 'menu:s001']);
    ui.getStatue().setupSign(TEXTURE.BLANK, 31, 23, '', TEXTURE.WINDOW_NOTICE_0, undefined, 'menu:sign_0', ['menu:s003']);
    ui.getStatue().setupSign(TEXTURE.BLANK, 16, 25, '', TEXTURE.WINDOW_NOTICE_1, undefined, 'menu:sign_1', ['menu:s007']);
    ui.getStatue().setupSign(TEXTURE.BLANK, 17, 25, '', TEXTURE.WINDOW_NOTICE_1, undefined, 'menu:sign_1', ['menu:s007']);
  }
}

export class Safari003 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.DOWN, key, sound, isIndoor, area, false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.SAFARI);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [
      TEXTURE.OUTDOOR_TILE_FLOOR,
      TEXTURE.OUTDOOR_TILE_EDGE,
      TEXTURE.OUTDOOR_TILE_URBAN,
      TEXTURE.OUTDOOR_TILE_OBJECT,
      TEXTURE.OUTDOOR_TILE_OBJECT_URBAN,
      TEXTURE.OUTDOOR_EVENT,
    ]);
    ui.getMap().setLayer(0, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND + 1);
    ui.getMap().setLayer(2, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 2);
    ui.getMap().setLayer(3, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 3);
    ui.getMap().setLayer(4, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 4);
    ui.getMap().setLayer(5, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 5);
    ui.getMap().setLayer(6, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 6);
    ui.getMap().setLayer(7, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 7);
    ui.getMap().setLayer(8, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 8);
    ui.getMap().setLayer(9, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 9);
    ui.getMap().setLayer(10, TEXTURE.OUTDOOR_EVENT, DEPTH.GROUND + 10);
    ui.getMap().setForegroundLayer(11, [TEXTURE.OUTDOOR_TILE_EDGE], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(12, [TEXTURE.OUTDOOR_TILE_EDGE], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.S003_DOWN_ROAD_0, OVERWORLD_INIT_POS.S002_CAVE_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S003_UP_ROAD_0, OVERWORLD_INIT_POS.S005_DOWN_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S003_RIGHT_ROAD_0, OVERWORLD_INIT_POS.S004_LEFT_ROAD_0);
  }
}

export class Safari004 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.DOWN, key, sound, isIndoor, area, false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.SAFARI);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [
      TEXTURE.OUTDOOR_TILE_FLOOR,
      TEXTURE.OUTDOOR_TILE_EDGE,
      TEXTURE.OUTDOOR_TILE_URBAN,
      TEXTURE.OUTDOOR_TILE_OBJECT,
      TEXTURE.OUTDOOR_TILE_OBJECT_URBAN,
      TEXTURE.OUTDOOR_EVENT,
    ]);
    ui.getMap().setLayer(0, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND + 1);
    ui.getMap().setLayer(2, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 2);
    ui.getMap().setLayer(3, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 3);
    ui.getMap().setLayer(4, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 4);
    ui.getMap().setLayer(5, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 5);
    ui.getMap().setLayer(6, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 6);
    ui.getMap().setLayer(7, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 7);
    ui.getMap().setLayer(8, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 8);
    ui.getMap().setLayer(9, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 9);
    ui.getMap().setLayer(10, TEXTURE.OUTDOOR_EVENT, DEPTH.GROUND + 10);
    ui.getMap().setForegroundLayer(11, [TEXTURE.OUTDOOR_TILE_EDGE], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(12, [TEXTURE.OUTDOOR_TILE_EDGE], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.S004_LEFT_ROAD_0, OVERWORLD_INIT_POS.S003_RIGHT_ROAD_0);
  }
}

export class Safari005 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.DOWN, key, sound, isIndoor, area, false);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.SAFARI);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [
      TEXTURE.OUTDOOR_TILE_FLOOR,
      TEXTURE.OUTDOOR_TILE_EDGE,
      TEXTURE.OUTDOOR_TILE_URBAN,
      TEXTURE.OUTDOOR_TILE_OBJECT,
      TEXTURE.OUTDOOR_TILE_OBJECT_URBAN,
      TEXTURE.OUTDOOR_EVENT,
    ]);
    ui.getMap().setLayer(0, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND + 1);
    ui.getMap().setLayer(2, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 2);
    ui.getMap().setLayer(3, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 3);
    ui.getMap().setLayer(4, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 4);
    ui.getMap().setLayer(5, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 5);
    ui.getMap().setLayer(6, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 6);
    ui.getMap().setLayer(7, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 7);
    ui.getMap().setLayer(8, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 8);
    ui.getMap().setLayer(9, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 9);
    ui.getMap().setLayer(10, TEXTURE.OUTDOOR_EVENT, DEPTH.GROUND + 10);
    ui.getMap().setForegroundLayer(11, [TEXTURE.OUTDOOR_TILE_EDGE], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(12, [TEXTURE.OUTDOOR_TILE_EDGE], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.S005_DOWN_ROAD_0, OVERWORLD_INIT_POS.S003_UP_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S005_UP_ROAD_0, OVERWORLD_INIT_POS.S006_DOWN_ROAD_0);
  }
}

export class Safari006 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.DOWN, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.SAFARI);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [
      TEXTURE.OUTDOOR_TILE_FLOOR,
      TEXTURE.OUTDOOR_TILE_EDGE,
      TEXTURE.OUTDOOR_TILE_URBAN,
      TEXTURE.OUTDOOR_TILE_OBJECT,
      TEXTURE.OUTDOOR_TILE_OBJECT_URBAN,
      TEXTURE.OUTDOOR_EVENT,
    ]);
    ui.getMap().setLayer(0, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND + 1);
    ui.getMap().setLayer(2, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 2);
    ui.getMap().setLayer(3, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 3);
    ui.getMap().setLayer(4, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 4);
    ui.getMap().setLayer(5, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 5);
    ui.getMap().setLayer(6, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 6);
    ui.getMap().setLayer(7, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 7);
    ui.getMap().setLayer(8, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 8);
    ui.getMap().setLayer(9, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 9);
    ui.getMap().setLayer(10, TEXTURE.OUTDOOR_EVENT, DEPTH.GROUND + 10);
    ui.getMap().setForegroundLayer(11, [TEXTURE.OUTDOOR_TILE_EDGE, TEXTURE.OUTDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(12, [TEXTURE.OUTDOOR_TILE_EDGE, TEXTURE.OUTDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.S006_DOWN_ROAD_0, OVERWORLD_INIT_POS.S005_UP_ROAD_0);
  }
}

export class Safari007 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.DOWN, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.SAFARI);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [
      TEXTURE.OUTDOOR_TILE_FLOOR,
      TEXTURE.OUTDOOR_TILE_EDGE,
      TEXTURE.OUTDOOR_TILE_URBAN,
      TEXTURE.OUTDOOR_TILE_OBJECT,
      TEXTURE.OUTDOOR_TILE_OBJECT_URBAN,
      TEXTURE.OUTDOOR_EVENT,
    ]);
    ui.getMap().setLayer(0, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND + 1);
    ui.getMap().setLayer(2, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 2);
    ui.getMap().setLayer(3, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 3);
    ui.getMap().setLayer(4, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 4);
    ui.getMap().setLayer(5, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 5);
    ui.getMap().setLayer(6, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 6);
    ui.getMap().setLayer(7, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 7);
    ui.getMap().setLayer(8, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 8);
    ui.getMap().setLayer(9, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 9);
    ui.getMap().setLayer(10, TEXTURE.OUTDOOR_EVENT, DEPTH.GROUND + 10);
    ui.getMap().setForegroundLayer(11, [TEXTURE.OUTDOOR_TILE_EDGE, TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_URBAN, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(12, [TEXTURE.OUTDOOR_TILE_EDGE, TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_URBAN, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.S007_RIGHT_ROAD_0, OVERWORLD_INIT_POS.G003_LEFT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S007_RIGHT_ROAD_1, OVERWORLD_INIT_POS.G003_LEFT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S007_UP_ROAD_0, OVERWORLD_INIT_POS.S008_DOWN_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S007_UP_ROAD_1, OVERWORLD_INIT_POS.S008_DOWN_ROAD_1);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S007_UP_ROAD_2, OVERWORLD_INIT_POS.S008_DOWN_ROAD_2);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S007_UP_ROAD_3, OVERWORLD_INIT_POS.S008_DOWN_ROAD_3);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S007_UP_ROAD_4, OVERWORLD_INIT_POS.S008_DOWN_ROAD_4);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S007_UP_ROAD_5, OVERWORLD_INIT_POS.S008_DOWN_ROAD_5);
  }
}

export class Safari008 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.DOWN, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.SAFARI);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [
      TEXTURE.OUTDOOR_TILE_FLOOR,
      TEXTURE.OUTDOOR_TILE_EDGE,
      TEXTURE.OUTDOOR_TILE_URBAN,
      TEXTURE.OUTDOOR_TILE_OBJECT,
      TEXTURE.OUTDOOR_TILE_OBJECT_URBAN,
      TEXTURE.OUTDOOR_EVENT,
    ]);
    ui.getMap().setLayer(0, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND + 1);
    ui.getMap().setLayer(2, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 2);
    ui.getMap().setLayer(3, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 3);
    ui.getMap().setLayer(4, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 4);
    ui.getMap().setLayer(5, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 5);
    ui.getMap().setLayer(6, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 6);
    ui.getMap().setLayer(7, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 7);
    ui.getMap().setLayer(8, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 8);
    ui.getMap().setLayer(9, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 9);
    ui.getMap().setLayer(10, TEXTURE.OUTDOOR_EVENT, DEPTH.GROUND + 10);
    ui.getMap().setForegroundLayer(11, [TEXTURE.OUTDOOR_TILE_EDGE, TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_URBAN, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(12, [TEXTURE.OUTDOOR_TILE_EDGE, TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_URBAN, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.S008_DOWN_ROAD_0, OVERWORLD_INIT_POS.S007_UP_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S008_DOWN_ROAD_1, OVERWORLD_INIT_POS.S007_UP_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S008_DOWN_ROAD_2, OVERWORLD_INIT_POS.S007_UP_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S008_DOWN_ROAD_3, OVERWORLD_INIT_POS.S007_UP_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S008_DOWN_ROAD_4, OVERWORLD_INIT_POS.S007_UP_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S008_DOWN_ROAD_5, OVERWORLD_INIT_POS.S007_UP_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S008_LEFT_ROAD_0, OVERWORLD_INIT_POS.S009_RIGHT_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S008_LEFT_ROAD_1, OVERWORLD_INIT_POS.S009_RIGHT_ROAD_1);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S008_LEFT_ROAD_2, OVERWORLD_INIT_POS.S009_RIGHT_ROAD_2);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S008_LEFT_ROAD_3, OVERWORLD_INIT_POS.S009_RIGHT_ROAD_3);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S008_LEFT_ROAD_4, OVERWORLD_INIT_POS.S009_RIGHT_ROAD_3);
  }
}

export class Safari009 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.DOWN, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.SAFARI);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [
      TEXTURE.OUTDOOR_TILE_FLOOR,
      TEXTURE.OUTDOOR_TILE_EDGE,
      TEXTURE.OUTDOOR_TILE_URBAN,
      TEXTURE.OUTDOOR_TILE_OBJECT,
      TEXTURE.OUTDOOR_TILE_OBJECT_URBAN,
      TEXTURE.OUTDOOR_EVENT,
    ]);
    ui.getMap().setLayer(0, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND + 1);
    ui.getMap().setLayer(2, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 2);
    ui.getMap().setLayer(3, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 3);
    ui.getMap().setLayer(4, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 4);
    ui.getMap().setLayer(5, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 5);
    ui.getMap().setLayer(6, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 6);
    ui.getMap().setLayer(7, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 7);
    ui.getMap().setLayer(8, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 8);
    ui.getMap().setLayer(9, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 9);
    ui.getMap().setLayer(10, TEXTURE.OUTDOOR_EVENT, DEPTH.GROUND + 10);
    ui.getMap().setForegroundLayer(11, [TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(12, [TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.S009_RIGHT_ROAD_0, OVERWORLD_INIT_POS.S008_LEFT_ROAD_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S009_RIGHT_ROAD_1, OVERWORLD_INIT_POS.S008_LEFT_ROAD_1);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S009_RIGHT_ROAD_2, OVERWORLD_INIT_POS.S008_LEFT_ROAD_2);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S009_RIGHT_ROAD_3, OVERWORLD_INIT_POS.S008_LEFT_ROAD_3);
  }
}

export class Safari010 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.DOWN, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.SAFARI);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [
      TEXTURE.OUTDOOR_TILE_FLOOR,
      TEXTURE.OUTDOOR_TILE_EDGE,
      TEXTURE.OUTDOOR_TILE_URBAN,
      TEXTURE.OUTDOOR_TILE_OBJECT,
      TEXTURE.OUTDOOR_TILE_OBJECT_URBAN,
      TEXTURE.OUTDOOR_EVENT,
    ]);
    ui.getMap().setLayer(0, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND + 1);
    ui.getMap().setLayer(2, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 2);
    ui.getMap().setLayer(3, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 3);
    ui.getMap().setLayer(4, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 4);
    ui.getMap().setLayer(5, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 5);
    ui.getMap().setLayer(6, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 6);
    ui.getMap().setLayer(7, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 7);
    ui.getMap().setLayer(8, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 8);
    ui.getMap().setLayer(9, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 9);
    ui.getMap().setLayer(10, TEXTURE.OUTDOOR_EVENT, DEPTH.GROUND + 10);
    ui.getMap().setForegroundLayer(11, [TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, TEXTURE.OUTDOOR_TILE_URBAN, TEXTURE.OUTDOOR_TILE_EDGE], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(12, [TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, TEXTURE.OUTDOOR_TILE_URBAN, TEXTURE.OUTDOOR_TILE_EDGE], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.S010_RIGHT_ROAD_0, OVERWORLD_INIT_POS.G005_LEFT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S010_RIGHT_ROAD_1, OVERWORLD_INIT_POS.G005_LEFT_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S010_DOWN_ROAD_0, OVERWORLD_INIT_POS.G004_UP_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S010_DOWN_ROAD_1, OVERWORLD_INIT_POS.G004_UP_0);

    ui.getStatue().setupSign(TEXTURE.BLANK, 22, 17, '', TEXTURE.WINDOW_NOTICE_1, undefined, 'menu:sign_down_right', ['menu:s011', 'menu:s002']);
    ui.getStatue().setupSign(TEXTURE.BLANK, 23, 17, '', TEXTURE.WINDOW_NOTICE_1, undefined, 'menu:sign_down_right', ['menu:s011', 'menu:s002']);
  }
}

export class Safari011 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.DOWN, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.SAFARI);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [
      TEXTURE.OUTDOOR_TILE_FLOOR,
      TEXTURE.OUTDOOR_TILE_EDGE,
      TEXTURE.OUTDOOR_TILE_URBAN,
      TEXTURE.OUTDOOR_TILE_OBJECT,
      TEXTURE.OUTDOOR_TILE_OBJECT_URBAN,
      TEXTURE.OUTDOOR_EVENT,
    ]);
    ui.getMap().setLayer(0, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND + 1);
    ui.getMap().setLayer(2, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 2);
    ui.getMap().setLayer(3, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 3);
    ui.getMap().setLayer(4, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 4);
    ui.getMap().setLayer(5, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 5);
    ui.getMap().setLayer(6, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 6);
    ui.getMap().setLayer(7, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 7);
    ui.getMap().setLayer(8, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 8);
    ui.getMap().setLayer(9, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 9);
    ui.getMap().setLayer(10, TEXTURE.OUTDOOR_EVENT, DEPTH.GROUND + 10);
    ui.getMap().setForegroundLayer(11, [TEXTURE.OUTDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(12, [TEXTURE.OUTDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(OVERWORLD_DOOR.S011_UP_ROAD_0, OVERWORLD_INIT_POS.G004_DOWN_0);
    ui.getStatue().setupDoor(OVERWORLD_DOOR.S011_UP_ROAD_1, OVERWORLD_INIT_POS.G004_DOWN_0);
  }
}
