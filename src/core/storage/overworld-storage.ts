import { OVERWORLD_TYPE } from '../../enums';
import { DoorOverworldObj } from '../../obj/door-overworld-obj';
import { GroundItemOverworldObj } from '../../obj/ground-item-overworld-obj';
import { NpcOverworldObj } from '../../obj/npc-overworld-obj';
import { WildOverworldObj } from '../../obj/wild-overworld-obj';
import { InGameScene } from '../../scenes/ingame-scene';
import { ChangePetRes, GroundItemRes, OtherPlayerExitRes, OtherPlayerInfo, OverworldStatue, PlayerPositionRes, WildRes } from '../../types';
import { Overworld } from '../../uis/overworld/overworld';
import { OverworldUi } from '../../uis/overworld/overworld-ui';

export class OverworldManager {
  private static instance: OverworldManager;
  private scene: InGameScene | null = null;
  private key: string = '';
  private type: OVERWORLD_TYPE = OVERWORLD_TYPE.NONE;
  private mapFactories: Map<string, (ui: OverworldUi) => Overworld> = new Map();

  private blockingUpdate: boolean = false;
  private blockingPlayerUpdate: boolean = false;

  private wildData: WildRes[] = [];
  private groundItemData: GroundItemRes[] = [];

  private otherPlayersInfo: OtherPlayerInfo[] = [];
  private otherPlayersExitInfo: OtherPlayerExitRes[] = [];
  private otherPlayerPositionInfo: PlayerPositionRes[] = [];
  private otherPlayerPetInfo: ChangePetRes[] = [];

  static get(): OverworldManager {
    if (!OverworldManager.instance) {
      OverworldManager.instance = new OverworldManager();
    }
    return OverworldManager.instance;
  }

  init(scene: InGameScene): void {
    this.scene = scene;
  }

  registerMapFactory(key: string, factory: (ui: OverworldUi) => Overworld): void {
    this.mapFactories.set(key, factory);
  }

  getMapFactory(key: string): ((ui: OverworldUi) => Overworld) | undefined {
    return this.mapFactories.get(key);
  }

  getCurrentOverworldType() {
    return this.type;
  }

  setCurrentOverworldType(type: OVERWORLD_TYPE) {
    this.type = type;
  }

  setKey(key: string): void {
    this.key = key;
  }

  getKey(): string {
    return this.key;
  }

  getBlockingUpdate() {
    return this.blockingUpdate;
  }

  setBlockingUpdate(onoff: boolean) {
    this.blockingUpdate = onoff;
  }

  getBlockingPlayerUpdate() {
    return this.blockingPlayerUpdate;
  }

  setBlockingPlayerUpdate(onoff: boolean) {
    this.blockingPlayerUpdate = onoff;
  }

  setupWildData(data: WildRes[]) {
    this.wildData = [];
    this.wildData = data;
  }

  setupGroundItemInfo(data: GroundItemRes[]) {
    this.groundItemData = [];
    this.groundItemData = data;
  }

  getWildData() {
    return this.wildData;
  }

  getGroundItemData() {
    return this.groundItemData;
  }

  getOtherplayerInfo() {
    return this.otherPlayersInfo;
  }

  cleanOtherplayerInfo() {
    this.otherPlayersInfo = [];
  }

  addOtherplayerInfo(data: OtherPlayerInfo) {
    this.otherPlayersInfo.push(data);
  }

  shiftOtherplayerInfo() {
    return this.otherPlayersInfo.shift();
  }

  getOtherplayerExitInfo() {
    return this.otherPlayersExitInfo;
  }

  cleanOtherplayerExitInfo() {
    this.otherPlayersExitInfo = [];
  }

  addOtherplayerExitInfo(data: OtherPlayerExitRes) {
    this.otherPlayersExitInfo.push(data);
  }

  shiftOtherplayerExitInfo() {
    return this.otherPlayersExitInfo.shift();
  }

  getOtherplayerPetInfo() {
    return this.otherPlayerPetInfo;
  }

  cleanOtherplayerPetInfo() {
    this.otherPlayerPetInfo = [];
  }

  addOtherplayerPetInfo(data: ChangePetRes) {
    this.otherPlayerPetInfo.push(data);
  }

  shiftOtherplayerPetInfo() {
    return this.otherPlayerPetInfo.shift();
  }

  getOtherplayerPositionInfo() {
    return this.otherPlayerPositionInfo;
  }

  cleanOtherplayerPositionInfo() {
    this.otherPlayerPositionInfo = [];
  }

  addOtherplayerPositionInfo(data: PlayerPositionRes) {
    this.otherPlayerPositionInfo.push(data);
  }

  shiftOtherplayerPositionInfo() {
    return this.otherPlayerPositionInfo.shift();
  }
}

export const OverworldGlobal = OverworldManager.get();
