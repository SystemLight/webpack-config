const path = require('path');
const fs = require('fs');

const webpack = require('webpack');
const WebpackConfig = require('webpack-chain');
const WebpackBar = require('webpackbar');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');

const mockServer = require('./mock-server');

// https://v4.webpack.js.org/configuration/
const config = new WebpackConfig();

function configBasicStyle(styleType) {
    const styleConfig = config.module.rule(styleType)
        .use('css-loader')
        .loader('css-loader')
        .end()
        .use('postcss-loader')
        .loader('postcss-loader')
        .end();

    switch (styleType) {
        case 'css':
            styleConfig.test(/\.css$/);
            break;
        case 'less':
            styleConfig
                .test(/\.less$/)
                .use('less-loader')
                .loader('less-loader')
                .options({
                    lessOptions: {
                        javascriptEnabled: true
                    }
                })
                .end();
            break;
        case 'scss':
            // TODO: scss
            break;
        case 'stylus':
            // TODO: stylus
            break;
    }
}

function configExtraStyle(isProduction, styleType) {
    if (isProduction) {
        config.module.rule(styleType)
            .use('MiniCssExtractPlugin.loader')
            .before('css-loader')
            .loader(MiniCssExtractPlugin.loader)
            .end();
    } else {
        config.module.rule(styleType)
            .use('style-loader')
            .before('css-loader')
            .loader('style-loader')
            .end();
    }
}

function getSplitChunksGroup(allLibKey) {
    let splitChunksGroup = {
        common: {
            name: 'common',
            chunks: 'all',
            priority: -20,
            minChunks: 2,
            reuseExistingChunk: true
        },
        vendors: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            priority: -10
        },
        styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true
        }
    };

    if (allLibKey.includes('vue')) {
        splitChunksGroup = Object.assign(splitChunksGroup, {
            vue: {
                name: 'vue',
                test: /[\\/]node_modules[\\/](vue|vue-router|vuex)/,
                chunks: 'all',
                enforce: true
            }
        });
    }

    if (allLibKey.includes('element-ui')) {
        splitChunksGroup = Object.assign(splitChunksGroup, {
            elementUI: {
                name: 'element-ui',
                test: /[\\/]node_modules[\\/](element-ui)/,
                chunks: 'all'
            }
        });
    }

    if (allLibKey.includes('react')) {
        splitChunksGroup = Object.assign(splitChunksGroup, {
            react: {
                name: 'react',
                test: /[\\/]node_modules[\\/](scheduler|react|react-dom|prop-types)/,
                chunks: 'all',
                enforce: true
            }
        });
    }

    if (allLibKey.includes('antd')) {
        splitChunksGroup = Object.assign(splitChunksGroup, {
            antd: {
                name: 'antd',
                test: /[\\/]node_modules[\\/](@ant-design|antd)/,
                chunks: 'all'
            }
        });
    }

    return splitChunksGroup;
}

