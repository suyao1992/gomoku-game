// 故事模式存档管理
// story/save.js

const STORY_SAVE_KEY = 'gomoku_story_progress';

// 存档结构
// interface StoryProgress {
//   lastMission: number;   // 已解锁的 "下一关" 编号
// }

// 获取存档
function getStoryProgress() {
    const raw = localStorage.getItem(STORY_SAVE_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

// 设置存档（只在「全新故事」模式通关后调用）
function setStoryProgress(nextMission) {
    localStorage.setItem(
        STORY_SAVE_KEY,
        JSON.stringify({ lastMission: nextMission })
    );
}

// 获取当前解锁到第几关
function getUnlockedMission() {
    const progress = getStoryProgress();
    return progress?.lastMission ?? 1;
}

// 检查某关是否已解锁
function isMissionUnlocked(missionId) {
    return missionId <= getUnlockedMission();
}

// 检查某关是否已通关
function isMissionFinished(missionId) {
    return missionId < getUnlockedMission();
}

// 通关某关后更新存档（仅在全新故事模式中使用）
function completeMission(missionId) {
    const currentUnlocked = getUnlockedMission();
    // 只有通关当前进度的关卡才更新存档
    if (missionId === currentUnlocked && missionId < 7) {
        setStoryProgress(missionId + 1);
        // 触发云端同步
        if (window.CloudSync) {
            window.CloudSync.queueSync();
        }
        return true;
    }
    return false;
}

// 重置存档（用于测试）
function resetStoryProgress() {
    localStorage.removeItem(STORY_SAVE_KEY);
}

// 解锁指定关卡（调试用）
function debugUnlockMission(missionId) {
    setStoryProgress(missionId);
    console.log(`已解锁到第 ${missionId} 关`);
}

// 解锁全部关卡（调试用）
function debugUnlockAll() {
    setStoryProgress(8); // 7+1，解锁所有关卡
    console.log('已解锁全部关卡');
}

// 导出
window.getStoryProgress = getStoryProgress;
window.setStoryProgress = setStoryProgress;
window.getUnlockedMission = getUnlockedMission;
window.isMissionUnlocked = isMissionUnlocked;
window.isMissionFinished = isMissionFinished;
window.completeMission = completeMission;
window.resetStoryProgress = resetStoryProgress;
window.debugUnlockMission = debugUnlockMission;
window.debugUnlockAll = debugUnlockAll;
