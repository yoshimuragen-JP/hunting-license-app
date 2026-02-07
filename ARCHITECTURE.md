# 🏗️ アーキテクチャ設計書

**狩猟免許試験 完全攻略アプリの技術アーキテクチャ**

---

## 📐 システムアーキテクチャ

### 全体構成

```
┌─────────────────────────────────────────────────────────┐
│                      ユーザー                            │
│                   (Browser/PWA)                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ HTTP/HTTPS
                 │
┌────────────────▼────────────────────────────────────────┐
│             Static File Server                          │
│          (Python http.server / Netlify)                │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ File Read
                 │
┌────────────────▼────────────────────────────────────────┐
│                    App Files                            │
│  ┌────────────┬────────────┬────────────┬─────────┐   │
│  │    HTML    │     CSS    │  JavaScript│   JSON  │   │
│  │  (19 files)│  (4 files) │ (10 files) │(5 files)│   │
│  └────────────┴────────────┴────────────┴─────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │            Service Worker                       │   │
│  │  - Offline caching (35 resources)              │   │
│  │  - Stale While Revalidate strategy             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │            LocalStorage                         │   │
│  │  - User progress                                │   │
│  │  - Quiz history                                 │   │
│  │  - Notes                                        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🧩 レイヤーアーキテクチャ

### 1. プレゼンテーション層（HTML）

**責任**: ユーザーインターフェースの表示

| ファイル | 役割 |
|---------|------|
| index.html | トップページ、ナビゲーション |
| animals.html | 鳥獣図鑑表示 |
| practical.html | 実技ガイド表示 |
| mock-exam.html | 模擬試験UI |
| dashboard.html | 進捗ダッシュボード |
| game.html | ゲームモードUI |
| guide.html | 学習ガイド表示 |
| notes.html | 学習ノートUI |
| faq.html | FAQ表示 |

**設計原則**:
- セマンティックHTML（`<section>`, `<article>`, `<nav>` 等）
- アクセシビリティ（ARIA属性、role属性）
- レスポンシブデザイン（viewport, メディアクエリ）

### 2. スタイル層（CSS）

**責任**: ビジュアルデザイン、レイアウト、レスポンシブ対応

| ファイル | 役割 |
|---------|------|
| design-system.css | デザインシステム、CSS変数 |
| style.css | ページ固有のスタイル |
| accessibility.css | アクセシビリティ特化 |
| mobile-optimized.css | モバイル最適化 |

**設計原則**:
- CSS変数（`:root`）による統一的なデザイントークン
- BEM風命名規則
- モバイルファースト設計
- レスポンシブブレークポイント（768px, 1024px）

### 3. ロジック層（JavaScript）

**責任**: ビジネスロジック、データ操作、イベント処理

| ファイル | 役割 |
|---------|------|
| app.js | 共通ロジック、データ読み込み |
| dashboard.js | 進捗分析、グラフ描画 |
| game.js | ゲームモードロジック |
| mock-exam.js | 模擬試験ロジック、タイマー |
| notes.js | ノート管理（CRUD） |
| sound.js | 効果音再生 |
| accessibility.js | アクセシビリティ機能 |
| mobile-utils.js | モバイル最適化機能 |

**設計原則**:
- モジュール化（クラス、関数）
- 単一責任の原則
- LocalStorageを唯一の永続化手段
- エラーハンドリング（try-catch）

### 4. データ層（JSON）

**責任**: 問題、鳥獣情報、学習ティップス等のデータ

| ファイル | 役割 |
|---------|------|
| quiz-database.json | 問題データベース（66問） |
| extended-quiz-database.json | 拡張問題（49問） |
| hunting-license-data.json | 鳥獣情報（43種） |
| study-tips.json | 学習ティップス（30個）、3週間プラン |
| motivational-messages.json | モチベーションメッセージ（100個以上） |

**データ構造設計**:
- 正規化されたJSON構造
- 一意なID（`Q001`, `tip_001` 等）
- カテゴリ、難易度によるタグ付け

---

## 🔄 データフロー

### 1. アプリケーション初期化

```
User opens app
    ↓
index.html loaded
    ↓
app.js: DOMContentLoaded event
    ↓
loadData() function
    ↓
