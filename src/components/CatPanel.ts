import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONTS } from '../utils/constants';
import { AREA_LABELS } from '../data/cats';
import type { Cat } from '../data/cats';

export class CatPanel {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private visible = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0).setDepth(200).setVisible(false);
  }

  show(cat: Cat): void {
    this.container.removeAll(true);
    this.container.setVisible(true);
    this.visible = true;

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // 半透明遮罩
    const mask = this.scene.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5)
      .setInteractive()
      .on('pointerdown', () => this.hide());
    this.container.add(mask);

    // 面板背景
    const panel = this.scene.add.rectangle(cx, cy, 300, 380, 0x3d2b1f, 0.95)
      .setStrokeStyle(2, 0xd4a574);
    this.container.add(panel);

    // 关闭按钮
    const closeBtn = this.scene.add.text(cx + 130, cy - 170, '✕', {
      fontSize: '18px', color: '#fff', fontFamily: FONTS.TEXT,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.hide());
    this.container.add(closeBtn);

    // 猫咪图标 + 名字
    const nameText = this.scene.add.text(cx, cy - 150, `${cat.name}`, {
      fontSize: '22px', color: '#ffd700', fontFamily: FONTS.TEXT,
    }).setOrigin(0.5);
    this.container.add(nameText);

    const speciesText = this.scene.add.text(cx, cy - 128, `${cat.species} · ${cat.rarity} · ${cat.personality}`, {
      fontSize: '12px', color: '#c0c0c0', fontFamily: FONTS.TEXT,
    }).setOrigin(0.5);
    this.container.add(speciesText);

    // 属性条
    const stats = [
      { label: '等级', value: `Lv.${cat.level}`, color: '#4fc3f7' },
      { label: '亲密度', value: `${cat.intimacy}/10`, color: '#ff6b6b' },
      { label: '精力', value: `${cat.energy}/100`, color: '#4caf50' },
      { label: '心情', value: `${cat.mood}/100`, color: '#ff9800' },
      { label: '当前岗位', value: cat.area ? AREA_LABELS[cat.area] : '空闲中', color: '#d4a574' },
    ];

    stats.forEach((s, i) => {
      const y = cy - 100 + i * 28;
      const label = this.scene.add.text(cx - 130, y, s.label, {
        fontSize: '13px', color: '#aaa', fontFamily: FONTS.TEXT,
      });
      const val = this.scene.add.text(cx + 130, y, s.value, {
        fontSize: '13px', color: s.color, fontFamily: FONTS.TEXT,
      }).setOrigin(1, 0);
      this.container.add(label);
      this.container.add(val);
    });

    // 分割线
    const divider = this.scene.add.graphics();
    divider.lineStyle(1, 0xd4a574, 0.3);
    divider.lineBetween(cx - 130, cy + 45, cx + 130, cy + 45);
    this.container.add(divider);

    // 技能树标题
    const skillTitle = this.scene.add.text(cx, cy + 60, '─ 技能树 ─', {
      fontSize: '12px', color: '#d4a574', fontFamily: FONTS.TEXT,
    }).setOrigin(0.5);
    this.container.add(skillTitle);

    // 技能列表
    cat.skills.forEach((sk, i) => {
      const y = cy + 85 + i * 32;
      const active = sk.level > 0;
      const name = this.scene.add.text(cx - 120, y, `${active ? '✅' : '⬜'} ${sk.name}`, {
        fontSize: '12px', color: active ? '#fff' : '#666', fontFamily: FONTS.TEXT,
      });
      const lv = this.scene.add.text(cx + 120, y, `Lv.${sk.level}/${sk.maxLevel}`, {
        fontSize: '11px', color: active ? '#4fc3f7' : '#555', fontFamily: FONTS.TEXT,
      }).setOrigin(1, 0);
      const desc = this.scene.add.text(cx - 100, y + 14, sk.description, {
        fontSize: '10px', color: '#888', fontFamily: FONTS.TEXT,
      });
      this.container.add(name);
      this.container.add(lv);
      this.container.add(desc);
    });
  }

  hide(): void {
    this.container.setVisible(false);
    this.visible = false;
    this.container.removeAll(true);
  }

  isVisible(): boolean { return this.visible; }
}
