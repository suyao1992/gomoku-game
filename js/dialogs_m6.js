// 第六关「火山口边缘」对话脚本
// 角色定位：硬核教练，扔你到修罗场里练抗压
// 高光台词：「真正重要的棋，从来不是在舒适区里下出来的。」「在火山口边缘，你第一次被红线推下去了。」

const MISSION6_DIALOGS = {
    // 第六关 · 开场对白
    mission6_intro: [
        { speaker: 'SYS', text: 'm6.intro.0' },
        { speaker: 'PLR', text: 'm6.intro.1' },
        { speaker: 'YI', text: 'm6.intro.2' },
        { speaker: 'YI', text: 'm6.intro.3' },
        { speaker: 'PLR', text: 'm6.intro.4' },
        { speaker: 'YI', text: 'm6.intro.5' },
        { speaker: 'YI', text: 'm6.intro.6' },
        { speaker: 'PLR', text: 'm6.intro.7' },
    ],

    // 中途评价（关键事件触发）
    mission6_mid_good: [
        { speaker: 'YI', text: 'm6.mid.good.0' },
        { speaker: 'YI', text: 'm6.mid.good.1' },
    ],
    mission6_mid_bad: [
        { speaker: 'YI', text: 'm6.mid.bad.0' },
        { speaker: 'YI', text: 'm6.mid.bad.1' },
    ],
    // 禁手判负（严格模式，用"红线"贯穿）
    mission6_forbidden_lose: [
        { speaker: 'YI', text: 'm6.forbidden.lose.0' },
        { speaker: 'YI', text: 'm6.forbidden.lose.1' },
    ],

    // 第六关 · 胜利结局
    mission6_win: [
        { speaker: 'SYS', text: 'm6.win.0' },
        { speaker: 'YI', text: 'm6.win.1' },
        { speaker: 'PLR', text: 'm6.win.2' },
        { speaker: 'YI', text: 'm6.win.3' },
        { speaker: 'PLR', text: 'm6.win.4' },
        { speaker: 'YI', text: 'm6.win.5' },
        { speaker: 'YI', text: 'm6.win.6' },
        { speaker: 'PLR', text: 'm6.win.7' }
    ],

    // 第六关 · 失败结局（让人想再来一局）
    mission6_lose: [
        { speaker: 'SYS', text: 'm6.lose.0' },
        { speaker: 'YI', text: 'm6.lose.1' },
        { speaker: 'PLR', text: 'm6.lose.2' },
        { speaker: 'YI', text: 'm6.lose.3' },
        { speaker: 'YI', text: 'm6.lose.4' },
        { speaker: 'PLR', text: 'm6.lose.5' },
        { speaker: 'YI', text: 'm6.lose.6' },
        { speaker: 'YI', text: 'm6.lose.7' },
        { speaker: 'PLR', text: 'm6.lose.8' }
    ],
};

// 导出到全局
window.MISSION6_DIALOGS = MISSION6_DIALOGS;
window.SPEAKER_CONFIG = SPEAKER_CONFIG;
