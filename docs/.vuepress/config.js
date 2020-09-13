module.exports = {
  title: 'Promise+Generator+async',
  description: 'Promise+Generator+async 原理',
  themeConfig: {
    sidebar: [
      {
        title: 'Promise',   // 必要的
        path: '/promise/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
        collapsable: false, // 可选的, 默认值是 true,
        sidebarDepth: 1,    // 可选的, 默认值是 1
      },
      {
        title: 'Generator',
        path: '/generator/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
        collapsable: false, // 可选的, 默认值是 true,
        sidebarDepth: 1,    // 可选的, 默认值是 1
      }
    ]
  }
}