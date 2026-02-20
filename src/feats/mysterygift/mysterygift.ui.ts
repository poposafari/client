import { BaseUi, IInputHandler } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, IMenuItem, TEXTURE } from '@poposafari/types';
import { MysterygiftMenuUi } from './mysterygift-menu.ui';
import { addBackground, addContainer, getBackgroundKey } from '@poposafari/utils';

export class MysteryGiftUi extends BaseUi implements IInputHandler {
  scene: GameScene;
  private bg!: GImage;
  private leftContainer!: GContainer;
  private menuList!: MysterygiftMenuUi;

  private rightContainer!: GContainer;
  private inputResolver: ((result: IMenuItem | null) => void) | null = null;

  constructor(scene: GameScene, menuList: MysterygiftMenuUi) {
    super(scene, scene.getInputManager(), DEPTH.DEFAULT);
    this.menuList = menuList;

    this.scene = scene;

    this.createLayout();
    this.initTestData();
  }

  onInput(key: string): void {
    this.menuList.onInput(key);
  }

  errorEffect(errorMsg: string): void {
    throw new Error('Method not implemented.');
  }

  createLayout(): void {
    this.bg = addBackground(this.scene, TEXTURE.BG_1);

    this.createLeftLayout();

    this.add([this.bg, this.leftContainer]);
  }

  private createLeftLayout() {
    this.leftContainer = addContainer(this.scene, DEPTH.DEFAULT);
    this.menuList.onSelect = (item) => this.handleSelect(item);
    this.menuList.onCancel = () => this.handleSelect(null);
    this.leftContainer.add(this.menuList);
  }

  private initTestData() {
    const dummyItems: IMenuItem[] = [];

    for (let i = 1; i <= 20; i++) {
      dummyItems.push({
        key: `gift_${i}`,
        label: `Mystery Gift ${i}`,
        count: i % 2 === 0 ? 'New!' : '',
        color: undefined,
      });
    }

    this.menuList.setItems(dummyItems);
  }

  private handleSelect(item: IMenuItem | null) {
    if (this.inputResolver) {
      this.inputResolver(item);
      this.inputResolver = null;
    }
  }

  public waitForInput(): Promise<IMenuItem | null> {
    this.menuList.show();

    return new Promise((resolve) => {
      this.inputResolver = resolve;
    });
  }

  onRefreshLanguage(): void {
    this.menuList.onRefreshLanguage();
  }

  show(): void {
    this.bg.setTexture(getBackgroundKey());
    super.show();
  }
}
