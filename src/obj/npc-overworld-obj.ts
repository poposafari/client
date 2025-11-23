import i18next from 'i18next';
import { ANIMATION, DIRECTION, MessageEndDelay, OBJECT, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { TalkMessageUi } from '../uis/talk-message-ui';
import { Option } from '../core/storage/player-option';
import { MovableOverworldObj } from './movable-overworld-obj';

export class NpcOverworldObj extends MovableOverworldObj {
  private key: string;
  private script: string[];
  private isAutoWalking: boolean = false;

  constructor(scene: InGameScene, map: Phaser.Tilemaps.Tilemap | null, texture: TEXTURE | string, x: number, y: number, name: string, direction: DIRECTION, script: string[]) {
    super(scene, map, texture, x, y, name, OBJECT.NPC, direction);

    this.setEmotion(TEXTURE.BLANK, ANIMATION.NONE);
    this.key = texture;
    this.setMovement();
    this.setSpriteScale(1.6);
    this.script = script;
  }

  async reaction(direction: DIRECTION, talkUi: TalkMessageUi) {
    this.lookUser(direction);

    for (const script of this.script) {
      await talkUi.show({ type: 'default', content: i18next.t(`npc:${script}`), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
    }
  }

  getKey() {
    return this.key;
  }

  async autoWalkTo(tileX: number, tileY: number, stepDuration: number = 1000): Promise<boolean> {
    if (this.isAutoWalking) return false;

    const targetTile = new Phaser.Math.Vector2(tileX, tileY);
    const startTile = this.getTilePos();
    if (startTile.equals(targetTile)) return true;

    const path = this.buildStraightPath(startTile, targetTile);
    if (!path || path.length === 0) return false;

    this.isAutoWalking = true;
    let success = true;

    try {
      for (const direction of path) {
        const ready = await this.waitForMovementState(true, stepDuration);
        if (!ready) {
          success = false;
          break;
        }

        const animationKey = this.getAnimation(direction);
        this.ready(direction, animationKey!);

        if (this.isMovementBlocking()) {
          success = false;
          break;
        }

        const started = await this.waitForMovementState(false, stepDuration);
        if (!started) {
          success = false;
          break;
        }

        const finished = await this.waitForMovementState(true, stepDuration);
        if (!finished || this.isMovementBlocking()) {
          success = false;
          break;
        }
      }

      return success;
    } finally {
      this.isAutoWalking = false;
    }
  }

  private lookUser(playerDirection: DIRECTION) {
    const direction = () => {
      switch (playerDirection) {
        case DIRECTION.LEFT:
          return DIRECTION.RIGHT;
        case DIRECTION.RIGHT:
          return DIRECTION.LEFT;
        case DIRECTION.DOWN:
          return DIRECTION.UP;
        case DIRECTION.UP:
          return DIRECTION.DOWN;
      }
    };

    this.changeDirectionOnly(direction()!);
  }

  setMovement() {
    let smoothFrames = [12, 0, 4, 8];
    let stopFraems = [12, 0, 4, 8];
    let speed = 2;

    this.smoothFrameNumbers = smoothFrames;
    this.stopFrameNumbers = stopFraems;
    this.baseSpeed = speed;
  }

  private buildStraightPath(start: Phaser.Math.Vector2, target: Phaser.Math.Vector2): DIRECTION[] | null {
    const path: DIRECTION[] = [];
    const cursor = start.clone();

    const deltaX = target.x - cursor.x;
    const horizontalDirection = deltaX > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
    for (let i = 0; i < Math.abs(deltaX); i++) {
      cursor.add(this.getDirectionVector(horizontalDirection));
      path.push(horizontalDirection);
    }

    const deltaY = target.y - cursor.y;
    const verticalDirection = deltaY > 0 ? DIRECTION.DOWN : DIRECTION.UP;
    for (let i = 0; i < Math.abs(deltaY); i++) {
      cursor.add(this.getDirectionVector(verticalDirection));
      path.push(verticalDirection);
    }

    if (!cursor.equals(target)) {
      return null;
    }

    return path;
  }

  private getDirectionVector(direction: DIRECTION): Phaser.Math.Vector2 {
    switch (direction) {
      case DIRECTION.UP:
        return new Phaser.Math.Vector2(0, -1);
      case DIRECTION.DOWN:
        return new Phaser.Math.Vector2(0, 1);
      case DIRECTION.LEFT:
        return new Phaser.Math.Vector2(-1, 0);
      case DIRECTION.RIGHT:
        return new Phaser.Math.Vector2(1, 0);
      default:
        return new Phaser.Math.Vector2(0, 0);
    }
  }

  private waitForMovementState(expectFinished: boolean, timeout: number): Promise<boolean> {
    return new Promise((resolve) => {
      const scene = this.getScene();
      const step = 16;
      let elapsed = 0;

      const checkState = () => {
        if (this.isMovementFinish() === expectFinished) {
          resolve(true);
          return;
        }

        if (elapsed >= timeout) {
          resolve(false);
          return;
        }

        elapsed += step;
        scene.time.delayedCall(step, checkState);
      };

      checkState();
    });
  }

  private getAnimation(direction: DIRECTION) {
    if (this.step >= 2) this.step = 0;

    const animationKey = `${this.key}_`;

    switch (direction) {
      case DIRECTION.UP:
        if (this.step == 0) return animationKey + 'up_0';
        if (this.step == 1) return animationKey + 'up_1';
      case DIRECTION.DOWN:
        if (this.step == 0) return animationKey + 'down_0';
        if (this.step == 1) return animationKey + 'down_1';
      case DIRECTION.LEFT:
        if (this.step == 0) return animationKey + 'left_0';
        if (this.step == 1) return animationKey + 'left_1';
      case DIRECTION.RIGHT:
        if (this.step == 0) return animationKey + 'right_0';
        if (this.step == 1) return animationKey + 'right_1';
    }
  }

  changeDirectionOnly(direction: DIRECTION) {
    this.lastDirection = direction;
    const stopFrameNumber = () => {
      switch (direction) {
        case DIRECTION.UP:
          return 0;
        case DIRECTION.DOWN:
          return 12;
        case DIRECTION.LEFT:
          return 8;
        case DIRECTION.RIGHT:
          return 4;
      }
    };
    if (stopFrameNumber !== undefined) {
      this.stopSpriteAnimation(stopFrameNumber()!);
    }
  }
}
