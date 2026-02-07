#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
狩猟免許クイズデータベースに問題を追加するスクリプト
"""

import json

# 追加する問題データ
new_questions = [
    # 猟具問題 (gun_011 - gun_040)
    {
        "id": "gun_011",
        "category": "猟具",
        "difficulty": "中",
        "question": "散弾銃の銃身の長さの制限は？",
        "choices": ["制限なし", "46cm以上", "60cm以上"],
        "answer": 1,
        "explanation": "散弾銃の銃身の長さは46cm以上でなければなりません。これは銃刀法で定められています。",
        "tags": ["散弾銃", "規制"]
    },
    {
        "id": "gun_012",
        "category": "猟具",
        "difficulty": "難",
        "question": "ライフル銃の全長の制限は？",
        "choices": ["75cm以上", "80cm以上", "95cm以上"],
        "answer": 2,
        "explanation": "ライフル銃の全長は95cm以上でなければなりません。銃身の長さは35cm以上です。",
        "tags": ["ライフル銃", "規制"],
        "trap": True
    },
    {
        "id": "gun_013",
        "category": "猟具",
        "difficulty": "中",
        "question": "銃の整備で最初にすべきことは？",
        "choices": ["薬品を準備する", "脱包を確認する", "分解する"],
        "answer": 1,
        "explanation": "銃の整備を始める前に、必ず脱包（弾が入っていないこと）を確認します。これは安全の基本です。",
        "tags": ["整備", "安全"]
    },
    {
        "id": "gun_014",
        "category": "猟具",
        "difficulty": "難",
        "question": "散弾銃の装填数の制限は？",
        "choices": ["制限なし", "2発まで", "法定猟法では2発まで"],
        "answer": 2,
        "explanation": "狩猟で使用する散弾銃は、実包を2発までしか装填できないように制限する必要があります。3発以上装填できる銃は違法です。",
        "tags": ["散弾銃", "規制"],
        "trap": True
    },
    {
        "id": "gun_015",
        "category": "猟具",
        "difficulty": "中",
        "question": "くくりわなのよりもどしの目的は？",
        "choices": ["装飾のため", "ワイヤーのねじれを防ぐため", "動物を逃がすため"],
        "answer": 1,
        "explanation": "よりもどしは、捕獲された動物が暴れた際にワイヤーがねじれて切れるのを防ぐ装置です。",
        "tags": ["わな", "構造"]
    },
    {
        "id": "gun_016",
        "category": "猟具",
        "difficulty": "難",
        "question": "くくりわなのワイヤーストッパーの目的は？",
        "choices": ["輪が締まりすぎないようにする", "動物を逃がすため", "ワイヤーを固定する"],
        "answer": 0,
        "explanation": "ワイヤーストッパーは、輪が一定以上締まらないようにして動物を保護し、誤捕獲時の放獣を容易にする装置です。",
        "tags": ["わな", "構造"],
        "trap": True
    },
    {
        "id": "gun_017",
        "category": "猟具",
        "difficulty": "中",
        "question": "箱わなの扉の開閉機構で一般的なものは？",
        "choices": ["リモコン式", "踏み板式", "タイマー式"],
        "answer": 1,
        "explanation": "箱わなは、動物が中の踏み板を踏むと扉が閉まる機構が一般的です。",
        "tags": ["わな", "構造"]
    },
    {
        "id": "gun_018",
        "category": "猟具",
        "difficulty": "難",
        "question": "とらばさみの使用は認められていますか？",
        "choices": ["認められている", "禁止されている", "イノシシのみ可能"],
        "answer": 1,
        "explanation": "とらばさみ（トラップ）は、動物に激しい苦痛を与えるため、法律で使用が禁止されています。",
        "tags": ["わな", "禁止"],
        "trap": True
    },
    {
        "id": "gun_019",
        "category": "猟具",
        "difficulty": "中",
        "question": "散弾の種類で、鉛弾の代わりに使用されるものは？",
        "choices": ["鉄製散弾", "プラスチック散弾", "木製散弾"],
        "answer": 0,
        "explanation": "鉛散弾の代替として、鉄製散弾（スチールショット）やビスマス散弾が使用されます。環境保護のためです。",
        "tags": ["散弾", "環境"]
    },
    {
        "id": "gun_020",
        "category": "猟具",
        "difficulty": "難",
        "question": "ライフル銃のスコープの倍率で一般的なものは？",
        "choices": ["1-3倍", "3-9倍", "10-20倍"],
        "answer": 1,
        "explanation": "狩猟用ライフル銃のスコープは、3-9倍の可変倍率が一般的です。近距離から遠距離まで対応できます。",
        "tags": ["ライフル銃", "照準器"]
    }
]

# JSONファイルを読み込み
with open('quiz-database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 既存のIDをチェック
existing_ids = {q['id'] for q in data['quizzes']}

# 重複しない問題のみ追加
added_count = 0
for question in new_questions:
    if question['id'] not in existing_ids:
        data['quizzes'].append(question)
        added_count += 1
        print(f"✓ 追加: {question['id']} - {question['question']}")
    else:
        print(f"⚠ スキップ（既存）: {question['id']}")

# ファイルに書き戻し
with open('quiz-database.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\n合計 {added_count} 問を追加しました。")
print(f"総問題数: {len(data['quizzes'])} 問")
