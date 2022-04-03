<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="只能选择三级分类" type="warning" :show-icon="true" :closable="false">
      </el-alert>

      <!-- 级联选择器 -->
      <el-row>
        <el-col>
          <div class="block">
            <span class="demonstration" style="margin-right:10px;">选择商品分类:</span>
            <el-cascader v-model="SelectedKeys" :options="PrentCataList" :props="CascaderProps" @change="handleChange"></el-cascader>
          </div>
        </el-col>
      </el-row>
      <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtDisable" @click="AddDialogVisible = true">添加动态参数</el-button>
          <!-- 动态表格数据 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染标签 -->
                <el-tag closable v-for="(item ,i) in scope.row.attr_vals" :key="i" @close="handleClose(i,scope.row)">{{item}}</el-tag>
                <!-- 添加标签 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column prop="attr_name" label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delate" size="mini" @click="deleteData(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtDisable" @click="AddDialogVisible = true">添加静态属性</el-button>
          <!-- 静态表格数据 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag closable v-for="(item ,i) in scope.row.attr_vals" :key="i" @close="handleClose(i,scope.row)">{{item}}</el-tag>
                <!-- 添加标签 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column prop="attr_name" label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delate" size="mini" @click="deleteData(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加动态参数和静态属于性面板 -->
    <el-dialog :title="'添加'+titleText" :visible.sync="AddDialogVisible" width="50%" @close="addDialogClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="120px">
        <el-form-item :label="titleText+'名称'" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="AddDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="AddManyOrOnly">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改动态参数和静态属于性面板 -->
    <el-dialog :title="'修改'+titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="120px">
        <el-form-item :label="titleText+'名称'" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editManyOrOnly">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
export default {
  data () {
    return {
      // 父级数据列表
      PrentCataList: [],
      // 级联选择器配置
      CascaderProps: {
        expandTrigger: 'hover',//显示方式
        value: 'cat_id',//选中值
        label: 'cat_name',//展示值
        children: 'children'//嵌套值
      },
      // 级联选择器选择的绑定值
      SelectedKeys: [],
      // 激活的页签
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      // 添加属性参数对话框显示与否
      AddDialogVisible: false,
      // 修改动态参数和静态属对话框显示与否
      editDialogVisible: false,
      // 添加属性参数表单数据
      addForm: {
        attr_name: ''
      },
      // 修改表单参数
      editForm: {
        attr_name: ''
      },
      // 表单验证规则
      addFormRules: {
        attr_name: [{
          required: true, message: `请输入参数名称`, trigger: 'blur'
        }]
      },
      // 后续已替换
      // // 添加标签按钮和输入框切换显示
      // inputVisible: false,
      // // 添加标签绑定值
      // inputValue: '',
    }
  },
  created () {
    this.GetCateList()
  },
  methods: {
    // // 获取商品分类列表
    async GetCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取分类列表失败！')
      console.log(res);
      this.PrentCataList = res.data

    },
    // 级联选择器选择值发生变化时
    async handleChange () {
      // 选中非三级分类直接清空然后退出
      if (this.SelectedKeys.length != 3) {
        this.SelectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('请求失败！')
      // 将数据中的字符串转换为数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 或
        // if (item.attr_vals) {
        //   item.attr_vals = item.attr_vals.split(',')
        // }
        // 添加控制添加tag标签输入框显示隐藏的控制值
        item.inputVisible = false
        item.inputValue = ''
      });

      if (this.activeName === 'many')
        this.manyTableData = res.data
      else
        this.onlyTableData = res.data
      console.log(this.manyTableData);
    },
    // 点击页签处理函数
    handleTabClick () {
      console.log(this.activeName);
      this.handleChange();
    },
    //-----------添加--------------------------------------
    // 添加动态参数或静态属性
    AddManyOrOnly () {
      this.$refs.addFormRef.validate(async vali => {
        if (!vali) return this.$message.error('表单验证未通过请重新输入！')
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        // console.log(res);
        // 刷新数据
        this.handleChange();
        this.$message.success('添加成功')
        this.AddDialogVisible = false
      })
    },
    // 关闭对话框重置表单
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    //-------------修改------------------------------------
    // 显示修改对话框
    async showEditDialog (attrid) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrid}`, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数失败！')
      this.editForm = res.data
    },
    // 修改参数名称
    editManyOrOnly () {
      this.$refs.editFormRef.validate(async vali => {
        if (!vali) return this.$message.error('表单验证未通过请重新输入！')
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
        // console.log(res);
        if (res.meta.status !== 200) return this.$message.error('修改失败')
        // 刷新数据
        this.handleChange();
        this.$message.success('修改成功')
        this.editDialogVisible = false
      })
    },
    // 关闭对话框重置表单
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    //-----------------删除-----------------------------
    deleteData (attr_id) {
      this.$confirm('此操作将永久删除件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
        if (res.meta.status !== 200) return
        // 刷新数据
        this.handleChange();
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
    },
    //------添加标签-----------------
    // 显示输入框
    showInput (row) {
      row.inputVisible = true
      //$nextTick只有页面元素被重新渲染后才会执行回调函数的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 输入框失去焦点或回车显示按钮
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''//清空输入框
        row.inputVisible = false
        return//退出
      }
      //输入合法继续做后续添加
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 上传数据
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(',')
      })
      console.log(res);
      if (res.meta.status !== 200) return this.$message.error('数据上传失败')
      this.$message.success('添加成功')
    },
    //----------删除标签---------
    async handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      // 上传数据
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(',')
      })
      console.log(res);
      if (res.meta.status !== 200) return this.$message.error('数据上传失败')
      this.$message.success('删除成功')
    }
  },

  //----------------计算属性-----------------------------
  // 计算属性
  computed: {
    // 如果没有选中三级属性则禁用添加按钮，否则启用
    isBtDisable () {
      if (this.SelectedKeys.length != 3)
        return true
      return false
    },
    // 返回id
    cateId () {
      if (this.SelectedKeys.length === 3)
        return this.SelectedKeys[2]
      return null
    },
    // 返回动态参数或静态属性字符串
    titleText () {
      if (this.activeName === 'many')
        return '动态参数'
      return '静态属性'
    }

  }
}
</script>

<style lang="less" scoped>
// .el-alert{
//   width: 50%;
// }
.el-row{
  margin: 15px 0;
}
.el-tag{margin: 10px;}
.input-new-tag{width: 150px;}
</style>