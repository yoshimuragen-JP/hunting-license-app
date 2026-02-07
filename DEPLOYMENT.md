# デプロイメントガイド

## 概要
狩猟免許試験 完全攻略アプリのデプロイ手順を説明します。

## ローカルでの実行

### 1. ファイル構成の確認
```
app/
├── index.html          # メインページ
├── design-system.css   # デザインシステム
├── app.js             # メインアプリケーション
├── animals.html       # 鳥獣図鑑
├── practical.html     # 実技ガイド
├── mock-exam.html     # 模擬試験
├── mock-exam.js       # 模擬試験ロジック
├── dashboard.html     # 進捗ダッシュボード
├── dashboard.js       # ダッシュボードロジック
├── game.html          # ゲームモード
├── game.js            # ゲームロジック
├── guide.html         # 学習ガイド
├── notes.html         # 学習ノート
├── notes.js           # ノート機能
├── manifest.json      # PWA設定
├── service-worker.js  # Service Worker
├── assets.html        # ビジュアル素材
├── sound.js           # 効果音
├── accessibility.js   # アクセシビリティ
└── [データファイル]
    ├── hunting-license-data.json
    ├── quiz-database.json
    └── extended-quiz-database.json
```

### 2. ローカルサーバーの起動
```bash
# Python 3の場合
cd ~/projects/surprise/2026-02-06/app
python3 -m http.server 8000

# または Node.jsの場合
npx http-server -p 8000
```

### 3. ブラウザでアクセス
```
http://localhost:8000
```

## PWA（Progressive Web App）としてのインストール

### デスクトップ（Chrome/Edge）
1. アプリをブラウザで開く
2. アドレスバーの右側の「インストール」アイコンをクリック
3. 「インストール」を確認

### モバイル（iOS Safari）
1. Safariでアプリを開く
2. 共有ボタン（□↑）をタップ
3. 「ホーム画面に追加」を選択
4. 「追加」を確認

### モバイル（Android Chrome）
1. Chromeでアプリを開く
2. メニュー（⋮）→「アプリをインストール」
3. 「インストール」を確認

## Webサーバーへのデプロイ

### Netlify（推奨）
```bash
# Netlify CLIをインストール
npm install -g netlify-cli

# デプロイ
cd ~/projects/surprise/2026-02-06/app
netlify deploy --prod
```

### Vercel
```bash
# Vercel CLIをインストール
npm install -g vercel

# デプロイ
cd ~/projects/surprise/2026-02-06/app
vercel --prod
```

### GitHub Pages
1. GitHubにリポジトリを作成
2. appフォルダの内容をpush
3. Settings → Pages → ソースを選択
4. デプロイ完了

### 従来のWebサーバー（Apache/Nginx）
1. appフォルダの内容をサーバーにアップロード
2. `.htaccess` または Nginx設定でSPAルーティングを設定
3. HTTPS設定（PWAには必須）

## HTTPS設定（重要）

PWA（Service Worker）を動作させるにはHTTPSが必須です。

### Let's Encryptの使用（無料）
```bash
# Certbot をインストール
sudo apt-get install certbot

# 証明書を取得
sudo certbot certonly --webroot -w /var/www/html -d example.com
```

## 環境変数・設定

このアプリは完全にクライアントサイドで動作し、環境変数は不要です。

## データの更新

### 問題データの追加
1. `quiz-database.json` を編集
2. 新しい問題を追加
3. 再デプロイ

### 鳥獣情報の更新
1. `hunting-license-data.json` を編集
2. `gameAnimals` セクションを更新
3. 再デプロイ

## パフォーマンス最適化

### 推奨設定
- Gzip圧縮を有効化
- ブラウザキャッシュを設定
- Service Workerで静的アセットをキャッシュ

### .htaccess 例（Apache）
```apache
# Gzip圧縮
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json
</IfModule>

# ブラウザキャッシュ
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 1 hour"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/json "access plus 1 day"
</IfModule>
```

## トラブルシューティング

### Service Workerが動かない
- HTTPSで配信されているか確認
- ブラウザのService Workerをリセット（Dev Tools → Application → Service Workers → Unregister）

### データが読み込めない
- JSONファイルのパスが正しいか確認
- CORSエラーが出ていないか確認（ローカルサーバー経由で開く）

### モバイルで表示が崩れる
- viewport設定を確認（`<meta name="viewport" content="width=device-width, initial-scale=1.0">`）
- レスポンシブCSSが適用されているか確認

## セキュリティ

### 推奨設定
- Content Security Policy (CSP) ヘッダーの設定
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff

### CSPヘッダー例
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
```

## バックアップ

### ユーザーデータのバックアップ
ユーザーの学習記録はLocalStorageに保存されています。
アプリ内の「エクスポート」機能で定期的にバックアップを取得することを推奨します。

## 更新履歴の管理

### バージョニング
- manifest.jsonの`version`を更新
- 変更内容をCHANGELOG.mdに記録
- ユーザーに更新通知を表示

## サポート

### 問題が発生した場合
1. ブラウザのコンソール（F12）でエラーを確認
2. Service Workerをリセット
3. LocalStorageをクリア（設定から）
4. ブラウザのキャッシュをクリア

## ライセンス

MIT License

---

**制作**: Claude Sonnet 4.5
**バージョン**: 1.0.0
**最終更新**: 2026-02-06
