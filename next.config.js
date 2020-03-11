/* eslint-disable */
const withLess = require('./configs/less-loader')
const lessToJS = require('less-vars-to-js')
const path = require('path')
const resolvePath = (dir) => path.resolve(__dirname, dir)
const fs = require('fs')
const webpack = require('webpack')
const resolve = require('resolve');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

// Where your antd-custom.less file lives
const themeVariables = lessToJS(
    fs.readFileSync(path.resolve(__dirname, './src/theme/default.less'), 'utf8')
)

// 。..
if (typeof require !== 'undefined') {
    require.extensions['.less'] = () => { }
    require.extensions['.css'] = () => { }
}

module.exports = withBundleAnalyzer(withLess({
    cssModules: true,
    cssLoaderOptions: {
        url: false,
        modules: {
            localIdentName: '[local]-[hash:base64:4]'
        },
        import: true
    },
    lessLoaderOptions: {
        javascriptEnabled: true,
        modifyVars: themeVariables
    },
    webpack: (config, options) => {

        const { dev, isServer, dir } = options;

        if (isServer) {
            const antStyles = /antd-mobile\/.*?\/style.*?/;

            // const origExternals = config.externals ? [...config.externals] : [];

            config.externals = [
                (context, request, callback) => {
                    const notExternalModules = [
                        'next/app', 'next/document', 'next/link', 'next/error',
                        'string-hash',
                        'next/constants'
                    ]

                    if (notExternalModules.indexOf(request) !== -1) {
                        return callback()
                    }

                    resolve(request, { baseDir: dir, preserveSymlinks: true }, (err, res) => {

                        if (err) {
                            return callback()
                        }

                        if (!res) {
                            return callback();
                        }

                        // Default pages have to be transpiled
                        if (res.match(/next[/\\]dist[/\\]/) || res.match(/node_modules[/\\]@babel[/\\]runtime[/\\]/) || res.match(/node_modules[/\\]@babel[/\\]runtime-corejs2[/\\]/)) {
                            return callback()
                        }

                        // Webpack itself has to be compiled because it doesn't always use module relative paths
                        if (res.match(/node_modules[/\\]webpack/) || res.match(/node_modules[/\\]css-loader/)) {
                            return callback()
                        }

                        // styled-jsx has to be transpiled
                        if (res.match(/node_modules[/\\]styled-jsx/)) {
                            return callback()
                        }

                        if (
                            res.match(/node_modules[/\\].*\.js/)
                            && !res.match(/node_modules[/\\]webpack/)
                            && !res.match(antStyles)
                        ) {
                            return callback(null, `commonjs ${request}`);
                        }

                        return callback();

                    });
                },
            ];

            config.module.rules.unshift({
                test: antStyles,
                use: 'null-loader',
            });
        }

        config.resolve.alias = {
            ...(config.resolve.alias || {}),
            'components': resolvePath('./src/components'),
            'models': resolvePath('src/models'),
            'configs': resolvePath('src/configs'),
            'services': resolvePath('src/services'),
            'store': resolvePath('src/store'),
            'theme': resolvePath('src/theme'),
            'utils': resolvePath('src/utils'),
            'languages': resolvePath('src/languages')
        };

        // 缩小moment体积
        // 只保留zh-cn
        config.plugins.push(
            new webpack.ContextReplacementPlugin(/moment[/\\]locale/, /zh-cn/)
        );

        return config;
    },
}));
