import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, FONTS } from '../utils/constants';

/** 顶部状态栏：金币 + 声望 + 天数 */
export class StatusBar {
  private goldText!: Phaser.GameObjects.Text;
  private repText!: Phaser.GameObjects.Text;
  private dayText!: Phaser.GameObjects.Text;
  private container!: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    const bg = scene.add.rectangle(GAME_WIDTH / 2, 20, GAME_WIDTH, 40, COLORS.BAR_TOP, 1);

    this.goldText = scene.add.text(16, 12, '🪙 500', {
      fontSize: '14px',
      color: '#ffd700',
      fontFamily: FONTS.TEXT,
    });

    this.repText = scene.add.text(160, 12, '⭐ 0', {
      fontSize: '14px',
      color: '#ffd700',
      fontFamily: FONTS.TEXT,
    });

    this.dayText = scene.add.text(GAME_WIDTH - 16, 12, '第 1 天', {
      fontSize: '14px',
      color: '#fff8ee',
      fontFamily: FONTS.TEXT,
    }).setOrigin(1, 0);

    this.container = scene.add.container(0, 0, [bg, this.goldText, this.repText, this.dayText]);
  }

  update(gold: number, reputation: number, day: number): void {
    this.goldText.setText(`🪙 ${gold}`);
    this.repText.setText(`⭐ ${reputation}`);
    this.dayText.setText(`第 ${day} 天`);
  }
}
