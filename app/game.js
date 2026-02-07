'use strict';

/**
 * 時間管理クラス（Quality Guardian追加）
 * 問題演習の経過時間を追跡・表示
 */
class TimeTracker {
    constructor() {
        this.startTime = null;
        this.elapsedSeconds = 0;
        this.timerInterval = null;
    }

    /**
     * タイマーを開始
     */
    start() {
        this.startTime = Date.now();
        this.elapsedSeconds = 0;
        this.timerInterval = setInterval(() => {
            this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
            this.updateDisplay();
            this.checkTimeAlerts();
        }, 1000);
    }

    /**
     * タイマーを停止し、経過秒数を返す
     */
    stop() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        return this.elapsedSeconds;
    }

    /**
     * 経過時間表示を更新
     */
    updateDisplay() {
        const minutes = Math.floor(this.elapsedSeconds / 60);
        const seconds = this.elapsedSeconds % 60;
        const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        const timerEl = document.getElementById('elapsed-time-display');
        if (timerEl) {
            timerEl.textContent = display;
        }
    }

    /**
     * 時間経過に応じたアラートを表示
     */
    checkTimeAlerts() {
        const alertContainer = document.getElementById('time-alert-container');
        if (!alertContainer) return;

        // 10分経過
        if (this.elapsedSeconds === 600) {
            this.showAlert('学習時間: 10分経過', 'warning');
        }
        // 20分経過
        else if (this.elapsedSeconds === 1200) {
            this.showAlert('集中力が低下しているかも。休憩を推奨', 'warning');
        }
        // 30分経過
        else if (this.elapsedSeconds === 1800) {
            this.showAlert('30分経過。一旦休憩しましょう', 'danger');
        }
    }

    /**
     * アラートを表示
     */
    showAlert(message, type) {
        const alertContainer = document.getElementById('time-alert-container');
        if (!alertContainer) return;

        const alert = document.createElement('div');
        alert.className = `time-alert time-alert-${type}`;
        alert.textContent = message;
        alert.setAttribute('role', 'alert');
        alertContainer.appendChild(alert);

        // 5秒後に自動削除
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    }

    /**
     * 結果サマリーを生成
     */
    getSummary(totalQuestions) {
        const totalSeconds = this.elapsedSeconds;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const avgSecondsPerQuestion = Math.floor(totalSeconds / totalQuestions);

        const timeDisplay = `${minutes}分${seconds}秒`;
        const avgDisplay = `${avgSecondsPerQuestion}秒/問`;

        let feedback = '';
        if (avgSecondsPerQuestion < 20) {
            feedback = '非常に良いペースです！素早く正確に解答できています。';
        } else if (avgSecondsPerQuestion < 40) {
            feedback = '良いペースです！集中して解答できています。';
        } else if (avgSecondsPerQuestion < 60) {
            feedback = '標準的なペースです。焦らず確実に解答しましょう。';
        } else {
            feedback = 'じっくり考えて解答していますね。理解を深めながら進めましょう。';
        }

        return {
            timeDisplay,
            avgDisplay,
            feedback,
            totalSeconds
        };
    }
}

/**
 * 狩猟免許試験学習アプリ - ゲーミフィケーション機能
 *
 * 楽しく学習を継続できるゲーム要素を提供
 *
 * 機能:
 * - クイックマッチ（5問スピードクイズ）
 * - デイリーチャレンジ（毎日異なる10問）
 * - 連続正解コンボシステム
 * - バッジ・実績システム（14種類）
 * - ランキング機能
 * - 学習継続支援（デイリーストリーク）
 *
 * @class GameManager
 * @description ゲームモードの状態管理とスコア計算を担当
 */
class GameManager {
    constructor() {
        this.quizData = null;
        this.currentMode = null;
        this.currentQuestions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.correctCount = 0;
        this.incorrectCount = 0;
        this.startTime = null;
        this.timeTracker = new TimeTracker(); // Quality Guardian追加
        this.loadData();
        this.loadStats();
    }

    /**
     * 問題データベースを読み込み
     * quiz-database.jsonとextended-quiz-database.jsonから全問題を取得してthis.quizDataに格納
     */
    async loadData() {
        try {
            const response = await fetch('../quiz-database.json');
            const baseData = await response.json();

            // extended-quiz-database.jsonも読み込んで統合
            try {
                const extendedResponse = await fetch('../extended-quiz-database.json');
                const extendedData = await extendedResponse.json();

                // advancedQuizzesをquizzesに統合
                if (extendedData.advancedQuizzes) {
                    baseData.quizzes = baseData.quizzes.concat(extendedData.advancedQuizzes);
                }
            } catch (extError) {
                console.warn('extended-quiz-database.jsonの読み込みに失敗（スキップ）:', extError);
            }

            // ultra-extended-quiz-database.jsonも読み込んで統合
            try {
                const ultraResponse = await fetch('../ultra-extended-quiz-database.json');
                const ultraData = await ultraResponse.json();

                // ultraAdvancedQuizzesをquizzesに統合
                if (ultraData.ultraAdvancedQuizzes) {
                    baseData.quizzes = baseData.quizzes.concat(ultraData.ultraAdvancedQuizzes);
                }
            } catch (ultraError) {
                console.warn('ultra-extended-quiz-database.jsonの読み込みに失敗（スキップ）:', ultraError);
            }

            this.quizData = baseData;
            console.log(`✅ 問題データ読み込み完了: ${baseData.quizzes.length}問`);
        } catch (error) {
            console.error('データ読み込みエラー:', error);
        }
    }

    /**
     * セッション統計をLocalStorageに保存（Quality Guardian追加）
     * 各セッションの詳細を記録
     */
    saveSessionHistory(sessionData) {
        try {
            const history = JSON.parse(localStorage.getItem('sessionHistory')) || [];
            history.push({
                timestamp: Date.now(),
                date: new Date().toISOString(),
                mode: this.currentMode,
                totalQuestions: sessionData.totalQuestions,
                correctCount: sessionData.correctCount,
                incorrectCount: sessionData.incorrectCount,
                elapsedSeconds: sessionData.elapsedSeconds,
                avgSecondsPerQuestion: Math.floor(sessionData.elapsedSeconds / sessionData.totalQuestions),
                accuracy: Math.round((sessionData.correctCount / sessionData.totalQuestions) * 100),
                score: sessionData.score,
                maxCombo: sessionData.maxCombo
            });

            // 最新100セッションのみ保持
            if (history.length > 100) {
                history.shift();
            }

            localStorage.setItem('sessionHistory', JSON.stringify(history));
            console.log('✅ セッション履歴保存完了');
        } catch (error) {
            console.error('❌ セッション履歴保存失敗:', error);
        }
    }

    /**
     * ゲーム統計情報をLocalStorageから読み込み
     * 統一されたhuntingProgress構造を使用
     */
    loadStats() {
        const progress = JSON.parse(localStorage.getItem('huntingProgress'));
        if (progress && progress.gameStats) {
            this.stats = {
                totalGames: progress.gameStats.totalGames || 0,
                totalQuestions: progress.totalQuestions || 0,
                totalCorrect: progress.correctAnswers || 0,
                bestScore: progress.gameStats.highScore || 0,
                maxCombo: progress.gameStats.maxCombo || 0,
                achievements: progress.gameStats.achievements || [],
                rank: this.calculateRank(progress.correctAnswers || 0),
                dailyStreak: progress.gameStats.dailyStreak || 0,
                lastPlayDate: progress.gameStats.lastPlayDate || null,
                categoryStats: progress.categories || {}
            };
        } else {
            this.stats = {
                totalGames: 0,
                totalQuestions: 0,
                totalCorrect: 0,
                bestScore: 0,
                maxCombo: 0,
                achievements: [],
                rank: '見習いハンター',
                dailyStreak: 0,
                lastPlayDate: null,
                categoryStats: {}
            };
        }
    }

    calculateRank(totalCorrect) {
        if (totalCorrect >= 500) return '伝説の師範';
        else if (totalCorrect >= 300) return '師範代';
        else if (totalCorrect >= 200) return 'ベテランハンター';
        else if (totalCorrect >= 100) return '一人前ハンター';
        else if (totalCorrect >= 50) return '見習いハンター';
        else return '新米ハンター';
    }

    saveStats() {
        const progress = JSON.parse(localStorage.getItem('huntingProgress')) || this.initProgress();

        // 統一データ構造に保存
        progress.totalQuestions = this.stats.totalQuestions;
        progress.correctAnswers = this.stats.totalCorrect;
        progress.gameStats = {
            totalGames: this.stats.totalGames,
            highScore: this.stats.bestScore,
            maxCombo: this.stats.maxCombo,
            achievements: this.stats.achievements,
            dailyStreak: this.stats.dailyStreak,
            lastPlayDate: this.stats.lastPlayDate
        };

        localStorage.setItem('huntingProgress', JSON.stringify(progress));

        // 後方互換のため旧キーも残す（将来削除予定）
        localStorage.setItem('huntingGameStats', JSON.stringify(this.stats));
    }

