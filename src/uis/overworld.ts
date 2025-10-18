import { eventBus } from '../core/event-bus';
import { DEPTH, DIRECTION, EVENT, OBJECT, OVERWORLD_TYPE, TEXTURE } from '../enums';
import { OverworldStorage } from '../storage';
import { PostOfficeType, ShopType } from '../types';
import { OverworldUi } from './overworld-ui';

export abstract class Overworld {
  protected ui!: OverworldUi;
  protected initPlayerDirection!: DIRECTION;
  protected key!: TEXTURE | string;

  constructor(ui: OverworldUi, initPlayerDirection: DIRECTION, key: TEXTURE | string) {
    this.ui = ui;
    this.initPlayerDirection = initPlayerDirection;
    this.key = key;
  }

  abstract setup(): void;

  getUi() {
    return this.ui;
  }

  getInitPlayerDirection() {
    return this.initPlayerDirection;
  }
}

export class Plaza001 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string) {
    super(ui, DIRECTION.DOWN, key);
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

    this.ui.getStatue().setupDoor('door_1', 83, 54, +3, 142, 98, TEXTURE.PLAZA_003, 9, 18);
    this.ui.getStatue().setupDoor('door_22', 98, 78, +3, 142, 98, TEXTURE.PLAZA_002, 11, 22);

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

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza002 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string) {
    super(ui, DIRECTION.UP, key);
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

    this.ui.getNpc().setup('npc003', 9, 4);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 11, 23, +3, 142, 98, TEXTURE.PLAZA_001, 98, 78);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 12, 23, +3, 142, 98, TEXTURE.PLAZA_001, 98, 78);
    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza003 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string) {
    super(ui, DIRECTION.UP, key);
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

    this.ui.getNpc().setup('npc002', 2, 6);
    this.ui.getNpc().setup('npc002', 7, 6);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 9, 19, +3, 142, 98, TEXTURE.PLAZA_001, 83, 54);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 10, 19, +3, 142, 98, TEXTURE.PLAZA_001, 83, 54);
    this.ui.getStatue().setupStatue(TEXTURE.BLANK, 2, 7, OBJECT.SHOP_CHECKOUT, ShopType.SHOP_0);
    this.ui.getStatue().setupStatue(TEXTURE.BLANK, 7, 7, OBJECT.SHOP_CHECKOUT, ShopType.SHOP_1);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza004 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string) {
    super(ui, DIRECTION.UP, key);
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

    this.ui.getNpc().setup('npc001', 5, 10);
    this.ui.getNpc().setup('npc001', 16, 10);

    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 10, 24, +3, 142, 98, TEXTURE.PLAZA_001, 69, 43);
    this.ui.getStatue().setupDoor(TEXTURE.BLANK, 11, 24, +3, 142, 98, TEXTURE.PLAZA_001, 70, 43);
    this.ui.getStatue().setupStatue(TEXTURE.BLANK, 5, 11, OBJECT.POST_CHECKOUT, PostOfficeType.POST_0);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
  }
}

export class Plaza005 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string) {
    super(ui, DIRECTION.UP, key);
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

    this.ui.getNpc().setup('npc000', 40, 41);

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

export class Safari000 extends Overworld {
  constructor(ui: OverworldUi, key: TEXTURE | string) {
    super(ui, DIRECTION.DOWN, key);
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
