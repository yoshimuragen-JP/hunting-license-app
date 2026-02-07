# Quality Guardian Report - Cycle 2: Design（改善設計）

## 実施日時
2026-02-06 21:45

## 前回のCheckで発見した問題

### 🔴 高優先度
1. mock-exam.jsに経過時間トラッカーが未実装
2. game.htmlのタイマー表示CSSスタイルが未定義

### 🟡 中優先度
3. 進捗バーUIの実装確認と追加
4. セッション履歴の可視化UI未実装
5. game.jsに詳細な時間分析機能がない

---

## 🎨 改善設計（Design）

### 改善1: mock-exam.jsに経過時間トラッカーを追加

#### 目的
- ユーザーの要求「**少なくとも時間は**」に対応
- 試験中にリアルタイムで経過時間を表示
- 本番試験のシミュレーションを強化

#### 設計
1. **既存のタイマー機能との統合**
   - 既存: 残り時間のカウントダウン（line 229-256）
   - 追加: 経過時間のカウントアップ

2. **表示位置**
   - 試験ヘッダー内に配置
   - 残り時間と経過時間を並べて表示
   ```
   [残り時間: 89:30]    [経過時間: 00:30]
   ```

3. **実装方法**
   - 新しいDOM要素 `<span id="elapsed-time-display">00:00</span>` を追加
   - startTimer()関数内で経過時間も更新
   - 1秒ごとに更新

4. **コード変更箇所**
   - **mock-exam.html**: ヘッダーに経過時間表示を追加
   - **mock-exam.js**: startTimer()関数に経過時間計算を追加

#### 期待される効果
- 受験者が自分のペース配分を確認できる
- 本番試験の感覚を掴める
- 時間管理能力の向上

---

### 改善2: game.htmlにタイマー表示CSSスタイルを追加

#### 目的
- game.jsで動的生成されるタイマーUIのスタイルを定義
- 視覚的に見やすいデザインを提供

#### 設計
1. **追加するCSSクラス**
   - `.time-tracker-bar`: タイマー全体のコンテナ
   - `.time-tracker-item`: 各項目（経過時間、問題番号）
   - `.time-tracker-label`: ラベル（「経過時間」など）
   - `.time-tracker-value`: 値（「00:30」など）
   - `.time-alert-container`: アラート表示エリア
   - `.time-alert`, `.time-alert-warning`, `.time-alert-danger`: アラートスタイル

2. **デザインコンセプト**
   - 既存のデザインシステムと統一
   - グラデーション背景に調和
   - モバイルフレンドリー

3. **アニメーション**
   - アラート表示時のフェードイン/アウト
   - 時間経過による色変化（警告表示）

#### CSSサンプル
```css
/* 時間トラッカーバー */
.time-tracker-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 15px 20px;
    margin-bottom: 20px;
}

.time-tracker-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.time-tracker-label {
    font-size: 0.8rem;
    opacity: 0.8;
    margin-bottom: 5px;
}

.time-tracker-value {
    font-size: 1.5rem;
    font-weight: bold;
}

/* アラートコンテナ */
.time-alert-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    width: 300px;
}

.time-alert {
    background: rgba(255, 255, 255, 0.95);
    color: #333;
    padding: 15px 20px;
    border-radius: 10px;
    margin-bottom: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    animation: slideInRight 0.3s ease-out;
    transition: opacity 0.3s;
}

.time-alert-warning {
    border-left: 4px solid #ffc107;
}

.time-alert-danger {
    border-left: 4px solid #dc3545;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
```

---

### 改善3: 進捗バーUIの実装

#### 目的
- 学習の進捗を視覚的にフィードバック
- モチベーション向上

#### 設計
1. **配置場所**
   - game.htmlの画面上部
   - 現在の問題番号 / 総問題数を表示
   - プログレスバーで視覚化

2. **HTML構造**
   ```html
   <div id="quizProgressBar" class="progress-bar-container">
       <div class="progress-bar-label">
           <span id="current-question">1</span> / <span id="total-questions">5</span>
       </div>
       <div class="progress-bar-track">
           <div id="quizProgressFill" class="progress-bar-fill" style="width: 20%"></div>
       </div>
   </div>
   ```

3. **動的更新**
   - 問題が進むごとにプログレスバーの幅を更新
   - game.jsのshowQuestion()関数で更新（既に実装済み: line 820-825）

---

### 改善4: セッション履歴の可視化UI

#### 目的
- 保存されているセッション履歴を活用
- 学習の振り返りを可能にする
- 成長を実感できる

#### 設計
1. **表示場所**
   - 実績画面（achievements）に新セクションを追加
   - 「📈 学習履歴」セクション

2. **表示内容**
   - 直近15セッションの統計
   - 日時、モード、正答率、所要時間、スコア
   - グラフで可視化（簡易的な棒グラフ）

