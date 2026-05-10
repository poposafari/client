export type TranslationBattle = {
  [key: string]: string;
};

export const battle: TranslationBattle = {
  selectBall: '볼',
  selectFeed: '먹이',
  selectMud: '진흙',
  selectRun: '도망간다',
  messageCaught: '{{name}} 을(를) 잡았다!',
  messageFail: '안돼! 포켓몬이 볼에서\n 나와버렸다!',
  messageFlee: '야생 포켓몬이 도망쳤다!',
  messageAppear: '앗! 야생의 {{name}}가 나타났다!',
  messageIdle: '{{nickname}}은 무엇을 던질까?',
  messageThrewBall: '{{nickname}}은 사파리볼을 던졌다!',
  messageThrewFeed: '{{nickname}}은 먹이를 던졌다!',
  messageThrewMud: '{{nickname}}은 진흙을 던졌다!',
  messageFleePlayer: '무사히 도망쳤다.',
  messageUsedBall: '{{nickname}}은(는)\n사파리볼을 사용했다.',
  messageCaughtNew: '신난다-\n{{name}}을(를) 붙잡았다!',
  messageBallEscape: '안돼! 포켓몬이\n볼에서 나와버렸다!',
  messageWatching: '{{name}}은(는)\n상황을 살피고 있다.',
  messageThrewFeedNew: '{{nickname}}은(는)\n먹이를 던졌다.',
  messageEatingFocus: '{{name}}은(는)\n먹이를 먹는데 푹 빠졌다.',
  messageThrewMudNew: '{{nickname}}은(는)\n진흙을 던졌다.',
  messageAngry: '{{name}}은(는)\n화내고 있다.',
  messageWildFled: '{{name}}은(는) 도망쳤다!',
  turn: '{{turn}} 턴',
  catchRate: '포획률 - {{rate}}%',
  fleeRate: '도주율 - {{rate}}%',
  safariBall: '사파리 볼',
  safariLeft: '{{count}}개 남음',
  rewardExpGained: '획득 경험치',
};
