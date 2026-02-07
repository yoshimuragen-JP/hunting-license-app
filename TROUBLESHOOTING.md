# 🔧 トラブルシューティングガイド

**問題が発生した場合の解決方法をまとめています。**

---

## 📋 目次

1. [起動・接続の問題](#1-起動接続の問題)
2. [データ読み込みの問題](#2-データ読み込みの問題)
3. [学習データの問題](#3-学習データの問題)
4. [パフォーマンスの問題](#4-パフォーマンスの問題)
5. [PWA・オフラインの問題](#5-pwaオフラインの問題)
6. [ブラウザ互換性の問題](#6-ブラウザ互換性の問題)

---

## 1. 起動・接続の問題

### ❌ 問題: `./start.sh` を実行しても起動しない

**症状**: スクリプト実行後、何も起こらない

**原因と解決策**:

#### 原因1: 実行権限がない
```bash
# 確認
ls -l start.sh

# 解決
chmod +x start.sh
./start.sh
```

#### 原因2: Python3がインストールされていない
```bash
# 確認
python3 --version

# 解決（macOS）
xcode-select --install
```

#### 原因3: ポートが既に使用されている
```bash
# 別のポートで起動
./start.sh 3000
```

### ❌ 問題: ブラウザで開いても真っ白

**症状**: http://localhost:8000 を開いても何も表示されない

**解決策**:

1. **サーバーが起動しているか確認**
   ```bash
   lsof -i :8000
   ```
   何も表示されない場合は、サーバーが起動していません。

2. **正しいURLか確認**
   - ✅ `http://localhost:8000`
   - ❌ `https://localhost:8000` （httpsではない）
   - ❌ `localhost:8000` （http://がない）

3. **ブラウザのコンソールでエラーを確認**
   - F12キーを押す
   - Consoleタブを開く
   - 赤いエラーメッセージを確認

---

## 2. データ読み込みの問題

### ❌ 問題: 「データの読み込みに失敗しました」と表示される

**症状**: アプリを開くとエラーメッセージが表示される

**原因と解決策**:

#### 原因1: データファイルが存在しない
```bash
# 確認
ls ~/projects/surprise/2026-02-06/*.json

# 以下のファイルが必要:
# - hunting-license-data.json
# - quiz-database.json
# - extended-quiz-database.json
# - study-tips.json
# - motivational-messages.json
```

#### 原因2: JSONファイルの構文エラー
```bash
# 確認
python3 -c "import json; json.load(open('hunting-license-data.json'))"

# エラーが出たら、ファイルを修正
```

#### 原因3: パスが間違っている
サーバーは `app/` ディレクトリで起動していますか？

```bash
# 正しい起動方法
cd ~/projects/surprise/2026-02-06
./start.sh
```

---

## 3. 学習データの問題

### ❌ 問題: 学習データが消えた

**症状**: 以前の学習記録がなくなっている

**原因**:
- ブラウザのキャッシュ・Cookieを削除した
- 別のブラウザで開いた
- プライベートブラウズモードで使用している

**解決策**:

#### 対策1: 定期的にデータをバックアップ（学習ノート）
1. 「学習ノート」→「バックアップ」タブ
2. 「エクスポート」をクリック
3. JSONファイルをダウンロード

#### 対策2: 同じブラウザを使い続ける
LocalStorageはブラウザごとに独立しています。

#### 対策3: プライベートモードを避ける
プライベートモードでは、データが保存されません。

### ❌ 問題: 間違えた問題が「復習リスト」に追加されない

**症状**: 間違えた問題を復習したいが、リストに表示されない

**解決策**:

1. **LocalStorageの容量を確認**
   - ブラウザのコンソールで:
   ```javascript
   console.log(JSON.stringify(localStorage).length);
   ```
   - 5MB以上なら、古いデータを削除

2. **ブラウザのLocalStorageを有効にする**
   - 設定 → プライバシーとセキュリティ
   - 「Cookieとサイトデータ」を許可

---

## 4. パフォーマンスの問題

### ❌ 問題: アプリが遅い

**症状**: ページ遷移や操作が遅い

**解決策**:

#### 解決策1: ブラウザのキャッシュをクリア
```
Chrome: ⌘ + Shift + Delete
Safari: ⌘ + Option + E
```

#### 解決策2: 不要なタブを閉じる
ブラウザのメモリを確保します。

#### 解決策3: Service Workerを再登録
1. ブラウザのコンソールで:
   ```javascript
   navigator.serviceWorker.getRegistrations().then(function(registrations) {
     for(let registration of registrations) {
       registration.unregister();
     }
   });
   ```
2. ページをリロード

### ❌ 問題: 画像が表示されない

**症状**: アイコンや画像が壊れている

**解決策**:

1. **画像ファイルの存在を確認**
   ```bash
   ls ~/projects/surprise/2026-02-06/app/icons/*.png
   ```

2. **Service Workerのキャッシュをクリア**
   上記の「Service Workerを再登録」を実行

---

## 5. PWA・オフラインの問題

### ❌ 問題: PWAとしてインストールできない

**症状**: 「ホーム画面に追加」が表示されない

**原因と解決策**:

#### 原因1: HTTPSではない（ローカル以外）
ローカルホスト以外では、HTTPSが必要です。

#### 原因2: manifest.jsonが読み込めない
```bash
# 確認
curl http://localhost:8000/manifest.json
```

#### 原因3: Service Workerが登録されていない
ブラウザのコンソールで:
```javascript
navigator.serviceWorker.getRegistrations().then(r => console.log(r));
```

### ❌ 問題: オフラインで動作しない

**症状**: ネット接続がないと、アプリが開けない

**解決策**:

1. **初回はオンラインで開く**
   Service Workerがインストールされるまで、オンライン接続が必要です。

2. **Service Workerがインストールされているか確認**
   ブラウザのコンソールで:
   ```javascript
   navigator.serviceWorker.ready.then(() => console.log('OK'));
   ```

3. **キャッシュされているか確認**
   ```javascript
   caches.keys().then(keys => console.log(keys));
   ```

---

## 6. ブラウザ互換性の問題

### ❌ 問題: 古いブラウザで動作しない

**症状**: 一部の機能が動かない

**解決策**:

#### 推奨ブラウザ
| ブラウザ | 最小バージョン |
|---------|---------------|
| Chrome | 90以上 |
| Safari | 14以上 |
| Edge | 90以上 |
| Firefox | 88以上 |

#### ブラウザのバージョン確認
```
Chrome: chrome://version
Safari: Safariについて
```

### ❌ 問題: Safariで音が出ない

**症状**: 効果音が再生されない

**原因**: Safariは自動再生を制限しています。

**解決策**:
1. ユーザー操作（タップ・クリック）後に音を再生
2. 設定 → Safari → 自動再生を「すべてのウェブサイトで許可」

---

## 🆘 それでも解決しない場合

### デバッグ情報の収集

以下の情報を確認してください：

1. **ブラウザ情報**
   ```javascript
   console.log(navigator.userAgent);
   ```

2. **エラーメッセージ**
   - ブラウザのコンソール（F12）
   - 赤いエラーを全てコピー

3. **環境情報**
   - OS
   - ブラウザとバージョン
   - どの操作で発生したか

### 問い合わせ方法

GitHub Issuesに報告してください:
https://github.com/your-repo/issues

---

**このガイドで解決できない場合は、お気軽にお問い合わせください。** 🙏
