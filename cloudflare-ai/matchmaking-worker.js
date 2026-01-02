/**
 * matchmaking-worker.js - AI匹配服务主入口
 * Cloudflare Workers端点: /match
 */

// 🔑 AI配置内联(Workers不支持import JSON)
const config = {
    "aiPlayers": [
        { "uid": "U7x9K2mP4q", "nickname": "棋道新星", "lang": "zh", "avatar": "🦊", "elo": 1285, "personality": "normal", "aiLevel": 2, "thinkTimeRange": [800, 2500], "errorRate": 0.12 },
        { "uid": "P3nL8vQr2m", "nickname": "五子传说", "lang": "zh", "avatar": "🐼", "elo": 1420, "personality": "fast", "aiLevel": 3, "thinkTimeRange": [300, 1200], "errorRate": 0.05 },
        { "uid": "M9kR4tYb7w", "nickname": "云端旅人", "lang": "zh", "avatar": "🦁", "elo": 1350, "personality": "slow", "aiLevel": 2, "thinkTimeRange": [1500, 4000], "errorRate": 0.10 },
        { "uid": "Q2wH6sNp9x", "nickname": "棋海探索", "lang": "zh", "avatar": "🐯", "elo": 1230, "personality": "normal", "aiLevel": 1, "thinkTimeRange": [1000, 2800], "errorRate": 0.18 },
        { "uid": "K5jD3zXc8v", "nickname": "黑白之间", "lang": "zh", "avatar": "🐲", "elo": 1390, "personality": "normal", "aiLevel": 2, "thinkTimeRange": [900, 2400], "errorRate": 0.08 },
        { "uid": "F8mT1pWh5y", "nickname": "落子无悔", "lang": "zh", "avatar": "🦅", "elo": 1480, "personality": "fast", "aiLevel": 3, "thinkTimeRange": [400, 1400], "errorRate": 0.03 },
        { "uid": "N6vB9rLk2s", "nickname": "BoardMaster", "lang": "en", "avatar": "🐺", "elo": 1320, "personality": "normal", "aiLevel": 2, "thinkTimeRange": [850, 2600], "errorRate": 0.11 },
        { "uid": "R4cF7xMj3t", "nickname": "StoneSeeker", "lang": "en", "avatar": "🦄", "elo": 1260, "personality": "slow", "aiLevel": 1, "thinkTimeRange": [1600, 3800], "errorRate": 0.16 },
        { "uid": "W1yG5kQn8p", "nickname": "GridWarrior", "lang": "en", "avatar": "🐱", "elo": 1440, "personality": "fast", "aiLevel": 3, "thinkTimeRange": [350, 1300], "errorRate": 0.04 },
        { "uid": "Z9sJ2vBm4r", "nickname": "LineChaser", "lang": "en", "avatar": "🐶", "elo": 1370, "personality": "normal", "aiLevel": 2, "thinkTimeRange": [750, 2300], "errorRate": 0.09 },
        { "uid": "H3pL6wKx9v", "nickname": "PatternHunter", "lang": "en", "avatar": "🦋", "elo": 1210, "personality": "slow", "aiLevel": 1, "thinkTimeRange": [1700, 4200], "errorRate": 0.20 },
        { "uid": "T8dY4rZn2q", "nickname": "碁盤の旅人", "lang": "ja", "avatar": "🌸", "elo": 1340, "personality": "normal", "aiLevel": 2, "thinkTimeRange": [900, 2700], "errorRate": 0.10 },
        { "uid": "V5bC8jXm1w", "nickname": "五目の達人", "lang": "ja", "avatar": "🦊", "elo": 1470, "personality": "fast", "aiLevel": 3, "thinkTimeRange": [380, 1250], "errorRate": 0.04 },
        { "uid": "D2nH7fWp6y", "nickname": "石の詩人", "lang": "ja", "avatar": "🐼", "elo": 1290, "personality": "slow", "aiLevel": 2, "thinkTimeRange": [1400, 3600], "errorRate": 0.13 },
        { "uid": "L6kQ3sVr9x", "nickname": "盤上の風", "lang": "ja", "avatar": "🦁", "elo": 1410, "personality": "normal", "aiLevel": 2, "thinkTimeRange": [800, 2400], "errorRate": 0.07 },
        { "uid": "B9xT5mLk2p", "nickname": "바둑여행자", "lang": "ko", "avatar": "🐯", "elo": 1310, "personality": "normal", "aiLevel": 2, "thinkTimeRange": [950, 2550], "errorRate": 0.11 },
        { "uid": "Y4wF8jNq7r", "nickname": "오목마스터", "lang": "ko", "avatar": "🐲", "elo": 1450, "personality": "fast", "aiLevel": 3, "thinkTimeRange": [320, 1180], "errorRate": 0.05 },
        { "uid": "G7zD2vBm5s", "nickname": "돌의시인", "lang": "ko", "avatar": "🦅", "elo": 1250, "personality": "slow", "aiLevel": 1, "thinkTimeRange": [1550, 3900], "errorRate": 0.17 },
        { "uid": "C3pR6kXh8t", "nickname": "Người chơi cờ", "lang": "vi", "avatar": "🐺", "elo": 1380, "personality": "normal", "aiLevel": 2, "thinkTimeRange": [870, 2450], "errorRate": 0.09 },
        { "uid": "X2hM9wSn4v", "nickname": "Thợ săn chiến thắng", "lang": "vi", "avatar": "🦄", "elo": 1220, "personality": "slow", "aiLevel": 1, "thinkTimeRange": [1650, 4100], "errorRate": 0.19 }
    ]
};

