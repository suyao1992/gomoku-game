// nameGenerator.js - 随机名字生成器
// ==========================================

const NameGenerator = {
    // 随机获取一个名字
    // @param {string} lang - 'cn' 为中文, 'en' 为英文, 默认根据当前语言
    generate(lang) {
        // 确定使用的语言
        const targetLang = lang || Localization.currentLang || 'zh';
        const isEnglish = (targetLang === 'en');

        // 直接从 translations 获取指定语言的词库
        // 注意: Localization.get() 只返回当前语言,不支持参数,所以必须直接访问 translations
        const langData = Localization.translations[targetLang] || Localization.translations['zh'];
        const adjs = langData['name.gen.adj'] || ['Happy'];
        const nouns = langData['name.gen.noun'] || ['Player'];

        // 随机决定生成策略: 50% 两词组合, 50% 三词组合
        const useThreeWords = Math.random() < 0.5;

        let name;
        if (useThreeWords) {
            // 三词组合: 随机选择两种模式
            const adj1 = adjs[Math.floor(Math.random() * adjs.length)];
            const adj2 = adjs[Math.floor(Math.random() * adjs.length)];
            const noun = nouns[Math.floor(Math.random() * nouns.length)];

            if (Math.random() < 0.5) {
                // 模式1: 形容词+形容词+名词
                name = isEnglish ? `${adj1} ${adj2} ${noun}` : `${adj1}${adj2}${noun}`;
            } else {
                // 模式2: 形容词+名词+名词 (选另一个名词)
                const noun2 = nouns[Math.floor(Math.random() * nouns.length)];
                name = isEnglish ? `${adj1} ${noun} ${noun2}` : `${adj1}${noun}${noun2}`;
            }
        } else {
            // 两词组合: 形容词+名词
            const adj = adjs[Math.floor(Math.random() * adjs.length)];
            const noun = nouns[Math.floor(Math.random() * nouns.length)];
            name = isEnglish ? `${adj} ${noun}` : `${adj}${noun}`;
        }

        // 验证长度 (不含空格): 2-8个字符
        const nameWithoutSpaces = name.replace(/\s+/g, '');
        if (nameWithoutSpaces.length < 2 || nameWithoutSpaces.length > 8) {
            // 如果超出范围,回退到简单的两词组合
            const adj = adjs[Math.floor(Math.random() * adjs.length)];
            const noun = nouns[Math.floor(Math.random() * nouns.length)];
            name = isEnglish ? `${adj} ${noun}` : `${adj}${noun}`;
        }

        return name;
    },

    // 验证名字格式
    validate(name) {
        if (!name || name.trim().length === 0) {
            return { valid: false, error: Localization.get('onboarding.hint') || '名字不能为空' };
        }

        const trimmed = name.trim();
        // 移除空格后计算长度
        const lengthWithoutSpaces = trimmed.replace(/\s+/g, '').length;

        if (lengthWithoutSpaces < 2 || lengthWithoutSpaces > 8) {
            return { valid: false, error: '名字长度应在2-8个字符之间' };
        }

        // 只允许中文、英文字母、数字和下划线
        if (!/^[\u4e00-\u9fa5a-zA-Z0-9_\s]+$/.test(trimmed)) {
            return { valid: false, error: '名字只能包含中文、英文、数字和下划线' };
        }

        return { valid: true };
    }
};

window.NameGenerator = NameGenerator;
