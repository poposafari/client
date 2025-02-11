import { PlayerInfo } from '../storage/player-info';

describe('Player test.', () => {
  let player: PlayerInfo;

  beforeEach(() => {
    player = new PlayerInfo();
  });

  test('Player 기본 데이터 업데이트 테스트', () => {
    player.setNickname('TestName');
    expect(player.getNickname()).toBe('TestName');

    player.setGender('girl');
    expect(player.getGender()).toBe('girl');

    player.setGender('boy');
    expect(player.getGender()).toBe('boy');

    player.setAvatar(1);
    expect(player.getAvatar()).toBe(1);

    player.setAvatar(2);
    expect(player.getAvatar()).toBe(2);

    player.setLocation({ overworld: '000', x: 10, y: 10 });
    expect(player.getLocation()).toEqual({ overworld: '000', x: 10, y: 10 });

    player.setMoney(10000);
    expect(player.getMoney()).toBe(10000);

    player.setPet('001');
    expect(player.getPet()).toBe('001');
  });

  test('소지금 사용 테스트', () => {
    player.setMoney(1000);
    expect(player.getMoney()).toBe(1000);

    player.useMoney(100);
    expect(player.getMoney()).toBe(900);

    player.useMoney(500);
    expect(player.getMoney()).toBe(400);

    expect(player.useMoney(1000)).toBeFalsy();

    player.useMoney(400);
    expect(player.getMoney()).toBe(0);

    expect(player.useMoney(5000)).toBeFalsy();
  });
});
