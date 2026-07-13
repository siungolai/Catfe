import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONTS } from '../utils/constants';
import { CUSTOMER_TYPES } from '../data/customers';
import type { Customer as CustomerData } from '../data/customers';
import { DEFAULT_RECIPES } from '../data/recipes';
import type { GameManager } from '../managers/GameManager';

export interface Seat {
  x: number;
  y: number;
  occupied: boolean;
  customerId: string | null;
}

export interface CustomerSprite {
  data: CustomerData;
  sprite: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
  patienceBar: Phaser.GameObjects.Rectangle;
  patienceFill: Phaser.GameObjects.Rectangle;
  bubble: Phaser.GameObjects.Container | null;
}

/** 顾客管理器：生成、耐心、气泡 */
export class CustomerManager {
  private scene: Phaser.Scene;
  private gm: GameManager;
  private customers: Map<string, CustomerSprite> = new Map();
  private seats: Seat[] = [];
  private spawnTimer = 0;
  private spawnInterval = 8;
  private customerSeq = 0;
  private onAcceptOrder: (cs: CustomerSprite, recipeId: string) => void;

  constructor(scene: Phaser.Scene, gm: GameManager, onAcceptOrder: (cs: CustomerSprite, recipeId: string) => void) {
    this.scene = scene;
    this.gm = gm;
    this.onAcceptOrder = onAcceptOrder;
    this.initSeats();
  }

  private initSeats(): void {
    this.seats = [
      { x: 300, y: 390, occupied: false, customerId: null },
      { x: 400, y: 390, occupied: false, customerId: null },
      { x: 300, y: 470, occupied: false, customerId: null },
      { x: 400, y: 470, occupied: false, customerId: null },
    ];
  }

