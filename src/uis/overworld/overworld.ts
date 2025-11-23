import { Event } from '../../core/manager/event-manager';
import { AUDIO, DEPTH, DIRECTION, EVENT, OBJECT, OVERWORLD_TYPE, TEXTSTYLE, TEXTURE, TRIGGER } from '../../enums';
import i18next from '../../i18n';
import { OverworldGlobal } from '../../core/storage/overworld-storage';
import { PostOfficeType, ShopType } from '../../types';
import { OverworldUi } from './overworld-ui';
import { PlayerGlobal } from '../../core/storage/player-storage';
import { Bag } from '../../core/storage/bag-storage';

export abstract class Overworld {
  protected initPlayerDirection!: DIRECTION;
  protected key!: TEXTURE | string;
  protected sound!: AUDIO | string;
  protected isIndoor: boolean;
  protected area: TEXTURE | string;

  constructor(initPlayerDirection: DIRECTION, key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    this.initPlayerDirection = initPlayerDirection;
    this.key = key;
    this.sound = sound;
    this.isIndoor = isIndoor;
    this.area = area;
  }

  abstract setup(ui: OverworldUi): void;

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
      TEXTURE.EVENT,
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
    ui.getMap().setLayer(10, TEXTURE.EVENT, DEPTH.GROUND + 10);
    ui.getMap().setForegroundLayer(11, [TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_URBAN, TEXTURE.OUTDOOR_TILE_EDGE], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(12, [TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_URBAN], DEPTH.FOREGROND);

    ui.getStatue().setupDoor('door_9', 12, 14, +7, 130, 102, TEXTURE.PLAZA_002, 16, 21);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 3, 24, +3, 142, 98, TEXTURE.GATE_001, 16, 7);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 3, 25, +3, 142, 98, TEXTURE.GATE_001, 16, 8);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 3, 26, +3, 142, 98, TEXTURE.GATE_001, 16, 9);

    ui.getStatue().setupDoor('door_1', 16, 23, +3, 142, 98, TEXTURE.PLAZA_004, 7, 11);
    ui.getStatue().setupDoor('door_1', 22, 23, +9, 138, 95, TEXTURE.PLAZA_005, 7, 13);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 28, 22, +9, 138, 95, TEXTURE.PLAZA_006, 9, 20);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 29, 22, +9, 138, 95, TEXTURE.PLAZA_006, 9, 20);

    ui.getStatue().setupDoor('door_22', 40, 23, +12, 132, 118, TEXTURE.PLAZA_007, 9, 15);

    ui.getStatue().setupDoor('door_6', 40, 30, +9, 142, 112, TEXTURE.PLAZA_009, 7, 12);

    ui.getStatue().setupDoor('door_13', 46, 30, +9, 116, 112, TEXTURE.PLAZA_010, 7, 12);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 29, 39, +9, 116, 112, TEXTURE.PLAZA_011, 8, 19);

    ui.getStatue().setupDoor('door_1', 17, 38, +6, 116, 100, TEXTURE.PLAZA_013, 8, 19);

    ui.getStatue().setupDoor('door_13', 35, 48, +7, 116, 92, TEXTURE.PLAZA_019, 1, 19);

    ui.getStatue().setupDoor('door_3', 29, 48, +7, 116, 92, TEXTURE.PLAZA_020, 8, 18);

    ui.getStatue().setupDoor('door_4', 17, 48, +7, 140, 90, TEXTURE.PLAZA_022, 9, 17);

    ui.getStatue().setupSign(TEXTURE.BLANK, 9, 15, i18next.t('menu:sign001'), TEXTURE.WINDOW_NOTICE_0);
    ui.getStatue().setupSign(TEXTURE.BLANK, 31, 24, i18next.t('menu:sign002'), TEXTURE.WINDOW_NOTICE_0);
    ui.getStatue().setupSign(TEXTURE.BLANK, 31, 40, i18next.t('menu:sign003'), TEXTURE.WINDOW_NOTICE_0);
    ui.getStatue().setupSign(TEXTURE.BLANK, 26, 40, i18next.t('menu:sign004'), TEXTURE.WINDOW_NOTICE_0);
    ui.getStatue().setupSign(TEXTURE.BLANK, 14, 40, i18next.t('menu:sign005'), TEXTURE.WINDOW_NOTICE_0);
    ui.getStatue().setupSign(TEXTURE.BLANK, 17, 38, i18next.t('menu:underConstruction001'), TEXTURE.WINDOW_NOTICE_0);
    ui.getStatue().setupSign(TEXTURE.BLANK, 23, 38, i18next.t('menu:underConstruction002'), TEXTURE.WINDOW_NOTICE_0);
    ui.getStatue().setupSign(TEXTURE.BLANK, 40, 30, i18next.t('menu:underConstruction003'), TEXTURE.WINDOW_NOTICE_0);
  }
}

