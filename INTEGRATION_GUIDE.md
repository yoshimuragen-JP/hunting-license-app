# 統合実装ガイド

このガイドでは、作成した共通コンポーネントを各HTMLページに統合する手順を説明します。

---

## 📋 前提条件

以下のファイルが作成されていること:
- `components/navigation.html` - 共通ヘッダー
- `components/footer.html` - 共通フッター
- `js/integration.js` - 統合ユーティリティ
- `js/data-validator.js` - データバリデーター

---

## 🔧 実装手順

### ステップ1: 各HTMLページへの統合

各HTMLファイル（index.html, game.html, mock-exam.html, animals.html, practical.html, dashboard.html, guide.html）に以下の変更を加えます。

#### 1-1. `<head>`セクションに追加

```html
<!-- 既存の<head>内に追加 -->

<!-- 統合用JavaScript -->
<script src="js/integration.js" defer></script>

<!-- データバリデーター（開発モード用） -->
<script src="js/data-validator.js" defer></script>
```

#### 1-2. `<body>`の開始直後に追加

```html
<body>
    <!-- ナビゲーションをインクルード -->
    <div id="navigation-placeholder"></div>

    <!-- 既存のコンテンツ -->
    ...
</body>
```

#### 1-3. `<body>`の終了直前に追加

```html
    <!-- 既存のコンテンツ -->
    ...

    <!-- フッターをインクルード -->
    <div id="footer-placeholder"></div>

    <!-- コンポーネント読み込みスクリプト -->
    <script>
        // ナビゲーション読み込み
        fetch('components/navigation.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('navigation-placeholder').innerHTML = html;
            })
            .catch(error => console.error('Navigation load failed:', error));

        // フッター読み込み
        fetch('components/footer.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('footer-placeholder').innerHTML = html;
            })
            .catch(error => console.error('Footer load failed:', error));
    </script>
</body>
```

---

### ステップ2: 既存のヘッダー・フッターの削除

各ページに既存のヘッダーやフッターがある場合は削除します。

#### 削除対象

```html
<!-- これらを削除 -->
<header class="header">
    ...
</header>

<footer class="footer">
    ...
</footer>
```

**注意**: index.htmlには既に完全なヘッダー・フッターが実装されているため、そのまま使用できます。

---

## 📝 ページ別の統合例

### 例1: game.html

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>学習 - 狩猟免許試験</title>

    <!-- 既存のスタイルシート -->
    <link rel="stylesheet" href="design-system.css">
    <link rel="stylesheet" href="style.css">

    <!-- 統合用スクリプト -->
    <script src="js/integration.js" defer></script>
    <script src="js/data-validator.js" defer></script>
</head>
<body>
    <!-- ナビゲーション -->
    <div id="navigation-placeholder"></div>

    <!-- メインコンテンツ -->
    <main id="main-content">
        <!-- 既存の学習コンテンツ -->
    </main>

    <!-- フッター -->
    <div id="footer-placeholder"></div>

    <!-- 既存のJavaScript -->
    <script src="game.js"></script>

    <!-- コンポーネント読み込み -->
    <script>
        fetch('components/navigation.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('navigation-placeholder').innerHTML = html;
            });

        fetch('components/footer.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('footer-placeholder').innerHTML = html;
            });
    </script>
</body>
</html>
```

### 例2: dashboard.html

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>学習ダッシュボード - 狩猟免許試験</title>

    <!-- スタイルシート -->
    <link rel="stylesheet" href="design-system.css">
    <link rel="stylesheet" href="style.css">

    <!-- 統合用スクリプト -->
    <script src="js/integration.js" defer></script>
    <script src="js/data-validator.js" defer></script>
</head>
<body>
    <!-- ナビゲーション -->
    <div id="navigation-placeholder"></div>

    <!-- メインコンテンツ -->
    <main id="main-content">
        <div class="container">
            <!-- 既存のダッシュボードコンテンツ -->

            <!-- 弱点カテゴリへのリンク（自動生成） -->
            <section class="weak-categories">
                <h2>重点強化ポイント</h2>
                <div id="weak-categories-links"></div>
            </section>
        </div>
    </main>

    <!-- フッター -->
    <div id="footer-placeholder"></div>

    <!-- JavaScript -->
    <script src="dashboard.js"></script>

    <!-- コンポーネント読み込み -->
    <script>
        fetch('components/navigation.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('navigation-placeholder').innerHTML = html;
            });

        fetch('components/footer.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('footer-placeholder').innerHTML = html;
            });
    </script>
</body>
</html>
```

---

## 🎨 スタイル調整

### 既存のヘッダー・フッタースタイルの削除

各ページのCSSから、以下のスタイルを削除します:

```css
/* 削除対象 */
header { ... }
.header { ... }
footer { ... }
.footer { ... }
```

これらは `components/navigation.html` と `components/footer.html` に含まれています。

### メインコンテンツの余白調整

共通ヘッダーの高さ分、メインコンテンツに余白を追加:

```css
main#main-content {
    margin-top: 80px; /* ヘッダーの高さに応じて調整 */
    min-height: calc(100vh - 400px); /* フッターの高さを考慮 */
}
```

---

## 🔗 統合ユーティリティの使用例

### 例1: ページ遷移

```javascript
// ボタンクリック時に学習画面へ
document.getElementById('start-button').addEventListener('click', () => {
    AppIntegration.navigation.toGame();
});

// 特定カテゴリの学習へ
document.getElementById('law-button').addEventListener('click', () => {
    AppIntegration.navigation.toGame('法令');
});

// 鳥獣図鑑の特定動物へ
document.getElementById('animal-link').addEventListener('click', () => {
    AppIntegration.navigation.toAnimals('magamo');
});
```

