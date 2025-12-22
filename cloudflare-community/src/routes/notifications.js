/**
 * 通知路由
 */

import { success, error, paginated, generateId } from '../utils/response.js';
import { parsePagination } from '../utils/validation.js';

export function notificationsRoutes(router) {
    // 获取通知列表
    router.get('/api/notifications', async (request, context) => {
        try {
            const userId = request.headers.get('X-User-Id');
            if (!userId) {
                return error('未提供用户ID', 401);
            }

            const { DB } = context.env;
            const { page, limit, offset } = parsePagination(context.url);

            // 获取通知总数
            const countResult = await DB.prepare(`
                SELECT COUNT(*) as total FROM notifications WHERE user_id = ?
            `).bind(userId).first();

            // 获取通知列表
            const result = await DB.prepare(`
                SELECT * FROM notifications 
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            `).bind(userId, limit, offset).all();

            return paginated(result.results, {
                page,
                limit,
                total: countResult.total
            });
        } catch (err) {
            console.error('Get notifications error:', err);
            return error('获取通知失败', 500);
        }
    });

    // 获取未读通知数量
    router.get('/api/notifications/unread-count', async (request, context) => {
        try {
            const userId = request.headers.get('X-User-Id');
            if (!userId) {
                return error('未提供用户ID', 401);
            }

            const { DB } = context.env;
            const result = await DB.prepare(`
                SELECT COUNT(*) as count FROM notifications 
                WHERE user_id = ? AND is_read = 0
            `).bind(userId).first();

            return success({ count: result.count });
        } catch (err) {
            console.error('Get unread count error:', err);
            return error('获取未读数失败', 500);
        }
    });

    // 标记单条通知已读
    router.post('/api/notifications/read/:id', async (request, context) => {
        try {
            const userId = request.headers.get('X-User-Id');
            if (!userId) {
                return error('未提供用户ID', 401);
            }

            const { id } = context.params;
            const { DB } = context.env;

            await DB.prepare(`
                UPDATE notifications SET is_read = 1 
                WHERE id = ? AND user_id = ?
            `).bind(id, userId).run();

            return success({ read: true });
        } catch (err) {
            console.error('Mark read error:', err);
            return error('标记失败', 500);
        }
    });

    // 全部标记已读
    router.post('/api/notifications/read-all', async (request, context) => {
        try {
            const userId = request.headers.get('X-User-Id');
            if (!userId) {
                return error('未提供用户ID', 401);
            }

            const { DB } = context.env;
            await DB.prepare(`
                UPDATE notifications SET is_read = 1 WHERE user_id = ?
            `).bind(userId).run();

            return success({ readAll: true });
        } catch (err) {
            console.error('Mark all read error:', err);
            return error('标记失败', 500);
        }
    });

    // 删除通知
    router.delete('/api/notifications/:id', async (request, context) => {
        try {
            const userId = request.headers.get('X-User-Id');
            if (!userId) {
                return error('未提供用户ID', 401);
            }

            const { id } = context.params;
            const { DB } = context.env;

            await DB.prepare(`
                DELETE FROM notifications WHERE id = ? AND user_id = ?
            `).bind(id, userId).run();

            return success({ deleted: true });
        } catch (err) {
            console.error('Delete notification error:', err);
            return error('删除失败', 500);
        }
    });
}

// 辅助函数：创建通知
export async function createNotification(DB, data) {
    const id = 'notif-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const now = Date.now();

    try {
        await DB.prepare(`
            INSERT INTO notifications (
                id, user_id, type, title, content,
                from_user_id, from_user_name, target_type, target_id, post_id,
                is_read, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
        `).bind(
            id,
            data.userId,
            data.type,
            data.title,
            data.content || null,
            data.fromUserId || null,
            data.fromUserName || null,
            data.targetType || null,
            data.targetId || null,
            data.postId || null,
            now
        ).run();

        return id;
    } catch (err) {
        console.error('Create notification error:', err);
        return null;
    }
}
