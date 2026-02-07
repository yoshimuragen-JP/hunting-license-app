'use strict';

/**
 * UX Enhancements JavaScript
 * ローディング、エラー、通知、マイクロインタラクションの実装
 */

// ================================================================================
// 1. ローディング状態管理
// ================================================================================

/**
 * ローディング表示
 * @param {string} message - 表示するメッセージ（デフォルト: "読み込み中..."）
 */
function showLoading(message = '読み込み中...') {
    // 既存のローディングを削除
    hideLoading();

    const loader = document.createElement('div');
    loader.id = 'loading';
    loader.setAttribute('role', 'status');
    loader.setAttribute('aria-live', 'polite');
    loader.innerHTML = `
        <div class="spinner" aria-hidden="true"></div>
        <p>${message}</p>
    `;
    document.body.appendChild(loader);
}

/**
 * ローディング非表示
 */
function hideLoading() {
    const loader = document.getElementById('loading');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 300);
    }
}

/**
 * スケルトンスクリーンの生成
 * @param {HTMLElement} container - スケルトンを挿入する要素
 * @param {string} type - スケルトンのタイプ（'text', 'title', 'card', 'button'）
 * @param {number} count - 生成する数
 */
function createSkeleton(container, type = 'text', count = 3) {
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = `skeleton skeleton-${type}`;
        skeleton.setAttribute('aria-hidden', 'true');
        container.appendChild(skeleton);
    }
}

/**
 * スケルトンスクリーンの削除
 * @param {HTMLElement} container - スケルトンを削除する要素
 */
function removeSkeleton(container) {
    const skeletons = container.querySelectorAll('.skeleton');
    skeletons.forEach(skeleton => skeleton.remove());
}

// ================================================================================
// 2. エラーハンドリング
// ================================================================================

/**
 * エラーメッセージ表示
 * @param {string} message - エラーメッセージ
 * @param {boolean} isRetryable - 再読み込み可能か
 */
function showError(message, isRetryable = true) {
    // 既存のエラーを削除
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.setAttribute('aria-live', 'assertive');
    errorDiv.innerHTML = `
        <div class="error-content">
            <p class="error-text">${message}</p>
            ${isRetryable ? '<button onclick="location.reload()" aria-label="ページを再読み込み">再読み込み</button>' : ''}
        </div>
    `;
    document.body.appendChild(errorDiv);

    // 自動削除（再読み込みボタンがない場合のみ）
    if (!isRetryable) {
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            setTimeout(() => errorDiv.remove(), 300);
        }, 5000);
    }
}

/**
 * オフライン/オンライン状態の監視
 */
function initNetworkMonitoring() {
    window.addEventListener('offline', () => {
        showNetworkStatus('オフラインモードです。一部機能が制限されます。', 'offline');
    });

    window.addEventListener('online', () => {
        showNetworkStatus('オンラインに戻りました。', 'online');
        setTimeout(() => {
            const notification = document.querySelector('.offline-notification, .online-notification');
            if (notification) notification.remove();
        }, 3000);
    });
}

/**
 * ネットワーク状態通知
 * @param {string} message - 通知メッセージ
 * @param {string} status - 'offline' または 'online'
 */
function showNetworkStatus(message, status) {
    const existingNotif = document.querySelector('.offline-notification, .online-notification');
    if (existingNotif) existingNotif.remove();

    const notification = document.createElement('div');
    notification.className = `${status}-notification`;
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');
    notification.textContent = message;
    document.body.insertBefore(notification, document.body.firstChild);
}

// ================================================================================
// 3. トースト通知システム
// ================================================================================

/**
 * トースト通知の表示
 * @param {string} message - 通知メッセージ
 * @param {string} type - 通知タイプ（'success', 'error', 'info', 'warning'）
 * @param {number} duration - 表示時間（ミリ秒）
 */
function showToast(message, type = 'info', duration = 3000) {
    // トーストコンテナの作成（初回のみ）
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
    }

    // トースト要素の作成
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
        <div class="toast-icon"></div>
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    // アニメーション表示
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // 自動削除
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ================================================================================
// 4. マイクロインタラクション
// ================================================================================

/**
 * リップルエフェクトの追加
 */
function initRippleEffect() {
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            // 無効化されたボタンには適用しない
            if (this.disabled) return;

            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
}

/**
 * カードホバーエフェクトの追加
 */
