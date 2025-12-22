// uiTexts.js
// =======================================
// 全局UI文本配置
// =======================================

const MAIN_MENU_TEXTS = {
  storyModeTitle: '故事模式',
  storyModeDesc: '与「弈·零」一起推进剧情关卡，从书房出发，一步步走到雪山之巅。',

  storyNewLabel: '全新故事',
  storyNewDesc: '从第一关开始，按照顺序体验完整剧情与段位考核。',

  storyReplayLabel: '温故知新',
  storyReplayDesc: '从已解锁的关卡中选择情节，重新挑战特定局面。',

  pveTitle: '人机对弈',
  pveDesc: '自由设置 AI 难度与规则，进行单局对战。',

  pvpTitle: '双人对弈',
  pvpDesc: '两位玩家本地轮流落子，体验纯粹的五子棋对局。',

  aiVsAiTitle: '最强大脑',
  aiVsAiDesc: '旁观两台 AI 对局，观察不同策略与落子节奏。',

  // 历史介绍入口
  historyTitle: '五子棋的前世今生',
  historyDesc: '从中国河图洛书，到日本连珠规则，再到 AI 时代的终极演化。',
};

const RANK_UI_TEXTS = {
  rankPanelTitle: '故事段位',
  rankCurrentLabel: '当前段位',
  rankNone: '尚未获得故事段位',
  rankNextHint: '通过下一关故事关卡，即可提升段位。',
};

const MISSION_BRIEF_TEXTS = {
  ruleTitle: '📜 本关规则',
  goalTitle: '🎯 任务目标',
  startButton: '开始对局',
  cancelButton: '返回',
};

const GAME_RESULT_TEXTS = {
  playerWin: '🎉 恭喜通关！',
  playerLose: '😢 挑战失败',
  draw: '🤝 平局',
  tryAgain: '再来一局',
  backToMenu: '返回菜单',
  nextLevel: '下一关',
  rankUp: '🏆 段位晋升！',
};

const FORBIDDEN_TEXTS = {
  teachingWarning: '⚠️ 这一步在正式比赛中属于禁手，请换一个位置。',
  strictLoss: '❌ 禁手判负！黑棋落在了禁手点上。',
  forbiddenTypes: {
    doubleThree: '双三禁手',
    doubleFour: '双四禁手',
    overline: '长连禁手',
  },
};

const TIME_CONTROL_TEXTS = {
  perMoveLabel: '步时',
  totalTimeLabel: '总时',
  incrementLabel: '+',
  timeoutLoss: '⏱️ 超时判负！',
  timeWarning: '⚠️ 时间不多了！',
};

const DATA_VIEW_TEXTS = {
  buttonLabel: '📊 数据视图',
  usesLeft: '剩余次数',
  candidateHint: 'AI推荐落点',
  noUsesLeft: '数据视图次数已用完',
};

// 导出到全局
window.MAIN_MENU_TEXTS = MAIN_MENU_TEXTS;
window.RANK_UI_TEXTS = RANK_UI_TEXTS;
window.MISSION_BRIEF_TEXTS = MISSION_BRIEF_TEXTS;
window.GAME_RESULT_TEXTS = GAME_RESULT_TEXTS;
window.FORBIDDEN_TEXTS = FORBIDDEN_TEXTS;
window.TIME_CONTROL_TEXTS = TIME_CONTROL_TEXTS;
window.DATA_VIEW_TEXTS = DATA_VIEW_TEXTS;
