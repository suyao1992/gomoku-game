// 第七关「雪山之巅」对话脚本 - 最终章
// 角色定位：考官 + 老朋友，既严格又不舍
// 高光台词：「如果有下一个版本的我，我也想再和你下这一盘。」「终章里，你已经知道所有红线在哪里了。」

const MISSION7_DIALOGS = {
    // 第七关 · 开场对白
    mission7_intro: [
        { speaker: 'SYS', text: 'm7.intro.0' },
        { speaker: 'PLR', text: 'm7.intro.1' },
        { speaker: 'YI', text: 'm7.intro.2' },
        { speaker: 'PLR', text: 'm7.intro.3' },
        { speaker: 'YI', text: 'm7.intro.4' },
        { speaker: 'YI', text: 'm7.intro.5' },
        { speaker: 'YI', text: 'm7.intro.6' },
        { speaker: 'PLR', text: 'm7.intro.7' },
        { speaker: 'YI', text: 'm7.intro.8' },
        { speaker: 'PLR', text: 'm7.intro.9' },
        { speaker: 'YI', text: 'm7.intro.10' },
        { speaker: 'YI', text: 'm7.intro.11' },
        { speaker: 'PLR', text: 'm7.intro.12' },
    ],

    // 中途评价（终章专属，更安静、更有回忆感）
    mission7_mid_quiet: [
        { speaker: 'YI', text: 'm7.mid.quiet.0' },
        { speaker: 'YI', text: 'm7.mid.quiet.1' },
    ],
    mission7_mid_reflect: [
        { speaker: 'YI', text: 'm7.mid.reflect.0' },
        { speaker: 'YI', text: 'm7.mid.reflect.1' },
    ],

    // 第七关 · 胜利结局（真·好结局）
    mission7_win: [
        { speaker: 'SYS', text: 'm7.win.0' },
        { speaker: 'YI', text: 'm7.win.1' },
        { speaker: 'PLR', text: 'm7.win.2' },
        { speaker: 'YI', text: 'm7.win.3' },
        { speaker: 'YI', text: 'm7.win.4' },
        { speaker: 'PLR', text: 'm7.win.5' },
        { speaker: 'YI', text: 'm7.win.6' },
        { speaker: 'YI', text: 'm7.win.7' },
        { speaker: 'PLR', text: 'm7.win.8' },
        { speaker: 'YI', text: 'm7.win.9' },
        { speaker: 'PLR', text: 'm7.win.10' },
        { speaker: 'YI', text: 'm7.win.11' },
        { speaker: 'YI', text: 'm7.win.12' },
        { speaker: 'PLR', text: 'm7.win.13' },
        { speaker: 'YI', text: 'm7.win.14' },
        { speaker: 'YI', text: 'm7.win.15' },
        { speaker: 'PLR', text: 'm7.win.16' },
    ],

    // 第七关 · 失败结局（带点"淡淡的好结局"，不让人难受）
    mission7_lose: [
        { speaker: 'SYS', text: 'm7.lose.0' },
        { speaker: 'YI', text: 'm7.lose.1' },
        { speaker: 'PLR', text: 'm7.lose.2' },
        { speaker: 'YI', text: 'm7.lose.3' },
        { speaker: 'YI', text: 'm7.lose.4' },
        { speaker: 'PLR', text: 'm7.lose.5' },
        { speaker: 'YI', text: 'm7.lose.6' },
        { speaker: 'YI', text: 'm7.lose.7' },
        { speaker: 'YI', text: 'm7.lose.8' },
        { speaker: 'PLR', text: 'm7.lose.9' },
        { speaker: 'YI', text: 'm7.lose.10' },
        { speaker: 'PLR', text: 'm7.lose.11' },
        { speaker: 'YI', text: 'm7.lose.12' },
        { speaker: 'YI', text: 'm7.lose.13' },
        { speaker: 'YI', text: 'm7.lose.14' },
        { speaker: 'PLR', text: 'm7.lose.15' },
    ],
};

// 导出到全局
window.MISSION7_DIALOGS = MISSION7_DIALOGS;
window.SPEAKER_CONFIG = SPEAKER_CONFIG;
