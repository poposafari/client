import { GameScene } from '@poposafari/scenes';
import { DEPTH, TEXTSHADOW, TEXTSTYLE } from '@poposafari/types';
import { addText, addWindow } from '@poposafari/utils';
import i18next from 'i18next';

export class PartyBonusPreviewUi extends Phaser.GameObjects.Container {
  private titleText: GText;
  private valueText: GText;

  constructor(scene: GameScene) {
    const { width, height } = scene.cameras.main;
    super(scene, width - 40, height - 120);
    this.setScrollFactor(0);
    this.setDepth(DEPTH.MESSAGE_TOP);

    this.titleText = addText(
      scene,
      0,
      -38,
      '*' + i18next.t('pc:enhancePartyBonus'),
      80,
      '100',
      'left',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    ).setOrigin(1, 0);

    this.valueText = addText(
      scene,
      0,
      +32,
      '',
      80,
      '100',
      'left',
      TEXTSTYLE.SIG_0,
      TEXTSHADOW.GRAY,
    ).setOrigin(1, 0);

    this.add([this.titleText, this.valueText]);
    scene.add.existing(this);
    this.setVisible(false);
  }

  show(currentBonus: number, resultBonus: number): void {
    const cur = (currentBonus * 100).toFixed(1);
    const next = (resultBonus * 100).toFixed(1);
    this.titleText.setText('* ' + i18next.t('pc:enhancePartyBonus'));
    this.valueText.setText(`+${cur}% → +${next}%`);
    this.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
  }
}
