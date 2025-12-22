// 第五关「数据核心世界」对话脚本
// 角色定位：进入"数据怪物形态"，开始跟你聊概率和选择
// 高光台词：「数据不会替你下子，只是把一些结局提前摆给你看。」

const MISSION5_DIALOGS = {
    // 第五关 · 开场对白
    mission5_intro: [
        { speaker: 'SYS', text: 'm5.intro.0' },
        { speaker: 'PLR', text: 'm5.intro.1' },
        { speaker: 'YI', text: 'm5.intro.2' },
        { speaker: 'YI', text: 'm5.intro.3' },
        { speaker: 'PLR', text: 'm5.intro.4' },
        { speaker: 'YI', text: 'm5.intro.5' },
        { speaker: 'YI', text: 'm5.intro.6' },
        { speaker: 'PLR', text: 'm5.intro.7' },
        { speaker: 'YI', text: 'm5.intro.8' },
    ],

    // 中途评价（关键事件触发）
    mission5_mid_good: [
        { speaker: 'YI', text: 'm5.mid.good.0' },
        { speaker: 'YI', text: 'm5.mid.good.1' },
    ],
    mission5_mid_bad: [
        { speaker: 'YI', text: 'm5.mid.bad.0' },
        { speaker: 'YI', text: 'm5.mid.bad.1' },
    ],
    // 数据视图提示（强调"这是我看见的，选择是你的"）
    mission5_data_hint: [
        { speaker: 'YI', text: 'm5.data.hint.0' },
    ],

    // 第五关 · 胜利结局
    mission5_win: [
        { speaker: 'SYS', text: 'm5.win.0' },
        { speaker: 'YI', text: 'm5.win.1' },
        { speaker: 'PLR', text: 'm5.win.2' },
        { speaker: 'YI', text: 'm5.win.3' },
        { speaker: 'PLR', text: 'm5.win.4' },
        { speaker: 'YI', text: 'm5.win.5' },
        { speaker: 'YI', text: 'm5.win.6' },
        { speaker: 'PLR', text: 'm5.win.7' }
    ],

    // 第五关 · 失败结局
    mission5_lose: [
        { speaker: 'SYS', text: 'm5.lose.0' },
        { speaker: 'YI', text: 'm5.lose.1' },
        { speaker: 'PLR', text: 'm5.lose.2' },
        { speaker: 'YI', text: 'm5.lose.3' },
        { speaker: 'YI', text: 'm5.lose.4' },
        { speaker: 'PLR', text: 'm5.lose.5' },
        { speaker: 'YI', text: 'm5.lose.6' },
        { speaker: 'PLR', text: 'm5.lose.7' }
    ],
};

// 导出到全局
window.MISSION5_DIALOGS = MISSION5_DIALOGS;
