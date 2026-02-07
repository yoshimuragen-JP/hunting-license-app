'use strict';

/**
 * 狩猟免許試験アプリ - モバイル最適化ユーティリティ
 * スマホで快適に学習できるよう設計された補助機能
 */

// ==================== スワイプジェスチャー ====================

class SwipeGesture {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      threshold: options.threshold || 50, // スワイプ判定距離（px）
      velocity: options.velocity || 0.3,  // スワイプ速度閾値
      onSwipeLeft: options.onSwipeLeft || (() => {}),
      onSwipeRight: options.onSwipeRight || (() => {}),
      onSwipeUp: options.onSwipeUp || (() => {}),
      onSwipeDown: options.onSwipeDown || (() => {})
    };

    this.startX = 0;
    this.startY = 0;
    this.startTime = 0;

    this.init();
  }

  init() {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
  }

  handleTouchStart(e) {
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
    this.startTime = Date.now();

    this.element.classList.add('swiping');
  }

  handleTouchEnd(e) {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const endTime = Date.now();

    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const deltaTime = endTime - this.startTime;

    const velocity = Math.sqrt(deltaX ** 2 + deltaY ** 2) / deltaTime;

    this.element.classList.remove('swiping');

    // 横スワイプ
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > this.options.threshold || velocity > this.options.velocity) {
        if (deltaX > 0) {
          this.options.onSwipeRight();
        } else {
          this.options.onSwipeLeft();
        }
      }
    }
    // 縦スワイプ
    else {
      if (Math.abs(deltaY) > this.options.threshold || velocity > this.options.velocity) {
        if (deltaY > 0) {
          this.options.onSwipeDown();
        } else {
          this.options.onSwipeUp();
        }
      }
    }
  }
}

// ==================== タッチフィードバック ====================

function addTouchFeedback() {
  document.addEventListener('touchstart', (e) => {
    const target = e.target.closest('button, a, .interactive');
    if (target) {
      target.classList.add('touch-active');
    }
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const target = e.target.closest('button, a, .interactive');
    if (target) {
      setTimeout(() => {
        target.classList.remove('touch-active');
      }, 100);
    }
  }, { passive: true });
}

// ==================== バイブレーション ====================

function vibrate(pattern = 50) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

// ボタンクリック時のバイブレーション
function addVibrateOnClick() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, .btn');
    if (target) {
      vibrate(10); // 軽いフィードバック
    }
  });
}

// ==================== 画面の向きロック（縦向き推奨） ====================

function lockOrientation() {
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('portrait').catch(err => {
      // console.log('画面向きのロックに失敗:', err); // 本番環境用にコメントアウト
    });
  }
}

// ==================== スクロール位置の復元 ====================

class ScrollRestoration {
  constructor() {
    this.positions = new Map();
    this.init();
  }

  init() {
    // ページ遷移前にスクロール位置を保存
    window.addEventListener('beforeunload', () => {
      this.savePosition(window.location.hash);
    });

    // ページ遷移後にスクロール位置を復元
    window.addEventListener('hashchange', () => {
      this.restorePosition(window.location.hash);
    });
  }

  savePosition(key) {
    this.positions.set(key, {
      x: window.scrollX,
      y: window.scrollY
    });
  }

  restorePosition(key) {
    const position = this.positions.get(key);
    if (position) {
      window.scrollTo(position.x, position.y);
    } else {
      window.scrollTo(0, 0);
    }
  }
}

// ==================== プルトゥリフレッシュ ====================

class PullToRefresh {
  constructor(options = {}) {
    this.threshold = options.threshold || 80; // 引っ張り距離（px）
    this.onRefresh = options.onRefresh || (() => location.reload());

    this.startY = 0;
    this.currentY = 0;
    this.pulling = false;

    this.init();
  }

  init() {
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
  }

  handleTouchStart(e) {
    if (window.scrollY === 0) {
      this.startY = e.touches[0].clientY;
      this.pulling = true;
    }
  }

  handleTouchMove(e) {
    if (!this.pulling) return;

    this.currentY = e.touches[0].clientY;
    const deltaY = this.currentY - this.startY;

    if (deltaY > 0) {
      e.preventDefault(); // デフォルトのバウンス効果を無効化

      // プルインジケーターを表示（オプション）
      this.showPullIndicator(deltaY);
    }
  }

  handleTouchEnd() {
    if (!this.pulling) return;

    const deltaY = this.currentY - this.startY;

    if (deltaY > this.threshold) {
      this.onRefresh();
    }

    this.hidePullIndicator();
    this.pulling = false;
  }

  showPullIndicator(distance) {
    const indicator = document.getElementById('pull-indicator') || this.createIndicator();
    const progress = Math.min(distance / this.threshold, 1);

    indicator.style.opacity = progress;
    indicator.style.transform = `translateY(${distance * 0.5}px) rotate(${progress * 360}deg)`;
  }

  hidePullIndicator() {
    const indicator = document.getElementById('pull-indicator');
    if (indicator) {
      indicator.style.opacity = '0';
      indicator.style.transform = 'translateY(-50px)';
    }
  }

  createIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'pull-indicator';
    indicator.className = 'pull-indicator';
    indicator.innerHTML = '↻';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-50px);
      font-size: 32px;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease;
      z-index: 10000;
    `;
    document.body.appendChild(indicator);
    return indicator;
  }
}

// ==================== インライン入力最適化（iOS対策） ====================

function optimizeInputForIOS() {
  // iOSのズームを防ぐ（16px以上のフォントサイズ）
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    const fontSize = window.getComputedStyle(input).fontSize;
    if (parseFloat(fontSize) < 16) {
      input.style.fontSize = '16px';
    }
  });

  // キーボード表示時のスクロール調整
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      setTimeout(() => {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    });
  });
}

// ==================== ネットワーク状態の監視 ====================

class NetworkMonitor {
  constructor(options = {}) {
    this.onOnline = options.onOnline || (() => {}); // console.log削除
    this.onOffline = options.onOffline || (() => {}); // console.log削除

    this.init();
  }

  init() {
    window.addEventListener('online', this.onOnline);
    window.addEventListener('offline', this.onOffline);

    // 初期状態をチェック
    if (!navigator.onLine) {
      this.onOffline();
    }
  }

  isOnline() {
    return navigator.onLine;
  }
}

// ==================== バッテリー残量の監視 ====================

class BatteryMonitor {
  constructor(options = {}) {
    this.threshold = options.threshold || 0.2; // 20%以下で警告
    this.onLowBattery = options.onLowBattery || (() => {}); // console.log削除

    this.init();
  }

  async init() {
    if ('getBattery' in navigator) {
      const battery = await navigator.getBattery();

      battery.addEventListener('levelchange', () => {
        if (battery.level < this.threshold && battery.charging === false) {
          this.onLowBattery(battery.level);
        }
      });

      // 初期チェック
      if (battery.level < this.threshold && battery.charging === false) {
        this.onLowBattery(battery.level);
      }
    }
  }
}

// ==================== デバイス情報の取得 ====================

function getDeviceInfo() {
  return {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    pixelRatio: window.devicePixelRatio || 1,
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0
  };
}

// ==================== パフォーマンスモニタリング ====================

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
  }

  measurePageLoad() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        this.metrics.domContentLoaded = Math.round(perfData.domContentLoadedEventEnd);
        this.metrics.loadComplete = Math.round(perfData.loadEventEnd);
        this.metrics.firstPaint = this.getFirstPaint();
        this.metrics.firstContentfulPaint = this.getFirstContentfulPaint();
      }
    }
    return this.metrics;
  }

  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fp = paintEntries.find(entry => entry.name === 'first-paint');
    return fp ? Math.round(fp.startTime) : null;
  }

  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? Math.round(fcp.startTime) : null;
  }

  logMetrics() {
    console.table(this.metrics);
  }
}

// ==================== 初期化関数 ====================

function initMobileOptimizations() {
  const deviceInfo = getDeviceInfo();
  // console.log('📱 デバイス情報:', deviceInfo); // 本番環境用にコメントアウト

  // モバイルのみで有効化
  if (deviceInfo.isMobile) {
    addTouchFeedback();
    optimizeInputForIOS();

    // バイブレーションは控えめに（オプション）
    // addVibrateOnClick();

    // 縦向き推奨（学習アプリなので）
    // lockOrientation();
  }

  // スクロール位置の復元
  new ScrollRestoration();

  // ネットワーク監視
  new NetworkMonitor({
    onOnline: () => {
      showSnackbar('✅ オンラインに戻りました');
    },
    onOffline: () => {
      showSnackbar('📡 オフラインモード（学習は継続できます）', 5000);
    }
  });

  // バッテリー監視
  new BatteryMonitor({
    onLowBattery: (level) => {
      showSnackbar(`🔋 バッテリー残量: ${Math.round(level * 100)}%`, 3000);
    }
  });

  // パフォーマンス計測
  window.addEventListener('load', () => {
    const monitor = new PerformanceMonitor();
    const metrics = monitor.measurePageLoad();
    // console.log('📊 ページパフォーマンス:'); // 本番環境用にコメントアウト
    // monitor.logMetrics(); // 本番環境用にコメントアウト
  });
}

// スナックバー表示（共通関数）
function showSnackbar(message, duration = 3000) {
  let snackbar = document.getElementById('mobile-snackbar');

  if (!snackbar) {
    snackbar = document.createElement('div');
    snackbar.id = 'mobile-snackbar';
    snackbar.className = 'snackbar';
    document.body.appendChild(snackbar);
  }

  snackbar.textContent = message;
  snackbar.style.display = 'block';

  setTimeout(() => {
    snackbar.style.display = 'none';
  }, duration);
}

// ==================== エクスポート ====================

// グローバルに公開
window.MobileUtils = {
  SwipeGesture,
  PullToRefresh,
  NetworkMonitor,
  BatteryMonitor,
  PerformanceMonitor,
  getDeviceInfo,
  vibrate,
  showSnackbar,
  init: initMobileOptimizations
};

// 自動初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileOptimizations);
} else {
  initMobileOptimizations();
}
