const router = new require("koa-router")();

/**
 * 传入字符串地址进行解析；
 * 返回对应的地址
 */
function mock(data) {
    /**
     * 返回koa函数
     */
    return async function mock(ctx, next) {

        const datas = await new Promise((resolve) => {
            resolve(data);
        });

        ctx.body = datas;
        if (!ctx.body) {
            await next();
        }
    }
}

function startMock(obj) {
    Object.keys(obj).forEach((v) => {
        const req = v.split(' ');
        const method = req.length === 0 ? 'get' : req[0].toLowerCase();
        const path = req.length === 0 ? req[0] : req[1];

        router[method](path, mock(obj[v]));
    });

    return router.routes();
}

module.exports = startMock;