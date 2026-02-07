/**
 * 狩猟免許試験学習アプリ - メインJavaScript
 *
 * 機能:
 * - 問題演習システム（ランダム、カテゴリ別）
 * - 模擬試験モード（30問90分タイマー付き）
 * - 鳥獣図鑑（画像、特徴、検索機能）
 * - 進捗管理（正答率、統計、グラフ）
 * - UI/UX（スムーズな遷移、エラーハンドリング）
 */

// デバッグ: app.js読み込み確認
console.log('✅ app.js loaded');
window.appJsLoaded = true;

// ================================================================================
// グローバル変数とデータストア
// ================================================================================

let huntingData = null;      // hunting-license-data.json
let quizDatabase = null;     // quiz-database.json
let currentQuiz = null;      // 現在の問題セット
let currentQuestionIndex = 0; // 現在の問題番号
let userAnswers = [];        // ユーザーの回答記録
let timerInterval = null;    // タイマー用interval
let startTime = null;        // 開始時刻
let mockExamMode = false;    // 模擬試験モードフラグ

// ================================================================================
// 初期化処理
// ================================================================================

/**
 * アプリケーション初期化
 * ページ読み込み完了後に実行
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        showLoading(true);
        await loadData();
        initializeApp();
        showLoading(false);
    } catch (error) {
        console.error('初期化エラー:', error);
        showError('データの読み込みに失敗しました。ページをリロードしてください。');
    }
});

/**
 * JSONデータを読み込み
 */
async function loadData() {
    try {
        // hunting-license-data.jsonを読み込み
        const huntingResponse = await fetch('/hunting-license-data.json');
        if (!huntingResponse.ok) throw new Error('hunting-license-data.jsonの読み込み失敗');
        huntingData = await huntingResponse.json();

        // quiz-database.jsonを読み込み
        const quizResponse = await fetch('/quiz-database.json');
        if (!quizResponse.ok) throw new Error('quiz-database.jsonの読み込み失敗');
        quizDatabase = await quizResponse.json();

        // extended-quiz-database.jsonも読み込んで統合
        try {
            const extendedResponse = await fetch('/extended-quiz-database.json');
            if (extendedResponse.ok) {
                const extendedData = await extendedResponse.json();
                if (extendedData.advancedQuizzes) {
                    quizDatabase.quizzes = quizDatabase.quizzes.concat(extendedData.advancedQuizzes);
                }
            }
        } catch (extError) {
            console.warn('extended-quiz-database.jsonの読み込みスキップ:', extError);
        }

        // console.log('データ読み込み完了'); // 本番環境用にコメントアウト
    } catch (error) {
        console.error('データ読み込みエラー:', error);
        throw error;
    }
}

/**
 * アプリケーション初期化
 */
function initializeApp() {
    // イベントリスナー設定
    setupEventListeners();

    // LocalStorage確認・初期化
    initializeStorage();

    // ホーム画面表示
    showScreen('home');

    // 進捗データ更新
    updateProgressDisplay();
}

/**
 * イベントリスナー設定
 */
function setupEventListeners() {
    // ナビゲーション
    document.querySelectorAll('[data-screen]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const screen = e.currentTarget.dataset.screen;
            showScreen(screen);
        });
    });

    // 問題演習モード選択
    document.getElementById('start-random-quiz')?.addEventListener('click', () => startQuiz('random'));
    document.getElementById('start-category-quiz')?.addEventListener('click', () => showCategorySelect());

    // 模擬試験
    document.getElementById('start-mock-exam')?.addEventListener('click', () => showMockExamSelect());

    // 解答ボタン
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleAnswer(e.currentTarget.dataset.answer));
    });

    // 次へ・戻るボタン
    document.getElementById('next-question')?.addEventListener('click', () => nextQuestion());
    document.getElementById('prev-question')?.addEventListener('click', () => prevQuestion());
    document.getElementById('finish-quiz')?.addEventListener('click', () => finishQuiz());

    // 図鑑検索
    document.getElementById('animal-search')?.addEventListener('input', (e) => filterAnimals(e.target.value));
    document.getElementById('animal-category-filter')?.addEventListener('change', (e) => filterAnimalsByCategory(e.target.value));
}

/**
 * LocalStorage初期化
 */
function initializeStorage() {
    if (!localStorage.getItem('huntingProgress')) {
        const initialProgress = {
            totalQuestions: 0,
            correctAnswers: 0,
            studyTime: 0,
            lastStudyDate: null,

            // カテゴリ別進捗
            categories: {
                law: { correct: 0, total: 0 },
                tools: { correct: 0, total: 0 },
                animals: { correct: 0, total: 0 },
                management: { correct: 0, total: 0 },
                practical: { correct: 0, total: 0 }
            },

            // 学習履歴
            quizHistory: [],

            // ゲーム統計
            gameStats: {
                totalGames: 0,
                highScore: 0,
                averageScore: 0,
                maxCombo: 0
            },

            // 模擬試験履歴
            examHistory: []
        };
        localStorage.setItem('huntingProgress', JSON.stringify(initialProgress));
    }
}

// ================================================================================
// 画面遷移・表示制御
// ================================================================================

/**
 * ホームボタンを要素に追加
 * @param {HTMLElement} container - ボタンを追加するコンテナ
 * @param {boolean} prepend - 先頭に追加するか（デフォルト: true）
 */
function addHomeButton(container, prepend = true) {
    if (!container) return;

    // 既存のホームボタンを削除
    const existingBtn = container.querySelector('.back-to-home-btn');
    if (existingBtn) existingBtn.remove();

    // ホームボタンを作成
    const homeBtn = document.createElement('button');
    homeBtn.className = 'back-to-home-btn';
    homeBtn.onclick = function() { showScreen('home'); };
    homeBtn.setAttribute('aria-label', 'ホームへ戻る');
    homeBtn.textContent = '← ホームへ戻る';

    // 追加
    if (prepend && container.firstChild) {
        container.insertBefore(homeBtn, container.firstChild);
    } else {
        container.appendChild(homeBtn);
    }
}

/**
 * 画面切り替え
 * @param {string} screenId - 表示する画面ID
 */
