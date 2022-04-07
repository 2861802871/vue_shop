// 发布阶段的插件数组
const prodPlugins=[]
// 判断是开发阶段还是发布阶段(production)
if(process.env.NODE_ENV==='production'){
  prodPlugins.push("transform-remove-console")
}
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    ...prodPlugins
  ]
}
