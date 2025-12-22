// forbiddenTexts.js
// ================================
// 禁手类型与文案配置：已迁移到 Localization 系统
// ================================

// 禁手类型枚举
const ForbiddenType = {
    DOUBLE_THREE: 'doubleThree',
    DOUBLE_FOUR: 'doubleFour',
    OVERLINE: 'overline'
};

// ========== 教学课程配置 ==========

// 教学页面配置 (动态获取)
const getForbiddenLessonPages = () => [
    {
        id: 'intro',
        title: Localization.get('forbidden.lesson.intro.title'),
        speaker: 'YI',
        content: [
            Localization.get('forbidden.lesson.intro.content.0'),
            Localization.get('forbidden.lesson.intro.content.1'),
            Localization.get('forbidden.lesson.intro.content.2')
        ],
        boardDemo: null
    },
    {
        id: ForbiddenType.DOUBLE_THREE,
        title: Localization.get('forbidden.lesson.doubleThree.title'),
        speaker: 'YI',
        content: [
            Localization.get('forbidden.lesson.doubleThree.content.0'),
            Localization.get('forbidden.lesson.doubleThree.content.1'),
            Localization.get('forbidden.lesson.doubleThree.content.2')
        ],
        boardDemo: {
            stones: [
                { x: 7, y: 6, color: 'black' },
                { x: 7, y: 8, color: 'black' },
                { x: 6, y: 7, color: 'black' },
                { x: 8, y: 7, color: 'black' }
            ],
            forbiddenPoint: { x: 7, y: 7 },
            highlightLines: [
                [{ x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }],
                [{ x: 7, y: 6 }, { x: 7, y: 7 }, { x: 7, y: 8 }]
            ],
            annotation: Localization.get('forbidden.lesson.doubleThree.annotation')
        }
    },
    {
        id: ForbiddenType.DOUBLE_FOUR,
        title: Localization.get('forbidden.lesson.doubleFour.title'),
        speaker: 'YI',
        content: [
            Localization.get('forbidden.lesson.doubleFour.content.0'),
            Localization.get('forbidden.lesson.doubleFour.content.1'),
            Localization.get('forbidden.lesson.doubleFour.content.2')
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
                [{ x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }],
                [{ x: 7, y: 5 }, { x: 7, y: 6 }, { x: 7, y: 7 }, { x: 7, y: 8 }]
            ],
            annotation: Localization.get('forbidden.lesson.doubleFour.annotation')
        }
    },
    {
        id: ForbiddenType.OVERLINE,
        title: Localization.get('forbidden.lesson.overline.title'),
        speaker: 'YI',
        content: [
            Localization.get('forbidden.lesson.overline.content.0'),
            Localization.get('forbidden.lesson.overline.content.1'),
            Localization.get('forbidden.lesson.overline.content.2')
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
            annotation: Localization.get('forbidden.lesson.overline.annotation')
        }
    },
    {
        id: 'summary',
        title: Localization.get('forbidden.lesson.summary.title'),
        speaker: 'YI',
        content: [
            Localization.get('forbidden.lesson.summary.content.0'),
            Localization.get('forbidden.lesson.summary.content.1'),
            Localization.get('forbidden.lesson.summary.content.2')
        ],
        boardDemo: null
    }
];

// 导出到全局 (使用 Getter 保证动态性)
Object.defineProperty(window, 'FORBIDDEN_LESSON_PAGES', {
    get: () => getForbiddenLessonPages()
});

Object.defineProperty(window, 'FORBIDDEN_LESSON_INTRO', {
    get: () => ({
        speaker: 'YI',
        text: Localization.get('forbidden.lesson.intro.text')
    })
});

Object.defineProperty(window, 'FORBIDDEN_LESSON_OUTRO', {
    get: () => ({
        speaker: 'YI',
        text: Localization.get('forbidden.lesson.outro.text')
    })
});

Object.defineProperty(window, 'FORBIDDEN_TUTORIAL_TEXT', {
    get: () => ({
        [ForbiddenType.DOUBLE_THREE]: {
            title: Localization.get('forbidden.tutorial.doubleThree.title'),
            bodyLines: [
                Localization.get('forbidden.tutorial.doubleThree.body.0'),
                Localization.get('forbidden.tutorial.doubleThree.body.1'),
                Localization.get('forbidden.tutorial.doubleThree.body.2')
            ],
            toast: Localization.get('forbidden.tutorial.doubleThree.toast')
        },
        [ForbiddenType.DOUBLE_FOUR]: {
            title: Localization.get('forbidden.tutorial.doubleFour.title'),
            bodyLines: [
                Localization.get('forbidden.tutorial.doubleFour.body.0'),
                Localization.get('forbidden.tutorial.doubleFour.body.1'),
                Localization.get('forbidden.tutorial.doubleFour.body.2')
            ],
            toast: Localization.get('forbidden.tutorial.doubleFour.toast')
        },
        [ForbiddenType.OVERLINE]: {
            title: Localization.get('forbidden.tutorial.overline.title'),
            bodyLines: [
                Localization.get('forbidden.tutorial.overline.body.0'),
                Localization.get('forbidden.tutorial.overline.body.1'),
                Localization.get('forbidden.tutorial.overline.body.2')
            ],
            toast: Localization.get('forbidden.tutorial.overline.toast')
        }
    })
});

Object.defineProperty(window, 'FORBIDDEN_LOSE_TEXT', {
    get: () => ({
        [ForbiddenType.DOUBLE_THREE]: {
            title: Localization.get('forbidden.lose.doubleThree.title'),
            reasonLines: [
                Localization.get('forbidden.lose.doubleThree.body.0'),
                Localization.get('forbidden.lose.doubleThree.body.1')
            ]
        },
        [ForbiddenType.DOUBLE_FOUR]: {
            title: Localization.get('forbidden.lose.doubleFour.title'),
            reasonLines: [
                Localization.get('forbidden.lose.doubleFour.body.0'),
                Localization.get('forbidden.lose.doubleFour.body.1')
            ]
        },
        [ForbiddenType.OVERLINE]: {
            title: Localization.get('forbidden.lose.overline.title'),
            reasonLines: [
                Localization.get('forbidden.lose.overline.body.0'),
                Localization.get('forbidden.lose.overline.body.1')
            ]
        }
    })
});

Object.defineProperty(window, 'FORBIDDEN_LEVEL_EXTRA', {
    get: () => ({
        6: Localization.get('forbidden.level.extra.6'),
        7: Localization.get('forbidden.level.extra.7')
    })
});

window.ForbiddenType = ForbiddenType;
