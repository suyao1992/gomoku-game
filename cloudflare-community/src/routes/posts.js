/**
 * 帖子路由
 */

import { success, error, paginated, generateId } from '../utils/response.js';
import { required, stringLength, enumValue, parsePagination } from '../utils/validation.js';
import { moderateContent, escapeHtml } from '../services/moderation.js';

export function postsRoutes(router) {
    // 获取帖子列表
    router.get('/api/posts', async (request, context) => {
        try {
            const { DB } = context.env;
            const { url } = context;
            const { page, pageSize, offset } = parsePagination(url);

            const type = url.searchParams.get('type'); // discussion, battle, replay, announcement
            const status = 'active'; // 只显示活跃帖子

            // 构建查询
            let whereClause = 'WHERE p.status = ?';
            const params = [status];

            if (type && type !== 'all') {
                whereClause += ' AND p.type = ?';
                params.push(type);
            }

            // 获取总数
            const countResult = await DB.prepare(`
                SELECT COUNT(*) as total FROM posts p ${whereClause}
            `).bind(...params).first();

            // 获取帖子列表 (置顶优先，然后按时间倒序)
            const posts = await DB.prepare(`
                SELECT 
                    p.id, p.type, p.title, p.content, p.images,
                    p.battle_config, p.battle_status, p.battle_room_code,
                    p.likes_count, p.comments_count, p.views_count,
                    p.is_pinned, p.created_at,
                    u.id as user_id, u.name as user_name, u.avatar as user_avatar, u.elo as user_elo
                FROM posts p
                LEFT JOIN users u ON p.user_id = u.id
                ${whereClause}
                ORDER BY p.is_pinned DESC, p.created_at DESC
                LIMIT ? OFFSET ?
            `).bind(...params, pageSize, offset).all();

            // 如果用户已登录，检查是否点赞过
            const userId = context.user?.id;
            let likedPostIds = [];

            if (userId && posts.results.length > 0) {
                const postIds = posts.results.map(p => p.id);
                const placeholders = postIds.map(() => '?').join(',');
                const likedResult = await DB.prepare(`
                    SELECT target_id FROM likes 
                    WHERE target_type = 'post' AND user_id = ? AND target_id IN (${placeholders})
                `).bind(userId, ...postIds).all();

                likedPostIds = likedResult.results.map(l => l.target_id);
            }

            // 格式化返回数据
            const formattedPosts = posts.results.map(post => ({
                id: post.id,
                type: post.type,
                title: post.title,
                content: post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content,
                images: post.images ? JSON.parse(post.images) : [],
                battleConfig: post.battle_config ? JSON.parse(post.battle_config) : null,
                battleStatus: post.battle_status,
                battleRoomCode: post.battle_room_code,
                likesCount: post.likes_count,
                commentsCount: post.comments_count,
                viewsCount: post.views_count,
                isPinned: !!post.is_pinned,
                createdAt: post.created_at,
                isLiked: likedPostIds.includes(post.id),
                author: {
                    id: post.user_id,
                    name: post.user_name,
                    avatar: post.user_avatar,
                    elo: post.user_elo
                }
            }));

            return paginated(formattedPosts, countResult.total, page, pageSize);
        } catch (err) {
            console.error('Get posts error:', err);
            return error('获取帖子失败: ' + err.message, 500);
        }
    });

    // 获取帖子详情
    router.get('/api/posts/:id', async (request, context) => {
        try {
            const { id } = context.params;
            const { DB } = context.env;

            const post = await DB.prepare(`
                SELECT 
                    p.*,
                    u.id as user_id, u.name as user_name, u.avatar as user_avatar, u.elo as user_elo
                FROM posts p
                LEFT JOIN users u ON p.user_id = u.id
                WHERE p.id = ? AND p.status = 'active'
            `).bind(id).first();

            if (!post) {
                return error('帖子不存在', 404);
            }

            // 增加浏览量
            await DB.prepare(`
                UPDATE posts SET views_count = views_count + 1 WHERE id = ?
            `).bind(id).run();

            // 检查当前用户是否点赞
            let isLiked = false;
            if (context.user?.id) {
                const likeCheck = await DB.prepare(`
                    SELECT 1 FROM likes WHERE target_type = 'post' AND target_id = ? AND user_id = ?
                `).bind(id, context.user.id).first();
                isLiked = !!likeCheck;
            }

            return success({
                id: post.id,
                type: post.type,
                title: post.title,
                content: post.content,
                images: post.images ? JSON.parse(post.images) : [],
                battleConfig: post.battle_config ? JSON.parse(post.battle_config) : null,
                battleStatus: post.battle_status,
                battleRoomCode: post.battle_room_code,
                replayData: post.replay_data ? JSON.parse(post.replay_data) : null,
                likesCount: post.likes_count,
                commentsCount: post.comments_count,
                viewsCount: post.views_count + 1,
                isPinned: !!post.is_pinned,
                createdAt: post.created_at,
                isLiked,
                author: {
                    id: post.user_id,
                    name: post.user_name,
                    avatar: post.user_avatar,
                    elo: post.user_elo
                }
            });
        } catch (err) {
            console.error('Get post error:', err);
            return error('获取帖子失败', 500);
        }
    });

    // 创建帖子
    router.post('/api/posts', async (request, context) => {
        try {
            if (!context.user) {
                return error('请先登录', 401);
            }

            const body = await request.json();
            const { type, title, content, images, battleConfig, replayData } = body;

            // 校验
            required(type, '帖子类型');
            enumValue(type, '帖子类型', ['discussion', 'battle', 'replay']);
            required(title, '标题');
            stringLength(title, '标题', 2, 50);
            required(content, '内容');
            stringLength(content, '内容', 5, 2000);

            // 内容审核
            const titleCheck = await moderateContent(title, context.env);
            if (!titleCheck.passed) {
                return error(titleCheck.reason);
            }

            const contentCheck = await moderateContent(content, context.env);
            if (!contentCheck.passed) {
                return error(contentCheck.reason);
            }

            const { DB } = context.env;
            const id = generateId();
            const now = Date.now();

            await DB.prepare(`
                INSERT INTO posts (
                    id, user_id, type, title, content, images,
                    battle_config, battle_status, replay_data,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                id,
                context.user.id,
                type,
                titleCheck.filteredText,
                contentCheck.filteredText,
                images ? JSON.stringify(images) : null,
                battleConfig ? JSON.stringify(battleConfig) : null,
                type === 'battle' ? 'open' : null,
                replayData ? JSON.stringify(replayData) : null,
                now,
                now
            ).run();

            return success({ id, created: true }, 201);
        } catch (err) {
            console.error('Create post error:', err);
            if (err.name === 'ValidationError') {
                return error(err.message);
            }
            return error('创建帖子失败: ' + err.message, 500);
        }
    });

    // 删除帖子 (软删除)
    router.delete('/api/posts/:id', async (request, context) => {
        try {
            if (!context.user) {
                return error('请先登录', 401);
            }

            const { id } = context.params;
            const { DB } = context.env;

            // 检查权限
            const post = await DB.prepare(`
                SELECT user_id FROM posts WHERE id = ?
            `).bind(id).first();

            if (!post) {
                return error('帖子不存在', 404);
            }

            if (post.user_id !== context.user.id) {
                return error('无权删除此帖子', 403);
            }

            await DB.prepare(`
                UPDATE posts SET status = 'deleted', updated_at = ? WHERE id = ?
            `).bind(Date.now(), id).run();

            return success({ deleted: true });
        } catch (err) {
            console.error('Delete post error:', err);
            return error('删除帖子失败', 500);
        }
    });

    // 搜索帖子
    router.get('/api/posts/search', async (request, context) => {
        try {
            const { DB } = context.env;
            const q = context.url.searchParams.get('q');

            if (!q || q.length < 2) {
                return success([]);
            }

            const searchPattern = `%${q}%`;

            const result = await DB.prepare(`
                SELECT 
                    p.id, p.type, p.title, p.content, p.images,
                    p.likes_count, p.comments_count, p.views_count,
                    p.is_pinned, p.created_at,
                    u.id as user_id, u.name as user_name, u.avatar as user_avatar
                FROM posts p
                LEFT JOIN users u ON p.user_id = u.id
                WHERE p.status = 'active' 
                    AND (p.title LIKE ? OR p.content LIKE ?)
                ORDER BY p.created_at DESC
                LIMIT 20
            `).bind(searchPattern, searchPattern).all();

            // 格式化返回数据
            const posts = result.results.map(p => ({
                id: p.id,
                type: p.type,
                title: p.title,
                content: p.content?.substring(0, 200),
                images: p.images ? JSON.parse(p.images) : [],
                likesCount: p.likes_count,
                commentsCount: p.comments_count,
                viewsCount: p.views_count,
                isPinned: !!p.is_pinned,
                createdAt: p.created_at,
                author: {
                    id: p.user_id,
                    name: p.user_name,
                    avatar: p.user_avatar
                }
            }));

            return success(posts);
        } catch (err) {
            console.error('Search posts error:', err);
            return error('搜索失败', 500);
        }
    });
}