fetch('../quiz-database.json')
fetch('../hunting-license-data.json')
    ↓
Data stored in global variables
    ↓
initializeApp()
    ↓
UI initialization complete
```

### 2. 問題演習フロー

```
User clicks "問題演習"
    ↓
app.js: loadCategory(category)
    ↓
Filter questions by category
    ↓
displayQuestion(questionIndex)
    ↓
User selects answer
    ↓
checkAnswer(selectedIndex)
    ↓
Update score, show explanation
    ↓
Save to LocalStorage
    ↓
Next question or finish
```

### 3. 学習データ永続化フロー

```
User answers question
    ↓
JavaScript: updateProgress()
    ↓
Calculate new stats
    ↓
JSON.stringify(progressData)
    ↓
localStorage.setItem('hunting_license_progress', data)
    ↓
Data persisted in browser
```

### 4. Service Worker キャッシュフロー

```
Browser requests resource
    ↓
Service Worker intercepts (fetch event)
    ↓
Check cache (caches.match(request))
    ↓
Cache hit?
  YES → Return cached response
   ↓    Fetch from network (background update)
  NO → Fetch from network
   ↓    Store in cache
Return response
```

---

## 💾 データモデル

### LocalStorage構造

```javascript
// 学習進捗
localStorage.setItem('hunting_license_progress', JSON.stringify({
  totalQuestions: 150,
  correctAnswers: 120,
  categoryScores: {
    law: { total: 30, correct: 25 },
    gun: { total: 25, correct: 20 },
    animal: { total: 50, correct: 45 },
    management: { total: 25, correct: 20 },
    practical: { total: 20, correct: 10 }
  },
  studyTime: 7200, // seconds
  lastUpdated: 1672531200000 // timestamp
}));

// 学習ノート
localStorage.setItem('hunting_license_notes', JSON.stringify([
  {
    id: 'note_001',
    category: 'law',
    title: '狩猟期間の覚え方',
    content: '本州以南: 11/15〜2/15（いい肉にいご）',
    createdAt: 1672531200000,
    tags: ['法令', '暗記']
  }
]));

// 間違えた問題
localStorage.setItem('hunting_license_wrong_questions', JSON.stringify([
  'Q012', 'Q023', 'Q045'
]));
```

### JSONデータ構造

```json
// quiz-database.json
{
  "questions": [
    {
      "id": "Q001",
      "category": "law",
      "difficulty": "easy",
      "question": "問題文",
      "options": ["選択肢1", "選択肢2", "選択肢3"],
      "correctAnswer": 0,
      "explanation": "解説",
      "source": "狩猟読本 p.42",
      "tips": "覚え方"
    }
  ]
}

// hunting-license-data.json
{
  "huntableAnimals": [
    {
      "id": "bird_001",
      "name": "キジ",
      "scientificName": "Phasianus colchicus",
      "category": "bird",
      "characteristics": ["体長80cm", "オスは鮮やかな羽色"],
      "identificationPoints": ["首の横縞", "長い尾"],
      "similarSpecies": ["ヤマドリ"],
      "tips": "キジは首に横縞、ヤマドリは縦縞"
    }
  ]
}
```

---

## 🛡️ セキュリティアーキテクチャ

### 3層の防御

#### 1. HTTP Headers

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
```

#### 2. Input Sanitization

```javascript
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}
```

#### 3. LocalStorage Only（Cookieなし）

- XSS攻撃対象面を減らす
- CSRF攻撃のリスク軽減

---

## 📱 PWAアーキテクチャ

### Service Worker戦略

**Stale While Revalidate**:
1. キャッシュから即座に返却（高速表示）
2. バックグラウンドでネットワークから更新
3. 次回アクセス時に最新版を提供

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      });
    })
  );
});
```

### Offline対応

**プリキャッシュリソース（35個）**:
- 全HTMLファイル（10個）
- 全CSSファイル（4個）
- 全JavaScriptファイル（8個）
- 全JSONデータファイル（5個）
- manifest.json

---

## 🎨 デザインシステム

### CSS変数（デザイントークン）

```css
:root {
  /* カラーパレット */
  --primary-color: #2c3e50;
  --secondary-color: #3498db;
  --success-color: #27ae60;
  --warning-color: #f39c12;
  --error-color: #e74c3c;
  
  /* タイポグラフィ */
  --font-size-base: 16px;
  --font-size-h1: 2.5rem;
  --font-size-h2: 2rem;
  
  /* スペーシング */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  
  /* ブレークポイント */
  --breakpoint-mobile: 768px;
  --breakpoint-tablet: 1024px;
}
```

---

## ♿ アクセシビリティアーキテクチャ

### ARIA属性戦略

```html
<!-- ナビゲーション -->
<nav role="navigation" aria-label="メインナビゲーション">
  <a href="#main" class="skip-link" aria-label="メインコンテンツへスキップ">
    コンテンツへスキップ
  </a>
