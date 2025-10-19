import { io, Socket } from 'socket.io-client';
import { InGameScene } from '../scenes/ingame-scene';
import { PlayerAvatar, PlayerGender, SocketInitData, OtherPlayerEnterRes, OtherPlayerExitRes, CurrentPlayersInRoomRes, PlayerMovementRes, MoveLocation, MovementPlayer } from '../types';
import { GM } from '../core/game-manager';
import { EVENT, MODE } from '../enums';
import { OverworldStorage } from '../storage';
import { eventBus } from '../core/event-bus';

export class SocketHandler {
  private static instance: SocketHandler;
  private scene!: InGameScene;
  private socket!: Socket;
  private isConnected: boolean = false;

  static getInstance(): SocketHandler {
    if (!SocketHandler.instance) {
      SocketHandler.instance = new SocketHandler();
    }
    return SocketHandler.instance;
  }

  init(data: SocketInitData): void {
    this.socket.emit('init', data);
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
      console.log('authenticate', localStorage.getItem('access_token'));
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

  enterLocation(data: MoveLocation): void {
    if (!this.isConnected) return;
    this.socket.emit('enter_location', data);
  }

  movementPlayer(data: MovementPlayer): void {
    if (!this.isConnected) return;
    this.socket.emit('movement_player', data);
  }
}
