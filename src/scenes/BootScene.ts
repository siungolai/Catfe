import Phaser from 'phaser';
import { COLORS, SCENES, GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  create(): void {
    // 生成占位图形纹理（纯代码像素素材）
    this.generateTextures();

    // 加载完成跳转
    this.scene.start(SCENES.MENU);
  }

  private generateTextures(): void {
    // 猫咪占位纹理 — 简单椭圆 + 耳朵
    this.createCatTexture('cat_orange', COLORS.CAT_ORANGE);
    this.createCatTexture('cat_black', COLORS.CAT_BLACK);
    this.createCatTexture('cat_white', COLORS.CAT_WHITE);
    this.createCatTexture('cat_brown', COLORS.CAT_BROWN);
    this.createCatTexture('cat_gray', COLORS.CAT_GRAY);

    // 顾客占位纹理
    this.createCustomerTexture();

    // 咖啡机
    this.createCoffeeMachineTexture();

    // 咖啡杯
    this.createCoffeeCupTexture();
  }

  private createCatTexture(key: string, color: number): void {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // 身体
    g.fillStyle(color, 1);
    g.fillEllipse(16, 18, 24, 28);
    // 耳朵
    g.fillTriangle(6, 6, 10, 2, 14, 8);
    g.fillTriangle(18, 8, 22, 2, 26, 6);
    // 眼睛
    g.fillStyle(0xffffff, 1);
    g.fillCircle(10, 14, 3);
    g.fillCircle(22, 14, 3);
    g.fillStyle(0x000000, 1);
    g.fillCircle(11, 14, 1.5);
    g.fillCircle(23, 14, 1.5);
    g.generateTexture(key, 32, 32);
    g.destroy();
  }

  private createCustomerTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(COLORS.CUSTOMER, 1);
    g.fillRect(8, 4, 16, 8); // head
    g.fillRect(6, 12, 20, 20); // body
    g.fillStyle(0x000000, 1);
    g.fillCircle(11, 8, 1.5);
    g.fillCircle(21, 8, 1.5);
    g.generateTexture('customer', 32, 32);
    g.destroy();
  }

  private createCoffeeMachineTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x555555, 1); g.fillRect(4, 8, 40, 28);
    g.fillStyle(0x888888, 1); g.fillRect(8, 4, 32, 6);
    g.fillStyle(0x333333, 1); g.fillRect(20, 18, 8, 10);
    g.fillStyle(0x00ff00, 1); g.fillCircle(34, 12, 2);
    g.generateTexture('coffee_machine', 48, 40);
    g.destroy();
  }

  private createCoffeeCupTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // 杯子
    g.fillStyle(0xffffff, 1); g.fillRoundedRect(4, 8, 16, 16, 3);
    // 咖啡液
    g.fillStyle(0x6d4c41, 1); g.fillRoundedRect(6, 10, 12, 6, 2);
    // 杯把
    g.lineStyle(2, 0xdddddd, 1);
    g.beginPath(); g.arc(22, 14, 5, -0.8, 0.8); g.strokePath();
    // 热气
    g.fillStyle(0xcccccc, 0.4);
    g.fillCircle(8, 5, 2); g.fillCircle(14, 3, 2.5); g.fillCircle(18, 5, 2);
    g.generateTexture('coffee_cup', 28, 28);
    g.destroy();
  }
}