function showScreen(screenId) {
    // 全画面非表示
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.setAttribute('aria-hidden', 'true');
    });

    // 指定画面を表示
    const targetScreen = document.getElementById(`${screenId}-screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');
        targetScreen.setAttribute('aria-hidden', 'false');

        // フォーカスを画面の先頭に移動
        const heading = targetScreen.querySelector('h1, h2, .section-title');
        if (heading) {
            heading.setAttribute('tabindex', '-1');
            heading.focus();
            heading.addEventListener('blur', () => {
                heading.removeAttribute('tabindex');
            }, { once: true });
        }

        // 画面固有の初期化処理
        switch(screenId) {
            case 'home':
                updateHomeStats();
                break;
            case 'encyclopedia':
                loadEncyclopedia();
                break;
            case 'progress':
                updateProgressScreen();
                break;
            case 'study-plan':
                loadStudyPlan();
                break;
        }
    }
}

/**
 * ローディング表示切り替え
 * @param {boolean} show - 表示するか
 * @param {string} message - 表示するメッセージ
 */
function showLoading(show, message = '読み込み中...') {
    if (show) {
        // UXEnhancementsのshowLoadingを使用
        if (typeof window.UXEnhancements !== 'undefined') {
            window.UXEnhancements.showLoading(message);
        } else {
            // フォールバック
            const loader = document.getElementById('loading');
            if (loader) {
                loader.style.display = 'flex';
            }
        }
    } else {
        // UXEnhancementsのhideLoadingを使用
        if (typeof window.UXEnhancements !== 'undefined') {
            window.UXEnhancements.hideLoading();
        } else {
            // フォールバック
            const loader = document.getElementById('loading');
            if (loader) {
                loader.style.display = 'none';
            }
        }
    }
}

/**
 * エラーメッセージ表示
 * @param {string} message - エラーメッセージ
 * @param {boolean} isRetryable - 再読み込み可能か
 */
function showError(message, isRetryable = true) {
    // UXEnhancementsのshowErrorを使用
    if (typeof window.UXEnhancements !== 'undefined') {
        window.UXEnhancements.showError(message, isRetryable);
    } else {
        // フォールバック: 旧実装
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.setAttribute('aria-live', 'assertive');
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #e74c3c;
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        `;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // アクセシビリティ: 通知
    if (typeof accessibilityManager !== 'undefined') {
        accessibilityManager.announce(message, 'assertive');
    }
}

