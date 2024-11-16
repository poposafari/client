export class BaseScene extends Phaser.Scene {
  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  loadImage(key: string, folder: string, filename: string) {
    if (filename) {
      filename = `${filename}.png`;
    }
    this.load.image(key, `${folder}/${filename}`);
  }

  loadAtlas(key: string, folder: string, filename: string) {
    this.load.atlas(key, `${folder}/${filename}.png`, `${folder}/${filename}.json`);
  }
}
