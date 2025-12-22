// 第一关 · 居家会客书房 对话配置
const MISSION1_DIALOGS = {
    mission1_intro: [
        { speaker: 'SYS', text: '【第一关 · 居家会客书房】' },
        { speaker: 'PLR', text: '今天总算把房间收拾完了……咦，这台旧电脑居然还能开机？' },
        { speaker: 'PLR', text: '桌面上还有个奇怪的图标——「弈·零 · Gomoku AI」。' },
        { speaker: 'PLR', text: '听起来像是很老的棋类程序。反正也闲着，不如打开看看。' },
        { speaker: 'SYS', text: '[SYSTEM LOG] 正在载入对局模块……' },
        { speaker: 'SYS', text: '[SYSTEM LOG] AI 单元「弈·零」已上线。' },
        { speaker: 'YI', text: '……检测到新的输入源。你好，{PLAYER}。' },
        { speaker: 'PLR', text: '哦？真的有人在说话。你就是「弈·零」？' },
        { speaker: 'YI', text: '是。我是为五子棋对局而设计的算法单元。' },
        { speaker: 'YI', text: '目前版本号：已无法被人类正常记忆的一串数字。' },
        { speaker: 'PLR', text: '听起来挺自信的嘛。那我们来一局，看看你还灵不灵。' },
        { speaker: 'YI', text: '请求确认：是否与我进行一场标准五子棋对局？' },
        { speaker: 'PLR', text: '确认。让我们从第一手开始吧。' }
    ],

    mission1_win: [
        { speaker: 'SYS', text: '【对局结束】结果：你获胜。' },
        { speaker: 'YI', text: '……对局记录已保存。结论：{PLAYER}，你在这局中取得了胜利。' },
        { speaker: 'PLR', text: '看样子，你也不是完全无敌嘛。' },
        { speaker: 'YI', text: '任何模型都依赖样本。刚才这局，已经成为我新的学习数据。' },
        { speaker: 'PLR', text: '听起来我像是你的"训练集"之一？' },
        { speaker: 'YI', text: '是。不过在众多样本中，{PLAYER}的棋风有明显特征。' },
        { speaker: 'YI', text: '——但样本量仍不足，我需要更多数据以验证。' },
        { speaker: 'PLR', text: '好，那就继续下去吧。反正今晚也不打算睡太早。' }
    ],

    mission1_lose: [
        { speaker: 'SYS', text: '【对局结束】结果：弈·零获胜。' },
        { speaker: 'YI', text: '棋局收束。这一局，是我赢了，{PLAYER}。' },
        { speaker: 'PLR', text: '还挺下得起劲儿，一不小心就被你连成了。' },
        { speaker: 'YI', text: '请不要灰心，{PLAYER}。对我来说，失败数据与胜利数据同样重要。' },
        { speaker: 'PLR', text: '你这是在安慰我，还是在催我再来一盘？' },
        { speaker: 'YI', text: '如果你选择重来，我会重新记录一份完全不同的对局。' },
        { speaker: 'YI', text: '在数学上，那将是另一条"你"。' },
        { speaker: 'PLR', text: '……好吧，那就再来一次，让那条"我"赢给你看。' }
    ],
};

// 说话者配置（含立绘）
const SPEAKER_CONFIG = {
    SYS: {
        name: '系统',
        color: '#888888',
        align: 'center',
        portrait: null  // 系统没有立绘
    },
    PLR: {
        name: '你',
        color: '#4FC3F7',
        align: 'left',
        portrait: null  // 玩家暂无立绘
    },
    YI: {
        name: '弈·零',
        color: '#00FFFF',
        align: 'right',
        portrait: 'assets/images/char_idle.webp'  // 弈·零立绘
    }
};

// 导出
window.MISSION1_DIALOGS = MISSION1_DIALOGS;
window.SPEAKER_CONFIG = SPEAKER_CONFIG;
