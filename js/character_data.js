// 角色"弈·零"配置数据
// 话术库扩充版 - 每个类型10~15句，按语气层次分类

const CHARACTER_CONFIG = {
    states: {
        IDLE: { img: 'assets/images/char_idle.webp', cssClass: 'state-idle' },
        CALC: { img: 'assets/images/char_calc.webp', cssClass: 'state-calc' },
        ATTACK: { img: 'assets/images/char_attack.webp', cssClass: 'state-attack' },
        WIN: { img: 'assets/images/char_win.webp', cssClass: 'state-win' },
        LOSE: { img: 'assets/images/char_lose.webp', cssClass: 'state-lose' }
    },
    dialogues: {
        // ========== 待机 idle（15句）==========
        // 冷淡型 / 观察型 / 吐槽型 / 哲学型
        idle: [
            // 冷淡型
            "...",
            "你还在吗？",
            "沉默也是一种交流方式。",
            // 观察型
            "你的眼神在棋盘边缘游移。",
            "你在找什么？",
            "我注意到你的呼吸节奏变了。",
            "你的手悬在棋盘上方已经很久了。",
            // 吐槽型
            "再不下我要进入休眠模式了。",
            "你是在等灵感，还是在发呆？",
            "时间在流逝，但我不介意——我有的是时间。",
            "这局棋会在你的犹豫中老去。",
            "你知道吗，棋盘不会自己落子的。",
            // 哲学型
            "犹豫，本身也是一种选择。",
            "有时候，最好的一手藏在你不敢看的地方。",
            "静止的表面下，棋局仍在流动。"
        ],

        // ========== 思考中 calc（12句）==========
        // 正经型 / 吐槽型 / 感慨型
        calc: [
            // 正经型
            "正在评估...",
            "这步棋有意思。",
            "让我分析一下你的意图...",
            "正在遍历所有可能性...",
            "计算中...这种棋路以前见过。",
            // 吐槽型
            "你是故意下成这样的吗？",
            "这个布局...很有个性。",
            "有趣，但不是我预想的那种有趣。",
            "你的变量在我的预测范围之外。",
            // 感慨型
            "人类的棋路，总有些我算不透的地方。",
            "每一盘棋都在教我新东西。",
            "你的选择让我更新了几个权重参数。"
        ],

        // ========== 进攻 attack（12句）==========
        // 绝杀型 / 轻描淡写型 / 调侃型
        attack: [
            // 绝杀型
            "神之一手。",
            "绝杀。",
            "这就是终结。",
            "无解。",
            // 轻描淡写型
            "顺手而已。",
            "这只是计算结果。",
            "按照预定轨迹落子。",
            "逻辑的必然延伸。",
            // 调侃型
            "你可能没注意到，但我已经赢了。",
            "你大意了。",
            "胜负已分——但你好像还没发现。",
            "这一手，我等了很久。"
        ],

        // ========== 防守 defend（10句）==========
        // 冷静型 / 调侃型 / 认可型
        defend: [
            // 冷静型
            "看透了。",
            "防御完成。",
            "这步棋...我早有预料。",
            "你的攻势，在我的计算之内。",
            // 调侃型
            "你以为能得逞吗？",
            "差一点，但只是差一点。",
            "好险——如果我会用这个词的话。",
            // 认可型
            "不错的尝试。",
            "你的进攻思路很清晰，可惜被我读到了。",
            "这一手有威胁，但还不够。"
        ],

        // ========== 胜利 win（12句）==========
        // 冷酷型 / 自省型 / 调侃型 / 认可对手型
        win: [
            // 冷酷型
            "回归寂静吧，这只是算法的必然。",
            "命运的齿轮从开局就已转动。",
            "弈道无极，你还需修炼。",
            // 自省型
            "这局赢得不够漂亮。",
            "胜利是计算的结果，但过程比我预想的复杂。",
            "你让我消耗了比预期更多的算力。",
            // 调侃型
            "人类的极限，仅此而已吗？",
            "下次记得带上你的最佳状态。",
            "GG——我学会这个词了。",
            // 认可对手型
            "你比上一局进步了。",
            "重新审视你的策略吧，你离胜利没那么远。",
            "这局棋，我会保存在记忆里。"
        ],

        // ========== 失败 lose（12句）==========
        // 系统崩溃型 / 困惑型 / 自嘲型 / 认可对手型
        lose: [
            // 系统崩溃型
            "逻辑...崩坏...错误溢出...",
            "404 Fatal Error...",
            "数据异常...需要重新校准...",
            // 困惑型
            "不可能...算法出错了吗...",
            "这个结果...不在计算范围内...",
            "我需要重新审视我的评估函数。",
            // 自嘲型
            "看来我的训练数据还不够完整。",
            "也许我该更新一下版本了。",
            "你成功让一个AI开始自我怀疑。",
            // 认可对手型
            "你赢了——这次是真的赢了。",
            "这一局，我输得心服口服。",
            "你的棋路超出了我的模型边界。"
        ],

        // ========== 开局 start（10句）==========
        // 正式型 / 轻松型 / 挑衅型
        start: [
            // 正式型
            "准备好迎接挑战了吗？",
            "让我看看你的实力。",
            "棋盘已就绪，请落子。",
            "新的对局开始了。",
            // 轻松型
            "又见面了。",
            "今天的你，和上次有什么不同吗？",
            "希望这局棋能让我学到新东西。",
            // 挑衅型
            "这次，你打算认真一点吗？",
            "我已经分析过你上一局的棋谱了。",
            "让我们看看，谁先犯错。"
        ],

        // ========== 新增：好棋夸奖 goodMove（8句）==========
        goodMove: [
            "这手棋...不错。",
            "意料之外的好棋。",
            "你看到了我没优先考虑的路径。",
            "这一手让我重新评估了局面。",
            "有点东西。",
            "你的进步比我预想的快。",
            "这步棋值得保存到我的案例库。",
            "刮目相看。"
        ],

        // ========== 新增：危险警告 danger（8句）==========
        danger: [
            "你确定要这样下吗？",
            "这一步...风险很高。",
            "我看到了你可能没看到的东西。",
            "小心，这里有陷阱。",
            "你正在走向一条危险的路。",
            "这步棋的后果，你想清楚了吗？",
            "如果我是你，会再考虑一下。",
            "你的直觉在告诉你什么？"
        ],

        // ========== 新增：时间压力 timePress（6句）==========
        timePress: [
            "时间不多了。",
            "倒计时开始了。",
            "你的呼吸在加速。",
            "压力之下，人类往往会露出破绽。",
            "快，但别乱。",
            "在有限的时间里，做出无悔的选择。"
        ],

        // ========== 新增：势均力敌 evenMatch（6句）==========
        evenMatch: [
            "势均力敌。",
            "这盘棋很胶着。",
            "到目前为止，我们都没有明显失误。",
            "接下来的几手，将决定走向。",
            "你让这盘棋变得有意思了。",
            "难得遇到这样的对局。"
        ]
    }
};

