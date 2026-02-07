'use strict';

// 狩猟免許試験 一発合格アプリ - Service Worker
// キャッシュ戦略: Stale While Revalidate（高速表示 + バックグラウンド更新）

const CACHE_NAME = 'hunting-license-v2';
const RUNTIME_CACHE = 'runtime-cache-v2';

// キャッシュするリソース（オフライン対応）
const PRECACHE_URLS = [
  // HTMLファイル（全ページ）
  '/',
  '/index.html',
  '/animals.html',
  '/practical.html',
  '/mock-exam.html',
  '/dashboard.html',
  '/game.html',
  '/guide.html',
  '/notes.html',
  '/faq.html',

  // CSSファイル（全スタイル）
  '/design-system.css',
  '/style.css',
  '/accessibility.css',
  '/mobile-optimized.css',

  // JavaScriptファイル（全ロジック）
  '/app.js',
  '/dashboard.js',
  '/game.js',
  '/mock-exam.js',
  '/notes.js',
  '/sound.js',
  '/accessibility.js',
  '/mobile-utils.js',

  // データファイル（全データ）
  '../quiz-database.json',
  '../extended-quiz-database.json',
  '../hunting-license-data.json',
  '../study-tips.json',
  '../motivational-messages.json',

  // PWA
  '/manifest.json'
];

// インストール時: 静的リソースをキャッシュ
self.addEventListener('install', (event) => {
  // console.log('[Service Worker] インストール開始'); // 本番環境用にコメントアウト

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // console.log('[Service Worker] リソースをキャッシュ'); // 本番環境用にコメントアウト
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// アクティベート時: 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  // console.log('[Service Worker] アクティベート'); // 本番環境用にコメントアウト

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              // console.log('[Service Worker] 古いキャッシュを削除:', cacheName); // 本番環境用にコメントアウト
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// フェッチ時: Stale While Revalidate戦略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 同一オリジンのみキャッシュ
  if (url.origin !== location.origin) {
    return;
  }

  // GET以外は無視
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // キャッシュがあれば即座に返す（高速表示）
        if (cachedResponse) {
          // バックグラウンドで最新版を取得してキャッシュ更新
          fetchAndCache(request);
          return cachedResponse;
        }

        // キャッシュがない場合はネットワークから取得
        return fetchAndCache(request);
      })
      .catch(() => {
        // オフライン時のフォールバック
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// ネットワークから取得してキャッシュ
function fetchAndCache(request) {
  return fetch(request)
    .then((response) => {
      // レスポンスが有効な場合のみキャッシュ
      if (!response || response.status !== 200 || response.type === 'error') {
        return response;
      }

      // レスポンスをクローン（一度しか読めないため）
      const responseToCache = response.clone();

      caches.open(RUNTIME_CACHE)
        .then((cache) => {
          cache.put(request, responseToCache);
        });

      return response;
    });
}

// バックグラウンド同期（将来の拡張用）
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgress());
  }
});

async function syncProgress() {
  // 学習進捗をサーバーと同期（現在はローカルのみ）
  // console.log('[Service Worker] 学習進捗を同期'); // 本番環境用にコメントアウト
}

// プッシュ通知（将来の拡張用）
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '学習を続けましょう！',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: '今すぐ学習',
        icon: '/icons/action-open.png'
      },
      {
        action: 'close',
        title: '閉じる',
        icon: '/icons/action-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('狩猟免許試験 学習リマインダー', options)
  );
});

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 定期的なバックグラウンド同期（将来の拡張用）
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(sendDailyReminder());
  }
});

async function sendDailyReminder() {
  // 毎日の学習リマインダー（将来実装）
  // console.log('[Service Worker] 毎日のリマインダーを送信'); // 本番環境用にコメントアウト
}

// メッセージ受信（アプリからService Workerへの通信）
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE)
        .then((cache) => cache.addAll(event.data.payload))
    );
  }
});