function initCardEffects() {
    const cards = document.querySelectorAll('.mode-card, .animal-card, .stat-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
}

/**
 * スムーズスクロール
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // フォーカス移動（アクセシビリティ）
                target.focus({ preventScroll: true });
            }
        });
    });
}

// ================================================================================
// 5. 進捗インジケーター
// ================================================================================

/**
 * 進捗バーの更新
 * @param {HTMLElement} progressBar - 進捗バー要素
 * @param {number} percentage - 進捗率（0-100）
 * @param {boolean} animated - アニメーション有効化
 */
function updateProgressBar(progressBar, percentage, animated = true) {
    if (!progressBar) return;

    const clampedPercentage = Math.max(0, Math.min(100, percentage));

    if (animated) {
        progressBar.style.transition = 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    } else {
        progressBar.style.transition = 'none';
    }

    progressBar.style.width = `${clampedPercentage}%`;
    progressBar.setAttribute('aria-valuenow', clampedPercentage);
}

/**
 * 円形進捗インジケーターの作成
 * @param {number} percentage - 進捗率（0-100）
 * @param {number} size - サイズ（ピクセル）
 * @returns {HTMLElement} SVG要素
 */
function createCircularProgress(percentage, size = 100) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    const radius = (size - 10) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    circle.setAttribute('cx', size / 2);
    circle.setAttribute('cy', size / 2);
    circle.setAttribute('r', radius);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#2e7d32');
    circle.setAttribute('stroke-width', '5');
    circle.setAttribute('stroke-dasharray', circumference);
    circle.setAttribute('stroke-dashoffset', offset);
    circle.setAttribute('transform', `rotate(-90 ${size / 2} ${size / 2})`);

    svg.appendChild(circle);
    return svg;
}

// ================================================================================
// 6. フォーム検証フィードバック
// ================================================================================

/**
 * 入力検証フィードバック
 * @param {HTMLElement} input - 入力要素
 * @param {boolean} isValid - 検証結果
 * @param {string} message - エラーメッセージ
 */
function showInputFeedback(input, isValid, message = '') {
    // 既存のフィードバックを削除
    const existingFeedback = input.parentElement.querySelector('.input-feedback');
    if (existingFeedback) existingFeedback.remove();

    // クラスの設定
    input.classList.remove('input-valid', 'input-invalid');
    input.classList.add(isValid ? 'input-valid' : 'input-invalid');

    // エラーメッセージの表示
    if (!isValid && message) {
        const feedback = document.createElement('div');
        feedback.className = 'input-feedback';
        feedback.textContent = message;
        feedback.setAttribute('role', 'alert');
        input.parentElement.appendChild(feedback);
    }
}

// ================================================================================
// 7. ユーティリティ関数
// ================================================================================

/**
 * 要素へのアニメーションクラス追加
 * @param {HTMLElement} element - 対象要素
 * @param {string} animationClass - アニメーションクラス名
 */
function animateElement(element, animationClass) {
    element.classList.add(animationClass);
    element.addEventListener('animationend', () => {
        element.classList.remove(animationClass);
    }, { once: true });
}

/**
 * 遅延実行
 * @param {number} ms - 遅延時間（ミリ秒）
 * @returns {Promise}
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * デバウンス処理
 * @param {Function} func - 実行する関数
 * @param {number} wait - 待機時間（ミリ秒）
 * @returns {Function}
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * スロットル処理
 * @param {Function} func - 実行する関数
 * @param {number} limit - 実行間隔（ミリ秒）
 * @returns {Function}
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ================================================================================
// 8. 初期化
// ================================================================================

/**
 * UX Enhancements初期化
 */
function initUXEnhancements() {
    // ネットワーク監視
    initNetworkMonitoring();

    // リップルエフェクト
    initRippleEffect();

    // カードエフェクト
    initCardEffects();

    // スムーズスクロール
    initSmoothScroll();

    console.log('✅ UX Enhancements initialized');
}

// DOMContentLoaded後に初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUXEnhancements);
} else {
    initUXEnhancements();
}

// ================================================================================
// 9. グローバルエクスポート
// ================================================================================

// これらの関数を他のスクリプトから使用可能にする
window.UXEnhancements = {
    showLoading,
    hideLoading,
    createSkeleton,
    removeSkeleton,
    showError,
    showToast,
    updateProgressBar,
    createCircularProgress,
    showInputFeedback,
    animateElement,
    delay,
    debounce,
    throttle
};
