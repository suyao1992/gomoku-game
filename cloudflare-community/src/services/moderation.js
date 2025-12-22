/**
 * 内容审核服务
 */

// 默认敏感词 (从数据库加载会覆盖)
const DEFAULT_SENSITIVE_WORDS = [
    '傻逼', '操你妈', 'fuck', 'shit', '废物', '垃圾'
];

/**
 * 审核内容
 */
export async function moderateContent(text, env) {
    const result = {
        passed: true,
        reason: null,
        filteredText: text
    };

    if (!text || typeof text !== 'string') {
        return result;
    }

    // 1. 加载敏感词
    let sensitiveWords = DEFAULT_SENSITIVE_WORDS;
    try {
        const dbWords = await env.DB.prepare(
            'SELECT word, level, replacement FROM sensitive_words'
        ).all();

        if (dbWords.results && dbWords.results.length > 0) {
            sensitiveWords = dbWords.results;
        }
    } catch (error) {
        console.error('Failed to load sensitive words:', error);
    }

    // 2. 检查敏感词
    const lowerText = text.toLowerCase();

    for (const wordItem of sensitiveWords) {
        const word = typeof wordItem === 'string' ? wordItem : wordItem.word;
        const level = typeof wordItem === 'object' ? wordItem.level : 'block';
        const replacement = typeof wordItem === 'object' ? wordItem.replacement : '***';

        if (lowerText.includes(word.toLowerCase())) {
            if (level === 'block') {
                result.passed = false;
                result.reason = '内容包含敏感词，请修改后重试';
                return result;
            } else if (level === 'replace') {
                // 替换敏感词
                const regex = new RegExp(escapeRegex(word), 'gi');
                result.filteredText = result.filteredText.replace(regex, replacement || '***');
            } else if (level === 'warn') {
                // 警告但允许
                result.warned = true;
            }
        }
    }

    // 3. 检查过长重复字符
    if (/(.)\1{9,}/.test(text)) {
        result.passed = false;
        result.reason = '请勿发送重复字符';
        return result;
    }

    // 4. 检查纯表情或无意义内容
    const pureEmoji = /^[\p{Emoji}\s]+$/u.test(text);
    if (pureEmoji && text.length > 20) {
        result.passed = false;
        result.reason = '请输入有意义的文字内容';
        return result;
    }

    return result;
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * HTML 转义
 */
export function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
