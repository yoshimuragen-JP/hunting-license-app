'use strict';

/**
 * 狩猟免許試験学習アプリ - 進捗ダッシュボード
 *
 * 学習の進捗状況を可視化し、モチベーション維持をサポート
 *
 * 機能:
 * - 総学習時間・総解答数の表示
 * - カテゴリ別正答率の分析（5カテゴリ）
 * - 模擬試験スコアの推移グラフ
 * - 合格可能性予測（リアルタイム計算）
 * - 試験日までのカウントダウン
 * - 学習継続支援（デイリーストリーク）
 * - モチベーションメッセージ（動的生成）
 * - 弱点カテゴリの自動検出
 *
 * LocalStorageを使用したデータ永続化
 */

// ==========================================
// データ管理
// ==========================================

/**
 * 学習データをLocalStorageから取得
 * データが存在しない場合はダミーデータを返す（デモ用）
 * @returns {Object} 学習データオブジェクト
 */
function getStudyData() {
    const stored = localStorage.getItem('huntingLicenseStudyData');
    if (stored) {
        return JSON.parse(stored);
    }

    // ダミーデータ（デモ用）
    return {
        totalStudyTime: 24.5, // 時間
        totalQuestions: 156,
        correctAnswers: 126,
        categories: {
            '法令': { total: 45, correct: 38, icon: '📜', color: '#3498db' },
            '猟具': { total: 30, correct: 24, icon: '🔫', color: '#e74c3c' },
            '鳥獣': { total: 50, correct: 40, icon: '🦌', color: '#27ae60' },
            '鳥獣保護管理': { total: 16, correct: 14, icon: '🌳', color: '#f39c12' },
            '実技': { total: 15, correct: 10, icon: '✋', color: '#9b59b6' }
        },
        mockExams: [
            { date: '2026-01-15', score: 60, total: 30 },
            { date: '2026-01-22', score: 68, total: 30 },
            { date: '2026-01-29', score: 75, total: 30 },
            { date: '2026-02-05', score: 80, total: 30 }
        ],
        studyStreak: [1, 1, 1, 0, 1, 1, 1], // 過去7日間の学習記録（1=学習した、0=してない）
        examDate: '2026-03-15',
        badges: ['初心者', '連続学習3日', '100問達成', '正答率70%突破'],
        weakCategories: ['実技', '猟具']
    };
}

/**
 * 学習データをLocalStorageに保存
 * @param {Object} data - 保存する学習データオブジェクト
 */
function saveStudyData(data) {
    localStorage.setItem('huntingLicenseStudyData', JSON.stringify(data));
}

// ==========================================
// 統計情報の表示
// ==========================================

/**
 * ダッシュボードに統計情報を表示
 * 総学習時間、正答率、合格予測、試験日カウントダウンなどを画面に表示
 */
function displayStatistics() {
    const data = getStudyData();

    // 総学習時間
    document.getElementById('totalStudyTime').textContent = data.totalStudyTime.toFixed(1);

    // 解答した問題数
    document.getElementById('totalQuestions').textContent = data.totalQuestions;

    // 目標までの問題数を表示
    displayQuestionsToGoal(data.totalQuestions);

    // 全体正答率
    const overallAccuracy = ((data.correctAnswers / data.totalQuestions) * 100).toFixed(1);
    document.getElementById('overallAccuracy').textContent = `${overallAccuracy}%`;

    // 正答率のトレンド表示
    displayScoreTrend(data);

    // 合格予測
    const passPrediction = calculatePassPrediction(data);
    document.getElementById('passPrediction').textContent = `${passPrediction}%`;

    // 合格までの距離を表示
    displayPassDistance(overallAccuracy, passPrediction);

    // 試験までのカウントダウン
    displayExamCountdown(data.examDate);

    // モチベーションメッセージ
    displayMotivationMessage(overallAccuracy, passPrediction);

    // 連続学習日数
    displayStudyStreak(data.studyStreak);
}

function displayScoreTrend(data) {
    const container = document.getElementById('scoreTrend');

    if (data.mockExams.length < 2) {
        container.innerHTML = '<span style="color: #999;">データ不足</span>';
        return;
    }

    const lastTwo = data.mockExams.slice(-2);
    const lastScore = (lastTwo[1].score / lastTwo[1].total) * 100;
    const prevScore = (lastTwo[0].score / lastTwo[0].total) * 100;
    const diff = lastScore - prevScore;

    if (diff > 0) {
        container.innerHTML = `
            <span class="trend-arrow trend-up">↗</span>
            <span style="color: #27ae60; font-weight: bold;">+${diff.toFixed(1)}%</span>
        `;
    } else if (diff < 0) {
        container.innerHTML = `
            <span class="trend-arrow trend-down">↘</span>
            <span style="color: #e74c3c; font-weight: bold;">${diff.toFixed(1)}%</span>
        `;
    } else {
        container.innerHTML = `<span style="color: #999;">変化なし</span>`;
    }
}

