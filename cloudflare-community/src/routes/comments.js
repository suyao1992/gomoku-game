/**
 * 评论路由
 */

import { success, error, generateId } from '../utils/response.js';
import { required, stringLength } from '../utils/validation.js';
import { moderateContent } from '../services/moderation.js';
import { createNotification } from './notifications.js';

export function commentsRoutes(router) {
    // 获取帖子的评论 (树形结构)
    router.get('/api/posts/:postId/comments', async (request, context) => {
        try {
            const { postId } = context.params;
            const { DB } = context.env;

            // 获取所有评论
            const comments = await DB.prepare(`
                SELECT 
                    c.id, c.parent_id, c.content, c.likes_count, c.created_at,
                    c.reply_to_user_id, c.reply_to_user_name,
                    u.id as user_id, u.name as user_name, u.avatar as user_avatar
                FROM comments c
                LEFT JOIN users u ON c.user_id = u.id
                WHERE c.post_id = ? AND c.status = 'active'
                ORDER BY c.created_at ASC
            `).bind(postId).all();

            // 获取当前用户点赞的评论
            let likedCommentIds = [];
            if (context.user?.id) {
                const commentIds = comments.results.map(c => c.id);
                if (commentIds.length > 0) {
                    const placeholders = commentIds.map(() => '?').join(',');
                    const likedResult = await DB.prepare(`
                        SELECT target_id FROM likes 
                        WHERE target_type = 'comment' AND user_id = ? AND target_id IN (${placeholders})
                    `).bind(context.user.id, ...commentIds).all();
                    likedCommentIds = likedResult.results.map(l => l.target_id);
                }
            }

            // 构建树形结构
            const commentMap = new Map();
            const rootComments = [];

            // 第一遍：创建所有评论对象
            for (const c of comments.results) {
                const comment = {
                    id: c.id,
                    parentId: c.parent_id,
                    content: c.content,
                    likesCount: c.likes_count,
                    createdAt: c.created_at,
                    isLiked: likedCommentIds.includes(c.id),
                    replyTo: c.reply_to_user_name ? {
                        id: c.reply_to_user_id,
                        name: c.reply_to_user_name
                    } : null,
                    author: {
                        id: c.user_id,
                        name: c.user_name,
                        avatar: c.user_avatar
                    },
                    replies: []
                };
                commentMap.set(c.id, comment);
            }

            // 第二遍：构建树
            for (const c of comments.results) {
                const comment = commentMap.get(c.id);
                if (c.parent_id && commentMap.has(c.parent_id)) {
                    commentMap.get(c.parent_id).replies.push(comment);
                } else {
                    rootComments.push(comment);
                }
            }

            return success({
                total: comments.results.length,
                comments: rootComments
            });
        } catch (err) {
            console.error('Get comments error:', err);
            return error('获取评论失败', 500);
        }
    });

    // 添加评论
    router.post('/api/posts/:postId/comments', async (request, context) => {
        try {
            if (!context.user) {
                return error('请先登录', 401);
            }

            const { postId } = context.params;
            const body = await request.json();
            const { content, parentId, replyToUserId, replyToUserName } = body;

            // 校验
            required(content, '评论内容');
            stringLength(content, '评论内容', 1, 500);

            // 内容审核
            const contentCheck = await moderateContent(content, context.env);
            if (!contentCheck.passed) {
                return error(contentCheck.reason);
            }

            const { DB } = context.env;

            // 检查帖子是否存在
            const post = await DB.prepare(`
                SELECT id FROM posts WHERE id = ? AND status = 'active'
            `).bind(postId).first();

            if (!post) {
                return error('帖子不存在', 404);
            }

            // 如果有父评论，检查是否存在
            if (parentId) {
                const parentComment = await DB.prepare(`
                    SELECT id FROM comments WHERE id = ? AND post_id = ? AND status = 'active'
                `).bind(parentId, postId).first();

                if (!parentComment) {
                    return error('回复的评论不存在', 404);
                }
            }

            const id = generateId();
            const now = Date.now();

            // 插入评论
            await DB.prepare(`
                INSERT INTO comments (
                    id, post_id, parent_id, reply_to_user_id, reply_to_user_name,
                    user_id, content, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                id,
                postId,
                parentId || null,
                replyToUserId || null,
                replyToUserName || null,
                context.user.id,
                contentCheck.filteredText,
                now
            ).run();

            // 更新帖子评论数
            await DB.prepare(`
                UPDATE posts SET comments_count = comments_count + 1, updated_at = ? WHERE id = ?
            `).bind(now, postId).run();

            // 发送通知
            try {
                // 获取帖子作者信息
                const postInfo = await DB.prepare(`
                    SELECT user_id, title FROM posts WHERE id = ?
                `).bind(postId).first();

                // 如果是回复评论，通知被回复的用户
                if (replyToUserId && replyToUserId !== context.user.id) {
                    await createNotification(DB, {
                        userId: replyToUserId,
                        type: 'reply',
                        title: `${context.user.name} 回复了你的评论`,
                        content: contentCheck.filteredText.substring(0, 50),
                        fromUserId: context.user.id,
                        fromUserName: context.user.name,
                        targetType: 'comment',
                        targetId: parentId,
                        postId: postId
                    });
                }

                // 通知帖子作者（如果不是自己评论自己的帖子，且不是回复）
                if (postInfo && postInfo.user_id !== context.user.id && !replyToUserId) {
                    await createNotification(DB, {
                        userId: postInfo.user_id,
                        type: 'comment',
                        title: `${context.user.name} 评论了你的帖子`,
                        content: contentCheck.filteredText.substring(0, 50),
                        fromUserId: context.user.id,
                        fromUserName: context.user.name,
                        targetType: 'post',
                        targetId: postId,
                        postId: postId
                    });
                }
            } catch (notifErr) {
                console.error('Create notification error:', notifErr);
                // 不影响评论创建
            }

            return success({
                id,
                content: contentCheck.filteredText,
                createdAt: now,
                author: context.user
            }, 201);
        } catch (err) {
            console.error('Create comment error:', err);
            if (err.name === 'ValidationError') {
                return error(err.message);
            }
            return error('发表评论失败', 500);
        }
    });

    // 删除评论
    router.delete('/api/comments/:id', async (request, context) => {
        try {
            if (!context.user) {
                return error('请先登录', 401);
            }

            const { id } = context.params;
            const { DB } = context.env;

            // 检查权限
            const comment = await DB.prepare(`
                SELECT user_id, post_id FROM comments WHERE id = ?
            `).bind(id).first();

            if (!comment) {
                return error('评论不存在', 404);
            }

            if (comment.user_id !== context.user.id) {
                return error('无权删除此评论', 403);
            }

            await DB.prepare(`
                UPDATE comments SET status = 'deleted' WHERE id = ?
            `).bind(id).run();

            // 更新帖子评论数
            await DB.prepare(`
                UPDATE posts SET comments_count = comments_count - 1 WHERE id = ?
            `).bind(comment.post_id).run();

            return success({ deleted: true });
        } catch (err) {
            console.error('Delete comment error:', err);
            return error('删除评论失败', 500);
        }
    });
}