/**
 * 成功メッセージ表示
 * @param {string} message - メッセージ
 */
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.setAttribute('role', 'status');
    successDiv.setAttribute('aria-live', 'polite');
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #27ae60;
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    `;

    document.body.appendChild(successDiv);

    // アクセシビリティ: 通知
    if (typeof accessibilityManager !== 'undefined') {
        accessibilityManager.announce(message, 'polite');
    }

    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// ================================================================================
// 問題演習システム
// ================================================================================

/**
 * カテゴリ選択画面表示
 */
function showCategorySelect() {
    const container = document.getElementById('category-select-container');
    if (!container) return;

    container.innerHTML = '';

    quizDatabase.categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.style.borderLeft = `4px solid ${category.color}`;
        categoryCard.innerHTML = `
            <div class="category-icon">${category.icon}</div>
            <h3>${category.name}</h3>
            <p>${category.description}</p>
            <button class="btn btn-primary" onclick="startQuiz('category', '${category.id}')">
                この カテゴリで学習
            </button>
        `;
        container.appendChild(categoryCard);
    });

    // ホームボタンを追加
    const categoryScreen = document.getElementById('category-select');
    if (categoryScreen) {
        addHomeButton(categoryScreen.querySelector('.container'));
    }

    showScreen('category-select');
}

/**
 * 問題演習開始
 * @param {string} mode - 'random' または 'category'
 * @param {string} categoryId - カテゴリID（category mode時）
 */
function startQuiz(mode, categoryId = null) {
    // 問題セット作成
    let questions = [];

    if (mode === 'random') {
        // ランダムに20問選択
        questions = shuffleArray([...quizDatabase.quizzes]).slice(0, 20);
    } else if (mode === 'category' && categoryId) {
        // 指定カテゴリの問題を全て取得
        const categoryName = quizDatabase.categories.find(c => c.id === categoryId)?.name;
        questions = quizDatabase.quizzes.filter(q => q.category === categoryName);

        if (questions.length === 0) {
            showError('このカテゴリの問題が見つかりません');
            return;
        }

        // 問題数が多い場合は20問に制限
        if (questions.length > 20) {
            questions = shuffleArray(questions).slice(0, 20);
        }
    }

    // クイズ状態初期化
    currentQuiz = questions;
    currentQuestionIndex = 0;
    userAnswers = new Array(questions.length).fill(null);
    mockExamMode = false;
    startTime = Date.now();

    // 問題画面表示
    showScreen('quiz');
    displayQuestion();
}

/**
 * 模擬試験選択画面表示
 */
function showMockExamSelect() {
    const container = document.getElementById('mock-exam-list');
    if (!container) return;

    container.innerHTML = '';

    quizDatabase.mockExams.forEach(exam => {
        const examCard = document.createElement('div');
        examCard.className = 'mock-exam-card';
        examCard.innerHTML = `
            <h3>${exam.title}</h3>
            <div class="exam-info">
                <span class="badge">難易度: ${exam.difficulty}</span>
                <span class="badge">問題数: ${exam.questions.length}問</span>
                <span class="badge">制限時間: ${exam.timeLimit}分</span>
            </div>
            <p>合格点: ${exam.passingScore}問以上正解（${Math.round(exam.passingScore / exam.questions.length * 100)}%）</p>
            <button class="btn btn-danger" onclick="startMockExam('${exam.id}')">
                この模擬試験を開始
            </button>
        `;
        container.appendChild(examCard);
    });

    // ホームボタンを追加
    const mockExamScreen = document.getElementById('mock-exam-select');
    if (mockExamScreen) {
        addHomeButton(mockExamScreen.querySelector('.container'));
    }

    showScreen('mock-exam-select');
}

/**
 * 模擬試験開始
 * @param {string} examId - 模擬試験ID
 */
function startMockExam(examId) {
    const exam = quizDatabase.mockExams.find(e => e.id === examId);
    if (!exam) {
        showError('模擬試験が見つかりません');
        return;
    }

    // 問題IDから実際の問題を取得
    const questions = exam.questions.map(qid =>
        quizDatabase.quizzes.find(q => q.id === qid)
    ).filter(q => q !== undefined);

    if (questions.length !== exam.questions.length) {
        showError('一部の問題が見つかりません');
        return;
    }

    // 模擬試験モードで開始
    currentQuiz = questions;
    currentQuestionIndex = 0;
    userAnswers = new Array(questions.length).fill(null);
    mockExamMode = true;
    startTime = Date.now();

    // タイマー開始
    startTimer(exam.timeLimit * 60); // 分を秒に変換

    // 問題画面表示
    showScreen('quiz');
    displayQuestion();

    showSuccess(`模擬試験を開始しました！制限時間: ${exam.timeLimit}分`);
}

/**
 * 現在の問題を表示
 */
function displayQuestion() {
    if (!currentQuiz || currentQuestionIndex >= currentQuiz.length) {
        return;
    }

    const question = currentQuiz[currentQuestionIndex];
    const container = document.getElementById('quiz-container');

    if (!container) return;

    // 問題番号表示
    document.getElementById('question-number').textContent =
        `問題 ${currentQuestionIndex + 1} / ${currentQuiz.length}`;

    // カテゴリバッジ
    const category = quizDatabase.categories.find(c =>
        c.name === question.category || c.id === question.category
    );

    // 問題HTML生成
    container.innerHTML = `
        <div class="question-card">
            <div class="question-header">
                <span class="category-badge" style="background: ${category?.color || '#999'}">
                    ${category?.icon || ''} ${question.category}
                </span>
                <span class="difficulty-badge difficulty-${question.difficulty}">
                    ${question.difficulty}
                </span>
                ${question.trap ? '<span class="trap-badge">⚠️ 引っかけ</span>' : ''}
            </div>

            <h2 class="question-text">${question.question}</h2>

            <div class="choices-container" role="radiogroup" aria-label="選択肢">
                ${question.choices.map((choice, index) => `
                    <button
                        class="choice-btn ${userAnswers[currentQuestionIndex] === index ? 'selected' : ''}"
                        data-index="${index}"
                        onclick="selectAnswer(${index})"
                        role="radio"
                        aria-checked="${userAnswers[currentQuestionIndex] === index ? 'true' : 'false'}"
                        aria-label="選択肢${index + 1}: ${choice}"
                    >
                        <span class="choice-number" aria-hidden="true">${index + 1}</span>
                        <span class="choice-text">${choice}</span>
                    </button>
                `).join('')}
            </div>

            <div id="explanation-container" style="display: none;">
                <div class="explanation-box">
                    <h3>解説</h3>
                    <p>${question.explanation}</p>
                </div>
            </div>
        </div>
    `;

    // quiz画面の上部にホームボタンを追加
    const quizScreen = document.getElementById('quiz');
    if (quizScreen) {
        const quizContainer = quizScreen.querySelector('.container');
        if (quizContainer) {
            addHomeButton(quizContainer);
        }
    }

    // ナビゲーションボタン制御
    updateNavigationButtons();

    // 進捗バー更新
    updateProgressBar();
}

/**
 * 解答を選択
 * @param {number} index - 選択肢のインデックス
 */
function selectAnswer(index) {
    // 解答を記録
    userAnswers[currentQuestionIndex] = index;

    // 選択状態を視覚的に更新
    document.querySelectorAll('.choice-btn').forEach((btn, i) => {
        if (i === index) {
            btn.classList.add('selected');
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.classList.remove('selected');
            btn.setAttribute('aria-pressed', 'false');
        }
    });

    // 模擬試験モードでない場合は即座に解説表示
    if (!mockExamMode) {
        showExplanation();
    }

    updateNavigationButtons();

    // アクセシビリティ: 選択を通知
    if (typeof accessibilityManager !== 'undefined') {
        accessibilityManager.announce(`選択肢${index + 1}を選択しました`);
    }
}

/**
 * 解説を表示
 */
function showExplanation() {
    const question = currentQuiz[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestionIndex];

    if (userAnswer === null) return;

    const isCorrect = userAnswer === question.answer;

    // 選択肢に正解/不正解の色付け
    document.querySelectorAll('.choice-btn').forEach((btn, index) => {
        if (index === question.answer) {
            btn.classList.add('correct');
            btn.setAttribute('aria-label', `正解: ${question.choices[index]}`);
        } else if (index === userAnswer && !isCorrect) {
            btn.classList.add('incorrect');
            btn.setAttribute('aria-label', `不正解: ${question.choices[index]}`);
        }
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
    });

    // 解説エリア表示
    const explanationContainer = document.getElementById('explanation-container');
    if (explanationContainer) {
        explanationContainer.style.display = 'block';
        explanationContainer.className = `explanation-box ${isCorrect ? 'correct' : 'incorrect'}`;
        explanationContainer.setAttribute('role', 'alert');
        explanationContainer.setAttribute('aria-live', 'assertive');
        explanationContainer.innerHTML = `
            <div class="result-icon">${isCorrect ? '✅ 正解！' : '❌ 不正解'}</div>
            <p class="correct-answer">正解: ${question.choices[question.answer]}</p>
            <h4>解説</h4>
            <p>${question.explanation}</p>
            ${question.trap ? '<p class="trap-warning">⚠️ この問題は引っかけ問題です。注意して覚えましょう。</p>' : ''}
        `;
    }

    // アクセシビリティ: 結果を通知・効果音
    if (typeof accessibilityManager !== 'undefined') {
        const message = isCorrect ?
            `正解です！正解は${question.choices[question.answer]}です` :
            `不正解です。正解は${question.choices[question.answer]}です`;
        accessibilityManager.announce(message, 'assertive');
        accessibilityManager.playSound(isCorrect ? 'correct' : 'incorrect');
    }
}

/**
 * 次の問題へ
 */
function nextQuestion() {
    if (currentQuestionIndex < currentQuiz.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
}

/**
 * 前の問題へ
 */
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

/**
 * ナビゲーションボタン更新
 */
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-question');
    const nextBtn = document.getElementById('next-question');
    const finishBtn = document.getElementById('finish-quiz');

    if (prevBtn) {
        const isDisabled = currentQuestionIndex === 0;
        prevBtn.disabled = isDisabled;
        prevBtn.setAttribute('aria-disabled', isDisabled ? 'true' : 'false');
    }

    if (nextBtn && finishBtn) {
        if (currentQuestionIndex === currentQuiz.length - 1) {
            nextBtn.style.display = 'none';
            nextBtn.setAttribute('aria-hidden', 'true');
            finishBtn.style.display = 'block';
            finishBtn.setAttribute('aria-hidden', 'false');
        } else {
            nextBtn.style.display = 'block';
            nextBtn.setAttribute('aria-hidden', 'false');
            finishBtn.style.display = 'none';
            finishBtn.setAttribute('aria-hidden', 'true');
        }
    }
}

/**
 * 進捗バー更新
 */
function updateProgressBar() {
    const progressBar = document.getElementById('quiz-progress-bar');
    if (!progressBar) return;

    const answeredCount = userAnswers.filter(a => a !== null).length;
    const progress = Math.round((answeredCount / currentQuiz.length) * 100);

    progressBar.style.width = `${progress}%`;
    progressBar.textContent = `${answeredCount} / ${currentQuiz.length}問回答済み`;

    // ARIA属性を更新
    const progressBarContainer = progressBar.parentElement;
    if (progressBarContainer) {
        progressBarContainer.setAttribute('role', 'progressbar');
        progressBarContainer.setAttribute('aria-valuenow', progress);
        progressBarContainer.setAttribute('aria-valuemin', '0');
        progressBarContainer.setAttribute('aria-valuemax', '100');
        progressBarContainer.setAttribute('aria-label', `問題の進捗: ${answeredCount}問中${currentQuiz.length}問回答済み`);
    }
}

/**
 * 問題演習終了
 */
function finishQuiz() {
    // 未回答チェック
    const unansweredCount = userAnswers.filter(a => a === null).length;
    if (unansweredCount > 0) {
        const confirm = window.confirm(`${unansweredCount}問が未回答です。本当に終了しますか？`);
        if (!confirm) return;
    }

    // タイマー停止
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // 結果集計
    const results = calculateResults();

    // 進捗保存
    saveProgress(results);

    // 結果画面表示
    displayResults(results);
}

/**
 * 結果を計算
 * @returns {object} 結果データ
 */
function calculateResults() {
    let correctCount = 0;
    const categoryResults = {};
    const incorrectQuestions = [];

    currentQuiz.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.answer;

        if (isCorrect) {
            correctCount++;
        } else {
            incorrectQuestions.push({
                question,
                userAnswer,
                index
            });
        }

        // カテゴリ別集計
        const category = question.category;
        if (!categoryResults[category]) {
            categoryResults[category] = { correct: 0, total: 0 };
        }
        categoryResults[category].total++;
        if (isCorrect) {
            categoryResults[category].correct++;
        }
    });

    const totalQuestions = currentQuiz.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

    return {
        correctCount,
        totalQuestions,
        scorePercentage,
        categoryResults,
        incorrectQuestions,
        elapsedTime,
        passed: mockExamMode ? correctCount >= 21 : scorePercentage >= 70
    };
}

/**
 * 結果を表示
 * @param {object} results - 結果データ
 */
function displayResults(results) {
    const container = document.getElementById('results-container');
    if (!container) return;

    const passMessage = results.passed ?
        '🎉 合格基準を満たしています！' :
        '📚 もう少し頑張りましょう';

    const timeFormatted = formatTime(results.elapsedTime);

    container.innerHTML = `
        <div class="results-card ${results.passed ? 'passed' : 'failed'}">
            <h2>${passMessage}</h2>

            <div class="score-display">
                <div class="score-circle">
                    <span class="score-value">${results.scorePercentage}</span>
                    <span class="score-unit">%</span>
                </div>
                <p>${results.correctCount} / ${results.totalQuestions} 問正解</p>
            </div>

            <div class="result-details">
                <div class="detail-item">
                    <span class="label">所要時間</span>
                    <span class="value">${timeFormatted}</span>
                </div>
                ${mockExamMode ? `
                <div class="detail-item">
                    <span class="label">合格基準</span>
                    <span class="value">21問以上（70%）</span>
                </div>
                ` : ''}
            </div>

            <h3>カテゴリ別正答率</h3>
            <div class="category-results">
                ${Object.entries(results.categoryResults).map(([category, data]) => {
                    const percentage = Math.round((data.correct / data.total) * 100);
                    const categoryData = quizDatabase.categories.find(c => c.name === category || c.id === category);
                    return `
                        <div class="category-result-item">
                            <span class="category-name">
                                ${categoryData?.icon || ''} ${category}
                            </span>
                            <div class="category-progress">
                                <div class="progress-bar-small" style="width: ${percentage}%; background: ${categoryData?.color || '#999'}"></div>
                            </div>
                            <span class="category-score">${data.correct}/${data.total} (${percentage}%)</span>
                        </div>
                    `;
                }).join('')}
            </div>

            ${results.incorrectQuestions.length > 0 ? `
                <h3>間違えた問題（${results.incorrectQuestions.length}問）</h3>
                <div class="incorrect-questions-list">
                    ${results.incorrectQuestions.map(item => `
                        <div class="incorrect-question-item">
                            <p class="question-text-small">Q${item.index + 1}: ${item.question.question}</p>
                            <p class="your-answer">あなたの回答: ${item.userAnswer !== null ? item.question.choices[item.userAnswer] : '未回答'}</p>
                            <p class="correct-answer-small">正解: ${item.question.choices[item.question.answer]}</p>
                        </div>
                    `).join('')}
                </div>
            ` : '<p class="perfect-message">🌟 全問正解！素晴らしいです！</p>'}

            <div class="result-actions">
                <button class="btn btn-primary" onclick="showScreen('home')">ホームに戻る</button>
                <button class="btn btn-secondary" onclick="reviewIncorrect()">間違えた問題を復習</button>
            </div>
        </div>
    `;

    // 結果画面の上部にもホームボタンを追加
    const resultsScreen = document.getElementById('results');
    if (resultsScreen) {
        const resultsContainer = resultsScreen.querySelector('.container');
        if (resultsContainer) {
            addHomeButton(resultsContainer);
        }
    }

    showScreen('results');
}

/**
 * 進捗を保存（統一データ構造を使用）
 * @param {object} results - 結果データ
 */
function saveProgress(results) {
    const progress = JSON.parse(localStorage.getItem('huntingProgress'));

    progress.totalQuestions += results.totalQuestions;
    progress.correctAnswers += results.correctCount;
    progress.lastStudyDate = new Date().toISOString();
    progress.studyTime += results.elapsedTime;

    // カテゴリ別統計更新（統一形式に変換）
    const categoryMap = {
        '法令': 'law',
        '猟具': 'tools',
        '鳥獣': 'animals',
        '鳥獣保護管理': 'management',
        '実技': 'practical'
    };

    Object.entries(results.categoryResults).forEach(([category, data]) => {
        const mappedCategory = categoryMap[category] || category.toLowerCase();
        if (!progress.categories[mappedCategory]) {
            progress.categories[mappedCategory] = { correct: 0, total: 0 };
        }
        progress.categories[mappedCategory].correct += data.correct;
        progress.categories[mappedCategory].total += data.total;
    });

    // 履歴追加
    progress.quizHistory.push({
        date: new Date().toISOString(),
        type: mockExamMode ? 'mock_exam' : 'practice',
        score: results.scorePercentage,
        correctCount: results.correctCount,
        totalQuestions: results.totalQuestions,
        timeSpent: results.elapsedTime
    });

    // 履歴は最新30件まで
    if (progress.quizHistory.length > 30) {
        progress.quizHistory = progress.quizHistory.slice(-30);
    }

    localStorage.setItem('huntingProgress', JSON.stringify(progress));
}

/**
 * 間違えた問題を復習
 */
function reviewIncorrect() {
    const incorrectQuestions = [];

    currentQuiz.forEach((question, index) => {
        if (userAnswers[index] !== question.answer) {
            incorrectQuestions.push(question);
        }
    });

    if (incorrectQuestions.length === 0) {
        showSuccess('間違えた問題はありません！');
        return;
    }

    // 間違えた問題で新しいクイズを開始
    currentQuiz = incorrectQuestions;
    currentQuestionIndex = 0;
    userAnswers = new Array(incorrectQuestions.length).fill(null);
    mockExamMode = false;
    startTime = Date.now();

    showScreen('quiz');
    displayQuestion();
    showSuccess('間違えた問題の復習を開始します');
}

// ================================================================================
// タイマー機能
// ================================================================================

/**
 * タイマー開始
 * @param {number} seconds - 制限時間（秒）
 */
function startTimer(seconds) {
    let remainingTime = seconds;
    const timerDisplay = document.getElementById('timer-display');

    if (!timerDisplay) return;

    timerDisplay.style.display = 'block';

    timerInterval = setInterval(() => {
        remainingTime--;

        const minutes = Math.floor(remainingTime / 60);
        const secs = remainingTime % 60;
        timerDisplay.textContent = `残り時間: ${minutes}:${secs.toString().padStart(2, '0')}`;

        // 5分切ったら赤色に
        if (remainingTime <= 300) {
            timerDisplay.style.color = '#e74c3c';
        }

        // 時間切れ
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            alert('制限時間終了です！');
            finishQuiz();
        }
    }, 1000);
}

/**
 * 時間をフォーマット
 * @param {number} seconds - 秒数
 * @returns {string} フォーマット済み時間
 */
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}時間${minutes}分${secs}秒`;
    } else if (minutes > 0) {
        return `${minutes}分${secs}秒`;
    } else {
        return `${secs}秒`;
    }
}