export default {
    async fetch(request, env, ctx) {
        // CORS处理
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                }
            });
        }

        const url = new URL(request.url);

        // 路由: /match - 匹配AI对手
        if (url.pathname === '/match' && request.method === 'POST') {
            return handleMatch(request, env);
        }

        // 路由: /admin/status - 管理员查询AI状态
        if (url.pathname === '/admin/status' && request.method === 'GET') {
            return handleAdminStatus(env);
        }

        // 路由: /admin/trigger - 手动触发AI对局
        if (url.pathname === '/admin/trigger' && request.method === 'POST') {
            return handleTriggerMatch(env);
        }

        return new Response('Not Found', { status: 404 });
    },

    // Cron定时器: 每30分钟触发AI自动对局
    async scheduled(event, env, ctx) {
        console.log('[Cron] AI auto-match triggered');
        await autoMatchAIs(env);
    }
};

/**
 * 处理玩家匹配请求
 */
async function handleMatch(request, env) {
    try {
        const { playerId, playerElo } = await request.json();

        if (!playerId || !playerElo) {
            return jsonResponse({ error: 'Missing playerId or playerElo' }, 400);
        }

        // 1. 从配置读取AI池
        const aiPool = config.aiPlayers;

        // 2. 选择ELO最接近的AI (AI配置是无限可用的模板,无需状态检查)
        const selectedAI = selectBestAI(aiPool, playerElo);

        // 3. 返回AI信息（伪装成真人格式）
        return jsonResponse({
            success: true,
            opponent: {
                uid: selectedAI.uid,
                nickname: selectedAI.nickname,
                avatar: selectedAI.avatar,
                elo: selectedAI.elo,
                isOnline: true,
                // 隐藏字段：客户端需要这些来驱动AI
                _isAI: true,
                _aiConfig: {
                    personality: selectedAI.personality,
                    aiLevel: selectedAI.aiLevel,
                    thinkTimeRange: selectedAI.thinkTimeRange,
                    errorRate: selectedAI.errorRate
                }
            }
        });

    } catch (error) {
        console.error('[Match] Error:', error);
        return jsonResponse({ error: error.message }, 500);
    }
}

/**
 * 获取空闲的AI列表
 */
async function getIdleAIs(aiPool, env) {
    const idle = [];
    const now = Date.now();
    const ONE_HOUR = 3600 * 1000; // 1小时

    for (const ai of aiPool) {
        const statusRaw = await env.AI_STATUS.get(ai.uid);
        const status = statusRaw ? JSON.parse(statusRaw) : null;

        // 没有状态或状态为idle的AI
        if (!status || status.status === 'idle') {
            idle.push(ai);
            continue;
        }

        // 🔧 修复:对局超过1小时的AI视为空闲(防止永久锁定)
        if (status.status === 'playing' && status.startTime) {
            const elapsed = now - status.startTime;
            if (elapsed > ONE_HOUR) {
                console.log(`[getIdleAIs] AI ${ai.nickname} marked as idle (stale match)`);
                idle.push(ai);
                // 清理过期状态
                await env.AI_STATUS.delete(ai.uid);
            }
        }
    }

    return idle;
}

