'use strict';

/**
 * アクセシビリティ機能モジュール
 *
 * WCAG 2.1 AAレベル準拠を目指したアクセシビリティ強化機能
 * - キーボード操作対応
 * - スクリーンリーダー対応
 * - カラーコントラスト調整
 * - フォントサイズ調整
 * - フォーカス管理
 * - アニメーション制御
 */

class AccessibilityManager {
    constructor() {
        this.settings = {
            fontSize: 'medium', // small, medium, large, xlarge
            highContrast: false,
            reducedMotion: false,
            soundEnabled: true,
            keyboardShortcuts: true
        };

        this.focusHistory = [];
        this.announceQueue = [];

        this.init();
    }

    /**
     * 初期化
     */
    init() {
        this.loadSettings();
        this.applySettings();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupARIA();
        this.setupSkipLinks();
        this.detectSystemPreferences();
        this.createAccessibilityPanel();
        this.setupAnnouncer();
    }

    /**
     * 設定を読み込み
     */
    loadSettings() {
        const saved = localStorage.getItem('accessibilitySettings');
        if (saved) {
            try {
                this.settings = JSON.parse(saved);
            } catch (e) {
                console.error('アクセシビリティ設定の読み込みに失敗:', e);
            }
        }
    }

    /**
     * 設定を保存
     */
    saveSettings() {
        localStorage.setItem('accessibilitySettings', JSON.stringify(this.settings));
    }

    /**
     * 設定を適用
     */
    applySettings() {
        this.applyFontSize();
        this.applyHighContrast();
        this.applyReducedMotion();
    }

    /**
     * フォントサイズ適用
     */
    applyFontSize() {
        const sizes = {
            small: '14px',
            medium: '16px',
            large: '18px',
            xlarge: '20px'
        };

        document.documentElement.style.fontSize = sizes[this.settings.fontSize] || sizes.medium;
        document.documentElement.setAttribute('data-font-size', this.settings.fontSize);
    }

