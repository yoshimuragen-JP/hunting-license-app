# 修正必須項目リスト

**作成日**: 2026-02-06  
**優先度**: Critical → High → Medium → Low

---

## 🔴 Critical: 即座に対応必須

### 1. style.css欠損（修正済み）

**ステータス**: ✅ **QAテスト中に緊急対応済み**

**対応内容**:
- 最小限の内容で`app/style.css`を作成
- PWAインストールプロンプトのスタイル
- スキップリンクのスタイル
- CSS変数定義

**今後の対応**:
- デザイナーによるレビュー
- デザインシステムとの整合性確認
- 不足しているスタイルの追加

---

## 🟠 High: 1週間以内に対応

### 2. PWAアイコンファイル作成

**問題**: 以下のアイコンファイルが存在しない

```
/icons/icon-16x16.png
/icons/icon-32x32.png
/icons/icon-72x72.png
/icons/icon-96x96.png
/icons/icon-128x128.png
/icons/icon-144x144.png
/icons/icon-152x152.png
/icons/icon-180x180.png
/icons/icon-192x192.png
/icons/icon-384x384.png
/icons/icon-512x512.png
```

**影響**:
- PWAとしてインストール不可
- favicon表示されず
- ホーム画面アイコンなし

**修正方法**:

#### Option A: 🎯絵文字ベースアイコン（暫定対応）

```bash
# ImageMagickを使用して絵文字からアイコン生成
# 🎯絵文字をPNGに変換
convert -background white -fill black -font "Apple Color Emoji" \
  -pointsize 480 -size 512x512 -gravity center \
  label:"🎯" app/icons/icon-512x512.png

# リサイズして各サイズを生成
for size in 16 32 72 96 128 144 152 180 192 384; do
  convert app/icons/icon-512x512.png -resize ${size}x${size} \
    app/icons/icon-${size}x${size}.png
done
```

#### Option B: 正式なアイコンデザイン（推奨）

1. デザイナーにアイコンデザインを依頼
2. 512x512pxのマスター画像を作成
3. 各サイズに自動リサイズ
4. maskable iconとして最適化

**担当**: デザイナー  
**工数**: 2-4時間  
**期限**: 2026-02-13

---

### 3. mock-exam.htmlのタイトル修正

**ファイル**: `app/mock-exam.html` 6行目

**現在**:
```html
<title>証券外務員二種 模擬試験システム</title>
```

**修正後**:
```html
<title>狩猟免許試験 模擬試験 | 本番形式で実力測定</title>
```

**修正方法**:
```bash
# 自動修正コマンド
cd ~/projects/surprise/2026-02-06/app
sed -i.bak 's/証券外務員二種 模擬試験システム/狩猟免許試験 模擬試験 | 本番形式で実力測定/' mock-exam.html
```

**担当**: フロントエンド開発者  
**工数**: 5分  
**期限**: 即座

---

### 4. 実機テスト実施

**必須デバイス**:
- iPhone SE (320px幅) - モバイル最小サイズ
- iPhone 12/13 (390px幅) - 標準サイズ
- iPad (768px幅) - タブレット
- Android端末（Samsung Galaxy等）

**テスト項目**:
- ページ表示確認
- タッチ操作の反応速度
- フォントサイズの可読性
- ボタンのタップ可能領域
- 横向き表示の対応

**担当**: QAエンジニア  
**工数**: 4時間  
**期限**: 2026-02-13

---

## 🟡 Medium: 1ヶ月以内に対応

### 5. innerHTML使用箇所のセキュリティレビュー

**検出箇所**:
- accessibility.js: 2箇所
- app.js: 9箇所
- その他のJSファイル: 4箇所以上

**対応方法**:

#### Step 1: 全箇所をリストアップ
```bash
grep -rn "innerHTML\s*=" app/*.js > /tmp/innerhtml_usage.txt
```

#### Step 2: 各箇所を分類
- ユーザー入力を含む → **即座に修正**
- 固定文字列のみ → **低優先度**

#### Step 3: 修正方法
```javascript
// ❌ Before: XSSリスクあり
element.innerHTML = userInput;

// ✅ After: テキストのみ
element.textContent = userInput;

// または
const sanitized = DOMPurify.sanitize(userInput);
element.innerHTML = sanitized;
```

**担当**: セキュリティエンジニア  
**工数**: 2時間  
**期限**: 2026-02-20

---

### 6. animals.htmlの最適化

**問題**: ファイルサイズが64KB（他ページの2-4倍）

**原因**: 全ての鳥獣データを1ページに含めている

**修正方法**:

#### Option A: ページネーション
```javascript
// 10件ずつ表示
const ITEMS_PER_PAGE = 10;
let currentPage = 1;

function renderPage(page) {
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const items = allAnimals.slice(start, end);
  // レンダリング処理
}
```

#### Option B: 動的読み込み
```javascript
// JSONファイルを分割
// animals-mammals.json
// animals-birds.json
// カテゴリごとに読み込み
```

**担当**: フロントエンド開発者  
**工数**: 3時間  
**期限**: 2026-03-06

---

### 7. ユニットテスト追加

**現状**: テストコードなし

**推奨フレームワーク**: Jest

**テスト対象**:
- LocalStorage操作関数
- クイズロジック
- スコア計算関数
- タイマー機能

**サンプルテスト**:
```javascript
// app.test.js
describe('Quiz System', () => {
  test('should calculate score correctly', () => {
    const correctAnswers = 7;
    const totalQuestions = 10;
    const score = calculateScore(correctAnswers, totalQuestions);
    expect(score).toBe(70);
  });
});
```

**担当**: 開発チーム  
**工数**: 8時間  
**期限**: 2026-03-06

---

## 🟢 Low: 優先度低（時間があれば対応）

### 8. インラインスタイルの削減

**検出箇所**:
- animals.html: 11箇所
- index.html: 6箇所
- mock-exam.html: 5箇所

**修正方法**:
```html
<!-- ❌ Before -->
<div style="margin: 20px; color: red;">

<!-- ✅ After -->
<div class="warning-box">
```

```css
/* CSSファイルに追加 */
.warning-box {
  margin: 20px;
  color: red;
}
```

**担当**: フロントエンド開発者  
**工数**: 1時間  
**期限**: 随時

---

### 9. ドキュメント整備

**必要なドキュメント**:
- README.md: プロジェクト概要、セットアップ手順
- CONTRIBUTING.md: 開発ガイドライン
- CHANGELOG.md: バージョン履歴

**担当**: テックリード  
**工数**: 2時間  
**期限**: 随時

---

## 📋 修正チェックリスト

### 即座に対応（リリースブロッカー）

- [x] style.css作成（QAテスト中に対応済み）
- [ ] PWAアイコン作成（8サイズ）
- [ ] mock-exam.htmlタイトル修正
- [ ] 実機テスト実施

### 短期対応（1週間以内）

- [ ] innerHTML箇所のレビュー
- [ ] セキュリティ監査

### 中期対応（1ヶ月以内）

- [ ] animals.html最適化
- [ ] ユニットテスト追加
- [ ] パフォーマンステスト（Lighthouse）

### 長期対応（随時）

- [ ] インラインスタイル削減
- [ ] ドキュメント整備
- [ ] E2Eテスト追加

---

## 🚀 次のステップ

1. **この修正リストをチームで共有**
2. **各タスクの担当者をアサイン**
3. **期限を設定してトラッキング**
4. **修正完了後、再度QAテスト実施**

---

**作成者**: QA Engineer (Claude)  
**最終更新**: 2026-02-06

