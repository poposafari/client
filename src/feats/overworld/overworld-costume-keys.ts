import type { GameScene } from '@poposafari/scenes';
import type { UserGender } from '@poposafari/types';

export function idToSuffix(id: string): string {
  const match = id.match(/\d+/);
  return match ? match[0] : id;
}

export function genderCode(g: UserGender): 'm' | 'f' {
  return g === 'male' ? 'm' : 'f';
}

export function getSkinTextureKey(skinId: string): string {
  return `player_overworld_skin_${idToSuffix(skinId)}`;
}

export function getHairTextureKey(gender: UserGender, hair: string, hairColor: string): string {
  return `player_overworld_${genderCode(gender)}_hair_${idToSuffix(hair)}_${hairColor}`;
}

export function getOutfitTextureKey(gender: UserGender, outfit: string): string {
  return `player_overworld_${genderCode(gender)}_outfit_${idToSuffix(outfit)}`;
}

export function getDefaultOverworldKeys(
  scene: GameScene,
  gender: UserGender,
): { skin: string; hair: string; outfit: string } {
  const c = scene.getMasterData().getCostume();
  const g = genderCode(gender);
  const skin = c.skin[0];
  const skinKey = skin ? getSkinTextureKey(skin) : `player_overworld_skin_0`;
  const genderData = c[gender];
  const firstOutfit = genderData.outfits[0];
  const outfitKey = firstOutfit
    ? getOutfitTextureKey(gender, firstOutfit)
    : `player_overworld_${g}_outfit_0`;
  const firstHairRow = genderData.hairs[0];
  const firstColor = firstHairRow?.[1];
  const hairKey =
    firstHairRow && firstColor
      ? getHairTextureKey(gender, firstHairRow[0], firstColor)
      : `player_overworld_${g}_hair_0_${firstColor ?? 'c0'}`;
  return { skin: skinKey, hair: hairKey, outfit: outfitKey };
}
