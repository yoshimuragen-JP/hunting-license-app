# PWA & モバイル最適化 完全ガイド

## 📱 実装完了した機能

### 1. PWA対応（Progressive Web App）

#### ✅ 実装済み

- **manifest.json**: アプリの情報、アイコン、テーマカラーを定義
- **service-worker.js**: オフライン対応、キャッシュ戦略、高速読み込み
- **インストールプロンプト**: ホーム画面への追加を促す
- **スタンドアロンモード**: ブラウザUIなしで起動

#### 機能詳細

**オフライン対応**:
- 一度訪問したページはオフラインでも表示可能
- 学習データはローカルに保存（IndexedDB）
- ネットワーク復帰時に自動同期

**高速読み込み**:
- Stale While Revalidate戦略（キャッシュを即座に返し、バックグラウンドで更新）
- 静的リソースの事前キャッシュ
- 2回目以降の訪問は瞬時に表示

**ホーム画面追加後の体験**:
- アプリとして起動（ブラウザUIなし）
- スプラッシュスクリーン表示
- タスクスイッチャーに独立したアイコン

---

### 2. モバイル最適化

#### ✅ 実装済み

**タッチ操作の最適化**:
- すべてのボタン・リンクを最低44x44pxに拡大
- タップ時の視覚的フィードバック（スケールダウン）
- ダブルタップズーム無効化（快適な操作）

**スワイプジェスチャー**:
- カードのスワイプ操作をサポート
- 左右スワイプで前後のページ移動
- 上下スワイプでモーダルの開閉

**フォントサイズの調整**:
- 入力欄は16px以上（iOSの自動ズーム防止）
- 本文は18px（読みやすさ優先）
- 見出しは相対的に大きく

**レスポンシブグリッド**:
- モバイル: 1カラム
- タブレット: 2カラム
- デスクトップ: 3カラム

**セーフエリア対応**:
- iPhone X以降のノッチ・ホームバーに対応
- 下部ナビゲーションがホームバーに隠れない

**下部固定ナビゲーション**:
- 親指で届きやすい下部に配置
- ホーム/クイズ/鳥獣/実技/進捗の5タブ
- アイコン + テキストで直感的

**モーダル・ダイアログ**:
- 下からスライドアップするデザイン
- ドラッグハンドルで閉じやすく
- 背景のぼかし効果

**画像の遅延読み込み**:
- Intersection Observerで自動検出
- 表示領域に入ったら読み込み
- プレースホルダーのシマーエフェクト

**ダークモード対応**:
- システム設定を自動検出
- 目に優しい色合い

**パフォーマンス最適化**:
- Core Web Vitals対策
- GPUアクセラレーション
- スムーズなスクロール

---

### 3. 補助機能（mobile-utils.js）

#### ✅ 実装済み

**スワイプジェスチャークラス**:
```javascript
new SwipeGesture(element, {
  threshold: 50,
  onSwipeLeft: () => console.log('左スワイプ'),
  onSwipeRight: () => console.log('右スワイプ')
});
```

**バイブレーション**:
```javascript
vibrate(50); // 50msの振動
vibrate([100, 50, 100]); // パターン振動
```

**ネットワーク監視**:
```javascript
new NetworkMonitor({
  onOnline: () => showSnackbar('オンラインに戻りました'),
  onOffline: () => showSnackbar('オフラインモード')
});
```

**バッテリー監視**:
```javascript
new BatteryMonitor({
  threshold: 0.2, // 20%以下で警告
  onLowBattery: (level) => showSnackbar(`バッテリー残量: ${level * 100}%`)
});
```

**デバイス情報取得**:
```javascript
const info = getDeviceInfo();
console.log(info.isMobile); // true/false
console.log(info.isIOS);    // true/false
console.log(info.isStandalone); // PWAとして起動中か
```

**パフォーマンス計測**:
```javascript
const monitor = new PerformanceMonitor();
monitor.measurePageLoad();
monitor.logMetrics(); // コンソールに表示
```

**プルトゥリフレッシュ**:
```javascript
new PullToRefresh({
  threshold: 80,
  onRefresh: () => location.reload()
});
```

---

## 🚀 使い方

### ユーザー向け（インストール方法）

#### iOS（Safari）

1. Safariでアプリを開く
2. 共有ボタン（□↑）をタップ
3. 「ホーム画面に追加」をタップ
4. アプリ名を確認して「追加」

#### Android（Chrome）

1. Chromeでアプリを開く
2. 画面上部に「インストール」バナーが表示
3. 「インストール」をタップ
4. または、右上メニュー → 「ホーム画面に追加」

#### デスクトップ（Chrome/Edge）

1. アドレスバーの右側にインストールアイコンが表示
2. クリックして「インストール」
3. または、右上メニュー → 「アプリをインストール」

---

### 開発者向け（テスト方法）

#### 1. ローカルサーバーで起動

```bash
# シンプルなHTTPサーバー（Python）
cd ~/projects/surprise/2026-02-06/app
python3 -m http.server 8000

# または、Node.js
npx http-server -p 8000

# ブラウザで開く
open http://localhost:8000
```

