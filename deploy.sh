#!/bin/bash

# 狩猟免許試験 完全攻略システム - デプロイスクリプト
# このスクリプトは、アプリを様々なプラットフォームにデプロイします

set -e  # エラーが発生したら即座に終了

echo "🚀 狩猟免許試験アプリ デプロイスクリプト"
echo "========================================"

# カレントディレクトリの確認
if [ ! -f "README.md" ]; then
    echo "❌ エラー: プロジェクトのルートディレクトリで実行してください"
    exit 1
fi

# デプロイ先の選択
echo ""
echo "デプロイ先を選択してください:"
echo "1) Netlify"
echo "2) Vercel"
echo "3) GitHub Pages"
echo "4) ローカルテスト（http.server）"
echo "5) キャンセル"
echo ""
read -p "選択 (1-5): " choice

case $choice in
    1)
        echo ""
        echo "📡 Netlifyへデプロイ"
        echo "===================="

        # Netlify CLIのチェック
        if ! command -v netlify &> /dev/null; then
            echo "Netlify CLIがインストールされていません。"
            echo "インストールしますか? (y/n)"
            read -p "> " install_netlify
            if [ "$install_netlify" = "y" ]; then
                npm install -g netlify-cli
            else
                echo "キャンセルしました"
                exit 1
            fi
        fi

        echo ""
        echo "デプロイモードを選択:"
        echo "1) 本番環境 (--prod)"
        echo "2) プレビュー環境"
        read -p "選択 (1-2): " netlify_mode

        if [ "$netlify_mode" = "1" ]; then
            netlify deploy --prod --dir=app
        else
            netlify deploy --dir=app
        fi

        echo "✅ Netlifyへのデプロイが完了しました"
        ;;

    2)
        echo ""
        echo "📡 Vercelへデプロイ"
        echo "=================="

        # Vercel CLIのチェック
        if ! command -v vercel &> /dev/null; then
            echo "Vercel CLIがインストールされていません。"
            echo "インストールしますか? (y/n)"
            read -p "> " install_vercel
            if [ "$install_vercel" = "y" ]; then
                npm install -g vercel
            else
                echo "キャンセルしました"
                exit 1
            fi
        fi

        # vercel.json作成（存在しない場合）
        if [ ! -f "vercel.json" ]; then
            echo "vercel.jsonを作成中..."
            cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "app/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/app/$1"
    }
  ]
}
EOF
            echo "✅ vercel.jsonを作成しました"
        fi

        echo ""
        echo "デプロイモードを選択:"
        echo "1) 本番環境 (--prod)"
        echo "2) プレビュー環境"
        read -p "選択 (1-2): " vercel_mode

        if [ "$vercel_mode" = "1" ]; then
            vercel --prod
        else
            vercel
        fi

        echo "✅ Vercelへのデプロイが完了しました"
        ;;

    3)
        echo ""
        echo "📡 GitHub Pagesへデプロイ"
        echo "========================"

        # Gitリポジトリの確認
        if [ ! -d ".git" ]; then
            echo "Gitリポジトリが初期化されていません。"
            echo "初期化しますか? (y/n)"
            read -p "> " init_git
            if [ "$init_git" = "y" ]; then
                git init
                git add .
                git commit -m "Initial commit"
                echo ""
                echo "GitHubリポジトリのURLを入力してください:"
                echo "（例: https://github.com/username/repo.git）"
                read -p "> " github_url
                git remote add origin "$github_url"
                git branch -M main
                git push -u origin main
            else
                echo "キャンセルしました"
                exit 1
            fi
        fi

        echo ""
        echo "gh-pagesブランチを作成してデプロイします..."

        # appフォルダの内容をgh-pagesブランチにコピー
        git checkout -b gh-pages || git checkout gh-pages

        # ルートディレクトリにappフォルダの内容をコピー
        rsync -av --delete app/ ./ --exclude='.git'

        git add .
        git commit -m "Deploy to GitHub Pages"
        git push origin gh-pages --force

        git checkout main

        echo "✅ GitHub Pagesへのデプロイが完了しました"
        echo "📝 GitHub設定でgh-pagesブランチを公開するように設定してください"
        ;;

    4)
        echo ""
        echo "🖥️  ローカルテストサーバー起動"
        echo "=============================="

        cd app

        echo ""
        echo "ポート番号を入力してください（デフォルト: 8000）:"
        read -p "> " port
        port=${port:-8000}

        echo ""
        echo "✅ サーバーを起動しました"
        echo "📝 ブラウザで http://localhost:${port} を開いてください"
        echo "⚠️  停止するには Ctrl+C を押してください"
        echo ""

        python3 -m http.server $port
        ;;

    5)
        echo "キャンセルしました"
        exit 0
        ;;

    *)
        echo "❌ 無効な選択です"
        exit 1
        ;;
esac

echo ""
echo "✅ デプロイ完了！"
