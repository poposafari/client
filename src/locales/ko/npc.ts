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
    name: '티켓 우체부',
    scripts: [
      'talk_intro_안녕하십니까!\n무료 사파리 티켓을 나눠드리고 있습니다.',
      'talk_action_현재 수령 가능한 티켓은\n%개 입니다.',
      'question_intro_수령하시겠습니까?',
      'talk_reject_현재 수령 가능한 티켓은 없습니다.',
    ],
    postAction: '',
  },
  npc002: {
    name: '상점 주인',
    scripts: [
      'talk_intro_어서오세요! 무엇을 도와드릴까요?',
      'question_action_% x%개 총 %캔디입니다.\n구매하시겠습니까?',
      'talk_reject_사탕이 부족하시네요.',
      'talk_accept_네 여기 있습니다.\n대단히 감사합니다.',
      'talk_end_다음에 또 오세요',
    ],
    postAction: '',
  },
};
