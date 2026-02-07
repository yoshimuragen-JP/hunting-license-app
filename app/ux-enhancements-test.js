'use strict';

console.log('✅ ux-enhancements-test.js loaded');

window.UXEnhancements = {
    showLoading: function(message = '読み込み中...') {
        console.log('showLoading called:', message);
    },
    hideLoading: function() {
        console.log('hideLoading called');
    }
};

console.log('✅ window.UXEnhancements defined:', typeof window.UXEnhancements);
