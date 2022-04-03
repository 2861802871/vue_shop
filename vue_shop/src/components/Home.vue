<template>
  <el-container>
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="primary" @click="logout">退出</el-button>
    </el-header>
    <!-- 主体 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollaps?'64px':'180px'">
        <div class="toggle-btton" @click="toggleCollapse">|||</div>

        <el-menu unique-opened :collapse="isCollaps" :collapse-transition="false" :router="true" :default-active="activePath" background-color="#303133" text-color="#fff" active-text-color="#409EFF">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavStatus('/'+subItem.path)"><template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template></el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      menuList: [],
      iconsObj: {
        "125": "el-icon-user-solid",
        "103": "el-icon-s-promotion",
        "101": "el-icon-s-goods",
        "102": "el-icon-s-order",
        "145": "el-icon-s-data",
      },
      // 折叠菜单栏标识
      isCollaps: false,
      // 被激活的链接地址
      activePath: ''
    };
  },

  created () {
    // 获取菜单列表
    this.getMenueList();
    // 获取激活的菜单
    this.activePath = window.sessionStorage.getItem('activePath')
  },

  methods: {
    // 退出登录
    logout () {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    // 获取菜单栏数据列表
    async getMenueList () {
      const { data: res } = await this.$http.get("menus");
      // console.log(res);
      if (res.meta.status !== 200) return $message.error(res.meta.msg);
      this.menuList = res.data;
    },
    // 展开与折叠菜单栏
    toggleCollapse () {
      this.isCollaps = !this.isCollaps
    },
    // 保存path链接的激活状态
    saveNavStatus (activePath) {
      window.sessionStorage.setItem("activePath", activePath)
      this.activePath = activePath
    }
  },
};
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  background-color: #303133;
  // 左右贴边对齐
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 16px;
      font-size: 20px;
      color: #fff;
    }
  }
}
.el-aside {
  background-color: #303133;
}
.el-main {
  background-color: #f2f6fc;
}
// 菜单栏字体图标和文字间距
.iconfont{
  margin-right: 10px;
}
// 解决菜单栏右侧边框线超出1px问题 
.el-menu{
  border-right: 0;
}
// 折叠菜单栏
.toggle-btton{
  background-color: #4a5046;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>