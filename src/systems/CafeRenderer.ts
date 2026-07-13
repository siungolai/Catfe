import Phaser from 'phaser';
import { GAME_WIDTH, COLORS, FONTS } from '../utils/constants';

/** 咖啡馆场景绘制（纯图形，无逻辑） */
export class CafeRenderer {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  draw(): void {
    const g = this.scene.add.graphics();

    // 墙壁
    g.fillStyle(COLORS.WALL, 1);
    g.fillRect(0, 60, GAME_WIDTH, 280);
    // 地板
    g.fillStyle(COLORS.FLOOR, 1);
    g.fillRect(0, 340, GAME_WIDTH, 400);
    g.lineStyle(1, 0xb8956a, 0.3);
    for (let y = 340; y < 740; y += 32) g.lineBetween(0, y, GAME_WIDTH, y);

    // 吧台（左侧）
    g.fillStyle(COLORS.TABLE_WOOD, 1);
    g.fillRect(20, 220, 160, 80);
    g.fillStyle(0x7a5c3a, 1);
    g.fillRect(20, 290, 160, 8);
    g.lineStyle(2, 0xb8956a, 0.5);
    g.lineBetween(20, 222, 180, 222);

    this.scene.add.image(70, 240, 'coffee_machine').setScale(1.2);

    // 客座区 4 组桌椅
    this.drawTable(g, 280, 380);
    this.drawTable(g, 380, 380);
    this.drawTable(g, 280, 460);
    this.drawTable(g, 380, 460);

    // 猫爬架
    g.fillStyle(0x8d6e4e, 1);
    g.fillRect(GAME_WIDTH - 70, 350, 30, 120);
    g.fillStyle(0xd4a574, 1);
    g.fillCircle(GAME_WIDTH - 55, 350, 18);
    g.fillCircle(GAME_WIDTH - 55, 390, 14);
    g.fillCircle(GAME_WIDTH - 55, 425, 12);

    // 窗户
    g.fillStyle(0x87ceeb, 0.4);
    g.fillRect(200, 80, 100, 120);
    g.lineStyle(3, 0x8d6e4e, 1);
    g.strokeRect(200, 80, 100, 120);
    g.lineBetween(250, 80, 250, 200);
    g.lineBetween(200, 140, 300, 140);
    g.fillStyle(0x8d6e4e, 1);
    g.fillRect(195, 78, 4, 124);
    g.fillRect(296, 78, 4, 124);
    g.fillRect(198, 78, 104, 4);
    g.fillRect(198, 196, 104, 4);

    // 店名
    this.scene.add.text(GAME_WIDTH / 2, 76, '☕ 猫咪咖啡馆', {
      fontSize: '16px', color: '#5d4037', fontFamily: FONTS.TEXT,
    }).setOrigin(0.5);
  }

  private drawTable(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(COLORS.TABLE_WOOD, 1);
    g.fillRect(x, y, 40, 24);
    g.fillStyle(0x7a5c3a, 1);
    g.fillRect(x + 15, y + 24, 10, 30);
    g.fillStyle(0x6b3f1f, 1);
    g.fillRect(x - 10, y + 8, 10, 16);
    g.fillRect(x + 40, y + 8, 10, 16);
  }
}
