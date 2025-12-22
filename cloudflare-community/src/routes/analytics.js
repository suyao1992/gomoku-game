/**
 * 游戏分析路由
 */

import { success, error, generateId } from '../utils/response.js';

export function analyticsRoutes(router) {
    // ==================== 上报接口 (公开) ====================

    // 记录访问
    router.post('/api/analytics/visit', async (request, context) => {
        try {
            const body = await request.json();
            const { visitorId, sessionId, page, referrer, deviceType, browser, os, screenWidth, screenHeight } = body;

            if (!visitorId || !sessionId) {
                return error('Missing required fields');
            }

            const { DB } = context.env;
            const id = generateId();
            const now = Date.now();

            // 检查是否新访客
            const existing = await DB.prepare(`
                SELECT 1 FROM visits WHERE visitor_id = ? LIMIT 1
            `).bind(visitorId).first();

            const isNewVisitor = existing ? 0 : 1;

            await DB.prepare(`
                INSERT INTO visits (
                    id, visitor_id, session_id, page, referrer,
                    device_type, browser, os, screen_width, screen_height,
                    is_new_visitor, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                id, visitorId, sessionId, page || 'home', referrer || null,
                deviceType || null, browser || null, os || null,
                screenWidth || null, screenHeight || null,
                isNewVisitor, now
            ).run();

            return success({ tracked: true, isNew: isNewVisitor });
        } catch (err) {
            console.error('Track visit error:', err);
            return error('Track failed', 500);
        }
    });

    // 记录游戏开始
    router.post('/api/analytics/game/start', async (request, context) => {
        try {
            const body = await request.json();
            const { visitorId, sessionId, mode, subMode } = body;

            if (!visitorId || !mode) {
                return error('Missing required fields');
            }

            const { DB } = context.env;
            const id = generateId();
            const now = Date.now();

            await DB.prepare(`
                INSERT INTO games (
                    id, visitor_id, session_id, mode, sub_mode, started_at
                ) VALUES (?, ?, ?, ?, ?, ?)
            `).bind(id, visitorId, sessionId || '', mode, subMode || null, now).run();

            return success({ gameId: id });
        } catch (err) {
            console.error('Track game start error:', err);
            return error('Track failed', 500);
        }
    });

    // 记录游戏结束
    router.post('/api/analytics/game/end', async (request, context) => {
        try {
            const body = await request.json();
            const { gameId, result, winner, movesCount, duration } = body;

            if (!gameId) {
                return error('Missing gameId');
            }

            const { DB } = context.env;
            const now = Date.now();

            await DB.prepare(`
                UPDATE games SET 
                    result = ?, winner = ?, moves_count = ?, 
                    duration = ?, ended_at = ?
                WHERE id = ?
            `).bind(result || 'unknown', winner || null, movesCount || 0, duration || 0, now, gameId).run();

            return success({ updated: true });
        } catch (err) {
            console.error('Track game end error:', err);
            return error('Track failed', 500);
        }
    });

    // 记录事件
    router.post('/api/analytics/event', async (request, context) => {
        try {
            const body = await request.json();
            const { visitorId, sessionId, eventType, eventName, eventData } = body;

            if (!visitorId || !eventName) {
                return error('Missing required fields');
            }

            const { DB } = context.env;
            const id = generateId();
            const now = Date.now();

            await DB.prepare(`
                INSERT INTO events (
                    id, visitor_id, session_id, event_type, event_name, event_data, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
                id, visitorId, sessionId || null,
                eventType || 'custom', eventName,
                eventData ? JSON.stringify(eventData) : null, now
            ).run();

            return success({ tracked: true });
        } catch (err) {
            console.error('Track event error:', err);
            return error('Track failed', 500);
        }
    });

    // ==================== 管理查询接口 ====================

    // 获取游戏分析概览
    router.get('/api/admin/analytics/overview', async (request, context) => {
        try {
            const { DB } = context.env;
            const now = Date.now();
            const todayStart = new Date().setHours(0, 0, 0, 0);
            const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

            // 流量统计
            const trafficStats = await DB.prepare(`
                SELECT 
                    (SELECT COUNT(*) FROM visits) as total_pv,
                    (SELECT COUNT(DISTINCT visitor_id) FROM visits) as total_uv,
                    (SELECT COUNT(*) FROM visits WHERE created_at >= ?) as today_pv,
                    (SELECT COUNT(DISTINCT visitor_id) FROM visits WHERE created_at >= ?) as today_uv,
                    (SELECT COUNT(DISTINCT visitor_id) FROM visits WHERE is_new_visitor = 1 AND created_at >= ?) as today_new
            `).bind(todayStart, todayStart, todayStart).first();

            // 游戏统计
            const gameStats = await DB.prepare(`
                SELECT 
                    (SELECT COUNT(*) FROM games) as total_games,
                    (SELECT COUNT(*) FROM games WHERE started_at >= ?) as today_games,
                    (SELECT COUNT(*) FROM games WHERE mode = 'pve') as games_pve,
                    (SELECT COUNT(*) FROM games WHERE mode = 'pvp') as games_pvp,
                    (SELECT COUNT(*) FROM games WHERE mode = 'online') as games_online,
                    (SELECT COUNT(*) FROM games WHERE mode = 'quick_match') as games_quick,
                    (SELECT COALESCE(AVG(duration), 0) FROM games WHERE duration > 0) as avg_duration,
                    (SELECT COUNT(*) FROM games WHERE result = 'win') as wins,
                    (SELECT COUNT(*) FROM games WHERE result = 'lose') as losses,
                    (SELECT COUNT(*) FROM games WHERE result = 'draw') as draws
            `).bind(todayStart).first();

            // 7日趋势
            const visitTrend = await DB.prepare(`
                SELECT 
                    DATE(created_at / 1000, 'unixepoch', 'localtime') as date,
                    COUNT(*) as pv,
                    COUNT(DISTINCT visitor_id) as uv
                FROM visits 
                WHERE created_at >= ?
                GROUP BY DATE(created_at / 1000, 'unixepoch', 'localtime')
                ORDER BY date ASC
            `).bind(weekAgo).all();

            const gameTrend = await DB.prepare(`
                SELECT 
                    DATE(started_at / 1000, 'unixepoch', 'localtime') as date,
                    COUNT(*) as count
                FROM games 
                WHERE started_at >= ?
                GROUP BY DATE(started_at / 1000, 'unixepoch', 'localtime')
                ORDER BY date ASC
            `).bind(weekAgo).all();

            return success({
                traffic: trafficStats,
                games: gameStats,
                trends: {
                    visits: visitTrend.results,
                    games: gameTrend.results
                }
            });
        } catch (err) {
            console.error('Analytics overview error:', err);
            return error('获取分析数据失败', 500);
        }
    });

    // 获取设备统计
    router.get('/api/admin/analytics/devices', async (request, context) => {
        try {
            const { DB } = context.env;

            const deviceTypes = await DB.prepare(`
                SELECT device_type, COUNT(*) as count 
                FROM visits 
                WHERE device_type IS NOT NULL
                GROUP BY device_type
            `).all();

            const browsers = await DB.prepare(`
                SELECT browser, COUNT(*) as count 
                FROM visits 
                WHERE browser IS NOT NULL
                GROUP BY browser
                ORDER BY count DESC
                LIMIT 10
            `).all();

            const osStats = await DB.prepare(`
                SELECT os, COUNT(*) as count 
                FROM visits 
                WHERE os IS NOT NULL
                GROUP BY os
                ORDER BY count DESC
                LIMIT 10
            `).all();

            return success({
                deviceTypes: deviceTypes.results,
                browsers: browsers.results,
                os: osStats.results
            });
        } catch (err) {
            console.error('Analytics devices error:', err);
            return error('获取设备数据失败', 500);
        }
    });

    // 获取游戏模式详情
    router.get('/api/admin/analytics/games', async (request, context) => {
        try {
            const { DB } = context.env;
            const { url } = context;
            const days = parseInt(url.searchParams.get('days') || '7');
            const since = Date.now() - days * 24 * 60 * 60 * 1000;

            // 模式分布
            const modeDistribution = await DB.prepare(`
                SELECT mode, sub_mode, COUNT(*) as count,
                       COALESCE(AVG(duration), 0) as avg_duration
                FROM games 
                WHERE started_at >= ?
                GROUP BY mode, sub_mode
                ORDER BY count DESC
            `).bind(since).all();

            // 每日游戏数
            const dailyGames = await DB.prepare(`
                SELECT 
                    DATE(started_at / 1000, 'unixepoch', 'localtime') as date,
                    mode,
                    COUNT(*) as count
                FROM games 
                WHERE started_at >= ?
                GROUP BY date, mode
                ORDER BY date ASC
            `).bind(since).all();

            // 结果统计
            const results = await DB.prepare(`
                SELECT result, COUNT(*) as count
                FROM games 
                WHERE started_at >= ? AND result IS NOT NULL
                GROUP BY result
            `).bind(since).all();

            return success({
                modeDistribution: modeDistribution.results,
                dailyGames: dailyGames.results,
                results: results.results
            });
        } catch (err) {
            console.error('Analytics games error:', err);
            return error('获取游戏数据失败', 500);
        }
    });

    // 获取事件统计
    router.get('/api/admin/analytics/events', async (request, context) => {
        try {
            const { DB } = context.env;
            const { url } = context;
            const days = parseInt(url.searchParams.get('days') || '7');
            const since = Date.now() - days * 24 * 60 * 60 * 1000;

            const events = await DB.prepare(`
                SELECT event_type, event_name, COUNT(*) as count
                FROM events 
                WHERE created_at >= ?
                GROUP BY event_type, event_name
                ORDER BY count DESC
                LIMIT 50
            `).bind(since).all();

            return success({
                events: events.results
            });
        } catch (err) {
            console.error('Analytics events error:', err);
            return error('获取事件数据失败', 500);
        }
    });
}
