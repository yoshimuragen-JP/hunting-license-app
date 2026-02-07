'use strict';

/**
 * 狩猟免許試験学習アプリ - 模擬試験システム
 *
 * 本番試験と同じ形式で実力を測定
 *
 * 機能:
 * - 本番形式の模擬試験（30問、三肢択一）
 * - 制限時間90分のタイマー機能
 * - 問題ナビゲーション（全問題への即座のアクセス）
 * - マーキング機能（要確認問題のフラグ）
 * - 自動採点と詳細結果表示
 * - カテゴリ別成績分析
 * - 合格判定（70%ライン）
 * - 試験中断・再開機能（LocalStorage使用）
 *
 * @constant {Object} exam - 模擬試験システムのメインオブジェクト
 */
const exam = {
    // データ
    examData: null,
    userAnswers: {},
    markedQuestions: new Set(),
    currentQuestion: 0,
    startTime: null,
    endTime: null,
    timerInterval: null,

    /**
     * 模擬試験システムの初期化
     * 試験データ読み込みと中断状態の復元
     */
    async init() {
        await this.loadExamData();
        this.loadState();
    },

    /**
     * 試験問題データをquiz-database.jsonから読み込み
     * extended-quiz-database.jsonも統合
     * 問題IDから実際の問題オブジェクトを解決
     */
    async loadExamData() {
        try {
            const response = await fetch('../quiz-database.json');
            const data = await response.json();

            // extended-quiz-database.jsonも読み込んで統合
            try {
                const extendedResponse = await fetch('../extended-quiz-database.json');
                if (extendedResponse.ok) {
                    const extendedData = await extendedResponse.json();
                    if (extendedData.advancedQuizzes) {
                        data.quizzes = data.quizzes.concat(extendedData.advancedQuizzes);
                    }
                }
            } catch (extError) {
                console.warn('extended-quiz-database.jsonの読み込みスキップ:', extError);
            }

            // ultra-extended-quiz-database.jsonも読み込んで統合
            try {
                const ultraResponse = await fetch('../ultra-extended-quiz-database.json');
                if (ultraResponse.ok) {
                    const ultraData = await ultraResponse.json();
                    if (ultraData.ultraAdvancedQuizzes) {
                        data.quizzes = data.quizzes.concat(ultraData.ultraAdvancedQuizzes);
                    }
                }
            } catch (ultraError) {
                console.warn('ultra-extended-quiz-database.jsonの読み込みスキップ:', ultraError);
            }

            // quizzesをIDでマップ化（高速検索用）
            const quizMap = {};
            data.quizzes.forEach(quiz => {
                quizMap[quiz.id] = quiz;
            });

            // mockExams配列から試験を取得（URLパラメータまたはデフォルト0番目）
            const examIndex = this.getExamIndex();
            const mockExamTemplate = data.mockExams[examIndex];

            if (!mockExamTemplate) {
                throw new Error('模擬試験データが見つかりません');
            }

            // 問題IDから実際の問題オブジェクトを解決
            this.examData = {
                id: mockExamTemplate.id,
                title: mockExamTemplate.title,
                difficulty: mockExamTemplate.difficulty,
                timeLimit: mockExamTemplate.timeLimit,
                passingScore: mockExamTemplate.passingScore || 70, // 合格基準（デフォルト70%）
                questions: mockExamTemplate.questions.map(questionId => {
                    const quiz = quizMap[questionId];
                    if (!quiz) {
                        console.warn(`問題ID "${questionId}" が見つかりません`);
                        return null;
                    }
                    // mock-exam.js用の形式に変換
                    return {
                        id: quiz.id,
                        category: quiz.category,
                        difficulty: quiz.difficulty,
                        question: quiz.question,
                        options: quiz.choices, // "choices" を "options" にマッピング
                        correctAnswer: quiz.answer, // "answer" を "correctAnswer" にマッピング
                        explanation: quiz.explanation
                    };
                }).filter(q => q !== null) // 見つからなかった問題を除外
            };

            console.log(`✅ 模擬試験読み込み完了: ${this.examData.title} (${this.examData.questions.length}問)`);
        } catch (error) {
            console.error('データ読み込みエラー:', error);
            alert('試験データの読み込みに失敗しました。');
        }
    },

    /**
     * URLパラメータから試験インデックスを取得
     * @returns {number} 試験インデックス（デフォルト: 0）
     */
    getExamIndex() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('exam') || '0', 10);
    },

    /**
     * ショートカットキーを設定
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // 試験中のみ有効
            if (document.getElementById('exam-screen').style.display !== 'block') {
                return;
            }

            // Ctrl/Cmd + Enter で採点
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (document.getElementById('submit-btn').style.display === 'block') {
                    this.confirmSubmit();
                }
                return;
            }

            // 通常のショートカット
            switch(e.key.toLowerCase()) {
                case 'n': // Next
                    e.preventDefault();
                    this.nextQuestion();
                    break;
                case 'p': // Previous
                    e.preventDefault();
                    this.prevQuestion();
                    break;
                case 'f': // Flag/Mark
                    e.preventDefault();
                    this.toggleMark();
                    break;
                case '1':
                case '2':
                case '3':
                    // 数字キーで選択肢を選択
                    e.preventDefault();
                    const optIndex = parseInt(e.key) - 1;
                    const question = this.examData.questions[this.currentQuestion];
                    if (optIndex < question.options.length) {
                        this.selectAnswer(this.currentQuestion, optIndex);
                    }
                    break;
            }
        });
    },

    /**
     * 確認画面を表示（送信前に全問題を確認）
     */
    showConfirmationScreen() {
        const modal = document.getElementById('submit-modal');
        const messageEl = document.getElementById('unanswered-message');

        const totalQuestions = this.examData.questions.length;
        const answeredCount = Object.keys(this.userAnswers).length;
        const unansweredCount = totalQuestions - answeredCount;
        const markedCount = this.markedQuestions.size;

        let message = `<div style="text-align: left; line-height: 1.8;">`;
        message += `<p><strong>📊 回答状況</strong></p>`;
        message += `<p>回答済み: ${answeredCount}/${totalQuestions}問</p>`;
        if (unansweredCount > 0) {
            message += `<p style="color: #e74c3c;"><strong>未回答: ${unansweredCount}問</strong></p>`;
        }
        if (markedCount > 0) {
            message += `<p style="color: #ffc107;">⭐ 見直しマーク: ${markedCount}問</p>`;
        }
        message += `<p style="margin-top: 15px; color: #666;">このまま採点してよろしいですか？</p>`;
        message += `</div>`;

        messageEl.innerHTML = message;
        modal.classList.add('show');
    },

    /**
     * 模擬試験を開始
     * 回答状態をリセットし、タイマーを開始、最初の問題を表示
     */
    start() {
        this.userAnswers = {};
        this.markedQuestions = new Set();
        this.currentQuestion = 0;
        this.startTime = Date.now();
        this.endTime = null;

        this.showScreen('exam-screen');
        this.renderNavigation();
        this.showQuestion(0);
        this.startTimer();
        this.setupKeyboardShortcuts();
    },

    /**
     * 制限時間タイマーを開始（90分）
     * 残り時間を毎秒更新し、時間切れで自動採点
     * 残り10分で警告表示に切り替え
     * 経過時間も同時に表示
     */
    startTimer() {
        const timeLimit = this.examData.timeLimit * 60; // 秒に変換
        let elapsed = 0;

        this.timerInterval = setInterval(() => {
            elapsed++;
            const remaining = timeLimit - elapsed;

            if (remaining <= 0) {
                clearInterval(this.timerInterval);
                alert('試験時間が終了しました。自動的に採点します。');
                this.submitExam();
                return;
            }

            // 残り時間の表示
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            document.getElementById('time-display').textContent = display;

            // 経過時間の表示（Quality Guardian追加）
            const elapsedMinutes = Math.floor(elapsed / 60);
            const elapsedSeconds = elapsed % 60;
            const elapsedDisplay = `${elapsedMinutes}:${elapsedSeconds.toString().padStart(2, '0')}`;
            const elapsedTimeEl = document.getElementById('elapsed-time-display');
            if (elapsedTimeEl) {
                elapsedTimeEl.textContent = elapsedDisplay;
            }

            // 残り10分で警告表示
            const timerElement = document.getElementById('timer');
            if (remaining <= 600) {
                timerElement.classList.add('warning');
            }
        }, 1000);
    },

    // ナビゲーション描画
    renderNavigation() {
        const navGrid = document.getElementById('nav-grid');
        navGrid.innerHTML = '';

        this.examData.questions.forEach((q, index) => {
            const navItem = document.createElement('div');
            navItem.className = 'nav-item';
            navItem.textContent = index + 1;

            if (index === this.currentQuestion) {
                navItem.classList.add('current');
            }
            if (this.userAnswers[index] !== undefined) {
                navItem.classList.add('answered');
            }
            if (this.markedQuestions.has(index)) {
                navItem.classList.add('marked');
            }

            navItem.onclick = () => this.showQuestion(index);
            navGrid.appendChild(navItem);
        });
    },

    // 問題表示
    showQuestion(index) {
        this.currentQuestion = index;
        const question = this.examData.questions[index];

        document.getElementById('question-number').textContent = `問題 ${index + 1}`;
        document.getElementById('category-badge').textContent = question.category;
        document.getElementById('question-text').textContent = question.question;

        // 選択肢表示
        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, optIndex) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            if (this.userAnswers[index] === optIndex) {
                optionDiv.classList.add('selected');
            }

            optionDiv.innerHTML = `
                <div class="option-number">${optIndex + 1}</div>
                <div class="option-text">${option}</div>
            `;

            optionDiv.onclick = () => this.selectAnswer(index, optIndex);
            optionsContainer.appendChild(optionDiv);
        });

        // 見直しマークボタン
        const markBtn = document.getElementById('mark-btn');
        if (this.markedQuestions.has(index)) {
            markBtn.classList.add('marked');
            markBtn.textContent = '⭐ 見直しマーク済み';
        } else {
            markBtn.classList.remove('marked');
            markBtn.textContent = '⭐ 見直しマーク';
        }

        // 採点ボタン表示判定
        this.updateSubmitButton();

        this.renderNavigation();
        this.saveState();
    },

    // 回答選択
    selectAnswer(questionIndex, optionIndex) {
        this.userAnswers[questionIndex] = optionIndex;
        this.showQuestion(questionIndex);
    },

    // 見直しマークトグル
    toggleMark() {
        if (this.markedQuestions.has(this.currentQuestion)) {
            this.markedQuestions.delete(this.currentQuestion);
        } else {
            this.markedQuestions.add(this.currentQuestion);
        }
        this.showQuestion(this.currentQuestion);
    },

    // 前の問題
    prevQuestion() {
        if (this.currentQuestion > 0) {
            this.showQuestion(this.currentQuestion - 1);
        }
    },

    // 次の問題
    nextQuestion() {
        if (this.currentQuestion < this.examData.questions.length - 1) {
            this.showQuestion(this.currentQuestion + 1);
        }
    },

    // 採点ボタン表示更新
    updateSubmitButton() {
        const submitBtn = document.getElementById('submit-btn');
        const answeredCount = Object.keys(this.userAnswers).length;
        const totalQuestions = this.examData.questions.length;

        if (answeredCount === totalQuestions) {
            submitBtn.style.display = 'block';
        } else {
            submitBtn.style.display = 'none';
        }
    },

    // 採点確認
    confirmSubmit() {
        this.showConfirmationScreen();
    },

    // モーダルを閉じる
    closeModal() {
        document.getElementById('submit-modal').classList.remove('show');
    },

    // 採点実行
    submitExam() {
        this.closeModal();
        clearInterval(this.timerInterval);
        this.endTime = Date.now();

        // 採点
        const results = this.calculateResults();

        // 時間配分分析を追加
        results.timeAnalysis = this.analyzeTimeUsage(results);

        // 履歴に保存
        this.saveToHistory(results);

        // 結果表示
        this.showResults(results);
    },

    /**
     * 時間配分分析
     */
    analyzeTimeUsage(results) {
        const totalMinutes = Math.floor(results.timeUsed / 60);
        const avgTimePerQuestion = Math.floor(results.timeUsed / results.totalQuestions);
        const timeLimit = this.examData.timeLimit * 60;
        const timeRemaining = Math.max(0, timeLimit - results.timeUsed);

        return {
            totalMinutes,
            avgTimePerQuestion,
            timeRemaining: Math.floor(timeRemaining / 60),
            efficiency: results.timeUsed < timeLimit * 0.7 ? 'fast' :
                       results.timeUsed < timeLimit * 0.9 ? 'good' : 'slow'
        };
    },

    // 採点計算
    calculateResults() {
        let correctCount = 0;
        const wrongAnswers = [];
        const categoryStats = {};

        this.examData.questions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;

            if (isCorrect) {
                correctCount++;
            } else {
                wrongAnswers.push({
                    questionNum: index + 1,
                    question: question.question,
                    category: question.category,
                    userAnswer: userAnswer !== undefined ? question.options[userAnswer] : '未回答',
                    correctAnswer: question.options[question.correctAnswer],
                    explanation: question.explanation
                });
            }

            // カテゴリ別統計
            if (!categoryStats[question.category]) {
                categoryStats[question.category] = { correct: 0, total: 0 };
            }
            categoryStats[question.category].total++;
            if (isCorrect) {
                categoryStats[question.category].correct++;
            }
        });

        const totalQuestions = this.examData.questions.length;
        const score = Math.round((correctCount / totalQuestions) * 100);
        const passed = score >= this.examData.passingScore;
        const timeUsed = Math.floor((this.endTime - this.startTime) / 1000);

        return {
            correctCount,
            wrongCount: totalQuestions - correctCount,
            totalQuestions,
            score,
            passed,
            timeUsed,
            wrongAnswers,
            categoryStats
        };
    },

    // 結果表示
    showResults(results) {
        this.showScreen('result-screen');

        const resultHeader = document.getElementById('result-header');
        const resultTitle = document.getElementById('result-title');
        const scoreDisplay = document.getElementById('score-display');
        const resultMessage = document.getElementById('result-message');

        if (results.passed) {
            resultHeader.className = 'result-header pass';
            scoreDisplay.className = 'score-display pass';
            resultTitle.textContent = '🎉 合格おめでとうございます！';
            resultMessage.textContent = '基準点を上回りました。';

            // トースト通知（UX Enhancement）
            if (typeof window.UXEnhancements !== 'undefined') {
                setTimeout(() => {
                    window.UXEnhancements.showToast('🎉 合格おめでとうございます！', 'success', 4000);
                }, 500);
            }
        } else {
            resultHeader.className = 'result-header fail';
            scoreDisplay.className = 'score-display fail';
            resultTitle.textContent = '不合格';
            resultMessage.textContent = '次回は合格できるよう頑張りましょう。';

            // トースト通知（UX Enhancement）
            if (typeof window.UXEnhancements !== 'undefined') {
                setTimeout(() => {
                    window.UXEnhancements.showToast('もう一度チャレンジしましょう！', 'info', 3000);
                }, 500);
            }
        }

        scoreDisplay.textContent = `${results.score}%`;

        // 統計情報
        document.getElementById('correct-count').textContent = results.correctCount;
        document.getElementById('wrong-count').textContent = results.wrongCount;

        const minutes = Math.floor(results.timeUsed / 60);
        const seconds = results.timeUsed % 60;
        document.getElementById('time-used').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // 時間分析を追加
        if (results.timeAnalysis && document.getElementById('time-analysis')) {
            this.displayTimeAnalysis(results.timeAnalysis);
        }

        // カテゴリ別統計
        const categoryStatsContainer = document.getElementById('category-stats');
        categoryStatsContainer.innerHTML = '';

        // カテゴリをソートして弱点を強調
        const sortedCategories = Object.entries(results.categoryStats)
            .sort(([, a], [, b]) => (a.correct/a.total) - (b.correct/b.total));

        sortedCategories.forEach(([category, stats]) => {
            const percentage = Math.round((stats.correct / stats.total) * 100);
            const isWeak = percentage < 70;
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            if (isWeak) {
                categoryItem.style.borderLeft = '4px solid #e74c3c';
                categoryItem.style.background = '#fff5f5';
            }
            categoryItem.innerHTML = `
                <div class="category-item-header">
                    <span class="category-name">${isWeak ? '⚠️ ' : ''}${category}</span>
                    <span class="category-score">${stats.correct}/${stats.total} (${percentage}%)</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%; background: ${isWeak ? '#e74c3c' : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'}"></div>
                </div>
                ${isWeak ? '<div style="font-size: 0.9rem; color: #e74c3c; margin-top: 5px;">💡 重点的な復習をおすすめします</div>' : ''}
            `;
            categoryStatsContainer.appendChild(categoryItem);
        });

        // 弱点レポートを表示
        if (document.getElementById('weakness-report')) {
            this.displayWeaknessReport(results);
        }

        // 間違えた問題の解説
        if (results.wrongAnswers.length > 0) {
            document.getElementById('wrong-answers-section').style.display = 'block';
            document.getElementById('review-btn').style.display = 'inline-block';

            const wrongAnswersContainer = document.getElementById('wrong-answers');
            wrongAnswersContainer.innerHTML = '';

            results.wrongAnswers.forEach(wrong => {
                const wrongItem = document.createElement('div');
                wrongItem.className = 'wrong-answer-item';
                wrongItem.innerHTML = `
                    <div class="wrong-question-num">問題 ${wrong.questionNum} [${wrong.category}]</div>
                    <div class="wrong-question-text">${wrong.question}</div>
                    <div class="answer-comparison">
                        <div class="your-answer">
                            <div class="answer-label">❌ あなたの回答</div>
                            <div>${wrong.userAnswer}</div>
                        </div>
                        <div class="correct-answer">
                            <div class="answer-label">✅ 正解</div>
                            <div>${wrong.correctAnswer}</div>
                        </div>
                    </div>
                    <div class="explanation">
                        <div class="explanation-label">💡 解説</div>
                        <div>${wrong.explanation}</div>
                    </div>
                `;
                wrongAnswersContainer.appendChild(wrongItem);
            });
        } else {
            document.getElementById('wrong-answers-section').style.display = 'none';
            document.getElementById('review-btn').style.display = 'none';
        }
    },

    /**
     * 時間分析を表示
     */
    displayTimeAnalysis(timeAnalysis) {
        const container = document.getElementById('time-analysis');
        let efficiencyMessage = '';
        let efficiencyColor = '';

        switch(timeAnalysis.efficiency) {
            case 'fast':
                efficiencyMessage = '⚡ 効率的なペース配分でした！';
                efficiencyColor = '#27ae60';
                break;
            case 'good':
                efficiencyMessage = '👍 適切なペース配分です';
                efficiencyColor = '#667eea';
                break;
            case 'slow':
                efficiencyMessage = '⏰ 時間配分に注意が必要です';
                efficiencyColor = '#e74c3c';
                break;
        }

        container.innerHTML = `
            <div style="background: #f8f9ff; padding: 15px; border-radius: 10px; margin-top: 20px;">
                <div style="font-weight: bold; color: ${efficiencyColor}; margin-bottom: 10px;">${efficiencyMessage}</div>
                <div style="color: #666; font-size: 0.9rem;">
                    <p>1問あたりの平均時間: ${timeAnalysis.avgTimePerQuestion}秒</p>
                    ${timeAnalysis.timeRemaining > 0 ? `<p>余裕時間: ${timeAnalysis.timeRemaining}分</p>` : ''}
                </div>
            </div>
        `;
    },

    /**
     * 弱点レポートを表示
     */
    displayWeaknessReport(results) {
        const container = document.getElementById('weakness-report');
        const weakCategories = Object.entries(results.categoryStats)
            .filter(([, stats]) => (stats.correct / stats.total) * 100 < 70)
            .sort(([, a], [, b]) => (a.correct/a.total) - (b.correct/b.total));

        if (weakCategories.length === 0) {
            container.innerHTML = '<div style="color: #27ae60; text-align: center; padding: 20px;">✅ すべてのカテゴリで合格ライン到達！</div>';
            return;
        }

        let html = '<h4 style="color: #e74c3c; margin-bottom: 15px;">📌 優先的に復習すべき分野</h4>';
        weakCategories.forEach(([category, stats], index) => {
            const percentage = Math.round((stats.correct / stats.total) * 100);
            html += `
                <div style="background: #fff5f5; border-left: 4px solid #e74c3c; padding: 15px; margin-bottom: 10px; border-radius: 5px;">
                    <div style="font-weight: bold; color: #e74c3c;">第${index + 1}位: ${category} (${percentage}%)</div>
                    <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">
                        ${this.getStudySuggestion(category, percentage)}
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    },

    /**
     * カテゴリ別の学習アドバイス
     */
    getStudySuggestion(category, percentage) {
        const suggestions = {
            '法令': '狩猟に関する法令は暗記が重要です。過去問を繰り返し、重要条文を覚えましょう。',
            '猟具': '猟具の種類と取扱い方法を図解で復習しましょう。安全管理のポイントも重要です。',
            '鳥獣': '鳥獣の識別は写真で確認しながら特徴を覚えましょう。生態も合わせて学習すると記憶に定着します。',
            '鳥獣保護管理': '保護区や禁猟区の違い、猟期などの基本を整理しましょう。',
            '実技': '実技試験の流れと注意点を確認しましょう。鳥獣判別と距離測定が頻出です。'
        };

        return suggestions[category] || '過去問を中心に復習し、理解を深めましょう。';
    },

    // 履歴に保存（統一データ構造を使用）
    saveToHistory(results) {
        const progress = JSON.parse(localStorage.getItem('huntingProgress')) || this.initProgress();

        const record = {
            date: new Date().toISOString(),
            score: results.score,
            correctCount: results.correctCount,
            totalQuestions: results.totalQuestions,
            timeUsed: results.timeUsed,
            passed: results.passed,
            categoryStats: results.categoryStats,
            wrongAnswers: results.wrongAnswers
        };

        // 統一データ構造のexamHistoryに追加
        if (!progress.examHistory) {
            progress.examHistory = [];
        }
        progress.examHistory.push(record);

        // 総合進捗を更新
        progress.totalQuestions += results.totalQuestions;
        progress.correctAnswers += results.correctCount;
        progress.studyTime += results.timeUsed;
        progress.lastStudyDate = new Date().toISOString();

        // カテゴリ別進捗を更新
        const categoryMap = {
            '法令': 'law',
            '猟具': 'tools',
            '鳥獣': 'animals',
            '鳥獣保護管理': 'management',
            '実技': 'practical'
        };

        this.examData.questions.forEach((question, index) => {
            const category = categoryMap[question.category] || 'law';
            const isCorrect = this.userAnswers[index] === question.correctAnswer;

            if (!progress.categories[category]) {
                progress.categories[category] = { correct: 0, total: 0 };
            }
            progress.categories[category].total++;
            if (isCorrect) {
                progress.categories[category].correct++;
            }
        });

        // 学習履歴に追加
        progress.quizHistory.push({
            date: new Date().toISOString(),
            type: 'exam',
            score: results.score,
            correctCount: results.correctCount,
            totalQuestions: results.totalQuestions,
            timeSpent: results.timeUsed,
            passed: results.passed
        });

        // 履歴は最新30件まで
        if (progress.quizHistory.length > 30) {
            progress.quizHistory = progress.quizHistory.slice(-30);
        }

        localStorage.setItem('huntingProgress', JSON.stringify(progress));

        // 後方互換のため旧キーも残す（将来削除予定）
        const oldHistory = this.getHistory();
        oldHistory.push(record);
        localStorage.setItem('examHistory', JSON.stringify(oldHistory));
    },

    // 履歴取得（統一データ構造から取得）
    getHistory() {
        const progress = JSON.parse(localStorage.getItem('huntingProgress'));
        if (progress && progress.examHistory) {
            return progress.examHistory;
        }
        // 旧形式のフォールバック
        const historyJson = localStorage.getItem('examHistory');
        return historyJson ? JSON.parse(historyJson) : [];
    },

    // 初期化用のヘルパー関数
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
    },

    // 履歴表示
    showHistory() {
        this.showScreen('history-screen');
        const history = this.getHistory();
        const historyList = document.getElementById('history-list');

        if (history.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #666;">まだ受験履歴がありません。</p>';
            return;
        }

        historyList.innerHTML = '';
        history.reverse().forEach((record, index) => {
            const date = new Date(record.date);
            const dateStr = `${date.getFullYear()}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getDate().toString().padStart(2,'0')} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;

            const minutes = Math.floor(record.timeUsed / 60);
            const seconds = record.timeUsed % 60;
            const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-info">
                    <div class="history-date">${dateStr}</div>
                    <div>正解数: ${record.correctCount}/${record.totalQuestions} | 所要時間: ${timeStr}</div>
                </div>
                <div class="history-score ${record.passed ? 'pass' : 'fail'}">
                    ${record.score}%
                </div>
            `;
            historyList.appendChild(historyItem);
        });
    },

    // 履歴クリア
    clearHistory() {
        if (confirm('全ての履歴を削除してもよろしいですか？')) {
            localStorage.removeItem('examHistory');
            this.showHistory();
        }
    },

    // 間違えた問題を復習
    reviewWrongAnswers() {
        // 復習モードは実装可能だが、今回は結果画面で解説を表示済み
        alert('復習機能は結果画面の「間違えた問題の解説」セクションをご覧ください。');
    },

    // 再挑戦
    restart() {
        this.start();
    },

    // トップに戻る
    backToStart() {
        this.showScreen('start-screen');
    },

    // 画面切り替え
    showScreen(screenId) {
        const screens = ['start-screen', 'exam-screen', 'result-screen', 'history-screen'];
        screens.forEach(id => {
            document.getElementById(id).style.display = 'none';
        });
        document.getElementById(screenId).style.display = 'block';
    },

    // 状態保存（リロード対策）
    saveState() {
        const state = {
            userAnswers: this.userAnswers,
            markedQuestions: Array.from(this.markedQuestions),
            currentQuestion: this.currentQuestion,
            startTime: this.startTime
        };
        sessionStorage.setItem('examState', JSON.stringify(state));
    },

    // 状態復元
    loadState() {
        const stateJson = sessionStorage.getItem('examState');
        if (stateJson) {
            const state = JSON.parse(stateJson);
            this.userAnswers = state.userAnswers || {};
            this.markedQuestions = new Set(state.markedQuestions || []);
            this.currentQuestion = state.currentQuestion || 0;
            this.startTime = state.startTime;
        }
    },

    // 状態クリア
    clearState() {
        sessionStorage.removeItem('examState');
    }
};

// ページ読み込み時
window.addEventListener('DOMContentLoaded', async () => {
    await exam.init();
});

// ページ離脱時の警告
window.addEventListener('beforeunload', (e) => {
    if (exam.startTime && !exam.endTime) {
        e.preventDefault();
        e.returnValue = '試験中です。ページを離れると試験がリセットされます。';
    }
});
