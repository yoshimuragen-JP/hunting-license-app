'use strict';

/**
 * 狩猟免許試験学習アプリ - 音響効果システム
 *
 * Web Audio APIを使用した軽量な効果音システム
 * 外部ファイル不要、JavaScriptのみで完結
 *
 * 機能:
 * - 正解音（連続正解でピッチアップ）
 * - 不正解音（控えめなブザー）
 * - 完了音（達成感のあるファンファーレ）
 * - ボタンクリック音（軽快）
 * - 通知音（優しいベル）
 * - 音量調整・ON/OFF切り替え
 * - 振動フィードバック（モバイル対応）
 */

class SoundEffectSystem {
    constructor() {
        // Web Audio APIコンテキスト（初回再生時に初期化）
        this.audioContext = null;

        // 設定
        this.settings = {
            enabled: true,
            volume: 0.3, // 0.0 - 1.0
            vibrationEnabled: true
        };

        // 連続正解カウンター
        this.correctStreak = 0;

        // LocalStorageから設定を読み込み
        this.loadSettings();
    }

    /**
     * AudioContextを初期化（ユーザーインタラクション後に実行）
     */
    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }

    /**
     * 設定をLocalStorageから読み込み
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('soundSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('音響設定の読み込みエラー:', error);
        }
    }

    /**
     * 設定をLocalStorageに保存
     */
    saveSettings() {
        try {
            localStorage.setItem('soundSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('音響設定の保存エラー:', error);
        }
    }

    /**
     * 音響効果のON/OFF切り替え
     */
    toggle() {
        this.settings.enabled = !this.settings.enabled;
        this.saveSettings();
        return this.settings.enabled;
    }

    /**
     * 音量設定（0.0 - 1.0）
     */
    setVolume(volume) {
        this.settings.volume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }

    /**
     * 振動フィードバックのON/OFF切り替え
     */
    toggleVibration() {
        this.settings.vibrationEnabled = !this.settings.vibrationEnabled;
        this.saveSettings();
        return this.settings.vibrationEnabled;
    }

    /**
     * 基本的な音の再生（オシレーター）
     */
    playTone(frequency, duration, waveType = 'sine', volume = null) {
        if (!this.settings.enabled) return;

        try {
            const ctx = this.initAudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = waveType;
            oscillator.frequency.value = frequency;

            const vol = volume !== null ? volume : this.settings.volume;
            gainNode.gain.setValueAtTime(vol, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration);
        } catch (error) {
            console.error('音響再生エラー:', error);
        }
    }

    /**
     * 複数の音を順番に再生（メロディー）
     */
    playSequence(notes) {
        if (!this.settings.enabled) return;

        try {
            const ctx = this.initAudioContext();
            let currentTime = ctx.currentTime;

            notes.forEach(note => {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                oscillator.type = note.waveType || 'sine';
                oscillator.frequency.value = note.frequency;

                const vol = note.volume !== undefined ? note.volume : this.settings.volume;
                gainNode.gain.setValueAtTime(vol, currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration);

                oscillator.start(currentTime);
                oscillator.stop(currentTime + note.duration);

                currentTime += note.duration + (note.gap || 0);
            });
        } catch (error) {
            console.error('シーケンス再生エラー:', error);
        }
    }

    /**
     * 振動フィードバック
     */
    vibrate(pattern) {
        if (!this.settings.vibrationEnabled) return;
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    // ================================================================================
    // 効果音メソッド
    // ================================================================================

    /**
     * 正解音（爽快な音、連続正解でピッチアップ）
     */
    playCorrect() {
        this.correctStreak++;

        // 連続正解数に応じてピッチアップ（最大5連続まで）
        const pitchMultiplier = 1 + (Math.min(this.correctStreak, 5) - 1) * 0.1;

        // 明るい3和音（ドミソ）
        const baseFreq = 523.25; // C5
        this.playSequence([
            { frequency: baseFreq * pitchMultiplier, duration: 0.1, waveType: 'sine', gap: 0.02 },
            { frequency: 659.25 * pitchMultiplier, duration: 0.1, waveType: 'sine', gap: 0.02 },
            { frequency: 783.99 * pitchMultiplier, duration: 0.2, waveType: 'sine' }
        ]);

        // 振動フィードバック（短い1回）
        this.vibrate(50);
    }

    /**
     * 不正解音（控えめなブザー）
     */
    playIncorrect() {
        this.correctStreak = 0; // 連続正解リセット

        // 低めの不協和音
        this.playSequence([
            { frequency: 200, duration: 0.15, waveType: 'square', volume: this.settings.volume * 0.5 },
            { frequency: 180, duration: 0.15, waveType: 'square', volume: this.settings.volume * 0.5 }
        ]);

        // 振動フィードback（やや長め）
        this.vibrate(100);
    }

    /**
     * 完了音（達成感のあるファンファーレ）
     */
    playComplete() {
        this.correctStreak = 0;

        // ファンファーレ風のメロディー（ドミソド）
        this.playSequence([
            { frequency: 523.25, duration: 0.15, waveType: 'sine', gap: 0.05 }, // C5
            { frequency: 659.25, duration: 0.15, waveType: 'sine', gap: 0.05 }, // E5
            { frequency: 783.99, duration: 0.15, waveType: 'sine', gap: 0.05 }, // G5
            { frequency: 1046.50, duration: 0.3, waveType: 'sine' }              // C6
        ]);

        // 振動フィードバック（パターン）
        this.vibrate([100, 50, 100, 50, 200]);
    }

    /**
     * ボタンクリック音（軽快なクリック）
     */
    playClick() {
        // 短い高音
        this.playTone(800, 0.05, 'sine', this.settings.volume * 0.3);

        // 振動フィードバック（非常に短い）
        this.vibrate(10);
    }

    /**
     * 通知音（優しいベル）
     */
    playNotification() {
        // ベル風の和音
        this.playSequence([
            { frequency: 880, duration: 0.3, waveType: 'sine', volume: this.settings.volume * 0.7 },
            { frequency: 1174.66, duration: 0.3, waveType: 'sine', volume: this.settings.volume * 0.5, gap: -0.3 }
        ]);

        // 振動フィードバック（短い2回）
        this.vibrate([50, 100, 50]);
    }

    /**
     * タイマー警告音（残り時間が少ない時）
     */
    playWarning() {
        // 緊急性のある2音
        this.playSequence([
            { frequency: 880, duration: 0.2, waveType: 'square', volume: this.settings.volume * 0.6 },
            { frequency: 1046.50, duration: 0.2, waveType: 'square', volume: this.settings.volume * 0.6, gap: 0.1 }
        ]);

        // 振動フィードバック
        this.vibrate([100, 50, 100]);
    }

    /**
     * レベルアップ音（達成度が上がった時）
     */
    playLevelUp() {
        // 上昇する明るいアルペジオ
        this.playSequence([
            { frequency: 523.25, duration: 0.1, waveType: 'sine', gap: 0.05 },  // C5
            { frequency: 659.25, duration: 0.1, waveType: 'sine', gap: 0.05 },  // E5
            { frequency: 783.99, duration: 0.1, waveType: 'sine', gap: 0.05 },  // G5
            { frequency: 1046.50, duration: 0.15, waveType: 'sine', gap: 0.05 }, // C6
            { frequency: 1318.51, duration: 0.2, waveType: 'sine' }              // E6
        ]);

        // 振動フィードバック（長めのパターン）
        this.vibrate([50, 30, 50, 30, 50, 30, 150]);
    }

    /**
     * ページ遷移音（画面切り替え時）
     */
    playTransition() {
        // 軽やかな上昇音
        this.playTone(600, 0.08, 'sine', this.settings.volume * 0.2);

        // 振動なし（頻繁に発生するため）
    }

    /**
     * エラー音（エラー発生時）
     */
    playError() {
        // 不協和音のブザー
        this.playSequence([
            { frequency: 150, duration: 0.2, waveType: 'sawtooth', volume: this.settings.volume * 0.5 },
            { frequency: 140, duration: 0.2, waveType: 'sawtooth', volume: this.settings.volume * 0.5, gap: 0.05 }
        ]);

        // 振動フィードバック（長い1回）
        this.vibrate(200);
    }

    // ================================================================================
    // ユーティリティ
    // ================================================================================

    /**
     * 連続正解カウンターをリセット
     */
    resetStreak() {
        this.correctStreak = 0;
    }

    /**
     * 現在の設定を取得
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * 設定UIの状態を更新
     */
    updateUI() {
        // 音響ON/OFFトグル
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.checked = this.settings.enabled;
            soundToggle.textContent = this.settings.enabled ? '🔊 ON' : '🔇 OFF';
        }

        // 音量スライダー
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.value = this.settings.volume * 100;
        }

        // 音量表示
        const volumeDisplay = document.getElementById('volume-display');
        if (volumeDisplay) {
            volumeDisplay.textContent = Math.round(this.settings.volume * 100) + '%';
        }

        // 振動ON/OFFトグル
        const vibrationToggle = document.getElementById('vibration-toggle');
        if (vibrationToggle) {
            vibrationToggle.checked = this.settings.vibrationEnabled;
        }
    }

    /**
     * 設定UIのイベントリスナーを設定
     */
    setupUI() {
        // 音響ON/OFFトグル
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('change', (e) => {
                this.settings.enabled = e.target.checked;
                this.saveSettings();
                if (this.settings.enabled) {
                    this.playClick(); // テスト音
                }
            });
        }

        // 音量スライダー
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value / 100);
                this.updateUI();
            });

            // スライダー操作終了時にテスト音
            volumeSlider.addEventListener('change', () => {
                this.playClick();
            });
        }

        // 振動ON/OFFトグル
        const vibrationToggle = document.getElementById('vibration-toggle');
        if (vibrationToggle) {
            vibrationToggle.addEventListener('change', (e) => {
                this.settings.vibrationEnabled = e.target.checked;
                this.saveSettings();
                if (this.settings.vibrationEnabled) {
                    this.vibrate(50); // テスト振動
                }
            });
        }

        // 初期状態を反映
        this.updateUI();
    }
}

// ================================================================================
// グローバルインスタンス
// ================================================================================

// シングルトンインスタンスを作成
const soundSystem = new SoundEffectSystem();

// DOMContentLoaded後に設定UIを初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        soundSystem.setupUI();
    });
} else {
    soundSystem.setupUI();
}

// グローバルスコープに公開（他のスクリプトから使用可能）
window.soundSystem = soundSystem;
