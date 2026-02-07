# 📚 API Documentation

**狩猟免許試験 完全攻略アプリのJavaScript API仕様書**

---

## 📖 概要

このドキュメントは、アプリの主要なJavaScript関数、クラス、API仕様を説明します。

---

## 🎯 app.js - メインアプリケーション

### データ読み込み

#### `loadData()`

**説明**: JSONデータファイルを非同期に読み込む

**パラメータ**: なし

**戻り値**: `Promise<void>`

**例外**: データ読み込み失敗時にエラーをthrow

**使用例**:
```javascript
try {
  await loadData();
  console.log('データ読み込み完了');
} catch (error) {
  console.error('データ読み込みエラー:', error);
}
```

---

#### `initializeApp()`

**説明**: アプリケーションの初期化（イベントリスナー設定等）

**パラメータ**: なし

**戻り値**: なし

**使用例**:
```javascript
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  initializeApp();
});
```

---

### UI表示制御

#### `showLoading(show: boolean)`

**説明**: ローディング画面の表示・非表示を切り替え

**パラメータ**:
- `show` (boolean): trueで表示、falseで非表示

**戻り値**: なし

**使用例**:
```javascript
showLoading(true);  // ローディング表示
await fetchData();
showLoading(false); // ローディング非表示
```

---

#### `showError(message: string)`

**説明**: エラーメッセージを表示

**パラメータ**:
- `message` (string): エラーメッセージ

**戻り値**: なし

**使用例**:
```javascript
showError('データの読み込みに失敗しました');
```

---

## 🎮 game.js - ゲームモード

### GameMode クラス

#### コンストラクタ

```javascript
class GameMode {
  constructor() {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.badges = [];
  }
}
```

---

#### `startQuickMatch()`

**説明**: クイックマッチ（5問スピードクイズ）を開始

**パラメータ**: なし

**戻り値**: なし

**副作用**: 
- タイマー開始
- 問題をランダムに選択
- スコアリセット

**使用例**:
```javascript
const game = new GameMode();
game.startQuickMatch();
```

---

#### `checkAnswer(questionId: string, selectedAnswer: number)`

**説明**: 回答をチェックし、スコアを更新

**パラメータ**:
- `questionId` (string): 問題のID（例: "Q001"）
- `selectedAnswer` (number): 選択した回答のインデックス（0-2）

**戻り値**: 
```javascript
{
  correct: boolean,    // 正解かどうか
  combo: number,       // 現在のコンボ数
  points: number       // 獲得ポイント
}
```

**使用例**:
```javascript
const result = game.checkAnswer('Q001', 1);
if (result.correct) {
  console.log(`正解！コンボ${result.combo}連続`);
}
```

---

#### `awardBadge(badgeId: string)`

**説明**: バッジを授与

**パラメータ**:
- `badgeId` (string): バッジのID（例: "first_correct"）

**戻り値**: なし

**副作用**: LocalStorageに保存

**使用例**:
```javascript
game.awardBadge('first_correct');
```

---

## 📝 notes.js - 学習ノート

### NotesManager クラス

#### コンストラクタ

```javascript
class NotesManager {
  constructor() {
    this.STORAGE_KEYS = {
      notes: 'hunting_license_notes',
      flashcards: 'hunting_license_flashcards',
      weakProblems: 'hunting_license_weak_problems'
    };
  }
}
```

---

#### `saveNote(category: string, title: string, content: string)`

**説明**: 新しいノートを保存

**パラメータ**:
- `category` (string): カテゴリ（"law", "gun", "animal", "management", "practical"）
- `title` (string): ノートのタイトル
- `content` (string): ノートの内容

**戻り値**: 
```javascript
{
  id: string,          // 生成されたノートID
  success: boolean     // 保存成功かどうか
}
```

**使用例**:
```javascript
const notesManager = new NotesManager();
const result = notesManager.saveNote(
  'law',
  '狩猟期間の覚え方',
  '本州以南: 11/15〜2/15'
);
console.log(`ノートID: ${result.id}`);
```

---

#### `getNotes()`

**説明**: 全てのノートを取得

**パラメータ**: なし