**重要**: Service Workerは `localhost` または HTTPS でのみ動作します。

#### 2. Chrome DevToolsでデバッグ

**PWA監査**:
1. F12 → Lighthouse
2. 「Progressive Web App」にチェック
3. 「Generate report」
4. スコアと改善点を確認

**manifest.json確認**:
1. F12 → Application → Manifest
2. アイコン、名前、テーマカラーを確認
3. エラーがあれば赤字で表示

**Service Worker確認**:
1. F12 → Application → Service Workers
2. 「Update on reload」にチェック（開発中）
3. 「Unregister」で削除（トラブル時）

**キャッシュ確認**:
1. F12 → Application → Cache Storage
2. キャッシュされたファイル一覧を確認
3. 右クリック → Delete でクリア

#### 3. 実機テスト（推奨）

**iOS**:
```bash
# ngrokで外部公開
npx ngrok http 8000

# 表示されたURLをiPhoneのSafariで開く
```

**Android**:
```bash
# Chrome DevToolsのリモートデバッグ
# USBケーブルで接続 → chrome://inspect → 「Discover USB devices」
```

---

## 🎯 パフォーマンス目標

### Core Web Vitals

| 指標 | 目標 | 現状 |
|------|------|------|
| **LCP** (Largest Contentful Paint) | < 2.5秒 | 実測待ち |
| **FID** (First Input Delay) | < 100ms | 実測待ち |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 実測待ち |

### その他の指標

| 指標 | 目標 | 現状 |
|------|------|------|
| **First Paint** | < 1秒 | 実測待ち |
| **DOM Content Loaded** | < 1.5秒 | 実測待ち |
| **Load Complete** | < 3秒 | 実測待ち |
| **PWA Score (Lighthouse)** | 90+ | 未測定 |

---

## 🔧 カスタマイズ

### テーマカラーの変更

`manifest.json` と HTMLの `<meta name="theme-color">` を編集:

```json
{
  "theme_color": "#2c3e50", // この色を変更
  "background_color": "#ffffff"
}
```

### アイコンの変更

1. 512x512pxのPNG画像を用意
2. ICONS_README.md の手順でリサイズ
3. `/icons/` ディレクトリに配置

### キャッシュ戦略の変更

`service-worker.js` の `CACHE_NAME` を変更すると、新しいキャッシュが作成されます:

```javascript
const CACHE_NAME = 'hunting-license-v2'; // バージョンアップ
```

---

## 🐛 トラブルシューティング

### Service Workerが更新されない

```javascript
// コンソールで実行
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});

// その後、ハードリロード (Cmd+Shift+R / Ctrl+Shift+R)
```

### インストールボタンが表示されない

- HTTPSまたはlocalhostで開いているか確認
- manifest.jsonのパスが正しいか確認
- すでにインストール済みでないか確認

### アイコンが表示されない

- アイコンファイルが存在するか確認
- manifest.jsonのpathが正しいか確認
- ブラウザキャッシュをクリア

### オフラインで動作しない

- Service Workerが登録されているか確認（DevTools → Application → Service Workers）
- キャッシュにファイルが保存されているか確認
- ネットワークタブで「Offline」をチェックしてテスト

---

## 📊 次のステップ

### 優先度: 高

1. **アイコン生成**: ICONS_README.md の手順で作成
2. **実機テスト**: iOS/Androidで動作確認
3. **Lighthouse監査**: PWAスコアを90+に

### 優先度: 中

4. **プッシュ通知**: 学習リマインダー（実装済みの下書きを有効化）
5. **バックグラウンド同期**: 学習データの自動バックアップ
6. **オフラインページ**: カスタムオフラインページ

### 優先度: 低

7. **ショートカット**: ホーム画面の長押しメニュー（実装済み）
8. **スクリーンショット**: App Storeのようなスクリーンショット
9. **シェア機能**: Web Share API

---

## 📚 参考リンク

- [PWA ドキュメント (MDN)](https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps)
- [Service Worker API](https://developer.mozilla.org/ja/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/ja/docs/Web/Manifest)
- [Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

## ✅ チェックリスト

### PWA基本要件

- [x] manifest.json 作成
- [x] Service Worker 登録
- [x] HTTPSまたはlocalhost
- [ ] アイコン生成（全サイズ）
- [x] オフライン対応
- [x] インストールプロンプト
- [x] モバイル最適化CSS
- [x] タッチ操作最適化
- [x] レスポンシブデザイン
- [x] パフォーマンス最適化

### テスト

- [ ] Lighthouse監査（PWAスコア90+）
- [ ] iOS Safariで動作確認
- [ ] Android Chromeで動作確認
- [ ] オフライン動作テスト
- [ ] インストール・アンインストール
- [ ] パフォーマンス計測

### ドキュメント

- [x] PWA_GUIDE.md（このファイル）
- [x] ICONS_README.md
- [x] mobile-utils.js（コメント充実）
- [ ] ユーザー向けインストールガイド

---

**🎉 これでPWA化とモバイル最適化は完了です！**

スマホで快適に学習できる環境が整いました。
次はアイコンを生成して、実機でテストしましょう。
