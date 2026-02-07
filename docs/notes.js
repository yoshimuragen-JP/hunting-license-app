'use strict';

/**
 * 学習ノート機能
 * - ノート作成・編集・削除
 * - 暗記カード管理
 * - 苦手リスト管理
 * - エクスポート/インポート
 */

// ========================================
// データ管理
// ========================================

class NotesManager {
    constructor() {
        this.STORAGE_KEYS = {
            notes: 'hunting_license_notes',
            flashcards: 'hunting_license_flashcards',
            weakProblems: 'hunting_license_weak_problems',
            conquered: 'hunting_license_conquered'
        };

        this.currentNoteId = null;
        this.currentFlashcardIndex = 0;
        this.isFlashcardFlipped = false;

        this.init();
    }

    init() {
        this.setupTabs();
        this.setupNotes();
        this.setupWeakProblems();
        this.setupFlashcards();
        this.setupExport();
        this.loadNotesList();
        this.loadWeakList();
        this.loadFlashcardsList();
    }

    // ========================================
    // タブ切り替え
    // ========================================

    setupTabs() {
        const tabs = document.querySelectorAll('.tab');
        const panels = document.querySelectorAll('.panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;

                // タブのアクティブ状態を切り替え
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');

                // パネルの表示を切り替え
                panels.forEach(p => {
                    p.classList.remove('active');
                });
                document.getElementById(`panel-${targetTab}`).classList.add('active');
            });
        });
    }

    // ========================================
    // ノート機能
    // ========================================

    setupNotes() {
        const saveBtn = document.getElementById('save-note');
        const clearBtn = document.getElementById('clear-note');
        const searchInput = document.getElementById('note-search');

        saveBtn.addEventListener('click', () => this.saveNote());
        clearBtn.addEventListener('click', () => this.clearNoteForm());
        searchInput.addEventListener('input', (e) => this.searchNotes(e.target.value));
    }

    saveNote() {
        const category = document.getElementById('note-category').value;
        const title = document.getElementById('note-title').value.trim();
        const content = document.getElementById('note-content').value.trim();

        if (!title) {
            alert('タイトルを入力してください');
            return;
        }

        if (!content) {
            alert('内容を入力してください');
            return;
        }

        const notes = this.getNotes();
        const note = {
            id: this.currentNoteId || Date.now().toString(),
            category,
            title,
            content,
            createdAt: this.currentNoteId ? notes.find(n => n.id === this.currentNoteId)?.createdAt || Date.now() : Date.now(),
            updatedAt: Date.now()
        };

        if (this.currentNoteId) {
            // 更新
            const index = notes.findIndex(n => n.id === this.currentNoteId);
            notes[index] = note;
        } else {
            // 新規作成
            notes.push(note);
        }

        this.saveNotes(notes);
        this.clearNoteForm();
        this.loadNotesList();
        this.showToast(this.currentNoteId ? 'ノートを更新しました' : 'ノートを保存しました');
        this.currentNoteId = null;
    }

    clearNoteForm() {
        document.getElementById('note-title').value = '';
        document.getElementById('note-content').value = '';
        document.getElementById('note-category').value = 'law';
        this.currentNoteId = null;
    }

    loadNotesList() {
        const notes = this.getNotes();
        const container = document.getElementById('notes-list');

        if (notes.length === 0) {
            container.innerHTML = '<p class="empty-message">まだノートがありません。上のフォームから作成してください。</p>';
            return;
        }

        const groupedNotes = this.groupNotesByCategory(notes);
        let html = '';

        const categoryNames = {
            law: '法令',
            guns: '猟具',
            animals: '鳥獣',
            management: '保護管理',
            practical: '実技',
            other: 'その他'
        };

        for (const [category, categoryNotes] of Object.entries(groupedNotes)) {
            html += `
                <div class="notes-category">
                    <h3 class="category-title">${categoryNames[category] || category}</h3>
                    <div class="notes-grid">
            `;

            categoryNotes.forEach(note => {
                const date = new Date(note.updatedAt).toLocaleDateString('ja-JP');
                html += `
                    <div class="note-card" data-note-id="${note.id}">
                        <div class="note-header">
                            <h4 class="note-title">${this.escapeHtml(note.title)}</h4>
                            <div class="note-actions">
                                <button class="button-icon" onclick="notesManager.editNote('${note.id}')" aria-label="編集">
                                    ✏️
                                </button>
                                <button class="button-icon" onclick="notesManager.deleteNote('${note.id}')" aria-label="削除">
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <div class="note-content">${this.escapeHtml(note.content).replace(/\n/g, '<br>')}</div>
                        <div class="note-footer">
                            <span class="note-date">更新: ${date}</span>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    editNote(id) {
        const notes = this.getNotes();
        const note = notes.find(n => n.id === id);

        if (!note) return;

        document.getElementById('note-category').value = note.category;
        document.getElementById('note-title').value = note.title;
        document.getElementById('note-content').value = note.content;
        this.currentNoteId = id;

        // ノートエディタまでスクロール
        document.querySelector('.note-editor').scrollIntoView({ behavior: 'smooth' });
    }

    deleteNote(id) {
        if (!confirm('このノートを削除しますか？')) return;

        const notes = this.getNotes().filter(n => n.id !== id);
        this.saveNotes(notes);
        this.loadNotesList();
        this.showToast('ノートを削除しました');
    }

    searchNotes(query) {
        if (!query) {
            this.loadNotesList();
            return;
        }

        const notes = this.getNotes().filter(note =>
            note.title.includes(query) || note.content.includes(query)
        );

        const container = document.getElementById('notes-list');

        if (notes.length === 0) {
            container.innerHTML = '<p class="empty-message">検索結果がありません</p>';
            return;
        }

        // 検索結果を表示（groupByなし）
        let html = '<div class="notes-grid">';
        notes.forEach(note => {
            const date = new Date(note.updatedAt).toLocaleDateString('ja-JP');
            html += `
                <div class="note-card" data-note-id="${note.id}">
                    <div class="note-header">
                        <h4 class="note-title">${this.escapeHtml(note.title)}</h4>
                        <div class="note-actions">
                            <button class="button-icon" onclick="notesManager.editNote('${note.id}')" aria-label="編集">
                                ✏️
                            </button>
                            <button class="button-icon" onclick="notesManager.deleteNote('${note.id}')" aria-label="削除">
                                🗑️
                            </button>
                        </div>
                    </div>
                    <div class="note-content">${this.escapeHtml(note.content).replace(/\n/g, '<br>')}</div>
                    <div class="note-footer">
                        <span class="note-date">更新: ${date}</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    }

    groupNotesByCategory(notes) {
        return notes.reduce((groups, note) => {
            const category = note.category || 'other';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(note);
            return groups;
        }, {});
    }

    // ========================================
    // 苦手リスト機能
    // ========================================

    setupWeakProblems() {
        // 苦手リストは問題演習時に自動的に追加される
        // ここでは表示のみ
    }

    loadWeakList() {
        const weakProblems = this.getWeakProblems();
        const conquered = this.getConquered();

        document.getElementById('weak-count').textContent = weakProblems.length;
        document.getElementById('conquered-count').textContent = conquered.length;

        const container = document.getElementById('weak-list');

        if (weakProblems.length === 0) {
            container.innerHTML = '<p class="empty-message">苦手な問題はありません。問題演習で間違えた問題が自動的にここに追加されます。</p>';
            return;
        }

        let html = '<div class="weak-problems-list">';
        weakProblems.forEach((problem, index) => {
            html += `
                <div class="weak-problem-card">
                    <div class="problem-number">問題 ${index + 1}</div>
                    <div class="problem-text">${this.escapeHtml(problem.question)}</div>
                    <div class="problem-meta">
                        <span class="problem-category">${this.getCategoryName(problem.category)}</span>
                        <span class="problem-errors">間違い: ${problem.errorCount}回</span>
                    </div>
                    <div class="problem-actions">
                        <button class="button button-small button-primary" onclick="notesManager.reviewProblem('${problem.id}')">
                            復習する
                        </button>
                        <button class="button button-small button-success" onclick="notesManager.markAsConquered('${problem.id}')">
                            克服した
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    }

    reviewProblem(id) {
        // 問題演習ページに遷移
        window.location.href = `index.html?weak=${id}`;
    }

    markAsConquered(id) {
        const weakProblems = this.getWeakProblems();
        const problem = weakProblems.find(p => p.id === id);

        if (!problem) return;

        // 苦手リストから削除
        const newWeakProblems = weakProblems.filter(p => p.id !== id);
        this.saveWeakProblems(newWeakProblems);

        // 克服リストに追加
        const conquered = this.getConquered();
        conquered.push({
            ...problem,
            conqueredAt: Date.now()
        });
        this.saveConquered(conquered);

        this.loadWeakList();
        this.showToast('おめでとうございます！克服しました🎉');
    }

    // ========================================
    // 暗記カード機能
    // ========================================

    setupFlashcards() {
        const saveBtn = document.getElementById('save-flashcard');
        const clearBtn = document.getElementById('clear-flashcard');
        const prevBtn = document.getElementById('prev-flashcard');
        const nextBtn = document.getElementById('next-flashcard');
        const cardContainer = document.getElementById('current-flashcard');

        saveBtn.addEventListener('click', () => this.saveFlashcard());
        clearBtn.addEventListener('click', () => this.clearFlashcardForm());
        prevBtn.addEventListener('click', () => this.prevFlashcard());
        nextBtn.addEventListener('click', () => this.nextFlashcard());
        cardContainer.addEventListener('click', () => this.flipFlashcard());
    }

    saveFlashcard() {
        const category = document.getElementById('flashcard-category').value;
        const front = document.getElementById('flashcard-front').value.trim();
        const back = document.getElementById('flashcard-back').value.trim();

        if (!front || !back) {
            alert('表と裏の両方を入力してください');
            return;
        }

        const flashcards = this.getFlashcards();
        const flashcard = {
            id: Date.now().toString(),
            category,
            front,
            back,
            createdAt: Date.now()
        };

        flashcards.push(flashcard);
        this.saveFlashcards(flashcards);
        this.clearFlashcardForm();
        this.loadFlashcardsList();
        this.showFlashcard(flashcards.length - 1);
        this.showToast('暗記カードを追加しました');
    }

    clearFlashcardForm() {
        document.getElementById('flashcard-front').value = '';
        document.getElementById('flashcard-back').value = '';
    }

    loadFlashcardsList() {
        const flashcards = this.getFlashcards();
        document.getElementById('flashcards-total').textContent = flashcards.length;

        const container = document.getElementById('flashcards-list');

        if (flashcards.length === 0) {
            this.showFlashcard(0);
            container.innerHTML = '';
            return;
        }

        this.showFlashcard(this.currentFlashcardIndex);

        let html = '<div class="flashcards-grid">';
        flashcards.forEach((card, index) => {
            html += `
                <div class="flashcard-item">
                    <div class="flashcard-mini">
                        <div class="flashcard-mini-front">${this.escapeHtml(card.front)}</div>
                        <div class="flashcard-mini-back">${this.escapeHtml(card.back)}</div>
                    </div>
                    <div class="flashcard-item-actions">
                        <button class="button-icon" onclick="notesManager.showFlashcard(${index})" aria-label="表示">
                            👁️
                        </button>
                        <button class="button-icon" onclick="notesManager.deleteFlashcard('${card.id}')" aria-label="削除">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    }

    showFlashcard(index) {
        const flashcards = this.getFlashcards();

        if (flashcards.length === 0) {
            document.getElementById('flashcard-container').innerHTML = `
                <div class="flashcard">
                    <div class="flashcard-front">
                        <p>カードを追加してください</p>
                    </div>
                </div>
            `;
            document.getElementById('flashcard-position').textContent = '0 / 0';
            return;
        }

        this.currentFlashcardIndex = Math.max(0, Math.min(index, flashcards.length - 1));
        this.isFlashcardFlipped = false;

        const card = flashcards[this.currentFlashcardIndex];

        document.getElementById('flashcard-container').innerHTML = `
            <div class="flashcard">
                <div class="flashcard-front">
                    <p>${this.escapeHtml(card.front)}</p>
                </div>
                <div class="flashcard-back" style="display: none;">
                    <p>${this.escapeHtml(card.back)}</p>
                </div>
            </div>
        `;

        document.getElementById('flashcard-position').textContent = `${this.currentFlashcardIndex + 1} / ${flashcards.length}`;
    }

    flipFlashcard() {
        const front = document.querySelector('.flashcard-front');
        const back = document.querySelector('.flashcard-back');

        if (!front || !back) return;

        this.isFlashcardFlipped = !this.isFlashcardFlipped;

        if (this.isFlashcardFlipped) {
            front.style.display = 'none';
            back.style.display = 'flex';
        } else {
            front.style.display = 'flex';
            back.style.display = 'none';
        }
    }

    prevFlashcard() {
        this.showFlashcard(this.currentFlashcardIndex - 1);
    }

    nextFlashcard() {
        this.showFlashcard(this.currentFlashcardIndex + 1);
    }

    deleteFlashcard(id) {
        if (!confirm('このカードを削除しますか？')) return;

        const flashcards = this.getFlashcards().filter(c => c.id !== id);
        this.saveFlashcards(flashcards);
        this.loadFlashcardsList();
        this.showToast('カードを削除しました');
    }

    // ========================================
    // エクスポート/インポート
    // ========================================

    setupExport() {
        document.getElementById('export-notes').addEventListener('click', () => this.exportNotes());
        document.getElementById('export-flashcards').addEventListener('click', () => this.exportFlashcards());
        document.getElementById('export-all').addEventListener('click', () => this.exportAll());
        document.getElementById('import-file').addEventListener('change', (e) => this.handleFileSelect(e));
        document.getElementById('import-data').addEventListener('click', () => this.importData());
        document.getElementById('print-notes').addEventListener('click', () => this.printNotes());
        document.getElementById('clear-notes').addEventListener('click', () => this.clearAllNotes());
        document.getElementById('clear-flashcards').addEventListener('click', () => this.clearAllFlashcards());
        document.getElementById('clear-all-data').addEventListener('click', () => this.clearAllData());
    }

    exportNotes() {
        const notes = this.getNotes();
        this.downloadJSON(notes, 'hunting_license_notes.json');
        this.showToast('ノートをエクスポートしました');
    }

    exportFlashcards() {
        const flashcards = this.getFlashcards();
        this.downloadJSON(flashcards, 'hunting_license_flashcards.json');
        this.showToast('暗記カードをエクスポートしました');
    }

    exportAll() {
        const data = {
            notes: this.getNotes(),
            flashcards: this.getFlashcards(),
            weakProblems: this.getWeakProblems(),
            conquered: this.getConquered(),
            exportedAt: Date.now()
        };
        this.downloadJSON(data, 'hunting_license_all_data.json');
        this.showToast('すべてのデータをエクスポートしました');
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('import-filename').textContent = file.name;
            document.getElementById('import-data').disabled = false;
        }
    }

    importData() {
        const fileInput = document.getElementById('import-file');
        const file = fileInput.files[0];

        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (data.notes) {
                    this.saveNotes(data.notes);
                    this.loadNotesList();
                }

                if (data.flashcards) {
                    this.saveFlashcards(data.flashcards);
                    this.loadFlashcardsList();
                }

                if (data.weakProblems) {
                    this.saveWeakProblems(data.weakProblems);
                    this.loadWeakList();
                }

                if (data.conquered) {
                    this.saveConquered(data.conquered);
                }

                this.showToast('データをインポートしました');
                fileInput.value = '';
                document.getElementById('import-filename').textContent = '';
                document.getElementById('import-data').disabled = true;
            } catch (error) {
                alert('ファイルの読み込みに失敗しました');
                console.error(error);
            }
        };
        reader.readAsText(file);
    }

    printNotes() {
        const notes = this.getNotes();

        if (notes.length === 0) {
            alert('印刷するノートがありません');
            return;
        }

        const printWindow = window.open('', '_blank');
        const categoryNames = {
            law: '法令',
            guns: '猟具',
            animals: '鳥獣',
            management: '保護管理',
            practical: '実技',
            other: 'その他'
        };

        let html = `
            <!DOCTYPE html>
            <html lang="ja">
            <head>
                <meta charset="UTF-8">
                <title>学習ノート - 印刷用</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
                    h2 { color: #2c3e50; margin-top: 30px; }
                    .note { margin-bottom: 30px; page-break-inside: avoid; }
                    .note-title { font-weight: bold; font-size: 1.2em; margin-bottom: 10px; }
                    .note-content { white-space: pre-wrap; line-height: 1.6; }
                    .note-footer { color: #666; font-size: 0.9em; margin-top: 10px; }
                    @media print {
                        body { padding: 0; }
                        .note { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <h1>狩猟免許試験 学習ノート</h1>
                <p>印刷日: ${new Date().toLocaleDateString('ja-JP')}</p>
        `;

        const groupedNotes = this.groupNotesByCategory(notes);

        for (const [category, categoryNotes] of Object.entries(groupedNotes)) {
            html += `<h2>${categoryNames[category] || category}</h2>`;

            categoryNotes.forEach(note => {
                const date = new Date(note.updatedAt).toLocaleDateString('ja-JP');
                html += `
                    <div class="note">
                        <div class="note-title">${this.escapeHtml(note.title)}</div>
                        <div class="note-content">${this.escapeHtml(note.content)}</div>
                        <div class="note-footer">更新: ${date}</div>
                    </div>
                `;
            });
        }

        html += `
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    }

    clearAllNotes() {
        if (!confirm('すべてのノートを削除しますか？この操作は取り消せません。')) return;
        if (!confirm('本当によろしいですか？')) return;

        this.saveNotes([]);
        this.loadNotesList();
        this.showToast('すべてのノートを削除しました');
    }

    clearAllFlashcards() {
        if (!confirm('すべての暗記カードを削除しますか？この操作は取り消せません。')) return;
        if (!confirm('本当によろしいですか？')) return;

        this.saveFlashcards([]);
        this.loadFlashcardsList();
        this.showToast('すべての暗記カードを削除しました');
    }

    clearAllData() {
        if (!confirm('すべてのデータ（ノート、暗記カード、苦手リスト）を削除しますか？この操作は取り消せません。')) return;
        if (!confirm('本当によろしいですか？')) return;

        this.saveNotes([]);
        this.saveFlashcards([]);
        this.saveWeakProblems([]);
        this.saveConquered([]);
        this.loadNotesList();
        this.loadFlashcardsList();
        this.loadWeakList();
        this.showToast('すべてのデータを削除しました');
    }

    // ========================================
    // ユーティリティ
    // ========================================

    getNotes() {
        const data = localStorage.getItem(this.STORAGE_KEYS.notes);
        return data ? JSON.parse(data) : [];
    }

    saveNotes(notes) {
        localStorage.setItem(this.STORAGE_KEYS.notes, JSON.stringify(notes));
    }

    getFlashcards() {
        const data = localStorage.getItem(this.STORAGE_KEYS.flashcards);
        return data ? JSON.parse(data) : [];
    }

    saveFlashcards(flashcards) {
        localStorage.setItem(this.STORAGE_KEYS.flashcards, JSON.stringify(flashcards));
    }

    getWeakProblems() {
        const data = localStorage.getItem(this.STORAGE_KEYS.weakProblems);
        return data ? JSON.parse(data) : [];
    }

    saveWeakProblems(problems) {
        localStorage.setItem(this.STORAGE_KEYS.weakProblems, JSON.stringify(problems));
    }

    getConquered() {
        const data = localStorage.getItem(this.STORAGE_KEYS.conquered);
        return data ? JSON.parse(data) : [];
    }

    saveConquered(conquered) {
        localStorage.setItem(this.STORAGE_KEYS.conquered, JSON.stringify(conquered));
    }

    getCategoryName(category) {
        const names = {
            law: '法令',
            guns: '猟具',
            animals: '鳥獣',
            management: '保護管理',
            practical: '実技',
            other: 'その他'
        };
        return names[category] || category;
    }

    downloadJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message) {
        // UX Enhancementsのトースト通知を使用
        if (typeof window.UXEnhancements !== 'undefined') {
            window.UXEnhancements.showToast(message, 'success', 3000);
        } else {
            // フォールバック: 旧実装
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = message;
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #2c3e50;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 3000);
        }
    }
}

// ========================================
// 初期化
// ========================================

let notesManager;

document.addEventListener('DOMContentLoaded', () => {
    notesManager = new NotesManager();
});
