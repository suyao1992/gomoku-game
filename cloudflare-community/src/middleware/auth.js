/**
 * 用户认证中间件
 * 从请求头提取用户信息
 */

export async function authMiddleware(request, context) {
    // 从请求头获取用户信息
    const userId = request.headers.get('X-User-Id');
    const userName = request.headers.get('X-User-Name');
    const userAvatar = request.headers.get('X-User-Avatar');

    if (userId) {
        context.user = {
            id: userId,
            name: userName ? decodeURIComponent(userName) : '匿名用户',
            avatar: userAvatar ? decodeURIComponent(userAvatar) : '🎮'
        };

        // 确保用户存在于数据库 (upsert)
        try {
            const { DB } = context.env;
            const now = Date.now();

            await DB.prepare(`
                INSERT INTO users (id, name, avatar, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    name = excluded.name,
                    avatar = excluded.avatar,
                    updated_at = excluded.updated_at
            `).bind(userId, context.user.name, context.user.avatar, now, now).run();
        } catch (error) {
            console.error('User sync error:', error);
        }
    }
}
