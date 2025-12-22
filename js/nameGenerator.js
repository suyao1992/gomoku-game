/**
 * nameGenerator.js - 随机玩家名生成器
 * 支持中文和英文名字池
 */

const NameGenerator = {
    // 中文名字池
    cn: {
        adjectives: [
            '快乐', '勇敢', '神秘', '优雅', '闪电',
            '星空', '清风', '明月', '烈焰', '寒冰',
            '飞翔', '无敌', '逍遥', '潇洒', '机智',
            '聪明', '冷静', '热血', '传奇', '霸气',
            '萌萌', '可爱', '酷酷', '帅气', '天才',
            '超级', '王者', '钻石', '黄金', '白银'
        ],
        nouns: [
            '棋士', '侠客', '剑客', '高手', '少年',
            '战神', '小将', '大师', '天王', '棋圣',
            '小白', '青龙', '白虎', '玄武', '朱雀',
            '骑士', '猎人', '法师', '刺客', '战士',
            '熊猫', '老虎', '狮子', '飞鹰', '猛龙'
        ]
    },

    // 英文名字池
    en: {
        adjectives: [
            'Swift', 'Brave', 'Cool', 'Lucky', 'Magic',
            'Dark', 'Light', 'Fire', 'Ice', 'Storm',
            'Super', 'Mega', 'Ultra', 'Epic', 'Legend',
            'Royal', 'Noble', 'Shadow', 'Bright', 'Golden',
            'Silver', 'Crystal', 'Thunder', 'Iron', 'Steel'
        ],
        nouns: [
            'Player', 'Warrior', 'Master', 'Knight', 'Star',
            'King', 'Queen', 'Hero', 'Hunter', 'Wizard',
            'Ninja', 'Samurai', 'Dragon', 'Phoenix', 'Tiger',
            'Eagle', 'Wolf', 'Bear', 'Lion', 'Hawk',
            'Ace', 'Pro', 'Champ', 'Boss', 'Lord'
        ]
    },

    /**
     * 生成随机名字
     * @param {string} lang - 'cn' 或 'en'
     * @returns {string} 随机生成的名字
     */
    generate(lang = 'cn') {
        const pool = this[lang] || this.cn;
        const adj = pool.adjectives[Math.floor(Math.random() * pool.adjectives.length)];
        const noun = pool.nouns[Math.floor(Math.random() * pool.nouns.length)];

        if (lang === 'en') {
            return adj + noun;
        }
        return adj + noun;
    },

    /**
     * 生成多个备选名字
     * @param {number} count - 生成数量
     * @param {string} lang - 语言
     * @returns {string[]} 名字数组
     */
    generateMultiple(count = 5, lang = 'cn') {
        const names = new Set();
        while (names.size < count) {
            names.add(this.generate(lang));
        }
        return Array.from(names);
    },

    /**
     * 基于原名生成类似名字
     * @param {string} baseName - 原始名字
     * @returns {string[]} 推荐名字数组
     */
    getSimilarNames(baseName) {
        const suggestions = [];

        // 方法1: 添加数字后缀
        for (let i = 1; i <= 3; i++) {
            const num = Math.floor(Math.random() * 100);
            suggestions.push(baseName.slice(0, 6) + num);
        }

        // 方法2: 生成新的随机名
        const isChinese = /[\u4e00-\u9fa5]/.test(baseName);
        const lang = isChinese ? 'cn' : 'en';
        suggestions.push(...this.generateMultiple(2, lang));

        return suggestions;
    },

    /**
     * 验证名字格式
     * @param {string} name - 要验证的名字
     * @returns {{valid: boolean, error?: string}} 验证结果
     */
    validate(name) {
        if (!name || typeof name !== 'string') {
            return { valid: false, error: '请输入昵称' };
        }

        const trimmed = name.trim();

        // 长度检查 (2-8字符)
        if (trimmed.length < 2) {
            return { valid: false, error: '昵称至少2个字符' };
        }
        if (trimmed.length > 8) {
            return { valid: false, error: '昵称最多8个字符' };
        }

        // 字符检查：允许中日韩英文、数字、下划线
        const validPattern = /^[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff\uac00-\ud7afa-zA-Z0-9_]+$/;
        if (!validPattern.test(trimmed)) {
            return { valid: false, error: '昵称只能包含中英日韩文、数字、下划线' };
        }

        // 敏感词检查 (简单版)
        const sensitiveWords = ['admin', 'test', '管理员', '客服', '官方', 'fuck', 'shit'];
        const lowerName = trimmed.toLowerCase();
        for (const word of sensitiveWords) {
            if (lowerName.includes(word.toLowerCase())) {
                return { valid: false, error: '昵称包含敏感词' };
            }
        }

        return { valid: true };
    }
};

// 导出为全局变量
window.NameGenerator = NameGenerator;
