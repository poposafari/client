import { GameScene } from '@poposafari/scenes';
import { IInputHandler, InputManager } from './input.manager';

export interface IRefreshableLanguage {
  onRefreshLanguage(): void;
}

export abstract class BaseUi extends Phaser.GameObjects.Container implements IInputHandler {
  protected inputManager: InputManager;

  constructor(scene: GameScene, manager: InputManager, depth: number) {
    const { width, height } = scene.cameras.main;
    super(scene, width / 2, height / 2);

    this.inputManager = manager;
    this.setScrollFactor(0); // 카메라가 움직여도 UI는 고정
    this.setDepth(depth);

    this.setVisible(false);
    scene.add.existing(this);
  }

  public show(): void {
    const zoom = this.scene.cameras.main.zoom;
    this.setScale(zoom > 0 ? 1 / zoom : 1);

    this.setVisible(true);
    this.inputManager.push(this); // 스택 등록
  }

  public hide(): void {
    this.setVisible(false);
    this.inputManager.pop(this); // 스택 해제
  }

  abstract onInput(key: string): void;
  abstract errorEffect(errorMsg: string): void;
  abstract waitForInput(): Promise<any>;
  abstract createLayout(): void;
}
