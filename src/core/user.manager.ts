import {
  BagItem,
  GetUserRes,
  OverworldDirection,
  OverworldMovementState,
  UserPokemon,
  UserProfile,
} from '@poposafari/types';

export class UserManager {
  private profile!: UserProfile;
  private pc!: Record<number, UserPokemon[]>;
  private bag!: Record<string, BagItem>;
  private costume!: string[];

  /** 플레이어 오버월드 움직임 상태 (walk / running / ride / fishing / surf) */
  private overworldMovementState: OverworldMovementState =
    OverworldMovementState.WALK;
  /** 마지막으로 바라본 방향 (맵 전환 후 플레이어 초기 방향으로 사용) */
  private overworldDirection: OverworldDirection = OverworldDirection.DOWN;

  constructor() {}

  init(user: GetUserRes) {
    this.profile = user.profile;
    this.pc = user.pc;
    this.bag = user.bag;
    this.costume = user.costume;

    console.log('UserManager init start');
    console.log(this.profile);
    console.log(this.pc);
    console.log(this.bag);
    console.log(this.costume);
    console.log('UserManager init end');
  }

  getProfile(): UserProfile {
    return this.profile;
  }

  getOverworldMovementState(): OverworldMovementState {
    return this.overworldMovementState;
  }

  setOverworldMovementState(state: OverworldMovementState): void {
    this.overworldMovementState = state;
  }

  getOverworldDirection(): OverworldDirection {
    return this.overworldDirection;
  }

  setOverworldDirection(direction: OverworldDirection): void {
    this.overworldDirection = direction;
  }

  getPc(): Record<number, UserPokemon[]> {
    return this.pc;
  }

  getBag(): Record<string, BagItem> {
    return this.bag;
  }

  getCostume(): string[] {
    return this.costume;
  }
}
