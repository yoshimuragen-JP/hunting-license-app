'use strict';

/**
 * 統合ユーティリティ
 * ページ間のデータ連携とナビゲーションを管理
 */

// グローバル統合オブジェクト
const AppIntegration = {
    // データストレージキー
    storageKeys: {
        progress: 'hunting_license_progress',
        results: 'hunting_license_results',
        animalProgress: 'hunting_license_animal_progress'
    },

    /**
     * ページ間リンクの管理
     */
    navigation: {
        // 学習画面へ（カテゴリ指定可能）
        toGame(category = null) {
            const url = category ? `game.html?category=${category}` : 'game.html';
            window.location.href = url;
        },

        // 模擬試験へ
        toMockExam() {
            window.location.href = 'mock-exam.html';
        },

        // 鳥獣図鑑へ（動物ID指定可能）
        toAnimals(animalId = null) {
            const url = animalId ? `animals.html#animal-${animalId}` : 'animals.html';
            window.location.href = url;
        },

        // 実技ガイドへ（セクション指定可能）
        toPractical(section = null) {
            const url = section ? `practical.html#${section}` : 'practical.html';
            window.location.href = url;
        },

        // ダッシュボードへ
        toDashboard() {
            window.location.href = 'dashboard.html';
        },

        // ガイドへ
        toGuide() {
            window.location.href = 'guide.html';
        },

        // ホームへ
        toHome() {
            window.location.href = 'index.html';
        }
    },

    /**
     * データの保存と取得
     */
    storage: {
        // 学習進捗の取得
        getProgress() {
            const data = localStorage.getItem(AppIntegration.storageKeys.progress);
            return data ? JSON.parse(data) : {
                totalQuestions: 0,
                correctAnswers: 0,
                categories: {},
                studyTime: 0
            };
        },

        // 学習進捗の保存
        saveProgress(progress) {
            localStorage.setItem(
                AppIntegration.storageKeys.progress,
                JSON.stringify(progress)
            );
        },

        // 模擬試験結果の取得
        getResults() {
            const data = localStorage.getItem(AppIntegration.storageKeys.results);
            return data ? JSON.parse(data) : [];
        },

        // 模擬試験結果の保存
        saveResult(result) {
            const results = this.getResults();
            results.push({
                ...result,
                date: new Date().toISOString()
            });
            localStorage.setItem(
                AppIntegration.storageKeys.results,
                JSON.stringify(results)
            );
        },

        // 鳥獣図鑑の進捗取得
        getAnimalProgress() {
            const data = localStorage.getItem(AppIntegration.storageKeys.animalProgress);
            return data ? JSON.parse(data) : {};
        },

        // 鳥獣図鑑の進捗保存
        saveAnimalProgress(animalId, progress) {
            const allProgress = this.getAnimalProgress();
            allProgress[animalId] = progress;
            localStorage.setItem(
                AppIntegration.storageKeys.animalProgress,
                JSON.stringify(allProgress)
            );
        }
    },

    /**
     * クロスリンクの生成
     */
    generateLinks: {
        // 問題から鳥獣図鑑へのリンク
        toAnimalFromQuestion(animalName) {
            // 動物名から図鑑のアンカーを生成
            const animalId = animalName.replace(/\s/g, '-').toLowerCase();
            return `animals.html#${animalId}`;
        },

        // カテゴリから学習画面へのリンク
        toCategoryStudy(category) {
            return `game.html?category=${encodeURIComponent(category)}`;
        },

        // ダッシュボードから弱点カテゴリの学習へ
        toWeakCategory(category) {
            return `game.html?category=${encodeURIComponent(category)}&mode=weak`;
        }
    },

    /**
     * 統計情報の集計
     */
    stats: {
        // 総合統計の取得
        getOverallStats() {
            const progress = AppIntegration.storage.getProgress();
            const results = AppIntegration.storage.getResults();

            return {
                totalQuestions: progress.totalQuestions || 0,
                correctAnswers: progress.correctAnswers || 0,
                accuracy: progress.totalQuestions > 0
                    ? Math.round((progress.correctAnswers / progress.totalQuestions) * 100)
                    : 0,
                studyTime: progress.studyTime || 0,
                mockExamCount: results.length,
                averageMockScore: results.length > 0
                    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
                    : 0,
                categories: progress.categories || {}
            };
        },

        // カテゴリ別統計
        getCategoryStats(category) {
            const progress = AppIntegration.storage.getProgress();
            const categoryData = progress.categories?.[category] || {
                total: 0,
                correct: 0
            };

            return {
                total: categoryData.total,
                correct: categoryData.correct,
                accuracy: categoryData.total > 0
                    ? Math.round((categoryData.correct / categoryData.total) * 100)
                    : 0
            };
        },

        // 弱点カテゴリの取得
        getWeakCategories(threshold = 70) {
            const progress = AppIntegration.storage.getProgress();
            const categories = progress.categories || {};

            return Object.entries(categories)
                .map(([name, data]) => ({
                    name,
                    accuracy: data.total > 0
                        ? Math.round((data.correct / data.total) * 100)
                        : 0,
                    total: data.total
                }))
                .filter(cat => cat.accuracy < threshold && cat.total >= 5)
                .sort((a, b) => a.accuracy - b.accuracy);
        }
    },

    /**
     * 初期化
     */
    init() {
        console.log('🎯 AppIntegration initialized');

        // URLパラメータの処理
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const mode = urlParams.get('mode');

        // カテゴリ指定があれば自動フィルタ
        if (category && typeof filterByCategory === 'function') {
            filterByCategory(category);
        }

        // モード指定があれば適用
        if (mode === 'weak' && typeof setWeakMode === 'function') {
            setWeakMode();
        }

        // 統計情報を表示（デバッグ用）
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('📊 Overall Stats:', this.stats.getOverallStats());
            console.log('⚠️ Weak Categories:', this.stats.getWeakCategories());
        }
    }
};

