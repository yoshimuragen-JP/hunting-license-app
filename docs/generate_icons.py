#!/usr/bin/env python3
"""
PWAアイコン生成スクリプト
シンプルな🎯絵文字風のアイコンを各サイズで生成
"""

from PIL import Image, ImageDraw, ImageFont
import os

# 生成するサイズ
SIZES = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512]

# 色設定
BG_COLOR = (45, 122, 79)  # 森の緑 #2d7a4f
CIRCLE_COLOR = (255, 255, 255)  # 白
ACCENT_COLOR = (234, 88, 12)  # オレンジ #ea580c

def create_icon(size):
    """指定サイズのアイコンを生成"""
    # 画像作成
    img = Image.new('RGB', (size, size), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # マージン
    margin = size * 0.1

    # 外円（白）
    outer_circle_bbox = [margin, margin, size - margin, size - margin]
    draw.ellipse(outer_circle_bbox, fill=CIRCLE_COLOR)

    # 内円（緑）
    inner_margin = size * 0.2
    inner_circle_bbox = [inner_margin, inner_margin, size - inner_margin, size - inner_margin]
    draw.ellipse(inner_circle_bbox, fill=BG_COLOR)

    # 中心の点（オレンジ）
    center = size / 2
    dot_radius = size * 0.08
    dot_bbox = [
        center - dot_radius,
        center - dot_radius,
        center + dot_radius,
        center + dot_radius
    ]
    draw.ellipse(dot_bbox, fill=ACCENT_COLOR)

    # 照準線を描画（シンプルな十字）
    line_width = max(2, int(size * 0.02))
    line_length = size * 0.15

    # 横線
    draw.rectangle([
        center - line_length,
        center - line_width / 2,
        center + line_length,
        center + line_width / 2
    ], fill=CIRCLE_COLOR)

    # 縦線
    draw.rectangle([
        center - line_width / 2,
        center - line_length,
        center + line_width / 2,
        center + line_length
    ], fill=CIRCLE_COLOR)

    return img

def main():
    # iconsディレクトリの確認
    icons_dir = os.path.dirname(os.path.abspath(__file__)) + '/icons'

    if not os.path.exists(icons_dir):
        os.makedirs(icons_dir)

    print("🎨 PWAアイコンを生成中...")

    for size in SIZES:
        icon = create_icon(size)
        filename = f'{icons_dir}/icon-{size}x{size}.png'
        icon.save(filename, 'PNG')
        print(f"✅ {filename} を生成しました")

    print("\n🎉 全てのアイコンの生成が完了しました！")
    print(f"📁 保存場所: {icons_dir}")

if __name__ == '__main__':
    main()
