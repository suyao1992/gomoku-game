/**
 * 响应工具函数
 */

/**
 * 成功响应
 */
export function success(data, status = 200) {
    return Response.json({
        success: true,
        data
    }, { status });
}

/**
 * 错误响应
 */
export function error(message, status = 400, details = null) {
    const body = {
        success: false,
        error: message
    };
    if (details) {
        body.details = details;
    }
    return Response.json(body, { status });
}

/**
 * 分页响应
 */
export function paginated(items, total, page, pageSize) {
    return Response.json({
        success: true,
        data: items,
        pagination: {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            hasMore: page * pageSize < total
        }
    });
}

/**
 * 生成唯一ID
 */
export function generateId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}
