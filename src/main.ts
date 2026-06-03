import Phaser from 'phaser';
import InputTextPlugin from 'phaser3-rex-plugins/plugins/inputtext-plugin.js';
import BBCodeTextPlugin from 'phaser3-rex-plugins/plugins/bbcodetext-plugin.js';
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { GameScene } from './scenes/game.scene';
import { initI18n } from './i18n';

const config: Phaser.Types.Core.GameConfig = {
  // WebGL(GPU 가속)을 우선 시도하고, 사용 불가 환경(드라이버 블랙리스트,
  // 하드웨어 가속 비활성화 등)에서는 Canvas 2D로 자동 폴백한다.
  // WEBGL로 고정하면 해당 환경에서 게임이 아예 뜨지 않으므로 AUTO를 사용한다.
  type: Phaser.AUTO,
  parent: 'app',
  scale: {
    width: 1920,
    height: 1080,
    mode: Phaser.Scale.FIT,
  },
  input: {
    keyboard: true,
  },
  plugins: {
    global: [
      {
        key: 'rexInputTextPlugin',
        plugin: InputTextPlugin,
        start: true,
      },
      {
        key: 'rexBBCodeTextPlugin',
        plugin: BBCodeTextPlugin,
        start: true,
      },
    ],
    scene: [
      {
        key: 'rexUI',
        plugin: UIPlugin,
        mapping: 'rexUI',
      },
    ],
  },
  dom: {
    createContainer: true,
  },
  pixelArt: true,
  scene: [GameScene],
};

const start = async () => {
  console.info(`[poposafari] ${__BUILD_VERSION__} (build ${__BUILD_SHA__}) @ ${__BUILD_AT__}`);
  await initI18n();

  const game = new Phaser.Game(config);
};

start();
