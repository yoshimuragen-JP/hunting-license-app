/**
 * グローバルナビゲーション機能（Quality Guardian追加）
 * 全ページ共通の戻るボタン、キーボードショートカット
 */

'use strict';

(function() {
    /**
     * Escキーでトップページへ戻る
     */
    document.addEventListener('keydown', function(e) {
        // Escキーが押された
        if (e.key === 'Escape' || e.keyCode === 27) {
            // index.html以外のページでのみ動作
            const currentPage = window.location.pathname.split('/').pop();
            if (currentPage !== 'index.html' && currentPage !== '') {
                // モーダルやダイアログが開いていない場合のみ
                const hasModal = document.querySelector('.modal.active, [role="dialog"][aria-hidden="false"]');
                if (!hasModal) {
                    window.location.href = 'index.html';
                }
            }
        }
    });

    /**
     * 戻るボタンのホバー効果強化
     */
    const backButtons = document.querySelectorAll('.btn-back-home');
    backButtons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            // 軽いバイブレーション効果（対応デバイスのみ）
            if ('vibrate' in navigator) {
                navigator.vibrate(10);
            }
        });
    });

    /**
     * スムーズスクロール（ページ内リンク）
     */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    /**
     * エラーハンドリング（Quality Guardian追加）
     * JavaScriptエラーをキャッチして、ユーザーフレンドリーなメッセージを表示
     */
    window.addEventListener('error', function(event) {
        console.error('❌ JavaScript Error:', event.error);

        // ユーザーへの通知（控えめに）
        const errorBanner = document.createElement('div');
        errorBanner.className = 'error-banner';
        errorBanner.setAttribute('role', 'alert');
        errorBanner.innerHTML = `
            <span>⚠️ 一時的な問題が発生しました。ページを再読み込みしてください。</span>
            <button onclick="this.parentElement.remove()" aria-label="閉じる">×</button>
        `;
        errorBanner.style.cssText = `
            position: fixed;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: #fff3cd;
            color: #856404;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 15px;
            animation: slideDown 0.3s ease-out;
        `;

        // スタイルの追加
        if (!document.querySelector('#error-banner-styles')) {
            const style = document.createElement('style');
            style.id = 'error-banner-styles';
            style.textContent = `
                @keyframes slideDown {
                    from { opacity: 0; transform: translate(-50%, -20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
                .error-banner button {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #856404;
                    padding: 0;
                    line-height: 1;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(errorBanner);

        // 5秒後に自動削除
        setTimeout(() => {
            errorBanner.style.opacity = '0';
            setTimeout(() => errorBanner.remove(), 300);
        }, 5000);
    });

    /**
     * LocalStorage容量チェック
     * 学習データが保存できるか確認
     */
    function checkStorageCapacity() {
        try {
            const test = 'storage-test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('⚠️ LocalStorage利用不可:', e);
            return false;
        }
    }

    if (!checkStorageCapacity()) {
        console.warn('⚠️ LocalStorageが利用できません。学習データは保存されません。');
    }

    /**
     * オンライン/オフライン検知
     */
    window.addEventListener('offline', function() {
        console.log('📡 オフラインモード（学習は継続できます）');
        const banner = document.createElement('div');
        banner.className = 'offline-banner';
        banner.setAttribute('role', 'status');
        banner.textContent = '📡 オフラインモード（学習は継続できます）';
        banner.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #6c757d;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
        `;
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 3000);
    });

    window.addEventListener('online', function() {
        console.log('✅ オンラインに戻りました');
        const banner = document.createElement('div');
        banner.className = 'online-banner';
        banner.setAttribute('role', 'status');
        banner.textContent = '✅ オンラインに戻りました';
        banner.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
        `;
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 3000);
    });

    /**
     * デバッグ: 機能確認
     */
    console.log('✅ Global Navigation loaded: Escキーでトップページへ戻れます');
    console.log('✅ Error Handling loaded: エラーハンドリング有効');
    console.log('✅ Online/Offline Detection loaded: ネットワーク状態監視中');
})();
