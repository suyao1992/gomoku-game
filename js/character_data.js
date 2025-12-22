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
        // 台词池已迁移至 localization.js (char.yi.*)
    }
};

// 简单的随机获取台词函数
function getRandomDialogue(type) {
    return Localization.t(`char.yi.${type}`);
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