export class Plaza002 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND + 1);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND + 2);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND + 3);
    ui.getMap().setLayer(4, TEXTURE.EVENT, DEPTH.GROUND + 4);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.EVENT], DEPTH.FOREGROND);

    ui.getNpc().setup('npc029', i18next.t('npc:special001'), 16, 6, DIRECTION.DOWN, ['script047_17', 'script047_18']);
    ui.getStatue().setupTrigger(23, 10, TRIGGER.TRIGGER_001, '');
    ui.getStatue().setupTrigger(23, 11, TRIGGER.TRIGGER_001, '');
    ui.getStatue().setupTrigger(23, 12, TRIGGER.TRIGGER_001, '');
    ui.getStatue().setupTrigger(23, 13, TRIGGER.TRIGGER_001, '');
    ui.getStatue().setupTrigger(23, 14, TRIGGER.TRIGGER_001, '');

    ui.getStatue().setupDoor(TEXTURE.BLANK, 15, 22, +3, 142, 98, TEXTURE.PLAZA_001, 12, 15);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 16, 22, +3, 142, 98, TEXTURE.PLAZA_001, 12, 15);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 17, 22, +3, 142, 98, TEXTURE.PLAZA_001, 12, 15);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 33, 4, +3, 142, 98, TEXTURE.PLAZA_003, 27, 4);
  }
}

export class Plaza003 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getNpc().setup('npc024', '', 18, 13, DIRECTION.DOWN, PlayerGlobal.getData()?.isStarter1 ? ['script046_13'] : ['script046_14', 'script046_15', 'script046_16']);
    ui.getStatue().setupTrigger(11, 15, TRIGGER.TRIGGER_000, 'npc024');
    ui.getStatue().setupTrigger(11, 16, TRIGGER.TRIGGER_000, 'npc024');
    ui.getStatue().setupTrigger(11, 17, TRIGGER.TRIGGER_000, 'npc024');
    ui.getStatue().setupTrigger(11, 18, TRIGGER.TRIGGER_000, 'npc024');
    ui.getStatue().setupTrigger(11, 19, TRIGGER.TRIGGER_000, 'npc024');

    ui.getStatue().setupDoor(TEXTURE.BLANK, 26, 4, +3, 142, 98, TEXTURE.PLAZA_002, 32, 4);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 26, 5, +3, 142, 98, TEXTURE.PLAZA_002, 32, 4);
  }
}

export class Plaza004 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 6, 12, +3, 142, 98, TEXTURE.PLAZA_001, 16, 24);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 7, 12, +3, 142, 98, TEXTURE.PLAZA_001, 16, 24);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 8, 12, +3, 142, 98, TEXTURE.PLAZA_001, 16, 24);

    ui.getNpc().setup('npc002', '', 2, 5, DIRECTION.RIGHT, []);
    ui.getNpc().setup('npc002', '', 2, 7, DIRECTION.RIGHT, []);
    ui.getNpc().setupSpecial('shop', TEXTURE.BLANK, '', 3, 5, DIRECTION.RIGHT, ['shop_0'], ['002', '003', '004']);
    ui.getNpc().setupSpecial(
      'shop',
      TEXTURE.BLANK,
      '',
      3,
      7,
      DIRECTION.RIGHT,
      ['shop_0'],
      ['011', '012', '013', '014', '015', '016', '017', '018', '019', '020', '021', '022', '023', '024', '025', '026', '027', '028', '029'],
    );
    ui.getNpc().setupSpecial('post', 'npc001', '', 2, 9, DIRECTION.DOWN, []);
  }
}

