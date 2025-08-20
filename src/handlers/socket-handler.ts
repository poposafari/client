import { io, Socket } from 'socket.io-client';
import { InGameScene } from '../scenes/ingame-scene';
import { OtherObjectMovementQueue, OtherObjectStartSurf, Otherplayer, PlayerAvatar, PlayerGender, PlayerMove, PlayerPet } from '../types';
import { Location, PlayerInfo } from '../storage/player-info';
import { eventBus } from '../core/event-bus';
import { EVENT } from '../enums/event';

export class SocketHandler {
  private static instance: SocketHandler;
  private scene!: InGameScene;
  private socket!: Socket;

  static getInstance(): SocketHandler {
    if (!SocketHandler.instance) {
      SocketHandler.instance = new SocketHandler();
    }
    return SocketHandler.instance;
  }

  init(data: { overworld: string | null; x: number | null; y: number | null; nickname: string | null; gender: PlayerGender | null; avatar: PlayerAvatar | null; pet: string | null }): void {
    this.socket.emit('init', data);
  }

  connect(scene: InGameScene): void {
    this.scene = scene;

    this.socket = io('https://poposafari.net', { withCredentials: true, path: '/socket' });

    this.socket.on('get-players', (data: Record<number, Otherplayer>) => {
      Object.entries(data).forEach(([accountId, playerData]) => {
        if (accountId !== PlayerInfo.getInstance().getId()) this.addOtherPlayer(Number(accountId), playerData);
      });
    });

    this.socket.on('enter', (id: number, data: Otherplayer) => {
      console.log('socket on <enter> ', id, data);

      if (data) this.addOtherPlayer(id, data);
    });

    this.socket.on('exit', (id: number) => {
      this.deletePlayer(id);
    });

    this.socket.on('move', (movement: OtherObjectMovementQueue) => {
      eventBus.emit(EVENT.MOVE_OTHER_PLAYER, movement);
    });

    this.socket.on('pet', (data: PlayerPet) => {
      eventBus.emit(EVENT.CHANGE_PET, data);
    });

    window.addEventListener('beforeunload', () => {
      this.socket.emit('logout', PlayerInfo.getInstance().getId());
    });
  }

  addOtherPlayer(accountId: number, player: Otherplayer): void {
    console.log(accountId, player);
    eventBus.emit(EVENT.CREATE_OTHER_PLAYER, accountId, player);
  }

  deletePlayer(accountId: number): void {
    eventBus.emit(EVENT.DELETE_OTHER_PLAYER, accountId);
  }

  deleteAllPlayer(): void {
    eventBus.emit(EVENT.DELETE_ALL_OTHER_PLAYER);
  }

  move(data: PlayerMove): void {
    this.socket.emit('move', { overworld: data.overworld, x: data.x, y: data.y, direction: data.direction, status: data.status });
  }

  exitOverworld(accountId: number): void {
    this.socket.emit('exit', accountId);
  }

  enterOverworld(location: Location): void {
    this.deleteAllPlayer();
    this.socket.emit('enter', location);
  }

  changePet(data: { overworld: string; pet: string | null }) {
    this.socket.emit('pet', data);
  }

  logout(accountId: number): void {
    this.socket.emit('disconnect', accountId);
  }
}
