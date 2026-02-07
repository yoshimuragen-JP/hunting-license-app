# 🛠️ 開発ガイド

**狩猟免許試験 完全攻略アプリの開発環境セットアップとワークフロー**

作成日: 2026-02-06

---

## 📋 目次

1. [開発環境セットアップ](#開発環境セットアップ)
2. [ローカル開発](#ローカル開発)
3. [デバッグ方法](#デバッグ方法)
4. [開発ワークフロー](#開発ワークフロー)
5. [テスト](#テスト)
6. [トラブルシューティング](#トラブルシューティング)
7. [パフォーマンス最適化](#パフォーマンス最適化)
8. [よくある質問](#よくある質問)

---

## 🚀 開発環境セットアップ

### 必要なソフトウェア

| ソフトウェア | バージョン | 用途 |
|------------|----------|------|
| **Python** | 3.8以上 | ローカルサーバー、JSON検証 |
| **Git** | 最新版 | バージョン管理 |
| **テキストエディタ** | VS Code推奨 | コード編集 |
| **ブラウザ** | Chrome/Safari/Firefox | 動作確認 |

### VS Code推奨拡張機能

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ritwickdey.liveserver",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### 初回セットアップ手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/your-username/hunting-license-app.git
cd hunting-license-app

# 2. 依存関係の確認（Python 3.8以上）
python3 --version

# 3. テストスクリプトに実行権限を付与
chmod +x test.sh start.sh deploy.sh

# 4. テスト実行（全て合格することを確認）
./test.sh

# 5. ローカルサーバー起動
./start.sh
```

### セットアップ後の確認

ブラウザで `http://localhost:8000` を開き、以下を確認：

- [ ] トップページが表示される
- [ ] ナビゲーションリンクが動作する
- [ ] JSONデータが正常に読み込まれる
- [ ] Service Workerが登録される

---

## 💻 ローカル開発

### ディレクトリ構造

```
hunting-license-app/
├── app/                    # アプリケーション本体
│   ├── *.html              # HTMLファイル（19個）
│   ├── *.js                # JavaScriptファイル（11個）
│   ├── *.css               # CSSファイル（4個）
│   ├── js/                 # JavaScript追加モジュール
│   └── manifest.json       # PWA設定
├── *.json                  # データファイル（トップレベル）
├── docs/                   # ドキュメント
├── test.sh                 # テストスクリプト
├── start.sh                # サーバー起動スクリプト
├── deploy.sh               # デプロイスクリプト
└── README.md               # プロジェクト概要
```

### ローカルサーバーの起動

#### 方法1: クイックスタート（推奨）

```bash
./start.sh
```

このスクリプトは以下を自動で行います：
- ポート8000〜8010の空きポート検索
- Python http.serverの起動
- ブラウザで自動オープン（macOSのみ）

#### 方法2: 手動起動

```bash
cd hunting-license-app
python3 -m http.server 8000
```

その後、ブラウザで `http://localhost:8000/app/` を開く。

#### 方法3: VS Code Live Server

1. VS Codeで `app/index.html` を開く
2. 右クリック → "Open with Live Server"
3. 自動的にブラウザが開く

---

## 🐛 デバッグ方法

### ブラウザ開発者ツールの活用

#### Consoleタブ

アプリケーションログを確認：

```javascript
// 主要なログ出力箇所
console.log('データ読み込み開始');
console.log('問題データ:', quizDatabase);
console.error('エラー:', error);
```

**よく見るログ**:
- `データ読み込み開始` → データ読み込みの開始
- `データ読み込み完了` → 正常終了
- `エラー: Failed to fetch` → ネットワークエラー

#### Networkタブ

リソース読み込みを確認：

1. Networkタブを開く
2. ページをリロード
3. 以下を確認：
   - [ ] 全てのJSONファイルが200 OKで読み込まれている
   - [ ] Service Workerがインストールされている
   - [ ] リソースがキャッシュされている

#### Applicationタブ

LocalStorageとService Workerを確認：

1. Application → Storage → Local Storage
   - `hunting_license_progress`: 学習進捗
   - `hunting_license_notes`: 学習ノート
   - `hunting_license_wrong_questions`: 間違えた問題

2. Application → Service Workers
   - Status: `activated and is running`
   - Update on reload: チェックを入れると開発が楽

### よくあるデバッグケース

#### ケース1: JSONデータが読み込まれない

**症状**: 問題が表示されない、エラーメッセージが出る

**確認手順**:
```bash
# 1. JSON構文が正しいか確認
python3 -c "import json; json.load(open('quiz-database.json'))"

# 2. ファイルが存在するか確認
ls -l quiz-database.json

# 3. 相対パスが正しいか確認（ブラウザのConsoleで）
fetch('../quiz-database.json').then(r => r.json()).then(console.log)
```

**解決策**:
- JSON構文エラー → `test.sh`でエラー箇所を確認
- ファイルが存在しない → ファイル名、配置場所を確認
- パスが間違っている → HTMLから見た相対パスを修正

#### ケース2: Service Workerが更新されない

**症状**: コードを変更してもキャッシュが更新されない

**解決策**:
1. ブラウザ開発者ツール → Application → Service Workers
2. "Unregister" をクリック
3. ページをリロード
4. または、`service-worker.js`の`CACHE_NAME`のバージョンを上げる

```javascript
// Before
const CACHE_NAME = 'hunting-license-v2';

// After
const CACHE_NAME = 'hunting-license-v3';
```

#### ケース3: LocalStorageデータを削除したい

**手順**:
1. ブラウザ開発者ツール → Application → Local Storage
2. `localhost` または該当ドメインを右クリック
3. "Clear" をクリック

またはConsoleで：
```javascript
localStorage.clear();
location.reload();
```

---

## 🔄 開発ワークフロー

### 新機能追加のフロー

```bash
# 1. 最新のmainブランチから開始
git checkout main
git pull origin main

# 2. featureブランチを作成
git checkout -b feature/new-function-name

# 3. コードを編集
# （エディタで編集）

# 4. ローカルで動作確認
./start.sh
# ブラウザで動作確認

# 5. テスト実行
./test.sh

# 6. コミット
git add .
git commit -m "feat: 新機能の追加"

# 7. プッシュ
git push origin feature/new-function-name

# 8. プルリクエストを作成
# GitHubでプルリクエストを作成
```

### バグ修正のフロー

```bash
# 1. bugfixブランチを作成
git checkout -b bugfix/fix-description

# 2. バグを修正
# （エディタで編集）

# 3. 動作確認・テスト
./start.sh
./test.sh

# 4. コミット
git add .
git commit -m "fix: バグ修正の説明"

# 5. プッシュ・プルリクエスト
git push origin bugfix/fix-description
```

### コミットメッセージのルール

[Conventional Commits](https://www.conventionalcommits.org/)に従う：

| プレフィックス | 用途 |
|--------------|------|
| `feat:` | 新機能の追加 |
| `fix:` | バグ修正 |
| `docs:` | ドキュメントのみの変更 |
| `style:` | コードの動作に影響しない変更（フォーマット、空白等） |
| `refactor:` | リファクタリング |
| `test:` | テストの追加・修正 |
| `chore:` | ビルドプロセス、ツール設定等の変更 |

**例**:
```bash
git commit -m "feat: ゲームモードにランキング機能を追加"
git commit -m "fix: 模擬試験のタイマーが正常に動作しない問題を修正"
git commit -m "docs: USAGE_GUIDE.mdに新しいセクションを追加"
```

---

## 🧪 テスト

### テストスクリプトの実行

```bash
./test.sh
```

**実行内容**:
- ディレクトリ構造のチェック
- HTMLファイルの存在確認
- JavaScriptファイルの存在確認
- CSSファイルの存在確認
- JSONファイルの存在確認
- JSON構文の検証（Python）
- データの整合性確認（問題数、鳥獣数等）

### 手動テスト

#### 基本機能テスト

1. **問題演習**:
   - [ ] カテゴリ選択ができる
   - [ ] 問題が表示される
   - [ ] 回答を選択できる
   - [ ] 正解・不正解が表示される
   - [ ] 解説が表示される

2. **模擬試験**:
   - [ ] 試験開始ができる
   - [ ] タイマーが動作する
   - [ ] 30問が出題される
   - [ ] 結果が表示される

3. **鳥獣図鑑**:
   - [ ] 鳥獣一覧が表示される
   - [ ] フラッシュカードが動作する
   - [ ] 5秒判別モードが動作する

4. **学習ノート**:
   - [ ] ノートが作成できる
   - [ ] ノートが保存される
   - [ ] エクスポート・インポートができる

#### ブラウザ互換性テスト

| ブラウザ | バージョン | テスト結果 |
|---------|----------|-----------|
| Chrome | 90以上 | ☐ |
| Safari | 14以上 | ☐ |
| Firefox | 88以上 | ☐ |
| Edge | 90以上 | ☐ |

#### モバイルテスト

| デバイス | OS | テスト結果 |
|---------|-------|-----------|
| iPhone | iOS 14以上 | ☐ |
| Android | 10以上 | ☐ |

---

## 🔧 トラブルシューティング

### よくある問題と解決策

#### 問題1: `test.sh`で「permission denied」エラー

**原因**: 実行権限がない

**解決策**:
```bash
chmod +x test.sh start.sh deploy.sh
```

#### 問題2: JSONデータが読み込まれない（CORSエラー）

**原因**: ファイルプロトコル（`file://`）ではJSONが読み込めない

**解決策**:
```bash
# 必ずローカルサーバーを起動する
./start.sh
```

#### 問題3: Service Workerが登録されない

**原因**: HTTPSまたはlocalhostでない

**解決策**:
- ローカル開発では `localhost:8000` を使用
- 本番環境ではHTTPSを使用

#### 問題4: LocalStorageデータが保存されない

**原因**: ブラウザのプライベートモード、またはStorageの容量制限

**解決策**:
- 通常モードで開く
- LocalStorageの容量を確認（5MB制限）
- 不要なデータを削除

#### 問題5: 画像が表示されない

**原因**: パスが間違っている

**解決策**:
```html
<!-- 相対パス（推奨） -->
<img src="./images/icon.svg" alt="アイコン">

<!-- 絶対パスは避ける -->
<!-- <img src="/images/icon.svg" alt="アイコン"> -->
```

---

## ⚡ パフォーマンス最適化

### 計測方法

#### Chrome DevTools

1. ブラウザで `Ctrl+Shift+I` （Mac: `Cmd+Option+I`）
2. Lighthouse タブを選択
3. "Generate report" をクリック

**目標スコア**:
- Performance: 90以上
- Accessibility: 100
- Best Practices: 90以上
- SEO: 90以上

#### ページ読み込み時間の計測

Consoleで：
```javascript
performance.getEntriesByType('navigation')[0].loadEventEnd
```

**目標**: 3秒以内（初回）、1秒以内（2回目以降）

### 最適化テクニック

#### 1. 画像の最適化

```bash
# SVGの最適化（svgoを使用）
svgo icon.svg -o icon-optimized.svg

# PNGの圧縮（pngquant使用）
pngquant icon.png --output icon-compressed.png
```

#### 2. JavaScriptの遅延読み込み

```html
<!-- 非同期読み込み -->
<script src="app.js" defer></script>
```

#### 3. CSSの最小化

```bash
# cssのminify（online toolを使用）
# または、手動で不要な空白・コメントを削除
```

#### 4. Service Workerのキャッシュ最適化

```javascript
// PRECACHE_URLSに必要最小限のリソースのみ含める
const PRECACHE_URLS = [
  '/',
  '/index.html',
  // 必要なリソースのみ
];
```

---

## ❓ よくある質問

### Q1: 新しい問題を追加するには？

**A**: `quiz-database.json`または`extended-quiz-database.json`に追加：

```json
{
  "id": "Q116",
  "category": "law",
  "difficulty": "medium",
  "question": "問題文",
  "options": ["選択肢1", "選択肢2", "選択肢3"],
  "correctAnswer": 0,
  "explanation": "解説",
  "source": "出典",
  "tips": "覚え方"
}
```

その後、`./test.sh`でJSON構文を確認。

### Q2: 新しいカテゴリを追加するには？

**A**: 以下のファイルを修正：

1. `app.js`の`categoryNames`オブジェクト
2. `design-system.css`でカテゴリ用のカラーを定義
3. `index.html`のカテゴリボタンに追加

### Q3: デザインを変更するには？

**A**: `design-system.css`のCSS変数を変更：

```css
:root {
  --primary-color: #2c3e50;  /* メインカラー */
  --secondary-color: #3498db; /* セカンダリカラー */
  /* ... */
}
```

### Q4: オフライン機能を無効にするには？

**A**: `service-worker.js`の登録を削除：

```javascript
// index.htmlから以下を削除またはコメントアウト
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
```

### Q5: 他の免許種別（わな猟等）に対応するには？

**A**: 以下の手順：

1. データファイルを複製（`quiz-database-wana.json`等）
2. `app.js`でデータ読み込み先を切り替えるロジックを追加
3. UI上で免許種別を選択できるようにする

---

## 📚 参考リソース

### 公式ドキュメント

- [JavaScript (MDN)](https://developer.mozilla.org/ja/docs/Web/JavaScript)
- [HTML Living Standard](https://html.spec.whatwg.org/)
- [CSS Specification](https://www.w3.org/Style/CSS/)
- [Service Worker API](https://developer.mozilla.org/ja/docs/Web/API/Service_Worker_API)

### 開発ツール

- [VS Code](https://code.visualstudio.com/)
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### 学習リソース

- [JavaScript.info](https://ja.javascript.info/)
- [MDN Web Docs](https://developer.mozilla.org/ja/)
- [web.dev](https://web.dev/)

---

## 🤝 コントリビューション

バグ報告、機能提案、プルリクエストは大歓迎です！

詳細は [CONTRIBUTING.md](./CONTRIBUTING.md) をご覧ください。

---

**Happy Coding! 🚀**
