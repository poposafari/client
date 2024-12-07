import { KEY } from '../enums/key';
import { PLAYER_STATUS } from '../enums/player-status';
import { KeyboardManager, PlayerManager } from '../managers';
import { OverworldMode } from '../modes';
import { PLAYER_SCALE } from '../object/base-object';
import { PlayerObject } from '../object/player-object';
import { InGameScene } from '../scenes/ingame-scene';
import { UI } from './ui';

export class Overworld extends UI {
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
    const keyboardMananger = KeyboardManager.getInstance();
    const keys = [KEY.SELECT, KEY.RUNNING];
    keyboardMananger.setAllowKey(keys);

    const playerManager = PlayerManager.getInstance();

    this.player = new PlayerObject(this.scene, playerManager.getType(PLAYER_STATUS.MOVEMENT), playerManager.getPosX(), playerManager.getPosY(), this.map, playerManager.getNickname());

    const playerSprite = this.player.getSprite();
    playerSprite.setVisible(false);
    playerSprite.setScale(PLAYER_SCALE);
    this.scene.cameras.main.startFollow(playerSprite, true, 0.5, 0.5, 0, 0);

    keyboardMananger.setKeyDownCallback((key) => {
      switch (key) {
        case KEY.RUNNING:
          this.player.setRunning();
          break;
      }
    });
  }

  show(): void {
    const playerSprite = this.player.getSprite();
    playerSprite.setVisible(true);
  }

  clean(): void {
    this.map.destroy();
    const playerSprite = this.player.getSprite();
    const playerNickname = this.player.getNickname();
    playerSprite.destroy();
    playerNickname.destroy();
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