**戻り値**: 
```javascript
Array<{
  id: string,
  category: string,
  title: string,
  content: string,
  createdAt: number,  // UNIXタイムスタンプ
  updatedAt: number   // UNIXタイムスタンプ
}>
```

**使用例**:
```javascript
const notes = notesManager.getNotes();
notes.forEach(note => {
  console.log(`${note.title}: ${note.content}`);
});
```

---

#### `deleteNote(noteId: string)`

**説明**: ノートを削除

**パラメータ**:
- `noteId` (string): ノートのID

**戻り値**: `boolean` - 削除成功かどうか

**使用例**:
```javascript
const success = notesManager.deleteNote('note_001');
if (success) {
  console.log('ノートを削除しました');
}
```

---

#### `exportNotes()`

**説明**: 全てのノートをJSON形式でエクスポート

**パラメータ**: なし

**戻り値**: `string` - JSON文字列

**使用例**:
```javascript
const json = notesManager.exportNotes();
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
// ダウンロードリンクを作成
```

---

#### `importNotes(jsonString: string)`

**説明**: JSON形式のノートをインポート

**パラメータ**:
- `jsonString` (string): エクスポートされたJSON文字列

**戻り値**: `boolean` - インポート成功かどうか

**例外**: JSON構文エラー時に例外をthrow

**使用例**:
```javascript
try {
  const success = notesManager.importNotes(jsonData);
  if (success) {
    console.log('ノートをインポートしました');
  }
} catch (error) {
  console.error('インポートエラー:', error);
}
```

---

## 📊 dashboard.js - 進捗ダッシュボード

### ProgressTracker クラス

#### `getProgress()`

**説明**: 現在の学習進捗を取得

**パラメータ**: なし

**戻り値**: 
```javascript
{
  totalQuestions: number,
  correctAnswers: number,
  accuracy: number,        // 正答率（0-100）
  categoryScores: {
    law: { total: number, correct: number },
    gun: { total: number, correct: number },
    animal: { total: number, correct: number },
    management: { total: number, correct: number },
    practical: { total: number, correct: number }
  },
  studyTime: number,       // 秒数
  lastUpdated: number      // UNIXタイムスタンプ
}
```

**使用例**:
```javascript
const tracker = new ProgressTracker();
const progress = tracker.getProgress();
console.log(`正答率: ${progress.accuracy}%`);
```

---

#### `updateProgress(questionId: string, correct: boolean, timeSpent: number)`

**説明**: 問題解答後に進捗を更新

**パラメータ**:
- `questionId` (string): 問題のID
- `correct` (boolean): 正解かどうか
- `timeSpent` (number): 解答に要した時間（秒）

**戻り値**: なし

**副作用**: LocalStorageに保存

**使用例**:
```javascript
tracker.updateProgress('Q001', true, 15);
```

---

#### `getPrediction()`

**説明**: 合格可能性を予測

**パラメータ**: なし

**戻り値**: 
```javascript
{
  passRate: number,        // 合格可能性（0-100）
  recommendation: string,  // 推奨アクション
  weakCategories: Array<string> // 弱点カテゴリ
}
```

**使用例**:
```javascript
const prediction = tracker.getPrediction();
console.log(`合格可能性: ${prediction.passRate}%`);
console.log(`推奨: ${prediction.recommendation}`);
```

---

#### `drawChart(canvasId: string, data: Array<number>, labels: Array<string>)`

**説明**: Chart.jsを使ってグラフを描画

**パラメータ**:
- `canvasId` (string): canvasタグのID
- `data` (Array<number>): データ配列
- `labels` (Array<string>): ラベル配列

**戻り値**: なし

**使用例**:
```javascript
tracker.drawChart('accuracyChart', [80, 75, 90, 85, 70], ['法令', '猟具', '鳥獣', '保護管理', '実技']);
```

---

## 🧪 mock-exam.js - 模擬試験

### MockExam クラス

#### `startExam(examNumber: number)`

**説明**: 模擬試験を開始

**パラメータ**:
- `examNumber` (number): 試験番号（1-3）

**戻り値**: なし