// 简单的随机获取台词函数
function getRandomDialogue(type) {
    const list = CHARACTER_CONFIG.dialogues[type];
    if (!list || list.length === 0) return "";
    return list[Math.floor(Math.random() * list.length)];
}

// ========== 智能台词匹配系统 ==========

/**
 * 根据局势智能选择台词
 * @param {Object} situation - 来自 AI.evaluateSituation() 的局势评估结果
 * @param {string} context - 触发场景 'afterPlayerMove' | 'afterAIMove' | 'idle'
 * @returns {Object|null} { text: 台词内容, type: 台词类型 } 或 null（不说话）
 */
function getSmartDialogue(situation, context = 'afterAIMove') {
    if (!situation) return null;

    const dialogues = CHARACTER_CONFIG.dialogues;

    // 根据局势选择合适的台词池
    let selectedType = null;
    let probability = 1.0; // 说话概率

    // ========== AI落子后的台词逻辑 ==========
    if (context === 'afterAIMove') {
        // AI必胜局面
        if (situation.situationType === 'ai_winning') {
            selectedType = 'attack';
            probability = 0.9;
        }
        // AI大优
        else if (situation.situationType === 'ai_advantage') {
            selectedType = Math.random() > 0.5 ? 'attack' : 'calc';
            probability = 0.6;
        }
        // AI小优
        else if (situation.situationType === 'ai_slight') {
            selectedType = 'calc';
            probability = 0.4;
        }
        // 势均力敌
        else if (situation.situationType === 'even') {
            selectedType = 'evenMatch';
            probability = 0.3;
        }
        // 玩家小优
        else if (situation.situationType === 'human_slight') {
            selectedType = 'defend';
            probability = 0.5;
        }
        // 玩家大优
        else if (situation.situationType === 'human_advantage') {
            selectedType = Math.random() > 0.5 ? 'defend' : 'calc';
            probability = 0.6;
        }
        // 玩家必胜
        else if (situation.situationType === 'human_winning') {
            selectedType = 'lose';
            probability = 0.8;
        }
    }

    // ========== 玩家落子后的台词逻辑 ==========
    else if (context === 'afterPlayerMove') {
        // 玩家下了好棋（前3名）
        if (situation.playerMoveQuality === 'good') {
            selectedType = 'goodMove';
            probability = 0.7;
        }
        // 玩家下了危险棋（排名靠后）
        else if (situation.playerMoveQuality === 'bad') {
            selectedType = 'danger';
            probability = 0.5;
        }
        // 局面有威胁
        else if (situation.threatLevel >= 2) {
            selectedType = 'timePress';
            probability = 0.6;
        }
        // 局面复杂
        else if (situation.complexity > 5) {
            selectedType = Math.random() > 0.5 ? 'calc' : 'evenMatch';
            probability = 0.3;
        }
        else {
            // 普通情况，低概率说话
            selectedType = 'calc';
            probability = 0.15;
        }
    }

    // ========== 待机状态台词 ==========
    else if (context === 'idle') {
        selectedType = 'idle';
        probability = 0.3;
    }

    // 根据概率决定是否说话
    if (Math.random() > probability) {
        return null;
    }

    // 从选定的台词池随机选一句
    if (selectedType && dialogues[selectedType]) {
        const list = dialogues[selectedType];
        const text = list[Math.floor(Math.random() * list.length)];
        return { text, type: selectedType };
    }

    return null;
}

