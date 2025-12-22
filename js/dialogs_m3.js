// 第三关「失落的古代遗迹」对话脚本
// 角色定位：开始负责的老师，讲规则、讲禁手
// 高光台词：「欢迎来到真正的连珠世界。」「从这一关起，我会帮你看住这些红线。」

const MISSION3_DIALOGS = {
    // 第三关 · 开场对白（精简到5句核心）
    mission3_intro: [
        { speaker: 'SYS', text: '【第三关 · 失落的古代遗迹】' },
        { speaker: 'YI',  text: '欢迎来到真正的连珠世界。' },
        { speaker: 'PLR', text: '……这次不是城市了，倒像是某种古代祭坛。' },
        { speaker: 'YI',  text: '这里记录着我曾经高度依赖的定式与模式——包括那些让我输得很惨的棋形。' },
        { speaker: 'PLR', text: '听上去，你已经被"传统经验"牢牢框住了。' },
        { speaker: 'YI',  text: '传统可以是限制，也可以是捷径。取决于你是否只会照本宣科。' },
        { speaker: 'YI',  text: '从这一关起，我会帮你看住那些红线——三三、四四、长连，都是禁手。' },
        { speaker: 'PLR', text: '好，那就当是带你在你自己的遗迹里散步。谁先被绊倒算谁输。' },
    ],

    // 中途评价（关键事件触发，每个最多2句）
    mission3_mid_good: [
        { speaker: 'YI', text: '刚才那几手偏离了常见模板，但逻辑仍然自洽。' },
        { speaker: 'YI', text: '对我来说，这是介于"错误"和"创意"之间的一段新路径。' },
    ],
    mission3_mid_bad: [
        { speaker: 'YI', text: '那是一个被多次证明会崩盘的古老下法。' },
        { speaker: 'YI', text: '在人类棋谱里，它有一个名字：习惯性失误。' },
    ],
    // 禁手提醒（教学式，不是报错式）
    mission3_forbidden_warning: [
        { speaker: 'YI', text: '等等，这一步不行。' },
        { speaker: 'YI', text: '如果你下在这里，会触碰到红线。让我帮你踩一下刹车。' },
    ],

    // 第三关 · 胜利结局（精简到4句核心）
    mission3_win: [
        { speaker: 'SYS', text: '【对局结束】结果：你获胜。' },
        { speaker: 'YI',  text: '你多次故意偏离既有模板，却仍然维持了优势。' },
        { speaker: 'PLR', text: '简单理解，就是我没被你的"古代套路"牵着走。' },
        { speaker: 'YI',  text: '你利用了我对旧棋谱的偏好，让我在熟悉的形状里放松了警惕。' },
        { speaker: 'YI',  text: '这就是人类不爱按说明书操作的好处。' },
        { speaker: 'YI',  text: '接下来，我想把环境切换到一个没有这些石柱的地方——在那里，压迫感不来自过去，而来自看不见的深度。' },
        { speaker: 'PLR', text: '……听起来像是要下到海底。第四关见。' },
    ],

    // 第三关 · 失败结局（精简，带"想再来一局"的钩子）
    mission3_lose: [
        { speaker: 'SYS', text: '【对局结束】结果：弈·零获胜。' },
        { speaker: 'YI',  text: '你在几个关键转折点选择了最常见、也是最容易被惩罚的延续。' },
        { speaker: 'PLR', text: '你是说，我刚才走的那些，其实早就被写进你这片"石碑"里了？' },
        { speaker: 'YI',  text: '是。那是一种在旧棋谱中频繁出现、胜率极低的处理方式。' },
        { speaker: 'YI',  text: '学习传统，不是为了被它束缚，而是为了知道从哪里开始偏离。' },
        { speaker: 'PLR', text: '好吧，下次我试着亲手推倒一根你的"老套路"。' },
    ],
};

// 导出到全局
window.MISSION3_DIALOGS = MISSION3_DIALOGS;
