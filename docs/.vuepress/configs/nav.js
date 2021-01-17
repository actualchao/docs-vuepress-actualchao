const navs = [
  { text: 'Home', link: '/' },
  { text: '近期文章', link: '/recent/' },
  { text: '我的开源', link: '/package/' },
  {
    text: '前端',
    items: [
      // { text: 'CSS', link: '/fontend/css/' },
      { text: 'JavaScript', link: '/fontend/javascript/' },
      { text: 'Node', link: '/node/' },
      { text: 'HTTP', link: '/http/' },
      // { text: '前端框架', link: '/fontend/framework/' },
      // 

    ],
  },
  { text: '工具', link: '/tools/' },
  { text: '算法', link: '/rsa/' },
  { text: 'VUE', link: '/vue/' },
  {
    text: '可视化',
    items: [
      { text: 'three', link: '/webgl/three/' }
    ]
  },
  { text: '地图', link: '/map/' },
  // { text: '服务', link: '/server/' },
  { text: 'github', link: 'https://github.com/actualchao/docs-vuepress-actualchao' }
]

process.env.NODE_ENV === 'development' && navs.splice(-1, 0, { text: '刷题', link: '/topic/' },)


module.exports = navs