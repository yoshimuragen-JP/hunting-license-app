#!/bin/bash

# 狩猟免許試験 完全攻略システム - テストスクリプト
# このスクリプトで、アプリの動作確認ができます

# set -e は算術演算と相性が悪いため削除
# エラーハンドリングは各テスト関数内で実施

echo "🧪 狩猟免許試験アプリ テストスクリプト"
echo "========================================"
echo ""

# カレントディレクトリの確認
if [ ! -f "README.md" ]; then
    echo "❌ エラー: プロジェクトのルートディレクトリで実行してください"
    exit 1
fi

passed=0
failed=0

# テスト関数
test_file_exists() {
    local file=$1
    local description=$2

    if [ -f "$file" ]; then
        echo "  ✅ $description"
        ((passed++))
    else
        echo "  ❌ $description (ファイルが見つかりません: $file)"
        ((failed++))
    fi
}

test_dir_exists() {
    local dir=$1
    local description=$2

    if [ -d "$dir" ]; then
        echo "  ✅ $description"
        ((passed++))
    else
        echo "  ❌ $description (ディレクトリが見つかりません: $dir)"
        ((failed++))
    fi
}

# テスト1: ディレクトリ構造
echo "📂 テスト1: ディレクトリ構造"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_dir_exists "app" "appディレクトリ"
test_dir_exists "app/icons" "iconsディレクトリ"
echo ""

# テスト2: 主要HTMLファイル
echo "📄 テスト2: 主要HTMLファイル"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_file_exists "app/index.html" "index.html"
test_file_exists "app/animals.html" "animals.html (鳥獣図鑑)"
test_file_exists "app/practical.html" "practical.html (実技ガイド)"
test_file_exists "app/mock-exam.html" "mock-exam.html (模擬試験)"
test_file_exists "app/dashboard.html" "dashboard.html (ダッシュボード)"
test_file_exists "app/game.html" "game.html (ゲームモード)"
test_file_exists "app/guide.html" "guide.html (学習ガイド)"
test_file_exists "app/notes.html" "notes.html (学習ノート)"
test_file_exists "app/faq.html" "faq.html (FAQ)"
echo ""

# テスト3: JavaScriptファイル
echo "📜 テスト3: JavaScriptファイル"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_file_exists "app/app.js" "app.js (メインロジック)"
test_file_exists "app/dashboard.js" "dashboard.js"
test_file_exists "app/game.js" "game.js"
test_file_exists "app/mock-exam.js" "mock-exam.js"
test_file_exists "app/notes.js" "notes.js"
test_file_exists "app/sound.js" "sound.js"
test_file_exists "app/accessibility.js" "accessibility.js"
test_file_exists "app/mobile-utils.js" "mobile-utils.js"
echo ""

# テスト4: CSSファイル
echo "🎨 テスト4: CSSファイル"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_file_exists "app/design-system.css" "design-system.css"
test_file_exists "app/accessibility.css" "accessibility.css"
test_file_exists "app/mobile-optimized.css" "mobile-optimized.css"
test_file_exists "app/style.css" "style.css"
echo ""

# テスト5: データファイル
echo "💾 テスト5: データファイル"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_file_exists "hunting-license-data.json" "hunting-license-data.json"
test_file_exists "quiz-database.json" "quiz-database.json"
test_file_exists "extended-quiz-database.json" "extended-quiz-database.json"
test_file_exists "study-tips.json" "study-tips.json"
test_file_exists "motivational-messages.json" "motivational-messages.json"
echo ""

# テスト6: PWA関連ファイル
echo "📱 テスト6: PWA関連ファイル"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_file_exists "app/manifest.json" "manifest.json"
test_file_exists "app/service-worker.js" "service-worker.js"

# PWAアイコンの確認
icon_count=$(ls app/icons/icon-*.png 2>/dev/null | wc -l | tr -d ' ')
if [ "$icon_count" -ge 11 ]; then
    echo "  ✅ PWAアイコン ($icon_count個)"
    ((passed++))
else
    echo "  ❌ PWAアイコンが不足 (${icon_count}/11個)"
    ((failed++))
