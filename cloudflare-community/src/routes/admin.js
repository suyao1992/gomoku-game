/**
 * 管理后台路由
 */

import { success, error, paginated } from '../utils/response.js';
import { parsePagination } from '../utils/validation.js';

export function adminRoutes(router) {
    // 获取统计数据
    router.get('/api/admin/stats', async (request, context) => {
        try {
            const { DB } = context.env;
            const now = Date.now();
            const todayStart = new Date().setHours(0, 0, 0, 0);
            const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

            // 基础统计
            const basicStats = await DB.prepare(`
                SELECT 
                    (SELECT COUNT(*) FROM posts WHERE status = 'active') as total_posts,
                    (SELECT COUNT(*) FROM posts WHERE status = 'active' AND created_at >= ?) as today_posts,
                    (SELECT COUNT(*) FROM posts WHERE status = 'pending') as pending_posts,
                    (SELECT COUNT(*) FROM comments WHERE status = 'active') as total_comments,
                    (SELECT COUNT(*) FROM comments WHERE status = 'active' AND created_at >= ?) as today_comments,
                    (SELECT COUNT(*) FROM users) as total_users,
                    (SELECT COUNT(*) FROM reports WHERE status = 'pending') as pending_reports,
                    (SELECT COALESCE(SUM(views_count), 0) FROM posts) as total_views,
                    (SELECT COALESCE(SUM(likes_count), 0) FROM posts) as total_likes
            `).bind(todayStart, todayStart).first();

            // 今日活跃用户（今日发帖或评论的用户）
            const activeUsers = await DB.prepare(`
                SELECT COUNT(DISTINCT user_id) as count FROM (
                    SELECT user_id FROM posts WHERE created_at >= ?
                    UNION
                    SELECT user_id FROM comments WHERE created_at >= ?
                )
            `).bind(todayStart, todayStart).first();

            // 最近7天每日帖子趋势
            const dailyTrend = await DB.prepare(`
                SELECT 
                    DATE(created_at / 1000, 'unixepoch', 'localtime') as date,
                    COUNT(*) as count
                FROM posts 
                WHERE created_at >= ? AND status = 'active'
                GROUP BY DATE(created_at / 1000, 'unixepoch', 'localtime')
                ORDER BY date ASC
            `).bind(weekAgo).all();

            return success({
                ...basicStats,
                today_active_users: activeUsers?.count || 0,
                daily_trend: dailyTrend.results || []
            });
        } catch (err) {
            console.error('Admin stats error:', err);
            return error('获取统计失败', 500);
        }
    });

    // 获取帖子列表 (管理)
    router.get('/api/admin/posts', async (request, context) => {
        try {
            const { DB } = context.env;
            const { url } = context;
            const { page, pageSize, offset } = parsePagination(url);

            const status = url.searchParams.get('status') || 'all';
            const type = url.searchParams.get('type');
            const search = url.searchParams.get('search');

            let whereClause = 'WHERE 1=1';
            const params = [];

            if (status !== 'all') {
                whereClause += ' AND p.status = ?';
                params.push(status);
            }

            if (type) {
                whereClause += ' AND p.type = ?';
                params.push(type);
            }

            if (search) {
                whereClause += ' AND (p.title LIKE ? OR p.content LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }

            const countResult = await DB.prepare(`
                SELECT COUNT(*) as total FROM posts p ${whereClause}
            `).bind(...params).first();

            const posts = await DB.prepare(`
                SELECT 
                    p.*,
                    u.name as user_name, u.avatar as user_avatar
                FROM posts p
                LEFT JOIN users u ON p.user_id = u.id
                ${whereClause}
                ORDER BY p.created_at DESC
                LIMIT ? OFFSET ?
            `).bind(...params, pageSize, offset).all();

            return paginated(posts.results, countResult.total, page, pageSize);
        } catch (err) {
            console.error('Admin posts error:', err);
            return error('获取帖子失败', 500);
        }
    });

    // 审核/更新帖子
    router.patch('/api/admin/posts/:id', async (request, context) => {
        try {
            const { id } = context.params;
            const body = await request.json();
            const { status, is_pinned } = body;

            const { DB } = context.env;
            const updates = [];
            const params = [];

            if (status !== undefined) {
                updates.push('status = ?');
                params.push(status);
            }

            if (is_pinned !== undefined) {
                updates.push('is_pinned = ?');
                params.push(is_pinned ? 1 : 0);
            }

            if (updates.length === 0) {
                return error('没有要更新的内容');
            }

            updates.push('updated_at = ?');
            params.push(Date.now());
            params.push(id);

            await DB.prepare(`
                UPDATE posts SET ${updates.join(', ')} WHERE id = ?
            `).bind(...params).run();

            return success({ updated: true });
        } catch (err) {
            console.error('Admin update post error:', err);
            return error('更新失败', 500);
        }
    });

    // 获取举报列表
    router.get('/api/admin/reports', async (request, context) => {
        try {
            const { DB } = context.env;
            const { url } = context;
            const { page, pageSize, offset } = parsePagination(url);

            const status = url.searchParams.get('status') || 'pending';

            const countResult = await DB.prepare(`
                SELECT COUNT(*) as total FROM reports WHERE status = ?
            `).bind(status).first();

            const reports = await DB.prepare(`
                SELECT 
                    r.*,
                    u.name as reporter_name
                FROM reports r
                LEFT JOIN users u ON r.reporter_id = u.id
                WHERE r.status = ?
                ORDER BY r.created_at DESC
                LIMIT ? OFFSET ?
            `).bind(status, pageSize, offset).all();

            return paginated(reports.results, countResult.total, page, pageSize);
        } catch (err) {
            console.error('Admin reports error:', err);
            return error('获取举报失败', 500);
        }
    });

    // 处理举报
    router.patch('/api/admin/reports/:id', async (request, context) => {
        try {
            const { id } = context.params;
            const body = await request.json();
            const { status, handled_note, action } = body;

            const { DB } = context.env;
            const now = Date.now();

            // 获取举报信息
            const report = await DB.prepare(`
                SELECT * FROM reports WHERE id = ?
            `).bind(id).first();

            if (!report) {
                return error('举报不存在', 404);
            }

            // 更新举报状态
            await DB.prepare(`
                UPDATE reports SET 
                    status = ?, 
                    handled_note = ?, 
                    handled_by = 'admin',
                    handled_at = ?
                WHERE id = ?
            `).bind(status, handled_note || null, now, id).run();

            // 如果需要，对目标进行处理
            if (action === 'hide' || action === 'delete') {
                const table = report.target_type === 'post' ? 'posts' : 'comments';
                const newStatus = action === 'hide' ? 'hidden' : 'deleted';
                await DB.prepare(`
                    UPDATE ${table} SET status = ? WHERE id = ?
                `).bind(newStatus, report.target_id).run();
            }

            return success({ handled: true });
        } catch (err) {
            console.error('Admin handle report error:', err);
            return error('处理失败', 500);
        }
    });

    // 添加敏感词
    router.post('/api/admin/sensitive-words', async (request, context) => {
        try {
            const body = await request.json();
            const { word, level, replacement } = body;

            if (!word) {
                return error('敏感词不能为空');
            }

            const { DB } = context.env;

            await DB.prepare(`
                INSERT INTO sensitive_words (word, level, replacement, created_at)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(word) DO UPDATE SET
                    level = excluded.level,
                    replacement = excluded.replacement
            `).bind(word, level || 'block', replacement || null, Date.now()).run();

            return success({ added: true });
        } catch (err) {
            console.error('Admin add sensitive word error:', err);
            return error('添加失败', 500);
        }
    });

    // 获取敏感词列表
    router.get('/api/admin/sensitive-words', async (request, context) => {
        try {
            const { DB } = context.env;

            const words = await DB.prepare(`
                SELECT * FROM sensitive_words ORDER BY created_at DESC
            `).all();

            return success(words.results);
        } catch (err) {
            console.error('Admin get sensitive words error:', err);
            return error('获取失败', 500);
        }
    });

    // 发布公告
    router.post('/api/admin/announcements', async (request, context) => {
        try {
            const body = await request.json();
            const { title, content, is_pinned } = body;

            if (!title || !content) {
                return error('标题和内容不能为空');
            }

            const { DB } = context.env;
            const id = `ann-${Date.now()}`;
            const now = Date.now();

            await DB.prepare(`
                INSERT INTO posts (
                    id, user_id, type, title, content, 
                    images, likes_count, comments_count, views_count,
                    is_pinned, status, created_at, updated_at
                ) VALUES (?, 'admin', 'announcement', ?, ?, 
                    '[]', 0, 0, 0,
                    ?, 'active', ?, ?)`).bind(id, title, content, is_pinned ? 1 : 0, now, now).run();

            return success({ id, created: true });
        } catch (err) {
            console.error('Admin create announcement error:', err);
            return error('发布失败', 500);
        }
    });
}
