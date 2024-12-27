import { ANIMATION } from '../enums/animation';
import { KEY } from '../enums/key';
import { OBJECT } from '../enums/object-type';
import { PLAYER_STATUS } from '../enums/player-status';
import { KeyboardManager, PlayerInfoManager } from '../managers';
import { OverworldMode } from '../modes';
import { PLAYER_SCALE } from '../object/base-object';
import { PlayerObject } from '../object/player-object';
import { InGameScene } from '../scenes/ingame-scene';
import { Ui } from './ui';

export class Overworld extends Ui {
  private mode!: OverworldMode;
  protected map!: Phaser.Tilemaps.Tilemap;
  protected player!: PlayerObject;
  private cursorKey: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.cursorKey = this.scene.input.keyboard!.createCursorKeys();
    this.mode = mode;
  }

  getMode() {
    return this.mode;
  }

  setup(): void {}

  show(): void {
    const keyboardMananger = KeyboardManager.getInstance();
    const keys = [KEY.SELECT, KEY.USE_1, KEY.USE_2, KEY.USE_3, KEY.USE_4, KEY.USE_5, KEY.USE_6, KEY.USE_7, KEY.USE_8, KEY.USE_9];
    const playerInfo = PlayerInfoManager.getInstance().getInfo();

    this.player = new PlayerObject(this.scene, `${playerInfo.gender}_${playerInfo.avatarType}_movement`, playerInfo.pos.x, playerInfo.pos.y, this.map, playerInfo.nickname, OBJECT.PLAYER);

    const playerSprite = this.player.getSprite();
    playerSprite.setVisible(true);
    playerSprite.setScale(PLAYER_SCALE);
    this.scene.cameras.main.startFollow(playerSprite, true, 0.5, 0.5, 0, 0);

    keyboardMananger.setAllowKey(keys);
    keyboardMananger.setKeyDownCallback((key) => {
      let slotIdx = 0;
      switch (key) {
        case KEY.USE_1:
          slotIdx = 0;
          break;
        case KEY.USE_2:
          slotIdx = 1;
          break;
        case KEY.USE_3:
          slotIdx = 2;
          break;
        case KEY.USE_4:
          slotIdx = 3;
          break;
        case KEY.USE_5:
          slotIdx = 4;
          break;
        case KEY.USE_6:
          slotIdx = 5;
          break;
        case KEY.USE_7:
          slotIdx = 6;
          break;
        case KEY.USE_8:
          slotIdx = 7;
          break;
        case KEY.USE_9:
          slotIdx = 8;
          break;
      }
      this.player.readyItem(slotIdx);
      this.mode.chnageItemSlot();
    });
  }

  clean(): void {
    this.map.destroy();
    this.player.destroy();
    this.player.getPet().destroy();
    this.scene.cameras.main.stopFollow();
    this.scene.cameras.main.setScroll(0, 0);
  }

  pause(onoff: boolean): void {}

  update(time: number, delta: number) {
    this.movement();
    this.player.update(delta);
    this.player.getPet().update();
  }

  changeFollowPokemon(pokedex: string) {
    const pet = this.player.getPet();

    pet.startAnmation(`pokemon_overworld${pokedex}_${pet.getLastDirection()}`);
    this.player
      .getPet()
      .getSprite()
      .setTexture(`pokemon_overworld${pokedex}`)
      .setVisible(pokedex !== '000' ? true : false);
  }

  private movement() {
    if (this.cursorKey.up.isDown && this.player.isMovementFinish()) {
      this.player.move(KEY.UP);
    } else if (this.cursorKey.down.isDown && this.player.isMovementFinish()) {
      this.player.move(KEY.DOWN);
    } else if (this.cursorKey.left.isDown && this.player.isMovementFinish()) {
      this.player.move(KEY.LEFT);
    } else if (this.cursorKey.right.isDown && this.player.isMovementFinish()) {
      this.player.move(KEY.RIGHT);
    }
  }
}
