#!/bin/bash

# UI Polish自動適用スクリプト
# 全HTMLファイルに新しいCSSとJSを追加

echo "🎨 UI Polishを全HTMLファイルに適用中..."

# 対象HTMLファイル
FILES=(
  "index.html"
  "dashboard.html"
  "game.html"
  "guide.html"
  "animals.html"
  "notes.html"
  "mock-exam.html"
  "practical.html"
  "faq.html"
  "assets.html"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"

    # design-system.cssの直後にui-polish-additions.cssを追加（まだない場合）
    if ! grep -q "ui-polish-additions.css" "$file"; then
      # design-system.cssを含む行を探して、その直後に追加
      if grep -q "design-system.css" "$file"; then
        sed -i.bak '/<link.*design-system\.css/a\
    <link rel="stylesheet" href="ui-polish-additions.css">
' "$file"
        echo "  ✓ ui-polish-additions.css を追加"
      else
        # design-system.cssがない場合は<head>の最後に追加
        sed -i.bak '/<\/head>/i\
    <link rel="stylesheet" href="design-system.css">\
    <link rel="stylesheet" href="ui-polish-additions.css">
' "$file"
        echo "  ✓ design-system.css と ui-polish-additions.css を追加"
      fi
    else
      echo "  ⏭  ui-polish-additions.css は既に追加済み"
    fi

    # </body>の直前にui-polish.jsを追加（まだない場合）
    if ! grep -q "ui-polish.js" "$file"; then
      sed -i.bak '/<\/body>/i\
    <script src="ui-polish.js"><\/script>
' "$file"
      echo "  ✓ ui-polish.js を追加"
    else
      echo "  ⏭  ui-polish.js は既に追加済み"
    fi

    # バックアップファイルを削除
    rm -f "${file}.bak"

  else
    echo "⚠️  $file が見つかりません"
  fi
done

echo ""
echo "✅ UI Polish適用完了！"
echo ""
echo "📝 追加された内容:"
echo "  - ui-polish-additions.css (トースト、ツールチップ、アニメーション等)"
echo "  - ui-polish.js (インタラクション強化、マイクロインタラクション)"
echo ""
echo "🔍 動作確認:"
echo "  1. ブラウザで各ページを開く"
echo "  2. コンソールで 'toast.success(\"テスト\")' を実行"
echo "  3. ボタンやカードのホバー・クリック動作を確認"
