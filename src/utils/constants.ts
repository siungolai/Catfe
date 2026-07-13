/** 游戏常量 */
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 800;

export const COLORS = {
  BG_DARK: 0x1a1a2e,
  BG_WARM: 0xf5e6cc,
  BAR_TOP: 0x8b5e3c,
  BAR_BOTTOM: 0x6b3f1f,
  GOLD: 0xffd700,
  SILVER: 0xc0c0c0,
  TEXT_DARK: 0x3d2b1f,
  TEXT_LIGHT: 0xfff8ee,
  BUTTON: 0xd4a574,
  BUTTON_HOVER: 0xe8b88a,
  PROGRESS: 0x4fc3f7,
  HEART: 0xff6b6b,
  CAT_BROWN: 0xc28b5e,
  CAT_ORANGE: 0xe8944a,
  CAT_BLACK: 0x2c2c2c,
  CAT_WHITE: 0xf0f0f0,
  CAT_GRAY: 0x9e9e9e,
  CUSTOMER: 0x7ec8e3,
  TABLE_WOOD: 0x8d6e4e,
  FLOOR: 0xc9a96e,
  WALL: 0xf0d9b5,
};

export const FONTS = {
  NUMBERS: 'Arial',
  TEXT: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
};

/** 场景 Key */
export const SCENES = {
  BOOT: 'BootScene',
  MENU: 'MenuScene',
  GAME: 'GameScene',
} as const;

/** 存储 Key */
export const STORAGE_KEY = 'catfe_save';

/** 岗位图标映射 */
export const AREA_ICONS: Record<string, string> = {
  bar: '☕',
  seat: '🪑',
  cashier: '💰',
  rest: '💤',
};