// ================================================================================
// 鳥獣図鑑
// ================================================================================

/**
 * 鳥獣図鑑を読み込み
 */
function loadEncyclopedia() {
    const container = document.getElementById('encyclopedia-container');
    if (!container || !huntingData) return;

    container.innerHTML = '';

    // 狩猟鳥類
    const huntableBirdsSection = createAnimalSection('狩猟可能な鳥類', huntingData.gameAnimals.birds, true);
    container.appendChild(huntableBirdsSection);

    // 非狩猟鳥類
    const nonHuntableBirdsSection = createAnimalSection('狩猟禁止の鳥類', huntingData.gameAnimals.nonHuntableBirds, false);
    container.appendChild(nonHuntableBirdsSection);

    // 狩猟獣類
    const huntableMammalsSection = createAnimalSection('狩猟可能な獣類', huntingData.gameAnimals.mammals, true);
    container.appendChild(huntableMammalsSection);

    // 非狩猟獣類
    const nonHuntableMammalsSection = createAnimalSection('狩猟禁止の獣類', huntingData.gameAnimals.nonHuntableMammals, false);
    container.appendChild(nonHuntableMammalsSection);
}

/**
 * 動物セクションを作成
 * @param {string} title - セクションタイトル
 * @param {array} animals - 動物データ配列
 * @param {boolean} huntable - 狩猟可能か
 * @returns {HTMLElement} セクション要素
 */
