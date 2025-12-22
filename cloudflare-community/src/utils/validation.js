/**
 * 参数校验工具
 */

/**
 * 必填字段校验
 */
export function required(value, fieldName) {
    if (value === undefined || value === null || value === '') {
        throw new ValidationError(`${fieldName} 是必填项`);
    }
    return value;
}

/**
 * 字符串长度校验
 */
export function stringLength(value, fieldName, min, max) {
    if (typeof value !== 'string') {
        throw new ValidationError(`${fieldName} 必须是字符串`);
    }
    if (value.length < min) {
        throw new ValidationError(`${fieldName} 至少需要 ${min} 个字符`);
    }
    if (value.length > max) {
        throw new ValidationError(`${fieldName} 最多 ${max} 个字符`);
    }
    return value;
}

/**
 * 枚举值校验
 */
export function enumValue(value, fieldName, allowedValues) {
    if (!allowedValues.includes(value)) {
        throw new ValidationError(`${fieldName} 必须是以下值之一: ${allowedValues.join(', ')}`);
    }
    return value;
}

/**
 * 数组校验
 */
export function array(value, fieldName, maxLength = 10) {
    if (!Array.isArray(value)) {
        throw new ValidationError(`${fieldName} 必须是数组`);
    }
    if (value.length > maxLength) {
        throw new ValidationError(`${fieldName} 最多包含 ${maxLength} 项`);
    }
    return value;
}

/**
 * 校验错误类
 */
export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.status = 400;
    }
}

/**
 * 解析查询参数
 */
export function parseQueryParams(url) {
    const params = {};
    for (const [key, value] of url.searchParams.entries()) {
        params[key] = value;
    }
    return params;
}

/**
 * 解析分页参数
 */
export function parsePagination(url) {
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(url.searchParams.get('pageSize') || '20'), 50);
    return {
        page: Math.max(1, page),
        pageSize,
        offset: (Math.max(1, page) - 1) * pageSize
    };
}
