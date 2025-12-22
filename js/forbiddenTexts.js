// 禁手类型与文案配置
// forbiddenTexts.js

// 禁手类型枚举
const ForbiddenType = {
    DOUBLE_THREE: 'doubleThree',
    DOUBLE_FOUR: 'doubleFour',
    OVERLINE: 'overline'
};

// ========== 第三关主动教学课程 ==========
// 教学页面配置（进入实战前的"禁手课堂"）
const FORBIDDEN_LESSON_PAGES = [
    {
        id: 'intro',
        title: '禁手规则简介',
        speaker: 'YI',
        content: [
            '在正式的连珠规则中，黑棋因为先手优势，受到一些限制——这就是"禁手"。',
            '禁手规则是为了让对局更公平：先手不能用某些"过于强力"的招法直接获胜。',
            '接下来，我会带你认识三种禁手：三三、四四、长连。'
        ],
        boardDemo: null  // 无棋盘演示
    },
    {
        id: 'doubleThree',
        title: '第一课：三三禁手',
        speaker: 'YI',
        content: [
            '三三禁手：黑棋不能一步棋同时形成两个"活三"。',
            '"活三"是指三颗连续的同色棋子，两端都有空位可以扩展成"活四"。',
            '如果一步棋同时制造两条活三，对手根本来不及同时防守，这被认为是不公平的强招。'
        ],
        boardDemo: {
            // 演示棋盘上的禁手点位置
            stones: [
                { x: 7, y: 6, color: 'black' },
                { x: 7, y: 8, color: 'black' },
                { x: 6, y: 7, color: 'black' },
                { x: 8, y: 7, color: 'black' }
            ],
            forbiddenPoint: { x: 7, y: 7 },
            highlightLines: [
                [{ x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }],  // 横向活三
                [{ x: 7, y: 6 }, { x: 7, y: 7 }, { x: 7, y: 8 }]   // 纵向活三
            ],
            annotation: '如果黑棋下在★处，会同时形成横向和纵向两条活三'
        }
    },
    {
        id: 'doubleFour',
        title: '第二课：四四禁手',
        speaker: 'YI',
        content: [
            '四四禁手：黑棋不能一步棋同时形成两个"四"（包括活四和冲四）。',
            '"四"是指已经有四颗连续的同色棋子，再下一步就能连成五。',
            '双四意味着两条必胜线，对手只能挡一条，这同样被视为过于强势的违规招法。'
        ],
        boardDemo: {
            stones: [
                { x: 5, y: 7, color: 'black' },
                { x: 6, y: 7, color: 'black' },
                { x: 8, y: 7, color: 'black' },
                { x: 7, y: 5, color: 'black' },
                { x: 7, y: 6, color: 'black' },
                { x: 7, y: 8, color: 'black' }
            ],
            forbiddenPoint: { x: 7, y: 7 },
            highlightLines: [
                [{ x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }],  // 横向四
                [{ x: 7, y: 5 }, { x: 7, y: 6 }, { x: 7, y: 7 }, { x: 7, y: 8 }]   // 纵向四
            ],
            annotation: '如果黑棋下在★处，会同时形成两条"四"'
        }
    },
    {
        id: 'overline',
        title: '第三课：长连禁手',
        speaker: 'YI',
        content: [
            '长连禁手：黑棋连成的棋子必须刚好是五颗，超过五颗（六连或更多）也算禁手。',
            '这是连珠区别于普通五子棋的重要规则之一。',
            '在普通五子棋中，六连七连都算赢；但在连珠中，黑棋必须精确控制，不能"过头"。'
        ],
        boardDemo: {
            stones: [
                { x: 4, y: 7, color: 'black' },
                { x: 5, y: 7, color: 'black' },
                { x: 6, y: 7, color: 'black' },
                { x: 8, y: 7, color: 'black' },
                { x: 9, y: 7, color: 'black' }
            ],
            forbiddenPoint: { x: 7, y: 7 },
            highlightLines: [
                [{ x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }]
            ],
            annotation: '如果黑棋下在★处，会形成六连——这是长连禁手'
        }
    },
    {
        id: 'summary',
        title: '课堂总结',
        speaker: 'YI',
        content: [
            '总结一下：黑棋有三种禁手——三三、四四、长连。',
            '本关是教学模式，你下到禁手点时我会阻止并提示，但不会直接判负。',
            '等你准备好了，我们就开始实战。在对局中，试着主动识别和避开这些禁手点吧。'
        ],
        boardDemo: null
    }
];

