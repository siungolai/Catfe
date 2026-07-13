import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, FONTS } from '../utils/constants';

export interface ToolbarAction {
  label: string;
  icon: string;
  onClick: () => void;
}

/** 底部功能栏 */
export class Toolbar {
  private container!: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, actions: ToolbarAction[]) {
    const y = GAME_HEIGHT - 30;

    // 背景
    const bg = scene.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH, 60, COLORS.BAR_BOTTOM, 1);

    // 按钮
    const btnW = Math.min(80, (GAME_WIDTH - 24) / actions.length);
    const totalW = actions.length * btnW;
    const startX = (GAME_WIDTH - totalW) / 2;

    const children: Phaser.GameObjects.GameObject[] = [bg];

    actions.forEach((action, i) => {
      const bx = startX + i * btnW + btnW / 2;
      const btn = scene.add.rectangle(bx, y - 6, btnW - 6, 40, COLORS.BUTTON, 1)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(1, 0x8b5e3c);

      const label = scene.add.text(bx, y - 8, `${action.icon}\n${action.label}`, {
        fontSize: '10px',
        color: '#3d2b1f',
        fontFamily: FONTS.TEXT,
        align: 'center',
        lineSpacing: 2,
      }).setOrigin(0.5);

      btn.on('pointerover', () => btn.setFillStyle(COLORS.BUTTON_HOVER));
      btn.on('pointerout', () => btn.setFillStyle(COLORS.BUTTON));
      btn.on('pointerdown', action.onClick);

      children.push(btn, label);
    });

    this.container = scene.add.container(0, 0, children);
  }
}
