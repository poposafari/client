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

  loadAtlas(key: string, folder: string, filename: string, jsonname: string, jsonFolder?: string) {
    const imagePath = `${folder}/${filename}.png`;
    let jsonPath: string;

    if (jsonFolder) {
      jsonPath = `${jsonFolder}/${jsonname}.json`;
    } else {
      if (
        jsonname.includes('pokemon_icon') ||
        jsonname.includes('pokemon_overworld_0') ||
        jsonname.includes('pokemon_overworld_1')
      ) {
        jsonPath = `ui/pokemon/${jsonname}.json`;
      } else {
        jsonPath = `${folder}/${jsonname}.json`;
      }
    }

    this.load.atlas(key, imagePath, jsonPath);
  }

  loadMap(key: string, folder: string, filename: string) {
    if (filename) {
      filename = `${filename}.json`;
    }
    this.load.tilemapTiledJSON(key, `${folder}/${filename}`);
  }

  loadAudio(key: string, folder: string, filename: string, extension: string) {
    if (filename) {
      filename = `${filename}.${extension}`;
    }
    this.load.audio(key, `${folder}/${filename}`);
  }

  loadJson(key: string, folder: string, filename: string) {
    if (filename) {
      filename = `${filename}.json`;
    }
    this.load.json(key, `${folder}/${filename}`);
  }
}