    initProgress() {
        return {
            totalQuestions: 0,
            correctAnswers: 0,
            studyTime: 0,
            lastStudyDate: null,
            categories: {
                law: { correct: 0, total: 0 },
                tools: { correct: 0, total: 0 },
                animals: { correct: 0, total: 0 },
                management: { correct: 0, total: 0 },
                practical: { correct: 0, total: 0 }
            },
            quizHistory: [],
            gameStats: {
                totalGames: 0,
                highScore: 0,
                maxCombo: 0,
                achievements: [],
                dailyStreak: 0,
                lastPlayDate: null
            },
            examHistory: []
        };
    }

    /**
     * ランダムに問題を抽出
     * @param {number} count - 抽出する問題数
     * @returns {Array} ランダムに選ばれた問題の配列
     */
    getRandomQuestions(count) {
        const shuffled = [...this.quizData.quizzes].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    /**
     * デイリーチャレンジ用の問題を取得
     * 日付をシードとして決定論的にシャッフルすることで、毎日異なる問題セットを生成
     * @returns {Array} その日専用の10問の配列
     */
    getDailyQuestions() {
        const today = new Date().toDateString();
        const seed = this.hashCode(today);
        const shuffled = [...this.quizData.quizzes].sort((a, b) => {
            const hashA = this.hashCode(a.id + seed);
            const hashB = this.hashCode(b.id + seed);
            return hashA - hashB;
        });
        return shuffled.slice(0, 10);
    }

    /**
     * 文字列をハッシュ値に変換（Java String.hashCode()互換）
     * デイリーチャレンジの決定論的シャッフルに使用
     * @param {string} str - ハッシュ化する文字列
     * @returns {number} ハッシュ値
     */
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastPlay = this.stats.lastPlayDate;

        if (lastPlay === today) {
            return; // すでに今日プレイ済み
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (lastPlay === yesterdayStr) {
            this.stats.dailyStreak++;
        } else if (lastPlay !== today) {
            this.stats.dailyStreak = 1;
        }

        this.stats.lastPlayDate = today;
        this.saveStats();
    }

    /**
     * バッジ・実績の達成条件をチェック
     * 新しく達成したバッジを配列で返す
     * @returns {Array} 新しく獲得したバッジの配列
     */
    checkAchievements() {
        const newAchievements = [];
        const progress = JSON.parse(localStorage.getItem('huntingProgress')) || this.initProgress();

        // 初回プレイ
        if (this.stats.totalGames === 1 && !this.stats.achievements.includes('first_game')) {
            newAchievements.push({
                id: 'first_game',
                name: '初陣',
                icon: '🎯'
            });
        }

        // 満点
        if (this.correctCount === this.currentQuestions.length && !this.stats.achievements.includes('perfect')) {
            newAchievements.push({
                id: 'perfect',
                name: '完璧',
                icon: '💯'
            });
        }

        // コンボマスター
        if (this.maxCombo >= 10 && !this.stats.achievements.includes('combo_master')) {
            newAchievements.push({
                id: 'combo_master',
                name: 'コンボマスター',
                icon: '🔥'
            });
        }

        // 100問達成
        if (this.stats.totalQuestions >= 100 && !this.stats.achievements.includes('hundred')) {
            newAchievements.push({
                id: 'hundred',
                name: '百戦錬磨',
                icon: '⚔️'
            });
        }

        // 連続7日
        if (this.stats.dailyStreak >= 7 && !this.stats.achievements.includes('week_streak')) {
            newAchievements.push({
                id: 'week_streak',
                name: '一週間戦士',
                icon: '📅'
            });
        }

        // スピードマスター（5問を30秒以内）
        const timeElapsed = (Date.now() - this.startTime) / 1000;
        if (this.currentQuestions.length === 5 && timeElapsed <= 30 &&
            this.correctCount === 5 && !this.stats.achievements.includes('speed_master')) {
            newAchievements.push({
                id: 'speed_master',
                name: '光速ハンター',
                icon: '⚡'
            });
        }

        // 連続3日ログイン
        if (this.stats.dailyStreak >= 3 && !this.stats.achievements.includes('three_day_streak')) {
            newAchievements.push({
                id: 'three_day_streak',
                name: '三日坊主克服',
                icon: '🌅'
            });
        }

        // 連続30日ログイン
        if (this.stats.dailyStreak >= 30 && !this.stats.achievements.includes('month_streak')) {
            newAchievements.push({
                id: 'month_streak',
                name: '一ヶ月戦士',
                icon: '📆'
            });
        }

        // カテゴリマスター（各カテゴリで90%以上）
        const categoryMastery = this.checkCategoryMastery(progress.categories);
        categoryMastery.forEach(cat => {
            const achievementId = `category_master_${cat}`;
            if (!this.stats.achievements.includes(achievementId)) {
                newAchievements.push({
                    id: achievementId,
                    name: `${this.getCategoryName(cat)}マスター`,
                    icon: '🎓'
                });
            }
        });

        // 完璧主義者（全問正解を10回達成）
        const perfectCount = (progress.quizHistory || []).filter(h => h.correctCount === h.totalQuestions).length;
        if (perfectCount >= 10 && !this.stats.achievements.includes('perfectionist')) {
            newAchievements.push({
                id: 'perfectionist',
                name: '完璧主義者',
                icon: '💎'
            });
        }

        // 夜型ハンター（22時〜翌6時に100問解答）
        const nightAnswers = this.countTimeRangeAnswers(progress.quizHistory, 22, 6);
        if (nightAnswers >= 100 && !this.stats.achievements.includes('night_owl')) {
            newAchievements.push({
                id: 'night_owl',
                name: '夜型ハンター',
                icon: '🦉'
            });
        }

        // 朝型ハンター（5時〜8時に100問解答）
        const morningAnswers = this.countTimeRangeAnswers(progress.quizHistory, 5, 8);
        if (morningAnswers >= 100 && !this.stats.achievements.includes('early_bird')) {
            newAchievements.push({
                id: 'early_bird',
                name: '朝型ハンター',
                icon: '🌄'
            });
        }

        // タイムアタックマスター（30問を3分以内）
        if (this.currentQuestions.length === 30 && timeElapsed <= 180 &&
            this.correctCount === 30 && !this.stats.achievements.includes('time_attack_master')) {
            newAchievements.push({
                id: 'time_attack_master',
                name: 'タイムアタックマスター',
                icon: '⏱️'
            });
        }

        // サバイバルキング（サバイバルで50問以上）
        if (this.currentMode === 'survival' && this.correctCount >= 50 &&
            !this.stats.achievements.includes('survival_king')) {
            newAchievements.push({
                id: 'survival_king',
                name: 'サバイバルキング',
                icon: '👑'
            });
        }

        // 500問達成
        if (this.stats.totalQuestions >= 500 && !this.stats.achievements.includes('five_hundred')) {
            newAchievements.push({
                id: 'five_hundred',
                name: '千里の道も一歩から',
                icon: '🏔️'
            });
        }

        // 1000問達成
        if (this.stats.totalQuestions >= 1000 && !this.stats.achievements.includes('thousand')) {
            newAchievements.push({
                id: 'thousand',
                name: '千問達成',
                icon: '🌟'
            });
        }

        // 実績を保存
        newAchievements.forEach(ach => {
            if (!this.stats.achievements.includes(ach.id)) {
                this.stats.achievements.push(ach.id);
            }
        });

        return newAchievements;
    }

    /**
     * カテゴリごとの習熟度をチェック
     */
    checkCategoryMastery(categories) {
        const mastered = [];
        Object.entries(categories).forEach(([key, data]) => {
            if (data.total >= 20 && data.correct / data.total >= 0.9) {
                mastered.push(key);
            }
        });
        return mastered;
    }

    /**
     * カテゴリ名を取得
     */
    getCategoryName(categoryKey) {
        const names = {
            'law': '法令',
            'tools': '猟具',
            'animals': '鳥獣',
            'management': '鳥獣保護管理',
            'practical': '実技'
        };
        return names[categoryKey] || categoryKey;
    }

    /**
     * 特定時間帯の解答数をカウント
     */
    countTimeRangeAnswers(history, startHour, endHour) {
        let count = 0;
        (history || []).forEach(entry => {
            const hour = new Date(entry.date).getHours();
            const inRange = endHour > startHour
                ? (hour >= startHour && hour < endHour)
                : (hour >= startHour || hour < endHour);
            if (inRange) {
                count += entry.totalQuestions || 0;
            }
        });
        return count;
    }

    updateRank() {
        const total = this.stats.totalCorrect;
        if (total >= 500) this.stats.rank = '伝説の師範';
        else if (total >= 300) this.stats.rank = '師範代';
        else if (total >= 200) this.stats.rank = 'ベテランハンター';
        else if (total >= 100) this.stats.rank = '一人前ハンター';
        else if (total >= 50) this.stats.rank = '見習いハンター';
        else this.stats.rank = '新米ハンター';
    }

    /**
     * ランキングデータを取得
     * 週間・月間・全期間のランキングとスコア履歴を返す
     */
    getLeaderboardData() {
        const progress = JSON.parse(localStorage.getItem('huntingProgress')) || this.initProgress();
        const history = progress.quizHistory || [];

        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const weeklyEntries = history
            .filter(h => new Date(h.date) >= weekAgo)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(h => ({
                score: h.score,
                date: new Date(h.date).toLocaleDateString('ja-JP')
            }));

        const monthlyEntries = history
            .filter(h => new Date(h.date) >= monthAgo)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(h => ({
                score: h.score,
                date: new Date(h.date).toLocaleDateString('ja-JP')
            }));

        return {
            weekly: weeklyEntries,
            monthly: monthlyEntries,
            history: history.map(h => ({
                score: h.score,
                date: new Date(h.date).toLocaleDateString('ja-JP')
            }))
        };
    }

    /**
     * ゲーム進捗を統一データ構造に保存
     * @param {Array} questions - 出題された問題
     * @param {number} correctCount - 正解数
     * @param {number} incorrectCount - 不正解数
     * @param {number} timeSpent - 所要時間（ミリ秒）
     */
    saveGameProgress(questions, correctCount, incorrectCount, timeSpent) {
        const progress = JSON.parse(localStorage.getItem('huntingProgress')) || this.initProgress();

        // カテゴリ別進捗を更新
        const categoryMap = {
            '法令': 'law',
            '猟具': 'tools',
            '鳥獣': 'animals',
            '鳥獣保護管理': 'management',
            '実技': 'practical'
        };

        questions.forEach((question, index) => {
            const category = categoryMap[question.category] || 'law';
            const isCorrect = index < correctCount; // 仮の判定（実際は回答状況を見る必要あり）

            if (!progress.categories[category]) {
                progress.categories[category] = { correct: 0, total: 0 };
            }
            progress.categories[category].total++;
        });

        // 学習履歴に追加
        progress.quizHistory.push({
            date: new Date().toISOString(),
            type: 'game',
            mode: this.currentMode,
            score: this.score,
            correctCount: correctCount,
            totalQuestions: questions.length,
            timeSpent: Math.floor(timeSpent / 1000), // 秒に変換
            maxCombo: this.maxCombo
        });

        // 履歴は最新30件まで
        if (progress.quizHistory.length > 30) {
            progress.quizHistory = progress.quizHistory.slice(-30);
        }

        progress.studyTime += Math.floor(timeSpent / 1000);
        progress.lastStudyDate = new Date().toISOString();

        localStorage.setItem('huntingProgress', JSON.stringify(progress));
    }
}

// UI管理
class UIManager {
    constructor(gameManager) {
        this.game = gameManager;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', () => {
                const mode = card.dataset.mode;
                this.startMode(mode);
            });
        });
    }

    startMode(mode) {
        this.game.currentMode = mode;
        document.getElementById('modeSelection').style.display = 'none';
        const gameArea = document.getElementById('gameArea');
        gameArea.style.display = 'block';

        switch (mode) {
            case 'quickMatch':
                this.startQuickMatch();
                break;
            case 'flashcard':
                this.startFlashcard();
                break;
            case 'daily':
                this.startDailyChallenge();
                break;
            case 'timeAttack':
                this.startTimeAttack();
                break;
            case 'survival':
                this.startSurvival();
                break;
            case 'expert':
                this.startExpert();
                break;
            case 'leaderboard':
                this.showLeaderboard();
                break;
            case 'achievements':
                this.showAchievements();
                break;
        }
    }

    startQuickMatch() {
        this.game.currentQuestions = this.game.getRandomQuestions(5);
        this.game.currentIndex = 0;
        this.game.score = 0;
        this.game.combo = 0;
        this.game.maxCombo = 0;
        this.game.correctCount = 0;
        this.game.incorrectCount = 0;
        this.game.startTime = Date.now();

        // Quality Guardian追加: タイマー開始
        this.game.timeTracker.start();

        // 進捗バー表示
        const progressBar = document.getElementById('quizProgressBar');
        if (progressBar) progressBar.style.display = 'block';

        this.showQuestion();
    }

    startDailyChallenge() {
        this.game.currentQuestions = this.game.getDailyQuestions();
        this.game.currentIndex = 0;
        this.game.score = 0;
        this.game.combo = 0;
        this.game.maxCombo = 0;
        this.game.correctCount = 0;
        this.game.incorrectCount = 0;
        this.game.startTime = Date.now();

        // Quality Guardian追加: タイマー開始
        this.game.timeTracker.start();

        // 進捗バー表示
        const progressBar = document.getElementById('quizProgressBar');
        if (progressBar) progressBar.style.display = 'block';

        this.showDailyChallengeHeader();
        this.showQuestion();
    }

    showDailyChallengeHeader() {
        const header = `
            <div class="daily-challenge">
                <div class="challenge-header">
                    <div class="challenge-title">📅 今日のチャレンジ</div>
                    <div class="challenge-streak">🔥 ${this.game.stats.dailyStreak}日連続</div>
                </div>
                <div class="challenge-progress">
                    <div class="challenge-progress-bar" style="width: 0%" id="dailyProgress">0/10</div>
                </div>
            </div>
        `;
        document.getElementById('gameArea').innerHTML = header + document.getElementById('gameArea').innerHTML;
    }

    showQuestion() {
        const question = this.game.currentQuestions[this.game.currentIndex];
        const questionNumber = this.game.currentIndex + 1;
        const totalQuestions = this.game.currentQuestions.length;

        // 進捗バー更新（Quality Guardian追加）
        const progressFill = document.getElementById('quizProgressFill');
        if (progressFill) {
            const progress = (questionNumber / totalQuestions) * 100;
            progressFill.style.width = `${progress}%`;
        }

        // 進捗バーのラベル更新
        const currentQuestionEl = document.getElementById('current-question');
        const totalQuestionsEl = document.getElementById('total-questions');
        if (currentQuestionEl) currentQuestionEl.textContent = questionNumber;
        if (totalQuestionsEl) totalQuestionsEl.textContent = totalQuestions;

        const html = `
            <button class="back-btn" onclick="ui.backToMenu()">← メニューに戻る</button>

            <!-- Quality Guardian追加: 時間トラッカー -->
            <div class="time-tracker-bar">
                <div class="time-tracker-item">
                    <span class="time-tracker-label">経過時間</span>
                    <span class="time-tracker-value" id="elapsed-time-display" role="timer" aria-live="polite">00:00</span>
                </div>
                <div class="time-tracker-item">
                    <span class="time-tracker-label">問題番号</span>
                    <span class="time-tracker-value">${questionNumber}/${totalQuestions}</span>
                </div>
            </div>
            <div id="time-alert-container"></div>

            <div class="rank-display">
                <div class="rank-title">現在の称号</div>
                <div class="rank-name">${this.game.stats.rank}</div>
            </div>

            <div class="game-header">
                <div class="stat">
                    <span class="stat-value">${questionNumber}/${totalQuestions}</span>
                    <span class="stat-label">問題</span>
                </div>
                ${this.game.combo > 0 ? `<div class="combo">🔥 ${this.game.combo} COMBO!</div>` : '<div></div>'}
                <div class="stat">
                    <span class="stat-value">${this.game.score}</span>
                    <span class="stat-label">スコア</span>
                </div>
            </div>

            <div class="question-card">
                <div class="question-number">${question.category} - ${question.difficulty}</div>
                <div class="question-text">${question.question}</div>
                <div class="choices">
                    ${question.choices.map((choice, index) => `
                        <div class="choice" data-index="${index}">${choice}</div>
                    `).join('')}
                </div>
                <div class="explanation">
                    ${question.explanation}
                </div>
                <button class="next-btn">次の問題へ →</button>
            </div>
        `;

        const gameArea = document.getElementById('gameArea');
        if (this.game.currentMode === 'daily') {
            gameArea.innerHTML = gameArea.innerHTML.split('<button class="back-btn"')[0] + html;
            this.updateDailyProgress();
        } else {
            gameArea.innerHTML = html;
        }

        this.setupQuestionListeners();
    }

    setupQuestionListeners() {
        document.querySelectorAll('.choice').forEach(choice => {
            choice.addEventListener('click', (e) => {
                if (e.target.classList.contains('correct') || e.target.classList.contains('incorrect')) {
                    return;
                }
                this.handleAnswer(parseInt(e.target.dataset.index));
            });
        });

        document.querySelector('.next-btn').addEventListener('click', () => {
            this.nextQuestion();
        });
    }

    handleAnswer(selectedIndex) {
        const question = this.game.currentQuestions[this.game.currentIndex];
        const isCorrect = selectedIndex === question.answer;
        const choices = document.querySelectorAll('.choice');

        // 選択肢を無効化
        choices.forEach(choice => {
            choice.style.pointerEvents = 'none';
        });

        if (isCorrect) {
            choices[selectedIndex].classList.add('correct');
            this.game.correctCount++;
            this.game.combo++;
            this.game.maxCombo = Math.max(this.game.maxCombo, this.game.combo);

            // コンボボーナス
            const baseScore = 100;
            const comboBonus = Math.min(this.game.combo * 10, 100);
            this.game.score += baseScore + comboBonus;

            // パーティクルエフェクト
            this.showParticles('✨', selectedIndex === question.answer);

            // 効果音的なフィードバック（テキスト）
            if (this.game.combo >= 5) {
                this.showParticles('🔥', true);
            }

            // トースト通知（UX Enhancement）
            if (typeof window.UXEnhancements !== 'undefined') {
                const message = this.getComboMessage(this.game.combo);
                window.UXEnhancements.showToast(message, 'success', 2000);
            }

            // サバイバルモードの場合、ヘッダーを更新
            if (this.survivalMode) {
                const streakEl = document.querySelector('.challenge-streak');
                if (streakEl) {
                    streakEl.textContent = `🔥 ${this.game.correctCount}問連続`;
                }
            }
        } else {
            choices[selectedIndex].classList.add('incorrect');
            choices[question.answer].classList.add('correct');
            this.game.incorrectCount++;
            this.game.combo = 0;
            this.showParticles('💔', false);

            // トースト通知（UX Enhancement）
            if (typeof window.UXEnhancements !== 'undefined') {
                const message = this.getEncouragementMessage();
                window.UXEnhancements.showToast(message, 'error', 2000);
            }

            // サバイバルモードの場合、即座にゲームオーバー
            if (this.survivalMode) {
                setTimeout(() => {
                    this.survivalMode = false;
                    this.showResult();
                }, 2000);
                return;
            }
        }

        // 解説を表示
        document.querySelector('.explanation').classList.add('show');
        document.querySelector('.next-btn').classList.add('show');

        // ヘッダーを更新
        this.updateHeader();
    }

    updateHeader() {
        const header = document.querySelector('.game-header');
        if (header) {
            const comboDiv = header.querySelector('.combo') || header.children[1];
            if (this.game.combo > 0) {
                comboDiv.outerHTML = `<div class="combo">🔥 ${this.game.combo} COMBO!</div>`;
            } else {
                comboDiv.outerHTML = '<div></div>';
            }

            const scoreDiv = header.querySelector('.stat:last-child .stat-value');
            scoreDiv.textContent = this.game.score;
        }
    }

    updateDailyProgress() {
        const progressBar = document.getElementById('dailyProgress');
        if (progressBar) {
            const progress = (this.game.currentIndex / this.game.currentQuestions.length) * 100;
            progressBar.style.width = `${progress}%`;
            progressBar.textContent = `${this.game.currentIndex}/${this.game.currentQuestions.length}`;
        }
    }

    showParticles(emoji, isPositive) {
        const particles = document.getElementById('particles');
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.textContent = emoji;
                particle.style.left = Math.random() * window.innerWidth + 'px';
                particle.style.top = window.innerHeight / 2 + 'px';
                particles.appendChild(particle);

                setTimeout(() => particle.remove(), 2000);
            }, i * 100);
        }
    }

    nextQuestion() {
        this.game.currentIndex++;

        if (this.game.currentIndex < this.game.currentQuestions.length) {
            // サバイバルモードはハンドル済みなのでスキップ
            if (this.survivalMode) {
                this.showQuestion();
            } else if (this.expertMode) {
                this.showExpertQuestion();
            } else {
                this.showQuestion();
            }
        } else {
            // タイムアタックのタイマーを停止
            if (this.timeAttackMode) {
                this.stopTimeAttackTimer();
            }
            this.showResult();
        }
    }

    showResult() {
        // Quality Guardian追加: タイマー停止
        this.game.timeTracker.stop();

        // 進捗バー非表示
        const progressBar = document.getElementById('quizProgressBar');
        if (progressBar) progressBar.style.display = 'none';

        // 統計を更新
        this.game.stats.totalGames++;
        this.game.stats.totalQuestions += this.game.currentQuestions.length;
        this.game.stats.totalCorrect += this.game.correctCount;
        this.game.stats.bestScore = Math.max(this.game.stats.bestScore, this.game.score);
        this.game.stats.maxCombo = Math.max(this.game.stats.maxCombo, this.game.maxCombo);

        if (this.game.currentMode === 'daily') {
            this.game.updateStreak();
        }

        this.game.updateRank();

        // 実績チェック
        const newAchievements = this.game.checkAchievements();

        // カテゴリ別進捗と学習履歴を更新
        this.game.saveGameProgress(
            this.game.currentQuestions,
            this.game.correctCount,
            this.game.incorrectCount,
            Date.now() - this.game.startTime
        );

        this.game.saveStats();

        // Quality Guardian追加: セッション履歴を保存
        this.game.saveSessionHistory({
            totalQuestions: this.game.currentQuestions.length,
            correctCount: this.game.correctCount,
            incorrectCount: this.game.incorrectCount,
            elapsedSeconds: this.game.timeTracker.elapsedSeconds,
            score: this.game.score,
            maxCombo: this.game.maxCombo
        });

        // リザルト画面
        const accuracy = Math.round((this.game.correctCount / this.game.currentQuestions.length) * 100);
        const timeElapsed = Math.round((Date.now() - this.game.startTime) / 1000);
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        const timeDisplay = minutes > 0
            ? `${minutes}分${String(seconds).padStart(2, '0')}秒`
            : `${timeElapsed}秒`;

        let message = '';
        let modeSpecificMessage = '';

        // モード別メッセージ
        if (this.game.currentMode === 'survival') {
            modeSpecificMessage = `💀 サバイバルモード: ${this.game.correctCount}問連続正解！`;
            if (this.game.correctCount >= 50) message = '伝説の記録です！🏆';
            else if (this.game.correctCount >= 30) message = 'すごい！よく耐えました！👏';
            else if (this.game.correctCount >= 10) message = 'いい記録です！👍';
            else message = '次は更に伸ばそう！💪';
        } else if (this.game.currentMode === 'timeAttack') {
            modeSpecificMessage = `⏱️ タイムアタック: ${timeDisplay}で完了`;
            if (timeElapsed <= 180) message = '光速の早業！🎉';
            else if (timeElapsed <= 300) message = '素晴らしいタイム！👏';
            else message = '次はもっと速く！💪';
        } else if (this.game.currentMode === 'expert') {
            modeSpecificMessage = `👑 エキスパートモード`;
            if (accuracy === 100) message = 'エキスパート認定！🎉';
            else if (accuracy >= 80) message = '上級者の実力！👏';
            else message = '難問に挑戦ありがとう！💪';
        } else {
            if (accuracy === 100) message = '完璧です！🎉';
            else if (accuracy >= 80) message = '素晴らしい！👏';
            else if (accuracy >= 60) message = 'いい調子！👍';
            else message = 'もう一度挑戦！💪';
        }

        const html = `
            <div class="result-card">
                <h2>📊 結果発表</h2>
                ${modeSpecificMessage ? `<div style="font-size: 1.1rem; margin: 10px 0; color: #667eea; font-weight: bold;">${modeSpecificMessage}</div>` : ''}
                <div class="result-score">${this.game.score}</div>
                <div class="result-message">${message}</div>

                <div class="result-stats">
                    <div class="result-stat">
                        <div class="result-stat-value">${accuracy}%</div>
                        <div class="result-stat-label">正答率</div>
                    </div>
                    <div class="result-stat">
                        <div class="result-stat-value">${this.game.maxCombo}</div>
                        <div class="result-stat-label">最大コンボ</div>
                    </div>
                    <div class="result-stat">
                        <div class="result-stat-value">${timeDisplay}</div>
                        <div class="result-stat-label">所要時間</div>
                    </div>
                </div>

                <div class="result-stats">
                    <div class="result-stat">
                        <div class="result-stat-value">${this.game.correctCount}</div>
                        <div class="result-stat-label">正解</div>
                    </div>
                    <div class="result-stat">
                        <div class="result-stat-value">${this.game.incorrectCount}</div>
                        <div class="result-stat-label">不正解</div>
                    </div>
                    <div class="result-stat">
                        <div class="result-stat-value">${this.game.currentQuestions.length}</div>
                        <div class="result-stat-label">総問題数</div>
                    </div>
                </div>

                ${(() => {
                    const summary = this.game.timeTracker.getSummary(this.game.currentQuestions.length);
                    return `
                        <div class="result-time-summary">
                            <p>所要時間: <strong>${summary.timeDisplay}</strong></p>
                            <p>平均速度: <strong>${summary.avgDisplay}</strong></p>
                            <p class="time-feedback">${summary.feedback}</p>
                        </div>
                    `;
                })()}

                ${newAchievements.length > 0 ? `
                    <div style="margin: 30px 0; padding: 20px; background: #fff3cd; border-radius: 10px; color: #333;">
                        <h3>🏆 新しい実績を獲得！</h3>
                        <div style="display: flex; gap: 15px; justify-content: center; margin-top: 15px; flex-wrap: wrap;">
                            ${newAchievements.map(ach => `
                                <div style="text-align: center;">
                                    <div style="font-size: 3rem;">${ach.icon}</div>
                                    <div style="font-weight: bold; margin-top: 5px;">${ach.name}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="action-buttons">
                    <button class="action-btn btn-primary" onclick="ui.startMode('${this.game.currentMode}')">
                        もう1回！
                    </button>
                    <button class="action-btn btn-secondary" onclick="ui.backToMenu()">
                        メニューへ
                    </button>
                </div>
            </div>
        `;

        document.getElementById('gameArea').innerHTML = html;

        // 成功エフェクト
        if (accuracy >= 80 || this.game.currentMode === 'survival' && this.game.correctCount >= 30) {
            this.showParticles('🎉', true);
        }

        // モードフラグをリセット
        this.timeAttackMode = false;
        this.survivalMode = false;
        this.expertMode = false;
    }

    startFlashcard() {
        this.game.currentQuestions = this.game.getRandomQuestions(20);
        this.game.currentIndex = 0;
        this.knownCards = [];
        this.unknownCards = [];
        this.showFlashcard();
    }

    showFlashcard() {
        if (this.game.currentIndex >= this.game.currentQuestions.length) {
            this.showFlashcardResult();
            return;
        }

        const question = this.game.currentQuestions[this.game.currentIndex];
        const remaining = this.game.currentQuestions.length - this.game.currentIndex;

        const html = `
            <button class="back-btn" onclick="ui.backToMenu()">← メニューに戻る</button>

            <div class="game-header">
                <div class="stat">
                    <span class="stat-value">${remaining}</span>
                    <span class="stat-label">残り</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${this.knownCards.length}</span>
                    <span class="stat-label">覚えた</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${this.unknownCards.length}</span>
                    <span class="stat-label">復習必要</span>
                </div>
            </div>

            <div class="question-card">
                <p style="text-align: center; margin-bottom: 20px; color: #666;">
                    タップして答えを表示
                </p>
                <div class="flashcard" id="flashcard">
                    <div class="flashcard-front">
                        <div class="flashcard-image">${this.getCategoryIcon(question.category)}</div>
                        <div class="flashcard-question">${question.question}</div>
                    </div>
                    <div class="flashcard-back">
                        <div class="flashcard-answer">${question.choices[question.answer]}</div>
                        <div style="font-size: 0.9rem; color: #666; margin-top: 10px;">
                            ${question.explanation}
                        </div>
                        <div class="flashcard-buttons">
                            <button class="flashcard-btn btn-dont-know" onclick="ui.markUnknown()">
                                まだ覚えてない
                            </button>
                            <button class="flashcard-btn btn-know" onclick="ui.markKnown()">
                                覚えた！
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('gameArea').innerHTML = html;

        document.getElementById('flashcard').addEventListener('click', function() {
            if (!this.classList.contains('flipped')) {
                this.classList.add('flipped');
            }
        });
    }

    getCategoryIcon(category) {
        const icons = {
            '法令': '📜',
            '猟具': '🔫',
            '鳥獣': '🦌',
            '鳥獣保護管理': '🌳',
            '実技': '✋'
        };
        return icons[category] || '📝';
    }

    markKnown() {
        const question = this.game.currentQuestions[this.game.currentIndex];
        this.knownCards.push(question);
        this.game.currentIndex++;
        this.showParticles('✅', true);
        setTimeout(() => this.showFlashcard(), 300);
    }

    markUnknown() {
        const question = this.game.currentQuestions[this.game.currentIndex];
        this.unknownCards.push(question);
        this.game.currentIndex++;
        this.showParticles('📝', false);
        setTimeout(() => this.showFlashcard(), 300);
    }

    showFlashcardResult() {
        const total = this.game.currentQuestions.length;
        const knownPercent = Math.round((this.knownCards.length / total) * 100);

        const html = `
            <div class="result-card">
                <h2>🃏 フラッシュカード完了</h2>
                <div class="result-score">${knownPercent}%</div>
                <div class="result-message">覚えています！</div>

                <div class="result-stats">
                    <div class="result-stat">
                        <div class="result-stat-value">${this.knownCards.length}</div>
                        <div class="result-stat-label">覚えた</div>
                    </div>
                    <div class="result-stat">
                        <div class="result-stat-value">${this.unknownCards.length}</div>
                        <div class="result-stat-label">復習必要</div>
                    </div>
                    <div class="result-stat">
                        <div class="result-stat-value">${total}</div>
                        <div class="result-stat-label">総問題数</div>
                    </div>
                </div>

                ${this.unknownCards.length > 0 ? `
                    <div style="margin: 30px 0; padding: 20px; background: #f8d7da; border-radius: 10px; color: #333;">
                        <h3>📝 復習が必要な分野</h3>
                        <div style="margin-top: 10px;">
                            ${this.getReviewCategories()}
                        </div>
                    </div>
                ` : ''}

                <div class="action-buttons">
                    ${this.unknownCards.length > 0 ? `
                        <button class="action-btn btn-primary" onclick="ui.reviewUnknown()">
                            復習する
                        </button>
                    ` : ''}
                    <button class="action-btn btn-primary" onclick="ui.startMode('flashcard')">
                        もう1回
                    </button>
                    <button class="action-btn btn-secondary" onclick="ui.backToMenu()">
                        メニューへ
                    </button>
                </div>
            </div>
        `;

        document.getElementById('gameArea').innerHTML = html;
    }

    getReviewCategories() {
        const categories = {};
        this.unknownCards.forEach(q => {
            categories[q.category] = (categories[q.category] || 0) + 1;
        });

        return Object.entries(categories)
            .map(([cat, count]) => `<span style="display: inline-block; margin: 5px; padding: 8px 15px; background: white; border-radius: 20px; font-weight: bold;">${cat}: ${count}問</span>`)
            .join('');
    }

    reviewUnknown() {
        this.game.currentQuestions = this.unknownCards;
        this.game.currentIndex = 0;
        this.knownCards = [];
        this.unknownCards = [];
        this.showFlashcard();
    }

    // タイムアタックモード
    startTimeAttack() {
        this.game.currentQuestions = this.game.getRandomQuestions(30);
        this.game.currentIndex = 0;
        this.game.score = 0;
        this.game.combo = 0;
        this.game.maxCombo = 0;
        this.game.correctCount = 0;
        this.game.incorrectCount = 0;
        this.game.startTime = Date.now();
        this.timeAttackMode = true;

        this.showTimeAttackHeader();
        this.showQuestion();
        this.startTimeAttackTimer();
    }

    showTimeAttackHeader() {
        const header = `
            <div class="daily-challenge">
                <div class="challenge-header">
                    <div class="challenge-title">⏱️ タイムアタック</div>
                    <div class="challenge-streak" id="timeAttackTimer">00:00</div>
                </div>
                <div class="challenge-progress">
                    <div class="challenge-progress-bar" style="width: 0%" id="timeAttackProgress">0/30</div>
                </div>
            </div>
        `;
        document.getElementById('gameArea').innerHTML = header + document.getElementById('gameArea').innerHTML;
    }

    startTimeAttackTimer() {
        this.timeAttackInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.game.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            const timerEl = document.getElementById('timeAttackTimer');
            if (timerEl) {
                timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }

            const progressBar = document.getElementById('timeAttackProgress');
            if (progressBar) {
                const progress = (this.game.currentIndex / this.game.currentQuestions.length) * 100;
                progressBar.style.width = `${progress}%`;
                progressBar.textContent = `${this.game.currentIndex}/${this.game.currentQuestions.length}`;
            }
        }, 100);
    }

    stopTimeAttackTimer() {
        if (this.timeAttackInterval) {
            clearInterval(this.timeAttackInterval);
            this.timeAttackInterval = null;
        }
    }

    // サバイバルモード
    startSurvival() {
        this.game.currentQuestions = this.game.getRandomQuestions(100); // 最大100問用意
        this.game.currentIndex = 0;
        this.game.score = 0;
        this.game.combo = 0;
        this.game.maxCombo = 0;
        this.game.correctCount = 0;
        this.game.incorrectCount = 0;
        this.game.startTime = Date.now();
        this.survivalMode = true;

        this.showSurvivalHeader();
        this.showQuestion();
    }

    showSurvivalHeader() {
        const header = `
            <div class="daily-challenge">
                <div class="challenge-header">
                    <div class="challenge-title">💀 サバイバル</div>
                    <div class="challenge-streak">🔥 ${this.game.correctCount}問連続</div>
                </div>
                <div style="text-align: center; padding: 10px; font-size: 0.9rem; opacity: 0.9;">
                    一度でも間違えたらゲームオーバー
                </div>
            </div>
        `;
        document.getElementById('gameArea').innerHTML = header + document.getElementById('gameArea').innerHTML;
    }

    // エキスパートモード
    startExpert() {
        // 難易度「上級」の問題のみを抽出
        const expertQuestions = this.game.quizData.quizzes.filter(q => q.difficulty === '上級');
        this.game.currentQuestions = expertQuestions.sort(() => Math.random() - 0.5).slice(0, 20);
        this.game.currentIndex = 0;
        this.game.score = 0;
        this.game.combo = 0;
        this.game.maxCombo = 0;
        this.game.correctCount = 0;
        this.game.incorrectCount = 0;
        this.game.startTime = Date.now();
        this.expertMode = true;

        this.showExpertHeader();
        this.showExpertQuestion();
    }

    showExpertHeader() {
        const header = `
            <div class="daily-challenge">
                <div class="challenge-header">
                    <div class="challenge-title">👑 エキスパートモード</div>
                    <div class="challenge-streak">難問のみ</div>
                </div>
                <div style="text-align: center; padding: 10px; font-size: 0.9rem; opacity: 0.9;">
                    解説なし・上級問題のみ
                </div>
            </div>
        `;
        document.getElementById('gameArea').innerHTML = header + document.getElementById('gameArea').innerHTML;
    }

    showExpertQuestion() {
        const question = this.game.currentQuestions[this.game.currentIndex];
        const questionNumber = this.game.currentIndex + 1;
        const totalQuestions = this.game.currentQuestions.length;

        const html = `
            <button class="back-btn" onclick="ui.backToMenu()">← メニューに戻る</button>

            <div class="rank-display">
                <div class="rank-title">現在の称号</div>
                <div class="rank-name">${this.game.stats.rank}</div>
            </div>

            <div class="game-header">
                <div class="stat">
                    <span class="stat-value">${questionNumber}/${totalQuestions}</span>
                    <span class="stat-label">問題</span>
                </div>
                ${this.game.combo > 0 ? `<div class="combo">🔥 ${this.game.combo} COMBO!</div>` : '<div></div>'}
                <div class="stat">
                    <span class="stat-value">${this.game.score}</span>
                    <span class="stat-label">スコア</span>
                </div>
            </div>

            <div class="question-card">
                <div class="question-number">${question.category} - ${question.difficulty}</div>
                <div class="question-text">${question.question}</div>
                <div class="choices">
                    ${question.choices.map((choice, index) => `
                        <div class="choice" data-index="${index}">${choice}</div>
                    `).join('')}
                </div>
                <button class="next-btn">次の問題へ →</button>
            </div>
        `;

        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = gameArea.innerHTML.split('<button class="back-btn"')[0] + html;

        this.setupExpertQuestionListeners();
    }

    setupExpertQuestionListeners() {
        document.querySelectorAll('.choice').forEach(choice => {
            choice.addEventListener('click', (e) => {
                if (e.target.classList.contains('correct') || e.target.classList.contains('incorrect')) {
                    return;
                }
                this.handleExpertAnswer(parseInt(e.target.dataset.index));
            });
        });

        document.querySelector('.next-btn').addEventListener('click', () => {
            this.nextExpertQuestion();
        });
    }

    handleExpertAnswer(selectedIndex) {
        const question = this.game.currentQuestions[this.game.currentIndex];
        const isCorrect = selectedIndex === question.answer;
        const choices = document.querySelectorAll('.choice');

        choices.forEach(choice => {
            choice.style.pointerEvents = 'none';
        });

        if (isCorrect) {
            choices[selectedIndex].classList.add('correct');
            this.game.correctCount++;
            this.game.combo++;
            this.game.maxCombo = Math.max(this.game.maxCombo, this.game.combo);

            const baseScore = 200; // エキスパートは高得点
            const comboBonus = Math.min(this.game.combo * 20, 200);
            this.game.score += baseScore + comboBonus;

            this.showParticles('✨', true);

            if (typeof window.UXEnhancements !== 'undefined') {
                window.UXEnhancements.showToast('正解！', 'success', 1500);
            }
        } else {
            choices[selectedIndex].classList.add('incorrect');
            choices[question.answer].classList.add('correct');
            this.game.incorrectCount++;
            this.game.combo = 0;
            this.showParticles('💔', false);

            if (typeof window.UXEnhancements !== 'undefined') {
                window.UXEnhancements.showToast('不正解', 'error', 1500);
            }
        }

        // エキスパートモードでは解説なし
        document.querySelector('.next-btn').classList.add('show');
        this.updateHeader();
    }

    nextExpertQuestion() {
        this.game.currentIndex++;

        if (this.game.currentIndex < this.game.currentQuestions.length) {
            this.showExpertQuestion();
        } else {
            this.showResult();
        }
    }

    // ランキング表示
    showLeaderboard() {
        const leaderboardData = this.game.getLeaderboardData();

        const html = `
            <button class="back-btn" onclick="ui.backToMenu()">← メニューに戻る</button>

            <div class="rank-display">
                <div class="rank-title">📊 ランキング</div>
            </div>

            <div class="achievements">
                <h2 style="margin-bottom: 10px;">🏆 週間ランキング</h2>
                <div style="background: rgba(255,255,255,0.3); border-radius: 10px; padding: 20px;">
                    ${this.renderLeaderboardList(leaderboardData.weekly, '週')}
                </div>
            </div>

            <div class="achievements" style="margin-top: 20px;">
                <h2 style="margin-bottom: 10px;">📅 月間ランキング</h2>
                <div style="background: rgba(255,255,255,0.3); border-radius: 10px; padding: 20px;">
                    ${this.renderLeaderboardList(leaderboardData.monthly, '月')}
                </div>
            </div>

            <div class="achievements" style="margin-top: 20px;">
                <h2 style="margin-bottom: 10px;">📈 スコア推移</h2>
                <div style="background: rgba(255,255,255,0.3); border-radius: 10px; padding: 20px;">
                    ${this.renderScoreGraph(leaderboardData.history)}
                </div>
            </div>

            <div class="action-buttons" style="margin-top: 30px;">
                <button class="action-btn btn-secondary" onclick="ui.exportLeaderboard()">
                    データをエクスポート
                </button>
                <button class="action-btn btn-secondary" onclick="ui.importLeaderboard()">
                    データをインポート
                </button>
            </div>
        `;

        document.getElementById('gameArea').innerHTML = html;
    }

    renderLeaderboardList(entries, period) {
        if (entries.length === 0) {
            return `<p style="text-align: center; opacity: 0.7;">まだデータがありません</p>`;
        }

        return entries.map((entry, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}位`;
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.2); border-radius: 5px; margin-bottom: 10px;">
                    <div style="font-weight: bold; font-size: 1.2rem;">${medal}</div>
                    <div>
                        <div style="font-weight: bold;">${entry.score}点</div>
                        <div style="font-size: 0.8rem; opacity: 0.8;">${entry.date}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderScoreGraph(history) {
        if (history.length === 0) {
            return `<p style="text-align: center; opacity: 0.7;">まだデータがありません</p>`;
        }

        const maxScore = Math.max(...history.map(h => h.score));

        return `
            <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 150px; gap: 5px;">
                ${history.slice(-10).map(entry => {
                    const height = (entry.score / maxScore) * 100;
                    return `
                        <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                            <div style="font-size: 0.7rem; margin-bottom: 5px;">${entry.score}</div>
                            <div style="width: 100%; background: linear-gradient(to top, #667eea, #764ba2); border-radius: 5px 5px 0 0; height: ${height}%;"></div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="margin-top: 10px; text-align: center; font-size: 0.8rem; opacity: 0.8;">
                最近10回のスコア推移
            </div>
        `;
    }

    exportLeaderboard() {
        const data = JSON.stringify(this.game.stats, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hunting-leaderboard-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        if (typeof window.UXEnhancements !== 'undefined') {
            window.UXEnhancements.showToast('データをエクスポートしました', 'success', 2000);
        }
    }

    importLeaderboard() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    // データをマージ
                    this.game.stats = { ...this.game.stats, ...data };
                    this.game.saveStats();
                    this.showLeaderboard();

                    if (typeof window.UXEnhancements !== 'undefined') {
                        window.UXEnhancements.showToast('データをインポートしました', 'success', 2000);
                    }
                } catch (error) {
                    if (typeof window.UXEnhancements !== 'undefined') {
                        window.UXEnhancements.showToast('データの読み込みに失敗しました', 'error', 2000);
                    }
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    showAchievements() {
        const allAchievements = [
            { id: 'first_game', name: '初陣', icon: '🎯', desc: '初めてのゲーム' },
            { id: 'perfect', name: '完璧', icon: '💯', desc: '満点を取る' },
            { id: 'combo_master', name: 'コンボマスター', icon: '🔥', desc: '10連続正解' },
            { id: 'hundred', name: '百戦錬磨', icon: '⚔️', desc: '100問解答' },
            { id: 'five_hundred', name: '千里の道も一歩から', icon: '🏔️', desc: '500問解答' },
            { id: 'thousand', name: '千問達成', icon: '🌟', desc: '1000問解答' },
            { id: 'three_day_streak', name: '三日坊主克服', icon: '🌅', desc: '3日連続ログイン' },
            { id: 'week_streak', name: '一週間戦士', icon: '📅', desc: '7日連続ログイン' },
            { id: 'month_streak', name: '一ヶ月戦士', icon: '📆', desc: '30日連続ログイン' },
            { id: 'speed_master', name: '光速ハンター', icon: '⚡', desc: '5問を30秒以内' },
            { id: 'time_attack_master', name: 'タイムアタックマスター', icon: '⏱️', desc: '30問を3分以内' },
            { id: 'survival_king', name: 'サバイバルキング', icon: '👑', desc: 'サバイバルで50問以上' },
            { id: 'perfectionist', name: '完璧主義者', icon: '💎', desc: '全問正解を10回達成' },
            { id: 'category_master_law', name: '法令マスター', icon: '🎓', desc: '法令カテゴリで90%以上' },
            { id: 'category_master_tools', name: '猟具マスター', icon: '🎓', desc: '猟具カテゴリで90%以上' },
            { id: 'category_master_animals', name: '鳥獣マスター', icon: '🎓', desc: '鳥獣カテゴリで90%以上' },
            { id: 'category_master_management', name: '鳥獣保護管理マスター', icon: '🎓', desc: '鳥獣保護管理で90%以上' },
            { id: 'category_master_practical', name: '実技マスター', icon: '🎓', desc: '実技カテゴリで90%以上' },
            { id: 'night_owl', name: '夜型ハンター', icon: '🦉', desc: '夜間に100問解答' },
            { id: 'early_bird', name: '朝型ハンター', icon: '🌄', desc: '早朝に100問解答' }
        ];

        const html = `
            <button class="back-btn" onclick="ui.backToMenu()">← メニューに戻る</button>

            <div class="rank-display">
                <div class="rank-title">あなたの称号</div>
                <div class="rank-name">${this.game.stats.rank}</div>
                <div style="margin-top: 15px; font-size: 0.9rem; opacity: 0.9;">
                    正解数: ${this.game.stats.totalCorrect} / ${this.game.stats.totalQuestions}問
                </div>
            </div>

            <div class="achievements">
                <h2 style="margin-bottom: 10px;">🏆 実績バッジ</h2>
                <p style="opacity: 0.8; margin-bottom: 20px;">
                    ${this.game.stats.achievements.length} / ${allAchievements.length} 獲得
                </p>
                <div class="achievement-grid">
                    ${allAchievements.map(ach => `
                        <div class="achievement ${this.game.stats.achievements.includes(ach.id) ? 'unlocked' : 'locked'}">
                            <div class="achievement-icon">${ach.icon}</div>
                            <div class="achievement-name">${ach.name}</div>
                            <div style="font-size: 0.7rem; margin-top: 5px; opacity: 0.8;">
                                ${ach.desc}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="achievements" style="margin-top: 20px;">
                <h2 style="margin-bottom: 10px;">📊 統計</h2>
                <div style="background: rgba(255,255,255,0.3); border-radius: 10px; padding: 20px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <div style="font-size: 1.5rem; font-weight: bold;">${this.game.stats.totalGames}</div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">プレイ回数</div>
                        </div>
                        <div>
                            <div style="font-size: 1.5rem; font-weight: bold;">${this.game.stats.bestScore}</div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">最高スコア</div>
                        </div>
                        <div>
                            <div style="font-size: 1.5rem; font-weight: bold;">${this.game.stats.maxCombo}</div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">最大コンボ</div>
                        </div>
                        <div>
                            <div style="font-size: 1.5rem; font-weight: bold;">${this.game.stats.dailyStreak}</div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">連続日数</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="achievements" style="margin-top: 20px;">
                <h2 style="margin-bottom: 10px;">📈 カテゴリ別習熟度</h2>
                <div style="background: rgba(255,255,255,0.3); border-radius: 10px; padding: 20px;">
                    ${this.renderCategoryMastery()}
                </div>
            </div>

            <div class="achievements" style="margin-top: 20px;">
                <h2 style="margin-bottom: 10px;">📉 正答率の推移</h2>
                <div style="background: rgba(255,255,255,0.3); border-radius: 10px; padding: 20px;">
                    ${this.renderAccuracyTrend()}
                </div>
            </div>

            <div class="achievements" style="margin-top: 20px;">
                <h2 style="margin-bottom: 10px;">📝 弱点分析</h2>
                <div style="background: rgba(255,255,255,0.3); border-radius: 10px; padding: 20px;">
                    ${this.renderWeaknessAnalysis()}
                </div>
            </div>

            <div class="achievements" style="margin-top: 20px;">
                <h2 style="margin-bottom: 10px;">📜 学習履歴（最新15セッション）</h2>
                <div style="background: rgba(255,255,255,0.3); border-radius: 10px; padding: 20px;">
                    ${this.renderSessionHistory()}
                </div>
            </div>

            <div class="action-buttons" style="margin-top: 30px;">
                <button class="action-btn btn-secondary" onclick="ui.resetStats()">
                    統計をリセット
                </button>
                <button class="action-btn btn-secondary" onclick="ui.clearSessionHistory()">
                    履歴をクリア
                </button>
            </div>
        `;

        document.getElementById('gameArea').innerHTML = html;
    }

    renderCategoryMastery() {
        const progress = JSON.parse(localStorage.getItem('huntingProgress')) || this.game.initProgress();
        const categories = progress.categories || {};

        const categoryNames = {
            'law': '法令',
            'tools': '猟具',
            'animals': '鳥獣',
            'management': '鳥獣保護管理',
            'practical': '実技'
        };

        let html = '<div style="display: flex; flex-direction: column; gap: 15px;">';

        Object.entries(categoryNames).forEach(([key, name]) => {
            const data = categories[key] || { correct: 0, total: 0 };
            const accuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;

            // プログレスバーの色
            let barColor = '#667eea';
            if (accuracy >= 90) barColor = '#28a745';
            else if (accuracy >= 70) barColor = '#ffc107';
            else if (accuracy >= 50) barColor = '#fd7e14';
            else barColor = '#dc3545';

            html += `
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span style="font-weight: bold;">${name}</span>
                        <span>${accuracy}% (${data.correct}/${data.total})</span>
                    </div>
                    <div style="background: rgba(0,0,0,0.2); border-radius: 10px; height: 25px; overflow: hidden;">
                        <div style="background: ${barColor}; height: 100%; width: ${accuracy}%; transition: width 0.5s; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.8rem;">
                            ${accuracy >= 30 ? accuracy + '%' : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    renderAccuracyTrend() {
        const progress = JSON.parse(localStorage.getItem('huntingProgress')) || this.game.initProgress();
        const history = (progress.quizHistory || []).slice(-15);

        if (history.length === 0) {
            return '<p style="text-align: center; opacity: 0.7;">まだデータがありません</p>';
        }

        const maxAccuracy = 100;

        return `
            <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 150px; gap: 3px;">
                ${history.map(entry => {
                    const accuracy = entry.totalQuestions > 0
                        ? Math.round((entry.correctCount / entry.totalQuestions) * 100)
                        : 0;
                    const height = accuracy;

                    // 色分け
                    let color = '#667eea';
                    if (accuracy >= 90) color = '#28a745';
                    else if (accuracy >= 70) color = '#ffc107';
                    else if (accuracy >= 50) color = '#fd7e14';
                    else color = '#dc3545';

                    return `
                        <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                            <div style="font-size: 0.7rem; margin-bottom: 5px;">${accuracy}%</div>
                            <div style="width: 100%; background: ${color}; border-radius: 5px 5px 0 0; height: ${height}%; min-height: 5px;"></div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="margin-top: 10px; text-align: center; font-size: 0.8rem; opacity: 0.8;">
                最近${history.length}回のプレイの正答率
            </div>
        `;
    }

    /**
     * コンボ数に応じた励ましメッセージを返す
     */
    getComboMessage(combo) {
        if (combo >= 20) {
            const messages = [
                '🌟 神レベル！伝説の連続正解！',
                '🎯 完璧すぎる！もう試験は余裕！',
                '👑 王者の貫禄！圧倒的実力！',
                '⚡ 止まらない！超人的な集中力！'
            ];
            return messages[Math.floor(Math.random() * messages.length)];
        } else if (combo >= 15) {
            const messages = [
                '🔥 凄すぎる！もう誰も止められない！',
                '💎 ダイヤモンド級の正解率！',
                '🚀 宇宙レベルの集中力！',
                '⭐ スター級の実力を見せている！'
            ];
            return messages[Math.floor(Math.random() * messages.length)];
        } else if (combo >= 10) {
            const messages = [
                '🔥 10連続正解！完璧な流れ！',
                '✨ 素晴らしい！この調子！',
                '🎊 止まらない！絶好調！',
                '💪 強すぎる！圧巻の正解率！'
            ];
            return messages[Math.floor(Math.random() * messages.length)];
        } else if (combo >= 5) {
            const messages = [
                `🔥 ${combo}連続正解！いい流れ！`,
                `✨ ${combo}連続！この調子で行こう！`,
                `🌟 ${combo}連続！絶好調！`,
                `💫 ${combo}連続！素晴らしい！`
            ];
            return messages[Math.floor(Math.random() * messages.length)];
        } else if (combo >= 3) {
            return `👍 ${combo}連続正解！いい感じ！`;
        } else {
            const messages = [
                '正解！',
                'その調子！',
                'ナイス！',
                'いいね！',
                '完璧！'
            ];
            return messages[Math.floor(Math.random() * messages.length)];
        }
    }

    /**
     * 不正解時のポジティブフィードバック
     */
    getEncouragementMessage() {
        const messages = [
            '大丈夫！次は正解できる！',
            '解説を読んで次に活かそう！',
            'この1問が成長のチャンス！',
            '間違いから学ぶのが大事！',
            '諦めずに続ければ必ず上達する！',
            '今の失敗が未来の合格につながる！',
            '完璧な人はいない。前進あるのみ！',
            'ここで学んだことは絶対忘れない！'
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * 弱点分析を表示
     */
    renderWeaknessAnalysis() {
        const progress = JSON.parse(localStorage.getItem('huntingProgress')) || this.game.initProgress();
        const categories = progress.categories || {};

        // 正答率が低い順にソート
        const sortedCategories = Object.entries(categories)
            .map(([key, data]) => ({
                key,
                name: this.game.getCategoryName(key),
                accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
                total: data.total
            }))
            .filter(c => c.total > 0)
            .sort((a, b) => a.accuracy - b.accuracy);

        if (sortedCategories.length === 0) {
            return '<p style="text-align: center; opacity: 0.7;">まだデータがありません</p>';
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';

        sortedCategories.forEach((category, index) => {
            const isWeakest = index === 0;
            const needsWork = category.accuracy < 70;

            html += `
                <div style="padding: 15px; background: ${isWeakest ? 'rgba(220, 53, 69, 0.2)' : 'rgba(255,255,255,0.2)'}; border-radius: 10px; ${isWeakest ? 'border: 2px solid #dc3545;' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div>
                            <span style="font-weight: bold; font-size: 1.1rem;">${category.name}</span>
                            ${isWeakest ? '<span style="margin-left: 10px; background: #dc3545; color: white; padding: 3px 10px; border-radius: 15px; font-size: 0.8rem;">要強化</span>' : ''}
                        </div>
                        <span style="font-size: 1.2rem; font-weight: bold; color: ${category.accuracy >= 70 ? '#28a745' : '#dc3545'};">${category.accuracy}%</span>
                    </div>
                    ${needsWork ? `
                        <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 10px;">
                            💡 このカテゴリを重点的に復習しましょう
                        </div>
                    ` : ''}
                </div>
            `;
        });

        html += '</div>';

        // 復習推奨セクション
        const weakCategories = sortedCategories.filter(c => c.accuracy < 70);
        if (weakCategories.length > 0) {
            html += `
                <div style="margin-top: 20px; padding: 15px; background: rgba(255, 193, 7, 0.2); border-radius: 10px; border: 2px solid #ffc107;">
                    <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 10px;">📚 復習推奨</div>
                    <div style="font-size: 0.9rem; line-height: 1.6;">
                        ${weakCategories.map(c => c.name).join('、')}の分野を重点的に学習すると、より高い合格率を目指せます。
                    </div>
                    <button class="action-btn btn-primary" style="margin-top: 15px; padding: 10px 20px;" onclick="ui.startWeaknessReview()">
                        弱点克服モードで学習
                    </button>
                </div>
            `;
        }

        return html;
    }

    /**
     * 弱点克服モード（正答率の低いカテゴリの問題のみ）
     */
    startWeaknessReview() {
        const progress = JSON.parse(localStorage.getItem('huntingProgress')) || this.game.initProgress();
        const categories = progress.categories || {};

        // 正答率が最も低いカテゴリを特定
        let weakestCategory = null;
        let lowestAccuracy = 100;

        const categoryMap = {
            'law': '法令',
            'tools': '猟具',
            'animals': '鳥獣',
            'management': '鳥獣保護管理',
            'practical': '実技'
        };

        Object.entries(categories).forEach(([key, data]) => {
            if (data.total > 0) {
                const accuracy = data.correct / data.total;
                if (accuracy < lowestAccuracy) {
                    lowestAccuracy = accuracy;
                    weakestCategory = categoryMap[key];
                }
            }
        });

        if (weakestCategory) {
            // 該当カテゴリの問題を抽出
            const questions = this.game.quizData.quizzes.filter(q => q.category === weakestCategory);
            this.game.currentQuestions = questions.sort(() => Math.random() - 0.5).slice(0, 10);
            this.game.currentIndex = 0;
            this.game.score = 0;
            this.game.combo = 0;
            this.game.maxCombo = 0;
            this.game.correctCount = 0;
            this.game.incorrectCount = 0;
            this.game.startTime = Date.now();
            this.game.currentMode = 'weakness';

            if (typeof window.UXEnhancements !== 'undefined') {
                window.UXEnhancements.showToast(`${weakestCategory}の弱点克服モードを開始します！`, 'info', 2000);
            }

            this.showQuestion();
        } else {
            if (typeof window.UXEnhancements !== 'undefined') {
                window.UXEnhancements.showToast('まだデータがありません', 'error', 2000);
            }
        }
    }

    /**
     * セッション履歴を表示（Quality Guardian追加）
     */
    renderSessionHistory() {
        const sessionHistory = JSON.parse(localStorage.getItem('sessionHistory')) || [];

        if (sessionHistory.length === 0) {
            return '<p style="text-align: center; opacity: 0.7;">まだ学習履歴がありません</p>';
        }

        // 最新15件のみ表示
        const recentSessions = sessionHistory.slice(-15).reverse();

        let html = '<div style="overflow-x: auto;">';
        html += '<table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">';
        html += `
            <thead>
                <tr style="border-bottom: 2px solid rgba(255,255,255,0.5);">
                    <th style="padding: 10px; text-align: left;">日時</th>
                    <th style="padding: 10px; text-align: center;">モード</th>
                    <th style="padding: 10px; text-align: center;">正答率</th>
                    <th style="padding: 10px; text-align: center;">所要時間</th>
                    <th style="padding: 10px; text-align: center;">スコア</th>
                </tr>
            </thead>
            <tbody>
        `;

        recentSessions.forEach((session, index) => {
            const date = new Date(session.date);
            const dateStr = `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
            const modeNames = {
                'quickMatch': 'クイック',
                'daily': 'デイリー',
                'flashcard': 'フラッシュ',
                'timeAttack': 'タイム',
                'survival': 'サバイバル',
                'expert': 'エキスパート',
                'weakness': '弱点克服'
            };
            const modeName = modeNames[session.mode] || session.mode;
            const minutes = Math.floor(session.elapsedSeconds / 60);
            const seconds = session.elapsedSeconds % 60;
            const timeStr = `${minutes}分${seconds}秒`;

            // 正答率による色分け
            let accuracyColor = '#dc3545';
            if (session.accuracy >= 90) accuracyColor = '#28a745';
            else if (session.accuracy >= 70) accuracyColor = '#ffc107';
            else if (session.accuracy >= 50) accuracyColor = '#fd7e14';

            html += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.2); ${index % 2 === 0 ? 'background: rgba(255,255,255,0.1);' : ''}">
                    <td style="padding: 10px;">${dateStr}</td>
                    <td style="padding: 10px; text-align: center;">${modeName}</td>
                    <td style="padding: 10px; text-align: center; font-weight: bold; color: ${accuracyColor};">${session.accuracy}%</td>
                    <td style="padding: 10px; text-align: center;">${timeStr}</td>
                    <td style="padding: 10px; text-align: center; font-weight: bold;">${session.score}</td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';

        // 統計サマリー
        const totalSessions = sessionHistory.length;
        const avgAccuracy = Math.round(sessionHistory.reduce((sum, s) => sum + s.accuracy, 0) / totalSessions);
        const avgTime = Math.round(sessionHistory.reduce((sum, s) => sum + s.elapsedSeconds, 0) / totalSessions);
        const avgMinutes = Math.floor(avgTime / 60);
        const avgSeconds = avgTime % 60;

        html += `
            <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.2); border-radius: 10px;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center;">
                    <div>
                        <div style="font-size: 1.5rem; font-weight: bold;">${totalSessions}</div>
                        <div style="font-size: 0.9rem; opacity: 0.8;">総セッション数</div>
                    </div>
                    <div>
                        <div style="font-size: 1.5rem; font-weight: bold;">${avgAccuracy}%</div>
                        <div style="font-size: 0.9rem; opacity: 0.8;">平均正答率</div>
                    </div>
                    <div>
                        <div style="font-size: 1.5rem; font-weight: bold;">${avgMinutes}分${avgSeconds}秒</div>
                        <div style="font-size: 0.9rem; opacity: 0.8;">平均所要時間</div>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    /**
     * セッション履歴をクリア（Quality Guardian追加）
     */
    clearSessionHistory() {
        if (confirm('本当に学習履歴を削除しますか？この操作は取り消せません。')) {
            localStorage.removeItem('sessionHistory');
            this.showAchievements();
            if (typeof window.UXEnhancements !== 'undefined') {
                window.UXEnhancements.showToast('学習履歴を削除しました', 'success', 2000);
            }
        }
    }

    resetStats() {
        if (confirm('本当に統計をリセットしますか？この操作は取り消せません。')) {
            localStorage.removeItem('huntingGameStats');
            this.game.loadStats();
            this.showAchievements();
        }
    }

    backToMenu() {
        // タイマーを停止
        if (this.timeAttackInterval) {
            clearInterval(this.timeAttackInterval);
            this.timeAttackInterval = null;
        }

        // モードフラグをリセット
        this.timeAttackMode = false;
        this.survivalMode = false;
        this.expertMode = false;

        document.getElementById('modeSelection').style.display = 'block';
        document.getElementById('gameArea').style.display = 'none';
        document.getElementById('gameArea').innerHTML = '';
    }
}

// 初期化
const game = new GameManager();
const ui = new UIManager(game);
