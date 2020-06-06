const path = require('path');
const pjson = require('../package.json');

let ROOT = process.env.PWD;

if (!ROOT) {
  ROOT = process.cwd();
}

const config = {
  site_name: 'Movement For Our Future',
  site_description: pjson.description,
  site_url: pjson.homepage,
  googleAnalyticsUA: '',
  viewport: 'width=device-width,initial-scale=1',
  favicon: path.join(ROOT, '/src/images/favicon.png'),
  dev_host: 'localhost',
  port: process.env.PORT || 8000,
  env: process.env.NODE_ENV,
  root: ROOT,
  paths: {
    config: 'config',
    src: 'src',
    dist: 'dist',
  },
  package: pjson,
};

module.exports = config;
