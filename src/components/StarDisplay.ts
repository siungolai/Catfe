import Phaser from 'phaser';
import { FONTS } from '../utils/constants';

/**
 * 品质星级弹跳动画
 * 在交付结算时显示：⭐ ⭐ ⭐ 等星星从下往上弹出
 */
export class StarDisplay {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 在指定位置播放星级动画
   * @param x 屏幕坐标
   * @param y 屏幕坐标
   * @param stars 星级 1-5
   * @param callback 动画完成后回调
   */
  show(x: number, y: number, stars: number, callback?: () => void): void {
    const container = this.scene.add.container(x, y).setDepth(200);

    // 星级文字
    const starStr = '⭐'.repeat(stars);
    const label = this.scene.add.text(0, 0, starStr, {
      fontSize: '18px',
      fontFamily: FONTS.TEXT,
    }).setOrigin(0.5);

    container.add(label);

    // 弹跳动画
    this.scene.tweens.add({
      targets: container,
      y: y - 50,
      scale: { from: 0.5, to: 1.2 },
      duration: 400,
      ease: 'Back.easeOut',
      onComplete: () => {
        // 保持一小段时间后消失
        this.scene.tweens.add({
          targets: container,
          alpha: 0,
          y: container.y - 20,
          duration: 500,
          delay: 400,
          onComplete: () => {
            container.destroy();
            callback?.();
          },
        });
      },
    });

    // 同时弹几颗小星星粒
    for (let i = 0; i < stars; i++) {
      const spark = this.scene.add.text(
        Phaser.Math.Between(-20, 20),
        Phaser.Math.Between(-10, 10),
        '✨',
        { fontSize: '10px' },
      ).setOrigin(0.5);
      container.add(spark);
      this.scene.tweens.add({
        targets: spark,
        x: spark.x + Phaser.Math.Between(-40, 40),
        y: spark.y - Phaser.Math.Between(20, 40),
        alpha: 0,
        scale: 0,
        duration: 600,
        ease: 'Quad.easeOut',
      });
    }
  }
}
