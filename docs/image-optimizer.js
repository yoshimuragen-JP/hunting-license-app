/**
 * 画像最適化ユーティリティ（Quality Guardian追加）
 * 遅延読み込み、WebP対応、プログレッシブエンハンスメント
 */

'use strict';

(function() {
    /**
     * WebP対応チェック
     */
    function supportsWebP() {
        const canvas = document.createElement('canvas');
        if (!canvas.getContext || !canvas.getContext('2d')) {
            return false;
        }
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    /**
     * Intersection Observer による遅延読み込み
     */
    function setupLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            // Fallback: すぐに全画像を読み込む
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.dataset.src;
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                }
            });
            return;
        }

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;

                    // WebP対応の場合、WebP画像を優先
                    if (supportsWebP() && img.dataset.srcWebp) {
                        img.src = img.dataset.srcWebp;
                    } else if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }

                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                    }

                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px' // 画面の50px手前で読み込み開始
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    /**
     * 画像読み込みエラー処理
     */
    function setupImageErrorHandling() {
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('error', function() {
                console.warn('⚠️ 画像読み込み失敗:', this.src);

                // Fallback画像を表示
                if (!this.classList.contains('error-fallback')) {
                    this.classList.add('error-fallback');
                    this.alt = '画像を読み込めませんでした';
                    this.style.cssText = `
                        background: #f0f0f0;
                        border: 2px dashed #ccc;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 200px;
                    `;
                }
            });
        });
    }

    /**
     * 低帯域接続時の画質調整
     */
    function adjustImageQuality() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const effectiveType = connection.effectiveType;

            // 2G/3G接続の場合は低画質画像を使用
            if (effectiveType === '2g' || effectiveType === 'slow-2g') {
                console.log('📶 低帯域接続検出: 低画質画像を使用します');
                document.querySelectorAll('img[data-src-low]').forEach(img => {
                    img.dataset.src = img.dataset.srcLow;
                });
            }
        }
    }

    /**
     * 初期化
     */
    function init() {
        adjustImageQuality();
        setupLazyLoading();
        setupImageErrorHandling();

        console.log('✅ Image Optimizer loaded');
        console.log('   - WebP対応:', supportsWebP());
        console.log('   - 遅延読み込み:', 'IntersectionObserver' in window);
    }

    // DOMContentLoaded後に実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 動的に追加された画像にも対応
    if ('MutationObserver' in window) {
        const observer = new MutationObserver(() => {
            setupLazyLoading();
            setupImageErrorHandling();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();
