// 第四关「深海海底神殿」对话脚本
// 角色定位：冷静的复盘师，讲全局、讲耐心
// 高光台词：「在深水区里，急于挥拳，往往只会让自己更快耗尽气息。」

const MISSION4_DIALOGS = {
    // 第四关 · 开场对白
    mission4_intro: [
        { speaker: 'SYS', text: 'm4.intro.0' },
        { speaker: 'PLR', text: 'm4.intro.1' },
        { speaker: 'YI', text: 'm4.intro.2' },
        { speaker: 'YI', text: 'm4.intro.3' },
        { speaker: 'PLR', text: 'm4.intro.4' },
        { speaker: 'YI', text: 'm4.intro.5' },
        { speaker: 'YI', text: 'm4.intro.6' },
        { speaker: 'PLR', text: 'm4.intro.7' },
    ],

    // 中途评价（关键事件触发）
    mission4_mid_good: [
        { speaker: 'YI', text: 'm4.mid.good.0' },
        { speaker: 'YI', text: 'm4.mid.good.1' },
    ],
    mission4_mid_bad: [
        { speaker: 'YI', text: 'm4.mid.bad.0' },
        { speaker: 'YI', text: 'm4.mid.bad.1' },
    ],
    // 时间压力提醒
    mission4_time_warning: [
        { speaker: 'YI', text: 'm4.time.warning.0' },
    ],

    // 第四关 · 胜利结局
    mission4_win: [
        { speaker: 'SYS', text: 'm4.win.0' },
        { speaker: 'YI', text: 'm4.win.1' },
        { speaker: 'PLR', text: 'm4.win.2' },
        { speaker: 'YI', text: 'm4.win.3' },
        { speaker: 'YI', text: 'm4.win.4' },
        { speaker: 'YI', text: 'm4.win.5' },
        { speaker: 'PLR', text: 'm4.win.6' }
    ],

    // 第四关 · 失败结局
    mission4_lose: [
        { speaker: 'SYS', text: 'm4.lose.0' },
        { speaker: 'YI', text: 'm4.lose.1' },
        { speaker: 'PLR', text: 'm4.lose.2' },
        { speaker: 'YI', text: 'm4.lose.3' },
        { speaker: 'YI', text: 'm4.lose.4' },
        { speaker: 'PLR', text: 'm4.lose.5' }
    ],
};

// 导出到全局
window.MISSION4_DIALOGS = MISSION4_DIALOGS;
