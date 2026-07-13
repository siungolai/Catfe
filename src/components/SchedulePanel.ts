import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONTS, AREA_ICONS } from '../utils/constants';
import { AREA_LABELS } from '../data/cats';
import type { Cat, AreaType } from '../data/cats';

const AREAS: AreaType[] = ['bar', 'seat', 'cashier', 'rest'];
const SLOT_W = 220;
const SLOT_H = 44;

export class SchedulePanel {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private visible = false;
  private cats: Cat[] = [];
  private onSchedule: (catId: string, area: AreaType) => void;
  private onAutoSchedule: () => void;

  constructor(scene: Phaser.Scene, onSchedule: (catId: string, area: AreaType) => void, onAutoSchedule: () => void) {
    this.scene = scene;
    this.onSchedule = onSchedule;
    this.onAutoSchedule = onAutoSchedule;
    this.container = scene.add.container(0, 0).setDepth(200).setVisible(false);
  }

  show(cats: Cat[]): void {
    this.cats = cats;
    this.container.removeAll(true);
    this.container.setVisible(true);
    this.visible = true;

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // 遮罩
    const mask = this.scene.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5)
      .setInteractive().on('pointerdown', () => this.hide());
    this.container.add(mask);

    // 面板背景
    const panelH = 420;
    const panel = this.scene.add.rectangle(cx, cy, 340, panelH, 0x3d2b1f, 0.95)
      .setStrokeStyle(2, 0xd4a574);
    this.container.add(panel);

    // 标题
    const title = this.scene.add.text(cx, cy - panelH / 2 + 24, '🐱 猫咪排班', {
      fontSize: '18px', color: '#ffd700', fontFamily: FONTS.TEXT,
    }).setOrigin(0.5);
    this.container.add(title);

    // 关闭按钮
    const close = this.scene.add.text(cx + 150, cy - panelH / 2 + 24, '✕', {
      fontSize: '18px', color: '#fff', fontFamily: FONTS.TEXT,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => this.hide());
    this.container.add(close);

    // 自动排班按钮
    const autoBtn = this.scene.add.rectangle(cx - 130, cy - panelH / 2 + 24, 100, 26, 0x4a7a3a, 1)
      .setStrokeStyle(1, 0x6aaa5a).setInteractive({ useHandCursor: true });
    const autoLabel = this.scene.add.text(cx - 130, cy - panelH / 2 + 24, '🤖 自动排班', {
      fontSize: '11px', color: '#fff', fontFamily: FONTS.TEXT,
    }).setOrigin(0.5);
    autoBtn.on('pointerdown', () => {
      this.onAutoSchedule();
      this.hide();
    });
    autoBtn.on('pointerover', () => autoBtn.setFillStyle(0x5a9a4a));
    autoBtn.on('pointerout', () => autoBtn.setFillStyle(0x4a7a3a));
    this.container.add(autoBtn);
    this.container.add(autoLabel);

    // 各区域槽位
    let slotY = cy - panelH / 2 + 60;
    AREAS.forEach((area) => {
      const label = this.scene.add.text(cx - 155, slotY, AREA_LABELS[area], {
        fontSize: '13px', color: '#d4a574', fontFamily: FONTS.TEXT,
      });
      this.container.add(label);

      // 槽位背景
      const slotBg = this.scene.add.rectangle(cx + 30, slotY + 10, SLOT_W, SLOT_H, 0x2a2a2a, 1)
        .setStrokeStyle(1, 0x666666);
      this.container.add(slotBg);

      // 已排班的猫咪
      const assigned = cats.filter(c => c.area === area);
      const names = assigned.map(c => c.name).join(', ') || '─ 空闲 ─';
      const nameText = this.scene.add.text(cx + 30, slotY + 10, names, {
        fontSize: '12px', color: assigned.length > 0 ? '#fff' : '#555', fontFamily: FONTS.TEXT,
      }).setOrigin(0.5);
      this.container.add(nameText);

      // 点击槽位弹出选择
      slotBg.setInteractive({ useHandCursor: true });
      slotBg.on('pointerdown', () => this.showCatSelection(area, cats));

      slotY += 58;
    });

    // 空闲猫咪列表提示
    const idle = cats.filter(c => !c.area);
    const idleText = this.scene.add.text(cx, cy + panelH / 2 - 36,
      `空闲猫咪: ${idle.length} 只  (点击槽位分配)`, {
        fontSize: '11px', color: '#888', fontFamily: FONTS.TEXT,
      }).setOrigin(0.5);
    this.container.add(idleText);
  }

  private showCatSelection(area: AreaType, allCats: Cat[]): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // 可选猫咪：已在该区域 或 空闲
    const candidates = allCats.filter(c => c.area === area || c.area === null);
    if (candidates.length === 0) return;

    // 子菜单背景
    const subBg = this.scene.add.rectangle(cx, cy, 260, candidates.length * 36 + 40, 0x1a1a2e, 0.95)
      .setStrokeStyle(1, 0xd4a574).setDepth(210);
    this.container.add(subBg);

    const subTitle = this.scene.add.text(cx, cy - candidates.length * 18 - 6, `排班到 ${AREA_LABELS[area]}`, {
      fontSize: '13px', color: '#ffd700', fontFamily: FONTS.TEXT,
    }).setOrigin(0.5).setDepth(210);
    this.container.add(subTitle);

    candidates.forEach((cat, i) => {
      const y = cy - candidates.length * 14 + i * 36 + 10;
      const alreadyHere = cat.area === area;
      const btn = this.scene.add.rectangle(cx, y, 220, 30, alreadyHere ? 0x8a3a3a : 0x4a4a6a, 1)
        .setInteractive({ useHandCursor: true }).setDepth(210);
      const label = this.scene.add.text(cx, y, `${cat.name} ${alreadyHere ? '❌ 取消排班' : '→ 指派'}`, {
        fontSize: '12px', color: '#fff', fontFamily: FONTS.TEXT,
      }).setOrigin(0.5).setDepth(210);

      btn.on('pointerdown', () => {
        // 已在该岗位 → 取消排班；空闲 → 指派
        const newArea = alreadyHere ? null : area;
        this.onSchedule(cat.id, newArea);
        this.show(allCats.map(c => c.id === cat.id ? { ...c, area: newArea } : c));
      });

      this.container.add(btn);
      this.container.add(label);
    });
  }

  hide(): void {
    this.container.setVisible(false);
    this.visible = false;
    this.container.removeAll(true);
  }

  isVisible(): boolean { return this.visible; }
}
