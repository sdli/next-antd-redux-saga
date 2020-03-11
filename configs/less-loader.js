const cssLoaderConfig = require('./css-loader');
const resolve = require('resolve');

module.exports = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      if (!options.defaultLoaders) {
        throw new Error(
          'This plugin is not compatible with Next.js versions below 5.0.0 https://err.sh/next-plugins/upgrade'
        )
      }

      const { dev, isServer } = options;

      const {
        cssModules,
        cssLoaderOptions,
        postcssLoaderOptions,
        lessLoaderOptions = {}
      } = nextConfig;

      options.defaultLoaders.less = cssLoaderConfig(config, {
        extensions: ['less'],
        cssModules,
        cssLoaderOptions,
        postcssLoaderOptions,
        dev,
        isServer,
        loaders: [
          {
            loader: 'less-loader',
            options: lessLoaderOptions
          }
        ]
      })

      // 我们禁用了antd的cssModules
      config.module.rules.push({
        test: /\.less$/,
        include: /node_modules/,
        use: cssLoaderConfig(config, {
          extensions: ['less'],
          cssModules: false,
          cssLoaderOptions: {},
          dev,
          isServer,
          loaders: [
            {
              loader: 'less-loader',
              options: lessLoaderOptions
            }
          ]
        })
      });

      // 本地代码loader
      config.module.rules.push({
        test: /\.less$/,
        exclude: /node_modules/,
        use: options.defaultLoaders.less
      });

      // 加入css加载器
      config.module.rules.push({
        test: /\.css$/,
        exclude: /node_modules/,
        use: cssLoaderConfig(config, {          
          cssModules: false,
          cssLoaderOptions: {},
          dev,
          isServer
        })
      });

      // 加入css加载器
      config.module.rules.push({
        test: /\.css$/,
        include: /node_modules[\//]/,
        use: cssLoaderConfig(config, {
          cssModules: false,
          dev,
          isServer
        })
      });

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    }
  })
}