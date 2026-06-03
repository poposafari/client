import { GameScene } from '@poposafari/scenes';
import { TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addContainer, addImage, addText, addWindow } from '@poposafari/utils';
import { MenuListUi } from '../menu/menu-list.ui';

const SAFARI_ZONE_TICKET_ID = 'safari-zone-ticket';

export class SafariZoneListUi extends MenuListUi {
  private readonly TICKET_PANEL = {
    WIDTH: 360,
    HEIGHT: 140,
    GAP: 40,
    ICON_SCALE: 3,
    FONT_SIZE: 60,
    ICON_TEXT_GAP: 60,
    OFFSET_X: 60,
  } as const;

  private ticketPanel!: GContainer;
  private ticketWindow!: GWindow;
  private ticketIcon!: GImage;
  private ticketCountText!: GText;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), {
      x: +1665,
      y: +450,
      visibleCount: 7,
      itemHeight: 0,
      showCancel: true,
    });

    this.createTicketPanel();
  }

  private createTicketPanel(): void {
    const { WIDTH, HEIGHT, GAP, ICON_SCALE, FONT_SIZE, ICON_TEXT_GAP } = this.TICKET_PANEL;

    const panelY = this.config.height! / 2 + GAP + HEIGHT / 2;
    this.ticketPanel = addContainer(this.scene, 0, 0, panelY);

    this.ticketWindow = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      0,
      WIDTH,
      HEIGHT,
      4,
      16,
      16,
      16,
      16,
    );

    const iconTexture = this.scene.textures.exists(SAFARI_ZONE_TICKET_ID)
      ? SAFARI_ZONE_TICKET_ID
      : TEXTURE.BLANK;
    this.ticketIcon = addImage(this.scene, iconTexture, undefined, 0, 0).setScale(ICON_SCALE);

    this.ticketCountText = addText(
      this.scene,
      this.ticketIcon.displayWidth / 2 + ICON_TEXT_GAP,
      0,
      'x0',
      FONT_SIZE,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    const groupWidth = this.ticketIcon.displayWidth + ICON_TEXT_GAP + this.ticketCountText.width;
    const startX = -groupWidth / 2;
    this.ticketIcon.setX(startX + this.ticketIcon.displayWidth / 2);
    this.ticketCountText.setX(this.ticketIcon.x + this.ticketIcon.displayWidth / 2 + ICON_TEXT_GAP);

    this.ticketPanel.add([this.ticketWindow, this.ticketIcon, this.ticketCountText]);
    this.add(this.ticketPanel);
  }

  private refreshTicketCount(): void {
    const quantity = this.scene.getUser()?.getItemQuantity(SAFARI_ZONE_TICKET_ID) ?? 0;
    this.ticketCountText.setText(`x${quantity}`);

    const { ICON_TEXT_GAP } = this.TICKET_PANEL;
    const groupWidth = this.ticketIcon.displayWidth + ICON_TEXT_GAP + this.ticketCountText.width;
    const startX = -groupWidth / 2;
    this.ticketIcon.setX(startX + this.ticketIcon.displayWidth / 2);
    this.ticketCountText.setX(this.ticketIcon.x + this.ticketIcon.displayWidth / 2 + ICON_TEXT_GAP);
  }

  private pinTicketPanel(): void {
    const s = this.scaleX || 1;
    const anchorScreenX = this.config.x + this.TICKET_PANEL.OFFSET_X;
    this.ticketPanel.setX((anchorScreenX - this.x) / s);
  }

  public show(): void {
    super.show();
    this.refreshTicketCount();
    this.pinTicketPanel();
  }

  public updateWindow(): void {
    super.updateWindow();
    if (this.ticketWindow) this.ticketWindow.setTexture(this.scene.getOption().getWindow());
  }
}
