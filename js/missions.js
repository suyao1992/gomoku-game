// 故事模式关卡配置
// story/missions.js

const MISSIONS_BASE = 'assets/images/story/';

const STORY_MISSIONS = [
    {
        id: 1,
        key: 'm1_study',
        title: '第一关 · 居家会客书房',
        shortTitle: '居家会客书房',
        tagline: '在旧电脑中唤醒沉睡多年的弈·零',
        difficulty: 1,
        thumb: MISSIONS_BASE + 'm1_study_idle.webp',
    },
    {
        id: 2,
        key: 'm2_rooftop',
        title: '第二关 · 赛博朋克雨夜天台',
        shortTitle: '赛博朋克雨夜天台',
        tagline: '在城市霓虹之下测试彼此的极限',
        difficulty: 2,
        thumb: MISSIONS_BASE + 'm2_rooftop_idle.webp',
    },
    {
        id: 3,
        key: 'm3_ruins',
        title: '第三关 · 失落的古代遗迹',
        shortTitle: '失落的古代遗迹',
        tagline: '用棋路解读被埋藏的古老算法',
        difficulty: 2,
        thumb: MISSIONS_BASE + 'm3_ruins_idle.webp',
    },
    {
        id: 4,
        key: 'm4_temple',
        title: '第四关 · 深海海底神殿',
        shortTitle: '深海海底神殿',
        tagline: '在水下静压中检验你的冷静',
        difficulty: 3,
        thumb: MISSIONS_BASE + 'm4_temple_idle.webp',
    },
    {
        id: 5,
        key: 'm5_core',
        title: '第五关 · 数据核心世界',
        shortTitle: '数据核心世界',
        tagline: '直面弈·零的运算核心',
        difficulty: 3,
        thumb: MISSIONS_BASE + 'm5_core_idle.webp',
    },
    {
        id: 6,
        key: 'm6_volcano',
        title: '第六关 · 火山口边缘',
        shortTitle: '火山口边缘',
        tagline: '每一步落子都像走在岩浆边缘',
        difficulty: 4,
        thumb: MISSIONS_BASE + 'm6_volcano_idle.webp',
    },
    {
        id: 7,
        key: 'm7_summit',
        title: '第七关 · 雪山之巅',
        shortTitle: '雪山之巅',
        tagline: '终局之战，决定人类与算法的未来',
        difficulty: 5,
        thumb: MISSIONS_BASE + 'm7_summit_idle.webp',
    },
];

// 获取关卡信息
function getMissionById(id) {
    return STORY_MISSIONS.find(m => m.id === id) || null;
}

// 获取所有关卡（带解锁状态）
function getMissionsWithStatus() {
    const progress = getStoryProgress();
    const unlockedNext = progress?.lastMission ?? 1;

    return STORY_MISSIONS.map(m => ({
        ...m,
        unlocked: m.id <= unlockedNext,      // 可回放范围
        finished: m.id < unlockedNext,       // 已通关
        current: m.id === unlockedNext,      // 当前进度
    }));
}

// 导出
window.STORY_MISSIONS = STORY_MISSIONS;
window.getMissionById = getMissionById;
window.getMissionsWithStatus = getMissionsWithStatus;
