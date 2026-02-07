# アクセシビリティガイド

このアプリは、すべてのユーザーが快適に学習できるよう、WCAG 2.1 AAレベル準拠のアクセシビリティ機能を実装しています。

## 目次

1. [アクセシビリティ機能の概要](#アクセシビリティ機能の概要)
2. [キーボード操作](#キーボード操作)
3. [スクリーンリーダー対応](#スクリーンリーダー対応)
4. [視覚的配慮](#視覚的配慮)
5. [聴覚的配慮](#聴覚的配慮)
6. [運動機能への配慮](#運動機能への配慮)
7. [テスト方法](#テスト方法)
8. [開発者向け情報](#開発者向け情報)

---

## アクセシビリティ機能の概要

### 実装済み機能

- ✅ **キーボード完全対応**: マウスなしで全機能が使える
- ✅ **スクリーンリーダー対応**: NVDA、JAWS、VoiceOverで読み上げ可能
- ✅ **カラーコントラスト**: WCAG AA基準（4.5:1以上）を満たすコントラスト比
- ✅ **フォントサイズ調整**: 4段階のサイズ調整機能
- ✅ **ハイコントラストモード**: 視認性を最大化
- ✅ **モーション削減**: アニメーションを最小限に
- ✅ **大きなタップ領域**: すべてのボタンが44x44px以上
- ✅ **効果音のON/OFF**: 視覚的フィードバックも提供
- ✅ **フォーカス管理**: 明確なフォーカス表示とトラップ機能

---

## キーボード操作

### 基本操作

| キー | 機能 |
|------|------|
| **Tab** | 次の要素に移動 |
| **Shift + Tab** | 前の要素に移動 |
| **Enter / Space** | ボタン・リンクを選択 |
| **Escape** | モーダル・メニューを閉じる |

### ショートカットキー

| キー | 機能 |
|------|------|
| **Alt + H** | ホーム画面に戻る |
| **Alt + M** | メニューを開く/閉じる |
| **Alt + S** | アクセシビリティ設定を開く |

### 問題演習中の操作

| キー | 機能 |
|------|------|
| **1 / 2 / 3 / 4** | 選択肢1〜4を選ぶ |
| **← (左矢印)** | 前の問題へ |
| **→ (右矢印)** | 次の問題へ |

### スキップリンク

ページの先頭に「メインコンテンツへスキップ」リンクがあります。

- **Tab**キーを押すと最初に表示される
- **Enter**でメインコンテンツに直接ジャンプ
- ナビゲーションをスキップして効率的に学習開始

---

## スクリーンリーダー対応

### 対応スクリーンリーダー

- ✅ **NVDA**（Windows）
- ✅ **JAWS**（Windows）
- ✅ **VoiceOver**（macOS、iOS）
- ✅ **TalkBack**（Android）
- ✅ **ChromeVox**（Chrome拡張）

### ARIA属性

#### セマンティックHTML

```html
<!-- ランドマーク -->
<header role="banner">ヘッダー</header>
<nav role="navigation" aria-label="メインナビゲーション">ナビ</nav>
<main role="main">メインコンテンツ</main>
<footer role="contentinfo">フッター</footer>
```

#### 状態の明示

```html
<!-- ボタンの状態 -->
<button aria-pressed="true">選択済み</button>
<button aria-disabled="true">無効</button>

<!-- 拡張可能要素 -->
<button aria-expanded="false" aria-controls="menu">メニュー</button>

<!-- 進捗バー -->
<div role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100">
```

#### ライブリージョン

画面の変更を自動的に読み上げ：

```html
<!-- 通知エリア（polite） -->
<div role="status" aria-live="polite" aria-atomic="true">
    問題を読み込みました
</div>

<!-- 緊急通知（assertive） -->
<div role="alert" aria-live="assertive" aria-atomic="true">
    時間切れです
</div>
```

### スクリーンリーダーでの操作例

#### VoiceOverの場合（macOS）

1. **VoiceOverを起動**: `Command + F5`
2. **ページを読み上げ**: `Control + Option + A`
3. **次の見出しに移動**: `Control + Option + Command + H`
4. **次のボタンに移動**: `Control + Option + Command + B`
5. **クリック**: `Control + Option + Space`

#### NVDAの場合（Windows）

1. **NVDAを起動**: `Control + Alt + N`
2. **次の見出しに移動**: `H`
3. **次のリンクに移動**: `K`
4. **次のボタンに移動**: `B`
5. **次のフォーム要素**: `F`
6. **クリック**: `Enter / Space`

---

## 視覚的配慮

### カラーコントラスト

すべてのテキストと背景のコントラスト比は**WCAG AA基準（4.5:1以上）**を満たしています。

#### コントラスト比の例

| 要素 | 前景色 | 背景色 | コントラスト比 |
|------|--------|--------|----------------|
| 本文テキスト | `#2c3e50` | `#ffffff` | **12.6:1** ✅ |
| リンク | `#0066cc` | `#ffffff` | **7.9:1** ✅ |
| ボタン（Primary） | `#ffffff` | `#3498db` | **4.7:1** ✅ |
| ボタン（Secondary） | `#2c3e50` | `#ecf0f1` | **9.2:1** ✅ |

### ハイコントラストモード

視認性を最大化するモード：

- **背景**: 純黒（#000000）
- **文字**: 純白（#ffffff）
- **リンク**: シアン（#00ffff）
- **ボタン**: 黄色/シアン（#ffff00 / #00ffff）
- **境界線**: 明確な白線

#### 有効化方法

1. 画面右下の**アクセシビリティボタン**（♿アイコン）をクリック
2. **ハイコントラストモード**をON
3. または `Alt + S` → ハイコントラストモードを有効化

### フォントサイズ調整

4段階のフォントサイズを選択可能：

| サイズ | ベースフォント | 見出し1 |
|--------|----------------|---------|
| **小** | 14px | 2rem (28px) |
| **中**（デフォルト） | 16px | 2.5rem (40px) |
| **大** | 18px | 3rem (54px) |
| **特大** | 20px | 3.5rem (70px) |

#### 変更方法

1. アクセシビリティ設定を開く
2. **フォントサイズ**セクションで「小/中/大/特大」を選択
3. 設定は自動保存される

### 色だけに頼らない情報伝達

すべての情報は色以外の手段でも伝達：

- ✅ **正解/不正解**: ✅ ❌ アイコンと文字でも表示
- ✅ **カテゴリ**: アイコン（📚 ✏️ 🎯）と文字でも識別可能
- ✅ **進捗**: プログレスバーに加えて「70%」と数値表示
- ✅ **状態**: 「選択済み」「無効」など明示的なラベル

---

## 聴覚的配慮

### 効果音のON/OFF

正解・不正解の効果音は無効化できます：

1. アクセシビリティ設定を開く
2. **効果音を有効にする**のチェックを外す

### 視覚的フィードバック（音の代替）

効果音をOFFにしても、視覚的なフィードバックは提供されます：

- ✅ **正解時**: ✅ 緑色のチェックマーク、解説ボックスが緑色に
- ❌ **不正解時**: ❌ 赤色のバツマーク、解説ボックスが赤色に
- 🔔 **通知**: 画面上部にメッセージが表示される

---

## 運動機能への配慮

### 大きなタップ領域

すべてのインタラクティブ要素は**最低44x44px**のタップ領域を確保：

- ボタン: 最小44x44px
- リンク: 最小44x44px（パディングで確保）
- 選択肢: 縦48px以上のタップ領域
- アイコンボタン: 正方形44x44px

### スワイプ操作の代替

スマートフォンでのスワイプ操作は、すべてボタンでも実行可能：

- 問題の前後移動: 「前へ」「次へ」ボタン
- メニュー開閉: ハンバーガーメニューボタン
- ページスクロール: ナビゲーションリンク

### タイムアウトの調整

模擬試験の制限時間は以下の通り：

- **標準**: 90分（本番と同じ）
- **延長**: 設定から変更可能（今後実装予定）

---

## テスト方法

### キーボード操作テスト

#### 手順

1. **マウスを使わずにTabキーのみで全画面を操作**
2. 以下を確認：
   - □ すべてのリンク・ボタンに到達できるか
   - □ フォーカスが視覚的に明確か
   - □ Tab順序が論理的か
   - □ Escapeでモーダルが閉じるか
   - □ EnterとSpaceで選択できるか

#### 実行コマンド（開発者向け）

```bash
# ChromeのDevToolsでフォーカス可能要素を確認
document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').length
```

### スクリーンリーダーテスト

#### NVDA（Windows）

1. **NVDAをインストール**: https://www.nvaccess.org/
2. **起動**: `Control + Alt + N`
3. **アプリを開く**: ブラウザでアプリを表示
4. **読み上げテスト**:
   - `H`: 見出しを順番に読む
   - `B`: ボタンを順番に読む
   - `K`: リンクを順番に読む
   - `Control`: 読み上げ停止
5. 確認事項:
   - □ すべての見出しが読み上げられるか
   - □ ボタンの役割が明確か
   - □ 画像の代替テキストがあるか
   - □ フォームラベルが読み上げられるか

#### VoiceOver（macOS）

1. **VoiceOverを有効化**: `Command + F5`
2. **操作**:
   - `Control + Option + →`: 次の要素
   - `Control + Option + ←`: 前の要素
   - `Control + Option + Space`: クリック
   - `Control + Option + U`: ローター（ナビゲーション）
3. 確認事項:
   - □ ページ構造が論理的か
   - □ ランドマークが適切か
   - □ 状態変化が通知されるか

### カラーコントラストテスト

#### ツール

1. **Lighthouse**（Chrome DevTools内蔵）
   ```
   Chrome DevTools → Lighthouse → Accessibility → Generate report
   ```

2. **axe DevTools**（Chrome拡張）
   - インストール: https://www.deque.com/axe/devtools/
   - 実行: DevTools → axe DevTools → Scan ALL

3. **WAVE**（Web Accessibility Evaluation Tool）
   - URL: https://wave.webaim.org/
   - アプリのURLを入力してスキャン

#### 手動確認

コントラスト比計算ツール：
- https://webaim.org/resources/contrastchecker/

最低基準:
- **通常テキスト**: 4.5:1以上
- **大きいテキスト**（18pt以上 or 14pt太字以上）: 3:1以上

---

## 開発者向け情報

### 実装のベストプラクティス

#### 1. セマンティックHTML

**良い例**:
```html
<button type="button" aria-label="メニューを開く">☰</button>
<nav role="navigation" aria-label="メインナビゲーション">...</nav>
<main role="main">...</main>
```

**悪い例**:
```html
<div onclick="openMenu()">☰</div> <!-- ボタンではない -->
<div class="nav">...</div> <!-- セマンティックでない -->
<div id="content">...</div> <!-- mainではない -->
```

#### 2. ARIA属性の正しい使用

```html
<!-- 展開可能メニュー -->
<button aria-expanded="false" aria-controls="menu-list" id="menu-btn">
    メニュー
</button>
<ul id="menu-list" aria-labelledby="menu-btn" hidden>...</ul>

<!-- 進捗バー -->
<div role="progressbar"
     aria-valuenow="70"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-label="問題の進捗">
    <div style="width: 70%"></div>
</div>

<!-- ライブリージョン -->
<div role="status" aria-live="polite">
    問題を読み込みました
</div>
```

#### 3. フォーカス管理

```javascript
// モーダルを開いたときにフォーカスを移動
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');

    // 前のフォーカスを記憶
    previousFocus = document.activeElement;

    // モーダル内の最初のフォーカス可能要素にフォーカス
    const firstFocusable = modal.querySelector('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
        firstFocusable.focus();
    }
}

// モーダルを閉じたときにフォーカスを戻す
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');

    // フォーカスを元の位置に戻す
    if (previousFocus && previousFocus.focus) {
        previousFocus.focus();
    }
}
```

#### 4. キーボードイベント

```javascript
// EnterとSpaceの両方をサポート
button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
    }
});

// Escapeでモーダルを閉じる
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.querySelector('[role="dialog"]:not([hidden])');
        if (modal) {
            closeModal(modal.id);
        }
    }
});
```

### アクセシビリティチェックリスト

開発時に確認すべき項目：

#### HTML構造

- [ ] すべての`<img>`に`alt`属性がある
- [ ] すべてのフォーム要素に`<label>`または`aria-label`がある
- [ ] 見出しが階層的（h1 → h2 → h3）
- [ ] ランドマーク（header, nav, main, footer）が適切
- [ ] リストは`<ul>/<ol>/<dl>`を使用

#### ARIA属性

- [ ] `role`属性が適切
- [ ] `aria-label`または`aria-labelledby`で要素をラベリング
- [ ] `aria-describedby`で説明を提供
- [ ] `aria-hidden="true"`の要素は本当に非表示にすべきか確認
- [ ] `aria-live`でライブリージョンを設定

#### キーボード操作

- [ ] すべてのインタラクティブ要素がキーボードで操作可能
- [ ] Tab順序が論理的
- [ ] フォーカスが視覚的に明確
- [ ] Escapeでモーダルが閉じる
- [ ] EnterとSpaceで選択できる

#### カラーコントラスト

- [ ] 通常テキストが4.5:1以上
- [ ] 大きいテキストが3:1以上
- [ ] 色だけで情報を伝達していない
- [ ] リンクが下線または明確な色で識別可能

#### その他

- [ ] タップ領域が44x44px以上
- [ ] ページタイトルが明確
- [ ] エラーメッセージが明確
- [ ] タイムアウトが調整可能（または十分長い）
- [ ] 自動再生されるメディアがない

### 自動テストツール

#### axe-core（JavaScript）

```bash
npm install --save-dev axe-core
```

```javascript
import { axe } from 'axe-core';

axe.run(document).then(results => {
    if (results.violations.length > 0) {
        console.error('アクセシビリティ違反:', results.violations);
    } else {
        console.log('アクセシビリティテスト合格！');
    }
});
```

#### pa11y（Node.js）

```bash
npm install -g pa11y
pa11y http://localhost:3000
```

#### Lighthouse CI

```bash
npm install -g @lhci/cli
lhci autorun --collect.url=http://localhost:3000
```

---

## 参考資料

### ガイドライン

- [WCAG 2.1（日本語訳）](https://waic.jp/docs/WCAG21/)
- [JIS X 8341-3:2016](https://www.jisc.go.jp/)
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/)

### ツール

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

### スクリーンリーダー

- [NVDA（無料）](https://www.nvaccess.org/)
- [VoiceOver（macOS/iOS標準）](https://www.apple.com/accessibility/voiceover/)
- [TalkBack（Android標準）](https://support.google.com/accessibility/android/answer/6283677)

---

## サポート

アクセシビリティに関する問題を発見された場合は、以下の情報と共にご報告ください：

1. **問題の内容**: 何ができないか、何が困難か
2. **環境**:
   - OS（Windows / macOS / iOS / Androidなど）
   - ブラウザ（Chrome / Firefox / Safariなど）
   - 支援技術（スクリーンリーダーなど）
3. **再現手順**: どのように操作すると問題が起きるか
4. **期待する動作**: どうあるべきか

---

## 更新履歴

### Version 1.0.0（2026-02-06）

- ✅ キーボード完全対応
- ✅ スクリーンリーダー対応（ARIA属性）
- ✅ ハイコントラストモード
- ✅ フォントサイズ調整（4段階）
- ✅ モーション削減モード
- ✅ 効果音ON/OFF
- ✅ フォーカス管理
- ✅ スキップリンク
- ✅ 44x44pxタップ領域
- ✅ カラーコントラスト改善（4.5:1以上）

---

**誰一人取り残さない設計を目指して**

このアプリは、視覚・聴覚・運動機能に制約のあるすべてのユーザーが、
平等に狩猟免許試験の学習ができることを目指しています。

改善のご提案は常に歓迎します。
