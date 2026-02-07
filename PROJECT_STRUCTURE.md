# プロジェクト構造

## 📂 ディレクトリ構成

```
~/projects/surprise/2026-02-06/
├── README.md                           # プロジェクト概要・使い方
├── CHANGELOG.md                        # 変更履歴
├── DEPLOYMENT.md                       # デプロイ方法
├── SOURCES.md                          # 情報源・参考資料
├── PROJECT_STRUCTURE.md                # このファイル
├── plan.md                             # 企画書
├── research.md                         # リサーチ結果
├── timekeeper-log.md                   # 制作時間記録
├── summary-template.md                 # サマリーテンプレート
│
├── hunting-license-data.json           # 狩猟免許試験データ
├── quiz-database.json                  # 問題データベース（基礎）
├── extended-quiz-database.json         # 問題データベース（拡張）
├── study-tips.json                     # 学習ティップス
├── motivational-messages.json          # モチベーションメッセージ
│
└── app/                                # Webアプリケーション本体
    ├── index.html                      # メインページ
    ├── animals.html                    # 鳥獣図鑑
    ├── practical.html                  # 実技ガイド
    ├── mock-exam.html                  # 模擬試験
    ├── dashboard.html                  # 進捗ダッシュボード
    ├── game.html                       # ゲームモード
    ├── guide.html                      # 学習ガイド
    ├── notes.html                      # 学習ノート
    ├── faq.html                        # よくある質問
    │
    ├── design-system.css               # デザインシステム
    ├── mobile-optimized.css            # モバイル最適化CSS
    ├── accessibility.css               # アクセシビリティCSS
    ├── style.css                       # 追加スタイル
    │
    ├── app.js                          # メインアプリケーション
    ├── mock-exam.js                    # 模擬試験ロジック
    ├── dashboard.js                    # ダッシュボードロジック
    ├── game.js                         # ゲームロジック
    ├── notes.js                        # ノート機能
    ├── sound.js                        # 効果音システム
    ├── accessibility.js                # アクセシビリティ機能
    ├── mobile-utils.js                 # モバイルユーティリティ
    │
    ├── manifest.json                   # PWAマニフェスト
    ├── service-worker.js               # Service Worker
    │
    ├── quiz-database.json              # 問題データ（アプリ用）
    │
    ├── assets.html                     # ビジュアル素材集
    ├── sound-demo.html                 # サウンドデモ
    ├── mobile-demo.html                # モバイルデモ
    │
    ├── components/                     # 共通コンポーネント
    │   ├── navigation.html             # ナビゲーション
    │   └── footer.html                 # フッター
    │
    ├── icons/                          # アイコン素材
    │   ├── icon-source.svg             # アイコンソース
    │   └── icon-creation-note.txt      # アイコン作成メモ
    │
    └── [ドキュメント]
        ├── ICONS_README.md             # アイコンガイド
        ├── PWA_GUIDE.md                # PWAガイド
        ├── SOUND_SYSTEM_README.md      # サウンドシステムガイド
        ├── SOUND_INTEGRATION_GUIDE.md  # サウンド統合ガイド
        ├── accessibility.md            # アクセシビリティガイド
        └── MOBILE_IMPLEMENTATION_REPORT.md  # モバイル実装レポート
```

## 📄 主要ファイルの説明

### ルートディレクトリ

| ファイル | 説明 | サイズ |
|---------|------|-------|
| README.md | プロジェクトの使い方、機能説明 | 8.2K |
| CHANGELOG.md | 変更履歴、バージョン情報 | - |
| DEPLOYMENT.md | デプロイ方法、サーバー設定 | 5.8K |
| SOURCES.md | 情報源、参考資料、免責事項 | 6.3K |
| plan.md | 企画書（Plannerエージェント作成） | 28K |
| research.md | リサーチ結果（Researcherエージェント作成） | 28K |

### データファイル

| ファイル | 説明 | 行数 | サイズ |
|---------|------|------|-------|
| hunting-license-data.json | 試験概要、鳥獣情報、実技ガイド | - | 21K |
| quiz-database.json | 基礎問題30問、模擬試験3回分 | - | 16K |
| extended-quiz-database.json | 拡張問題30問、フラッシュカード20枚 | - | 21K |
| study-tips.json | 学習ティップス、3週間プラン | - | 17K |
| motivational-messages.json | メッセージ、バッジ、豆知識 | - | - |

### アプリケーション（HTML）

| ファイル | 説明 | 機能 |
|---------|------|------|
| index.html | メインページ | ホーム画面、学習モード選択 |
| animals.html | 鳥獣図鑑 | 識別ガイド、フラッシュカード |
| practical.html | 実技ガイド | 銃の取り扱い、事故対策 |
| mock-exam.html | 模擬試験 | 30問90分、自動採点 |
| dashboard.html | 進捗管理 | 統計、グラフ、弱点分析 |
| game.html | ゲームモード | クイックマッチ、バッジ |
| guide.html | 学習ガイド | 3週間プラン、攻略法 |
| notes.html | 学習ノート | メモ、暗記カード |
| faq.html | FAQ | よくある質問50問以上 |

### スタイルシート（CSS）