### 例2: 学習進捗の保存

```javascript
// game.jsで使用
function saveProgress(category, correct, total) {
    const progress = AppIntegration.storage.getProgress();

    // カテゴリ別データの更新
    if (!progress.categories[category]) {
        progress.categories[category] = { total: 0, correct: 0 };
    }

    progress.categories[category].total += total;
    progress.categories[category].correct += correct;
    progress.totalQuestions += total;
    progress.correctAnswers += correct;

    AppIntegration.storage.saveProgress(progress);
}
```

### 例3: ダッシュボードでの統計表示

```javascript
// dashboard.jsで使用
function displayStats() {
    const stats = AppIntegration.stats.getOverallStats();

    document.getElementById('total-questions').textContent = stats.totalQuestions;
    document.getElementById('accuracy').textContent = stats.accuracy + '%';
    document.getElementById('study-time').textContent = stats.studyTime + '時間';

    // 弱点カテゴリの表示
    const weakCategories = AppIntegration.stats.getWeakCategories();
    displayWeakCategories(weakCategories);
}

function displayWeakCategories(categories) {
    const container = document.getElementById('weak-categories-links');

    const html = categories.map(cat => `
        <div class="weak-category-card">
            <h4>${cat.name}</h4>
            <p>正答率: ${cat.accuracy}%</p>
            <a href="${AppIntegration.generateLinks.toWeakCategory(cat.name)}"
               class="btn btn-primary">
                この分野を学習する
            </a>
        </div>
    `).join('');

    container.innerHTML = html;
}
```

---

## ✅ チェックリスト

統合作業後、以下の項目を確認してください:

### 基本機能

- [ ] 全ページでヘッダーが表示される
- [ ] 全ページでフッターが表示される
- [ ] ナビゲーションメニューからすべてのページへ遷移できる
- [ ] パンくずリストが正しく表示される
- [ ] 現在のページがハイライトされる

### モバイル対応

- [ ] ハンバーガーメニューが正しく動作する
- [ ] メニューが画面外クリックで閉じる
- [ ] レスポンシブレイアウトが正しく表示される

### データ連携

- [ ] LocalStorageに学習データが保存される
- [ ] ページ遷移後もデータが保持される
- [ ] ダッシュボードで統計が正しく表示される

### パフォーマンス

- [ ] ページ読み込みが2秒以内
- [ ] コンポーネント読み込みでエラーが出ない
- [ ] コンソールにエラーがない

### デバッグ

- [ ] 開発モードでバリデーションが実行される
- [ ] エラーや警告が表示されない（または対処済み）

---

## 🐛 トラブルシューティング

### 問題1: コンポーネントが表示されない

**原因**: Fetchがローカルファイルシステムで動作しない

**解決策**: ローカルサーバーを使用する

```bash
# Pythonの場合
python -m http.server 8000

# Node.jsの場合
npx http-server -p 8000
```

### 問題2: スタイルが崩れる

**原因**: 既存のヘッダー・フッタースタイルと競合

**解決策**: 既存のスタイルを削除または優先度を調整

```css
/* 既存のスタイルを無効化 */
header.old-header {
    display: none;
}

/* または優先度を下げる */
.container > header {
    /* 既存のスタイル */
}
```

### 問題3: JavaScriptエラーが発生する

**原因**: スクリプトの読み込み順序

**解決策**: `defer`属性を使用し、依存関係を明確にする

```html
<!-- 正しい順序 -->
<script src="js/integration.js" defer></script>
<script src="js/data-validator.js" defer></script>
<script src="js/app.js" defer></script>
```

---

## 📚 参考資料

### ドキュメント

- [INTEGRATION_REPORT.md](./INTEGRATION_REPORT.md) - 統合作業の詳細報告
- [design-system.css](./app/design-system.css) - デザインシステム
- [components/navigation.html](./app/components/navigation.html) - ナビゲーションコンポーネント
- [components/footer.html](./app/components/footer.html) - フッターコンポーネント

### API リファレンス

#### AppIntegration.navigation

```javascript
AppIntegration.navigation.toGame(category)      // 学習画面へ
AppIntegration.navigation.toMockExam()          // 模擬試験へ
AppIntegration.navigation.toAnimals(animalId)   // 鳥獣図鑑へ
AppIntegration.navigation.toPractical(section)  // 実技ガイドへ
AppIntegration.navigation.toDashboard()         // ダッシュボードへ
AppIntegration.navigation.toGuide()             // ガイドへ
AppIntegration.navigation.toHome()              // ホームへ
```

#### AppIntegration.storage

```javascript
AppIntegration.storage.getProgress()            // 学習進捗取得
AppIntegration.storage.saveProgress(progress)   // 学習進捗保存
AppIntegration.storage.getResults()             // 模擬試験結果取得
AppIntegration.storage.saveResult(result)       // 模擬試験結果保存
```

#### AppIntegration.stats

```javascript
AppIntegration.stats.getOverallStats()          // 総合統計取得
AppIntegration.stats.getCategoryStats(category) // カテゴリ別統計取得
AppIntegration.stats.getWeakCategories(threshold) // 弱点カテゴリ取得
```

---

## 💡 ベストプラクティス

### 1. 段階的な統合

一度にすべてのページを統合せず、1ページずつ確認しながら進める。

### 2. バックアップの作成

統合前に各ファイルのバックアップを作成する。

### 3. テストの実施

各ページの統合後、必ずブラウザで動作確認を行う。

### 4. コンソールの確認

開発者ツールのコンソールでエラーや警告を確認する。

### 5. モバイルテスト

デスクトップだけでなく、モバイル表示も必ず確認する。

---

**作成者**: Integration Specialist
**作成日**: 2026-02-06
**バージョン**: 1.0.0