function calculatePassPrediction(data) {
    const overallAccuracy = (data.correctAnswers / data.totalQuestions) * 100;

    // 合格予測のロジック
    // 正答率70%以上なら高確率、60-70%は要努力、60%未満は低確率
    if (overallAccuracy >= 85) return 95;
    if (overallAccuracy >= 80) return 90;
    if (overallAccuracy >= 75) return 85;
    if (overallAccuracy >= 70) return 75;
    if (overallAccuracy >= 65) return 60;
    if (overallAccuracy >= 60) return 45;
    return 30;
}

function displayExamCountdown(examDate) {
    const today = new Date();
    const exam = new Date(examDate);
    const diffTime = exam - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    document.getElementById('daysLeft').textContent = diffDays;
}

function displayMotivationMessage(accuracy, prediction) {
    const container = document.getElementById('motivationMessage');

    let message = '';

    if (accuracy >= 80) {
        message = '🎉 素晴らしい！合格ラインを大きく超えています！この調子で頑張りましょう！';
    } else if (accuracy >= 70) {
        message = '✨ いい感じです！合格ラインに到達しました！油断せず続けましょう！';
    } else if (accuracy >= 60) {
        message = '💪 もう少しです！あと10%で合格ライン！弱点分野を重点的に学習しましょう！';
    } else {
        message = '📚 まだまだこれから！基礎をしっかり固めて、一歩ずつ前進しましょう！';
    }

    // 問題数に応じたメッセージ追加
    const data = getStudyData();
    if (data.totalQuestions >= 200) {
        message += ' あと' + (300 - data.totalQuestions) + '問で300問達成バッジ！';
    } else if (data.totalQuestions >= 100) {
        message += ' 100問突破！順調です！';
    }

    container.textContent = message;
}

function displayStudyStreak(streak) {
    const container = document.getElementById('studyStreak');
    container.innerHTML = '';

    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const today = new Date().getDay();

    streak.forEach((studied, index) => {
        const dayIndex = (today - 6 + index + 7) % 7;
        const div = document.createElement('div');
        div.className = `streak-day ${studied ? 'active' : 'inactive'}`;
        div.textContent = days[dayIndex];
        div.title = studied ? '学習済み' : '未学習';
        container.appendChild(div);
    });
}

function displayQuestionsToGoal(totalQuestions) {
    const container = document.getElementById('questionsToGoal');
    const goals = [
        { milestone: 100, badge: '100問達成' },
        { milestone: 200, badge: '200問達成' },
        { milestone: 300, badge: '300問達成' },
        { milestone: 500, badge: '500問達成' }
    ];

    const nextGoal = goals.find(g => g.milestone > totalQuestions);

    if (nextGoal) {
        const remaining = nextGoal.milestone - totalQuestions;
        container.innerHTML = `🎯 あと<strong>${remaining}問</strong>で「${nextGoal.badge}」バッジ獲得！`;
    } else {
        container.innerHTML = '🏆 すべての問題数バッジを獲得済み！';
    }
}

function displayPassDistance(accuracy, prediction) {
    const container = document.getElementById('passDistance');

    if (accuracy >= 80) {
        container.innerHTML = '✅ 余裕の合格圏内です！';
        container.style.color = '#27ae60';
    } else if (accuracy >= 70) {
        container.innerHTML = '🎯 合格ライン到達！この調子で維持しましょう！';
        container.style.color = '#667eea';
    } else if (accuracy >= 60) {
        const pointsNeeded = (70 - accuracy).toFixed(1);
        container.innerHTML = `📈 あと${pointsNeeded}%で合格ライン`;
        container.style.color = '#f39c12';
    } else {
        const pointsNeeded = (70 - accuracy).toFixed(1);
        container.innerHTML = `💪 ${pointsNeeded}%アップで合格圏内！`;
        container.style.color = '#e74c3c';
    }
}

// ==========================================
// カテゴリ別習得度の表示
// ==========================================

