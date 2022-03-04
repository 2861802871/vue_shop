<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="AddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <el-row>
        <!-- 表格 -->
        <tree-table :class="['margintop15px']" :data="CateList" :columns="columns" :selection-type="false" :expand-type="false" :show-row-hover="false" index-text="序号" :show-index="true" border :stripe="true">
          <!--有效性 自定义末班作用域插槽  模板名slot="isok"  接收当前行的数据-->
          <template slot="isok" slot-scope="scope">
            <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:yellowgreen"></i>
            <i class="el-icon-error" v-if="scope.row.cat_deleted===true" style="color:red"></i>
          </template>
          <!-- 排序模板 -->
          <template slot="oder" slot-scope="scope">
            <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
            <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
            <el-tag size="mini" type="warning" v-else-if="scope.row.cat_level===2">三级</el-tag>
          </template>
          <!-- 操作 -->
          <template slot="operate" slot-scope="scope">
            <el-button size="mini" icon="el-icon-edit" type="primary" @click="EditCateDialog(scope.row)">编辑</el-button>
            <el-button size="mini" icon="el-icon-delete" type="danger" @click="DeleteCate(scope.row.cat_id)">删除</el-button>
          </template>
        </tree-table>

      </el-row>
      <!-- 分页功能 -->
      <el-pagination :class="['margintop15px']" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="QuerInfo.pageum" :page-sizes="[3, 5,8,10,38,100,200, 300, 400]" :page-size="QuerInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="AddCateDialogVisible" width="50%" @close="AddCateFormClose">
      <!-- 添加分类的表单 -->
      <el-form :model="AddCateForm" :rules="AddCateFormRules" ref="AddCateFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="AddCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择器 :options数据源 -->
          <el-cascader v-model="SelectedKeys" :options="PrentCataList" :props="CascaderProps" @change="ParentCateChanged" clearable change-on-select></el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="AddCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="AddCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类的对话框 -->
    <el-dialog title="修改分类" :visible.sync="EditCateDialogVisible" width="50%" @close="EditCateFormClose">
      <!-- 编辑分类表单 -->
      <el-form :model="EditCateForm" :rules="AddCateFormRules" ref="EditCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="EditCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="EditCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="EditCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 删除分类确认框 -->
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 分页数据
      QuerInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 8
      },
      // 分类列表
      CateList: [],
      // 分类数据总条数
      total: 0,
      // 表格列数的创建以及参数绑定数组
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        {//将当前列定义为末班列，
          label: '是否有效',
          type: 'template', template: 'isok'
        },
        { label: '排序', type: 'template', template: 'oder' },
        { label: '操作', type: 'template', template: 'operate' },

      ],
      // 添加分类对话框显示与否
      AddCateDialogVisible: false,
      // 添加分类对话框显示与否
      EditCateDialogVisible: false,
      // 添加分类数据暂存
      AddCateForm: {
        cat_pid: 0,//分类父级id，若添加1级则父级为0
        cat_name: '',//分类名称
        cat_level: 0//分类层级，0一级,1,2
      },
      // 编辑分类表单数据
      EditCateForm: {
        cat_id: 0,
        cat_name: '',
      },
      // 添加分类数表单验证规则
      AddCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ]
      },
      // 父级数据列表
      PrentCataList: [],
      // 级联选择器配置
      CascaderProps: {
        expandTrigger: 'hover',//显示方式
        value: 'cat_id',//选中值
        label: 'cat_name',//展示值
        children: 'children'//嵌套值
      },
      // 级联选择器选择的值
      SelectedKeys: []
    }
  },
  created () {
    this.GetCateList()
  },
  methods: {
    // 获取分类列表
    async GetCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.QuerInfo })
      if (res.meta.status !== 200) return this.$message.error('获取分类列表失败！')
      // this.$message.success('获取分类列表数据成功')
      this.CateList = res.data.result
      this.total = res.data.total
      console.log(res);
      console.log(this.total);
    },
    // 当调整每页显示多少条数据时触发
    handleSizeChange (NewSize) {
      this.QuerInfo.pagesize = NewSize
      // 刷新数据
      this.GetCateList()
    },
    // 当操作分页，页数变化时触发函数
    handleCurrentChange (NewNum) {
      this.QuerInfo.pagenum = NewNum
      // 刷新数据
      this.GetCateList()
    },
    // 添加分类方法
    async AddCateDialog () {
      this.AddCateDialogVisible = true
      // 获取父级分类,获取所有一二级分类
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      console.log(res);
      this.PrentCataList = res.data
    },
    // 级联选择器id发生变化时触发
    ParentCateChanged (NewKeys) {
      // 如果NewKeys长度大于0则证明选中了父级则更新数据
      if (this.SelectedKeys.length > 0) {
        this.AddCateForm.cat_pid = this.SelectedKeys[this.SelectedKeys.length - 1]
        this.AddCateForm.cat_level = this.SelectedKeys.length
      }
      else {
        this.AddCateForm.cat_pid = 0
        this.AddCateForm.cat_level = 0
      }
    },
    // 添加分类
    AddCate () {
      this.$refs.AddCateFormRef.validate(
        async valid => {
          if (!valid) return this.$message.error('数据校验失败!')
          const { data: res } = await this.$http.post('categories', this.AddCateForm)
          console.log(res);
          if (res.meta.status !== 201) return this.$message.error('添加分类失败！' + res.meta.msg)
          this.$message.success('添加分类成功')
          // 刷新数据
          this.GetCateList()
          // 关闭对话框
          this.AddCateDialogVisible = false
        })
    },
    // 关闭添加分类对话框重置表单
    AddCateFormClose () {
      this.$refs.AddCateFormRef.resetFields()
      this.AddCateForm.cat_pid = 0
      this.AddCateForm.cat_level = 0
      this.SelectedKeys = []
    },

    //----------------------编辑分类-------------------------
    // 编辑分类方法
    EditCateDialog (CateInfo) {
      this.EditCateDialogVisible = true
      this.EditCateForm.cat_id = CateInfo.cat_id
      this.EditCateForm.cat_name = CateInfo.cat_name
      // console.log(CateInfo);
    },
    // 提交修改数据
    async EditCate () {
      // console.log(this.EditCateForm);
      this.$refs.EditCateFormRef.validate(async valid => {
        if (!valid) return this.$message.error('数据校验失败！')
        //数据校验通过后
        const { data: res } = await this.$http.put(`categories/${this.EditCateForm.cat_id}`, { cat_name: this.EditCateForm.cat_name })
        console.log(res);
        if (res.meta.status !== 200) return this.$message.error('修改失败！' + res.meta.msg)
        this.$message.success('修改成功！')
        // 刷新数据
        this.GetCateList()
        this.EditCateDialogVisible = false
      })
    },
    // 关闭对话框重置表单
    EditCateFormClose () {
      this.$refs.EditCateFormRef.resetFields()
    },
    //----------------删除分类操作-----------------
    DeleteCate (cat_id) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${cat_id}`)
        if (res.meta.status !== 200) return this.$message.error('删除失败！' + res.meta.msg)
        this.GetCateList()
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    }

  }
}



</script>

<style lang="less" scoped>
.margintop15px{
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}
</style>