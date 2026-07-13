import Phaser from 'phaser';
import { GAME_WIDTH, COLORS, FONTS } from '../utils/constants';
import type { Order } from '../data/orders';

const BAR_W = 120;
const BAR_H = 14;
const CARD_W = 140;
const CARD_H = 56;

export class OrderQueue {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private cards: Map<string, {
    bg: Phaser.GameObjects.Rectangle;
    nameText: Phaser.GameObjects.Text;
    barBg: Phaser.GameObjects.Rectangle;
    barFill: Phaser.GameObjects.Rectangle;
    stateText: Phaser.GameObjects.Text;
  }> = new Map();

  private bg!: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const y = 310;

    // 队列背景面板
    this.bg = scene.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH - 20, CARD_H + 24, 0x000000, 0.4)
      .setVisible(false);

    this.container = scene.add.container(0, 0, [this.bg]);
  }

  /** 刷新队列显示 */
  update(orders: Order[], currentTime: number): void {
    // 清理已消失或已交付的订单卡片
    const visibleOrders = orders.filter(o => o.state !== 'delivered').slice(0, 5);

    for (const [id] of this.cards) {
      if (!visibleOrders.find(o => o.id === id)) {
        const c = this.cards.get(id)!;
        c.bg.destroy();
        c.nameText.destroy();
        c.barBg.destroy();
        c.barFill.destroy();
        c.stateText.destroy();
        this.cards.delete(id);
      }
    }

    // 显示/隐藏背景
    this.bg.setVisible(visibleOrders.length > 0);
    if (visibleOrders.length === 0) return;

    const y = 310;
    const cardW = CARD_W;
    const spacing = cardW + 8;
    const totalW = visibleOrders.length * spacing;
    const startX = (GAME_WIDTH - totalW) / 2 + cardW / 2;

    // 调整背景宽度
    this.bg.setSize(totalW + 20, CARD_H + 24);

    visibleOrders.forEach((order, i) => {
      const cx = startX + i * spacing;
      const cy = y;

      const existing = this.cards.get(order.id);
      if (existing) {
        // 更新进度条
        const pct = Math.min(order.progress, 1);
        existing.barFill.setSize(BAR_W * pct, BAR_H);

        // 更新状态文字
        const statusMap: Record<string, string> = {
          queued: '⏳ 等待中',
          making: `☕ ${Math.floor(pct * 100)}%`,
          done: '✅ 完成！',
          delivered: '',
        };
        existing.stateText.setText(statusMap[order.state] || '');
        return;
      }

      // 创建新卡片
      const bg = this.scene.add.rectangle(cx, cy, cardW, CARD_H, 0x2a2a2a, 0.9)
        .setStrokeStyle(1, 0x666666);

      const nameText = this.scene.add.text(cx, cy - 14, order.recipeId, {
        fontSize: '11px',
        color: '#ffd700',
        fontFamily: FONTS.TEXT,
      }).setOrigin(0.5);

      const barBg = this.scene.add.rectangle(cx, cy + 6, BAR_W, BAR_H, 0x444444);
      const barFill = this.scene.add.rectangle(cx - BAR_W / 2, cy + 6, 0, BAR_H, COLORS.PROGRESS)
        .setOrigin(0, 0.5);

      const stateText = this.scene.add.text(cx, cy + 22, '⏳ 等待中', {
        fontSize: '9px',
        color: '#aaa',
        fontFamily: FONTS.TEXT,
      }).setOrigin(0.5);

      this.cards.set(order.id, { bg, nameText, barBg, barFill, stateText });
    });
  }

  destroy(): void {
    this.container.destroy();
    for (const c of this.cards.values()) {
      c.bg.destroy();
      c.nameText.destroy();
      c.barBg.destroy();
      c.barFill.destroy();
      c.stateText.destroy();
    }
    this.cards.clear();
  }
}