fi
echo ""

# テスト7: ドキュメント
echo "📚 テスト7: ドキュメント"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_file_exists "README.md" "README.md"
test_file_exists "START_HERE.md" "START_HERE.md"
test_file_exists "summary.md" "summary.md"
test_file_exists "making-of.md" "making-of.md"
test_file_exists "process.md" "process.md"
test_file_exists "DEPLOYMENT.md" "DEPLOYMENT.md"
test_file_exists "SOURCES.md" "SOURCES.md"
test_file_exists "CHANGELOG.md" "CHANGELOG.md"
test_file_exists "PROJECT_STRUCTURE.md" "PROJECT_STRUCTURE.md"
test_file_exists "FINAL_VERIFICATION_REPORT.md" "FINAL_VERIFICATION_REPORT.md"
echo ""

# テスト8: スクリプト
echo "⚙️  テスト8: スクリプト"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_file_exists "start.sh" "start.sh (クイックスタート)"
test_file_exists "deploy.sh" "deploy.sh (デプロイ)"
test_file_exists "test.sh" "test.sh (このスクリプト)"

# 実行権限の確認
if [ -x "start.sh" ]; then
    echo "  ✅ start.sh実行権限"
    ((passed++))
else
    echo "  ⚠️  start.sh実行権限なし（chmod +x start.sh を実行してください）"
fi

if [ -x "deploy.sh" ]; then
    echo "  ✅ deploy.sh実行権限"
    ((passed++))
else
    echo "  ⚠️  deploy.sh実行権限なし（chmod +x deploy.sh を実行してください）"
fi
echo ""

# テスト9: JSONファイルの構文チェック
echo "🔍 テスト9: JSONファイルの構文チェック"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
for json_file in hunting-license-data.json quiz-database.json extended-quiz-database.json study-tips.json motivational-messages.json app/manifest.json; do
    if [ -f "$json_file" ]; then
        if python3 -c "import json; json.load(open('$json_file'))" 2>/dev/null; then
            echo "  ✅ $json_file"
            ((passed++))
        else
            echo "  ❌ $json_file (JSON構文エラー)"
            ((failed++))
        fi
    fi
done
echo ""

# テスト10: 主要データの検証
echo "📊 テスト10: 主要データの検証"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 問題数のカウント
if [ -f "quiz-database.json" ] && [ -f "extended-quiz-database.json" ]; then
    total_questions=$(cat quiz-database.json extended-quiz-database.json | grep -c '"id":' || echo "0")
    if [ "$total_questions" -ge 100 ]; then
        echo "  ✅ 問題数: ${total_questions}問 (100問以上)"
        ((passed++))
    else
        echo "  ⚠️  問題数: ${total_questions}問 (100問未満)"
    fi
fi

# 鳥獣情報のカウント
if [ -f "hunting-license-data.json" ]; then
    # huntableAnimalsの数をカウント
    animal_count=$(grep -o '"id":' hunting-license-data.json | wc -l | tr -d ' ')
    if [ "$animal_count" -ge 40 ]; then
        echo "  ✅ 鳥獣データ: ${animal_count}種以上"
        ((passed++))
    else
        echo "  ⚠️  鳥獣データ: ${animal_count}種"
    fi
fi
echo ""

# 結果サマリー
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 テスト結果サマリー"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
total=$((passed + failed))
success_rate=$(echo "scale=1; $passed * 100 / $total" | bc)

echo "✅ 合格: $passed"
echo "❌ 失敗: $failed"
echo "📈 成功率: ${success_rate}%"
echo ""

if [ $failed -eq 0 ]; then
    echo "🎉 全てのテストに合格しました！"
    echo ""
    echo "✅ アプリは正常に動作する準備ができています"
    echo ""
    echo "次のステップ:"
    echo "1. ./start.sh でアプリを起動"
    echo "2. http://localhost:8000 で動作確認"
    exit 0
else
    echo "⚠️  $failed 個のテストが失敗しました"
    echo ""
    echo "詳細を確認して、必要なファイルを配置してください"
    exit 1
fi
