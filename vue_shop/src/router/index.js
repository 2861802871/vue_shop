import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import GoodsList from '../components/goods/GoodsList.vue'
import GoodsParams from '../components/goods/GoodsParams.vue'
import GoodsCategories from '../components/goods/GoodsCategories.vue'
import Add from '../components/goods/Add.vue'
import Oders from '../components/oders/Oders.vue'
import Report from '../components/report/Report.vue'

Vue.use(VueRouter)

const routes = [
  // 路由重定向到登录路由
  { path: '/', redirect: '/login' },
  // 登录路由规则
  { path: '/login', component: Login },
  // 主页路由规则
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      // 商品目录
      { path: '/goods', component: GoodsList },
      // 商品参数
      { path: '/params', component: GoodsParams },
      // 商品分类
      { path: '/categories', component: GoodsCategories },
      {path:'/goods/add',component:Add},
      {path:'/orders',component:Oders},
      {path:'/reports',component:Report}
    ]
  }
]

const router = new VueRouter({
  routes
})

// 暴露路由之前先挂载路由导航守卫防止直接访问有权限页面
router.beforeEach((to, from, next) => {
  //to从哪里来路径
  //将要去哪里路径
  //next函数是否放行，next()放行,next('/login')强制跳转
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})


export default router