export class Plaza005 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 7, 14, +3, 142, 98, TEXTURE.PLAZA_001, 22, 24);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 8, 14, +3, 142, 98, TEXTURE.PLAZA_001, 22, 24);

    ui.getNpc().setupSpecial('bicycle_shop', 'npc004', '', 11, 6, DIRECTION.DOWN, []);
  }
}

export class Plaza006 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 8, 21, +3, 142, 98, TEXTURE.PLAZA_001, 28, 23);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 9, 21, +3, 142, 98, TEXTURE.PLAZA_001, 28, 23);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 10, 21, +3, 142, 98, TEXTURE.PLAZA_001, 29, 23);
  }
}
export class Plaza007 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 8, 16, +3, 142, 98, TEXTURE.PLAZA_001, 40, 24);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 9, 16, +3, 142, 98, TEXTURE.PLAZA_001, 40, 24);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 10, 16, +3, 142, 98, TEXTURE.PLAZA_001, 40, 24);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 13, 4, +3, 142, 98, TEXTURE.PLAZA_008, 13, 4);
  }
}

export class Plaza008 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 12, 4, +3, 142, 98, TEXTURE.PLAZA_007, 12, 4);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 12, 5, +3, 142, 98, TEXTURE.PLAZA_007, 12, 4);
  }
}

export class Plaza009 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 7, 13, +3, 142, 98, TEXTURE.PLAZA_001, 40, 31);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 8, 13, +3, 142, 98, TEXTURE.PLAZA_001, 40, 31);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 9, 13, +3, 142, 98, TEXTURE.PLAZA_001, 40, 31);
  }
}

export class Plaza010 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 7, 13, +3, 142, 98, TEXTURE.PLAZA_001, 46, 31);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 8, 13, +3, 142, 98, TEXTURE.PLAZA_001, 46, 31);
  }
}

export class Plaza011 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 7, 20, +3, 142, 98, TEXTURE.PLAZA_001, 29, 40);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 8, 20, +3, 142, 98, TEXTURE.PLAZA_001, 29, 40);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 9, 20, +3, 142, 98, TEXTURE.PLAZA_001, 29, 40);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 2, 4, +3, 142, 98, TEXTURE.PLAZA_012, 4, 4);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 14, 4, +3, 142, 98, TEXTURE.PLAZA_012, 12, 4);
  }
}

export class Plaza012 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 5, 4, +3, 142, 98, TEXTURE.PLAZA_011, 3, 4);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 5, 5, +3, 142, 98, TEXTURE.PLAZA_011, 3, 4);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 11, 4, +3, 142, 98, TEXTURE.PLAZA_011, 13, 4);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 11, 5, +3, 142, 98, TEXTURE.PLAZA_011, 13, 4);
  }
}

export class Plaza019 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 1, 20, +3, 142, 98, TEXTURE.PLAZA_001, 35, 49);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 2, 20, +3, 142, 98, TEXTURE.PLAZA_001, 35, 49);
  }
}

export class Plaza020 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 10, 4, +3, 142, 98, TEXTURE.PLAZA_021, 13, 3);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 10, 4, +3, 142, 98, TEXTURE.PLAZA_021, 13, 4);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 8, 19, +3, 142, 98, TEXTURE.PLAZA_001, 29, 49);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 9, 19, +3, 142, 98, TEXTURE.PLAZA_001, 29, 49);
  }
}

export class Plaza021 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 12, 3, +3, 142, 98, TEXTURE.PLAZA_020, 9, 4);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 12, 4, +3, 142, 98, TEXTURE.PLAZA_020, 9, 4);
  }
}

export class Plaza022 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 2, 4, +3, 142, 98, TEXTURE.PLAZA_023, 15, 4);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 8, 18, +3, 142, 98, TEXTURE.PLAZA_001, 17, 49);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 9, 18, +3, 142, 98, TEXTURE.PLAZA_001, 17, 49);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 10, 18, +3, 142, 98, TEXTURE.PLAZA_001, 17, 49);
  }
}

