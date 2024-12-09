import { items } from '../data/items';
import { ANIMATION } from '../enums/animation';
import { TEXTURE } from '../enums/texture';
import { initI18n } from '../i18n';
import { createZeroPad } from '../utils/string-util';
import { BaseScene } from './base-scene';

export class LoadingScene extends BaseScene {
  constructor() {
    super('LoadingScene');
  }

  async preload() {
    console.log('LoadingScene preload()');

    await initI18n();

    this.loadImage(TEXTURE.WINDOW_0, 'ui', 'window_0');
    this.loadImage(TEXTURE.WINDOW_1, 'ui', 'window_1');
    this.loadImage(TEXTURE.WINDOW_2, 'ui', 'window_2');
    this.loadImage(TEXTURE.BG_LOBBY, 'ui', 'bg_lobby');

    this.loadAtlas(TEXTURE.PAUSE_BLACK, 'ui', TEXTURE.PAUSE_BLACK, ANIMATION.PAUSE);
    this.loadAtlas(TEXTURE.PAUSE_WHITE, 'ui', TEXTURE.PAUSE_WHITE, ANIMATION.PAUSE);

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

    this.loadImage(TEXTURE.ARROW, 'ui', TEXTURE.ARROW);

    this.loadImage(TEXTURE.BLACK, 'ui', TEXTURE.BLACK);
    this.loadImage(TEXTURE.SEASON_0, 'ui', TEXTURE.SEASON_0);
    this.loadImage(TEXTURE.SEASON_1, 'ui', TEXTURE.SEASON_1);
    this.loadImage(TEXTURE.SEASON_2, 'ui', TEXTURE.SEASON_2);
    this.loadImage(TEXTURE.SEASON_3, 'ui', TEXTURE.SEASON_3);

    this.loadImage(TEXTURE.MAP_GROUND, 'ui/map', TEXTURE.MAP_GROUND);
    this.loadMap(TEXTURE.MAP_TEST, 'ui/map', TEXTURE.MAP_TEST);

    this.loadImage(TEXTURE.MENU_BOX, 'ui', TEXTURE.MENU_BOX);
    this.loadImage(TEXTURE.MENU_SHOES, 'ui', TEXTURE.MENU_SHOES);
    this.loadImage(TEXTURE.MENU_BAG, 'ui', TEXTURE.MENU_BAG);
    this.loadImage(TEXTURE.MENU_POKEDEX, 'ui', TEXTURE.MENU_POKEDEX);
    this.loadImage(TEXTURE.MENU_CARD, 'ui', TEXTURE.MENU_CARD);
    this.loadImage(TEXTURE.MENU_DOLL, 'ui', TEXTURE.MENU_DOLL);
    this.loadImage(TEXTURE.MENU_CHAT, 'ui', TEXTURE.MENU_CHAT);

    this.loadImage(TEXTURE.BG_BAG, 'ui', TEXTURE.BG_BAG);
    this.loadImage(TEXTURE.XBOX, 'ui', TEXTURE.XBOX);

    this.loadImage(TEXTURE.ITEM_BOX, 'ui', TEXTURE.ITEM_BOX);
    this.loadImage(TEXTURE.ITEM_BOX_S, 'ui', TEXTURE.ITEM_BOX_S);

    let itemIdx = 1;
    for (const key of Object.keys(items)) {
      this.loadImage(`item${createZeroPad(itemIdx)}`, 'ui/item', `item${createZeroPad(itemIdx)}`);
      itemIdx++;
    }

    this.load.on('complete', () => {
      this.startInGameScene();
    });

    this.load.start();
  }

  private startInGameScene() {
    this.scene.start('InGameScene');
  }
}
