/**
 * 用户路由
 */

import { success, error, generateId } from '../utils/response.js';

export function usersRoutes(router) {
    // 同步用户信息
    router.post('/api/users/sync', async (request, context) => {
        try {
            const body = await request.json();
            const { id, name, avatar, elo } = body;

            if (!id) {
                return error('用户ID不能为空');
            }

            const { DB } = context.env;
            const now = Date.now();

            await DB.prepare(`
                INSERT INTO users (id, name, avatar, elo, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    name = excluded.name,
                    avatar = excluded.avatar,
                    elo = excluded.elo,
                    updated_at = excluded.updated_at
            `).bind(id, name || '匿名用户', avatar || '🎮', elo || 1000, now, now).run();

            return success({ id, synced: true });
        } catch (err) {
            console.error('User sync error:', err);
            return error('同步失败: ' + err.message, 500);
        }
    });

    // 获取用户信息
    router.get('/api/users/:id', async (request, context) => {
        try {
            const { id } = context.params;
            const { DB } = context.env;

            const user = await DB.prepare(`
                SELECT id, name, avatar, elo, created_at
                FROM users WHERE id = ?
            `).bind(id).first();

            if (!user) {
                return error('用户不存在', 404);
            }

            // 获取用户统计
            const stats = await DB.prepare(`
                SELECT 
                    (SELECT COUNT(*) FROM posts WHERE user_id = ? AND status = 'active') as posts_count,
                    (SELECT COUNT(*) FROM comments WHERE user_id = ? AND status = 'active') as comments_count,
                    (SELECT COUNT(*) FROM likes WHERE user_id = ?) as likes_given
            `).bind(id, id, id).first();

            return success({
                ...user,
                stats
            });
        } catch (err) {
            console.error('Get user error:', err);
            return error('获取用户失败', 500);
        }
    });

    // 搜索用户 (用于 @提及)
    router.get('/api/users/search', async (request, context) => {
        try {
            const { DB } = context.env;
            const q = context.url.searchParams.get('q');

            if (!q || q.length < 1) {
                return success([]);
            }

            const result = await DB.prepare(`
                SELECT id, name, avatar 
                FROM users 
                WHERE name LIKE ? 
                ORDER BY updated_at DESC
                LIMIT 10
            `).bind(`%${q}%`).all();

            return success(result.results);
        } catch (err) {
            console.error('Search users error:', err);
            return error('搜索失败', 500);
        }
    });
}
