// gomokuHistory.js
// ================================
// 五子棋历史介绍：已迁移到 Localization 系统
// ================================

// 降级静态定义，优先使用 Localization 系统
const GOMOKU_HISTORY_TITLE = () => Localization.get('history.title');

const GOMOKU_HISTORY_SUBTITLE = () => Localization.get('history.subtitle');

const GOMOKU_HISTORY_ARTICLE_HTML = () => Localization.get('history.article');

// 导出到全局 (保持兼容性)
// 注意：现在它们是函数调用或动态获取
Object.defineProperty(window, 'GOMOKU_HISTORY_TITLE', {
  get: () => Localization.get('history.title')
});

Object.defineProperty(window, 'GOMOKU_HISTORY_SUBTITLE', {
  get: () => Localization.get('history.subtitle')
});

Object.defineProperty(window, 'GOMOKU_HISTORY_ARTICLE_HTML', {
  get: () => Localization.get('history.article')
});
