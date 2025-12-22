// 故事模式背景配置
// 每关根据角色状态切换不同背景

const BASE = 'assets/images/story/';

const STORY_BACKGROUNDS = {
    1: { // 第一关 · 居家会客书房
        IDLE: BASE + 'm1_study_idle.webp',
        CALC: BASE + 'm1_study_calc.webp',
        ATTACK: BASE + 'm1_study_calc.webp',  // ATTACK 复用 CALC
        WIN: BASE + 'm1_study_win.webp',
        LOSE: BASE + 'm1_study_lose.webp',
    },
    2: { // 第二关 · 赛博朋克雨夜天台
        IDLE: BASE + 'm2_rooftop_idle.webp',   // 雨夜天台，霓虹柔和
        CALC: BASE + 'm2_rooftop_calc.webp',   // 雨势变大，霓虹闪烁
        ATTACK: BASE + 'm2_rooftop_calc.webp',   // ATTACK 复用 CALC
        WIN: BASE + 'm2_rooftop_win.webp',    // 雨停，霓虹柔和
        LOSE: BASE + 'm2_rooftop_lose.webp',   // 霓虹熄灭，城市更冷
    },
    3: { // 第三关 · 失落的古代遗迹
        IDLE: BASE + 'm3_ruins_idle.webp',     // 黄昏石阵，风沙轻拂
        CALC: BASE + 'm3_ruins_calc.webp',     // 光影增强，遗迹更压抑
        ATTACK: BASE + 'm3_ruins_calc.webp',     // ATTACK 复用 CALC
        WIN: BASE + 'm3_ruins_win.webp',      // 光线开阔，走出遗迹
        LOSE: BASE + 'm3_ruins_lose.webp',     // 阴影封闭，困于石阵
    },
    4: { // 第四关 · 深海海底神殿
        IDLE: BASE + 'm4_temple_idle.webp',    // 幽暗神殿，柔和光束
        CALC: BASE + 'm4_temple_calc.webp',    // 水更暗，光束更锐利
        ATTACK: BASE + 'm4_temple_calc.webp',    // ATTACK 复用 CALC
        WIN: BASE + 'm4_temple_win.webp',     // 光线柔和，神殿被点亮
        LOSE: BASE + 'm4_temple_lose.webp',    // 更浑浊，更深的黑暗
    },
    5: { // 第五关 · 数据核心世界
        IDLE: BASE + 'm5_core_idle.webp',      // 秩序感强的核心空间
        CALC: BASE + 'm5_core_calc.webp',      // 数据流更密，亮度更高
        ATTACK: BASE + 'm5_core_calc.webp',      // ATTACK 复用 CALC
        WIN: BASE + 'm5_core_win.webp',       // 秩序感更强，核心稳定发光
        LOSE: BASE + 'm5_core_lose.webp',      // glitch效果，数据墙破损
    },
    6: { // 第六关 · 火山口边缘
        IDLE: BASE + 'm6_volcano_idle.webp',   // 有熔岩光但相对平静
        CALC: BASE + 'm6_volcano_calc.webp',   // 熔岩更亮，烟尘更多
        ATTACK: BASE + 'm6_volcano_calc.webp',   // ATTACK 复用 CALC
        WIN: BASE + 'm6_volcano_win.webp',    // 天空放晴，熔岩收敛
        LOSE: BASE + 'm6_volcano_lose.webp',   // 火光更盛，烟雾更厚
    },
    7: { // 第七关 · 雪山之巅（最终章）
        IDLE: BASE + 'm7_summit_idle.webp',    // 清冷、高处、云海
        CALC: BASE + 'm7_summit_calc.webp',    // 风更大、云层更厚
        ATTACK: BASE + 'm7_summit_calc.webp',    // ATTACK 复用 CALC
        WIN: BASE + 'm7_summit_win.webp',     // 阳光透出、云海开阔
        LOSE: BASE + 'm7_summit_lose.webp',    // 光线略暗，冷清但不绝望
    },
};

// 基础背景（非剧情模式使用）
const DEFAULT_BACKGROUND = 'assets/images/bg.webp';

// 设置背景
function setBackground(mode, missionId, stateKey) {
    const bgDiv = document.getElementById('game-bg');
    if (!bgDiv) return;

    // ========== 剧情模式：按关卡 + 状态切 ==========
    if (mode === 'story' && missionId && STORY_BACKGROUNDS[missionId]) {
        const bgSet = STORY_BACKGROUNDS[missionId];

        const file =
            bgSet[stateKey] ||
            (stateKey === 'ATTACK' && (bgSet.ATTACK || bgSet.CALC)) ||
            bgSet.IDLE;

        if (file) {
            bgDiv.style.backgroundImage = `url('${file}')`;
            bgDiv.style.filter = 'none';
            return;
        }
    }

    // ========== 非剧情模式 / 没匹配到：用基础背景 ==========
    bgDiv.style.backgroundImage = `url('${DEFAULT_BACKGROUND}')`;
    bgDiv.style.filter = 'none';
}

// 重置为默认背景
function resetBackground() {
    const bgDiv = document.getElementById('game-bg');
    if (bgDiv) {
        bgDiv.style.backgroundImage = `url('${DEFAULT_BACKGROUND}')`;
        bgDiv.style.filter = 'none';
    }
}

// 导出到全局
window.STORY_BACKGROUNDS = STORY_BACKGROUNDS;
window.DEFAULT_BACKGROUND = DEFAULT_BACKGROUND;
window.setBackground = setBackground;
window.resetBackground = resetBackground;