function createAnimalSection(title, animals, huntable) {
    const section = document.createElement('div');
    section.className = 'animal-section';

    const header = document.createElement('h2');
    header.className = huntable ? 'huntable-title' : 'non-huntable-title';
    header.textContent = title;
    section.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'animal-grid';

    animals.forEach(animal => {
        const card = createAnimalCard(animal, huntable);
        grid.appendChild(card);
    });

    section.appendChild(grid);
    return section;
}

/**
 * 動物カードを作成
 * @param {object} animal - 動物データ
 * @param {boolean} huntable - 狩猟可能か
 * @returns {HTMLElement} カード要素
 */
function createAnimalCard(animal, huntable) {
    const card = document.createElement('article');
    card.className = `animal-card ${huntable ? 'huntable' : 'non-huntable'}`;
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', `${animal.name}: ${huntable ? '狩猟可能' : '保護対象'}`);

    card.innerHTML = `
        <div class="animal-card-header">
            <h3>${animal.name}</h3>
            ${animal.category ? `<span class="animal-category" aria-label="カテゴリ: ${animal.category}">${animal.category}</span>` : ''}
        </div>

        ${animal.size ? `<p class="animal-size">サイズ: ${animal.size}</p>` : ''}

        <div class="animal-features">
            <h4>特徴</h4>
            <ul>
                ${animal.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
        </div>

        ${animal.danger ? `
            <div class="danger-level danger-${animal.danger}" role="status" aria-label="危険度: ${animal.danger}">
                危険度: ${animal.danger}
            </div>
        ` : ''}

        ${animal.note ? `<p class="animal-note" role="note"><span aria-hidden="true">⚠️</span> ${animal.note}</p>` : ''}
        ${animal.tip ? `<p class="animal-tip" role="note"><span aria-hidden="true">💡</span> ${animal.tip}</p>` : ''}
        ${animal.reason ? `<p class="animal-reason">保護理由: ${animal.reason}</p>` : ''}

        <div class="huntable-status ${huntable ? 'status-huntable' : 'status-protected'}" role="status">
            <span aria-hidden="true">${huntable ? '✅' : '🛡️'}</span>
            ${huntable ? '狩猟可能' : '保護対象'}
        </div>
    `;

    return card;
}

/**
 * 動物を検索でフィルタ
 * @param {string} searchTerm - 検索語
 */
