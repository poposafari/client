export interface IGamePhase {
  enter(): void;
  exit(): void;
  update?(time: number, delta: number): void;
  onPause?(): void;
  onResume?(): void;
  onRefreshLanguage?(): void;
  onRefreshWindow?(): void;
}
