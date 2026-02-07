# 音響効果システム統合ガイド

## 📁 作成ファイル

- `sound.js` - 音響効果システム本体
- `sound-settings-ui.html` - 設定UI（HTMLスニペット）
- `SOUND_INTEGRATION_GUIDE.md` - このガイド

---

## 🚀 統合手順

### 1. HTMLファイルにsound.jsを読み込む

すべてのHTMLファイル（`index.html`, `game.html`, `dashboard.html`, `mock-exam.html`, `guide.html`）の`<head>`セクションまたは`<body>`の最後に追加：

```html
<script src="sound.js"></script>
```

**推奨配置：** `app.js`の直前

```html
<script src="sound.js"></script>
<script src="app.js"></script>
```

---

### 2. 設定UIの組み込み

`sound-settings-ui.html`の内容を、設定画面またはサイドメニューに挿入してください。

**推奨配置：** ダッシュボード画面の設定セクション

---

### 3. app.jsへの統合

#### 3-1. 正解時の音を鳴らす

`app.js`内の正解判定部分（`checkAnswer`関数など）に追加：

```javascript
function checkAnswer(selectedAnswer) {
    const currentQuestion = currentQuiz[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    if (isCorrect) {
        soundSystem.playCorrect(); // ✅ 正解音を再生
        // 既存の正解処理...
    } else {
        soundSystem.playIncorrect(); // ❌ 不正解音を再生
        // 既存の不正解処理...
    }

    // 既存のコード...
}
```

#### 3-2. 完了時の音を鳴らす

クイズ終了時やテスト完了時に追加：

```javascript
function finishQuiz() {
    soundSystem.playComplete(); // 🎉 完了音を再生
    soundSystem.resetStreak();  // 連続正解カウンターをリセット
    // 既存の完了処理...
}
```

#### 3-3. ボタンクリック音

すべてのボタンに軽快なクリック音を追加：

```javascript
// イベントリスナー設定時
document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
        soundSystem.playClick(); // 🔘 クリック音を再生
    });
});
```

**または、既存のイベントリスナーに1行追加：**

```javascript
document.getElementById('start-random-quiz')?.addEventListener('click', () => {
    soundSystem.playClick(); // ✅ 追加
    startQuiz('random');
});
```

#### 3-4. 通知音

重要な通知（エラー、警告、お知らせ）で使用：

```javascript
function showNotification(message) {
    soundSystem.playNotification(); // 🔔 通知音を再生
    // 既存の通知表示処理...
}
```

#### 3-5. 画面遷移音（オプション）

画面切り替え時に軽やかな音を追加：

```javascript
function showScreen(screenName) {
    soundSystem.playTransition(); // 🎵 遷移音を再生
    // 既存の画面切り替え処理...
}
```

---

## 🎯 推奨統合ポイント（app.js内）

以下の関数に音響効果を追加することを推奨します：

| 関数/イベント | 音響効果 | メソッド |
|-------------|----------|----------|
| **正解判定** | 正解音（連続でピッチアップ） | `soundSystem.playCorrect()` |
| **不正解判定** | 控えめなブザー | `soundSystem.playIncorrect()` |
| **クイズ完了** | 達成感のあるファンファーレ | `soundSystem.playComplete()` |
| **テスト終了** | 完了音 | `soundSystem.playComplete()` |
| **ボタンクリック** | 軽快なクリック音 | `soundSystem.playClick()` |
| **画面遷移** | 軽やかな遷移音 | `soundSystem.playTransition()` |
| **通知表示** | 優しいベル音 | `soundSystem.playNotification()` |
| **エラー発生** | エラー音 | `soundSystem.playError()` |
| **タイマー警告** | 警告音（残り時間少） | `soundSystem.playWarning()` |
| **レベルアップ** | レベルアップ音 | `soundSystem.playLevelUp()` |

---

## 📝 実装例（app.js統合コード）

### 例1: 正解/不正解の判定

```javascript
function checkAnswer(selectedAnswer) {
    const currentQuestion = currentQuiz[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    // 音響効果
    if (isCorrect) {
        soundSystem.playCorrect();
    } else {
        soundSystem.playIncorrect();
    }

    // 既存の処理...
    updateScore(isCorrect);
    showFeedback(isCorrect);
}
```

### 例2: クイズ完了

```javascript
function finishQuiz() {
    // 音響効果
    soundSystem.playComplete();
    soundSystem.resetStreak();

    // 既存の処理...
    showResults();
    saveProgress();
}
```

### 例3: ボタンクリック音（全ボタンに適用）

```javascript
// setupEventListeners関数内に追加
function setupEventListeners() {
    // 全ボタンにクリック音を追加
    document.querySelectorAll('button, .btn').forEach(btn => {
        btn.addEventListener('click', () => {
            soundSystem.playClick();
        }, true); // trueでキャプチャフェーズで実行（他のイベントより先）
    });

    // 既存のイベントリスナー...
}
```

### 例4: タイマー警告（残り時間が少ない時）

```javascript
function updateTimer() {
    const remainingTime = endTime - Date.now();

    // 残り5分で警告音
    if (remainingTime === 5 * 60 * 1000) {
        soundSystem.playWarning();
    }

    // 残り1分で警告音
    if (remainingTime === 1 * 60 * 1000) {
        soundSystem.playWarning();
    }

    // 既存のタイマー更新処理...
}
```

---

## 🔧 カスタマイズ方法

