import i18next from 'i18next';
import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { LoginPhase } from '../login';
import { WelcomeUi } from './welcome.ui';
import { ApiError, ErrorCode } from '@poposafari/types';
import { TitlePhase } from '../title';

export class WelcomePhase implements IGamePhase {
  private ui!: WelcomeUi;

  private isUser: boolean = true;

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    const inputManager = this.scene.getInputManager();
    const oauthErrorKey = this.consumeOAuthErrorFromUrl();

    try {
      const res = await this.scene.getApi().getMe();

      if (res) {
        this.scene.createUserManager(res);
        this.scene.pushPhase(new TitlePhase(this.scene));
        return;
      }
    } catch (error: any) {
      this.isUser = false;
      const errorCode = error instanceof ApiError ? error.code : error?.response?.data?.code;

      // 계정은 있지만 캐릭터 미생성 → 캐릭터 생성 화면으로 분기
      if (errorCode === ErrorCode.USER_NOT_FOUND) {
        // isUser = false 상태로 계속 진행 → 아래에서 WelcomeUi 표시
      } else {
        let initialErrorKey: string | undefined;
        if (oauthErrorKey) {
          initialErrorKey = oauthErrorKey;
        } else if (errorCode && errorCode !== ErrorCode.SESSION_MISSING) {
          initialErrorKey = `error:${errorCode}`;
        }
        this.scene.switchPhase(new LoginPhase(this.scene, { initialErrorKey }));
        return;
      }
    }

    if (!this.isUser) {
      this.ui = new WelcomeUi(this.scene, inputManager);
      this.ui.show();

      await this.ui.showWelcomeMsg();
      this.scene.pushPhase(new TitlePhase(this.scene));
    }
  }

  private consumeOAuthErrorFromUrl(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) return undefined;
    params.delete('code');
    const cleaned = params.toString();
    const newUrl = window.location.pathname + (cleaned ? `?${cleaned}` : '') + window.location.hash;
    window.history.replaceState(null, '', newUrl);

    const i18nKey = `error:${code}`;
    return i18next.exists(i18nKey) ? i18nKey : 'error:OAUTH_FAILED';
  }

  exit(): void {
    if (this.ui) {
      this.ui.hide();
      this.ui.destroy();
    }
  }
}
