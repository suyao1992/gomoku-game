/**
 * 点赞路由
 */

import { success, error, generateId } from '../utils/response.js';
import { createNotification } from './notifications.js';

export function likesRoutes(router) {
    // 点赞/取消点赞
    router.post('/api/likes', async (request, context) => {
        try {
            if (!context.user) {
                return error('请先登录', 401);
            }

            const body = await request.json();
            const { targetType, targetId } = body;

            if (!targetType || !['post', 'comment'].includes(targetType)) {
                return error('无效的目标类型');
            }

            if (!targetId) {
                return error('目标ID不能为空');
            }

            const { DB } = context.env;
            const userId = context.user.id;

            // 检查目标是否存在
            if (targetType === 'post') {
                const post = await DB.prepare(`
                    SELECT id FROM posts WHERE id = ? AND status = 'active'
                `).bind(targetId).first();
                if (!post) {
                    return error('帖子不存在', 404);
                }
            } else {
                const comment = await DB.prepare(`
                    SELECT id FROM comments WHERE id = ? AND status = 'active'
                `).bind(targetId).first();
                if (!comment) {
                    return error('评论不存在', 404);
                }
            }

            // 检查是否已点赞
            const existingLike = await DB.prepare(`
                SELECT id FROM likes 
                WHERE target_type = ? AND target_id = ? AND user_id = ?
            `).bind(targetType, targetId, userId).first();

            if (existingLike) {
                // 取消点赞
                await DB.prepare(`
                    DELETE FROM likes WHERE id = ?
                `).bind(existingLike.id).run();

                // 更新计数
                const table = targetType === 'post' ? 'posts' : 'comments';
                await DB.prepare(`
                    UPDATE ${table} SET likes_count = likes_count - 1 WHERE id = ?
                `).bind(targetId).run();

                return success({ liked: false, action: 'unliked' });
            } else {
                // 添加点赞
                const id = generateId();
                await DB.prepare(`
                    INSERT INTO likes (id, target_type, target_id, user_id, created_at)
                    VALUES (?, ?, ?, ?, ?)
                `).bind(id, targetType, targetId, userId, Date.now()).run();

                // 更新计数
                const table = targetType === 'post' ? 'posts' : 'comments';
                await DB.prepare(`
                    UPDATE ${table} SET likes_count = likes_count + 1 WHERE id = ?
                `).bind(targetId).run();

                // 发送点赞通知
                try {
                    let targetUserId = null;
                    let postId = targetId;

                    if (targetType === 'post') {
                        const post = await DB.prepare(`
                            SELECT user_id FROM posts WHERE id = ?
                        `).bind(targetId).first();
                        targetUserId = post?.user_id;
                    } else {
                        const comment = await DB.prepare(`
                            SELECT user_id, post_id FROM comments WHERE id = ?
                        `).bind(targetId).first();
                        targetUserId = comment?.user_id;
                        postId = comment?.post_id;
                    }

                    // 不给自己发通知
                    if (targetUserId && targetUserId !== userId) {
                        await createNotification(DB, {
                            userId: targetUserId,
                            type: 'like',
                            title: `${context.user.name} 赞了你的${targetType === 'post' ? '帖子' : '评论'}`,
                            fromUserId: context.user.id,
                            fromUserName: context.user.name,
                            targetType: targetType,
                            targetId: targetId,
                            postId: postId
                        });
                    }
                } catch (notifErr) {
                    console.error('Like notification error:', notifErr);
                }

                return success({ liked: true, action: 'liked' });
            }
        } catch (err) {
            console.error('Like error:', err);
            return error('操作失败', 500);
        }
    });

    // 举报内容
    router.post('/api/reports', async (request, context) => {
        try {
            if (!context.user) {
                return error('请先登录', 401);
            }

            const body = await request.json();
            const { targetType, targetId, reason, details } = body;

            if (!targetType || !['post', 'comment', 'user'].includes(targetType)) {
                return error('无效的举报类型');
            }

            if (!targetId) {
                return error('举报目标不能为空');
            }

            if (!reason) {
                return error('请选择举报原因');
            }

            const { DB } = context.env;
            const id = generateId();

            await DB.prepare(`
                INSERT INTO reports (id, target_type, target_id, reporter_id, reason, details, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(id, targetType, targetId, context.user.id, reason, details || null, Date.now()).run();

            return success({ reported: true, id });
        } catch (err) {
            console.error('Report error:', err);
            return error('举报失败', 500);
        }
    });
}
