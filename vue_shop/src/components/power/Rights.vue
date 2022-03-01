<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 表格 -->
      <el-table :data="RightsList" :stripe="true" :border="true" style="width: 100%">
        <el-table-column label="序号" type="index" width="60%">
        </el-table-column>
        <el-table-column prop="authName" label="权限名称">
        </el-table-column>
        <el-table-column prop="path" label="路径">
        </el-table-column>
        <el-table-column prop="" label="权限等级">\
          <template slot-scope="scop">
            <el-tag v-if="scop.row.level==='0'">一级</el-tag>
            <el-tag type="success" v-if="scop.row.level==='1'">二级</el-tag>
            <el-tag type="warning" v-if="scop.row.level==='2'">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      RightsList: [],
    }
  },
  created () {
    this.GetRightsList()
  },
  methods: {
    async GetRightsList () {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      this.RightsList = res.data
      console.log(res);
    }
  }
}
</script>

<style lang="less" scoped>
.el-breadcrumb{
  margin-bottom: 15px;
}
</style>