import { GameScene } from '@poposafari/scenes';
import { BGM, IMenuItem } from '@poposafari/types';
import { isPopotownOstTrack } from '@poposafari/core/popotown-ost';
import { MenuListUi } from './menu-list.ui';

export class MusicianListUi extends MenuListUi {
  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), {
      x: scene.scale.width / 2 + 700,
      y: scene.scale.height / 2 - 150,
      visibleCount: 6,
      itemHeight: 0,
      showCancel: true,
    });

    this.onCursorMove = (_index, item) => this.previewTrack(item);
  }

  override show(): void {
    super.show();
    const current = this.items[this.cursorIndex];
    if (current) this.previewTrack(current);
  }

  private previewTrack(item: IMenuItem): void {
    if (!isPopotownOstTrack(item.key)) return;
    this.scene.getAudio().playBackground(item.key as BGM, 200);
  }
}
