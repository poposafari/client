import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { TitleUi } from './title.ui';
import { LoginPhase } from '../login';
import { OptionPhase } from '../option/option.phase';
import { MysteryGiftPhase } from '../mysterygift/mysterygift.phase';
import { CreateAvatarPhase } from '../tutorial';
import { DeleteAccountPhase } from '../delete-account/delete-account.phase';
import { OverworldEntryPhase } from '../overworld/overworld-entry.phase';
import { QueuePhase } from '../queue';

const ONLINE_REFRESH_MS = 30_000;

export class TitlePhase implements IGamePhase {
  private ui!: TitleUi;

  private savedCursorIndex: number | undefined = undefined;
  private onlineRefreshTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private scene: GameScene,
    private opts: { forceContinueEnabled?: boolean } = {},
  ) {}

  async enter(): Promise<void> {
    const continueEnabled = this.opts.forceContinueEnabled || !!this.scene.getUser();
    this.ui = new TitleUi(this.scene, continueEnabled);

    this.ui.show();
    this.startOnlineRefresh();
    await this.runMenuOnce();
  }

  private async runMenuOnce(): Promise<void> {
    const result = await this.ui.waitForInput(this.savedCursorIndex);
    this.savedCursorIndex = result.cursorIndex;

    try {
      if (result.input === 'continue') {
        if (!this.scene.getUser()) {
          const me = await this.scene.getApi().getMe();
          if (me) this.scene.createUserManager(me);
        }
        if (this.scene.getUser()) {
          const res = await this.scene.getApi().gameConnect();
          if (res.ready) {
            this.scene.switchPhase(new OverworldEntryPhase(this.scene, undefined, res.token));
          } else {
            this.scene.switchPhase(new QueuePhase(this.scene, res.position));
          }
          return;
        }
        await this.runMenuOnce();
        return;
      }
      if (result.input === 'newgame') {
        const hasAvatar = !!this.scene.getUser() || !!this.opts.forceContinueEnabled;
        if (!hasAvatar) {
          this.scene.switchPhase(new CreateAvatarPhase(this.scene));
          return;
        }
        this.scene.pushPhase(new DeleteAccountPhase(this.scene));
        return;
      }
      if (result.input === 'mystery_gift') {
        this.scene.pushPhase(new MysteryGiftPhase(this.scene));
        return;
      }
      if (result.input === 'option') {
        this.scene.pushPhase(new OptionPhase(this.scene));
        return;
      }
      // logout
      const socket = this.scene.getSocket();
      if (socket) {
        socket.disconnect();
        this.scene.setSocket(null);
      }
      await this.scene.getApi().logout();
      this.scene.clearUser();
      this.scene.switchPhase(new LoginPhase(this.scene));
    } catch (error: any) {
      await this.ui.waitForError(error);
      await this.runMenuOnce();
    }
  }

  exit(): void {
    this.stopOnlineRefresh();
    this.ui.hide();
    this.ui.destroy();
  }

  onPause(): void {
    this.stopOnlineRefresh();
  }

  onResume(): void {
    this.ui.updateBg();
    this.startOnlineRefresh();
    this.runMenuOnce();
  }

  onRefreshLanguage(): void {
    this.ui.onRefreshLanguage();
  }

  private startOnlineRefresh(): void {
    this.stopOnlineRefresh();
    void this.refreshOnlineCount();
    this.onlineRefreshTimer = setInterval(() => {
      void this.refreshOnlineCount();
    }, ONLINE_REFRESH_MS);
  }

  private stopOnlineRefresh(): void {
    if (this.onlineRefreshTimer !== null) {
      clearInterval(this.onlineRefreshTimer);
      this.onlineRefreshTimer = null;
    }
  }

  private async refreshOnlineCount(): Promise<void> {
    try {
      const { count } = await this.scene.getApi().getOnlineCount();
      this.ui.setPlayersOnline(count);
    } catch {
      // fail-silent: 부수 정보라 에러 노출 안 함
    }
  }
}
