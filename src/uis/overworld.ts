import { eventBus } from '../core/event-bus';
import { AUDIO, DEPTH, DIRECTION, EVENT, OBJECT, OVERWORLD_TYPE, TEXTURE } from '../enums';
import i18next from '../i18n';
import { OverworldStorage } from '../storage';
import { PostOfficeType, ShopType } from '../types';
import { OverworldUi } from './overworld-ui';

export abstract class Overworld {
  protected ui!: OverworldUi;
  protected initPlayerDirection!: DIRECTION;
  protected key!: TEXTURE | string;
  protected sound!: AUDIO | string;

  constructor(ui: OverworldUi, initPlayerDirection: DIRECTION, key: TEXTURE | string, sound: AUDIO | string) {
    this.ui = ui;
    this.initPlayerDirection = initPlayerDirection;
    this.key = key;
    this.sound = sound;
  }

  abstract setup(): void;

  getUi() {
    return this.ui;
  }

  getInitPlayerDirection() {
    return this.initPlayerDirection;
  }

  getSound() {
    return this.sound;
  }
}

export class Plaza001 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string, sound: AUDIO | string) {
    super(ui, DIRECTION.DOWN, key, sound);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldStorage.getInstance().setKey(this.key);

    this.ui.getMap().setup(this.key as TEXTURE, [TEXTURE.OUTDOOR_TILE_FLOOR, TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_EDGE, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, TEXTURE.OUTDOOR_TILE_URBAN]);
    this.ui.getMap().setLayer(0, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND + 1);
    this.ui.getMap().setLayer(2, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 2);
    this.ui.getMap().setLayer(3, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 3);
    this.ui.getMap().setLayer(4, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 4);
    this.ui.getMap().setLayer(5, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 5);
    this.ui.getMap().setLayer(6, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 6);
    this.ui.getMap().setLayer(7, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 7);
    this.ui.getMap().setLayer(8, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 8);
    this.ui.getMap().setLayer(9, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 9);
    this.ui.getMap().setForegroundLayer(10, [TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_URBAN], DEPTH.FOREGROND);
    this.ui.getMap().setForeground1Layer(11, [TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_URBAN], DEPTH.FOREGROND);

    this.ui.getNpc().setup('npc005', '', 41, 57, ['script010_0']);
    this.ui.getNpc().setup('npc008', '', 78, 68, ['script009_0', 'script009_1']);
    this.ui.getNpc().setup('npc009', '', 88, 69, ['script014_0', 'script014_1']);
    this.ui.getNpc().setup('npc012', '', 37, 81, ['script017_0', 'script017_1', 'script017_2', 'script017_3']);
    this.ui.getNpc().setup('npc013', '', 25, 62, ['script018_0']);
    this.ui.getNpc().setup('npc017', '', 37, 43, ['script001_0', 'script001_1', 'script001_2']);
    this.ui.getNpc().setup('npc015', '', 50, 41, ['script013_0', 'script013_1', 'script013_2', 'script013_3']);
    this.ui.getNpc().setup('npc022', '', 75, 53, ['script019_0']);

