// ========== 故事模式关卡配置（完整规格版） ==========
// 版本：v2.0 - 功能完整版

/**
 * 禁手规则类型
 * 'none'     - 不启用禁手
 * 'teaching' - 教学模式（阻止落子但不判负）
 * 'strict'   - 严格模式（禁手直接判负）
 */

/**
 * 时间控制类型
 * { mode: 'none' }                                      - 不限时
 * { mode: 'perMove', perMoveSeconds: N }                - 每步N秒倒计时
 * { mode: 'overall', totalSeconds: N, incrementSeconds: M } - 总时间+每步加秒
 */

// 预设局面配置
const PRESET_POSITIONS = {
    // 第3关：古谱中盘预设（玩家劣势）
    'ancient_midgame': {
        description: '遗迹古谱残局',
        moves: [
            { x: 7, y: 7, color: 'black' },   // 天元
            { x: 8, y: 8, color: 'white' },
            { x: 6, y: 8, color: 'black' },
            { x: 8, y: 6, color: 'white' },
            { x: 9, y: 9, color: 'black' },
            { x: 5, y: 5, color: 'white' },
            { x: 6, y: 6, color: 'black' },
            { x: 9, y: 5, color: 'white' },
        ],
        nextToMove: 'black'  // 下一步该黑棋走
    },
    
    // 第6关：火山劣势局面
    'volcano_bad_shape': {
        description: '火山口边缘劣势局',
        moves: [
            { x: 7, y: 7, color: 'black' },
            { x: 7, y: 8, color: 'white' },
            { x: 8, y: 8, color: 'black' },
            { x: 6, y: 6, color: 'white' },
            { x: 6, y: 8, color: 'black' },
            { x: 8, y: 6, color: 'white' },
            { x: 9, y: 9, color: 'black' },
            { x: 5, y: 9, color: 'white' },
            { x: 9, y: 7, color: 'black' },
            { x: 9, y: 5, color: 'white' },  // 白棋形成威胁
        ],
        nextToMove: 'black'
    }
};