  update(dt: number, elapsed: number): void {
    // 生成
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnCustomer();
    }
    // 耐心消耗
    for (const [, cs] of this.customers) {
      if (cs.data.state === 'waiting') {
        let drainRate = 1;
        const seatCats = this.gm.state.cats.filter(c => c.area === 'seat');
        for (const cat of seatCats) {
          for (const sk of cat.skills) {
            if (sk.area === 'seat' && sk.level > 0) drainRate -= sk.effectValue * 0.02;
          }
        }
        cs.data.patience -= dt * Math.max(0.3, drainRate);
        this.updatePatienceBar(cs);
        if (cs.data.patience <= 0) this.customerLeave(cs, 'impatient');
      }
    }
  }

  getCustomers(): Map<string, CustomerSprite> { return this.customers; }
  getSeats(): Seat[] { return this.seats; }

  /** 获取座位索引 */
  getSeatIndex(seat: Seat): number {
    return this.seats.indexOf(seat);
  }

  private spawnCustomer(): void {
    const freeSeat = this.seats.find(s => !s.occupied);
    if (!freeSeat) return;

    const type = Phaser.Math.RND.pick(CUSTOMER_TYPES);
    const variant = Phaser.Math.RND.pick(type.variants);
    const patience = type.patience + Phaser.Math.Between(-10, 10);
    const custId = `cust_${++this.customerSeq}`;

    const custData: CustomerData = {
      id: custId, typeId: type.id, variant,
      patience, maxPatience: patience,
      seatIndex: this.getSeatIndex(freeSeat),
      orderId: null, state: 'entering',
    };

    freeSeat.occupied = true;
    freeSeat.customerId = custId;

    const sprite = this.scene.add.image(freeSeat.x, 300, 'customer').setScale(1.2);
    const label = this.scene.add.text(freeSeat.x, freeSeat.y - 32, `${type.name}(${variant})`, {
      fontSize: '9px', color: '#3d2b1f', fontFamily: FONTS.TEXT,
      backgroundColor: '#ffffffaa', padding: { x: 3, y: 1 },
    }).setOrigin(0.5).setAlpha(0);

    const barBg = this.scene.add.rectangle(freeSeat.x, freeSeat.y - 42, 48, 5, 0x333333).setAlpha(0);
    const barFill = this.scene.add.rectangle(freeSeat.x - 24, freeSeat.y - 42, 48, 5, 0x4caf50)
      .setOrigin(0, 0.5).setAlpha(0);

    const cs: CustomerSprite = { data: custData, sprite, label, patienceBar: barBg, patienceFill: barFill, bubble: null };
    this.customers.set(custId, cs);

    this.scene.tweens.add({
      targets: sprite, y: freeSeat.y, duration: 600, ease: 'Back.easeOut',
      onComplete: () => {
        custData.state = 'seated';
        label.setAlpha(1); barBg.setAlpha(1); barFill.setAlpha(1);
        this.scene.time.delayedCall(800, () => this.showOrderBubble(cs));
      },
    });
  }

  private showOrderBubble(cs: CustomerSprite): void {
    if (cs.data.state === 'leaving') return;
    cs.data.state = 'ordering';

    const recipe = Phaser.Math.RND.pick(DEFAULT_RECIPES.filter(r => r.unlocked));
    const container = this.scene.add.container(cs.sprite.x + 20, cs.sprite.y - 50);

    const bubbleBg = this.scene.add.graphics();
    bubbleBg.fillStyle(0xffffff, 0.95);
    bubbleBg.fillRoundedRect(-30, -18, 60, 36, 8);
    bubbleBg.lineStyle(1, 0x999999, 1);
    bubbleBg.strokeRoundedRect(-30, -18, 60, 36, 8);
    bubbleBg.fillTriangle(-4, 18, 4, 18, 0, 26);

    const nameText = this.scene.add.text(0, -4, recipe.name, {
      fontSize: '11px', color: '#3d2b1f', fontFamily: FONTS.TEXT,
    }).setOrigin(0.5);
    const tipText = this.scene.add.text(0, 10, `🪙${recipe.basePrice}`, {
      fontSize: '9px', color: '#888', fontFamily: FONTS.TEXT,
    }).setOrigin(0.5);

    container.add([bubbleBg, nameText, tipText]);
    container.setScale(0).setAlpha(0);
    container.setSize(60, 44);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => this.onAcceptOrder(cs, recipe.id));

    this.scene.tweens.add({
      targets: container, scale: { from: 0, to: 1 }, alpha: { from: 0, to: 1 },
      duration: 300, ease: 'Back.easeOut',
    });

    cs.bubble = container;
    cs.sprite.on('pointerdown', () => this.onAcceptOrder(cs, recipe.id));

    // 客座猫自动接单
    const hasSeatCat = this.gm.state.cats.some(c => c.area === 'seat');
    if (hasSeatCat) {
      this.scene.time.delayedCall(1500, () => {
        if (cs.data.state !== 'leaving' && cs.data.state !== 'waiting') {
          this.onAcceptOrder(cs, recipe.id);
        }
      });
    }
  }

  private updatePatienceBar(cs: CustomerSprite): void {
    const pct = cs.data.patience / cs.data.maxPatience;
    cs.patienceFill.setSize(48 * pct, 5);
    if (pct < 0.3) cs.patienceFill.setFillStyle(0xf44336);
    else if (pct < 0.6) cs.patienceFill.setFillStyle(0xff9800);
    else cs.patienceFill.setFillStyle(0x4caf50);
  }

  customerLeave(cs: CustomerSprite, reason: 'happy' | 'impatient'): void {
    if (cs.data.state === 'leaving') return;
    cs.data.state = 'leaving';
    // 清理气泡和点击监听
    if (cs.bubble) { cs.bubble.destroy(); cs.bubble = null; }
    cs.sprite.removeAllListeners('pointerdown');

    const seat = this.seats[cs.data.seatIndex];
    if (seat) { seat.occupied = false; seat.customerId = null; }

    if (reason === 'impatient') {
      this.gm.reputation = Math.max(0, this.gm.reputation - 5);
    }

    this.scene.tweens.add({
      targets: [cs.sprite, cs.label, cs.patienceBar, cs.patienceFill],
      alpha: 0, y: cs.sprite.y - 30, duration: 400,
      onComplete: () => {
        cs.sprite.destroy(); cs.label.destroy();
        cs.patienceBar.destroy(); cs.patienceFill.destroy();
        this.customers.delete(cs.data.id);
      },
    });
  }

  /** 同步顾客标签跟随（移动时标签跟随精灵） */
  syncLabels(): void {
    for (const [, cs] of this.customers) {
      cs.label.setPosition(cs.sprite.x, cs.sprite.y - 32);
      cs.patienceBar.setPosition(cs.sprite.x, cs.sprite.y - 42);
      const pct = cs.data.patience / cs.data.maxPatience;
      cs.patienceFill.setPosition(cs.sprite.x - 24, cs.sprite.y - 42);
      cs.patienceFill.setSize(48 * pct, 5);
    }
  }
}