module.exports = function (env, argv) {
    const mode = argv.mode || 'development';
    const isProduction = mode === 'production';
    const workDir = process.cwd();
    const targetDistPath = path.resolve(workDir, 'dist');
    const publicPath = '/';
    const webpackDevClientEntry = require.resolve('react-dev-utils/webpackHotDevClient');
    const {devDependencies, dependencies} = require(path.join(workDir, 'package.json'));
    const allLibKey = Object.keys(Object.assign(devDependencies, dependencies, {}));
    const isTsProject = fs.existsSync(path.join(workDir, 'tsconfig.json'));
    const isMock = fs.existsSync(path.join(workDir, 'mocks'));
    const scriptExt = isTsProject ? 'ts' : 'js';
    const entryDefaultName = 'main.' + scriptExt;
    const haveTemplate = fs.existsSync(path.join(workDir, 'template.ejs'));
    const havePublic = fs.existsSync(path.join(workDir, 'public'));

    config
        .mode(mode)
        .target('web')
        .stats('errors-only')
        .devtool(isProduction ? false : 'cheap-module-source-map')
        .context(workDir);

    config.resolve
        .extensions
        .merge(
            ['.js', '.jsx'].concat(
                isTsProject ? ['.ts', '.tsx'] : []
            )
        )
        .end()
        .alias
        .set('@', path.join(workDir, 'src'))
        .end();

    config.devServer
        .stats('errors-only')
        .clientLogLevel('silent')
        .quiet(true)
        .noInfo(true)
        .overlay(true)
        .open(false)
        .openPage('')
        .set('transportMode', 'ws')
        .disableHostCheck(false)
        .contentBase(targetDistPath)
        .writeToDisk(false)
        .index('index.html')
        .historyApiFallback(true)
        .inline(true)
        .hot(false)
        .hotOnly(false)
        .port(8080)
        .proxy({
            // https://github.com/chimurai/http-proxy-middleware
            '/proxy': {
                target: 'http://127.0.0.1:5000',
                pathRewrite: {'^/proxy': ''},
                changeOrigin: true,
                secure: false,
                autoRewrite: true,
                hostRewrite: 'localhost:8080/proxy',
                protocolRewrite: null
            }
        })
        .before(function (app) {
            if (isMock) {
                mockServer(app);
            }
        });

    config.optimization
        .runtimeChunk('single')
        .splitChunks({
            chunks: 'async',
            automaticNameDelimiter: '-',
            cacheGroups: getSplitChunksGroup(allLibKey)
        })
        .minimize(isProduction)
        .minimizer('TerserJSPlugin')
        .use(TerserJSPlugin)
        .end()
        .minimizer('OptimizeCSSAssetsPlugin')
        .use(OptimizeCSSAssetsPlugin)
        .end();

    config.performance
        .maxAssetSize(3 * 1024 * 1024)
        .maxEntrypointSize(3 * 1024 * 1024);

    config.output
        .path(targetDistPath)
        .publicPath(publicPath);

    config.module.rule('js')
        .test(/\.js$/)
        .exclude
        .add(/node_modules/)
        .end()
        .use('thread-loader')
        .loader('thread-loader')
        .end()
        .use('babel-loader') // https://github.com/babel/babel-loader
        .loader('babel-loader')
        .end();

    config.module.rule('jsx')
        .test(/\.jsx$/)
        .use('thread-loader')
        .loader('thread-loader')
        .end()
        .use('babel-loader')
        .loader('babel-loader')
        .end();

    if (isTsProject) {
        config.module.rule('tsx')
            .test(/\.tsx?$/)
            .use('thread-loader')
            .loader('thread-loader')
            .end()
            .use('babel-loader')
            .loader('babel-loader')
            .end()
            .use('ts-loader')
            .loader('ts-loader')
            .options({
                // https://github.com/TypeStrong/ts-loader#happypackmode
                transpileOnly: true,
                happyPackMode: true,
                compilerOptions: {
                    jsx: 'preserve'
                }
            })
            .end();
    }

    configBasicStyle('css');
    configBasicStyle('less');

    const svgConfig = config.module.rule('svg').test(/\.svg(\?v=\d+\.\d+\.\d+)?$/);

    if (isTsProject) {
        svgConfig.set('issuer', /\.tsx?$/);
    }

    if (allLibKey.includes('react')) {
        svgConfig
            .use('babel-loader')
            .loader('babel-loader')
            .end()
            .use('@svgr/webpack')
            .loader('@svgr/webpack')
            .options({
                babel: false,
                icon: true
            })
            .end()
    }

    svgConfig
        .use('file-loader')
        .loader('file-loader')
        .options(
            {
                name: 'images/[name].[ext]',
                publicPath: publicPath,
                esModule: false
            }
        )
        .end();

    config.module.rule('image')
        .test(/\.(png|jpe?g|gif|svg)$/)
        .use('url-loader')
        .loader('url-loader')
        .options({
            limit: 8192,
            fallback: 'file-loader',
            name: 'images/[name].[fullhash:8].[ext]',
            publicPath: publicPath,
            esModule: false
        })
        .end();

    config.module.rule('font')
        .test(/\.(woff|woff2|eot|ttf|otf)$/)
        .use('file-loader')
        .loader('file-loader')
        .options({
            name: 'font/[name].[fullhash:8].[ext]',
            publicPath: publicPath,
            esModule: false
        })
        .end();

    config.module.rule('audio')
        .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
        .use('url-loader')
        .loader('url-loader')
        .options({
            limit: 8192,
            fallback: 'file-loader',
            name: 'media/[name].[fullhash:8].[ext]',
            publicPath: publicPath,
            esModule: false
        })
        .end();

    config.plugin('CleanWebpackPlugin')
        .use(CleanWebpackPlugin)
        .end();

    if (havePublic) {
        config.plugin('CopyWebpackPlugin')
            .use(CopyWebpackPlugin, [
                {
                    patterns: [
                        {
                            from: path.join(workDir, '/public'),
                            to: targetDistPath,
                            globOptions: {
                                ignore: ['.*']
                            }
                        }
                    ]
                }
            ])
            .end();
    }

    config.plugin('HtmlWebpackPlugin')
        .use(HtmlWebpackPlugin, [
            {
                hash: false,
                filename: 'index.html',
                template: haveTemplate ? './template.ejs' : path.resolve(__dirname, 'template.ejs'),
                inject: true,
                minify: isProduction ? {
                    removeComments: true,
                    collapseWhitespace: true,
                    minifyCSS: true
                } : undefined
            }
        ])
        .end();

    config.when(
        isProduction,
        (conf) => {
            conf.entry('main').add('./src/' + entryDefaultName);
            conf.output.filename('js/[name].[chunkhash:8].js');
            configExtraStyle(true, 'css');
            configExtraStyle(true, 'less');

            conf.plugin('MiniCssExtractPlugin')
                .use(MiniCssExtractPlugin, [
                    {
                        filename: 'css/[name].[contenthash:8].css',
                        chunkFilename: 'css/[name].[contenthash:8].css'
                    }
                ])
                .end();

            // 内联webpack runtime脚本。此脚本太小，网络请求耗费资源
            // https://github.com/facebook/create-react-app/issues/5358
            conf.plugin('InlineChunkHtmlPlugin')
                .use(InlineChunkHtmlPlugin, [
                    HtmlWebpackPlugin,
                    [/runtime\..*\.js$/]
                ])
                .end();
        },
        (conf) => {
            conf.entry('main').add(webpackDevClientEntry).add('./src/' + entryDefaultName);
            conf.output.filename('js/[name].[fullhash:8].js');
            configExtraStyle(false, 'css');
            configExtraStyle(false, 'less');

            conf.plugin('WebpackBar')
                .use(WebpackBar)
                .end();

            conf.plugin('FriendlyErrorsWebpackPlugin')
                .use(FriendlyErrorsWebpackPlugin, [
                    {
                        compilationSuccessInfo: {
                            messages: ['Your application is running here: http://localhost:8080']
                        }
                    }
                ])
                .end();

            // https://github.com/TypeStrong/ts-loader#usage-with-webpack-watch
            conf.plugin('webpack.WatchIgnorePlugin')
                .use(webpack.WatchIgnorePlugin, [
                        [/\.js$/, /\.d\.ts$/]
                    ]
                )
                .end();
        }
    );

    return config;
};
