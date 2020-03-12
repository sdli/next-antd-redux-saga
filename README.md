## NEXT-ANT-MOBILE-LESS-TS

基于 next.js ant-mobile less 和 redux-saga 的移动端框架；

## 项目结构

```
./-- NEXT-ANT-MOBILE-LESS-TS

    ./-- configs
        -/ less-loader
        -/ css-loader

    ./-- pm2
        -/ (错误日志)

    ./-- public
        -/ fast-click.1.0.6.js
        -/ none-style.css （样式初始化）
        -/ onload.js (可以在这里增加监控和挂载全局变量)

    ./-- server
        -/ mock
            -/ 数据模拟.js
        -/ index.js
        -/ koaMocker.js
        -/ proxyData.js (用于引用mock文件夹下的各类文件)

    ./-- src
        -/ components
        -/ configs
        -/ languages
        -/ models
        -/ pages
            -/ index.tsx
            -/ user.tsx
            -/ _app.tsx
            -/ _document.tsx
            (切勿将components组件放置在此文件夹，next.js没有路由控制，会将pages路由直接将文件名用于路由)
        -/services
        -/store
        -/theme
        -/utils

    .babelrc
    .gitignore
    .prettierrc.js
    next-env.d.ts
    next.config.js
    package.json
    pm2.dev.json
    pm2.pro.json
    tsconfig.json

```

## 功能列表

#####

#### 1. store 功能列表

store 中可以提供数据、路由跳转、链接、request、effects 和 hooks 等工具，是框架中使用频率最高的内容。

#####

##### 1.1 路由、链接

```js
import { router, Link } from 'store';

router.push('/userPage?query=1'); // 你要跳转的路由
const LinkItem = () => <Link href="/userPage?query=1">跳转</Link>;
```

备注：不推荐直接使用 `next/router`中的路由，因为没有国际化配置

#####

##### 1.2 connect 和 useReselector 来获取你的数据

```js
import { useReselector } from 'store';

const loadingStatus = useReselector(
    // 多个状态选取
    state => state.app.loading,
    state => state.user.loading,

    // 将多个数据全部返回
    (...rest) => [...rest],
);
```

```
connect 案例不再展示
```

备注：**_为什么使用 reselector？_**
这里 `useReselector` 是根据 redux 中的 useSelector 和 reselector 组件进行的二次封装，可以有效避免选择器每次都要重新生成函数对象的问题，增加选择性能；

##### 1.3 model 书写规范

备注：因为路由组件由 next.js 统一管理、监听，所以无需写 subscriptions;

```js
import { services } from 'services/app.services';
import { modelWithRequest } from 'store';

export default modelWithRequest(services, {
    namespace: 'app',

    // 初始化state
    state: {},

    // reducers
    reducers: {
        save: (state, action) => {
            return { ...state, ...action.payload };
        },
    },

    // 异步effects
    effects: {
        *getData({ payload }, { put, call, select }) {},
    },
});
```

以上 model 在 `model/index.ts` 中全量引入即可。

##### 1.4 静态文件引入

```js
// 放入public中的./icon/logo.svg

const imgComp = () => <img src="/icon/logo.svg" />;
```

##### 1.5 修改主题

修改 `themes/default.less`；
[antd 样式配置地址]:https://mobile.ant.design/docs/react/customize-theme-cn

```css
@brand-primary: red;
```

##### 1.6 国际化配置

在 languages 中定义即可。如需增加新的语言可以在`pages/_app.js`中直接引用，并修改`store/Link.tsx`和`store.router.tsx`组件的跳转规则。

国际化使用

```js
import intl from 'react-intl-universal';

intl.get('name');
```

## 项目部署

#### 1. 项目部署工具-docker

因当前项目大部分无需 docker 化，提供以下 dockerfile 供参考

```
#制定node镜像的版本
FROM node:11
#声明作者
MAINTAINER root
#移动当前目录下面的文件到app目录下
ADD . ~/app/
#进入到app目录下面，类似cd
WORKDIR ~/app
#安装依赖
RUN npm install
RUN npm run build
#对外暴露的端口
EXPOSE 3000
#程序启动脚本
CMD ["npm", "start"]
```

#### 2. 项目部署工具-pm2

```s
npm run build
pm2 start pm2.pro.json
```

#### 3. 隔离环境安装-pm2

```
zip project

# 上传文件包
unzip project.zip

# 目录下build一次后，启动pm2 的watch模式
pm2 start pm2.json

# 后续只需要更新.next server文件目录即可

```
