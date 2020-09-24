const plugins = [
  // 文档地址: https://shanyuhai123.github.io/vuepress-plugin-auto-sidebar/features/plugin-options.html#%E6%A6%82%E8%A7%88
  [
    'vuepress-plugin-auto-sidebar',
    {
      titleMode: 'titlecase', // 标题模式
      collapsable: true, // 设置为true,开启折叠
      // sidebarDepth: 0, // 标题的深度
      collapseList: [
        // 折叠的路由列表
        // "/frontend/css/"
      ],
      uncollapseList: [
        // 不折叠的路由列表
      ],
    },
  ],

  // 为你的 VuePress 站点增加目录组件,支持在md和vue中写<TOC />,生成目录树
  'vuepress-plugin-table-of-contents',
  'markdown-it-emoji',
  'vuepress-plugin-git-log',
  {
    additionalArgs: '--no-merge',
    onlyFirstAndLastCommit: true,
  },
]

module.exports = plugins