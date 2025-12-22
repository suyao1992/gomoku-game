/**
 * 简单路由器实现
 */

export class Router {
    constructor() {
        this.routes = [];
    }

    /**
     * 添加路由
     */
    add(method, pattern, handler) {
        // 将路径模式转换为正则表达式
        const paramNames = [];
        const regexPattern = pattern.replace(/:(\w+)/g, (_, name) => {
            paramNames.push(name);
            return '([^/]+)';
        });

        this.routes.push({
            method: method.toUpperCase(),
            pattern: new RegExp(`^${regexPattern}$`),
            paramNames,
            handler
        });
    }

    get(pattern, handler) {
        this.add('GET', pattern, handler);
    }

    post(pattern, handler) {
        this.add('POST', pattern, handler);
    }

    patch(pattern, handler) {
        this.add('PATCH', pattern, handler);
    }

    delete(pattern, handler) {
        this.add('DELETE', pattern, handler);
    }

    /**
     * 匹配路由
     */
    match(method, path) {
        for (const route of this.routes) {
            if (route.method !== method.toUpperCase()) continue;

            const match = path.match(route.pattern);
            if (match) {
                // 提取参数
                const params = {};
                route.paramNames.forEach((name, index) => {
                    params[name] = match[index + 1];
                });

                return {
                    handler: route.handler,
                    params
                };
            }
        }
        return null;
    }
}