**副作用**: 
- タイマー開始（90分カウントダウン）
- 問題をランダムに30問選択
- 開始時刻を記録

**使用例**:
```javascript
const exam = new MockExam();
exam.startExam(1); // 1回目の模擬試験
```

---

#### `submitExam()`

**説明**: 模擬試験を提出し、採点

**パラメータ**: なし

**戻り値**: 
```javascript
{
  score: number,           // 正答数
  accuracy: number,        // 正答率（0-100）
  timeSpent: number,       // 経過時間（秒）
  passed: boolean,         // 合格判定（70%以上）
  categoryScores: Object   // カテゴリ別成績
}
```

**使用例**:
```javascript
const result = exam.submitExam();
if (result.passed) {
  console.log(`合格！正答率: ${result.accuracy}%`);
} else {
  console.log(`不合格。もう一度頑張りましょう。`);
}
```

---

#### `pauseExam()`

**説明**: 試験を一時停止

**パラメータ**: なし

**戻り値**: なし

**副作用**: タイマー停止

**使用例**:
```javascript
exam.pauseExam();
```

---

#### `resumeExam()`

**説明**: 試験を再開

**パラメータ**: なし

**戻り値**: なし

**副作用**: タイマー再開

**使用例**:
```javascript
exam.resumeExam();
```

---

## 🔊 sound.js - 効果音

### SoundManager クラス

#### `playSound(soundType: string)`

**説明**: 効果音を再生

**パラメータ**:
- `soundType` (string): サウンドの種類
  - `"correct"`: 正解音
  - `"incorrect"`: 不正解音
  - `"combo"`: コンボ音
  - `"badge"`: バッジ獲得音
  - `"complete"`: 完了音

**戻り値**: なし

**使用例**:
```javascript
const soundManager = new SoundManager();
soundManager.playSound('correct');
```

---

#### `setVolume(volume: number)`

**説明**: 音量を設定

**パラメータ**:
- `volume` (number): 音量（0.0-1.0）

**戻り値**: なし

**使用例**:
```javascript
soundManager.setVolume(0.5); // 50%の音量
```

---

#### `mute()`

**説明**: 音声をミュート

**パラメータ**: なし

**戻り値**: なし

**使用例**:
```javascript
soundManager.mute();
```

---

#### `unmute()`

**説明**: ミュートを解除

**パラメータ**: なし

**戻り値**: なし

**使用例**:
```javascript
soundManager.unmute();
```

---

## ♿ accessibility.js - アクセシビリティ

### AccessibilityHelper クラス

#### `announceToScreenReader(message: string)`

**説明**: スクリーンリーダーに通知

**パラメータ**:
- `message` (string): 通知するメッセージ

**戻り値**: なし

**実装**: ARIA live regionを使用

**使用例**:
```javascript
const a11y = new AccessibilityHelper();
a11y.announceToScreenReader('問題を読み込みました');
```

---

#### `setFocusTrap(containerElement: HTMLElement)`

**説明**: フォーカストラップを設定（モーダル用）

**パラメータ**:
- `containerElement` (HTMLElement): トラップを設定する要素

**戻り値**: なし

**副作用**: Tab/Shift+Tabでフォーカスがコンテナ内にとどまる

**使用例**:
```javascript
const modal = document.getElementById('modal');
a11y.setFocusTrap(modal);
```

---

#### `removeFocusTrap()`

**説明**: フォーカストラップを解除

**パラメータ**: なし

**戻り値**: なし

**使用例**:
```javascript
a11y.removeFocusTrap();
```

---

## 📱 mobile-utils.js - モバイル最適化

### MobileUtils クラス

#### `detectDevice()`

**説明**: デバイスの種類を検出

**パラメータ**: なし

**戻り値**: 
```javascript
{
  isMobile: boolean,
  isTablet: boolean,
  isDesktop: boolean,
  os: string,          // "iOS", "Android", "Windows", "macOS", "Linux"
  browser: string      // "Chrome", "Safari", "Firefox", "Edge"
}
```

**使用例**:
```javascript
const utils = new MobileUtils();
const device = utils.detectDevice();
if (device.isMobile) {
  console.log('モバイルデバイスです');
}
```

