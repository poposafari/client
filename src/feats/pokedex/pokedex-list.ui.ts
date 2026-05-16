import { GameScene } from '@poposafari/scenes';
import { KEY, SFX, TEXTCOLOR, TEXTURE } from '@poposafari/types';
import { MenuListUi } from '../menu/menu-list.ui';

export class PokedexListUi extends MenuListUi {
  public onFilterShift?: (delta: -1 | 1) => void;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), {
      width: 861,
      x: 1470,
      y: 622,
      visibleCount: 7,
      itemHeight: 0,
      itemGap: 0,
      cursorWindowTexture: TEXTURE.WINDOW_CURSOR_R,
      enableOwnedIcon: true,
    });
    this.setWindowVisible(false);
    this.setDefaultColor(TEXTCOLOR.BLACK);
    this.setHighlightColor(null);
  }

  protected handleCustomInput(key: string): void {
    if (key === KEY.LEFT) {
      this.scene.getAudio().playEffect(SFX.CURSOR_0);
      this.onFilterShift?.(-1);
    } else if (key === KEY.RIGHT) {
      this.scene.getAudio().playEffect(SFX.CURSOR_0);
      this.onFilterShift?.(1);
    }
  }
}
