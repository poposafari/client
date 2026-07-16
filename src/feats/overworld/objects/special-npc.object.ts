import type { NpcConfig, ReactionStep } from '@poposafari/core/map.registry';
import { GameEvent, GameScene } from '@poposafari/scenes';
import { DIRECTION } from '../overworld.constants';
import { NpcObject } from './npc.object';
import { addImage, addObjText } from '@poposafari/utils';
import { TEXTCOLOR, TEXTURE } from '@poposafari/types';
import i18next from 'i18next';

const SAFARI_ZONE_TICKET_ITEM_ID = 'safari-zone-ticket';

export class ProfessorNpcObject extends NpcObject {
  scene: GameScene;

  constructor(scene: GameScene, config: NpcConfig) {
    super(scene, config);
    this.scene = scene;
  }

  override getPhaseRequest(): string | null {
    return 'professor';
  }

  override reaction(direction: DIRECTION): ReactionStep[] {
    this.lookAt(direction);
    return [];
  }
}

export class SafariNpcObject extends NpcObject {
  scene: GameScene;

  constructor(scene: GameScene, config: NpcConfig) {
    super(scene, config);
    this.scene = scene;
  }

  override getPhaseRequest(): string | null {
    return 'safari';
  }

  override reaction(direction: DIRECTION): ReactionStep[] {
    this.lookAt(direction);
    return [];
  }
}