### 音量を変更

```javascript
// デフォルトは30%（0.3）
soundSystem.setVolume(0.5); // 50%に変更
```

### 音響効果を一時的に無効化

```javascript
soundSystem.settings.enabled = false; // 無効化
soundSystem.settings.enabled = true;  // 有効化
```

### 振動フィードバックを無効化

```javascript
soundSystem.settings.vibrationEnabled = false; // 無効化
```

### 連続正解カウンターをリセット

```javascript
soundSystem.resetStreak(); // クイズ終了時などに呼ぶ
```

---

## 🎨 設定UIのカスタマイズ

`sound-settings-ui.html`のスタイルは、既存の`design-system.css`に合わせて調整可能です。

**色の変更例：**

```css
/* トグルスイッチの色 */
.toggle-switch input:checked + .toggle-slider {
    background-color: #4CAF50; /* 緑 → 好きな色に変更 */
}

/* 音量スライダーの色 */
.volume-slider::-webkit-slider-thumb {
    background: #4CAF50; /* 緑 → 好きな色に変更 */
}
```

---

## ⚠️ 注意事項

### 1. ユーザーインタラクション前の制限

Web Audio APIは、**ユーザーが何らかの操作（クリック、タップ等）を行った後**でないと音を再生できません。

**対策：** 初回のボタンクリックで音が鳴らない場合があるため、ページ読み込み直後に音を鳴らす必要がある場合は、「開始ボタン」などをクリックさせてからアプリを開始してください。

### 2. 音量のベストプラクティス

- デフォルト音量は控えめ（30%）に設定済み
- ユーザーが調整できるようUI提供済み
- 不正解音・エラー音はさらに控えめ（デフォルトの50%）

### 3. 振動フィードバックの対応状況

- **対応ブラウザ：** Chrome（Android）、Samsung Internet、Opera Mobile
- **非対応：** iOS Safari（仕様上非対応）、Desktop Safari
- 非対応ブラウザでは自動的に振動が無効化されます

### 4. パフォーマンス

- Web Audio APIは軽量で、CPUへの負荷はほぼゼロ
- 外部ファイル（MP3等）を使用しないため、読み込み不要
- オシレーター（Oscillator）を使用したシンセサイザー方式

---

## 📱 モバイル対応

- 振動フィードバックはモバイル専用機能
- タッチ操作時もクリック音が正常に動作
- 音量調整スライダーはタッチ操作に最適化済み

---

## 🧪 動作確認方法

### 1. HTMLに統合後、ブラウザで開く

```bash
open index.html
```

### 2. コンソールで動作テスト

```javascript
// ブラウザのデベロッパーツール（F12）で実行
soundSystem.playCorrect();
soundSystem.playIncorrect();
soundSystem.playComplete();
soundSystem.playClick();
soundSystem.playNotification();
```

### 3. 設定UIで調整

- トグルスイッチで音響ON/OFF
- スライダーで音量調整
- テストボタンで各効果音を確認

---

## 🆘 トラブルシューティング

### 音が鳴らない

1. **設定が無効になっていないか確認**
   ```javascript
   console.log(soundSystem.getSettings());
   ```

2. **ユーザーインタラクション前ではないか**
   - 初回は何かボタンをクリックしてから試す

3. **ブラウザの音量がミュートになっていないか**
   - システム音量、ブラウザタブの音量を確認

### 振動が動かない

1. **対応ブラウザか確認**
   ```javascript
   console.log('vibrate' in navigator); // true なら対応
   ```

2. **振動設定が有効か確認**
   ```javascript
   console.log(soundSystem.settings.vibrationEnabled);
   ```

---

## 📚 API リファレンス

### メソッド一覧

| メソッド | 説明 |
|---------|------|
| `playCorrect()` | 正解音（連続正解でピッチアップ） |
| `playIncorrect()` | 不正解音 |
| `playComplete()` | 完了音 |
| `playClick()` | クリック音 |
| `playNotification()` | 通知音 |
| `playWarning()` | 警告音 |
| `playLevelUp()` | レベルアップ音 |
| `playTransition()` | 画面遷移音 |
| `playError()` | エラー音 |
| `setVolume(volume)` | 音量設定（0.0 - 1.0） |
| `toggle()` | 音響ON/OFF切り替え |
| `toggleVibration()` | 振動ON/OFF切り替え |
| `resetStreak()` | 連続正解カウンターリセット |
| `getSettings()` | 現在の設定を取得 |

### プロパティ

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| `settings.enabled` | boolean | 音響効果の有効/無効 |
| `settings.volume` | number | 音量（0.0 - 1.0） |
| `settings.vibrationEnabled` | boolean | 振動フィードバックの有効/無効 |
| `correctStreak` | number | 連続正解カウント |

---

## ✅ 完成チェックリスト

- [ ] `sound.js`をすべてのHTMLファイルに読み込み
- [ ] 設定UIを組み込み
- [ ] 正解/不正解判定に音響効果を追加
- [ ] クイズ完了時に完了音を追加
- [ ] ボタンクリック音を追加（オプション）
- [ ] 画面遷移音を追加（オプション）
- [ ] ブラウザで動作確認
- [ ] モバイルでも動作確認（振動フィードバック含む）

---

## 🎉 これで完了です！

ユーザーはクイズを楽しみながら、爽快な音響効果と振動フィードバックで快適な学習体験を得られます。

**質問・要望があれば、遠慮なくお知らせください。**
