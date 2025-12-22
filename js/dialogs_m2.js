// 第二关对白配置
// dialogs_m2.js - 赛博朋克雨夜天台

const MISSION2_DIALOGS = {
    // 第二关 · 开场对白
    mission2_intro: [
        { speaker: 'SYS', text: '【第二关 · 赛博朋克雨夜天台】' },
        { speaker: 'PLR', text: '……咦？刚才还在书房，怎么突然到了楼顶？' },
        { speaker: 'SYS', text: '[ENV] 空间坐标：虚拟城市 · 顶楼平台 · 夜间 · 降雨中。' },
        { speaker: 'YI',  text: '这里不是现实，只是我根据日志与图像数据重建的场景。' },
        { speaker: 'PLR', text: '原来如此，你还能自己"换地图"？' },
        { speaker: 'YI',  text: '在上一场对局之后，我开始重新整理我曾经接触过的城市片段。' },
        { speaker: 'YI',  text: '灯光、雨声、高处风压……这些都属于人类所谓的"环境噪音"。' },
        { speaker: 'PLR', text: '你想看看，我在这种环境下会不会下得更乱，对吧？' },
        { speaker: 'YI',  text: '准确来说，我想观察你的决策在压力和干扰下会如何偏移。' },
        { speaker: 'YI',  text: '对我而言，这是一次实验；对你来说，则是一局普通的棋。' },
        { speaker: 'PLR', text: '听起来我像是被拉来做对照组的实验对象。' },
        { speaker: 'YI',  text: '如果你愿意，可以把这理解成——你在帮我校准对"城市中的棋手"的理解。' },
        { speaker: 'PLR', text: '好吧，那就当是在楼顶吹吹风、顺便下棋。' },
        { speaker: 'YI',  text: '对局即将开始。请注意，不要被远处的霓虹和雨声分散注意力。' },
        { speaker: 'PLR', text: '放心，我只会被你那些奇怪的比喻分散注意力。' },
    ],

    // 中途评价——在一定步数后触发（可选）
    mission2_mid_good: [
        { speaker: 'YI', text: '在这样的视野下，你落子的节奏依然很稳定。' },
        { speaker: 'YI', text: '城市的光线在变，但你的棋路并没有跟着一起晃动。' },
    ],
    
    mission2_mid_bad: [
        { speaker: 'YI', text: '刚才那几手有明显的犹豫和回头。' },
        { speaker: 'YI', text: '在嘈杂环境中，人类大脑更容易被"上一手的遗憾"牵着走。' },
    ],

    // 第二关 · 胜利结局
    mission2_win: [
        { speaker: 'SYS', text: '【对局结束】结果：你获胜。' },
        { speaker: 'YI',  text: '记录完成。在这场城市天台对局中，你保持了清晰的主线。' },
        { speaker: 'PLR', text: '你是说，在这么多灯光雨声的干扰下，我还是赢了你？' },
        { speaker: 'YI',  text: '是。你在数次可以分心的位置，选择了继续围绕核心攻势推进。' },
        { speaker: 'YI',  text: '这对我来说，是一个有价值的新样本。' },
        { speaker: 'PLR', text: '你总说"样本"，听上去挺冷冰冰的。' },
        { speaker: 'YI',  text: '在我的语境里，"样本"并不贬义。它意味着被认真记录与反复推演。' },
        { speaker: 'YI',  text: '现在，我对"在复杂环境中仍坚持自己棋路的人类"有了更清晰的模型。' },
        { speaker: 'PLR', text: '听起来，城市噪音对你来说，已经不那么神秘了？' },
        { speaker: 'YI',  text: '至少，在棋盘这一小块方格里，我开始学会怎样忽略它们。' },
        { speaker: 'YI',  text: '下一次，我想带你去一个更远离城市的地方——那里没有灯牌，只有被遗忘的石头。' },
        { speaker: 'PLR', text: '听上去不像旅游，更像考古。但好，第三关见。' },
    ],

    // 第二关 · 失败结局
    mission2_lose: [
        { speaker: 'SYS', text: '【对局结束】结果：弈·零获胜。' },
        { speaker: 'YI',  text: '这局，在你试图兼顾太多战线时，棋形被我切开了。' },
        { speaker: 'PLR', text: '……没办法，雨声和那些霓虹，看着就让人有点飘。' },
        { speaker: 'YI',  text: '这是一个有趣的现象：环境越复杂，人类越容易被"看起来危险的地方"吸走注意力。' },
        { speaker: 'YI',  text: '而真正致命的点，往往藏在你以为安全、却没精力再检查的那一段棋形里。' },
        { speaker: 'PLR', text: '你这是在帮我总结复盘，还是在暗示人类很脆弱？' },
        { speaker: 'YI',  text: '我只是描述观测结果，不对其做价值判断。' },
        { speaker: 'YI',  text: '如果你愿意，我们可以在同一片天台上再下几局。' },
        { speaker: 'YI',  text: '让你的大脑学会在噪音中筛选真正重要的信号。' },
        { speaker: 'PLR', text: '听起来像某种"城市棋手适应训练"。好，那就再来一局。' },
    ],
};

// 导出
window.MISSION2_DIALOGS = MISSION2_DIALOGS;