export class Plaza023 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.UP, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(6, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 16, 4, +3, 142, 98, TEXTURE.PLAZA_022, 3, 4);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 16, 5, +3, 142, 98, TEXTURE.PLAZA_022, 3, 4);
  }
}

export class Gate001 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.DOWN, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.EVENT], DEPTH.FOREGROND);

    //left door
    ui.getStatue().setupDoor(TEXTURE.BLANK, 0, 7, +3, 142, 98, TEXTURE.SAFARI_001, 64, 24);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 0, 8, +3, 142, 98, TEXTURE.SAFARI_001, 64, 25);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 0, 9, +3, 142, 98, TEXTURE.SAFARI_001, 64, 26);

    //right door
    ui.getStatue().setupDoor(TEXTURE.BLANK, 17, 7, +3, 142, 98, TEXTURE.PLAZA_001, 4, 24);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 17, 8, +3, 142, 98, TEXTURE.PLAZA_001, 4, 25);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 17, 9, +3, 142, 98, TEXTURE.PLAZA_001, 4, 26);
  }
}

export class Gate002 extends Overworld {
  constructor(key: TEXTURE | string, sound: AUDIO | string, isIndoor: boolean, area: TEXTURE | string) {
    super(DIRECTION.DOWN, key, sound, isIndoor, area);
  }

  setup(ui: OverworldUi): void {
    ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldGlobal.setKey(this.key as string);

    ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.EVENT]);
    ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    ui.getMap().setLayer(4, TEXTURE.EVENT, DEPTH.GROUND);
    ui.getMap().setForegroundLayer(5, [TEXTURE.INDOOR_TILE_OBJECT, TEXTURE.EVENT], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 0, 7, +3, 142, 98, TEXTURE.SAFARI_002, 70, 26);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 0, 8, +3, 142, 98, TEXTURE.SAFARI_002, 70, 27);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 0, 9, +3, 142, 98, TEXTURE.SAFARI_002, 70, 28);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 17, 7, +3, 142, 98, TEXTURE.SAFARI_001, 5, 27);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 17, 8, +3, 142, 98, TEXTURE.SAFARI_001, 5, 28);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 17, 9, +3, 142, 98, TEXTURE.SAFARI_001, 5, 29);
  }
}

export class Safari001 extends Overworld {
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
      TEXTURE.EVENT,
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
    ui.getMap().setLayer(10, TEXTURE.EVENT, DEPTH.GROUND + 10);
    ui.getMap().setForegroundLayer(11, [TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_FLOOR, TEXTURE.OUTDOOR_TILE_EDGE, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(12, [TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_FLOOR, TEXTURE.OUTDOOR_TILE_EDGE, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 4, 27, +3, 142, 98, TEXTURE.GATE_002, 16, 7);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 4, 28, +3, 142, 98, TEXTURE.GATE_002, 16, 8);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 4, 29, +3, 142, 98, TEXTURE.GATE_002, 16, 9);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 65, 24, +3, 142, 98, TEXTURE.GATE_001, 1, 7);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 65, 25, +3, 142, 98, TEXTURE.GATE_001, 1, 8);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 65, 26, +3, 142, 98, TEXTURE.GATE_001, 1, 9);
  }
}

export class Safari002 extends Overworld {
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
      TEXTURE.EVENT,
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
    ui.getMap().setLayer(10, TEXTURE.EVENT, DEPTH.GROUND + 10);
    ui.getMap().setForegroundLayer(11, [TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_FLOOR, TEXTURE.OUTDOOR_TILE_EDGE, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN], DEPTH.FOREGROND);
    ui.getMap().setForeground1Layer(12, [TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_FLOOR, TEXTURE.OUTDOOR_TILE_EDGE, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN], DEPTH.FOREGROND);

    ui.getStatue().setupDoor(TEXTURE.BLANK, 71, 26, +3, 142, 98, TEXTURE.GATE_002, 1, 7);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 71, 27, +3, 142, 98, TEXTURE.GATE_002, 1, 8);
    ui.getStatue().setupDoor(TEXTURE.BLANK, 71, 28, +3, 142, 98, TEXTURE.GATE_002, 1, 9);
  }
}
