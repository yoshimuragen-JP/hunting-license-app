# PWAアイコン生成ガイド

## 必要なアイコンサイズ

以下のサイズのアイコンを `/icons/` ディレクトリに配置してください：

- `icon-16x16.png` (ファビコン)
- `icon-32x32.png` (ファビコン)
- `icon-72x72.png` (PWA)
- `icon-96x96.png` (PWA)
- `icon-128x128.png` (PWA)
- `icon-144x144.png` (PWA)
- `icon-152x152.png` (PWA)
- `icon-180x180.png` (Apple Touch Icon)
- `icon-192x192.png` (PWA)
- `icon-384x384.png` (PWA)
- `icon-512x512.png` (PWA)

## アイコンデザイン案

**シンボル**: 🦌（鹿）または 🎯（ターゲット）

**カラーテーマ**:
- プライマリ: `#2c3e50` (ダークブルーグレー)
- アクセント: `#27ae60` (グリーン)
- 背景: `#ffffff` (ホワイト)

## 自動生成方法（推奨）

### 方法1: ImageMagick を使用

```bash
# 元画像（512x512以上のPNG）から各サイズを生成
convert source.png -resize 16x16 icons/icon-16x16.png
convert source.png -resize 32x32 icons/icon-32x32.png
convert source.png -resize 72x72 icons/icon-72x72.png
convert source.png -resize 96x96 icons/icon-96x96.png
convert source.png -resize 128x128 icons/icon-128x128.png
convert source.png -resize 144x144 icons/icon-144x144.png
convert source.png -resize 152x152 icons/icon-152x152.png
convert source.png -resize 180x180 icons/icon-180x180.png
convert source.png -resize 192x192 icons/icon-192x192.png
convert source.png -resize 384x384 icons/icon-384x384.png
convert source.png -resize 512x512 icons/icon-512x512.png
```

### 方法2: オンラインツール

以下のサイトでアイコンを生成できます：

- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [Favicon.io](https://favicon.io/)

### 方法3: シンプルなプレースホルダー（開発用）

開発段階では、以下のようなシンプルなSVGから生成できます：

```svg
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#2c3e50"/>
  <text x="256" y="330" font-size="280" text-anchor="middle" fill="white">🦌</text>
</svg>
```

これをPNGに変換してリサイズします。

## アイコンガイドライン

1. **セーフゾーン**: アイコンの端から10%の余白を確保
2. **シンプルさ**: 小さいサイズでも認識しやすいデザイン
3. **マスカブル対応**: 中央80%に重要な要素を配置
4. **ダークモード対応**: 白背景と黒背景の両方でテスト

## 確認方法

1. **Chrome DevTools**:
   - F12 → Application → Manifest → Icons

2. **実機テスト**:
   - iOS Safari: ホーム画面に追加
   - Android Chrome: インストール

3. **Lighthouse**:
   - PWA監査でアイコンの問題をチェック

## トラブルシューティング

### アイコンが表示されない場合

1. ファイルパスを確認（`/icons/icon-192x192.png`）
2. Service Workerのキャッシュをクリア
3. ブラウザキャッシュをクリア
4. manifest.jsonのpathを確認

### サイズが大きすぎる場合

- PNG圧縮ツール（TinyPNG, ImageOptim）を使用
- 512x512は100KB以下が理想
