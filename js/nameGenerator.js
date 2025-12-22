// nameGenerator.js - 随机名字生成器
// ==========================================

const NameGenerator = {
    // 随机获取一个名字
    generate() {
        const adjs = Localization.get('name.gen.adj') || ['Happy'];
        const nouns = Localization.get('name.gen.noun') || ['Player'];

        const adj = adjs[Math.floor(Math.random() * adjs.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];

        // 对于中文环境，通常不加空格；对于英文环境，加个空格更好看
        const isEnglish = (Localization.currentLang === 'en');
        return isEnglish ? `${adj} ${noun}` : `${adj}${noun}`;
    }
};

window.NameGenerator = NameGenerator;