</nav>

<!-- ボタン -->
<button 
  aria-label="次の問題へ進む" 
  aria-describedby="progress-status">
  次へ
</button>

<!-- フォーム -->
<label for="note-title">タイトル</label>
<input 
  id="note-title" 
  type="text" 
  aria-required="true"
  aria-invalid="false">
```

---

## 📊 パフォーマンス最適化

### 最適化戦略

1. **遅延読み込み**
   - 画像: `loading="lazy"`
   - JavaScript: 必要なときのみ実行

2. **キャッシュ戦略**
   - Service Worker: Stale While Revalidate
   - LocalStorage: ブラウザ永続化

3. **最小化**
   - HTML/CSS/JS: 圧縮（将来的にminify）

4. **CDN不使用**
   - 外部依存ゼロ
   - オフライン完全動作

---

## 🧪 テストアーキテクチャ

### テスト構造

```bash
test.sh
├── ディレクトリ構造テスト
├── HTMLファイル存在テスト
├── JavaScriptファイル存在テスト
├── CSSファイル存在テスト
├── データファイル存在テスト
├── PWA関連ファイルテスト
├── ドキュメントテスト
├── スクリプト実行権限テスト
├── JSON構文テスト（python3使用）
└── データ検証テスト（問題数、鳥獣数）
```

---

## 🚀 デプロイアーキテクチャ

### デプロイフロー

```
Local Development
    ↓
test.sh (100% pass)
    ↓
git commit
    ↓
git push origin main
    ↓
[Deployment Platform]
├─ Netlify: Auto deploy on push
├─ Vercel: Auto deploy on push
└─ GitHub Pages: Manual deploy
    ↓
Production Environment
```

---

## 📐 拡張性設計

### 将来の拡張ポイント

1. **多言語対応**
   - i18nフレームワーク導入
   - 言語ファイル分離（ja.json, en.json）

2. **バックエンド追加**
   - ユーザー認証
   - クラウド同期
   - コミュニティ機能

3. **AI機能**
   - 弱点分析AI
   - 個別学習プラン生成
   - 問題推薦エンジン

4. **他の免許種別対応**
   - 第二種銃猟
   - わな猟
   - 網猟

---

## 🔧 開発者ガイド

### 開発環境セットアップ

```bash
# 1. リポジトリクローン
git clone https://github.com/your-repo/hunting-license-app.git
cd hunting-license-app

# 2. ローカルサーバー起動
./start.sh

# 3. ブラウザで開く
open http://localhost:8000
```

### ファイル編集ワークフロー

1. HTMLを編集 → ブラウザリロード
2. CSSを編集 → ブラウザリロード
3. JavaScriptを編集 → ブラウザリロード
4. JSONを編集 → 構文チェック → ブラウザリロード

### デバッグ方法

```javascript
// ブラウザコンソールで
console.log(quizDatabase); // 問題データ確認
console.log(huntingData); // 鳥獣データ確認
console.log(localStorage.getItem('hunting_license_progress')); // 進捗確認
```

---

## 📚 参考資料

- **HTML Living Standard**: https://html.spec.whatwg.org/
- **CSS Specification**: https://www.w3.org/Style/CSS/
- **JavaScript (ECMAScript)**: https://tc39.es/ecma262/
- **PWA**: https://web.dev/progressive-web-apps/
- **WCAG 2.1**: https://www.w3.org/TR/WCAG21/
- **Service Worker**: https://w3c.github.io/ServiceWorker/

---

**このアーキテクチャは、シンプルさと拡張性を両立させています。** 🏗️
