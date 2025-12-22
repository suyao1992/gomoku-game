// 第三关「失落的古代遗迹」对话脚本
// 角色定位：开始负责的老师，讲规则、讲禁手
// 高光台词：「欢迎来到真正的连珠世界。」「从这一关起，我会帮你看住这些红线。」

const MISSION3_DIALOGS = {
    // 第三关 · 开场对白（精简到5句核心）
    mission3_intro: [
        { speaker: 'SYS', text: 'm3.intro.0' },
        { speaker: 'YI', text: 'm3.intro.1' },
        { speaker: 'PLR', text: 'm3.intro.2' },
        { speaker: 'YI', text: 'm3.intro.3' },
        { speaker: 'PLR', text: 'm3.intro.4' },
        { speaker: 'YI', text: 'm3.intro.5' },
        { speaker: 'YI', text: 'm3.intro.6' },
        { speaker: 'PLR', text: 'm3.intro.7' },
    ],

    // 中途评价（关键事件触发，每个最多2句）
    mission3_mid_good: [
        { speaker: 'YI', text: 'm3.mid.good.0' },
        { speaker: 'YI', text: 'm3.mid.good.1' },
    ],
    mission3_mid_bad: [
        { speaker: 'YI', text: 'm3.mid.bad.0' },
        { speaker: 'YI', text: 'm3.mid.bad.1' },
    ],
    // 禁手提醒（教学式，不是报错式）
    mission3_forbidden_warning: [
        { speaker: 'YI', text: 'm3.forbidden.warning.0' },
        { speaker: 'YI', text: 'm3.forbidden.warning.1' },
    ],

    // 第三关 · 胜利结局（精简到4句核心）
    mission3_win: [
        { speaker: 'SYS', text: 'm3.win.0' },
        { speaker: 'YI', text: 'm3.win.1' },
        { speaker: 'PLR', text: 'm3.win.2' },
        { speaker: 'YI', text: 'm3.win.3' },
        { speaker: 'YI', text: 'm3.win.4' },
        { speaker: 'YI', text: 'm3.win.5' },
        { speaker: 'PLR', text: 'm3.win.6' },
    ],

    // 第三关 · 失败结局（精简，带"想再来一局"的钩子）
    mission3_lose: [
        { speaker: 'SYS', text: 'm3.lose.0' },
        { speaker: 'YI', text: 'm3.lose.1' },
        { speaker: 'PLR', text: 'm3.lose.2' },
        { speaker: 'YI', text: 'm3.lose.3' },
        { speaker: 'YI', text: 'm3.lose.4' },
        { speaker: 'PLR', text: 'm3.lose.5' },
    ],
};

// 导出到全局
window.MISSION3_DIALOGS = MISSION3_DIALOGS;
