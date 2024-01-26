import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;

export const gameConfig: Phaser.Types.Core.GameConfig = {
    title: "PoPoSeop",
    render: {
      antialias: false,
    },
    type: Phaser.AUTO,
    scene: [],
    scale: {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    dom: {
      createContainer: true
    },
    plugins: {
		scene: [
			{
				key: 'rexUI',
				plugin: RexUIPlugin,
				mapping: 'rexUI'
			}
		]
    },
    backgroundColor: '#4488aa',
    pixelArt:true,
  };