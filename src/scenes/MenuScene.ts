import Phaser from 'phaser';
import { COLORS, SCENES, GAME_WIDTH, GAME_HEIGHT, FONTS } from '../utils/constants';
import { GameManager } from '../managers/GameManager';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MENU });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    // 背景
    this.cameras.main.setBackgroundColor(COLORS.BG_DARK);

    // 标题
    this.add.text(cx, 160, '🐱 猫咪咖啡馆 🐱', {
      fontSize: '32px',
      color: '#ffd700',
      fontFamily: FONTS.TEXT,
    }).setOrigin(0.5);

    this.add.text(cx, 210, '温馨像素风 · 模拟经营', {
      fontSize: '14px',
      color: '#c0c0c0',
      fontFamily: FONTS.TEXT,
    }).setOrigin(0.5);

    // 按钮
    this.createButton(cx, 360, '开 始 新 游 戏', () => {
      GameManager.getInstance().newGame();
      this.scene.start(SCENES.GAME);
    });

    this.createButton(cx, 430, '继 续 上 次', () => {
      const gm = GameManager.getInstance();
      gm.init();
      if (gm.state.day > 1 || gm.state.gold !== 500) {
        this.scene.start(SCENES.GAME);
      } else {
        // 无存档，跳新游戏
        gm.newGame();
        this.scene.start(SCENES.GAME);
      }
    });

    // 版本信息
    this.add.text(cx, GAME_HEIGHT - 40, '策划案 V2.0 · Demo 开发中', {
      fontSize: '11px',
      color: '#666',
      fontFamily: FONTS.TEXT,
    }).setOrigin(0.5);
  }

  private createButton(x: number, y: number, label: string, onClick: () => void): void {
    const bg = this.add.rectangle(x, y, 200, 48, COLORS.BUTTON, 1)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x8b5e3c);

    const text = this.add.text(x, y, label, {
      fontSize: '16px',
      color: '#3d2b1f',
      fontFamily: FONTS.TEXT,
    }).setOrigin(0.5);

    bg.on('pointerover', () => bg.setFillStyle(COLORS.BUTTON_HOVER));
    bg.on('pointerout', () => bg.setFillStyle(COLORS.BUTTON));
    bg.on('pointerdown', onClick);
  }
}
