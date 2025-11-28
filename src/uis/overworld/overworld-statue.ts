import { OVERWORLD_DOOR_DATA, OVERWORLD_INIT_POS_DATA } from '../../constants';
import { OVERWORLD_DOOR, OVERWORLD_INIT_POS, TEXTSTYLE, TEXTURE, TRIGGER } from '../../enums';
import { DoorOverworldObj } from '../../obj/door-overworld-obj';
import { OverworldTriggerObj } from '../../obj/overworld-trigger-obj';
import { SignOverworldObj } from '../../obj/sign-overworld-obj';
import { InGameScene } from '../../scenes/ingame-scene';
import { DoorInfo, SignInfo, TriggerInfo } from '../../types';

export class OverworldStatue {
  private scene: InGameScene;

  private doorInfo: DoorInfo[] = [];
  private doors: DoorOverworldObj[] = [];

  private triggerInfo: TriggerInfo[] = [];
  private triggers: OverworldTriggerObj[] = [];

  private signInfo: SignInfo[] = [];
  private signs: SignOverworldObj[] = [];

  constructor(scene: InGameScene) {
    this.scene = scene;
  }

  setupDoor(start: OVERWORLD_DOOR, end: OVERWORLD_INIT_POS) {
    const overworldDoorData = OVERWORLD_DOOR_DATA[start];
    const overworldInitPosData = OVERWORLD_INIT_POS_DATA[end];

    this.doorInfo.push({
      texture: overworldDoorData.door,
      x: overworldDoorData.x,
      y: overworldDoorData.y,
      goal: {
        location: overworldInitPosData.location,
        x: overworldInitPosData.x,
        y: overworldInitPosData.y,
      },
      offsetY: overworldDoorData.offsetY,
      displayWidth: overworldDoorData.width,
      displayHeight: overworldDoorData.height,
    });
  }

  setupSign(texture: TEXTURE | string, x: number, y: number, script: string, window: TEXTURE, textStyle?: TEXTSTYLE) {
    this.signInfo.push({
      texture: texture,
      x: x,
      y: y,
      script: script,
      window: window,
      textStyle: textStyle,
    });
  }

  setupTrigger(x: number, y: number, trigger: TRIGGER, targetNpc: string | null) {
    this.triggerInfo.push({
      x: x,
      y: y,
      trigger: trigger,
      targetNpc: targetNpc,
    });
  }

  show() {
    this.showDoor();
    this.showTrigger();
    this.showSign();
  }

  clean() {
    for (const door of this.doors) {
      if (door) {
        door.destroy();
      }
    }
    this.doors = [];
    this.doorInfo = [];

    for (const trigger of this.triggers) {
      if (trigger) {
        trigger.destroy();
      }
    }
    this.triggers = [];
    this.triggerInfo = [];

    for (const sign of this.signs) {
      if (sign) {
        sign.destroy();
      }
    }
    this.signs = [];
    this.signInfo = [];
  }

  private doorClean() {
    this.doorInfo = [];
  }

  getDoors(): DoorOverworldObj[] {
    return this.doors;
  }

  getSigns(): SignOverworldObj[] {
    return this.signs;
  }

  private showSign() {
    this.signs = [];
    for (const sign of this.signInfo) {
      const signObj = new SignOverworldObj(this.scene, sign.texture, sign.x, sign.y, '', sign.script, sign.window, sign.textStyle);
      this.signs.push(signObj);
    }
  }

  private cleanSign() {
    this.signInfo = [];
  }

  private cleanTrigger() {
    this.triggerInfo = [];
  }

  private showDoor() {
    this.doors = [];
    for (const door of this.doorInfo) {
      const doorObj = new DoorOverworldObj(this.scene, door.texture, door.x, door.y, door.offsetY, door.displayWidth, door.displayHeight, door.goal);
      this.doors.push(doorObj);
    }
  }

  private showTrigger() {
    this.triggers = [];
    for (const trigger of this.triggerInfo) {
      const triggerObj = new OverworldTriggerObj(this.scene, trigger.x, trigger.y, trigger.trigger, trigger.targetNpc);
      this.triggers.push(triggerObj);
    }
  }

  getTriggers(): OverworldTriggerObj[] {
    return this.triggers;
  }
}
