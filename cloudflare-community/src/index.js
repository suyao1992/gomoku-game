/**
 * 棋友圈社区 API - Worker 入口
 * Cloudflare Workers
 */

import { Router } from './router.js';
import { corsMiddleware, handleOptions } from './middleware/cors.js';
import { authMiddleware } from './middleware/auth.js';
import { rateLimitMiddleware } from './middleware/rateLimit.js';

// 路由模块
import { usersRoutes } from './routes/users.js';
import { postsRoutes } from './routes/posts.js';
import { commentsRoutes } from './routes/comments.js';
import { likesRoutes } from './routes/likes.js';
import { uploadRoutes } from './routes/upload.js';
import { adminRoutes } from './routes/admin.js';
import { analyticsRoutes } from './routes/analytics.js';
import { notificationsRoutes } from './routes/notifications.js';

export default {
    async fetch(request, env, ctx) {
        // 处理 CORS 预检请求
        if (request.method === 'OPTIONS') {
            return handleOptions(request, env);
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            // 创建路由器
            const router = new Router();

            // 注册路由
            usersRoutes(router);
            postsRoutes(router);
            commentsRoutes(router);
            likesRoutes(router);
            uploadRoutes(router);
            adminRoutes(router);
            analyticsRoutes(router);
            notificationsRoutes(router);

            // 健康检查
            router.get('/api/health', async () => {
                return Response.json({
                    status: 'ok',
                    timestamp: Date.now(),
                    version: '1.0.0'
                });
            });

            // 匹配路由
            const handler = router.match(request.method, path);

            if (!handler) {
                return Response.json(
                    { error: 'Not Found', path },
                    { status: 404 }
                );
            }

            // 创建请求上下文
            const context = {
                env,
                ctx,
                url,
                params: handler.params,
                user: null
            };

            // 应用中间件
            // 1. 频率限制
            const rateLimitResult = await rateLimitMiddleware(request, context);
            if (rateLimitResult) return corsMiddleware(rateLimitResult, env);

            // 2. 用户认证 (非管理接口)
            if (!path.startsWith('/api/admin')) {
                await authMiddleware(request, context);
            }

            // 3. 管理员认证
            if (path.startsWith('/api/admin')) {
                const adminAuth = request.headers.get('Authorization');
                if (!adminAuth || adminAuth !== `Bearer ${env.ADMIN_SECRET}`) {
                    return corsMiddleware(
                        Response.json({ error: 'Unauthorized' }, { status: 401 }),
                        env
                    );
                }
            }

            // 执行路由处理器
            const response = await handler.handler(request, context);

            // 添加 CORS 头
            return corsMiddleware(response, env);

        } catch (error) {
            console.error('Worker error:', error);
            return corsMiddleware(
                Response.json(
                    { error: 'Internal Server Error', message: error.message },
                    { status: 500 }
                ),
                env
            );
        }
    }
};
