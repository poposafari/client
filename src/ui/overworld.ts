import { KEY } from '../enums/key';
import { PLAYER_STATUS } from '../enums/player-status';
import { KeyboardManager, PlayerManager } from '../managers';
import { OverworldMode } from '../modes';
import { PLAYER_SCALE } from '../object/base-object';
import { PlayerObject } from '../object/player-object';
import { InGameScene } from '../scenes/ingame-scene';
import { Ui } from './ui';

export class Overworld extends Ui {
  private mode!: OverworldMode;
  protected map!: Phaser.Tilemaps.Tilemap;
  private players: PlayerObject[] = [];
  private cursorKey: Phaser.Types.Input.Keyboard.CursorKeys;
  private player!: PlayerObject;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.cursorKey = this.scene.input.keyboard!.createCursorKeys();
    this.mode = mode;
  }

  setMap(map: Phaser.Tilemaps.Tilemap) {
    this.map = map;
  }

  getMode() {
    return this.mode;
  }

  setup(): void {
    // const keyboardMananger = KeyboardManager.getInstance();
    // const keys = [KEY.SELECT, KEY.RUNNING];
    // keyboardMananger.setAllowKey(keys);
    // const playerManager = PlayerManager.getInstance();
    // this.player = new PlayerObject(this.scene, playerManager.getType(PLAYER_STATUS.MOVEMENT), playerManager.getPosX(), playerManager.getPosY(), this.map, playerManager.getNickname());
    // const playerSprite = this.player.getSprite();
    // playerSprite.setVisible(false);
    // playerSprite.setScale(PLAYER_SCALE);
    // this.scene.cameras.main.startFollow(playerSprite, true, 0.5, 0.5, 0, 0);
    // keyboardMananger.setKeyDownCallback((key) => {
    //   switch (key) {
    //     case KEY.RUNNING:
    //       this.player.setRunning();
    //       break;
    //   }
    // });
  }

  show(): void {
    const keyboardMananger = KeyboardManager.getInstance();
    const keys = [KEY.SELECT, KEY.RUNNING, KEY.USE_1, KEY.USE_2, KEY.USE_3, KEY.USE_4, KEY.USE_5, KEY.USE_6, KEY.USE_7, KEY.USE_8, KEY.USE_9];
    keyboardMananger.setAllowKey(keys);

    const playerManager = PlayerManager.getInstance();

    this.player = new PlayerObject(this.scene, playerManager.getType(PLAYER_STATUS.MOVEMENT), playerManager.getPosX(), playerManager.getPosY(), this.map, playerManager.getNickname());

    const playerSprite = this.player.getSprite();
    playerSprite.setVisible(true);
    playerSprite.setScale(PLAYER_SCALE);
    this.scene.cameras.main.startFollow(playerSprite, true, 0.5, 0.5, 0, 0);

    keyboardMananger.setKeyDownCallback((key) => {
      switch (key) {
        case KEY.RUNNING:
          this.player.setStatus(PLAYER_STATUS.RUNNING);
          break;
        case KEY.USE_1:
          this.player.useItem(1);
          break;
        case KEY.USE_2:
          this.player.useItem(2);
          break;
        case KEY.USE_3:
          this.player.useItem(3);
          break;
        case KEY.USE_4:
          this.player.useItem(4);
          break;
        case KEY.USE_5:
          this.player.useItem(5);
          break;
        case KEY.USE_6:
          this.player.useItem(6);
          break;
        case KEY.USE_7:
          this.player.useItem(7);
          break;
        case KEY.USE_8:
          this.player.useItem(8);
          break;
        case KEY.USE_9:
          this.player.useItem(9);
          break;
      }
    });
  }

  clean(): void {
    this.map.destroy();
    this.player.destroy();
    this.scene.cameras.main.stopFollow();
    this.scene.cameras.main.setScroll(0, 0);
  }

  pause(onoff: boolean): void {}

  update(time: number, delta: number) {
    this.movement();
    this.player.update(delta);
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
