import { io, Socket } from 'socket.io-client';
import { InGameScene } from '../scenes/ingame-scene';
import {
  SocketInitData,
  OtherPlayerEnterRes,
  OtherPlayerExitRes,
  CurrentPlayersInRoomRes,
  PlayerMovementRes,
  MoveLocation,
  MovementPlayer,
  FacingPlayerRes,
  OtherPet,
  ChangePetRes,
  IngameOption,
  IngameData,
} from '../types';
import { GM } from '../core/game-manager';
import { MODE } from '../enums';
import { OverworldStorage } from '../storage';

export class SocketHandler {
  private static instance: SocketHandler;
  private scene!: InGameScene;
  private socket!: Socket;
  private isConnected: boolean = false;
  private isReadyInit: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  static getInstance(): SocketHandler {
    if (!SocketHandler.instance) {
      SocketHandler.instance = new SocketHandler();
    }
    return SocketHandler.instance;
  }

  async init(data: SocketInitData): Promise<void> {
    if (!this.isConnected) {
      await this.waitForConnection();
    }

    this.socket.emit('init', data);
  }

  async connectAndInit(scene: InGameScene, data: SocketInitData): Promise<void> {
    if (!this.isSocketConnected()) {
      this.connect(scene);
    }
    await this.init(data);
  }

  private async waitForConnection(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Socket connection timeout'));
      }, 10000);

      this.socket.on('connect', () => {
        clearTimeout(timeout);
        this.isConnected = true;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    return this.connectionPromise;
  }

  connect(scene: InGameScene): void {
    if (this.isConnected) {
      console.log('Socket is already connected');
      return;
    }

    this.scene = scene;
    this.socket = io('https://poposafari.net', { withCredentials: true, path: '/socket' });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.socket.emit('authenticate', localStorage.getItem('access_token'));
      console.log('Socket connected successfully');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Socket disconnected');
    });

    this.socket.on('authenticated', (result: { success: boolean; error: string | null }) => {
      console.log('Socket authenticated', result);

      if (!result.success) {
        GM.changeMode(MODE.LOGOUT);
      } else {
        this.isReadyInit = true;
      }
    });

    this.socket.on('enter_player', (data: OtherPlayerEnterRes) => {
      OverworldStorage.getInstance().addOtherplayerInfo({ socketId: data.socketId, data: data.player });
      console.log('enter player');
      console.log(data);
    });

    this.socket.on('exit_player', (data: OtherPlayerExitRes) => {
      OverworldStorage.getInstance().addOtherplayerExitInfo(data);
    });

    this.socket.on('current_players_in_room', (data: CurrentPlayersInRoomRes) => {
      data.players.forEach((value) => {
        OverworldStorage.getInstance().addOtherplayerInfo({ socketId: value.socketId, data: value.player });
      });
    });

    this.socket.on('player_movement', (data: PlayerMovementRes) => {
      OverworldStorage.getInstance().addOtherplayerMovementInfo(data);
    });

    this.socket.on('facing_player', (data: FacingPlayerRes) => {
      OverworldStorage.getInstance().addOtherplayerFacingInfo(data);
    });

    this.socket.on('change_pet', (data: ChangePetRes) => {
      OverworldStorage.getInstance().addOtherplayerPetInfo(data);
    });
  }

  disconnect(): void {
    if (!this.isConnected) {
      console.log('Socket is not connected');
      return;
    }

    this.socket.disconnect();
    this.isConnected = false;
  }

  isSocketConnected(): boolean {
    return this.isConnected;
  }

  reconnect(scene: InGameScene): void {
    this.disconnect();
    this.connect(scene);
  }

  updatePlayer(data: Partial<SocketInitData>): void {
    if (!this.isConnected) return;
    this.socket.emit('update_player', data);
  }

  facingPlayer(data: 'up' | 'down' | 'left' | 'right') {
    if (!this.isConnected) return;
    this.socket.emit('facing_player', data);
  }

  moveToTitle(data: { from: string }): void {
    if (!this.isConnected) return;
    this.socket.emit('move_title', data);
  }

  enterLocation(data: MoveLocation): void {
    if (!this.isConnected) return;
    this.socket.emit('enter_location', data);
  }

  movementPlayer(data: MovementPlayer): void {
    if (!this.isConnected) return;
    this.socket.emit('movement_player', data);
  }

  changePet(data: OtherPet): void {
    if (!this.isConnected) return;
    this.socket.emit('change_pet', data);
  }

  changeOption(data: IngameOption): void {
    if (!this.isConnected) return;
    this.socket.emit('change_option', data);
  }

  changePcName(box: number, name: string): void {
    if (!this.isConnected) return;
    this.socket.emit('change_pc_name', { idx: box, name: name });
  }

  changePcBg(box: number, bg: number): void {
    if (!this.isConnected) return;
    this.socket.emit('change_pc_bg', { idx: box, bg: bg });
  }

  changePokemonNickname(idx: number, nickname: string): void {
    if (!this.isConnected) return;
    this.socket.emit('change_pokemon_nickname', { idx: idx, nickname: nickname });
  }

  changeParty(party: (number | null)[]): void {
    if (!this.isConnected) return;
    console.log('change_party', party);

    this.socket.emit('change_party', party);
  }

  changeItemSlot(slots: (number | null)[]): void {
    if (!this.isConnected) return;
    console.log('change_slot_item', slots);
    this.socket.emit('change_slot_item', slots);
  }
}
