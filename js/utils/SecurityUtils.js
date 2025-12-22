/**
 * 安全工具类 - 防止XSS和注入攻击
 */
class SecurityUtils {
    /**
     * HTML转义 - 防止XSS攻击
     * @param {string} str - 需要转义的字符串
     * @returns {string} 转义后的安全字符串
     */
    static escapeHTML(str) {
        if (typeof str !== 'string') return str;

        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;'
        };

        return String(str).replace(/[&<>"'\/]/g, s => map[s]);
    }

    /**
     * 验证并清理用户名
     * @param {string} name - 用户输入的名字
     * @param {number} maxLength - 最大长度
     * @returns {string} 清理后的名字
     */
    static sanitizeName(name, maxLength = 8) {
        if (typeof name !== 'string') return '玩家';

        // 移除HTML标签和特殊字符
        let cleaned = name.replace(/[<>\"'\/\\]/g, '');

        // 限制长度
        cleaned = cleaned.slice(0, maxLength).trim();

        // 如果为空，返回默认值
        return cleaned || '玩家';
    }

    /**
     * 验证URL是否安全
     * @param {string} url - 要验证的URL
     * @param {string} defaultUrl - 默认URL
     * @returns {string} 安全的URL
     */
    static sanitizeImageURL(url, defaultUrl = 'assets/default.jpg') {
        if (typeof url !== 'string') return defaultUrl;

        try {
            // 允许相对路径
            if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
                return url;
            }

            // 验证完整URL
            const parsed = new URL(url, window.location.origin);

            // 只允许https和http (本地开发)
            if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
                return url;
            }
        } catch (e) {
            console.warn('[Security] Invalid URL:', url);
        }

        return defaultUrl;
    }

    /**
     * 清理Firebase路径字符
     * Firebase不允许的字符: . $ # [ ] /
     * @param {string} str - 需要清理的字符串
     * @returns {string} 清理后的字符串
     */
    static sanitizeForFirebase(str) {
        if (typeof str !== 'string') return '';

        return String(str)
            .replace(/[.$#\[\]\/]/g, '')
            .slice(0, 50);
    }

    /**
     * 安全地解析JSON
     * @param {string} jsonStr - JSON字符串
     * @param {any} defaultValue - 解析失败时的默认值
     * @returns {any} 解析结果或默认值
     */
    static safeJSONParse(jsonStr, defaultValue = null) {
        try {
            return JSON.parse(jsonStr);
        } catch (e) {
            console.warn('[Security] Invalid JSON:', e);
            return defaultValue;
        }
    }

    /**
     * 验证并清理整数
     * @param {any} value - 要验证的值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @param {number} defaultValue - 默认值
     * @returns {number} 验证后的整数
     */
    static sanitizeInteger(value, min = 0, max = Number.MAX_SAFE_INTEGER, defaultValue = 0) {
        const parsed = parseInt(value);

        if (isNaN(parsed) || parsed < min || parsed > max) {
            console.warn('[Security] Invalid integer value:', value);
            return defaultValue;
        }

        return parsed;
    }

    /**
     * 生成加密安全的随机ID
     * @returns {string} 随机ID
     */
    static generateSecureRandomId() {
        if (window.crypto && window.crypto.getRandomValues) {
            const array = new Uint32Array(1);
            crypto.getRandomValues(array);
            return (100000 + array[0] % 900000).toString();
        } else {
            // 降级到Math.random (不够安全但兼容性好)
            return Math.floor(100000 + Math.random() * 900000).toString();
        }
    }

    /**
     * 频率限制器
     */
    static createRateLimiter(maxRequests, windowMs) {
        return new RateLimiter(maxRequests, windowMs);
    }
}

/**
 * 频率限制器类
 */
class RateLimiter {
    constructor(maxRequests, windowMs) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = [];
    }

    canProceed(action = 'default') {
        const now = Date.now();

        // 清理过期的请求记录
        this.requests = this.requests.filter(req =>
            now - req.time < this.windowMs
        );

        // 检查是否超限
        const actionRequests = this.requests.filter(req => req.action === action);
        if (actionRequests.length >= this.maxRequests) {
            return false;
        }

        // 记录新请求
        this.requests.push({ action, time: now });
        return true;
    }

    reset() {
        this.requests = [];
    }
}

// 导出到全局
window.SecurityUtils = SecurityUtils;
window.RateLimiter = RateLimiter;
