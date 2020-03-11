const koa = require('koa');
const { parse } = require('url')
const next = require('next')
const chalk = require('chalk');

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler();
const port = (process && process.env.PORT) || 8000;

// mock规则
const apiMocker = require('./koaMocker');
const proxyData = require('./proxyData');

// 转发规则
const c2k = require('koa2-connect');
const proxy = require('http-proxy-middleware');
const bodyparser = require('koa-bodyparser');

// 转发配置
const proxyTargets = {
  '/api': {
    target: 'localhost:8001',
  },
};

function proxyHelper(prefix, options) {

  console.log(chalk.green(`[API_PROXY 代理]:${prefix} -> ${options.target}`));
  return async function (ctx, next) {
    if (ctx.url.startsWith(prefix)) {
      await c2k(proxy(options))(ctx, next);
    } else {
      await next();
    }
  }
}

// 配置koa和转发路由
const server = new koa();

app.prepare().then(() => {

  // if (dev) {
  console.log(chalk.green(`[API_MOCKER 模拟]: 开启${Object.keys(proxyData).length || 0}条本地数据`));
  server.use(apiMocker(proxyData));

  // 开启mock
  Object.entries(proxyTargets).forEach((v) => {
    const middle = proxyHelper(v[0], v[1]);
    server.use(middle)
  });

  server.use(bodyparser({
    enableTypes: ['json', 'form', 'text']
  }));

  server.use(async (ctx, next) => {
    const { req, res } = ctx;
    const parsedUrl = parse(req.url, true)
    const { pathname, query } = parsedUrl

    // 获取国际化信息
    const { route, locale } = getPageRoute(pathname);

    if (route) {
      ctx.status = 200;
      await app.render(req, res, route, query ? { ...query, locale: locale } : { locale: locale });
    } else {
      await handle(req, res);
    }

    ctx.respond = false;
    await next();
  });

  server.listen(port, err => {
    if (err) throw err;

    console.log(chalk.green(`[Next-SSR服务器] Ready on http://localhost:${port}`));
  });
});

// 获取路由信息
function getPageRoute(pathname) {

  if (typeof pathname === 'string' && pathname.endsWith('-en')) {
    return { route: pathname.replace('-en', ''), locale: 'en' };
  }

  return { route: null };
}