function displayCategoryProgress() {
    const data = getStudyData();
    const container = document.getElementById('categoryProgress');
    container.innerHTML = '';

    Object.entries(data.categories).forEach(([name, stats]) => {
        const accuracy = ((stats.correct / stats.total) * 100).toFixed(1);

        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-progress';
        categoryDiv.innerHTML = `
            <div class="category-name">
                <span>
                    <span class="category-icon">${stats.icon}</span>
                    ${name}
                </span>
                <span style="font-weight: bold; color: ${stats.color};">${accuracy}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${accuracy}%; background: ${stats.color};">
                    ${stats.correct}/${stats.total}
                </div>
            </div>
        `;
        container.appendChild(categoryDiv);
    });
}

// ==========================================
// グラフの描画
// ==========================================

let categoryChart = null;
let progressChart = null;
let radarChart = null;
let studyTimeChart = null;
let weeklyQuizChart = null;

function drawRadarChart() {
    const data = getStudyData();
    const ctx = document.getElementById('radarChart').getContext('2d');

    if (radarChart) {
        radarChart.destroy();
    }

    const labels = Object.keys(data.categories);
    const accuracies = Object.values(data.categories).map(cat =>
        ((cat.correct / cat.total) * 100).toFixed(1)
    );

    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: '正答率 (%)',
                data: accuracies,
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: '#667eea',
                borderWidth: 2,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }, {
                label: '合格ライン (70%)',
                data: new Array(labels.length).fill(70),
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                borderColor: '#e74c3c',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    pointLabels: {
                        font: {
                            size: 12
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

function drawProgressChart() {
    const data = getStudyData();
    const ctx = document.getElementById('progressChart').getContext('2d');

    if (progressChart) {
        progressChart.destroy();
    }

    const labels = data.mockExams.map(exam => {
        const date = new Date(exam.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const scores = data.mockExams.map(exam =>
        ((exam.score / exam.total) * 100).toFixed(1)
    );

    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '正答率 (%)',
                data: scores,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }, {
                label: '合格ライン (70%)',
                data: new Array(labels.length).fill(70),
                borderColor: '#e74c3c',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y + '%';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function drawStudyTimeChart() {
    const data = getStudyData();
    const ctx = document.getElementById('studyTimeChart').getContext('2d');

    if (studyTimeChart) {
        studyTimeChart.destroy();
    }

    // ダミーの日別学習時間データを生成（実データがない場合）
    const last7Days = [];
    const studyTimes = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last7Days.push(`${date.getMonth() + 1}/${date.getDate()}`);
        // ダミーデータ: ランダムな学習時間（0-3時間）
        studyTimes.push(data.studyStreak[6 - i] === 1 ? (Math.random() * 2 + 0.5).toFixed(1) : 0);
    }

    studyTimeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: last7Days,
            datasets: [{
                label: '学習時間 (時間)',
                data: studyTimes,
                backgroundColor: 'rgba(102, 126, 234, 0.7)',
                borderColor: '#667eea',
                borderWidth: 2,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + 'h';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function drawWeeklyQuizChart() {
    const data = getStudyData();
    const ctx = document.getElementById('weeklyQuizChart').getContext('2d');

    if (weeklyQuizChart) {
        weeklyQuizChart.destroy();
    }

    // ダミーの週別問題演習数（過去4週間）
    const weekLabels = ['3週間前', '2週間前', '先週', '今週'];
    const weeklyQuestions = [30, 45, 52, 29]; // ダミーデータ

    weeklyQuizChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: weekLabels,
            datasets: [{
                label: '問題数',
                data: weeklyQuestions,
                backgroundColor: [
                    'rgba(102, 126, 234, 0.5)',
                    'rgba(102, 126, 234, 0.6)',
                    'rgba(102, 126, 234, 0.7)',
                    'rgba(102, 126, 234, 0.9)'
                ],
                borderColor: '#667eea',
                borderWidth: 2,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + '問';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// ==========================================
// 弱点分析
// ==========================================

function displayWeaknessAnalysis() {
    const data = getStudyData();
    const container = document.getElementById('weaknessList');
    container.innerHTML = '';

    // カテゴリ別正答率を計算してソート
    const categoryStats = Object.entries(data.categories).map(([name, stats]) => ({
        name,
        accuracy: (stats.correct / stats.total) * 100,
        total: stats.total,
        correct: stats.correct,
        icon: stats.icon
    })).sort((a, b) => a.accuracy - b.accuracy);

    // 正答率が低い上位3カテゴリを弱点として表示
    const weakCategories = categoryStats.slice(0, 3);

    weakCategories.forEach(cat => {
        const li = document.createElement('li');
        li.className = 'weakness-item';

        let suggestion = '';
        if (cat.accuracy < 60) {
            suggestion = `基礎から復習しましょう。まずは過去問を繰り返し解いて、パターンを掴むことが大切です。`;
        } else if (cat.accuracy < 70) {
            suggestion = `あと少しで合格ライン！引っかけ問題に注意しながら、丁寧に問題を読みましょう。`;
        } else {
            suggestion = `合格ラインは超えていますが、さらに正答率を上げることで安心して試験に臨めます。`;
        }

        li.innerHTML = `
            <div class="weakness-title">${cat.icon} ${cat.name} (正答率: ${cat.accuracy.toFixed(1)}%)</div>
            <div class="weakness-suggestion">💡 ${suggestion}</div>
        `;
        container.appendChild(li);
    });

    // 全体的なアドバイス
    const overallAccuracy = (data.correctAnswers / data.totalQuestions) * 100;
    if (overallAccuracy >= 70) {
        const li = document.createElement('li');
        li.className = 'weakness-item';
        li.style.background = '#f0fff0';
        li.style.borderColor = '#27ae60';
        li.innerHTML = `
            <div class="weakness-title" style="color: #27ae60;">✅ 全体的に良好です！</div>
            <div class="weakness-suggestion">合格ラインを超えています。弱点分野を補強しつつ、模擬試験で本番に備えましょう。</div>
        `;
        container.appendChild(li);
    }
}

// ==========================================
// バッジシステム
// ==========================================

function displayBadges() {
    const data = getStudyData();
    const container = document.getElementById('badgeList');
    container.innerHTML = '';

    // 全バッジリスト
    const allBadges = [
        { name: '初心者', icon: '🌱', condition: () => true },
        { name: '連続学習3日', icon: '🔥', condition: () => checkStreak(data.studyStreak, 3) },
        { name: '連続学習7日', icon: '🔥🔥', condition: () => checkStreak(data.studyStreak, 7) },
        { name: '50問達成', icon: '📝', condition: () => data.totalQuestions >= 50 },
        { name: '100問達成', icon: '📚', condition: () => data.totalQuestions >= 100 },
        { name: '200問達成', icon: '📖', condition: () => data.totalQuestions >= 200 },
        { name: '300問達成', icon: '🎓', condition: () => data.totalQuestions >= 300 },
        { name: '正答率70%突破', icon: '🎯', condition: () => (data.correctAnswers / data.totalQuestions) * 100 >= 70 },
        { name: '正答率80%突破', icon: '🎯🎯', condition: () => (data.correctAnswers / data.totalQuestions) * 100 >= 80 },
        { name: '正答率90%突破', icon: '🎯🎯🎯', condition: () => (data.correctAnswers / data.totalQuestions) * 100 >= 90 },
        { name: '法令マスター', icon: '📜', condition: () => checkCategoryMastery(data, '法令') },
        { name: '猟具マスター', icon: '🔫', condition: () => checkCategoryMastery(data, '猟具') },
        { name: '鳥獣マスター', icon: '🦌', condition: () => checkCategoryMastery(data, '鳥獣') },
        { name: '模擬試験合格', icon: '✅', condition: () => checkMockExamPass(data) },
        { name: '合格圏内', icon: '🎊', condition: () => (data.correctAnswers / data.totalQuestions) * 100 >= 75 }
    ];

    allBadges.forEach(badge => {
        const div = document.createElement('div');
        div.className = badge.condition() ? 'badge' : 'badge locked';
        div.innerHTML = `
            <span>${badge.icon}</span>
            <span>${badge.name}</span>
        `;
        container.appendChild(div);
    });
}

function checkStreak(streak, days) {
    if (streak.length < days) return false;
    const recentDays = streak.slice(-days);
    return recentDays.every(day => day === 1);
}

function checkCategoryMastery(data, categoryName) {
    const cat = data.categories[categoryName];
    if (!cat) return false;
    return (cat.correct / cat.total) * 100 >= 80;
}

function checkMockExamPass(data) {
    if (data.mockExams.length === 0) return false;
    const lastExam = data.mockExams[data.mockExams.length - 1];
    return (lastExam.score / lastExam.total) * 100 >= 70;
}

// ==========================================
// ヒートマップカレンダー（GitHub風）
// ==========================================

function drawHeatmapCalendar() {
    const container = document.getElementById('heatmapCalendar');
    const data = getStudyData();

    // 過去365日分のデータを生成（ダミー）
    const heatmapData = [];
    const today = new Date();

    for (let i = 364; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // ダミーデータ: ランダムに学習活動を生成
        const activity = Math.random();
        let level = 0;
        if (activity > 0.8) level = 4;
        else if (activity > 0.6) level = 3;
        else if (activity > 0.4) level = 2;
        else if (activity > 0.2) level = 1;

        heatmapData.push({
            date: dateStr,
            level: level,
            count: level > 0 ? Math.floor(Math.random() * 20) + 1 : 0
        });
    }

    // グリッドを描画
    let html = '<div class="heatmap-grid">';

    heatmapData.forEach(day => {
        const date = new Date(day.date);
        const weekday = date.getDay();
        html += `<div class="heatmap-cell level-${day.level}"
                     title="${day.date}: ${day.count}問"
                     style="grid-row: ${weekday + 1}"></div>`;
    });

    html += '</div>';

    // 凡例を追加
    html += `
        <div class="heatmap-legend">
            <span>少ない</span>
            <div class="heatmap-legend-item level-0"></div>
            <div class="heatmap-legend-item level-1"></div>
            <div class="heatmap-legend-item level-2"></div>
            <div class="heatmap-legend-item level-3"></div>
            <div class="heatmap-legend-item level-4"></div>
            <span>多い</span>
        </div>
    `;

    container.innerHTML = html;
}

// ==========================================
// 週次サマリー
// ==========================================

function displayWeeklySummary() {
    const data = getStudyData();
    const container = document.getElementById('weeklySummary');

    // 今週の学習データを計算（ダミー）
    const thisWeek = {
        studyDays: data.studyStreak.filter(d => d === 1).length,
        totalQuestions: 29,
        correctAnswers: 23,
        studyTime: 3.5,
        avgAccuracy: 79.3
    };

    const html = `
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-value">${thisWeek.studyDays}</div>
                <div class="summary-label">学習日数</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${thisWeek.totalQuestions}</div>
                <div class="summary-label">問題演習数</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${thisWeek.studyTime}h</div>
                <div class="summary-label">学習時間</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${thisWeek.avgAccuracy}%</div>
                <div class="summary-label">平均正答率</div>
            </div>
        </div>
        <div style="margin-top: 20px; padding: 15px; background: #f8f9ff; border-radius: 10px;">
            <p style="color: #667eea; font-weight: bold; margin-bottom: 10px;">💡 今週のアドバイス</p>
            <p style="color: #666; line-height: 1.6;">
                ${thisWeek.studyDays >= 5 ?
                    '素晴らしい継続力です！この調子で合格まで駆け抜けましょう！' :
                thisWeek.studyDays >= 3 ?
                    '良いペースです。あと2日学習すると1週間毎日達成バッジが獲得できます！' :
                    '学習時間を増やしましょう。毎日少しずつでも継続することが大切です。'}
            </p>
        </div>
    `;

    container.innerHTML = html;
}

// ==========================================
// データエクスポート
// ==========================================

function exportJSON() {
    const data = getStudyData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `hunting-license-study-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
}

function exportCSV() {
    const data = getStudyData();

    let csv = 'カテゴリ,総問題数,正解数,正答率\n';

    Object.entries(data.categories).forEach(([name, stats]) => {
        const accuracy = ((stats.correct / stats.total) * 100).toFixed(1);
        csv += `${name},${stats.total},${stats.correct},${accuracy}%\n`;
    });

    csv += '\n模擬試験,日付,スコア,正答率\n';
    data.mockExams.forEach((exam, index) => {
        const accuracy = ((exam.score / exam.total) * 100).toFixed(1);
        csv += `第${index + 1}回,${exam.date},${exam.score}/${exam.total},${accuracy}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `hunting-license-study-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    URL.revokeObjectURL(url);
}

function printReport() {
    window.print();
}

// ==========================================
// 初期化
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // ローディング表示
    if (typeof window.UXEnhancements !== 'undefined') {
        window.UXEnhancements.showLoading('データを読み込んでいます...');
    }

    // データ読み込みと表示（遅延でリアル感を出す）
    setTimeout(() => {
        displayStatistics();
        displayCategoryProgress();
        drawRadarChart();
        drawProgressChart();
        drawStudyTimeChart();
        drawWeeklyQuizChart();
        drawHeatmapCalendar();
        displayWeeklySummary();
        displayWeaknessAnalysis();
        displayBadges();

        // ローディング非表示
        if (typeof window.UXEnhancements !== 'undefined') {
            window.UXEnhancements.hideLoading();
        }
    }, 500);

    // アニメーション効果
    document.querySelectorAll('.progress-fill').forEach((element, index) => {
        setTimeout(() => {
            element.style.width = element.style.width;
        }, index * 100);
    });
});