// 关卡配置
const STORY_LEVEL_CONFIG = {
    // ==================== 第1关：居家书房 ====================
    1: {
        id: 1,
        name: '第一关 · 居家书房',
        subtitle: '初识弈·零',
        
        rules: {
            playerColor: 'black',           // 玩家执黑先手
            aiLevel: 1,                     // 最简单AI
            startPresetId: null,            // 空盘开局
            forbiddenRule: 'none',          // 不启用禁手
            timeControl: { mode: 'none' },  // 不限时
            maxUndo: 5,                     // 悔棋5次
            hintsEnabled: true,             // 可以用提示
            dataView: { enabled: false }    // 无数据视图技能
        },
        
        story: {
            requireWinToClear: true,
            unlocksNextLevelId: 2,
            rankOnFirstClear: {
                title: '见习九级',
                description: '完成了和弈·零的第一盘对局。'
            }
        },
        
        // 任务简报面板内容
        ui: {
            ruleSummary: '执黑先手，无禁手规则，不限时，可悔棋5次。',
            goalSummary: '在棋盘上先连成五子获胜，完成与弈·零的第一次对局。'
        },
        
        // HUD显示配置
        hud: {
            left: { line1: '第一关 · 居家书房', line2: '初识弈·零' },
            center: {
                tags: [
                    { icon: '⚫', text: '执黑先手' },
                    { icon: '♾️', text: '不限时' },
                    { icon: '🔓', text: '禁手关闭' },
                    { icon: '↩️', text: '悔棋5次' }
                ]
            },
            right: {
                mainText: '自由对局',
                subText: '无时间限制',
                showBadge: true,
                badgeText: '新手引导'
            }
        }
    },
    
    // ==================== 第2关：雨夜天台 ====================
    2: {
        id: 2,
        name: '第二关 · 雨夜天台',
        subtitle: '霓虹下的快棋',
        
        rules: {
            playerColor: 'black',
            aiLevel: 2,
            startPresetId: null,
            forbiddenRule: 'none',
            timeControl: { 
                mode: 'perMove', 
                perMoveSeconds: 30 
            },
            maxUndo: 2,
            hintsEnabled: true,
            dataView: { enabled: false }
        },
        
        story: {
            requireWinToClear: true,
            unlocksNextLevelId: 3,
            rankOnFirstClear: {
                title: '街角七级',
                description: '习惯了在雨夜霓虹下快速落子。'
            }
        },
        
        ui: {
            ruleSummary: '执黑先手，每步限时30秒，无禁手规则，可悔棋2次。',
            goalSummary: '在时间压力下快速决策，击败弈·零完成本关。'
        },
        
        hud: {
            left: { line1: '第二关 · 雨夜天台', line2: '霓虹下的快棋' },
            center: {
                tags: [
                    { icon: '⚫', text: '执黑先手' },
                    { icon: '⏱️', text: '每步30秒' },
                    { icon: '🔓', text: '禁手关闭' },
                    { icon: '↩️', text: '悔棋2次' }
                ]
            },
            right: {
                mainText: '30',
                subText: '秒/每步',
                showWarning: false
            }
        }
    },
    
    // ==================== 第3关：失落遗迹（禁手教学） ====================
    3: {
        id: 3,
        name: '第三关 · 失落遗迹',
        subtitle: '禁手的真意',
        
        rules: {
            playerColor: 'black',
            aiLevel: 2,
            startPresetId: 'ancient_midgame',  // 古谱中盘预设
            forbiddenRule: 'teaching',          // 教学模式
            timeControl: { mode: 'none' },
            maxUndo: 1,
            hintsEnabled: false,
            dataView: { enabled: false }
        },
        
        story: {
            requireWinToClear: true,
            unlocksNextLevelId: 4,
            rankOnFirstClear: {
                title: '遗迹五级',
                description: '理解了三三、四四与长连禁手的真正含义。'
            }
        },
        
        ui: {
            ruleSummary: '执黑先手，禁手教学模式（阻止但不判负），古谱残局开局，不限时，可悔棋1次。',
            goalSummary: '学习识别三三、四四、长连禁手，并在残局中击败对手。'
        },
        
        hud: {
            left: { line1: '第三关 · 失落遗迹', line2: '禁手的真意' },
            center: {
                tags: [
                    { icon: '📜', text: '古谱残局' },
                    { icon: '🎓', text: '禁手教学' },
                    { icon: '♾️', text: '不限时' },
                    { icon: '↩️', text: '悔棋1次' }
                ]
            },
            right: {
                mainText: '教学模式',
                subText: '禁手会被阻止',
                showBadge: true,
                badgeText: '学习禁手'
            }
        }
    },
    
    // ==================== 第4关：海底神殿（长考局） ====================
    4: {
        id: 4,
        name: '第四关 · 海底神殿',
        subtitle: '深海的耐心',
        
        rules: {
            playerColor: 'white',           // AI先手，玩家后手
            aiLevel: 3,
            startPresetId: null,
            forbiddenRule: 'none',
            timeControl: { mode: 'none' },
            maxUndo: 1,
            hintsEnabled: false,
            dataView: { enabled: false }
        },
        
        story: {
            requireWinToClear: true,
            unlocksNextLevelId: 5,
            rankOnFirstClear: {
                title: '海渊四级',
                description: '在深海静压中学会了慢棋中的耐心与全局观。'
            }
        },
        
        ui: {
            ruleSummary: '执白后手，AI先下黑棋，无禁手规则，不限时，可悔棋1次。',
            goalSummary: '学会后手布局思维，在深海静压中耐心寻找反击机会。'
        },
        
        hud: {
            left: { line1: '第四关 · 海底神殿', line2: '深海的耐心' },
            center: {
                tags: [
                    { icon: '⚪', text: '执白后手' },
                    { icon: '♾️', text: '不限时' },
                    { icon: '🌊', text: '长考局' },
                    { icon: '↩️', text: '悔棋1次' }
                ]
            },
            right: {
                mainText: '深海长考',
                subText: '慢慢思考',
                showBadge: true,
                badgeText: '后手挑战'
            }
        }
    },
    
    // ==================== 第5关：数据核心（总时间+数据视图） ====================
    5: {
        id: 5,
        name: '第五关 · 数据核心',
        subtitle: '信息洪流',
        
        rules: {
            playerColor: 'white',
            aiLevel: 4,
            startPresetId: null,
            forbiddenRule: 'none',
            timeControl: {
                mode: 'overall',
                totalSeconds: 180,       // 3分钟
                incrementSeconds: 5      // 每步+5秒
            },
            maxUndo: 0,
            hintsEnabled: false,
            dataView: {
                enabled: true,
                maxUses: 3,              // 每局3次
                candidatesPerUse: 3      // 每次展示3个候选点
            }
        },
        
        story: {
            requireWinToClear: true,
            unlocksNextLevelId: 6,
            rankOnFirstClear: {
                title: '核心三段',
                description: '在时间与信息洪流中找到了自己的节奏。'
            }
        },
        
        ui: {
            ruleSummary: '执白后手，总时限3分钟（每步+5秒），无禁手，不可悔棋，可用数据视图技能3次。',
            goalSummary: '在有限时间和AI辅助下击败对手，体验信息洪流中的决策。'
        },
        
        hud: {
            left: { line1: '第五关 · 数据核心', line2: '信息洪流' },
            center: {
                tags: [
                    { icon: '⚪', text: '执白后手' },
                    { icon: '⏱️', text: '总时3分+5秒/步' },
                    { icon: '🔮', text: '数据视图×3' },
                    { icon: '🚫', text: '不可悔棋' }
                ]
            },
            right: {
                mainText: '3:00',
                subText: '+5秒/步',
                showWarning: false
            }
        }
    },
    
    // ==================== 第6关：火山口边缘（劣势局+严格禁手） ====================
    6: {
        id: 6,
        name: '第六关 · 火山口边缘',
        subtitle: '熔岩中的禁忌',
        
        rules: {
            playerColor: 'black',
            aiLevel: 4,
            startPresetId: 'volcano_bad_shape',  // 劣势局面
            forbiddenRule: 'strict',              // 严格禁手（禁手即负）
            timeControl: {
                mode: 'perMove',
                perMoveSeconds: 25               // 每步25秒
            },
            maxUndo: 0,
            hintsEnabled: false,
            dataView: { enabled: false }
        },
        
        story: {
            requireWinToClear: true,
            unlocksNextLevelId: 7,
            rankOnFirstClear: {
                title: '炎狱五段',
                description: '在火山边缘接住了每一手不容犯错的黑棋。'
            }
        },
        
        ui: {
            ruleSummary: '执黑先手，劣势残局开局，严格禁手（禁手即负），每步限时25秒，不可悔棋。',
            goalSummary: '在劣势局面下逆转取胜，同时避免任何禁手，一招不慎满盘皆输！'
        },
        
        hud: {
            left: { line1: '第六关 · 火山口边缘', line2: '熔岩中的禁忌' },
            center: {
                tags: [
                    { icon: '🔥', text: '劣势残局' },
                    { icon: '⚠️', text: '禁手判负' },
                    { icon: '⏱️', text: '每步25秒' },
                    { icon: '🚫', text: '不可悔棋' }
                ]
            },
            right: {
                mainText: '25',
                subText: '秒/每步',
                showWarning: true,
                warningText: '⚠️ 禁手直接判负'
            }
        }
    },
    
    // ==================== 第7关：雪山之巅（终章段位考核） ====================
    7: {
        id: 7,
        name: '第七关 · 雪山之巅',
        subtitle: '最终答案',
        
        rules: {
            playerColor: 'black',
            aiLevel: 5,
            startPresetId: null,
            forbiddenRule: 'strict',
            timeControl: {
                mode: 'overall',
                totalSeconds: 300,       // 5分钟
                incrementSeconds: 5
            },
            maxUndo: 0,
            hintsEnabled: false,
            dataView: { enabled: false }
        },
        
        story: {
            requireWinToClear: true,
            unlocksNextLevelId: null,    // 最后一关
            rankOnFirstClear: {
                title: '雪峰七段',
                description: '在雪山之巅给出了属于自己的最终答案。'
            }
        },
        
        ui: {
            ruleSummary: '执黑先手，严格禁手（禁手即负），总时限5分钟（每步+5秒），不可悔棋。',
            goalSummary: '这是最终考核！面对最强AI，在时间和禁手的双重压力下取胜，证明你的实力！'
        },
        
        hud: {
            left: { line1: '第七关 · 雪山之巅', line2: '最终答案' },
            center: {
                tags: [
                    { icon: '🏔️', text: '段位考核' },
                    { icon: '⚠️', text: '禁手判负' },
                    { icon: '⏱️', text: '总时5分+5秒/步' },
                    { icon: '🚫', text: '不可悔棋' }
                ]
            },
            right: {
                mainText: '5:00',
                subText: '+5秒/步',
                showWarning: true,
                warningText: '⚠️ 终极挑战'
            }
        }
    }
};

// ========== 导出函数 ==========

// 获取关卡配置
function getLevelConfig(levelId) {
    return STORY_LEVEL_CONFIG[levelId] || null;
}

// 获取关卡规则
function getLevelRules(levelId) {
    const config = STORY_LEVEL_CONFIG[levelId];
    return config ? config.rules : null;
}

// 获取预设局面
function getPresetPosition(presetId) {
    return PRESET_POSITIONS[presetId] || null;
}

// 获取所有关卡列表
function getAllLevels() {
    return Object.values(STORY_LEVEL_CONFIG);
}

// 旧接口兼容
function getStoryLevelConfig(levelId) {
    return getLevelConfig(levelId);
}

// 导出到全局
window.STORY_LEVEL_CONFIG = STORY_LEVEL_CONFIG;
window.PRESET_POSITIONS = PRESET_POSITIONS;
window.getLevelConfig = getLevelConfig;
window.getLevelRules = getLevelRules;
window.getPresetPosition = getPresetPosition;
window.getAllLevels = getAllLevels;
window.getStoryLevelConfig = getStoryLevelConfig;
