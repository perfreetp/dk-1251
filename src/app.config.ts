export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/category/index',
    'pages/favorites/index',
    'pages/records/index',
    'pages/detail/index',
    'pages/quiz/index',
    'pages/overview/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFF8F0',
    navigationBarTitleText: '宠物知识问答',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#7F8C8D',
    selectedColor: '#FF9B6A',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '提问'
      },
      {
        pagePath: 'pages/category/index',
        text: '分类'
      },
      {
        pagePath: 'pages/favorites/index',
        text: '收藏'
      },
      {
        pagePath: 'pages/records/index',
        text: '记录'
      }
    ]
  }
})
