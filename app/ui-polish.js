/**
 * UI/UX Polish JavaScript
 * インタラクション強化とマイクロインタラクション
 */

(function() {
  'use strict';

  // ===================================
  // 1. トースト通知システム
  // ===================================

  class ToastManager {
    constructor() {
      this.container = null;
      this.init();
    }

    init() {
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
      }
    }

    show(message, type = 'info', duration = 3000) {
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;

      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };

      toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-content">
          <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="閉じる">✕</button>
      `;

      this.container.appendChild(toast);

      const closeBtn = toast.querySelector('.toast-close');
      closeBtn.addEventListener('click', () => this.remove(toast));

      if (duration > 0) {
        setTimeout(() => this.remove(toast), duration);
      }

      return toast;
    }

    remove(toast) {
      toast.style.animation = 'toastSlideOut 0.3s ease-out';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }

    success(message, duration) {
      return this.show(message, 'success', duration);
    }

    error(message, duration) {
      return this.show(message, 'error', duration);
    }

    warning(message, duration) {
      return this.show(message, 'warning', duration);
    }

    info(message, duration) {
      return this.show(message, 'info', duration);
    }
  }

  // グローバルに公開
  window.toast = new ToastManager();

  // ===================================
  // 2. スムーズスクロール
  // ===================================

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#!') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // URLを更新
          if (history.pushState) {
            history.pushState(null, null, href);
          }
        }
      });
    });
  }

  // ===================================
  // 3. スクロールトップボタン
  // ===================================

  function initScrollToTop() {
    let scrollBtn = document.querySelector('.scroll-to-top');

    if (!scrollBtn) {
      scrollBtn = document.createElement('button');
      scrollBtn.className = 'scroll-to-top';
      scrollBtn.innerHTML = '↑';
      scrollBtn.setAttribute('aria-label', 'トップへ戻る');
      document.body.appendChild(scrollBtn);
    }

    function toggleScrollBtn() {
      if (window.scrollY > 300) {
        scrollBtn.classList.add('visible');
      } else {
        scrollBtn.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', toggleScrollBtn);
    toggleScrollBtn();

    scrollBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ===================================
  // 4. ボタンリップル効果
  // ===================================

  function addRippleEffect() {
    document.querySelectorAll('.btn, .choice, .nav-link').forEach(element => {
      if (element.classList.contains('ripple-effect')) return;

      element.classList.add('ripple-effect');

      element.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.className = 'ripple';

        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  // ===================================
  // 5. カードホバーエフェクト強化
  // ===================================

  function enhanceCardHover() {
    document.querySelectorAll('.card, .mode-card').forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px)';
        this.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
      });

      card.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
      });
    });
  }

  // ===================================
  // 6. フォームバリデーション視覚フィードバック
  // ===================================

  function enhanceFormValidation() {
    document.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('invalid', function(e) {
        e.preventDefault();
        this.classList.add('animate-shake');
        setTimeout(() => this.classList.remove('animate-shake'), 500);

        if (window.toast) {
          toast.error(this.validationMessage || '入力内容を確認してください');
        }
      });

      field.addEventListener('input', function() {
        if (this.validity.valid) {
          this.style.borderColor = 'var(--color-success)';
        } else if (this.value) {
          this.style.borderColor = 'var(--color-error)';
        } else {
          this.style.borderColor = '';
        }
      });
    });
  }

  // ===================================
  // 7. ローディング状態管理
  // ===================================

  class LoadingManager {
    constructor() {
      this.overlay = null;
    }

    show(message = '読み込み中...') {
      if (this.overlay) return;

      this.overlay = document.createElement('div');
      this.overlay.className = 'loading-overlay';
      this.overlay.innerHTML = `
        <div>
          <div class="loading-spinner"></div>
          <div class="loading-text">${message}</div>
        </div>
      `;
      document.body.appendChild(this.overlay);
      document.body.style.overflow = 'hidden';
    }

    hide() {
      if (!this.overlay) return;

      this.overlay.style.animation = 'fadeOut 0.2s ease-out';
      setTimeout(() => {
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.parentNode.removeChild(this.overlay);
          this.overlay = null;
          document.body.style.overflow = '';
        }
      }, 200);
    }
  }

  window.loading = new LoadingManager();

  // ===================================
  // 8. 画像遅延読み込み
  // ===================================

  function initLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.add('loaded');
              observer.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // ===================================
  // 9. アニメーション観察
  // ===================================

  function initScrollAnimations() {
    if ('IntersectionObserver' in window) {
      const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.card, .stats-card, .feature-item').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';

        animationObserver.observe(element);
      });

      // animate-inクラスが追加されたら表示
      const style = document.createElement('style');
      style.textContent = `
        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ===================================
  // 10. キーボードナビゲーション強化
  // ===================================

  function enhanceKeyboardNav() {
    // Escキーでモーダルを閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.querySelector('.modal-backdrop');
        if (modal) {
          modal.click();
        }
      }
    });

    // タブキー移動時のフォーカス可視化
    let usingKeyboard = false;

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        usingKeyboard = true;
        document.body.classList.add('keyboard-nav');
      }
    });

    document.addEventListener('mousedown', () => {
      usingKeyboard = false;
      document.body.classList.remove('keyboard-nav');
    });
  }

  // ===================================
  // 11. パフォーマンスモニタリング
  // ===================================

  function monitorPerformance() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          if (perfData) {
            console.log('📊 パフォーマンス指標:');
            console.log('  - DOM読み込み:', Math.round(perfData.domContentLoadedEventEnd), 'ms');
            console.log('  - 完全読み込み:', Math.round(perfData.loadEventEnd), 'ms');

            // 3秒以上かかった場合は警告
            if (perfData.loadEventEnd > 3000) {
              console.warn('⚠️ ページ読み込みが遅い可能性があります');
            }
          }
        }, 0);
      });
    }
  }

  // ===================================
  // 12. 初期化
  // ===================================

  function init() {
    // DOMContentLoaded後に実行
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    console.log('🎨 UI Polish 初期化中...');

    initSmoothScroll();
    initScrollToTop();
    addRippleEffect();
    enhanceCardHover();
    enhanceFormValidation();
    initLazyLoading();
    initScrollAnimations();
    enhanceKeyboardNav();
    monitorPerformance();

    console.log('✅ UI Polish 初期化完了');
  }

  // 既にDOMが読み込まれている場合はすぐ実行
  if (document.readyState !== 'loading') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

  // ===================================
  // 13. ユーティリティ関数
  // ===================================

  // グローバルに公開
  window.uiPolish = {
    toast: window.toast,
    loading: window.loading,

    // アニメーション追加
    addAnimation(element, animationClass) {
      element.classList.add(animationClass);
      element.addEventListener('animationend', () => {
        element.classList.remove(animationClass);
      }, { once: true });
    },

    // 成功フィードバック
    showSuccess(element) {
      element.classList.add('animate-pulse');
      if (window.toast) {
        toast.success('完了しました！');
      }
      setTimeout(() => element.classList.remove('animate-pulse'), 1000);
    },

    // エラーフィードバック
    showError(element) {
      element.classList.add('animate-shake');
      setTimeout(() => element.classList.remove('animate-shake'), 500);
    },

    // 要素を滑らかにスクロール
    scrollTo(element) {
      if (typeof element === 'string') {
        element = document.querySelector(element);
      }
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

})();
