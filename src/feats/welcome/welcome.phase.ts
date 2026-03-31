import { io } from 'socket.io-client';
import { ApiBlockingUi, IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { LoginPhase } from '../login';
import { WelcomeUi } from './welcome.ui';
import { ApiError, ErrorCode } from '@poposafari/types';
import { TitlePhase } from '../title';
import { VITE_SOCKET_SERVER_URL } from '@poposafari/env';

const SOCKET_SERVER_URL =
  VITE_SOCKET_SERVER_URL ??
  (typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:9010`
    : 'http://localhost:9010');

export class WelcomePhase implements IGamePhase {
  private ui!: WelcomeUi;
  private blocker!: ApiBlockingUi;

  private isUser: boolean = true;

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    const inputManager = this.scene.getInputManager();
    this.blocker = new ApiBlockingUi(this.scene);

    try {
      const res = await this.scene.getApi().getMe();

      this.blocker.blockInput();

      if (res) {
        this.scene.createUserManager(res);
        await this.connectSocket();
        this.blocker.unblockInput();
        this.scene.pushPhase(new TitlePhase(this.scene));
        return;
      }
    } catch (error: any) {
      this.isUser = false;
      const errorCode = error instanceof ApiError ? error.code : error.code;

      // 계정은 있지만 캐릭터 미생성 → 캐릭터 생성 화면으로 분기
      if (errorCode === ErrorCode.USER_NOT_FOUND) {
        this.blocker.unblockInput();
        // isUser = false 상태로 계속 진행 → 아래에서 WelcomeUi 표시
      } else {
        this.blocker.unblockInput();
        this.scene.switchPhase(new LoginPhase(this.scene, { initialErrorKey: errorCode }));
        return;
      }
    }

    if (!this.isUser) {
      this.ui = new WelcomeUi(this.scene, inputManager);
      this.ui.show();

      await this.ui.showWelcomeMsg();
      this.blocker.unblockInput();
      this.scene.pushPhase(new TitlePhase(this.scene));
    }
  }

  private async connectSocket(): Promise<void> {
    const token = await this.scene.getApi().getConnToken();
    const socket = io(SOCKET_SERVER_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    this.scene.setSocket(socket);
  }

  exit(): void {
    if (this.ui) {
      this.ui.hide();
      this.ui.destroy();
    }
    this.blocker.hide();
    this.blocker.destroy();
  }
}
