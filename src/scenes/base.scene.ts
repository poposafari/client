import { assetUrl, assetUrlSafe } from '@poposafari/utils/asset-url';

export class BaseScene extends Phaser.Scene {
  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  loadImage(key: string, folder: string, filename: string) {
    if (filename) {
      filename = `${filename}.png`;
    }
    this.load.image(key, assetUrl(`${folder}/${filename}`));
  }

  loadAtlas(key: string, folder: string, filename: string, jsonname: string, jsonFolder?: string) {
    const imagePath = assetUrl(`${folder}/${filename}.png`);
    let jsonPath: string;

    if (jsonFolder) {
      jsonPath = assetUrl(`${jsonFolder}/${jsonname}.json`);
    } else {
      if (
        jsonname.includes('pokemon_icon') ||
        jsonname.includes('pokemon_overworld_0') ||
        jsonname.includes('pokemon_overworld_1')
      ) {
        jsonPath = assetUrl(`ui/pokemon/${jsonname}.json`);
      } else {
        jsonPath = assetUrl(`${folder}/${jsonname}.json`);
      }
    }

    this.load.atlas(key, imagePath, jsonPath);
  }

  loadMap(key: string, folder: string, filename: string) {
    if (filename) {
      filename = `${filename}.json`;
    }
    this.load.tilemapTiledJSON(key, assetUrl(`${folder}/${filename}`));
  }

  loadAudio(key: string, folder: string, filename: string, extension: string) {
    if (filename) {
      filename = `${filename}.${extension}`;
    }

    const url = assetUrlSafe(`${folder}/${filename}`);
    if (!url) {
      console.warn(`[loadAudio] asset not found, skipped: ${folder}/${filename}`);
      return;
    }
    this.load.audio(key, url);
  }

  loadJson(key: string, folder: string, filename: string) {
    if (filename) {
      filename = `${filename}.json`;
    }
    this.load.json(key, `${folder}/${filename}?v=${__BUILD_SHA__}`);
  }
}