    this.ui.getStatue().setupDoor('door_1', 83, 54, +3, 142, 98, TEXTURE.PLAZA_003, 9, 18);
    this.ui.getStatue().setupDoor('door_22', 98, 78, +3, 142, 98, TEXTURE.PLAZA_002, 11, 22);
    this.ui.getStatue().setupDoor('door_1', 77, 44, +6, 135, 90, TEXTURE.PLAZA_006, 9, 13);
    this.ui.getStatue().setupDoor('door_17', 62, 44, +6, 135, 90, TEXTURE.PLAZA_006, 9, 13);
    this.ui.getStatue().setupDoor('door_10', 89, 54, +6, 135, 90, TEXTURE.PLAZA_007, 5, 10);
    this.ui.getStatue().setupDoor('door_4', 83, 65, +6, 140, 95, TEXTURE.PLAZA_008, 6, 12);
    this.ui.getStatue().setupDoor('door_8', 89, 65, +6, 122, 95, TEXTURE.PLAZA_010, 6, 12);
    this.ui.getStatue().setupDoor('door_15', 52, 80, +6, 138, 90, TEXTURE.PLAZA_012, 3, 22);
    this.ui.getStatue().setupDoor('door_13', 44, 80, +6, 138, 90, TEXTURE.PLAZA_014, 9, 19);
    this.ui.getStatue().setupDoor('door_15', 60, 80, +6, 138, 90, TEXTURE.PLAZA_016, 9, 19);
    this.ui.getStatue().setupDoor('door_13', 68, 80, +6, 138, 90, TEXTURE.PLAZA_018, 9, 19);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 69, 43, +3, 142, 98, TEXTURE.PLAZA_004, 10, 24);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 70, 43, +3, 142, 98, TEXTURE.PLAZA_004, 11, 24);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 40, 16, +3, 142, 98, TEXTURE.PLAZA_005, 37, 58);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 41, 16, +3, 142, 98, TEXTURE.PLAZA_005, 38, 58);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 42, 16, +3, 142, 98, TEXTURE.PLAZA_005, 39, 58);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 43, 16, +3, 142, 98, TEXTURE.PLAZA_005, 40, 58);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 44, 16, +3, 142, 98, TEXTURE.PLAZA_005, 41, 58);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 45, 16, +3, 142, 98, TEXTURE.PLAZA_005, 42, 58);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 46, 16, +3, 142, 98, TEXTURE.PLAZA_005, 43, 58);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 47, 16, +3, 142, 98, TEXTURE.PLAZA_005, 44, 58);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 48, 16, +3, 142, 98, TEXTURE.PLAZA_005, 45, 58);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 49, 16, +3, 142, 98, TEXTURE.PLAZA_005, 46, 58);

    this.ui.getStatue().setupStatue(TEXTURE.BLANK, 62, 44, OBJECT.STATUE, null, 'opening_soon');

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza002 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string, sound: AUDIO | string) {
    super(ui, DIRECTION.UP, key, sound);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldStorage.getInstance().setKey(this.key as string);

    this.ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT]);
    this.ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setForegroundLayer(4, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    this.ui.getNpc().setup('npc029', i18next.t('npc:special001'), 10, 4, []);
    this.ui.getNpc().setup('npc003', '', 6, 19, ['script003_1', 'script003_2']);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 11, 23, +3, 142, 98, TEXTURE.PLAZA_001, 98, 78);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 12, 23, +3, 142, 98, TEXTURE.PLAZA_001, 98, 78);
    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza003 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string, sound: AUDIO | string) {
    super(ui, DIRECTION.UP, key, sound);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldStorage.getInstance().setKey(this.key as string);

    this.ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT]);
    this.ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setForegroundLayer(4, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    this.ui.getNpc().setup('npc002', i18next.t('npc:special003'), 2, 6, []);
    this.ui.getNpc().setup('npc002', i18next.t('npc:special002'), 7, 6, []);
    this.ui.getNpc().setup('npc023', '', 14, 4, ['script012_0', 'script012_1']);
    this.ui.getNpc().setup('npc020', '', 12, 15, ['script025_0', 'script025_1']);
    this.ui.getNpc().setup('npc026', '', 4, 10, ['script022_0', 'script022_1']);
    this.ui.getNpc().setup('npc016', '', 18, 11, ['script021_0']);
    this.ui.getNpc().setup('npc021', '', 9, 13, ['script024_0', 'script024_1']);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 9, 19, +3, 142, 98, TEXTURE.PLAZA_001, 83, 54);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 10, 19, +3, 142, 98, TEXTURE.PLAZA_001, 83, 54);
    this.ui.getStatue().setupStatue(TEXTURE.BLANK, 2, 7, OBJECT.SHOP_CHECKOUT, ShopType.SHOP_0);
    this.ui.getStatue().setupStatue(TEXTURE.BLANK, 7, 7, OBJECT.SHOP_CHECKOUT, ShopType.SHOP_1);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza004 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string, sound: AUDIO | string) {
    super(ui, DIRECTION.UP, key, sound);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldStorage.getInstance().setKey(this.key as string);

    this.ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT]);
    this.ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setForegroundLayer(4, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    this.ui.getNpc().setup('npc001', i18next.t('npc:special005'), 5, 10, []);
    this.ui.getNpc().setup('npc010', '', 14, 17, ['script027_0', 'script027_1']);
    this.ui.getNpc().setup('npc028', '', 3, 14, ['script026_0']);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 10, 24, +3, 142, 98, TEXTURE.PLAZA_001, 69, 43);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 11, 24, +3, 142, 98, TEXTURE.PLAZA_001, 70, 43);
    this.ui.getStatue().setupStatue(TEXTURE.BLANK, 5, 11, OBJECT.POST_CHECKOUT, PostOfficeType.POST_0);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza005 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string, sound: AUDIO | string) {
    super(ui, DIRECTION.UP, key, sound);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldStorage.getInstance().setKey(this.key as string);

    this.ui.getMap().setup(this.key as TEXTURE, [TEXTURE.OUTDOOR_TILE_FLOOR, TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_EDGE, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, TEXTURE.OUTDOOR_TILE_URBAN]);
    this.ui.getMap().setLayer(0, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND + 1);
    this.ui.getMap().setLayer(2, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 2);
    this.ui.getMap().setLayer(3, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 3);
    this.ui.getMap().setLayer(4, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 4);
    this.ui.getMap().setLayer(5, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 5);
    this.ui.getMap().setLayer(6, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 6);
    this.ui.getMap().setLayer(7, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 7);
    this.ui.getMap().setLayer(8, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 8);
    this.ui.getMap().setLayer(9, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 9);
    this.ui.getMap().setForegroundLayer(10, [TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_URBAN], DEPTH.FOREGROND);
    this.ui.getMap().setForeground1Layer(11, [TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_URBAN], DEPTH.FOREGROND);

    this.ui.getNpc().setup('npc000', i18next.t('npc:special000'), 40, 41, []);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 37, 58, +3, 142, 98, TEXTURE.PLAZA_001, 40, 17);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 38, 58, +3, 142, 98, TEXTURE.PLAZA_001, 41, 17);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 39, 58, +3, 142, 98, TEXTURE.PLAZA_001, 42, 17);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 40, 58, +3, 142, 98, TEXTURE.PLAZA_001, 43, 17);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 41, 58, +3, 142, 98, TEXTURE.PLAZA_001, 44, 17);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 42, 58, +3, 142, 98, TEXTURE.PLAZA_001, 45, 17);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 43, 58, +3, 142, 98, TEXTURE.PLAZA_001, 46, 17);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 44, 58, +3, 142, 98, TEXTURE.PLAZA_001, 47, 17);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 45, 58, +3, 142, 98, TEXTURE.PLAZA_001, 48, 17);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 46, 58, +3, 142, 98, TEXTURE.PLAZA_001, 49, 17);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza006 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string, sound: AUDIO | string) {
    super(ui, DIRECTION.UP, key, sound);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldStorage.getInstance().setKey(this.key as string);

    this.ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT]);
    this.ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setForegroundLayer(4, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    this.ui.getNpc().setup('npc004', i18next.t('npc:special004'), 12, 7, []);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 9, 14, +3, 142, 98, TEXTURE.PLAZA_001, 77, 44);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 10, 14, +3, 142, 98, TEXTURE.PLAZA_001, 77, 44);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza007 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string, sound: AUDIO | string) {
    super(ui, DIRECTION.UP, key, sound);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldStorage.getInstance().setKey(this.key as string);

    this.ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT]);
    this.ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setForegroundLayer(4, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    this.ui.getNpc().setup('npc020', '', 6, 5, ['script028_0', 'script028_1']);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 5, 11, +3, 142, 98, TEXTURE.PLAZA_001, 89, 54);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 6, 11, +3, 142, 98, TEXTURE.PLAZA_001, 89, 54);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza008 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string, sound: AUDIO | string) {
    super(ui, DIRECTION.UP, key, sound);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldStorage.getInstance().setKey(this.key as string);

    this.ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT]);
    this.ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setForegroundLayer(4, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    this.ui.getNpc().setup('npc005', '', 7, 7, ['script020_0', 'script020_1']);
    this.ui.getNpc().setup('npc022', '', 3, 7, ['script029_0', 'script029_1']);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 6, 13, +3, 142, 98, TEXTURE.PLAZA_001, 83, 65);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 7, 13, +3, 142, 98, TEXTURE.PLAZA_001, 83, 65);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 2, 3, +3, 142, 98, TEXTURE.PLAZA_009, 11, 5);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 2, 4, +3, 142, 98, TEXTURE.PLAZA_009, 11, 5);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza009 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string, sound: AUDIO | string) {
    super(ui, DIRECTION.UP, key, sound);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldStorage.getInstance().setKey(this.key as string);

    this.ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT]);
    this.ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setForegroundLayer(4, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    this.ui.getNpc().setup('npc027', '', 5, 8, ['script030_0']);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 11, 4, +3, 142, 98, TEXTURE.PLAZA_008, 2, 3);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 11, 5, +3, 142, 98, TEXTURE.PLAZA_008, 2, 3);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 11, 6, +3, 142, 98, TEXTURE.PLAZA_008, 2, 3);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza010 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string, sound: AUDIO | string) {
    super(ui, DIRECTION.UP, key, sound);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldStorage.getInstance().setKey(this.key as string);

    this.ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT]);
    this.ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setForegroundLayer(4, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    this.ui.getNpc().setup('npc028', '', 10, 11, ['script031_0']);
    this.ui.getNpc().setup('npc025', '', 6, 4, ['script032_0', 'script032_1']);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 6, 13, +3, 142, 98, TEXTURE.PLAZA_001, 89, 65);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 7, 13, +3, 142, 98, TEXTURE.PLAZA_001, 89, 65);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 11, 4, +3, 142, 98, TEXTURE.PLAZA_011, 2, 4);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 11, 5, +3, 142, 98, TEXTURE.PLAZA_011, 2, 4);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza011 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string, sound: AUDIO | string) {
    super(ui, DIRECTION.UP, key, sound);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldStorage.getInstance().setKey(this.key as string);

    this.ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT]);
    this.ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setForegroundLayer(4, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    this.ui.getNpc().setup('npc019', '', 12, 4, ['script033_0', 'script033_1']);
    this.ui.getNpc().setup('npc020', '', 6, 6, ['script034_0']);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 2, 3, +3, 142, 98, TEXTURE.PLAZA_010, 11, 4);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 2, 4, +3, 142, 98, TEXTURE.PLAZA_010, 11, 4);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 2, 5, +3, 142, 98, TEXTURE.PLAZA_010, 11, 4);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza012 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string, sound: AUDIO | string) {
    super(ui, DIRECTION.UP, key, sound);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldStorage.getInstance().setKey(this.key as string);

    this.ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT]);
    this.ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setForegroundLayer(4, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 3, 23, +3, 142, 98, TEXTURE.PLAZA_001, 52, 80);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 4, 23, +3, 142, 98, TEXTURE.PLAZA_001, 52, 80);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 16, 4, +3, 142, 98, TEXTURE.PLAZA_013, 4, 18);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 16, 5, +3, 142, 98, TEXTURE.PLAZA_013, 4, 18);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza013 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string, sound: AUDIO | string) {
    super(ui, DIRECTION.UP, key, sound);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldStorage.getInstance().setKey(this.key as string);

    this.ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT]);
    this.ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setForegroundLayer(4, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 4, 18, +3, 142, 98, TEXTURE.PLAZA_012, 15, 4);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 4, 18, +3, 142, 98, TEXTURE.PLAZA_012, 15, 4);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza014 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string, sound: AUDIO | string) {
    super(ui, DIRECTION.UP, key, sound);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldStorage.getInstance().setKey(this.key as string);

    this.ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT]);
    this.ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setForegroundLayer(4, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    this.ui.getNpc().setup('npc011', '', 15, 6, ['script035_0']);
    this.ui.getNpc().setup('npc005', '', 9, 14, ['script036_0', 'script036_1']);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 9, 20, +3, 142, 98, TEXTURE.PLAZA_001, 44, 80);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 10, 20, +3, 142, 98, TEXTURE.PLAZA_001, 44, 80);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 3, 7, +3, 142, 98, TEXTURE.PLAZA_015, 15, 18);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 3, 6, +3, 142, 98, TEXTURE.PLAZA_015, 15, 18);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza015 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string, sound: AUDIO | string) {
    super(ui, DIRECTION.UP, key, sound);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldStorage.getInstance().setKey(this.key as string);

    this.ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT]);
    this.ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setForegroundLayer(4, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    this.ui.getNpc().setup('npc017', '', 8, 5, ['script037_0', 'script037_1']);
    this.ui.getNpc().setup('npc023', '', 9, 15, ['script038_0', 'script038_1']);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 16, 17, +3, 142, 98, TEXTURE.PLAZA_014, 3, 6);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 16, 18, +3, 142, 98, TEXTURE.PLAZA_014, 3, 6);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 16, 19, +3, 142, 98, TEXTURE.PLAZA_014, 3, 7);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza016 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string, sound: AUDIO | string) {
    super(ui, DIRECTION.UP, key, sound);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldStorage.getInstance().setKey(this.key as string);

    this.ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT]);
    this.ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setForegroundLayer(4, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    this.ui.getNpc().setup('npc009', '', 10, 13, ['script039_0']);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 9, 20, +3, 142, 98, TEXTURE.PLAZA_001, 60, 80);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 10, 20, +3, 142, 98, TEXTURE.PLAZA_001, 60, 80);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 16, 4, +3, 142, 98, TEXTURE.PLAZA_017, 4, 5);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 16, 5, +3, 142, 98, TEXTURE.PLAZA_017, 4, 5);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 16, 6, +3, 142, 98, TEXTURE.PLAZA_017, 4, 6);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza017 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string, sound: AUDIO | string) {
    super(ui, DIRECTION.UP, key, sound);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldStorage.getInstance().setKey(this.key as string);

    this.ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT]);
    this.ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setForegroundLayer(4, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    this.ui.getNpc().setup('npc016', '', 7, 17, ['script040_0']);
    this.ui.getNpc().setup('npc028', '', 14, 6, ['script041_0', 'script041_1']);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 3, 4, +3, 142, 98, TEXTURE.PLAZA_016, 16, 5);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 3, 5, +3, 142, 98, TEXTURE.PLAZA_016, 16, 5);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 3, 6, +3, 142, 98, TEXTURE.PLAZA_016, 16, 6);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza018 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string, sound: AUDIO | string) {
    super(ui, DIRECTION.UP, key, sound);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldStorage.getInstance().setKey(this.key as string);

    this.ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT]);
    this.ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setForegroundLayer(4, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    this.ui.getNpc().setup('npc024', '', 16, 14, ['script042_0']);
    this.ui.getNpc().setup('npc007', '', 13, 7, ['script043_0', 'script043_1']);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 9, 20, +3, 142, 98, TEXTURE.PLAZA_001, 68, 80);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 10, 20, +3, 142, 98, TEXTURE.PLAZA_001, 68, 80);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 3, 5, +3, 142, 98, TEXTURE.PLAZA_019, 16, 5);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 3, 6, +3, 142, 98, TEXTURE.PLAZA_019, 16, 5);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza019 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string, sound: AUDIO | string) {
    super(ui, DIRECTION.UP, key, sound);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldStorage.getInstance().setKey(this.key as string);

    this.ui.getMap().setup(this.key as TEXTURE, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT]);
    this.ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setForegroundLayer(4, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    this.ui.getNpc().setup('npc017', '', 16, 17, ['script044_0', 'script044_1']);
    this.ui.getNpc().setup('npc008', '', 10, 10, ['script045_0']);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 16, 4, +3, 142, 98, TEXTURE.PLAZA_018, 3, 5);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 16, 5, +3, 142, 98, TEXTURE.PLAZA_018, 3, 5);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 16, 6, +3, 142, 98, TEXTURE.PLAZA_018, 3, 6);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Safari000 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string, sound: AUDIO | string) {
    super(ui, DIRECTION.DOWN, key, sound);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.SAFARI);
    OverworldStorage.getInstance().setKey(this.key as string);

    this.ui.getMap().setup(this.key as TEXTURE, [TEXTURE.OUTDOOR_TILE_FLOOR, TEXTURE.OUTDOOR_TILE_EDGE, TEXTURE.OUTDOOR_TILE_OBJECT]);
    this.ui.getMap().setLayer(0, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND + 1);
    this.ui.getMap().setLayer(2, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 2);
    this.ui.getMap().setLayer(3, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 3);
    this.ui.getMap().setLayer(4, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 4);
    this.ui.getMap().setLayer(5, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 5);
    this.ui.getMap().setForegroundLayer(6, [TEXTURE.OUTDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}