/**
 * 問題解説内に鳥獣図鑑へのリンクを挿入
 */
function linkAnimalNamesInExplanation() {
    const explanations = document.querySelectorAll('.explanation, .question-explanation');

    // 主要な鳥獣名のリスト
    const animalNames = [
        'マガモ', 'カルガモ', 'コガモ', 'ヨシガモ', 'オカヨシガモ', 'ヒドリガモ',
        'オナガガモ', 'ハシビロガモ', 'ホシハジロ', 'キンクロハジロ', 'スズガモ', 'クロガモ',
        'キジバト', 'キジ', 'ヤマドリ', 'ウズラ', 'コジュケイ',
        'バン', 'ヤマシギ', 'タシギ',
        'スズメ', 'ヒヨドリ', 'ムクドリ',
        'ミヤマガラス', 'ハシブトガラス', 'ハシボソガラス',
        'イノシシ', 'ニホンジカ', 'ツキノワグマ', 'ヒグマ',
        'タヌキ', 'キツネ', 'テン', 'イタチ', 'アナグマ',
        'ノウサギ', 'ユキウサギ',
        'アライグマ', 'ハクビシン', 'ヌートリア'
    ];

    explanations.forEach(explanation => {
        let html = explanation.innerHTML;

        animalNames.forEach(animalName => {
            const regex = new RegExp(`(${animalName})(?![^<]*>)`, 'g');
            const link = `<a href="${AppIntegration.generateLinks.toAnimalFromQuestion(animalName)}"
                             class="animal-link"
                             target="_blank"
                             title="${animalName}の詳細を見る">$1</a>`;
            html = html.replace(regex, link);
        });

        explanation.innerHTML = html;
    });

    // リンクのスタイル追加
    const style = document.createElement('style');
    style.textContent = `
        .animal-link {
            color: #667eea;
            text-decoration: underline;
            font-weight: 600;
        }
        .animal-link:hover {
            color: #764ba2;
            text-decoration: none;
        }
    `;
    document.head.appendChild(style);
}

/**
 * 弱点カテゴリへのリンク生成（ダッシュボード用）
 */
function generateWeakCategoryLinks() {
    const weakCategories = AppIntegration.stats.getWeakCategories();
    const container = document.getElementById('weak-categories-links');

    if (!container || weakCategories.length === 0) return;

    const html = weakCategories.map(cat => `
        <div class="weak-category-card">
            <h4>${cat.name}</h4>
            <p>正答率: ${cat.accuracy}% (${cat.total}問)</p>
            <a href="${AppIntegration.generateLinks.toWeakCategory(cat.name)}"
               class="btn btn-primary">
                この分野を学習する
            </a>
        </div>
    `).join('');

    container.innerHTML = html;
}

/**
 * ページ読み込み時の初期化
 */
document.addEventListener('DOMContentLoaded', () => {
    AppIntegration.init();

    // 問題解説内の動物名をリンク化
    if (document.querySelector('.explanation') || document.querySelector('.question-explanation')) {
        linkAnimalNamesInExplanation();
    }

    // ダッシュボードで弱点カテゴリリンク生成
    if (window.location.pathname.includes('dashboard.html')) {
        generateWeakCategoryLinks();
    }
});

// グローバルに公開
window.AppIntegration = AppIntegration;