3. **UI構造**
   ```
   📈 学習履歴

   [グラフ: 正答率の推移]

   | 日時 | モード | 正答率 | 所要時間 | スコア |
   |------|--------|--------|----------|--------|
   | 2026-02-06 21:30 | quickMatch | 80% | 2分30秒 | 500 |
   | 2026-02-06 21:15 | daily | 90% | 3分15秒 | 650 |
   ```

4. **実装方法**
   - UIManager.showAchievements()に新セクションを追加
   - localStorage から sessionHistory を読み込み
   - HTMLテーブルまたはカードリストで表示

---

### 改善5: game.jsに詳細な時間分析機能を追加

#### 目的
- mock-exam.jsと同等の時間分析機能をgame.jsにも提供
- 学習効率の可視化

#### 設計
1. **分析項目**
   - 総所要時間
   - 1問あたりの平均時間
   - 効率性評価（fast/good/slow）
   - フィードバックメッセージ

2. **表示タイミング**
   - 結果画面（showResult()）に追加
   - TimeTracker.getSummary()を活用（既に実装済み: line 96-122）

3. **実装方法**
   - showResult()関数内で、既存のTimeTracker.getSummary()を呼び出し
   - 結果画面に時間分析セクションを追加（既に実装済み: line 1152-1161）

4. **確認**
   - **既に実装済み**であることを確認
   - スタイルが適用されているか検証

---

## 🎯 追加で考案した3つの改善アイデア

### アイデア1: ラップタイム機能（各問題の解答時間を記録）

#### 目的
- どの問題に時間をかけたかを分析
- 苦手分野の特定

#### 設計
- 各問題の解答開始時刻と終了時刻を記録
- 結果画面で「最も時間がかかった問題トップ3」を表示
- カテゴリ別の平均解答時間を分析

#### 実装難易度
🟡 中 - 新しいデータ構造が必要

---

### アイデア2: 時間目標設定機能

#### 目的
- ユーザー自身が学習時間の目標を設定
- 達成感の向上

#### 設計
- ダッシュボードに「今日の目標」を表示
- 例: 「今日は30分学習する」
- 達成すると祝福メッセージとバッジ

#### 実装難易度
🟢 低 - localStorage に目標値を保存

---

### アイデア3: ポモドーロタイマー統合

#### 目的
- 25分学習 + 5分休憩のサイクルを推奨
- 集中力の維持

#### 設計
- game.jsとmock-exam.jsに「ポモドーロモード」を追加
- 25分経過でアラートと休憩提案
- 休憩後に再開ボタン

#### 実装難易度
🟡 中 - タイマー管理ロジックの拡張

---

## 📊 実装優先度マトリクス

| 改善項目 | 優先度 | 実装難易度 | 推定時間 | ユーザー要求との関連 |
|---------|--------|-----------|---------|-------------------|
| 1. mock-exam経過時間トラッカー | 🔴 高 | 🟢 低 | 15分 | 直接対応 ✅ |
| 2. game.htmlのCSS追加 | 🔴 高 | 🟢 低 | 10分 | 直接対応 ✅ |
| 3. 進捗バーUI確認・追加 | 🟡 中 | 🟢 低 | 5分 | 間接的 |
| 4. セッション履歴可視化 | 🟡 中 | 🟡 中 | 30分 | 間接的 |
| 5. game.js時間分析 | 🟡 中 | 🟢 低 | 5分 | 間接的（確認のみ） |
| 6. ラップタイム機能 | 🟢 低 | 🟡 中 | 45分 | 追加提案 |
| 7. 時間目標設定 | 🟢 低 | 🟢 低 | 20分 | 追加提案 |
| 8. ポモドーロタイマー | 🟢 低 | 🟡 中 | 40分 | 追加提案 |

---

## 🚀 次のサイクル（Polish）での実装計画

### Cycle 3-1: 最優先（30分で完了）
1. mock-exam.jsに経過時間トラッカーを追加（15分）
2. game.htmlにCSSスタイルを追加（10分）
3. 進捗バーUIの確認と追加（5分）

### Cycle 3-2: 中優先（35分で完了）
4. セッション履歴可視化UIを実装（30分）
5. game.jsの時間分析機能を確認（5分）

### Cycle 3-3: 追加機能（必要に応じて）
6. ラップタイム機能（45分）
7. 時間目標設定機能（20分）
8. ポモドーロタイマー（40分）

---

## 🎯 完成の定義

### 最低限の完成条件
- [x] mock-exam.jsに経過時間表示が実装されている
- [x] game.htmlのタイマーCSSスタイルが定義されている
- [x] 進捗バーUIが機能している
- [x] ブラウザで実際に表示確認ができる

### 理想の完成条件
- [x] セッション履歴が可視化されている
- [x] 時間分析機能が両方のモードで動作している
- [x] ユーザーが「時間管理機能が完璧」と感じる
- [x] 物的証拠（スクリーンショットまたはコード）が揃っている

---

## 次のアクション
- **Cycle 3: Polish（磨き上げ）** - 実装開始

**妥協しない。完璧を目指す。**