/**
 * 选择ELO最接近的AI（范围内随机选择，增加多样性）
 */
function selectBestAI(aiList, playerElo) {
    const ELO_THRESHOLD = 300; // ±300 ELO范围

    // 找出ELO差值在阈值内的所有合格AI
    const eligibleAIs = aiList.filter(ai =>
        Math.abs(ai.elo - playerElo) <= ELO_THRESHOLD
    );

    // 如果没有合适的AI，降级到全池选择
    const pool = eligibleAIs.length > 0 ? eligibleAIs : aiList;

    console.log(`[selectBestAI] Player ELO: ${playerElo}, Eligible AIs: ${pool.length}/${aiList.length}`);

    // 从合格池中随机选择
    const randomIndex = Math.floor(Math.random() * pool.length);
    const selected = pool[randomIndex];

    console.log(`[selectBestAI] Selected: ${selected.nickname} (ELO: ${selected.elo}, diff: ${Math.abs(selected.elo - playerElo)})`);

    return selected;
}

/**
 * 管理员查询AI状态
 */
async function handleAdminStatus(env) {
    const aiPool = config.aiPlayers;

    // 读取对战中的AI状态
    let inGameCount = 0;
    const inGameDataRaw = await env.AI_STATUS.get('in_game_ais');

    if (inGameDataRaw) {
        const inGameData = JSON.parse(inGameDataRaw);
        const now = Date.now();

        // 检查是否过期（超过30分钟）
        if (now - inGameData.timestamp < inGameData.duration) {
            inGameCount = inGameData.ais.length;
        } else {
            // 过期自动清理
            console.log('[AdminStatus] Battle data expired, cleaning up');
            await env.AI_STATUS.delete('in_game_ais');
        }
    }

    const aiList = aiPool.map(ai => ({
        uid: ai.uid,
        nickname: ai.nickname,
        elo: ai.elo,
        avatar: ai.avatar,
        personality: ai.personality,
        aiLevel: ai.aiLevel
    }));

    return jsonResponse({
        totalAIs: aiPool.length,
        onlineAIs: aiPool.length, // 所有AI始终在线
        inGameAIs: inGameCount,
        aiList: aiList
    });
}

/**
 * 手动触发AI对局（管理员功能）
 */
async function handleTriggerMatch(env) {
    await autoMatchAIs(env);
    return jsonResponse({ success: true, message: 'AI auto-match triggered' });
}

/**
 * AI自动对局逻辑 - 轻量级状态模拟
 * 每30分钟随机标记3-5个AI为"对战中"
 */
async function autoMatchAIs(env) {
    console.log('[AutoMatch] Simulating AI battles...');

    try {
        // 随机选择3-5个AI标记为对战中
        const aiPool = config.aiPlayers;
        const battleCount = Math.floor(Math.random() * 3) + 3; // 3-5个

        // 随机选择AI
        const selectedAIs = [];
        const shuffled = [...aiPool].sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(battleCount, shuffled.length); i++) {
            selectedAIs.push({
                uid: shuffled[i].uid,
                nickname: shuffled[i].nickname,
                elo: shuffled[i].elo
            });
        }

        // 存储到KV（30分钟后自动过期）
        const battleData = {
            ais: selectedAIs,
            timestamp: Date.now(),
            duration: 1800000 // 30分钟
        };

        await env.AI_STATUS.put('in_game_ais', JSON.stringify(battleData));

        console.log(`[AutoMatch] Marked ${selectedAIs.length} AIs as in-game:`,
            selectedAIs.map(ai => ai.nickname).join(', '));

    } catch (error) {
        console.error('[AutoMatch] Error:', error);
    }
}

/**
 * 工具函数：返回JSON响应
 */
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
