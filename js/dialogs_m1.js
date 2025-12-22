// 第一关 · 居家会客书房 对话配置
const MISSION1_DIALOGS = {
    mission1_intro: [
        { speaker: 'SYS', text: 'm1.intro.0' },
        { speaker: 'PLR', text: 'm1.intro.1' },
        { speaker: 'PLR', text: 'm1.intro.2' },
        { speaker: 'PLR', text: 'm1.intro.3' },
        { speaker: 'SYS', text: 'm1.intro.4' },
        { speaker: 'SYS', text: 'm1.intro.5' },
        { speaker: 'YI', text: 'm1.intro.6' },
        { speaker: 'PLR', text: 'm1.intro.7' },
        { speaker: 'YI', text: 'm1.intro.8' },
        { speaker: 'YI', text: 'm1.intro.9' },
        { speaker: 'PLR', text: 'm1.intro.10' },
        { speaker: 'YI', text: 'm1.intro.11' },
        { speaker: 'PLR', text: 'm1.intro.12' }
    ],

    mission1_win: [
        { speaker: 'SYS', text: 'm1.win.0' },
        { speaker: 'YI', text: 'm1.win.1' },
        { speaker: 'PLR', text: 'm1.win.2' },
        { speaker: 'YI', text: 'm1.win.3' },
        { speaker: 'PLR', text: 'm1.win.4' },
        { speaker: 'YI', text: 'm1.win.5' },
        { speaker: 'YI', text: 'm1.win.6' },
        { speaker: 'PLR', text: 'm1.win.7' }
    ],

    mission1_lose: [
        { speaker: 'SYS', text: 'm1.lose.0' },
        { speaker: 'YI', text: 'm1.lose.1' },
        { speaker: 'PLR', text: 'm1.lose.2' },
        { speaker: 'YI', text: 'm1.lose.3' },
        { speaker: 'PLR', text: 'm1.lose.4' },
        { speaker: 'YI', text: 'm1.lose.5' },
        { speaker: 'YI', text: 'm1.lose.6' },
        { speaker: 'PLR', text: 'm1.lose.7' }
    ],
};

// 说话者配置（含立绘）
const SPEAKER_CONFIG = {
    SYS: {
        nameKey: 'char.sys.name',
        color: '#888888',
        align: 'center',
        portrait: null
    },
    PLR: {
        nameKey: 'char.plr.name',
        color: '#4FC3F7',
        align: 'left',
        portrait: null
    },
    YI: {
        nameKey: 'char.yi.name',
        color: '#00FFFF',
        align: 'right',
        portrait: 'assets/images/char_idle.webp'
    }
};

// 导出
window.MISSION1_DIALOGS = MISSION1_DIALOGS;
window.SPEAKER_CONFIG = SPEAKER_CONFIG;