// 教学课程对话引入
const FORBIDDEN_LESSON_INTRO = {
    speaker: 'YI',
    text: '在开始对局之前，我想先给你上一堂简短的"禁手课"。这会帮助你理解为什么有些落点被标记为危险。'
};

// 教学课程结束语
const FORBIDDEN_LESSON_OUTRO = {
    speaker: 'YI',
    text: '好，禁手课到此结束。接下来就是实战了——记住刚才学的内容，当心那些看起来很诱人的"双重威胁"点。'
};

// 禁手教学文案（第3关使用）
const FORBIDDEN_TUTORIAL_TEXT = {
    doubleThree: {
        title: '禁手提示：这里是"三三禁手"',
        bodyLines: [
            '在连珠的正式规则里，黑棋不能一步同时形成两个"活三"（也就是两条都有机会连成五的三连形）。',
            '这一手在古老棋谱里被记为危险手——抢得太猛，反而破坏了平衡。',
            '本关是教学关，不会因此判负，你可以换个更稳妥的点再下。'
        ],
        toast: '⚠️ 三三禁手：黑棋不能一步形成两个活三。'
    },
    doubleFour: {
        title: '禁手提示：这里是"四四禁手"',
        bodyLines: [
            '刚才这一步，会让你同时拥有两条"活四"，在连珠规则中，这种双重致命威胁属于黑棋禁手。',
            '换句话说：黑棋不能一步下出"两个必杀威胁"。',
            '本关只做提示，不会判负，请尝试选择更细腻的进攻方式。'
        ],
        toast: '⚠️ 四四禁手：黑棋不能一步形成两个活四。'
    },
    overline: {
        title: '禁手提示：这里是"长连禁手"',
        bodyLines: [
            '在连珠规则里，黑棋只能"正好五连"，像你刚才这样超过五个的长连，反而会被判为禁手。',
            '这也是连珠和普通五子棋的最大区别之一：先手必须克制，而不是一味延长。',
            '本关不会因此判负，你可以退一步，找一个刚好连五的落点。'
        ],
        toast: '⚠️ 长连禁手：黑棋只能刚好连五，长连会被判禁手。'
    }
};

// 禁手判负文案（第6/7关使用）
const FORBIDDEN_LOSE_TEXT = {
    doubleThree: {
        title: '禁手判负',
        reasonLines: [
            '你刚才的落子被判定为「三三禁手」。',
            '黑棋一步同时形成两条有机会连成五的"三连"，在连珠正式规则中会直接判黑方负。'
        ]
    },
    doubleFour: {
        title: '禁手判负',
        reasonLines: [
            '你刚才的落子被判定为「四四禁手」。',
            '一步制造两条"活四"的双重必杀，在正式对局中是不被允许的。'
        ]
    },
    overline: {
        title: '禁手判负',
        reasonLines: [
            '你刚才的落子被判定为「长连禁手」。',
            '连珠只承认刚好五连，超过五子的长连会被视作破坏平衡的违规落子。'
        ]
    }
};

// 关卡特定的额外说明
const FORBIDDEN_LEVEL_EXTRA = {
    6: '在火山口的规则里，每一步都要为平衡负责。请带着这次教训，再试一次逆风翻盘。',
    7: '在终章考核中，任何一次禁手都会被记入段位记录。等你准备好，我们再来一次正式的答案。'
};

// 导出到全局
window.ForbiddenType = ForbiddenType;
window.FORBIDDEN_TUTORIAL_TEXT = FORBIDDEN_TUTORIAL_TEXT;
window.FORBIDDEN_LOSE_TEXT = FORBIDDEN_LOSE_TEXT;
window.FORBIDDEN_LEVEL_EXTRA = FORBIDDEN_LEVEL_EXTRA;
window.FORBIDDEN_LESSON_PAGES = FORBIDDEN_LESSON_PAGES;
window.FORBIDDEN_LESSON_INTRO = FORBIDDEN_LESSON_INTRO;
window.FORBIDDEN_LESSON_OUTRO = FORBIDDEN_LESSON_OUTRO;
