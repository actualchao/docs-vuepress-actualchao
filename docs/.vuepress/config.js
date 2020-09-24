const navConfig = require('./configs/nav')
const pluginConfig = require('./configs/plugin')

module.exports = {
  title: 'Actual_Chao',
  description: 'Just playing around',
  themeConfig: {
    sidebar: 'auto',
    logo: '/logo.png',
    nav: navConfig
  },
  plugins: pluginConfig
}