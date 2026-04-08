export interface IGamePhase {
  enter(): void;
  exit(): void;
  update?(time: number, delta: number): void;
  /**
   * 다른 phase가 위에 push되어 더 이상 top이 아닐 때도 매 프레임 호출되는 백그라운드 tick.
   * 메뉴/PC 등이 떠 있어도 계속 진행되어야 하는 로직(예: 사파리 야생 포켓몬 랜덤 워크)에 사용.
   */
  tickBackground?(time: number, delta: number): void;
  onPause?(): void;
  onResume?(): void;
  onRefreshLanguage?(): void;
  onRefreshWindow?(): void;
}