---

#### `enableSwipeGesture(element: HTMLElement, onSwipe: Function)`

**説明**: スワイプジェスチャーを有効化

**パラメータ**:
- `element` (HTMLElement): ジェスチャーを検出する要素
- `onSwipe` (Function): スワイプ時のコールバック関数
  - `direction: string` - "left", "right", "up", "down"

**戻り値**: なし

**使用例**:
```javascript
const container = document.getElementById('question-container');
utils.enableSwipeGesture(container, (direction) => {
  if (direction === 'left') {
    nextQuestion();
  } else if (direction === 'right') {
    previousQuestion();
  }
});
```

---

## 🌐 グローバル変数

### データベース変数

```javascript
// app.js で定義
let quizDatabase = [];       // 問題データベース
let huntingData = {};        // 鳥獣データ
let studyTips = {};          // 学習ティップス
let motivationalMessages = {};// モチベーションメッセージ
```

### 進捗管理変数

```javascript
// LocalStorageキー
const STORAGE_KEYS = {
  progress: 'hunting_license_progress',
  notes: 'hunting_license_notes',
  weakQuestions: 'hunting_license_weak_questions',
  badges: 'hunting_license_badges',
  settings: 'hunting_license_settings'
};
```

---

## 🔧 ユーティリティ関数

### `sanitizeHTML(html: string): string`

**説明**: HTMLをサニタイズしてXSS攻撃を防ぐ

**パラメータ**:
- `html` (string): サニタイズするHTML文字列

**戻り値**: サニタイズされた文字列

**使用例**:
```javascript
const userInput = '<script>alert("XSS")</script>';
const safe = sanitizeHTML(userInput);
// safe === '&lt;script&gt;alert("XSS")&lt;/script&gt;'
```

---

### `formatTime(seconds: number): string`

**説明**: 秒数を「HH:MM:SS」形式にフォーマット

**パラメータ**:
- `seconds` (number): 秒数

**戻り値**: フォーマットされた時間文字列

**使用例**:
```javascript
const formatted = formatTime(3665);
// formatted === '01:01:05'
```

---

### `shuffleArray(array: Array<any>): Array<any>`

**説明**: 配列をシャッフル（Fisher-Yatesアルゴリズム）

**パラメータ**:
- `array` (Array<any>): シャッフルする配列

**戻り値**: シャッフルされた配列（新しい配列）

**使用例**:
```javascript
const questions = ['Q001', 'Q002', 'Q003'];
const shuffled = shuffleArray(questions);
```

---

## 📊 イベント

### カスタムイベント

#### `questionAnswered`

**説明**: 問題に回答した時に発火

**詳細**:
```javascript
document.dispatchEvent(new CustomEvent('questionAnswered', {
  detail: {
    questionId: 'Q001',
    correct: true,
    timeSpent: 15
  }
}));
```

---

#### `badgeAwarded`

**説明**: バッジを獲得した時に発火

**詳細**:
```javascript
document.dispatchEvent(new CustomEvent('badgeAwarded', {
  detail: {
    badgeId: 'first_correct',
    badgeName: '初正解'
  }
}));
```

---

## 🚨 エラーハンドリング

### 標準エラーハンドリングパターン

```javascript
try {
  await loadData();
} catch (error) {
  console.error('エラー:', error);
  showError('データの読み込みに失敗しました。');
}
```

### エラーの種類

| エラー | 原因 | 対処法 |
|--------|------|--------|
| `DataLoadError` | JSONファイルの読み込み失敗 | ファイルの存在確認、パス確認 |
| `JSONParseError` | JSON構文エラー | JSONファイルの構文修正 |
| `LocalStorageError` | LocalStorageの容量超過 | データのクリア、古いデータの削除 |

---

## 📚 参考資料

- **MDN Web Docs**: https://developer.mozilla.org/
- **JavaScript Style Guide**: Airbnb JavaScript Style Guide
- **JSDoc**: https://jsdoc.app/

---

**このAPI仕様書は、開発者がアプリを拡張・カスタマイズする際の参考資料です。** 📚
