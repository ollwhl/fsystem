<template>
  <div class="admin-view">
    <div class="action-bar">
      <el-input v-model="params.keyword" placeholder="请输入姓名或电话号码" :style="{ width: '50%' }"></el-input>
      <el-button type="warning" class="action-button" @click="search()">查询</el-button>
      <el-button type="primary" class="action-button" @click="add('dialogAddForm')">新增 </el-button>
    </div>

    <el-table :data="tableData":style="{ width: '100%' }" height="700">
      <el-table-column prop="name" label="姓名" width="120"></el-table-column>
      <el-table-column prop="phone" label="电话" width="300"></el-table-column>
      <el-table-column prop="note" label="附录" ></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <div class="action-buttons">
            <el-button type="primary" @click="edit(scope.row)">编辑</el-button>
            <el-button type="danger">显示密码</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="block">
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="params.pageNum"
              :page-sizes="[10, 20, 30, 40]"
              :page-size="params.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
      </el-pagination>
    </div>
    <div>
      <el-dialog title="添加人员" :visible.sync="dialogAddFormVisible">
        <el-form :model="addForm">
          <el-form-item label="人员名称" :label-width="formLabelWidth">
            <el-input v-model="addForm.name" autocomplete="off" clearable></el-input>
          </el-form-item>
          <el-form-item label="人员权限" :label-width="formLabelWidth">
            <el-select v-model="addForm.group" placeholder="管理员">
              <el-option label="管理员" value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="密码" :label-width="formLabelWidth">
            <el-input v-model="addForm.password" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="电话" :label-width="formLabelWidth">
            <el-input v-model="addForm.phone" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="附录" :label-width="formLabelWidth">
            <el-input v-model="addForm.note" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogAddFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitAddForm('dialogAddForm')">确 定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<style>
  .admin-view {
    padding: 20px;
  }

  .action-bar {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  .action-button {
    margin-left: 10px;
  }

  .action-buttons {
    display: flex;
    justify-content: space-between;
  }
</style>

<script>
  import request from "@/utils/request";

  export default {
    name: "AdminView",
    data() {
      return {
        params:{
          keyword:"",
          pageNum: 1,
          pageSize: 10,
        },

        tableData: [],
        total: 0,

        addForm:{
          id: "",
          name: "",
          group: "",
          phone: "",
          note: "",
          password: "123456",
        },
        successMsg:"",
        dialogAddFormVisible: false,
        formLabelWidth: '120px',
      }
    },
    created() {//页面创建时调用的方法
      this.load()
    },

    methods:{
      load(){
        request.get("user/admin",{//get获取
          params: this.params
        }).then(res=> {//使用get方法请求/amdin
          if (res.code === '0'){
            this.tableData =res.data.list//更新表格
            this.total =res.data.total//更新总条数
          }
        })
      },
      handleSizeChange(pageSize){
        this.params.pageSize = pageSize
        this.load()
      },
      handleCurrentChange(pageNum){
        this.params.pageNum = pageNum
        this.load()
      },
      search(){
        request.get("user/admin/search",{
          params: this.params
        }).then(res => {
          if (res.code === '0') {
            this.tableData = res.data.list//从返回的数据更新到当前页面
            this.total =res.data.total//更新所有返回数据的总条数
          }else{

          }
        })
      },
      add(dialogName){
        this.form = {}
        this[`${dialogName}Visible`] = true
        this.successMsg = "添加成功"
      },//多个表格调用同一个方法更改数据${}连接字符串
      edit(obj){
        this.addForm = obj
        this.dialogAddFormVisible=true
        this.successMsg = "修改成功"
      },
      submitAddForm(dialogName){//提交表单调用该方法
        request.post("user/add",{
          name: this.addForm.name,
          group: this.addForm.group,
          note: this.addForm.note,
          password: this.addForm.password,
          phone: this.addForm.phone,
          id: this.addForm.id
        }).then(res =>{
          if(res.code === '0'){
            this[`${dialogName}Visible`] = false
            this.$message({
              message: this.successMsg,
              type: 'success'
            });
        }else{
            this.$message({
              message: res.msg,
              type: 'error'
            });
          }
          this.load()
        })
      }
    }
  }
</script>