function filterAnimals(searchTerm) {
    const cards = document.querySelectorAll('.animal-card');
    const lowerSearch = searchTerm.toLowerCase();

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(lowerSearch)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * 動物をカテゴリでフィルタ
 * @param {string} category - カテゴリ
 */
function filterAnimalsByCategory(category) {
    const sections = document.querySelectorAll('.animal-section');

    if (category === 'all') {
        sections.forEach(section => section.style.display = 'block');
        return;
    }

    sections.forEach(section => {
        const title = section.querySelector('h2').textContent;
        if (title.includes(category)) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}

// ================================================================================
// 進捗管理
// ================================================================================

/**
 * ホーム画面の統計情報を更新
 */
function updateHomeStats() {
    const progress = JSON.parse(localStorage.getItem('huntingProgress'));

    const totalQuestionsEl = document.getElementById('total-questions-stat');
    const accuracyEl = document.getElementById('accuracy-stat');
    const studyTimeEl = document.getElementById('study-time-stat');

    if (totalQuestionsEl) {
        totalQuestionsEl.textContent = progress.totalQuestions;
    }

    if (accuracyEl) {
        const accuracy = progress.totalQuestions > 0 ?
            Math.round((progress.correctAnswers / progress.totalQuestions) * 100) : 0;
        accuracyEl.textContent = `${accuracy}%`;
    }

    if (studyTimeEl) {
        const hours = Math.floor(progress.studyTime / 3600);
        const minutes = Math.floor((progress.studyTime % 3600) / 60);
        studyTimeEl.textContent = `${hours}時間${minutes}分`;
    }
}

/**
 * 進捗画面を更新
 */
function updateProgressScreen() {
    const progress = JSON.parse(localStorage.getItem('huntingProgress'));

    // 全体統計
    updateOverallStats(progress);

    // カテゴリ別統計
    updateCategoryStats(progress);

    // 学習履歴グラフ
    updateHistoryChart(progress);

    // 弱点分析
    updateWeakPointAnalysis(progress);
}

/**
 * 全体統計を更新
 * @param {object} progress - 進捗データ
 */
function updateOverallStats(progress) {
    const container = document.getElementById('overall-stats');
    if (!container) return;

    const accuracy = progress.totalQuestions > 0 ?
        Math.round((progress.correctAnswers / progress.totalQuestions) * 100) : 0;

    const hours = Math.floor(progress.studyTime / 3600);
    const minutes = Math.floor((progress.studyTime % 3600) / 60);

    container.innerHTML = `
        <div class="stat-card">
            <h3>総問題数</h3>
            <p class="stat-value">${progress.totalQuestions}</p>
            <p class="stat-label">問</p>
        </div>

        <div class="stat-card">
            <h3>正答率</h3>
            <p class="stat-value">${accuracy}</p>
            <p class="stat-label">%</p>
        </div>

        <div class="stat-card">
            <h3>学習時間</h3>
            <p class="stat-value">${hours}時間${minutes}分</p>
        </div>

        <div class="stat-card">
            <h3>正解数</h3>
            <p class="stat-value">${progress.correctAnswers}</p>
            <p class="stat-label">問</p>
        </div>
    `;
}

/**
 * カテゴリ別統計を更新
 * @param {object} progress - 進捗データ
 */
function updateCategoryStats(progress) {
    const container = document.getElementById('category-stats');
    if (!container) return;

    container.innerHTML = '<h3>カテゴリ別正答率</h3>';

    Object.entries(progress.categoryStats).forEach(([category, data]) => {
        const percentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
        const categoryData = quizDatabase.categories.find(c => c.name === category || c.id === category);

        const statItem = document.createElement('div');
        statItem.className = 'category-stat-item';
        statItem.innerHTML = `
            <div class="category-stat-header">
                <span class="category-name">${categoryData?.icon || ''} ${category}</span>
                <span class="category-score">${data.correct} / ${data.total} (${percentage}%)</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${percentage}%; background: ${categoryData?.color || '#999'}"></div>
            </div>
        `;
        container.appendChild(statItem);
    });
}

/**
 * 学習履歴グラフを更新
 * @param {object} progress - 進捗データ
 */
function updateHistoryChart(progress) {
    const canvas = document.getElementById('history-chart');
    if (!canvas || !progress.quizHistory || progress.quizHistory.length === 0) {
        return;
    }

    const ctx = canvas.getContext('2d');

    // グラフデータ準備
    const labels = progress.quizHistory.map((item, index) => {
        const date = new Date(item.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const scores = progress.quizHistory.map(item => item.score);

    // 簡易的な折れ線グラフを描画（Chart.jsがない場合の代替）
    drawSimpleLineChart(ctx, labels, scores, canvas.width, canvas.height);
}

/**
 * 簡易折れ線グラフを描画
 * @param {CanvasRenderingContext2D} ctx - キャンバスコンテキスト
 * @param {array} labels - ラベル配列
 * @param {array} data - データ配列
 * @param {number} width - 幅
 * @param {number} height - 高さ
 */
function drawSimpleLineChart(ctx, labels, data, width, height) {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // 背景
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);

    // グリッド線
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();

        // Y軸ラベル
        ctx.fillStyle = '#666';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${100 - i * 20}%`, padding - 10, y + 4);
    }

    // データポイントとライン
    if (data.length === 0) return;

    const stepX = chartWidth / (data.length - 1 || 1);

    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((value, index) => {
        const x = padding + stepX * index;
        const y = padding + chartHeight - (value / 100) * chartHeight;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        // データポイント
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // X軸ラベル
        ctx.fillStyle = '#666';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[index], x, height - padding + 20);
    });

    ctx.stroke();
}

/**
 * 弱点分析を更新
 * @param {object} progress - 進捗データ
 */
function updateWeakPointAnalysis(progress) {
    const container = document.getElementById('weak-points');
    if (!container) return;

    container.innerHTML = '<h3>弱点分析</h3>';

    // 正答率が低いカテゴリを抽出
    const weakCategories = Object.entries(progress.categoryStats)
        .map(([category, data]) => ({
            category,
            accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 100,
            total: data.total
        }))
        .filter(item => item.total >= 3) // 3問以上解いたカテゴリのみ
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 3);

    if (weakCategories.length === 0) {
        container.innerHTML += '<p>まだ十分なデータがありません。問題をもっと解いてください。</p>';
        return;
    }

    weakCategories.forEach(item => {
        const categoryData = quizDatabase.categories.find(c => c.name === item.category || c.id === item.category);
        const weakItem = document.createElement('div');
        weakItem.className = 'weak-point-item';
        weakItem.innerHTML = `
            <div class="weak-category">
                ${categoryData?.icon || ''} ${item.category}
            </div>
            <div class="weak-stats">
                <span>正答率: ${Math.round(item.accuracy)}%</span>
                <span>解答数: ${item.total}問</span>
            </div>
            <button class="btn btn-small btn-primary" onclick="startQuiz('category', '${categoryData?.id || item.category}')">
                このカテゴリを復習
            </button>
        `;
        container.appendChild(weakItem);
    });
}

/**
 * 進捗表示を更新（ホーム画面用の簡易版）
 */
function updateProgressDisplay() {
    updateHomeStats();
    updateIndexProgressDisplay();
}

/**
 * index.htmlの進捗セクションを更新
 */
function updateIndexProgressDisplay() {
    const progress = JSON.parse(localStorage.getItem('huntingProgress'));

    // 総合正答率
    const overallAccuracy = progress.totalQuestions > 0 ?
        Math.round((progress.correctAnswers / progress.totalQuestions) * 100) : 0;

    const overallAccuracyEl = document.getElementById('overall-accuracy');
    const overallAccuracyBarEl = document.getElementById('overall-accuracy-bar');

    if (overallAccuracyEl) {
        overallAccuracyEl.textContent = overallAccuracy;
    }
    if (overallAccuracyBarEl) {
        overallAccuracyBarEl.style.width = `${overallAccuracy}%`;
        overallAccuracyBarEl.parentElement.setAttribute('aria-valuenow', overallAccuracy);
    }

    // 累計学習時間（時間単位）
    const totalHours = Math.floor(progress.studyTime / 3600);
    const totalMinutes = Math.floor((progress.studyTime % 3600) / 60);
    const studyTimeText = totalHours > 0 ? `${totalHours}時間${totalMinutes}分` : `${totalMinutes}分`;

    const studyTimeEl = document.getElementById('total-study-time');
    if (studyTimeEl) {
        studyTimeEl.textContent = studyTimeText;
    }

    // 総解答数
    const totalAnswersEl = document.getElementById('total-answers');
    if (totalAnswersEl) {
        totalAnswersEl.textContent = progress.totalQuestions;
    }

    // 合格予測
    const passPredictionEl = document.getElementById('pass-prediction');
    const predictionStatusEl = document.getElementById('prediction-status');

    if (passPredictionEl && predictionStatusEl) {
        if (progress.totalQuestions >= 50) {
            // 50問以上解答している場合のみ予測を表示
            const passPrediction = calculatePassPrediction(
                overallAccuracy,
                progress.totalQuestions
            );

            passPredictionEl.textContent = passPrediction + '%';

            // ステータステキストの更新
            if (passPrediction >= 80) {
                predictionStatusEl.textContent = '合格圏内です！';
                predictionStatusEl.style.color = '#27ae60';
            } else if (passPrediction >= 60) {
                predictionStatusEl.textContent = 'もう一息です';
                predictionStatusEl.style.color = '#f39c12';
            } else {
                predictionStatusEl.textContent = 'さらに学習が必要です';
                predictionStatusEl.style.color = '#e74c3c';
            }
        } else {
            // 50問未満の場合
            passPredictionEl.textContent = '--';
            predictionStatusEl.textContent = '50問以上解答すると表示されます';
            predictionStatusEl.style.color = '#95a5a6';
        }
    }

    // カテゴリ別正答率
    updateIndexCategoryProgress(progress);

    // 弱点分析
    updateIndexWeaknessAnalysis(progress);
}

/**
 * 合格可能性を計算
 * @param {number} accuracy - 総合正答率（%）
 * @param {number} totalQuestions - 総解答数
 * @returns {number} 合格可能性（0-100%）
 */
function calculatePassPrediction(accuracy, totalQuestions) {
    // 学習量ファクター（最大300問で1.0）
    const volumeFactor = Math.min(totalQuestions / 300, 1.0);

    // 正答率ファクター（合格ライン70%を基準）
    const accuracyFactor = accuracy / 70;

    // 合格可能性を計算（0-100%）
    let prediction = volumeFactor * accuracyFactor * 100;

    // 調整: 正答率が高い場合はボーナス
    if (accuracy >= 80) {
        prediction = Math.min(prediction + 10, 100);
    }

    // 調整: 学習量が十分な場合はボーナス
    if (totalQuestions >= 200) {
        prediction = Math.min(prediction + 5, 100);
    }

    return Math.round(prediction);
}

/**
 * index.htmlのカテゴリ別正答率を更新
 * @param {object} progress - 進捗データ
 */
function updateIndexCategoryProgress(progress) {
    const categoryMapping = {
        '法令': 'law',
        '猟具': 'tools',
        '鳥獣識別': 'animals',
        '保護管理': 'conservation',
        '実技': 'practical'
    };

    Object.entries(categoryMapping).forEach(([categoryName, categoryId]) => {
        const scoreEl = document.getElementById(`category-${categoryId}-score`);
        const barEl = document.getElementById(`category-${categoryId}-bar`);

        const categoryData = progress.categoryStats[categoryName];

        if (categoryData && categoryData.total > 0) {
            const accuracy = Math.round((categoryData.correct / categoryData.total) * 100);

            if (scoreEl) {
                scoreEl.textContent = `${accuracy}% (${categoryData.correct}/${categoryData.total})`;
            }
            if (barEl) {
                barEl.style.width = `${accuracy}%`;
                barEl.parentElement.setAttribute('aria-valuenow', accuracy);
            }
        } else {
            if (scoreEl) {
                scoreEl.textContent = '未実施';
            }
            if (barEl) {
                barEl.style.width = '0%';
                barEl.parentElement.setAttribute('aria-valuenow', 0);
            }
        }
    });
}

/**
 * index.htmlの弱点分析を更新
 * @param {object} progress - 進捗データ
 */
function updateIndexWeaknessAnalysis(progress) {
    const weaknessListEl = document.querySelector('[data-weakness-list]');
    if (!weaknessListEl) return;

    // 正答率が低いカテゴリを抽出（3問以上解答したもののみ）
    const weakCategories = Object.entries(progress.categoryStats)
        .map(([category, data]) => ({
            category,
            accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 100,
            total: data.total
        }))
        .filter(item => item.total >= 3)
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 3);

    if (weakCategories.length === 0) {
        weaknessListEl.innerHTML = '<p class="weakness-placeholder">学習データが蓄積されると、弱点カテゴリを自動で分析します</p>';
        return;
    }

    weaknessListEl.innerHTML = weakCategories.map(item => `
        <div class="weakness-item">
            <div class="weakness-header">
                <span class="weakness-category">${item.category}</span>
                <span class="weakness-score">${Math.round(item.accuracy)}%</span>
            </div>
            <p class="weakness-note">解答数: ${item.total}問 | 重点的な復習が必要です</p>
        </div>
    `).join('');
}

// ================================================================================
// 学習計画
// ================================================================================

/**
 * 学習計画を読み込み
 */
function loadStudyPlan() {
    const container = document.getElementById('study-plan-container');
    if (!container || !huntingData) return;

    container.innerHTML = '';

    // 初心者向けパス
    const beginnerSection = document.createElement('div');
    beginnerSection.className = 'study-plan-section';
    beginnerSection.innerHTML = '<h2>📅 3週間学習プラン</h2>';

    huntingData.studyPlan.beginnerPath.forEach((week, index) => {
        const weekCard = document.createElement('div');
        weekCard.className = 'study-week-card';
        weekCard.innerHTML = `
            <h3>第${week.week}週: ${week.focus}</h3>
            <p class="goal-score">目標正答率: ${week.goalScore}</p>
            <h4>タスク</h4>
            <ul>
                ${week.tasks.map(task => `<li>${task}</li>`).join('')}
            </ul>
            <div class="week-progress">
                <label>
                    <input type="checkbox" id="week-${week.week}-complete"
                           ${isWeekComplete(week.week) ? 'checked' : ''}
                           onchange="toggleWeekComplete(${week.week})">
                    この週を完了する
                </label>
            </div>
        `;
        beginnerSection.appendChild(weekCard);
    });

    container.appendChild(beginnerSection);

    // 日課
    const dailySection = document.createElement('div');
    dailySection.className = 'study-plan-section';
    dailySection.innerHTML = `
        <h2>📝 日課（推奨）</h2>
        <div class="daily-routine">
            ${Object.entries(huntingData.studyPlan.dailyRoutine).map(([time, task]) => `
                <div class="routine-item">
                    <span class="routine-time">${translateTime(time)}</span>
                    <span class="routine-task">${task}</span>
                </div>
            `).join('')}
        </div>
    `;

    container.appendChild(dailySection);

    // 試験のヒント
    const tipsSection = document.createElement('div');
    tipsSection.className = 'study-plan-section';
    tipsSection.innerHTML = `
        <h2>💡 合格のコツ</h2>
        <ul class="tips-list">
            ${huntingData.examOverview.tips.map(tip => `<li>${tip}</li>`).join('')}
        </ul>
    `;

    container.appendChild(tipsSection);
}

/**
 * 週の完了状態を確認
 * @param {number} week - 週番号
 * @returns {boolean} 完了しているか
 */
function isWeekComplete(week) {
    const weekStatus = localStorage.getItem(`week-${week}-complete`);
    return weekStatus === 'true';
}

/**
 * 週の完了状態を切り替え
 * @param {number} week - 週番号
 */
function toggleWeekComplete(week) {
    const checkbox = document.getElementById(`week-${week}-complete`);
    localStorage.setItem(`week-${week}-complete`, checkbox.checked);

    if (checkbox.checked) {
        showSuccess(`第${week}週を完了しました！お疲れ様です！`);
    }
}

/**
 * 時間帯を日本語に変換
 * @param {string} time - 時間帯キー
 * @returns {string} 日本語の時間帯
 */
function translateTime(time) {
    const translations = {
        'morning': '朝',
        'commute': '通勤・通学時',
        'evening': '夕方',
        'beforeBed': '就寝前'
    };
    return translations[time] || time;
}

// ================================================================================
// ユーティリティ関数
// ================================================================================

/**
 * 配列をシャッフル（Fisher-Yatesアルゴリズム）
 * @param {array} array - シャッフルする配列
 * @returns {array} シャッフルされた配列
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * データをリセット（デバッグ用）
 */
function resetProgress() {
    if (confirm('本当に全ての進捗データをリセットしますか？この操作は取り消せません。')) {
        localStorage.removeItem('huntingProgress');
        initializeStorage();
        updateProgressDisplay();
        showSuccess('進捗データをリセットしました');
    }
}

// ================================================================================
// データエクスポート・インポート機能
// ================================================================================

/**
 * LocalStorageデータのエクスポート
 */
function exportProgress() {
    const progress = JSON.parse(localStorage.getItem('huntingProgress'));
    if (!progress) {
        alert('エクスポートする学習データがありません。');
        return;
    }

    const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        data: progress
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hunting-license-progress-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showSuccess('学習データをエクスポートしました');
}

/**
 * LocalStorageデータのインポート
 */
function importProgress() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importData = JSON.parse(event.target.result);

                // バージョンチェック
                if (!importData.version || !importData.data) {
                    throw new Error('不正なファイル形式です');
                }

                // 確認ダイアログ
                const confirmMsg = `インポートすると、現在の学習データが上書きされます。\n\nエクスポート日時: ${new Date(importData.exportDate).toLocaleString()}\n総解答数: ${importData.data.totalQuestions}問\n正答率: ${(importData.data.correctAnswers / importData.data.totalQuestions * 100).toFixed(1)}%\n\n続けますか？`;

                if (confirm(confirmMsg)) {
                    localStorage.setItem('huntingProgress', JSON.stringify(importData.data));
                    showSuccess('データのインポートが完了しました。ページを再読み込みします。');
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                }
            } catch (error) {
                showError('ファイルの読み込みに失敗しました: ' + error.message);
            }
        };
        reader.readAsText(file);
    };

    input.click();
}

/**
 * データのリセット（強化版）
 */
function resetAllProgress() {
    const confirmMsg = '本当に学習データをリセットしますか？\n\nこの操作は取り消せません。リセット前にデータをエクスポートすることを推奨します。';

    if (confirm(confirmMsg)) {
        const doubleConfirm = prompt('リセットを実行するには「リセット」と入力してください。');
        if (doubleConfirm === 'リセット') {
            localStorage.removeItem('huntingProgress');
            localStorage.removeItem('huntingGameStats');
            localStorage.removeItem('examHistory');
            localStorage.removeItem('notes');
            showSuccess('全ての学習データをリセットしました。ページを再読み込みします。');
            setTimeout(() => {
                location.reload();
            }, 1500);
        }
    }
}

// ================================================================================
// エクスポート（テスト用）
// ================================================================================

// グローバルスコープに必要な関数を公開
window.huntingLicenseApp = {
    startQuiz,
    startMockExam,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    finishQuiz,
    reviewIncorrect,
    showScreen,
    resetProgress,
    toggleWeekComplete,
    exportProgress,
    importProgress,
    resetAllProgress
};

// console.log('🦌 狩猟免許試験学習アプリ読み込み完了'); // 本番環境用にコメントアウト
