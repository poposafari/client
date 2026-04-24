/**
 * 펫 감정 상태 정의. pet_emo 텍스처는 프레임이 2장씩 한 쌍으로 감정 하나를 구성한다.
 *  1: 조용히 있음   (pet_emo-0,1)
 *  2: 깜짝 놀람     (pet_emo-2,3)
 *  3: 궁금해한다    (pet_emo-4,5)
 *  4: 음표(흥얼)    (pet_emo-6,7)
 *  5: 하트(사랑)    (pet_emo-8,9)
 *  6: 뭘 잘못 먹음  (pet_emo-10,11)
 *  7: 기분이 좋음   (pet_emo-12,13)
 *  8: 기분이 너무 좋음 (pet_emo-14,15)
 *  9: 슬픔          (pet_emo-16,17)
 * 10: 살짝 기분 나쁨 (pet_emo-18,19)
 * 11: 개빡침        (pet_emo-20,21)
 */
export const PET_EMOTION_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
export type PetEmotionId = (typeof PET_EMOTION_IDS)[number];

export const PET_EMOTION_COUNT = PET_EMOTION_IDS.length;

/** 감정 상태 유지 시간 범위 (밀리초). 10~30분. */
export const PET_EMOTION_DURATION_MIN_MS = 10 * 60 * 1000;
export const PET_EMOTION_DURATION_MAX_MS = 30 * 60 * 1000;

export function petEmotionAnimKey(id: PetEmotionId): string {
  return `pet_emo.${id}`;
}

export function petEmotionFramePair(id: PetEmotionId): [string, string] {
  const base = (id - 1) * 2;
  return [`pet_emo-${base}`, `pet_emo-${base + 1}`];
}

export function randomPetEmotionId(): PetEmotionId {
  const idx = Math.floor(Math.random() * PET_EMOTION_IDS.length);
  return PET_EMOTION_IDS[idx];
}

/** 긍정 감정 목록. 말을 걸 때 부르르 떨기 대신 제자리 점프로 반응한다. */
const POSITIVE_EMOTION_SET = new Set<PetEmotionId>([
  4, // 흥얼
  5, // 하트
  7, // 기분 좋음
  8, // 매우 기쁨
]);

export function isPositivePetEmotion(id: PetEmotionId): boolean {
  return POSITIVE_EMOTION_SET.has(id);
}

/**
 * 감정별 포켓몬 울음소리 pitch/speed 조정.
 *  - rate: 재생 속도(+피치). 1.0 기본, <1 느리고 낮게, >1 빠르고 높게.
 *  - detune: cent 단위 피치(템포 유지). 100 = 반음.
 * 부정적 감정일수록 rate/detune이 낮아져 루즈한 느낌.
 */
export const PET_CRY_TONE_BY_EMOTION: Record<PetEmotionId, { rate: number; detune: number }> = {
  1: { rate: 1.0, detune: 0 }, // 조용함
  2: { rate: 1.12, detune: 200 }, // 깜짝 놀람
  3: { rate: 1.0, detune: 0 }, // 궁금
  4: { rate: 1.03, detune: 30 }, // 흥얼
  5: { rate: 0.98, detune: -20 }, // 하트 (차분하고 포근하게)
  6: { rate: 0.88, detune: -150 }, // 탈이 남
  7: { rate: 1.03, detune: 30 }, // 기분 좋음
  8: { rate: 1.08, detune: 100 }, // 매우 기쁨
  9: { rate: 0.82, detune: -250 }, // 슬픔
  10: { rate: 0.95, detune: -50 }, // 살짝 삐침
  11: { rate: 1.1, detune: 150 }, // 개빡침
};
