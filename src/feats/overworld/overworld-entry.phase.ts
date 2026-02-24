import { io } from 'socket.io-client';
import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import type { InitPosConfig } from './maps/door';
import type { InitOkPayload, RoomUserState } from './overworld-socket.types';
import { VITE_SOCKET_SERVER_URL } from '@poposafari/env';
import { LoginPhase } from '../login';
import { OverworldPhase } from './overworld.phase';
import { OverworldEntryUi } from './overworld-entry.ui';

const SOCKET_SERVER_URL =
  VITE_SOCKET_SERVER_URL ??
  (typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:9010`
    : 'http://localhost:9010');

const AUTH_ERROR_MESSAGES = ['Missing access token', 'Invalid access token'];

export class OverworldEntryPhase implements IGamePhase {
  private ui: OverworldEntryUi | null = null;
  private offFns: Array<() => void> = [];
  private refreshRetried = false;

  constructor(
    private scene: GameScene,
    private initPosConfig?: InitPosConfig,
  ) {}

  async enter(): Promise<void> {
    this.ui = new OverworldEntryUi(this.scene);
    this.ui.show();

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken') ?? ''
        : '';
    let socket = this.scene.getSocket();
    if (!socket?.connected) {
      socket = io(SOCKET_SERVER_URL, {
        auth: { token },
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });
      this.scene.setSocket(socket);
      this.setupConnectErrorHandler(socket);
    }

    if (this.initPosConfig) {
      this.enterChangeMap(socket!);
    } else {
      this.enterInit(socket!);
    }
  }

  private setupConnectErrorHandler(
    socket: ReturnType<typeof io>,
  ): void {
    const handler = async (err: Error & { message?: string }) => {
      const msg = err?.message ?? '';
      if (!AUTH_ERROR_MESSAGES.includes(msg)) return;
      if (this.refreshRetried) {
        this.goToLogin();
        return;
      }
      this.refreshRetried = true;
      const newToken = await this.scene.getApi().refreshAccessToken();
      if (!newToken) {
        this.goToLogin();
        return;
      }
      const oldSocket = socket;
      const newSocket = io(SOCKET_SERVER_URL, {
        auth: { token: newToken },
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });
      oldSocket.off('connect_error', handler);
      oldSocket.disconnect();
      this.scene.setSocket(newSocket);
      this.setupConnectErrorHandler(newSocket);
      if (this.initPosConfig) {
        this.enterChangeMap(newSocket);
      } else {
        this.enterInit(newSocket);
      }
    };
    socket.on('connect_error', handler);
    this.offFns.push(() => socket.off('connect_error', handler));
  }

  private goToLogin(): void {
    this.removeListeners();
    if (this.ui) {
      this.ui.hide();
      this.ui.destroy();
      this.ui = null;
    }
    this.scene.getApi().clearSession();
    this.scene.clearUser();
    const s = this.scene.getSocket();
    if (s) {
      s.disconnect();
      this.scene.setSocket(null);
    }
    this.scene.switchPhase(
      new LoginPhase(this.scene, { initialErrorKey: 'error:sessionExpired' }),
    );
  }

  private enterChangeMap(socket: ReturnType<typeof io>): void {
    if (!socket.connected) {
      this.ui?.setMessage?.('msg:mapPreparing');
      socket.once('connect', () => this.enterChangeMap(socket));
      this.offFns.push(() => socket.off('connect'));
      return;
    }

    socket.emit('change_map', {
      targetMapId: this.initPosConfig!.location,
      x: this.initPosConfig!.x,
      y: this.initPosConfig!.y,
    });

    const onInitRoomState = (payload: { users: RoomUserState[] }) => {
      if (payload?.users?.length) {
        this.scene.setPendingRoomState(payload.users);
      }
    };
    const onChangeMapOk = (_payload: { mapId: string; x: number; y: number }) => {
      this.removeListeners();
      this.ui?.hide();
      this.ui?.destroy();
      this.ui = null;
      this.scene.switchPhase(new OverworldPhase(this.scene));
    };
    const onChangeMapError = (payload: { message?: string }) => {
      this.removeListeners();
      this.ui?.setMessage?.('msg:mapPreparing');
      console.error('[OverworldEntry] change_map_error:', payload?.message);
    };

    socket.on('init_room_state', onInitRoomState);
    socket.on('change_map_ok', onChangeMapOk);
    socket.on('change_map_error', onChangeMapError);
    this.offFns.push(() => {
      socket.off('init_room_state', onInitRoomState);
      socket.off('change_map_ok', onChangeMapOk);
      socket.off('change_map_error', onChangeMapError);
    });
  }

  private enterInit(socket: ReturnType<typeof io>): void {
    const onConnect = () => {
      socket.emit('init');
    };
    const onInitOk = (payload: InitOkPayload) => {
      this.removeListeners();
      this.scene.setCurrentSocketUserId(payload.userId);
      const profile = this.scene.getUser()?.getProfile();
      if (profile && payload.lastLocation) {
        profile.lastLocation = {
          map: payload.lastLocation.map,
          x: payload.lastLocation.x,
          y: payload.lastLocation.y,
        };
      }
      this.ui?.hide();
      this.ui?.destroy();
      this.ui = null;
      this.scene.switchPhase(new OverworldPhase(this.scene));
    };
    const onInitError = (payload: { message?: string }) => {
      this.removeListeners();
      this.ui?.setMessage?.('msg:mapPreparing');
      console.error('[OverworldEntry] init_error:', payload?.message);
      this.ui?.hide();
      this.ui?.destroy();
      this.ui = null;
      this.scene.switchPhase(new OverworldPhase(this.scene));
    };
    const onInitRoomState = (payload: { users: RoomUserState[] }) => {
      if (payload?.users?.length) {
        this.scene.setPendingRoomState(payload.users);
      }
    };

    if (socket.connected) {
      socket.emit('init');
    } else {
      socket.once('connect', onConnect);
      this.offFns.push(() => socket.off('connect', onConnect));
    }

    socket.on('init_ok', onInitOk);
    socket.on('init_error', onInitError);
    socket.on('init_room_state', onInitRoomState);
    this.offFns.push(() => {
      socket.off('init_ok', onInitOk);
      socket.off('init_error', onInitError);
      socket.off('init_room_state', onInitRoomState);
    });
  }

  private removeListeners(): void {
    this.offFns.forEach((fn) => fn());
    this.offFns = [];
  }

  exit(): void {
    this.removeListeners();
    if (this.ui) {
      this.ui.hide();
      this.ui.destroy();
      this.ui = null;
    }
  }
}
