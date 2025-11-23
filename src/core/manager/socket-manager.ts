import { io, Socket } from 'socket.io-client';
import { InGameScene } from '../../scenes/ingame-scene';
import {
  SocketInitData,
  OtherPlayerEnterRes,
  OtherPlayerExitRes,
  CurrentPlayersInRoomRes,
  PlayerPositionRes,
  MoveLocation,
  MovementPlayer,
  OtherPet,
  ChangePetRes,
  IngameOption,
  IngameData,
} from '../../types';
import { MODE } from '../../enums';
import { OverworldGlobal } from '../storage/overworld-storage';
import { Game } from './game-manager';

const URL = (import.meta.env.NODE_ENV as string) === 'dev' ? 'http://localhost:3001' : 'https://poposafari.net';

export class SocketManager {
  private static instance: SocketManager;
  private scene!: InGameScene;
  private socket!: Socket;
  private isConnected: boolean = false;
  private isReadyInit: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  async init(data: SocketInitData): Promise<void> {
    if (!this.isConnected) {
      await this.waitForConnection();
    }

    await this.waitForAuthenticated();
    console.log('Socket init event');
    this.socket.emit('init', data);
  }

  async connectAndInit(scene: InGameScene, data: SocketInitData): Promise<void> {
    if (!this.isSocketConnected()) {
      this.connect(scene);
    }
    await this.waitForConnection();

    const token = localStorage.getItem('access_token');
    this.socket.emit('authenticate', token);
    await this.waitForAuthenticated();

    this.socket.emit('init', data);
    const initResult = await this.waitForInit();
    if (!initResult.success) {
      throw new Error(`Socket init failed: ${initResult.error ?? 'unknown error'}`);
    }
  }

  private async waitForConnection(): Promise<void> {
    if (this.isConnected) {
      return;
    }
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

  private async waitForAuthenticated(): Promise<void> {
    if (this.isReadyInit) return;
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Socket authentication timeout'));
      }, 10000);
      const onAuthenticated = (result: { success: boolean; error: string | null }) => {
        if (result.success) {
          clearTimeout(timeout);
          this.socket.off('authenticated', onAuthenticated);
          this.isReadyInit = true;
          resolve();
        }
      };
      this.socket.on('authenticated', onAuthenticated);
    });
  }

  private async waitForInit(): Promise<{ success: boolean; error: string | null }> {
    return await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Socket init_result timeout'));
      }, 10000);
      const handler = (data: { success: boolean; error: string | null }) => {
        clearTimeout(timeout);
        this.socket.off('init_result', handler);
        resolve(data);
      };
      this.socket.on('init_result', handler);
    });
  }

  connect(scene: InGameScene): void {
    if (this.isConnected) {
      console.log('Socket is already connected');
      return;
    }

    this.scene = scene;
    this.socket = io(URL, { withCredentials: true, path: '/socket.io' });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.socket.emit('authenticate', localStorage.getItem('access_token'));
      // console.log('Socket connected successfully');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      // console.log('Socket disconnected');
    });

    this.socket.on('authenticated', (result: { success: boolean; error: string | null }) => {
      if (!result.success) {
        Game.changeMode(MODE.LOGOUT);
      } else {
        this.isReadyInit = true;
      }
    });

    this.socket.on('enter_player', (data: OtherPlayerEnterRes) => {
      OverworldGlobal.addOtherplayerInfo({ socketId: data.socketId, data: data.player });
    });

    this.socket.on('exit_player', (data: OtherPlayerExitRes) => {
      OverworldGlobal.addOtherplayerExitInfo(data);
    });

    this.socket.on('current_players_in_room', (data: CurrentPlayersInRoomRes) => {
      const currentLocation = OverworldGlobal.getKey();
      if (data.location === currentLocation) {
        data.players.forEach((value) => {
          if (value.player.location === currentLocation) {
            OverworldGlobal.addOtherplayerInfo({ socketId: value.socketId, data: value.player });
          }
        });
      }
    });

    this.socket.on('player_position', (data: PlayerPositionRes) => {
      OverworldGlobal.addOtherplayerPositionInfo(data);
    });

    this.socket.on('change_pet', (data: ChangePetRes) => {
      OverworldGlobal.addOtherplayerPetInfo(data);
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
    this.socket.emit('change_party', party);
  }

  changeItemSlot(slots: (number | null)[]): void {
    if (!this.isConnected) return;
    this.socket.emit('change_slot_item', slots);
  }

  updateIsStarter0(): void {
    if (!this.isConnected) return;
    this.socket.emit('update_is_starter0');
  }

  updateIsStarter1(): void {
    if (!this.isConnected) return;
    this.socket.emit('update_is_starter1');
  }
}

export const SocketIO = SocketManager.getInstance();
