import Phaser from 'phaser';
import { COLORS, SCENES, GAME_WIDTH, GAME_HEIGHT, FONTS } from '../utils/constants';
import { GameManager } from '../managers/GameManager';
import { StatusBar } from '../components/StatusBar';
import { Toolbar } from '../components/Toolbar';
import { OrderQueue } from '../components/OrderQueue';
import { CatPanel } from '../components/CatPanel';
import { SchedulePanel } from '../components/SchedulePanel';
import type { ToolbarAction } from '../components/Toolbar';
import { CafeRenderer } from '../systems/CafeRenderer';
import { CustomerManager } from '../systems/CustomerManager';
import type { CustomerSprite } from '../systems/CustomerManager';
import { CatManager } from '../systems/CatManager';
import { OrderManager } from '../systems/OrderManager';
import { StarDisplay } from '../components/StarDisplay';
import { calcQuality, checkPerfectStreak, starsText } from '../systems/QualityRating';
import { DEFAULT_RECIPES } from '../data/recipes';
import type { Order } from '../data/orders';

export class GameScene extends Phaser.Scene {
  private statusBar!: StatusBar;
  private orderQueue!: OrderQueue;
  private orderManager!: OrderManager;
  private customerManager!: CustomerManager;
  private catManager!: CatManager;
  private catPanel!: CatPanel;
  private schedulePanel!: SchedulePanel;
  private starDisplay!: StarDisplay;
  private gm!: GameManager;
  private elapsed = 0;
  private energyAccum = 0;
  private machineSteam: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: SCENES.GAME });
  }

  create(): void {
    this.gm = GameManager.getInstance();
    this.cameras.main.setBackgroundColor(COLORS.BG_WARM);
    this.elapsed = 0;

    // 场景绘制
    new CafeRenderer(this).draw();

    // 星级动画
    this.starDisplay = new StarDisplay(this);

    // 猫咪管理器
    this.catManager = new CatManager(this, this.gm);
    this.catManager.placeCats();
    this.catManager.bindClick((cat) => this.catPanel.show(cat));

    // 订单管理器
    this.orderManager = new OrderManager(
      (order) => this.onOrderDone(order),
      () => this.onProcessNext(),
    );

    // 顾客管理器
    this.customerManager = new CustomerManager(this, this.gm, (cs, recipeId) => this.acceptOrder(cs, recipeId));

    // 状态栏
    this.statusBar = new StatusBar(this);
    this.syncUI();

    // 订单队列
    this.orderQueue = new OrderQueue(this);

    // 猫咪详情 & 排班面板
    this.catPanel = new CatPanel(this);
    this.schedulePanel = new SchedulePanel(this,
      (catId, area) => {
        const cat = this.gm.state.cats.find(c => c.id === catId);
        if (cat) cat.area = area;
        this.catManager.updatePositions();
      },
      () => { this.catManager.autoSchedule(); },
    );

    // 工具栏
    const actions: ToolbarAction[] = [
      { label: '排班', icon: '🐱', onClick: () => {
        if (this.schedulePanel.isVisible()) return;
        this.schedulePanel.show(this.gm.state.cats);
      } },
      { label: '任务', icon: '📋', onClick: () => this.showToast('任务面板（开发中）') },
      { label: '图鉴', icon: '📖', onClick: () => this.syncUI() },
      { label: '升级', icon: '🔧', onClick: () => this.showToast('店铺升级（开发中）') },
    ];
    new Toolbar(this, actions);

    // 保存
    this.add.text(GAME_WIDTH - 16, 56, '💾', {
      fontSize: '20px',
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => { this.gm.save(); this.showToast('已存档 ✅'); });
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    this.elapsed += dt;
    this.orderManager.setElapsed(this.elapsed);

    // 顾客更新（生成 + 耐心）
    this.customerManager.update(dt, this.elapsed);

    // 吧台加速（受完美状态 skillBoost 加成）
    let speedBoost = 1;
    for (const cat of this.gm.state.cats.filter(c => c.area === 'bar')) {
      for (const sk of cat.skills) {
        if (sk.area === 'bar' && sk.level > 0) speedBoost -= sk.effectValue * this.gm.skillBoost;
      }
    }

    // 订单更新
    const anyBrewing = this.orderManager.getActiveOrders().some(o => o.state === 'making');
    this.orderManager.update(dt, Math.max(0.5, speedBoost));

    // 蒸汽动画
    if (anyBrewing) this.startBrewing();
    else this.stopBrewing();

    // 精力（累加器模式，避免帧率波动漏触发）
    this.energyAccum += dt;
    if (this.energyAccum >= 5) {
      this.energyAccum -= 5;
      for (const cat of this.gm.state.cats) {
        if (cat.area && cat.area !== 'rest') {
          cat.energy = Math.max(0, cat.energy - 2);
        } else if (cat.area === 'rest') {
          let recover = 3;
          for (const sk of cat.skills) {
            if (sk.area === 'rest' && sk.level > 0) recover += sk.effectValue * 10 * this.gm.skillBoost;
          }
          cat.energy = Math.min(100, cat.energy + recover);
        }
      }
      this.catManager.updatePositions();
    }

    // 完美状态倒计时
    this.gm.updatePerfect(dt);

    // UI 刷新
    this.orderQueue.update(this.orderManager.orders, this.elapsed);
    this.catManager.syncLabels();
    this.customerManager.syncLabels();
  }

  // ─── 接单 ───

  private acceptOrder(cs: CustomerSprite, recipeId: string): void {
    if (cs.data.state === 'leaving') return;
    const order = this.orderManager.createOrder(recipeId, cs.data.id, cs.data.seatIndex);
    if (!order) {
      this.showToast('队列已满！升级咖啡机扩容');
      return;
    }

    // 销毁气泡
    if (cs.bubble) {
      this.tweens.add({
        targets: cs.bubble, scale: 0, alpha: 0, duration: 200,
        onComplete: () => { cs.bubble?.destroy(); cs.bubble = null; },
      });
    }

    cs.data.state = 'waiting';
    cs.data.orderId = order.id;
    this.orderManager.processQueue();
  }

  // ─── 队列事件 ───

  private onProcessNext(): void {
    // 找等待中的订单，分配吧台猫去咖啡机
    const next = this.orderManager.orders.find(o => o.state === 'making' && o.progress === 0);
    if (!next) return;
    const barCat = this.gm.state.cats.find(c => c.area === 'bar')
      || this.gm.state.cats.find(c => c.area)
      || this.gm.state.cats[0];
    this.catManager.walkCatToMachine(barCat.id, () => {});
  }

  private onOrderDone(order: Order): void {
    // 找客座猫送餐
    const deliveryCat = this.gm.state.cats.find(c => c.area === 'seat')
      || this.gm.state.cats.find(c => c.area)
      || this.gm.state.cats[0];
    const catSprite = this.catManager.getCatSprite(deliveryCat.id);

    if (!catSprite) {
      this.deliverInstant(order);
      return;
    }

    const cs = this.customerManager.getCustomers().get(order.customerId);
    if (!cs) return;

    // 停止猫动画
    const oldW = catSprite.getData('workTween');
    if (oldW) this.tweens.remove(oldW);
    const oldI = catSprite.getData('idleTween');
    if (oldI) this.tweens.remove(oldI);
    this.tweens.killTweensOf(catSprite);

    // 第一阶段：猫去咖啡机取杯
    const toMachine = Math.abs(catSprite.x - this.catManager.machinePos.x) + Math.abs(catSprite.y - this.catManager.machinePos.y);
    this.tweens.add({
      targets: catSprite,
      x: this.catManager.machinePos.x,
      y: this.catManager.machinePos.y,
      duration: Math.max(300, toMachine * 1.5),
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // 取杯
        const cup = this.add.image(catSprite.x, catSprite.y - 12, 'coffee_cup').setScale(0.8).setDepth(90);
        const steam = this.add.text(catSprite.x, catSprite.y - 26, '💨', { fontSize: '10px' })
          .setOrigin(0.5).setAlpha(0.6).setDepth(90);
        this.tweens.add({ targets: steam, y: steam.y - 8, alpha: 0, duration: 600, repeat: -1, ease: 'Sine.easeOut' });

        // 第二阶段：端给顾客
        const tX = cs.sprite.x;
        const tY = cs.sprite.y + 10;
        const toCust = Math.abs(catSprite.x - tX) + Math.abs(catSprite.y - tY);
        const walkT = Math.max(400, toCust * 1.5);

        const updater = this.time.addEvent({
          delay: 30, loop: true,
          callback: () => { cup.setPosition(catSprite.x, catSprite.y - 12); steam.setPosition(catSprite.x, catSprite.y - 26); },
        });

        this.tweens.add({
          targets: catSprite, x: tX, y: tY,
          duration: walkT, ease: 'Sine.easeInOut',
          onComplete: () => {
            updater.remove();
            this.tweens.killTweensOf(steam);
            this.tweens.killTweensOf(cup);
            cup.destroy();
            steam.destroy();

            // 顾客收货
            cs.sprite.setTint(0xffffff);
            this.tweens.add({ targets: cs.sprite, scale: { from: 1.3, to: 1.2 }, duration: 300, yoyo: true });

            // 结算（含品质评级）
            this.completePayment(cs, order);

            // 猫回岗位
            this.catManager.walkCatHome(deliveryCat.id);
          },
        });
      },
    });

    this.orderManager.markDelivered(order.id);
  }

  private deliverInstant(order: Order): void {
    const cs = this.customerManager.getCustomers().get(order.customerId);
    if (cs) this.completePayment(cs, order);
  }

  // ─── 结算（含品质评级）───

  private completePayment(cs: CustomerSprite, order: Order): void {
    cs.data.state = 'served';

    const recipe = DEFAULT_RECIPES.find(r => r.name === order.recipeId);
    if (!recipe) return;

    // 计算品质评级
    const quality = calcQuality({
      recipe,
      patienceRatio: cs.data.patience / cs.data.maxPatience,
      hasBarCat: this.gm.state.cats.some(c => c.area === 'bar'),
      equipmentLevel: this.gm.equipmentLevel,
    });

    // 检查完美状态
    const perfect = this.gm.submitStars(quality.stars);

    // 金币结算（售价 × 星级倍率）
    let tipMult = 1;
    for (const cat of this.gm.state.cats.filter(c => c.area === 'cashier')) {
      for (const sk of cat.skills) {
        if (sk.area === 'cashier' && sk.level > 0) tipMult += sk.effectValue * this.gm.skillBoost;
      }
    }
    const total = Math.floor(recipe.basePrice * quality.priceMultiplier * tipMult)
      + Phaser.Math.Between(0, Math.floor(recipe.basePrice * 0.3));
    this.gm.gold += total;

    // 星星动画
    this.starDisplay.show(cs.sprite.x, cs.sprite.y - 60, quality.stars);

    // 金币飘字（加注星级）
    const infoStr = `+🪙${total}  ${starsText(quality.stars)}`;
    const float = this.add.text(cs.sprite.x, cs.sprite.y - 80, infoStr, {
      fontSize: '13px', color: '#ffd700', fontFamily: FONTS.TEXT, fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5).setDepth(200);
    this.tweens.add({ targets: float, y: float.y - 30, alpha: 0, duration: 1200, onComplete: () => float.destroy() });

    // 完美状态通知
    if (perfect) {
      const msg = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, '🔥 完美状态！技能效果 +30% (10s)', {
        fontSize: '14px', color: '#ff4444', fontFamily: FONTS.TEXT, fontStyle: 'bold',
        backgroundColor: '#000000bb', padding: { x: 12, y: 6 },
      }).setOrigin(0.5).setDepth(250);
      this.tweens.add({ targets: msg, alpha: 0, duration: 1500, delay: 2000, onComplete: () => msg.destroy() });
    }

    this.syncUI();
    this.time.delayedCall(600, () => this.customerManager.customerLeave(cs, 'happy'));
  }

  // ─── 咖啡机蒸汽 ───

  private startBrewing(): void {
    if (this.machineSteam) return;
    this.machineSteam = this.add.text(this.catManager.machinePos.x + 10, this.catManager.machinePos.y - 30, '♨️', {
      fontSize: '16px',
    }).setOrigin(0.5).setAlpha(0.7).setDepth(80);
    this.tweens.add({
      targets: this.machineSteam, y: this.machineSteam.y - 10,
      alpha: { from: 0.7, to: 0 }, duration: 800, repeat: -1, ease: 'Sine.easeOut',
    });
  }

  private stopBrewing(): void {
    if (this.machineSteam) {
      this.tweens.killTweensOf(this.machineSteam);
      this.machineSteam.destroy();
      this.machineSteam = null;
    }
  }

  // ─── UI ───

  private syncUI(): void {
    this.statusBar.update(this.gm.state.gold, this.gm.state.reputation, this.gm.state.day);
  }

  private showToast(msg: string): void {
    const t = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, msg, {
      fontSize: '14px', color: '#fff', fontFamily: FONTS.TEXT,
      backgroundColor: '#000000aa', padding: { x: 14, y: 6 },
    }).setOrigin(0.5).setDepth(100);
    this.tweens.add({ targets: t, alpha: 0, y: t.y - 30, duration: 1200, delay: 600, onComplete: () => t.destroy() });
  }
}