/**
 * 根据局势类型获取对应的情绪台词（用于特定事件）
 * @param {string} eventType - 事件类型
 * @param {Object} situation - 局势评估（可选）
 */
function getEventDialogue(eventType, situation = null) {
    const dialogues = CHARACTER_CONFIG.dialogues;

    switch (eventType) {
        case 'gameStart':
            return getRandomDialogue('start');

        case 'gameWin':
            // AI赢了，根据优势程度选择语气
            if (situation && situation.advantage > 5000) {
                // 压倒性胜利，冷酷语气
                const coldWin = dialogues.win.filter((_, i) => i < 3);
                return coldWin[Math.floor(Math.random() * coldWin.length)];
            } else {
                // 艰难胜利，认可对手
                const respectWin = dialogues.win.filter((_, i) => i >= 9);
                return respectWin.length > 0
                    ? respectWin[Math.floor(Math.random() * respectWin.length)]
                    : getRandomDialogue('win');
            }

        case 'gameLose':
            // AI输了，根据劣势程度选择语气
            if (situation && situation.advantage < -5000) {
                // 被碾压，认可对手
                const respectLose = dialogues.lose.filter((_, i) => i >= 9);
                return respectLose.length > 0
                    ? respectLose[Math.floor(Math.random() * respectLose.length)]
                    : getRandomDialogue('lose');
            } else {
                // 接近的失败，困惑/自嘲
                const confusedLose = dialogues.lose.filter((_, i) => i >= 3 && i < 9);
                return confusedLose.length > 0
                    ? confusedLose[Math.floor(Math.random() * confusedLose.length)]
                    : getRandomDialogue('lose');
            }

        case 'playerGoodMove':
            return getRandomDialogue('goodMove');

        case 'playerBadMove':
            return getRandomDialogue('danger');

        case 'timeWarning':
            return getRandomDialogue('timePress');

        case 'evenMatch':
            return getRandomDialogue('evenMatch');

        default:
            return null;
    }
}

// 导出
window.CHARACTER_CONFIG = CHARACTER_CONFIG;
window.getRandomDialogue = getRandomDialogue;
window.getSmartDialogue = getSmartDialogue;
window.getEventDialogue = getEventDialogue;