| ファイル | 説明 | 機能 |
|---------|------|------|
| design-system.css | デザインシステム | カラー、タイポグラフィ、コンポーネント |
| mobile-optimized.css | モバイル最適化 | レスポンシブ、タッチ操作 |
| accessibility.css | アクセシビリティ | 高コントラスト、フォントサイズ |
| style.css | 追加スタイル | 個別ページのスタイル |

### JavaScript

| ファイル | 説明 | 機能 |
|---------|------|------|
| app.js | メインロジック | 問題演習、データ管理 |
| mock-exam.js | 模擬試験 | タイマー、採点、結果表示 |
| dashboard.js | ダッシュボード | グラフ、統計、分析 |
| game.js | ゲームモード | クイックマッチ、コンボ、バッジ |
| notes.js | ノート機能 | メモ、暗記カード、エクスポート |
| sound.js | 効果音 | Web Audio API、音量調整 |
| accessibility.js | アクセシビリティ | キーボード操作、ARIA |
| mobile-utils.js | モバイルユーティリティ | タッチ、スワイプ、振動 |

### PWA関連

| ファイル | 説明 | 機能 |
|---------|------|------|
| manifest.json | PWAマニフェスト | アプリ名、アイコン、テーマ |
| service-worker.js | Service Worker | オフライン対応、キャッシュ |

## 🎯 データフロー

```
ユーザー
  ↓
index.html（メインページ）
  ↓
各機能ページ（animals.html, practical.html, etc.）
  ↓
JavaScript（app.js, game.js, etc.）
  ↓
データファイル（hunting-license-data.json, quiz-database.json, etc.）
  ↓
LocalStorage（学習記録、進捗データ）
```

## 🔧 技術スタック

### フロントエンド
- **HTML5**: セマンティックHTML、ARIA
- **CSS3**: カスタムプロパティ、Grid、Flexbox
- **JavaScript**: ES6+（モジュール、async/await、クラス）

### ライブラリ
- **Chart.js**: グラフ表示（進捗ダッシュボード）

### Web API
- **LocalStorage**: データ保存
- **Service Worker**: オフライン対応
- **Web Audio API**: 効果音
- **Vibration API**: 触覚フィードバック（モバイル）

### PWA
- **Manifest**: アプリ化
- **Service Worker**: オフライン、キャッシュ
- **Add to Home Screen**: ホーム画面追加

## 📊 統計情報

### コード量
- **HTML**: 約15,000行
- **CSS**: 約5,000行
- **JavaScript**: 約10,000行
- **JSON**: 約3,000行
- **合計**: 約33,000行

### ファイル数
- **HTML**: 14ファイル
- **CSS**: 4ファイル
- **JavaScript**: 8ファイル
- **JSON**: 6ファイル
- **ドキュメント**: 11ファイル
- **その他**: 多数
- **合計**: 67ファイル以上

### データ量
- **問題数**: 100問以上
- **鳥獣情報**: 46種（狩猟鳥獣）+ 多数（非狩猟鳥獣）
- **学習ティップス**: 50個以上
- **FAQ**: 50問以上
- **モチベーションメッセージ**: 100個以上
- **バッジ**: 14種類

## 🚀 主な機能

1. **問題演習システム** - 100問以上、カテゴリ別・難易度別
2. **模擬試験** - 本番形式、自動採点、弱点分析
3. **鳥獣図鑑** - 46種の詳細情報、フラッシュカード
4. **実技ガイド** - 銃の取り扱い、事故対策
5. **進捗管理** - グラフ、統計、弱点分析
6. **ゲームモード** - クイックマッチ、バッジ、ランキング
7. **学習ノート** - メモ、暗記カード、エクスポート
8. **学習ガイド** - 3週間プラン、攻略法
9. **FAQ** - よくある質問50問以上
10. **PWA** - オフライン対応、ホーム画面追加

## 🎨 デザインシステム

### カラーパレット
- プライマリ: 森林グリーン系
- セカンダリ: アースカラー
- アクセント: オレンジ、イエロー
- カテゴリ別: 法令（青）、猟具（赤）、鳥獣（緑）、保護管理（オレンジ）、実技（紫）

### タイポグラフィ
- 見出し: ゴシック体
- 本文: 明朝体 / ゴシック体
- コード: 等幅フォント

### コンポーネント
- ボタン、カード、バッジ、プログレスバー、アラート、モーダル、ナビゲーション

## ♿ アクセシビリティ

- **ARIA属性**: role, aria-label, aria-describedby
- **キーボード操作**: Tab, Enter, Escape
- **スクリーンリーダー**: 対応
- **カラーコントラスト**: WCAG AA準拠
- **フォントサイズ**: 調整可能
- **音の代替**: 視覚的フィードバック

## 📱 モバイル対応

- **レスポンシブデザイン**: モバイル、タブレット、デスクトップ
- **タッチ操作**: 最適化
- **スワイプジェスチャー**: 対応
- **PWA**: ホーム画面追加、オフライン
- **パフォーマンス**: Core Web Vitals対応

## 🔒 セキュリティ

- **Content Security Policy**: 推奨設定あり
- **XSS対策**: 入力のサニタイズ
- **HTTPS**: PWAに必須

## 📦 デプロイ

- **ローカル**: python3 -m http.server
- **Netlify**: netlify deploy --prod
- **Vercel**: vercel --prod
- **GitHub Pages**: 対応
- **従来のWebサーバー**: Apache, Nginx

---

**制作**: Claude Sonnet 4.5
**最終更新**: 2026-02-06
