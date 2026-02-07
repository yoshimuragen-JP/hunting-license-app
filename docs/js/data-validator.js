'use strict';

/**
 * データ整合性バリデーター
 * JSONファイルのID参照、画像パス、外部リンクを検証
 */

const DataValidator = {
    errors: [],
    warnings: [],

    /**
     * 全データの検証
     */
    async validateAll() {
        this.errors = [];
        this.warnings = [];

        console.log('🔍 Starting data validation...');

        try {
            await this.validateQuestions();
            await this.validateAnimals();
            await this.validatePractical();
            this.validateImages();
            this.validateLinks();

            this.reportResults();
        } catch (error) {
            console.error('❌ Validation failed:', error);
            this.errors.push(`Fatal error: ${error.message}`);
        }
    },

    /**
     * 問題データの検証
     */
    async validateQuestions() {
        console.log('📝 Validating questions...');

        try {
            const response = await fetch('data/questions.json');
            if (!response.ok) {
                this.errors.push('questions.json not found');
                return;
            }

            const questions = await response.json();

            if (!Array.isArray(questions)) {
                this.errors.push('questions.json is not an array');
                return;
            }

            questions.forEach((q, index) => {
                // 必須フィールドチェック
                const requiredFields = ['id', 'category', 'question', 'options', 'correct', 'explanation'];
                requiredFields.forEach(field => {
                    if (!q[field]) {
                        this.errors.push(`Question ${index + 1} (ID: ${q.id}) missing field: ${field}`);
                    }
                });

                // IDの重複チェック
                const duplicates = questions.filter(item => item.id === q.id);
                if (duplicates.length > 1) {
                    this.errors.push(`Duplicate question ID: ${q.id}`);
                }

                // 選択肢の数チェック
                if (q.options && q.options.length < 2) {
                    this.errors.push(`Question ${q.id} has less than 2 options`);
                }

                // 正解の妥当性チェック
                if (q.correct !== undefined && (q.correct < 0 || q.correct >= (q.options?.length || 0))) {
                    this.errors.push(`Question ${q.id} has invalid correct answer index: ${q.correct}`);
                }
            });

            console.log(`✅ Validated ${questions.length} questions`);
        } catch (error) {
            this.errors.push(`Failed to validate questions: ${error.message}`);
        }
    },

    /**
     * 鳥獣データの検証
     */
    async validateAnimals() {
        console.log('🦌 Validating animals...');

        try {
            const response = await fetch('data/animals.json');
            if (!response.ok) {
                this.errors.push('animals.json not found');
                return;
            }

            const animals = await response.json();

            if (!animals.birds || !animals.mammals) {
                this.errors.push('animals.json missing birds or mammals');
                return;
            }

            const allAnimals = [...animals.birds, ...animals.mammals];

            allAnimals.forEach((a, index) => {
                // 必須フィールドチェック
                const requiredFields = ['name', 'category', 'features', 'huntable'];
                requiredFields.forEach(field => {
                    if (a[field] === undefined) {
                        this.errors.push(`Animal ${index + 1} (${a.name}) missing field: ${field}`);
                    }
                });

                // 特徴の数チェック
                if (a.features && a.features.length === 0) {
                    this.warnings.push(`Animal ${a.name} has no features`);
                }
            });

            console.log(`✅ Validated ${allAnimals.length} animals`);
        } catch (error) {
            this.errors.push(`Failed to validate animals: ${error.message}`);
        }
    },

    /**
     * 実技データの検証
     */
    async validatePractical() {
        console.log('🔧 Validating practical guide...');

        try {
            const response = await fetch('data/practical.json');
            if (!response.ok) {
                this.warnings.push('practical.json not found (optional)');
                return;
            }

            const practical = await response.json();

            if (!Array.isArray(practical)) {
                this.errors.push('practical.json is not an array');
                return;
            }

            practical.forEach((item, index) => {
                if (!item.title || !item.steps) {
                    this.errors.push(`Practical item ${index + 1} missing title or steps`);
                }
            });

            console.log(`✅ Validated ${practical.length} practical items`);
        } catch (error) {
            this.warnings.push(`Failed to validate practical: ${error.message}`);
        }
    },

    /**
     * 画像パスの検証
     */
    validateImages() {
        console.log('🖼️ Validating image paths...');

        const images = document.querySelectorAll('img[src], img[data-src]');

        images.forEach(img => {
            const src = img.getAttribute('src') || img.getAttribute('data-src');

            // 外部URLは除外
            if (src.startsWith('http://') || src.startsWith('https://')) {
                return;
            }

            // data:スキームは除外
            if (src.startsWith('data:')) {
                return;
            }

            // 相対パスの検証
            if (!src.startsWith('/') && !src.startsWith('./')) {
                this.warnings.push(`Image has ambiguous path: ${src}`);
            }
        });

        console.log(`✅ Validated ${images.length} images`);
    },

    /**
     * 外部リンクの検証
     */
    validateLinks() {
        console.log('🔗 Validating links...');

        const links = document.querySelectorAll('a[href]');
        let internalLinks = 0;
        let externalLinks = 0;

        links.forEach(link => {
            const href = link.getAttribute('href');

            // アンカーリンクは除外
            if (href.startsWith('#')) {
                return;
            }

            // 外部リンク
            if (href.startsWith('http://') || href.startsWith('https://')) {
                externalLinks++;

                // target="_blank" のチェック
                if (!link.hasAttribute('target')) {
                    this.warnings.push(`External link missing target="_blank": ${href}`);
                }

                // rel="noopener noreferrer" のチェック
                if (!link.hasAttribute('rel') || !link.getAttribute('rel').includes('noopener')) {
                    this.warnings.push(`External link missing rel="noopener noreferrer": ${href}`);
                }
            } else {
                internalLinks++;

                // 内部リンクの存在チェック（簡易版）
                const targetFile = href.split('#')[0];
                if (targetFile && !targetFile.includes('?')) {
                    // 注意: 実際のファイル存在チェックはサーバー側で行う必要がある
                }
            }
        });

        console.log(`✅ Validated ${internalLinks} internal links and ${externalLinks} external links`);
    },

    /**
     * 結果のレポート
     */
    reportResults() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 VALIDATION REPORT');
        console.log('='.repeat(50));

        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('✅ All validations passed!');
        } else {
            if (this.errors.length > 0) {
                console.error(`\n❌ ${this.errors.length} ERROR(S):`);
                this.errors.forEach((err, i) => {
                    console.error(`  ${i + 1}. ${err}`);
                });
            }

            if (this.warnings.length > 0) {
                console.warn(`\n⚠️ ${this.warnings.length} WARNING(S):`);
                this.warnings.forEach((warn, i) => {
                    console.warn(`  ${i + 1}. ${warn}`);
                });
            }
        }

        console.log('='.repeat(50) + '\n');

        // DOMにレポート表示（開発モードのみ）
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.displayReportInDOM();
        }
    },

    /**
     * DOMにレポート表示
     */
    displayReportInDOM() {
        const existingReport = document.getElementById('validation-report');
        if (existingReport) {
            existingReport.remove();
        }

        const report = document.createElement('div');
        report.id = 'validation-report';
        report.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: white;
            border: 2px solid ${this.errors.length > 0 ? '#dc3545' : '#28a745'};
            border-radius: 10px;
            padding: 15px;
            max-width: 400px;
            max-height: 300px;
            overflow-y: auto;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-family: monospace;
            font-size: 12px;
        `;

        let html = `<h4 style="margin: 0 0 10px 0;">Validation Report</h4>`;

        if (this.errors.length === 0 && this.warnings.length === 0) {
            html += `<p style="color: #28a745; font-weight: bold;">✅ All checks passed!</p>`;
        } else {
            if (this.errors.length > 0) {
                html += `<p style="color: #dc3545; font-weight: bold;">❌ ${this.errors.length} error(s)</p>`;
            }
            if (this.warnings.length > 0) {
                html += `<p style="color: #ffc107; font-weight: bold;">⚠️ ${this.warnings.length} warning(s)</p>`;
            }
        }

        html += `<button onclick="document.getElementById('validation-report').remove()"
                         style="margin-top: 10px; padding: 5px 10px; cursor: pointer;">
                    Close
                 </button>`;

        report.innerHTML = html;
        document.body.appendChild(report);
    }
};

// 開発モードで自動実行
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', () => {
        // 2秒後に検証実行（ページ読み込み完了を待つ）
        setTimeout(() => {
            DataValidator.validateAll();
        }, 2000);
    });
}

// グローバルに公開
window.DataValidator = DataValidator;