    /**
     * ハイコントラスト適用
     */
    applyHighContrast() {
        if (this.settings.highContrast) {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
    }

    /**
     * モーション削減適用
     */
    applyReducedMotion() {
        if (this.settings.reducedMotion) {
            document.documentElement.classList.add('reduced-motion');
        } else {
            document.documentElement.classList.remove('reduced-motion');
        }
    }

    /**
     * システムの設定を検出
     */
    detectSystemPreferences() {
        // ダークモード検出
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        if (darkModeQuery.matches) {
            // console.log('ダークモード検出'); // 本番環境用にコメントアウト
        }

        // モーション削減検出
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (reducedMotionQuery.matches && !localStorage.getItem('accessibilitySettings')) {
            this.settings.reducedMotion = true;
            this.applyReducedMotion();
        }

        // コントラスト増加検出
        const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
        if (highContrastQuery.matches && !localStorage.getItem('accessibilitySettings')) {
            this.settings.highContrast = true;
            this.applyHighContrast();
        }
    }

    /**
     * キーボードナビゲーション設定
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.settings.keyboardShortcuts) return;

            // ショートカットキー
            const shortcuts = {
                // Alt + H: ホームに戻る
                'h': (e) => e.altKey && this.navigateTo('home'),

                // Alt + M: メニューを開く
                'm': (e) => e.altKey && this.toggleMenu(),

                // Alt + S: 設定パネルを開く
                's': (e) => e.altKey && this.toggleAccessibilityPanel(),

                // Escape: モーダル・メニューを閉じる
                'Escape': () => this.closeModals(),

                // 問題演習中のナビゲーション
                'ArrowLeft': (e) => this.handleQuizNavigation(e, 'prev'),
                'ArrowRight': (e) => this.handleQuizNavigation(e, 'next'),

                // 数字キー1-4: 選択肢を選択
                '1': (e) => this.selectChoice(0, e),
                '2': (e) => this.selectChoice(1, e),
                '3': (e) => this.selectChoice(2, e),
                '4': (e) => this.selectChoice(3, e),
            };

            const key = e.key;
            if (shortcuts[key]) {
                const handler = shortcuts[key];
                if (handler(e) !== false) {
                    // ハンドラーがfalseを返さなければデフォルト動作を防止
                    if (key !== 'Escape' && (e.altKey || ['1','2','3','4'].includes(key))) {
                        e.preventDefault();
                    }
                }
            }
        });

        // Tab順序の改善
        this.improveTabOrder();
    }

    /**
     * Tab順序を改善
     */
    improveTabOrder() {
        // スキップリンクを最優先に
        const skipLink = document.querySelector('.skip-link');
        if (skipLink && !skipLink.hasAttribute('tabindex')) {
            skipLink.setAttribute('tabindex', '0');
        }

        // 非表示要素のtabindex=-1設定
        const observer = new MutationObserver(() => {
            document.querySelectorAll('[hidden], .hidden, [aria-hidden="true"]').forEach(el => {
                const focusable = el.querySelectorAll('a, button, input, select, textarea, [tabindex]');
                focusable.forEach(el => {
                    if (!el.hasAttribute('data-original-tabindex')) {
                        el.setAttribute('data-original-tabindex', el.getAttribute('tabindex') || '0');
                        el.setAttribute('tabindex', '-1');
                    }
                });
            });

            // 表示された要素のtabindex復元
            document.querySelectorAll('[data-original-tabindex]').forEach(el => {
                if (!el.closest('[hidden], .hidden, [aria-hidden="true"]')) {
                    const original = el.getAttribute('data-original-tabindex');
                    if (original === '0') {
                        el.removeAttribute('tabindex');
                    } else {
                        el.setAttribute('tabindex', original);
                    }
                    el.removeAttribute('data-original-tabindex');
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['hidden', 'aria-hidden', 'class'],
            subtree: true
        });
    }

    /**
     * フォーカス管理設定
     */
    setupFocusManagement() {
        // フォーカス可視化
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });

        // フォーカストラップ（モーダル内）
        this.setupFocusTrap();
    }

    /**
     * フォーカストラップ設定
     */
    setupFocusTrap() {
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            const modal = document.querySelector('.modal.active, [role="dialog"][aria-hidden="false"]');
            if (!modal) return;

            const focusableElements = modal.querySelectorAll(
                'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );

            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }

    /**
     * ARIA属性設定
     */
    setupARIA() {
        // ボタンの役割を明示
        document.querySelectorAll('button:not([aria-label])').forEach(btn => {
            if (!btn.textContent.trim() && !btn.getAttribute('aria-label')) {
                console.warn('ボタンにaria-labelが必要:', btn);
            }
        });

        // リンクの役割を明示
        document.querySelectorAll('a[href^="#"]:not([aria-label])').forEach(link => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                const targetText = target.textContent || target.getAttribute('aria-label') || target.id;
                if (!link.getAttribute('aria-label')) {
                    link.setAttribute('aria-label', `${targetText}セクションへ移動`);
                }
            }
        });

        // 画像の代替テキスト確認
        document.querySelectorAll('img:not([alt])').forEach(img => {
            console.warn('画像にalt属性が必要:', img);
            img.setAttribute('alt', '');
        });

        // フォームラベル確認
        document.querySelectorAll('input, select, textarea').forEach(field => {
            if (!field.getAttribute('aria-label') && !field.id) {
                console.warn('フォーム要素にラベルが必要:', field);
            }
        });

        // ライブリージョン設定
        this.setupLiveRegions();
    }

    /**
     * ライブリージョン設定
     */
    setupLiveRegions() {
        // 通知エリア
        const notificationArea = document.createElement('div');
        notificationArea.id = 'notification-area';
        notificationArea.setAttribute('role', 'status');
        notificationArea.setAttribute('aria-live', 'polite');
        notificationArea.setAttribute('aria-atomic', 'true');
        notificationArea.className = 'sr-only';
        document.body.appendChild(notificationArea);

        // 緊急通知エリア
        const alertArea = document.createElement('div');
        alertArea.id = 'alert-area';
        alertArea.setAttribute('role', 'alert');
        alertArea.setAttribute('aria-live', 'assertive');
        alertArea.setAttribute('aria-atomic', 'true');
        alertArea.className = 'sr-only';
        document.body.appendChild(alertArea);
    }

    /**
     * スキップリンク設定
     */
    setupSkipLinks() {
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(skipLink.getAttribute('href'));
                if (target) {
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                    target.addEventListener('blur', () => {
                        target.removeAttribute('tabindex');
                    }, { once: true });
                }
            });
        }
    }

    /**
     * アナウンサー設定
     */
    setupAnnouncer() {
        // 画面遷移を監視してアナウンス
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('active') && target.classList.contains('screen')) {
                        const title = target.querySelector('h1, h2, .section-title');
                        if (title) {
                            this.announce(`${title.textContent}画面に移動しました`);
                        }
                    }
                }
            });
        });

        document.querySelectorAll('.screen').forEach(screen => {
            observer.observe(screen, { attributes: true });
        });
    }

    /**
     * スクリーンリーダーに通知
     * @param {string} message - 通知メッセージ
     * @param {string} priority - 'polite' または 'assertive'
     */
    announce(message, priority = 'polite') {
        const areaId = priority === 'assertive' ? 'alert-area' : 'notification-area';
        const area = document.getElementById(areaId);

        if (!area) return;

        // 既存のメッセージをクリア
        area.textContent = '';

        // 少し遅延させて確実に読み上げ
        setTimeout(() => {
            area.textContent = message;
        }, 100);

        // 5秒後にクリア
        setTimeout(() => {
            area.textContent = '';
        }, 5000);
    }

    /**
     * アクセシビリティパネル作成
     */
    createAccessibilityPanel() {
        const panel = document.createElement('div');
        panel.id = 'accessibility-panel';
        panel.className = 'accessibility-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-labelledby', 'accessibility-panel-title');
        panel.setAttribute('aria-hidden', 'true');

        panel.innerHTML = `
            <div class="accessibility-panel-content">
                <div class="accessibility-panel-header">
                    <h2 id="accessibility-panel-title">アクセシビリティ設定</h2>
                    <button class="close-btn" aria-label="設定パネルを閉じる" onclick="accessibilityManager.toggleAccessibilityPanel()">
                        ✕
                    </button>
                </div>

                <div class="accessibility-panel-body">
                    <!-- フォントサイズ -->
                    <div class="setting-group">
                        <label id="font-size-label">フォントサイズ</label>
                        <div class="button-group" role="radiogroup" aria-labelledby="font-size-label">
                            <button class="setting-btn" data-setting="fontSize" data-value="small" aria-label="小さい文字サイズ">小</button>
                            <button class="setting-btn" data-setting="fontSize" data-value="medium" aria-label="中くらいの文字サイズ">中</button>
                            <button class="setting-btn" data-setting="fontSize" data-value="large" aria-label="大きい文字サイズ">大</button>
                            <button class="setting-btn" data-setting="fontSize" data-value="xlarge" aria-label="特大の文字サイズ">特大</button>
                        </div>
                    </div>

                    <!-- ハイコントラスト -->
                    <div class="setting-group">
                        <label class="toggle-label">
                            <input type="checkbox" id="high-contrast-toggle"
                                   onchange="accessibilityManager.toggleSetting('highContrast', this.checked)"
                                   aria-describedby="high-contrast-desc">
                            <span>ハイコントラストモード</span>
                        </label>
                        <p id="high-contrast-desc" class="setting-description">
                            色のコントラストを高めて視認性を向上
                        </p>
                    </div>

                    <!-- モーション削減 -->
                    <div class="setting-group">
                        <label class="toggle-label">
                            <input type="checkbox" id="reduced-motion-toggle"
                                   onchange="accessibilityManager.toggleSetting('reducedMotion', this.checked)"
                                   aria-describedby="reduced-motion-desc">
                            <span>アニメーションを削減</span>
                        </label>
                        <p id="reduced-motion-desc" class="setting-description">
                            画面の動きや効果を最小限に
                        </p>
                    </div>

                    <!-- 効果音 -->
                    <div class="setting-group">
                        <label class="toggle-label">
                            <input type="checkbox" id="sound-toggle"
                                   onchange="accessibilityManager.toggleSetting('soundEnabled', this.checked)"
                                   aria-describedby="sound-desc">
                            <span>効果音を有効にする</span>
                        </label>
                        <p id="sound-desc" class="setting-description">
                            正解・不正解の効果音を再生
                        </p>
                    </div>

                    <!-- キーボードショートカット -->
                    <div class="setting-group">
                        <label class="toggle-label">
                            <input type="checkbox" id="keyboard-shortcuts-toggle"
                                   onchange="accessibilityManager.toggleSetting('keyboardShortcuts', this.checked)"
                                   aria-describedby="keyboard-shortcuts-desc">
                            <span>キーボードショートカットを有効にする</span>
                        </label>
                        <p id="keyboard-shortcuts-desc" class="setting-description">
                            Alt+H: ホーム / Alt+M: メニュー / Alt+S: 設定
                        </p>
                    </div>

                    <!-- キーボードショートカット一覧 -->
                    <details class="keyboard-shortcuts-list">
                        <summary>キーボードショートカット一覧</summary>
                        <dl>
                            <dt>Alt + H</dt>
                            <dd>ホーム画面に戻る</dd>

                            <dt>Alt + M</dt>
                            <dd>メニューを開く/閉じる</dd>

                            <dt>Alt + S</dt>
                            <dd>アクセシビリティ設定を開く/閉じる</dd>

                            <dt>Escape</dt>
                            <dd>モーダル・メニューを閉じる</dd>

                            <dt>Tab / Shift+Tab</dt>
                            <dd>要素間を移動</dd>

                            <dt>Enter / Space</dt>
                            <dd>ボタン・リンクを選択</dd>

                            <dt>← →</dt>
                            <dd>問題を前後に移動</dd>

                            <dt>1 / 2 / 3 / 4</dt>
                            <dd>選択肢を選ぶ</dd>
                        </dl>
                    </details>
                </div>

                <div class="accessibility-panel-footer">
                    <button class="btn btn-secondary" onclick="accessibilityManager.resetSettings()">
                        設定をリセット
                    </button>
                </div>
            </div>
            <div class="accessibility-panel-overlay" onclick="accessibilityManager.toggleAccessibilityPanel()"></div>
        `;

        document.body.appendChild(panel);

        // 設定ボタンのイベント
        panel.querySelectorAll('.setting-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const setting = btn.dataset.setting;
                const value = btn.dataset.value;
                this.changeSetting(setting, value);
            });
        });

        // 初期状態を反映
        this.updatePanelUI();

        // アクセシビリティボタンを追加
        this.createAccessibilityButton();
    }

    /**
     * アクセシビリティボタン作成
     */
    createAccessibilityButton() {
        const button = document.createElement('button');
        button.className = 'accessibility-toggle-btn';
        button.setAttribute('aria-label', 'アクセシビリティ設定を開く');
        button.innerHTML = `
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4S13.1 6 12 6 10 5.1 10 4 10.9 2 12 2M21 9H15V22H13V16H11V22H9V9H3V7H21V9Z"/>
            </svg>
        `;
        button.onclick = () => this.toggleAccessibilityPanel();
        document.body.appendChild(button);
    }

    /**
     * アクセシビリティパネル開閉
     */
    toggleAccessibilityPanel() {
        const panel = document.getElementById('accessibility-panel');
        if (!panel) return;

        const isHidden = panel.getAttribute('aria-hidden') === 'true';

        if (isHidden) {
            // 開く
            panel.setAttribute('aria-hidden', 'false');
            panel.classList.add('active');

            // フォーカスをパネル内に移動
            const firstFocusable = panel.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                // 前のフォーカス位置を記憶
                this.focusHistory.push(document.activeElement);
                firstFocusable.focus();
            }

            this.announce('アクセシビリティ設定パネルを開きました');
        } else {
            // 閉じる
            panel.setAttribute('aria-hidden', 'true');
            panel.classList.remove('active');

            // フォーカスを戻す
            const previousFocus = this.focusHistory.pop();
            if (previousFocus && previousFocus.focus) {
                previousFocus.focus();
            }

            this.announce('アクセシビリティ設定パネルを閉じました');
        }
    }

    /**
     * 設定を変更
     * @param {string} key - 設定キー
     * @param {*} value - 設定値
     */
    changeSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.applySettings();
        this.updatePanelUI();
        this.announce(`${key}を${value}に変更しました`);
    }

    /**
     * トグル設定を切り替え
     * @param {string} key - 設定キー
     * @param {boolean} checked - チェック状態
     */
    toggleSetting(key, checked) {
        this.settings[key] = checked;
        this.saveSettings();
        this.applySettings();
        this.announce(`${key}を${checked ? '有効' : '無効'}にしました`);
    }

    /**
     * パネルUIを更新
     */
    updatePanelUI() {
        // フォントサイズボタン
        document.querySelectorAll('[data-setting="fontSize"]').forEach(btn => {
            if (btn.dataset.value === this.settings.fontSize) {
                btn.classList.add('active');
                btn.setAttribute('aria-checked', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-checked', 'false');
            }
        });

        // トグル
        const highContrastToggle = document.getElementById('high-contrast-toggle');
        if (highContrastToggle) {
            highContrastToggle.checked = this.settings.highContrast;
        }

        const reducedMotionToggle = document.getElementById('reduced-motion-toggle');
        if (reducedMotionToggle) {
            reducedMotionToggle.checked = this.settings.reducedMotion;
        }

        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.checked = this.settings.soundEnabled;
        }

        const keyboardShortcutsToggle = document.getElementById('keyboard-shortcuts-toggle');
        if (keyboardShortcutsToggle) {
            keyboardShortcutsToggle.checked = this.settings.keyboardShortcuts;
        }
    }

    /**
     * 設定をリセット
     */
    resetSettings() {
        if (confirm('アクセシビリティ設定を初期状態に戻しますか？')) {
            this.settings = {
                fontSize: 'medium',
                highContrast: false,
                reducedMotion: false,
                soundEnabled: true,
                keyboardShortcuts: true
            };
            this.saveSettings();
            this.applySettings();
            this.updatePanelUI();
            this.announce('設定をリセットしました');
        }
    }

    /**
     * ナビゲーション
     */
    navigateTo(screen) {
        if (typeof window.huntingLicenseApp !== 'undefined' && window.huntingLicenseApp.showScreen) {
            window.huntingLicenseApp.showScreen(screen);
            return true;
        }
        return false;
    }

    /**
     * メニュー開閉
     */
    toggleMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        if (navToggle) {
            navToggle.click();
            return true;
        }
        return false;
    }

    /**
     * モーダルを閉じる
     */
    closeModals() {
        // アクセシビリティパネル
        const panel = document.getElementById('accessibility-panel');
        if (panel && panel.getAttribute('aria-hidden') === 'false') {
            this.toggleAccessibilityPanel();
            return true;
        }

        // その他のモーダル
        const modals = document.querySelectorAll('.modal.active, [role="dialog"][aria-hidden="false"]');
        if (modals.length > 0) {
            modals.forEach(modal => {
                const closeBtn = modal.querySelector('.close-btn, [aria-label*="閉じる"]');
                if (closeBtn) {
                    closeBtn.click();
                }
            });
            return true;
        }

        return false;
    }

    /**
     * 問題ナビゲーション
     */
    handleQuizNavigation(e, direction) {
        const quizContainer = document.querySelector('#quiz-container');
        if (!quizContainer || !quizContainer.closest('.screen.active')) {
            return false; // クイズ画面でない場合はブラウザのデフォルト動作
        }

        e.preventDefault();

        if (direction === 'prev') {
            const prevBtn = document.getElementById('prev-question');
            if (prevBtn && !prevBtn.disabled) {
                prevBtn.click();
                this.announce('前の問題に移動しました');
            }
        } else if (direction === 'next') {
            const nextBtn = document.getElementById('next-question');
            const finishBtn = document.getElementById('finish-quiz');

            if (nextBtn && nextBtn.style.display !== 'none') {
                nextBtn.click();
                this.announce('次の問題に移動しました');
            } else if (finishBtn && finishBtn.style.display !== 'none') {
                finishBtn.click();
            }
        }

        return true;
    }

    /**
     * 選択肢を選択
     */
    selectChoice(index, e) {
        const quizContainer = document.querySelector('#quiz-container');
        if (!quizContainer || !quizContainer.closest('.screen.active')) {
            return false; // クイズ画面でない場合は無視
        }

        e.preventDefault();

        const choices = document.querySelectorAll('.choice-btn');
        if (choices[index]) {
            choices[index].click();
            this.announce(`選択肢${index + 1}を選択しました`);
        }

        return true;
    }

    /**
     * 効果音再生
     * @param {string} type - 'correct' または 'incorrect'
     */
    playSound(type) {
        if (!this.settings.soundEnabled) return;

        // Web Audio APIを使って簡単な効果音を生成
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'correct') {
            // 正解音（上昇音）
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.exponentialRampToValueAtTime(783.99, audioContext.currentTime + 0.1); // G5
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        } else {
            // 不正解音（下降音）
            oscillator.frequency.setValueAtTime(392.00, audioContext.currentTime); // G4
            oscillator.frequency.exponentialRampToValueAtTime(261.63, audioContext.currentTime + 0.2); // C4
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        }

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
}

// グローバルインスタンス
let accessibilityManager;

// DOMContentLoaded後に初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        accessibilityManager = new AccessibilityManager();
        // console.log('♿ アクセシビリティマネージャー初期化完了'); // 本番環境用にコメントアウト
    });
} else {
    accessibilityManager = new AccessibilityManager();
    console.log('♿ アクセシビリティマネージャー初期化完了');
}
