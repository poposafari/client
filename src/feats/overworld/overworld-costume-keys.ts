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

export function getHairTextureKey(gender: UserGender, hair: string): string {
  // hair가 gender prefix 포함 (예: "f_hair_0_c0") → 그대로 사용
  if (/^[mf]_hair_/.test(hair)) {
    return `player_overworld_${hair}`;
  }
  // hair가 prefix 없음 (예: "hair_0_c0") → gender 추가
  const suffix = hair.replace(/^hair_/, '');
  return `player_overworld_${genderCode(gender)}_hair_${suffix}`;
}

export function getOutfitTextureKey(gender: UserGender, outfit: string): string {
  // outfit이 gender prefix 포함 (예: "f_outfit_0") → 그대로 사용
  if (/^[mf]_outfit_/.test(outfit)) {
    return `player_overworld_${outfit}`;
  }
  // outfit이 prefix 없음 (예: "outfit_0") → gender 추가
  return `player_overworld_${genderCode(gender)}_outfit_${idToSuffix(outfit)}`;
}

export function equippedCostumesToParts(
  arr: { costumeId: string }[],
): { skin: string; hair: string; outfit: string } | null {
  let skin = '';
  let hair = '';
  let outfit = '';
  for (const item of arr) {
    const id = item.costumeId;
    if (id.startsWith('skin_')) skin = id;
    else if (id.includes('_hair_')) hair = id;
    else if (id.includes('_outfit_')) outfit = id;
  }
  if (!skin && !hair && !outfit) return null;
  return { skin, hair, outfit };
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
  const defaultHairId = firstHairRow
    ? `${firstHairRow[0]}_${firstColor ?? 'c0'}`
    : 'hair_0_c0';
  const hairKey = getHairTextureKey(gender, defaultHairId);
  return { skin: skinKey, hair: hairKey, outfit: outfitKey };
}
