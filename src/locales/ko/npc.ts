import { TranslationNpc } from '../../interface/locales';

export const npc: TranslationNpc = {
  npc000: {
    name: '택시 드라이버',
    scripts: [
      'talk_welcome_안녕하십니까! 택시 드라이버입니다.\n포켓몬을 잡을 수 있는 사파리존으로 안내 해드립니다.\n',
      'talk_welcome_어디로 모실까요?\n',
      'talk_reject_티켓이 부족하시네요.',
      'question_welcome_(으)로\n이동하실건가요?',
      'talk_sorry_다음에 또 이용해주세요.',
    ],
    postAction: 'OverworldTaxiListUi',
  },
  npc001: {
    name: '택시 드라이버',
    scripts: ['question_welcome_마을로 돌아가시겠습니까?'],
    postAction: 'backToVillage',
  },
  npc002: {
    name: '상점 주인',
    scripts: ['talk_welcome_안녕하세요! 무엇을 도와드릴까요?', 'question_welcome_구매하시겠습니까?', 'talk_reject_돈이 부족하시네요', 'talk_success_계산되었습니다!\n다음에 또 이용해주세요.'],
    postAction: '',
  },
};
