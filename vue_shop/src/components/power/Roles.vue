<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="AddRole">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-row>
        <el-table type="expand" :data="RolesList" :stripe="true" :border="true">
          <el-table-column type="expand" label="展开">
            <template slot-scope="scope">
              <!-- 栅格系统 -->
              <el-row :class="['bdbottom',i1==0?'bdtop':'','vcenter']" v-for="(item1, i1) in scope.row.children" :key="i1">
                <!-- 一级权限 -->
                <el-col :span="5">
                  <el-tag closable @close="RemoveRightByid(scope.row,item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 二级和三级权限 -->
                <el-col :span="19">
                  <el-row :class="[i2==0?'':'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="i2">
                    <el-col :span="6">
                      <el-tag closable type="success" @close="RemoveRightByid(scope.row,item2.id)">{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <!-- 三级权限 -->
                    <el-col :span="18">
                      <el-tag closable type="warning" v-for="(item3,i3) in item2.children" :key="i3" @close="RemoveRightByid(scope.row,item3.id)">{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
              <!-- <pre>{{scope.row}}</pre> -->
            </template>
          </el-table-column>
          <el-table-column type="index" label="序号">
          </el-table-column>
          <el-table-column prop="roleName" label="角色名称">
          </el-table-column>
          <el-table-column prop="roleDesc" label="角色描述">
          </el-table-column>
          <el-table-column label="操作" width="300px">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" icon="el-icon-edit" @click="EditRoles(scope.row)">编辑</el-button>
              <el-button type="danger" size="mini" icon="el-icon-delete" @click="DeleteRoles(scope.row)">删除</el-button>
              <el-button type="warning" size="mini" icon="el-icon-setting" @click="ShowSetRightDialog(scope.row)">分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="SetRioghtDialogVisible" width="50%" @close="SetRioghtDialogClosed">
      <!-- :before-close="" -->
      <!-- 树型控件 -->
      <el-tree show-checkbox ref="TreeRef" :default-expand-all="true" :data="RightsList" :props="TreeProps" node-key="id" :default-checked-keys="DefKeys"></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="SetRioghtDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="AllotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="EditRooleDialogVisible" width="50%" @close="CloseEditRooleDialog">
      <!-- 编辑角色表单 -->
      <el-form ref="EditRoleRef" :model="RoleInfo" label-width="80px" :rules="EditRooleRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="RoleInfo.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="RoleInfo.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="EditRooleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="UploadEditRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色对话框 -->
    <el-dialog title="提示" :visible.sync="AddRoleDialogVisible" width="50%" @close="AddRoleClose">
      <!-- close="AddRoleClose" -->
      <!-- 添加表单 -->
      <el-form ref="AddRoleRef" :model="AddRoleForm" label-width="80px" :rules="EditRooleRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="AddRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="AddRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="AddRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="AddRoleUpload">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 角色列表
      RolesList: [],
      // 分配权限对话框显示与否
      SetRioghtDialogVisible: false,
      // 所有权限列表
      RightsList: [],
      // 设置树形控件绑定的字段
      TreeProps: {
        children: 'children',//节点显示值
        label: 'authName'//子节点
      },
      // 树形控件默认选中的节点,数组存放之前绑定的id,通过地柜函数获取
      DefKeys: [],
      // 获取角色权限列表时保存角色id
      RoleId: '',
      // 编辑角色暂存角色信息
      RoleInfo: {},
      // 编辑角色对话框显示与否
      EditRooleDialogVisible: false,
      // 添加角色对话框显示与否
      AddRoleDialogVisible: false,
      // 添加的角色数据暂存
      AddRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 修改角色和添加角色表单验证
      EditRooleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.GetRolesList()
  },
  methods: {
    // 获取角色列表
    async GetRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.RolesList = res.data
      // console.log(res);
    },
    // 删除权限
    RemoveRightByid (role, rightid) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightid}`)
        console.log(res);
        if (res.meta.status !== 200) return this.$message.error('删除权限失败')
        // 刷新数据会改变原本展开状态
        // this.GetRolesList()
        // 解决方法对这个角色重新赋值
        // 对个该行数据重新赋值避免刷新整个表格
        role.children = res.data
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
    // 显示分配权限对话框
    async ShowSetRightDialog (role) {
      // 先将角色id保存起来供后面使用
      this.RoleId = role.id
      // 获取所有权限列表
      const { data: res } = await this.$http.get('rights/tree')
      console.log(res);
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败！')
      this.RightsList = res.data

      // 调用获取三级权限id数组
      this.GetleafKeys(role, this.DefKeys)

      this.SetRioghtDialogVisible = true
    },
    //  递归函数 获取所以有三级权限id 在分配权限方法中调用
    GetleafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.GetleafKeys(item, arr)
      });
    },
    // 关闭权限分配对话框清空三级权限id数组、DefKeys
    SetRioghtDialogClosed () {
      this.DefKeys = []
    },
    // 获取树型组件选中id,版选中id
    async AllotRights () {
      const keys = [
        ...this.$refs.TreeRef.getCheckedKeys(),
        ...this.$refs.TreeRef.getHalfCheckedKeys()
      ]
      const IdStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.RoleId}/rights`, { rids: IdStr })
      console.log(res);
      if (res.meta.status !== 200) return this.$message.error('修改角色权限失败！')
      // 刷新权限列表
      this.GetRolesList()
      this.$message.success('修改角色权限成功')
      this.SetRioghtDialogVisible = false
    },
    // 删除角色
    DeleteRoles (role) {
      // console.log(role);
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`roles/${role.id}`)
        if (res.meta.status !== 200) return this.$message.error('删除角色失败')
        this.GetRolesList()
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
    // 编辑角色
    EditRoles (role) {
      // 保存角色信息
      this.RoleInfo = role
      this.EditRooleDialogVisible = true
    },
    // 上传编辑角色信息
    UploadEditRole () {
      this.$refs.EditRoleRef.validate(async (valid) => {
        if (!valid) return this.$message.error('添加角色数据验证失败')//用户数据预验证不通过
        const { data: res } = await this.$http.put(`roles/${this.RoleInfo.id}`, {
          roleName: this.RoleInfo.roleName,
          roleDesc: this.RoleInfo.roleDesc
        })
        if (res.meta.status !== 200) return this.$message.error('修改失败')
        this.$message.success('修改成功')
        // 关闭对话框
        this.EditRooleDialogVisible = false
      })
    },
    // 关闭编辑角色对话框清除数据
    CloseEditRooleDialog () {
      this.$refs.EditRoleRef.resetFields()
      // this.RoleInfo = {}
    },
    // 添加角色
    AddRole () {
      this.AddRoleDialogVisible = true
    },
    // 提交信息
    async AddRoleUpload () {
      this.$refs.EditRoleRef.validate(async (valid) => {
        if (!valid) return this.$message.error('添加角色数据验证失败')//用户数据预验证不通过
        console.log(this.AddRoleForm);
        const { data: res } = await this.$http.post('roles', this.AddRoleForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success('添加角色成功')
        // 刷新
        this.GetRolesList()
        // 关闭对话框
        this.AddRoleDialogVisible = false
      })
    },
    // 关闭添加角色对话框清除表单数据
    AddRoleClose () {
      this.$refs.AddRoleRef.resetFields()
    }

  }
}
</script>

<style lang="less" scoped>
  .el-breadcrumb{
    margin-bottom: 15px;
  }

  .el-tag{
    margin: 7px;
  }

  .bdtop{border-top: 1px solid #eee;}

  .bdbottom{border-bottom: 1px solid #eee;}

  .vcenter{
    display: flex;
    align-items: center;
  }
</style>