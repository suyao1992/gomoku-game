// 第二关对白配置
// dialogs_m2.js - 赛博朋克雨夜天台

const MISSION2_DIALOGS = {
    // 第二关 · 开场对白
    mission2_intro: [
        { speaker: 'SYS', text: 'm2.intro.0' },
        { speaker: 'PLR', text: 'm2.intro.1' },
        { speaker: 'SYS', text: 'm2.intro.2' },
        { speaker: 'YI', text: 'm2.intro.3' },
        { speaker: 'PLR', text: 'm2.intro.4' },
        { speaker: 'YI', text: 'm2.intro.5' },
        { speaker: 'YI', text: 'm2.intro.6' },
        { speaker: 'PLR', text: 'm2.intro.7' },
        { speaker: 'YI', text: 'm2.intro.8' },
        { speaker: 'YI', text: 'm2.intro.9' },
        { speaker: 'PLR', text: 'm2.intro.10' },
        { speaker: 'YI', text: 'm2.intro.11' },
        { speaker: 'PLR', text: 'm2.intro.12' },
        { speaker: 'YI', text: 'm2.intro.13' },
        { speaker: 'PLR', text: 'm2.intro.14' }
    ],

    // 中途评价——在一定步数后触发（可选）
    mission2_mid_good: [
        { speaker: 'YI', text: 'm2.mid.good.0' },
        { speaker: 'YI', text: 'm2.mid.good.1' },
    ],

    mission2_mid_bad: [
        { speaker: 'YI', text: 'm2.mid.bad.0' },
        { speaker: 'YI', text: 'm2.mid.bad.1' },
    ],

    // 第二关 · 胜利结局
    mission2_win: [
        { speaker: 'SYS', text: 'm2.win.0' },
        { speaker: 'YI', text: 'm2.win.1' },
        { speaker: 'PLR', text: 'm2.win.2' },
        { speaker: 'YI', text: 'm2.win.3' },
        { speaker: 'PLR', text: 'm2.win.4' },
        { speaker: 'YI', text: 'm2.win.5' },
        { speaker: 'YI', text: 'm2.win.6' },
        { speaker: 'PLR', text: 'm2.win.7' },
        { speaker: 'YI', text: 'm2.win.8' },
        { speaker: 'YI', text: 'm2.win.9' },
        { speaker: 'YI', text: 'm2.win.10' },
        { speaker: 'PLR', text: 'm2.win.11' },
    ],

    // 第二关 · 失败结局
    mission2_lose: [
        { speaker: 'SYS', text: 'm2.lose.0' },
        { speaker: 'YI', text: 'm2.lose.1' },
        { speaker: 'PLR', text: 'm2.lose.2' },
        { speaker: 'YI', text: 'm2.lose.3' },
        { speaker: 'YI', text: 'm2.lose.4' },
        { speaker: 'PLR', text: 'm2.lose.5' },
        { speaker: 'YI', text: 'm2.lose.6' },
        { speaker: 'YI', text: 'm2.lose.7' },
        { speaker: 'YI', text: 'm2.lose.8' },
        { speaker: 'PLR', text: 'm2.lose.9' }
    ],
};

// 导出
window.MISSION2_DIALOGS = MISSION2_DIALOGS;