/** 남은 시간(ms)을 HH:MM:SS 로 포맷 */
function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export class SafariTicketNpcObject extends NpcObject {
  scene: GameScene;
  private timerText: GText;
  /** 이름 위에 쌓인 티켓 수만큼 켜지는 아이콘(최대 MAX_ICONS개, 좌→우) */
  private ticketIcons: GImage[] = [];
  private timerEvent: Phaser.Time.TimerEvent;
  /** 이름 라벨 바로 아래에 두기 위한 세로 오프셋(px) */
  private static readonly LABEL_GAP = 16;
  /** 이름 라벨 위로 아이콘을 띄우는 세로 오프셋(px) */
  private static readonly ICON_GAP = 33;
  /** 아이콘 사이 가로 간격(px) */
  private static readonly ICON_SPACING = 4;
  private static readonly ICON_SCALE = 1.5;
  /** 표시 가능한 최대 아이콘 수(= 서버 SAFARI_TICKET_MAX_STOCK) */
  private static readonly MAX_ICONS = 3;

  /** 티켓 수령 등으로 보유량이 바뀌면 폴링(1초)을 기다리지 않고 즉시 갱신한다. */
  private readonly onSafariTicketChanged = (): void => {
    this.refreshTimer();
  };

  constructor(scene: GameScene, config: NpcConfig) {
    super(scene, config);
    this.scene = scene;

    const name = this.getName();

    // 이름 위에 얹을 티켓 아이콘을 최대 개수만큼 미리 만들어두고 available 수만큼만 켠다.
    const iconTexture = scene.textures.exists(SAFARI_ZONE_TICKET_ITEM_ID)
      ? SAFARI_ZONE_TICKET_ITEM_ID
      : TEXTURE.BLANK;
    for (let i = 0; i < SafariTicketNpcObject.MAX_ICONS; i++) {
      const icon = addImage(scene, iconTexture, undefined, name.x, name.y)
        .setScale(SafariTicketNpcObject.ICON_SCALE)
        .setDepth(name.depth)
        .setVisible(false);
      this.ticketIcons.push(icon);
    }

    this.timerText = addObjText(
      scene,
      name.x,
      name.y + SafariTicketNpcObject.LABEL_GAP,
      '',
      15,
      TEXTCOLOR.WHITE,
    );
    this.timerText.setBackgroundColor(TEXTCOLOR.REAL_BLACK + '80');
    this.timerText.setAlign('center');
    // 이름(중앙 정렬) 바로 아래에서 아래로 자라도록 top-center 기준으로 배치
    this.timerText.setOrigin(0.5, 0);
    this.timerText.setDepth(name.depth);

    this.refreshTimer();
    this.timerEvent = scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.refreshTimer(),
    });

    scene.events.on(GameEvent.SAFARI_TICKET_CHANGED, this.onSafariTicketChanged);

    // getMe 데이터가 비어있어도 스스로 최신 상태를 채운다(방어).
    void this.syncFromServer();
  }

  /** 서버에서 티켓 적립 현황을 직접 받아 UserManager 를 최신화한다. */
  private async syncFromServer(): Promise<void> {
    const status = await this.scene
      .getApi()
      .getSafariTicketStatus()
      .catch(() => null);
    if (status) {
      this.scene.getUser()?.setSafariTicket(status);
      this.refreshTimer();
    }
  }

  private refreshTimer(): void {
    if (!this.timerText.active) return;
    const state = this.scene.getUser()?.getSafariTicket();
    if (!state || state.cap === 0) {
      this.timerText.setVisible(false);
      this.refreshTicketIcons(0);
      return;
    }

    // 쌓인 티켓 수만큼 이름 위 아이콘을 켠다(개수 텍스트는 표시하지 않음).
    this.refreshTicketIcons(state.available);

    const timeLine =
      state.available >= state.cap || state.nextTicketAt === null
        ? i18next.t('object:safari_ticket_full')
        : i18next.t('object:safari_ticket_next', {
            time: formatCountdown(state.nextTicketInMs ?? 0),
          });

    this.timerText.setVisible(true);
    this.timerText.setText(timeLine);

    const name = this.getName();
    this.timerText.setPosition(name.x, name.y + SafariTicketNpcObject.LABEL_GAP);
  }

  /** available 개수만큼 아이콘을 켜고 이름 위 중앙에 좌→우로 정렬한다. */
  private refreshTicketIcons(available: number): void {
    const name = this.getName();
    const visible = Math.min(Math.max(0, available), this.ticketIcons.length);
    const iconW = this.ticketIcons[0]?.displayWidth ?? 0;
    const step = iconW + SafariTicketNpcObject.ICON_SPACING;
    const totalWidth = visible > 0 ? (visible - 1) * step : 0;
    const startX = name.x - totalWidth / 2;
    const iconY = name.y - SafariTicketNpcObject.ICON_GAP;

    for (let i = 0; i < this.ticketIcons.length; i++) {
      const icon = this.ticketIcons[i];
      if (i < visible) {
        icon.setPosition(startX + i * step, iconY);
        icon.setVisible(true);
      } else {
        icon.setVisible(false);
      }
    }
  }

  getTimerText(): GText {
    return this.timerText;
  }

  getTicketIcons(): GImage[] {
    return this.ticketIcons;
  }

  override getPhaseRequest(): string | null {
    return 'safariTicket';
  }

  override reaction(direction: DIRECTION): ReactionStep[] {
    this.lookAt(direction);
    return [];
  }

  override destroy(): void {
    this.timerEvent?.remove();
    this.scene.events.off(GameEvent.SAFARI_TICKET_CHANGED, this.onSafariTicketChanged);
    this.timerText?.destroy();
    for (const icon of this.ticketIcons) icon.destroy();
    this.ticketIcons = [];
    super.destroy();
  }
}

export class MartNpcObject extends NpcObject {
  scene: GameScene;
  private readonly martItems: string[];

  constructor(scene: GameScene, config: NpcConfig) {
    super(scene, config);
    this.scene = scene;
    this.martItems = config.martItems ?? [];
  }

  override getPhaseRequest(): string | null {
    return 'mart';
  }

  override reaction(direction: DIRECTION): ReactionStep[] {
    this.lookAt(direction);
    return [];
  }

  getMartItems(): string[] {
    return this.martItems;
  }
}

export class FossilNpcObject extends NpcObject {
  scene: GameScene;

  constructor(scene: GameScene, config: NpcConfig) {
    super(scene, config);
    this.scene = scene;
  }

  override getPhaseRequest(): string | null {
    return 'fossil';
  }

  override reaction(direction: DIRECTION): ReactionStep[] {
    this.lookAt(direction);
    return [];
  }
}

export class MusicianNpcObject extends NpcObject {
  scene: GameScene;

  constructor(scene: GameScene, config: NpcConfig) {
    super(scene, config);
    this.scene = scene;
    this.startSpriteAnimation(config.key);
  }

  override getPhaseRequest(): string | null {
    return 'musician';
  }

  override reaction(_direction: DIRECTION): ReactionStep[] {
    return [];
  }

  override lookAt(_direction: DIRECTION): void {}
}
