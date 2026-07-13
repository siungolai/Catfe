import Phaser from 'phaser';
import { GAME_WIDTH, FONTS, AREA_ICONS } from '../utils/constants';
import type { GameManager } from '../managers/GameManager';
import type { Cat } from '../data/cats';

/** 猫咪管理器：放置、移动、标签同步、自动排班 */
export class CatManager {
  private scene: Phaser.Scene;
  private gm: GameManager;
  private catSprites: Map<string, Phaser.GameObjects.Image> = new Map();
  private catLabels: Map<string, Phaser.GameObjects.Text> = new Map();
  private catHomePos: Map<string, { x: number; y: number }> = new Map();

  readonly machinePos = { x: 70, y: 250 };

  readonly areaPositions: Record<string, { x: number; y: number }> = {
    bar: { x: 90, y: 260 },
    seat: { x: 340, y: 425 },
    cashier: { x: 160, y: 285 },
    rest: { x: GAME_WIDTH - 55, y: 390 },
  };

  constructor(scene: Phaser.Scene, gm: GameManager) {
    this.scene = scene;
    this.gm = gm;
  }

  /** 获取猫咪精灵 */
  getCatSprite(catId: string): Phaser.GameObjects.Image | undefined {
    return this.catSprites.get(catId);
  }

  placeCats(): void {
    this.catSprites.clear();
    this.catLabels.clear();
    this.catHomePos.clear();

    const positions = [
      { x: 70, y: 170 }, { x: 430, y: 345 }, { x: 440, y: 420 },
      { x: 80, y: 300 }, { x: GAME_WIDTH - 60, y: 400 }, { x: 150, y: 270 },
    ];

    this.gm.state.cats.forEach((cat, i) => {
      if (i >= positions.length) return;
      const pos = positions[i];
      const tex = this.speciesToTexture(cat.species);
      const sprite = this.scene.add.image(pos.x, pos.y, tex)
        .setInteractive({ useHandCursor: true })
        .setData('catId', cat.id);

      const label = this.scene.add.text(pos.x, pos.y - 22, cat.name, {
        fontSize: '10px', color: '#3d2b1f', fontFamily: FONTS.TEXT,
        backgroundColor: '#ffffffaa', padding: { x: 3, y: 1 },
      }).setOrigin(0.5);

      this.catHomePos.set(cat.id, { x: pos.x, y: pos.y });

      const idleTween = this.scene.tweens.add({
        targets: sprite, y: pos.y - 2,
        duration: 1500 + i * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      sprite.setData('idleTween', idleTween);

      this.catSprites.set(cat.id, sprite);
      this.catLabels.set(cat.id, label);
    });
  }

  /** 绑定猫咪点击回调 */
  bindClick(handler: (cat: Cat) => void): void {
    this.catSprites.forEach((sprite, catId) => {
      const cat = this.gm.state.cats.find(c => c.id === catId);
      if (!cat) return;
      sprite.on('pointerdown', () => handler(cat));
    });
  }

  /** 排班变化 → 猫走向岗位或回家 */
  updatePositions(): void {
    this.catSprites.forEach((sprite, catId) => {
      const cat = this.gm.state.cats.find(c => c.id === catId);
      if (!cat) return;
      const label = this.catLabels.get(catId);
      const home = this.catHomePos.get(catId);
      if (!home) return;

      if (label) {
        const icon = cat.area ? AREA_ICONS[cat.area] || '' : '';
        label.setText(`${cat.name}${icon}`);
        label.setColor(cat.area ? '#ff6b6b' : '#3d2b1f');
      }

      const target = cat.area ? this.areaPositions[cat.area] : home;

      const oldIdle = sprite.getData('idleTween');
      if (oldIdle) this.scene.tweens.remove(oldIdle);
      const oldWork = sprite.getData('workTween');
      if (oldWork) this.scene.tweens.remove(oldWork);
      this.scene.tweens.killTweensOf(sprite);

      const walkDist = Math.abs(sprite.x - target.x) + Math.abs(sprite.y - target.y);
      const walkDuration = Math.max(300, walkDist * 2);

      this.scene.tweens.add({
        targets: sprite, x: target.x, y: target.y,
        duration: walkDuration, ease: 'Sine.easeInOut',
        onComplete: () => {
          if (cat.area) {
            const wt = this.scene.tweens.add({
              targets: sprite, y: target.y - 3, duration: 600,
              yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
              delay: Phaser.Math.Between(0, 500),
            });
            sprite.setData('workTween', wt);
          } else {
            const it = this.scene.tweens.add({
              targets: sprite, y: target.y - 2, duration: 1500,
              yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            });
            sprite.setData('idleTween', it);
          }
        },
      });

      sprite.setAlpha(cat.energy > 20 ? 1 : 0.5);
    });
  }

  /** 每帧同步标签 */
  syncLabels(): void {
    this.catSprites.forEach((sprite, catId) => {
      const label = this.catLabels.get(catId);
      if (label) label.setPosition(sprite.x, sprite.y - 22);
    });
  }

  /** 自动排班：按最高等级技能分配 */
  autoSchedule(): void {
    for (const cat of this.gm.state.cats) {
      const best = cat.skills.filter(s => s.level > 0).sort((a, b) => b.level - a.level)[0];
      cat.area = best ? best.area : null;
    }
    this.updatePositions();
  }

  /** 猫走到咖啡机 */
  walkCatToMachine(catId: string, onArrive: () => void): void {
    const sprite = this.catSprites.get(catId);
    if (!sprite) { onArrive(); return; }
    const cat = this.gm.state.cats.find(c => c.id === catId);
    if (!cat) { onArrive(); return; }

    const oldW = sprite.getData('workTween');
    if (oldW) this.scene.tweens.remove(oldW);
    const oldI = sprite.getData('idleTween');
    if (oldI) this.scene.tweens.remove(oldI);
    this.scene.tweens.killTweensOf(sprite);

    const dist = Math.abs(sprite.x - this.machinePos.x) + Math.abs(sprite.y - this.machinePos.y);
    const walkT = Math.max(300, dist * 2);

    this.scene.tweens.add({
      targets: sprite, x: this.machinePos.x, y: this.machinePos.y,
      duration: walkT, ease: 'Sine.easeInOut',
      onComplete: onArrive,
    });
  }

  /** 猫走回岗位 */
  walkCatHome(catId: string, onDone?: () => void): void {
    const sprite = this.catSprites.get(catId);
    if (!sprite) { onDone?.(); return; }
    const cat = this.gm.state.cats.find(c => c.id === catId);
    if (!cat) { onDone?.(); return; }

    const home = cat.area ? this.areaPositions[cat.area] : this.catHomePos.get(catId);
    if (!home) { onDone?.(); return; }

    const dist = Math.abs(sprite.x - home.x) + Math.abs(sprite.y - home.y);
    const walkT = Math.max(300, dist * 1.2);

    this.scene.tweens.add({
      targets: sprite, x: home.x, y: home.y,
      duration: walkT, ease: 'Sine.easeInOut',
      onComplete: () => {
        if (cat.area) {
          const wt = this.scene.tweens.add({
            targets: sprite, y: home.y - 3, duration: 600,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
          });
          sprite.setData('workTween', wt);
        }
        onDone?.();
      },
    });
  }

  private speciesToTexture(species: string): string {
    const map: Record<string, string> = {
      '橘猫': 'cat_orange', '黑猫': 'cat_black', '白猫': 'cat_white',
      '布偶': 'cat_brown', '三花': 'cat_gray', '暹罗': 'cat_gray',
    };
    return map[species] || 'cat_gray';
  }
}
