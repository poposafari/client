// ───────── 스프라이트 컨테이너 ─────────
export const PLAYER_CONTAINER = { x: 900, yOffset: 0 }; // y = h/2
export const WILD_CONTAINER = { x: 1000, yOffset: 0 };

export const PLAYER_BASE = { x: -400, y: 182, scale: 2.8 };
export const PLAYER_SPRITE = { x: -400, y: 90, scale: 4.8 };
export const WILD_BASE = { x: 450, y: -110, scale: 3.2 };
export const WILD_SHADOW = { x: 450, y: -155, scale: 2.2, height: 80, alpha: 0.3 };
export const WILD_SPRITE = { x: 450, y: 0, scale: 2.6 };

// ───────── 인트로 슬라이드인 ─────────
export const INTRO_SLIDE = {
  playerFromX: 1500,
  playerToX: 900,
  wildFromX: -500,
  wildToX: 1000,
  durationMs: 1200,
  blackoverlayMs: 1000,
};

// ───────── HUD ─────────
export const WILD_HUD = {
  x: 500,
  yOffset: -200,
  fromX: -500,
  toX: 500,
  durationMs: 500,
};

export const PLAYER_HUD = {
  x: 1500,
  yOffset: 125,
  fromX: 2500,
  toX: 1470,
  durationMs: 500,
};

export const LOCATION_HUD = { x: 1600, yOffset: -515 };

// ───────── 커맨드 메뉴 (2x2) ─────────
export const COMMAND_MENU = {
  containerXOffset: 690, // 기준 x = w/2 + 660
  containerYOffset: 408, // 기준 y = h/2 + 410
  windowWidth: 600,
  windowHeight: 274,
  windowScale: 3,
  windowOffset: { x: -33, y: 0 },
  slots: [
    { x: -260, y: -35 }, // 0: BALL
    { x: -30, y: -35 }, // 1: FEED
    { x: -260, y: +35 }, // 2: MUD
    { x: -30, y: +35 }, // 3: RUN
  ] as const,
  messageText: { x: -1540, y: -75 },
};

// ───────── 하단 baseWindow (메시지 영역) ─────────
export const BASE_WINDOW = {
  x: 0,
  width: 800,
  height: 270,
  scale: 1.4,
  y: 405,
};

// ───────── 볼 던지기 연출 ─────────
export const THROW_ITEM = {
  startX: -300,
  startY: 150,
  endX: 450,
  endY: -190,
  peakHeight: -310,
  durationMs: 500,
};

export const BALL_ANIM = {
  enterShrinkMs: 500,
  enterExpandMs: 500,
  dropMs: 600,
  shakeMs: 200,
  shakeAngleDeg: 11,
  maxParticleRadius: 200,
};

// ───────── 인트로 연출 타이밍 ─────────
export const INTRO_ANIM = {
  overlayFadeInMs: 500,
  baseWindowSlideMs: 400,
  particleDelayMs: 300,
  particleBurstMs: 500,
  flashInMs: 800,
  flashOutMs: 1500,
  tintColor: 0x367d96,
};

// ───────── 축하/샤이니 ─────────
export const SHINY = {
  sparkleCount: 6,
  sparkleDurationMs: 900,
};
