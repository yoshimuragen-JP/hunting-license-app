/**
 * パフォーマンスモニター（Quality Guardian追加）
 * ページ読み込み速度、メモリ使用量、FPSを監視
 */

'use strict';

(function() {
    /**
     * ページ読み込みパフォーマンスを計測
     */
    function measurePageLoad() {
        if (!('performance' in window) || !('getEntriesByType' in performance)) {
            console.log('⚠️ Performance API利用不可');
            return;
        }

        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (!perfData) return;

                const metrics = {
                    dnsLookup: Math.round(perfData.domainLookupEnd - perfData.domainLookupStart),
                    tcpConnection: Math.round(perfData.connectEnd - perfData.connectStart),
                    ttfb: Math.round(perfData.responseStart - perfData.requestStart),
                    domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
                    fullLoad: Math.round(perfData.loadEventEnd - perfData.fetchStart)
                };

                console.log('📊 パフォーマンス計測結果:');
                console.log('   DNS: ', metrics.dnsLookup + 'ms');
                console.log('   TCP: ', metrics.tcpConnection + 'ms');
                console.log('   TTFB:', metrics.ttfb + 'ms');
                console.log('   DOM: ', metrics.domContentLoaded + 'ms');
                console.log('   Full:', metrics.fullLoad + 'ms');

                // パフォーマンス警告
                if (metrics.fullLoad > 3000) {
                    console.warn('⚠️ ページ読み込みが遅いです（3秒以上）');
                } else if (metrics.fullLoad < 1000) {
                    console.log('✅ ページ読み込みが高速です（1秒未満）');
                }

                // LocalStorageに保存（分析用）
                savePerformanceData(metrics);
            }, 0);
        });
    }

    /**
     * パフォーマンスデータを保存
     */
    function savePerformanceData(metrics) {
        try {
            const history = JSON.parse(localStorage.getItem('performanceHistory')) || [];
            history.push({
                timestamp: Date.now(),
                page: window.location.pathname.split('/').pop(),
                ...metrics
            });

            // 最新50件のみ保持
            if (history.length > 50) {
                history.shift();
            }

            localStorage.setItem('performanceHistory', JSON.stringify(history));
        } catch (e) {
            console.warn('⚠️ パフォーマンスデータ保存失敗:', e);
        }
    }

    /**
     * メモリ使用量監視
     */
    function monitorMemory() {
        if (!('memory' in performance)) {
            return;
        }

        setInterval(() => {
            const memory = performance.memory;
            const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
            const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
            const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);

            // メモリ使用率が90%を超えたら警告
            const usage = (usedMB / limitMB) * 100;
            if (usage > 90) {
                console.warn('⚠️ メモリ使用率が高いです:', Math.round(usage) + '%');
            }

            // デバッグ用（30秒ごと）
            console.log(`💾 メモリ: ${usedMB}MB / ${totalMB}MB (上限: ${limitMB}MB)`);
        }, 30000);
    }

    /**
     * FPS（フレームレート）監視
     */
    function monitorFPS() {
        let lastTime = performance.now();
        let frames = 0;

        function measureFPS() {
            frames++;
            const currentTime = performance.now();
            const elapsed = currentTime - lastTime;

            if (elapsed >= 1000) {
                const fps = Math.round((frames * 1000) / elapsed);

                if (fps < 30) {
                    console.warn('⚠️ FPSが低下しています:', fps);
                } else if (fps >= 60) {
                    console.log('✅ スムーズなアニメーション:', fps + 'fps');
                }

                frames = 0;
                lastTime = currentTime;
            }

            requestAnimationFrame(measureFPS);
        }

        // アニメーションがあるページでのみ監視
        if (document.querySelector('[style*="animation"], .animated, [class*="anim"]')) {
            requestAnimationFrame(measureFPS);
        }
    }

    /**
     * リソース読み込み監視
     */
    function monitorResources() {
        if (!('getEntriesByType' in performance)) return;

        window.addEventListener('load', () => {
            const resources = performance.getEntriesByType('resource');
            const slowResources = resources.filter(r => r.duration > 1000);

            if (slowResources.length > 0) {
                console.warn('⚠️ 読み込みが遅いリソース:');
                slowResources.forEach(r => {
                    console.warn(`   - ${r.name} (${Math.round(r.duration)}ms)`);
                });
            }

            // 合計転送サイズ
            const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
            const totalMB = (totalSize / 1048576).toFixed(2);
            console.log(`📦 総転送量: ${totalMB}MB`);

            if (totalSize > 5 * 1048576) {
                console.warn('⚠️ 転送量が多いです（5MB以上）');
            }
        });
    }

    /**
     * パフォーマンス統計を表示
     */
    function showPerformanceStats() {
        try {
            const history = JSON.parse(localStorage.getItem('performanceHistory')) || [];
            if (history.length === 0) return;

            const avgLoad = Math.round(
                history.reduce((sum, h) => sum + h.fullLoad, 0) / history.length
            );

            console.log('📈 パフォーマンス統計（平均）:');
            console.log(`   ページ読み込み: ${avgLoad}ms`);
            console.log(`   計測回数: ${history.length}回`);
        } catch (e) {
            console.warn('⚠️ パフォーマンス統計取得失敗:', e);
        }
    }

    /**
     * 初期化
     */
    function init() {
        measurePageLoad();
        monitorMemory();
        monitorFPS();
        monitorResources();
        showPerformanceStats();

        console.log('✅ Performance Monitor loaded');
    }

    // 即座に実行
    init();
})();
