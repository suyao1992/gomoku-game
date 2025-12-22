// 故事模式关卡配置
// story/missions.js

const MISSIONS_BASE = 'assets/images/story/';

const STORY_MISSIONS = [
    {
        id: 1,
        key: 'm1_study',
        titleKey: 'mission.m1.title',
        shortTitleKey: 'mission.m1.shortTitle',
        taglineKey: 'mission.m1.tagline',
        difficulty: 1,
        thumb: MISSIONS_BASE + 'm1_study_idle.webp',
    },
    {
        id: 2,
        key: 'm2_rooftop',
        titleKey: 'mission.m2.title',
        shortTitleKey: 'mission.m2.shortTitle',
        taglineKey: 'mission.m2.tagline',
        difficulty: 2,
        thumb: MISSIONS_BASE + 'm2_rooftop_idle.webp',
    },
    {
        id: 3,
        key: 'm3_ruins',
        titleKey: 'mission.m3.title',
        shortTitleKey: 'mission.m3.shortTitle',
        taglineKey: 'mission.m3.tagline',
        difficulty: 2,
        thumb: MISSIONS_BASE + 'm3_ruins_idle.webp',
    },
    {
        id: 4,
        key: 'm4_temple',
        titleKey: 'mission.m4.title',
        shortTitleKey: 'mission.m4.shortTitle',
        taglineKey: 'mission.m4.tagline',
        difficulty: 3,
        thumb: MISSIONS_BASE + 'm4_temple_idle.webp',
    },
    {
        id: 5,
        key: 'm5_core',
        titleKey: 'mission.m5.title',
        shortTitleKey: 'mission.m5.shortTitle',
        taglineKey: 'mission.m5.tagline',
        difficulty: 3,
        thumb: MISSIONS_BASE + 'm5_core_idle.webp',
    },
    {
        id: 6,
        key: 'm6_volcano',
        titleKey: 'mission.m6.title',
        shortTitleKey: 'mission.m6.shortTitle',
        taglineKey: 'mission.m6.tagline',
        difficulty: 4,
        thumb: MISSIONS_BASE + 'm6_volcano_idle.webp',
    },
    {
        id: 7,
        key: 'm7_summit',
        titleKey: 'mission.m7.title',
        shortTitleKey: 'mission.m7.shortTitle',
        taglineKey: 'mission.m7.tagline',
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
