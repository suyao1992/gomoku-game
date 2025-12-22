/**
 * 图片上传路由
 */

import { success, error, generateId } from '../utils/response.js';

// 支持的图片类型
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function uploadRoutes(router) {
    // 上传图片
    router.post('/api/upload', async (request, context) => {
        try {
            if (!context.user) {
                return error('请先登录', 401);
            }

            const { env } = context;
            const IMAGES = env.IMAGES;
            const maxSize = parseInt(env.MAX_IMAGE_SIZE || '5242880'); // 5MB

            // 检查 R2 是否配置
            if (!IMAGES) {
                return error('图片上传功能暂未开启', 503);
            }

            // 解析 multipart 表单
            const formData = await request.formData();
            const file = formData.get('file');

            if (!file) {
                return error('请选择要上传的图片');
            }

            // 检查文件类型
            if (!ALLOWED_TYPES.includes(file.type)) {
                return error('不支持的图片格式，请上传 JPG、PNG、GIF 或 WebP');
            }

            // 检查文件大小
            if (file.size > maxSize) {
                return error(`图片大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`);
            }

            // 生成文件名
            const ext = file.type.split('/')[1];
            const fileName = `${context.user.id}/${Date.now()}-${generateId()}.${ext}`;

            // 上传到 R2
            await IMAGES.put(fileName, file.stream(), {
                httpMetadata: {
                    contentType: file.type
                }
            });

            // 返回图片URL (需要配置 R2 公开访问或自定义域名)
            const imageUrl = `/images/${fileName}`;

            return success({
                url: imageUrl,
                fileName,
                size: file.size,
                type: file.type
            });
        } catch (err) {
            console.error('Upload error:', err);
            return error('上传失败: ' + err.message, 500);
        }
    });

    // 获取图片 (代理 R2)
    router.get('/images/:userId/:fileName', async (request, context) => {
        try {
            const { userId, fileName } = context.params;
            const IMAGES = context.env.IMAGES;

            if (!IMAGES) {
                return error('图片服务暂不可用', 503);
            }

            const key = `${userId}/${fileName}`;
            const object = await IMAGES.get(key);

            if (!object) {
                return error('图片不存在', 404);
            }

            const headers = new Headers();
            headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
            headers.set('Cache-Control', 'public, max-age=31536000'); // 1年缓存

            return new Response(object.body, { headers });
        } catch (err) {
            console.error('Get image error:', err);
            return error('获取图片失败', 500);
        }
    });
}
