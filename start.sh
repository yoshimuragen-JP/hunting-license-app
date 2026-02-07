#!/bin/bash

# 狩猟免許試験 完全攻略システム - クイックスタートスクリプト
# このスクリプトで、1コマンドでアプリを起動できます

set -e

echo "🎯 狩猟免許試験 完全攻略システム"
echo "=================================="
echo ""

# プロジェクトのルートディレクトリに移動
cd "$(dirname "$0")"

# ポート番号の指定（デフォルト: 8000）
PORT=${1:-8000}

# ポートが使用中かチェック
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  ポート $PORT は既に使用されています"
    echo ""
    echo "別のポートで起動しますか？"
    echo "例: ./start.sh 3000"
    echo ""
    echo "または、既存のサーバーを停止しますか？ (y/n)"
    read -p "> " stop_server

    if [ "$stop_server" = "y" ]; then
        echo "サーバーを停止中..."
        kill $(lsof -ti:$PORT) 2>/dev/null
        sleep 1
    else
        exit 0
    fi
fi

# appディレクトリの確認
if [ ! -d "app" ]; then
    echo "❌ エラー: appディレクトリが見つかりません"
    exit 1
fi

# データファイルの確認
echo "📂 データファイルを確認中..."
for file in hunting-license-data.json quiz-database.json extended-quiz-database.json study-tips.json motivational-messages.json; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (見つかりません)"
    fi
done
echo ""

# ローカルサーバーを起動
echo "🚀 ローカルサーバーを起動しています..."
echo "📍 URL: http://localhost:$PORT"
echo ""
echo "✅ サーバーが起動しました！"
echo ""
echo "ブラウザで以下のURLを開いてください:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "    http://localhost:$PORT"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  停止するには Ctrl+C を押してください"
echo ""

# Python3があるか確認
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3がインストールされていません"
    exit 1
fi

# サーバーを起動
cd app
python3 -m http.server $PORT

# クリーンアップ（Ctrl+Cで停止された時）
echo ""
echo "👋 サーバーを停止しました"
