/**
 * CORS 中间件
 */

/**
 * 处理 OPTIONS 预检请求
 */
export function handleOptions(request, env) {
    const origin = request.headers.get('Origin');
    const allowedOrigins = (env.ALLOWED_ORIGINS || '*').split(',');

    // Handle null origin (from file:// protocol) or missing origin
    const isAllowed = allowedOrigins.includes('*') ||
        !origin ||
        origin === 'null' ||
        allowedOrigins.includes(origin);

    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': isAllowed ? (origin || '*') : allowedOrigins[0],
            'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id, X-User-Name, X-User-Avatar',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400',
        }
    });
}

/**
 * 为响应添加 CORS 头
 */
export function corsMiddleware(response, env, request) {
    const headers = new Headers(response.headers);
    const allowedOrigins = (env.ALLOWED_ORIGINS || '*').split(',');
    const origin = request?.headers?.get('Origin');

    // Handle null origin (from file:// protocol) - use * when origin is null/missing
    const allowOrigin = origin && origin !== 'null'
        ? (allowedOrigins.includes('*') || allowedOrigins.includes(origin) ? origin : allowedOrigins[0])
        : '*';

    headers.set('Access-Control-Allow-Origin', allowOrigin);
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id, X-User-Name, X-User-Avatar');
    headers.set('Access-Control-Allow-Credentials', 'true');

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}
