import i18next from '@poposafari/i18n';
import { GameScene } from '@poposafari/scenes';
import {
  ItemCategory,
  KEY,
  SFX,
  TEXTSHADOW,
  TEXTSTYLE,
  TEXTURE,
} from '@poposafari/types';
import { addImage, addText } from '@poposafari/utils';
import { TalkMessageUi } from './talk-message.ui';

const ICON_SCALE = 3;
const LINE_GAP_X = 20;

export type PocketTalkParams = {
  name: string;
  item: string;
  category: ItemCategory;
};

export class PocketTalkMessageUi extends TalkMessageUi {
  private line2Text!: GText;
  private categoryIcon!: GImage;

  private lineHeight: number = 0;
  private line1Full: string = '';
  private line2Full: string = '';
  private pocketTypingTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: GameScene) {
    super(scene);
  }

  override createLayout(): void {
    super.createLayout();

    const tmp = this.scene.add.text(0, 0, 'Ag', this.text.style).setVisible(false);
    this.lineHeight = tmp.displayHeight;
    tmp.destroy();

    const baseX = this.text.x;
    const baseY = this.text.y;
    const line2Y = baseY + this.lineHeight;

    this.categoryIcon = addImage(
      this.scene,
      TEXTURE.CURSOR_WHITE,
      undefined,
      baseX,
      line2Y + this.lineHeight / 2,
    ).setScale(ICON_SCALE);
    this.categoryIcon.setVisible(false);

    this.line2Text = addText(
      this.scene,
      baseX,
      line2Y,
      '',
      75,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    ).setOrigin(0, 0);

    this.container.add([this.categoryIcon, this.line2Text]);
  }

  override onInput(key: string): void {
    if (this.inputLocked) return;
    if (key === KEY.Z || key === KEY.ENTER) {
      if (this.isTyping) {
        this.stopPocketTyping();
      } else {
        this.close();
      }
    }
  }

  public async showPocketMessage(params: PocketTalkParams): Promise<void> {
    this.scene.getAudio().playEffect(SFX.CURSOR_0);
    this.window.setTexture(this.scene.getOption().getWindow());

    this.show();
    this.setVisible(true);

    this.inputLocked = true;
    this.scene.time.delayedCall(100, () => {
      this.inputLocked = false;
    });

    const categoryLabel = i18next.t(`bag:category.${params.category}`);
    this.line1Full = i18next.t('safari:pickedItemPocket.line1', {
      name: params.name,
      item: params.item,
    });
    this.line2Full = i18next.t('safari:pickedItemPocket.line2', {
      category: categoryLabel,
    });
    this.fullText = this.line1Full + '\n' + this.line2Full;

    this.text.setText('');
    this.line2Text.setText('');
    this.endCursor.setVisible(false);

    this.categoryIcon.setTexture(`icon_pocket_${params.category}`);
    this.categoryIcon.setScale(ICON_SCALE);
    this.categoryIcon.setVisible(false);

    const iconWidth = this.categoryIcon.displayWidth;
    this.categoryIcon.setX(this.text.x + iconWidth / 2);
    this.line2Text.setX(this.text.x + iconWidth + LINE_GAP_X);

    this.startPocketTyping(this.scene.getOption().getTextSpeed());

    return new Promise<void>((resolve) => {
      this.resolveFunction = resolve;
    });
  }

  private startPocketTyping(speed: number): void {
    this.isTyping = true;
    let idx = 0;
    let phase: 'line1' | 'line2' = 'line1';

    if (this.pocketTypingTimer) this.pocketTypingTimer.remove();

    this.pocketTypingTimer = this.scene.time.addEvent({
      delay: speed,
      loop: true,
      callback: () => {
        if (phase === 'line1') {
          this.text.text += this.line1Full[idx];
          idx++;
          if (idx >= this.line1Full.length) {
            this.categoryIcon.setVisible(true);
            phase = 'line2';
            idx = 0;
          }
        } else {
          this.line2Text.text += this.line2Full[idx];
          idx++;
          if (idx >= this.line2Full.length) {
            this.stopPocketTyping();
          }
        }
      },
    });
  }

  private stopPocketTyping(): void {
    this.isTyping = false;
    if (this.pocketTypingTimer) {
      this.pocketTypingTimer.remove();
      this.pocketTypingTimer = null;
    }
    this.text.setText(this.line1Full);
    this.line2Text.setText(this.line2Full);
    this.categoryIcon.setVisible(true);
    this.onTypingComplete();
  }

  protected override onTypingComplete(): void {
    const tempText = this.scene.add
      .text(0, 0, this.line2Full, this.line2Text.style)
      .setVisible(false);
    const lastLineWidth = tempText.displayWidth;
    const singleLineHeight = tempText.displayHeight;
    tempText.destroy();

    const cursorX = this.line2Text.x + lastLineWidth;
    const cursorY = this.line2Text.y + this.line2Text.displayHeight - singleLineHeight / 2;

    this.endCursor.setPosition(cursorX + 30, cursorY);
    this.endCursor.setVisible(true);
    this.playCursorAnim();
  }

  protected override close(): void {
    if (this.pocketTypingTimer) {
      this.pocketTypingTimer.remove();
      this.pocketTypingTimer = null;
    }
    this.categoryIcon.setVisible(false);
    this.line2Text.setText('');
    super.close();
  }

  override onRefreshLanguage(): void {
    // Locale is interpolated once on show; skip live refresh.
  }
}
