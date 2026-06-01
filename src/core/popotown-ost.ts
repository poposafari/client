import { BGM } from '@poposafari/types';

const POPOTOWN_OST_STORAGE_KEY = 'popotown_ost';

export const POPOTOWN_OST_TRACKS: BGM[] = [
  BGM.P001_0,
  BGM.P001_1,
  BGM.P001_2,
  BGM.P001_3,
  BGM.P001_4,
  BGM.P001_5,
  BGM.P001_6,
  BGM.P001_7,
  BGM.P001_8,
  BGM.P001_9,
  BGM.P001_10,
  BGM.P001_11,
  BGM.P001_12,
  BGM.P001_13,
  BGM.P001_14,
  BGM.P001_15,
];

export const DEFAULT_POPOTOWN_OST: BGM = BGM.P001_0;

const VALID_TRACKS = new Set<string>(POPOTOWN_OST_TRACKS);

export function isPopotownOstTrack(value: string): boolean {
  return VALID_TRACKS.has(value);
}

export function getPopotownOst(): BGM {
  const raw = localStorage.getItem(POPOTOWN_OST_STORAGE_KEY);
  if (raw !== null && VALID_TRACKS.has(raw)) return raw as BGM;
  // 잘못된 값이 저장돼 있었다면(수동 조작 등) Track 1로 덮어써 정정한다.
  if (raw !== null) setPopotownOst(DEFAULT_POPOTOWN_OST);
  return DEFAULT_POPOTOWN_OST;
}

export function setPopotownOst(bgm: BGM): void {
  localStorage.setItem(POPOTOWN_OST_STORAGE_KEY, bgm);
}

export function isPopotownOstMap(mapKey: string): boolean {
  return mapKey.startsWith('p') && mapKey !== 'p003' && mapKey !== 'p009';
}

export function resolveMapBgm(mapKey: string, configBgm: BGM | undefined): BGM | undefined {
  if (isPopotownOstMap(mapKey)) return getPopotownOst();
  return configBgm;
}
