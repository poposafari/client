import { OverworldGlobal, OverworldManager } from '../../core/storage/overworld-storage';
import { DIRECTION, OBJECT } from '../../enums';
import { OtherPlayerOverworldObj } from '../../obj/other-player-overworld-obj';
import { InGameScene } from '../../scenes/ingame-scene';
import { ChangePetRes, OtherPlayerInfo, PlayerPositionRes } from '../../types';

export class OverworldOtherPlayer {
  private scene: InGameScene;
  private otherPlayers: Map<string, OtherPlayerOverworldObj> = new Map<string, OtherPlayerOverworldObj>();
  private map!: Phaser.Tilemaps.Tilemap;
  private storage: OverworldManager;
  private currentMapKey: string | null = null;

  constructor(scene: InGameScene) {
    this.scene = scene;
    this.storage = OverworldGlobal;
  }

  show(map: Phaser.Tilemaps.Tilemap): void {
    const newMapKey = this.storage.getKey();

    this.resetOtherPlayers();

    this.clean();

    this.map = map;
    this.currentMapKey = newMapKey;

    if (!this.map || !this.currentMapKey) {
      this.resetOtherPlayers();
    }
  }

  clean() {
    this.resetOtherPlayers();

    this.storage.cleanOtherplayerExitInfo();
    this.storage.cleanOtherplayerInfo();
    this.storage.cleanOtherplayerPositionInfo();

    this.currentMapKey = null;
  }

  update(delta: number): void {
    const currentMapKey = this.storage.getKey();
    if (this.currentMapKey !== null && this.currentMapKey !== currentMapKey) {
      this.resetOtherPlayers();
      this.clean();
      this.currentMapKey = currentMapKey;
      return;
    }

    this.removePlayersFromOtherMaps();

    this.updateOtherPlayerPosition(this.storage.shiftOtherplayerPositionInfo()!);

    this.removeOtherPlayer(this.storage.shiftOtherplayerExitInfo()?.socketId!);
    this.addOtherPlayer(this.storage.shiftOtherplayerInfo()!);
    this.OtherPlayerPet(this.storage.shiftOtherplayerPetInfo()!);

    if (this.map) {
      this.getOtherPlayers().forEach((player) => {
        player.update(delta);
      });
    }
  }

  addOtherPlayer(player: OtherPlayerInfo): void {
    if (!player) return;

    const currentLocation = this.storage.getKey();
    if (!currentLocation || player.data.location !== currentLocation) {
      this.removeOtherPlayer(player.socketId);
      return;
    }

    const existingPlayer = this.otherPlayers.get(player.socketId);
    if (existingPlayer) {
      existingPlayer.destroy();
      this.otherPlayers.delete(player.socketId);
    }

    const otherPlayer = new OtherPlayerOverworldObj(
      this.scene,
      this.map,
      player.data.gender,
      player.data.avatar,
      player.data.pet?.texture ?? null,
      player.data.x,
      player.data.y,
      player.data.nickname,
      OBJECT.OTHER_PLAYER,
      DIRECTION.DOWN,
    );
    this.otherPlayers.set(player.socketId, otherPlayer);
  }

  removeOtherPlayer(socketId: string): void {
    if (!socketId) return;

    const otherPlayer = this.otherPlayers.get(socketId);
    if (otherPlayer) {
      otherPlayer.destroy();
      this.otherPlayers.delete(socketId);
    }
  }

  getOtherPlayers(): Map<string, OtherPlayerOverworldObj> {
    return this.otherPlayers;
  }

  getOtherPlayer(socketId: string): OtherPlayerOverworldObj | undefined {
    return this.otherPlayers.get(socketId);
  }

  updateOtherPlayerPosition(position: PlayerPositionRes): void {
    if (!position) return;

    const currentLocation = this.storage.getKey();
    if (!currentLocation) return;

    const otherPlayer = this.otherPlayers.get(position.socketId);
    if (otherPlayer) {
      otherPlayer.updatePosition(position.data.x, position.data.y, position.data.movement, position.data.timestamp);
    }
  }

  OtherPlayerPet(data: ChangePetRes): void {
    if (!data) return;

    const otherPlayer = this.otherPlayers.get(data.socketId);
    if (otherPlayer) {
      otherPlayer.getPet()?.changePet(data.data?.texture ?? null, otherPlayer.getCurrentStatus());
    }
  }

  private resetOtherPlayers(): void {
    this.otherPlayers.forEach((player) => {
      try {
        player.destroy();
      } catch (error) {
        console.error(`[OverworldOtherPlayer] Error destroying player: ${error}`);
      }
    });
    this.otherPlayers.clear();
  }

  private removePlayersFromOtherMaps(): void {
    const currentLocation = this.storage.getKey();
    if (!currentLocation || !this.map) {
      this.resetOtherPlayers();
      return;
    }

    if (this.currentMapKey !== this.storage.getKey()) {
      this.resetOtherPlayers();
      this.currentMapKey = this.storage.getKey();
    }
  }
}
