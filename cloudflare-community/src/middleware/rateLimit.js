/**
 * 频率限制中间件
 * 基于 IP 的简单限流
 */

// 内存存储 (Worker 重启后重置)
const rateLimitStore = new Map();

export async function rateLimitMiddleware(request, context) {
    const { env } = context;
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const windowMs = parseInt(env.RATE_LIMIT_WINDOW || '60') * 1000;
    const maxRequests = parseInt(env.RATE_LIMIT_MAX || '30');

    const now = Date.now();
    const key = `rate:${ip}`;

    // 获取或创建记录
    let record = rateLimitStore.get(key);

    if (!record || now - record.windowStart > windowMs) {
        // 新窗口
        record = {
            windowStart: now,
            count: 1
        };
        rateLimitStore.set(key, record);
    } else {
        // 增加计数
        record.count++;
    }

    // 检查是否超限
    if (record.count > maxRequests) {
        const retryAfter = Math.ceil((record.windowStart + windowMs - now) / 1000);
        return Response.json(
            {
                error: 'Too Many Requests',
                message: '请求太频繁，请稍后再试',
                retryAfter
            },
            {
                status: 429,
                headers: {
                    'Retry-After': retryAfter.toString()
                }
            }
        );
    }

    // 清理过期记录 (每100次请求清理一次)
    if (Math.random() < 0.01) {
        for (const [k, v] of rateLimitStore.entries()) {
            if (now - v.windowStart > windowMs * 2) {
                rateLimitStore.delete(k);
            }
        }
    }

    return null; // 通过
}
