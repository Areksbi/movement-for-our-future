const webpack = require('webpack');
const cssnano = require('cssnano');
const glob = require('glob');
const path = require('path');
const fs = require('fs');

const WebpackBar = require('webpackbar');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const WebappWebpackPlugin = require('webapp-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const RobotstxtPlugin = require('robotstxt-webpack-plugin');
const SitemapPlugin = require('sitemap-webpack-plugin').default;

const config = require('./site.config');

const hmr = new webpack.HotModuleReplacementPlugin();

const optimizeCss = new OptimizeCssAssetsPlugin({
  assetNameRegExp: /\.css$/g,
  cssProcessor: cssnano,
  cssProcessorPluginOptions: {
    preset: [
      'default',
      {
        discardComments: {
          removeAll: true,
        },
      },
    ],
  },
  canPrint: true,
});

const robots = new RobotstxtPlugin({
  sitemap: `${config.site_url}/sitemap.xml`,
  host: config.site_url,
});

const clean = new CleanWebpackPlugin();

const stylelint = new StyleLintPlugin();

const cssExtract = new MiniCssExtractPlugin({
  filename: 'style.[contenthash].css',
});

const paths = [];
const generateHTMLPlugins = () => glob.sync('./src/**/*.pug').map((dir) => {
  const pathToFile = path.relative(process.cwd(), dir);
  const filename = pathToFile.replace('pug', 'html').replace('src/', '');

  paths.push(pathToFile);

  return new HTMLWebpackPlugin({
    filename,
    template: path.join(config.root, pathToFile),
    meta: {
      viewport: config.viewport,
    },
  });
});

const sitemap = new SitemapPlugin(config.site_url, paths, {
  priority: 1.0,
  lastmodrealtime: true,
});

const favicons = new WebappWebpackPlugin({
  logo: config.favicon,
  prefix: 'images/favicons/',
  favicons: {
    appName: config.site_name,
    appDescription: config.site_description,
    developerName: null,
    developerURL: null,
    icons: {
      android: true,
      appleIcon: true,
      appleStartup: false,
      coast: false,
      favicons: true,
      firefox: false,
      windows: false,
      yandex: false,
    },
  },
});

const webpackBar = new WebpackBar({
  color: '#ff6469',
});

const CODE = `<script>(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga');ga('create','{{ID}}','auto');ga('send','pageview');</script>`;

class GoogleAnalyticsPlugin {
  constructor({ id }) {
    this.id = id;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('GoogleAnalyticsPlugin', (compilation) => {
      HTMLWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'GoogleAnalyticsPlugin',
        (data, cb) => {
          data.html = data.html.replace('</head>', `${CODE.replace('{{ID}}', this.id) }</head>`);
          cb(null, data);
        },
      );
    });
  }
}

const google = new GoogleAnalyticsPlugin({
  id: config.googleAnalyticsUA,
});

module.exports = [
  clean,
  stylelint,
  cssExtract,
  ...generateHTMLPlugins(),
  fs.existsSync(config.favicon) && favicons,
  config.env === 'production' && optimizeCss,
  config.env === 'production' && robots,
  config.env === 'production' && sitemap,
  config.googleAnalyticsUA && google,
  webpackBar,
  config.env === 'development' && hmr,
].filter(Boolean);