<template>
  <div class="notice-view">
    <div class="action-bar">
      <el-input v-model="addForm.title" placeholder="请输入公告标题" :style="{ width: '50%' }"></el-input>

      <el-button type="primary" class="action-button" @click="add('dialogAddForm')">新增 </el-button>
    </div>
    <!-- 生产进度条 -->
    <el-progress v-if="showProgressbar" :percentage="progressPercentage" />

    <el-table :data="tableData":style="{ width: '100%' }" height="700">
      <el-table-column prop="title" label="公告标题" width="120"></el-table-column>
      <el-table-column prop="msg" label="公告内容" width="300"></el-table-column>
      <el-table-column prop="time" label="发布时间" width="300"></el-table-column>

      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <div class="action-buttons">
            <el-button type="danger" @click="showDeleteConfirm(scope.row)">删除</el-button>

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
      <el-dialog title="新增公告" :visible.sync="dialogAddFormVisible">
        <el-form :model="addForm">



          <el-form-item label="公告内容" :label-width="formLabelWidth">
            <el-input type="textarea" v-model="addForm.msg" autocomplete="off"></el-input>
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
  name: "StuffView",
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
        title: "",
        msg:"",
      },
      successMsg:"",
      dialogAddFormVisible: false,
      formLabelWidth: '120px',

      showProgressbar: false, // 是否显示生产进度条
      progressPercentage: 0, // 生产进度百分比
    }
  },
  created() {//页面创建时调用的方法
    this.load()
  },

  methods:{
    load(){
      const noticeUrl="notice"
      request.get(noticeUrl,{
        params: this.params
      }).then(res=> {
        if (res.code === '0'){
          this.showProgress().then(()=> {
            this.tableData = res.data.list
            this.total =res.data.total//更新总条数
          })
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

    add(dialogName){
      this.form = {}
      this[`${dialogName}Visible`] = true
      this.successMsg = "添加成功"

    },
    // 显示删除确认对话框
    showDeleteConfirm(row) {
      this.$confirm('确定要删除这条公告吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
          .then(() => {
            // 用户点击了确定按钮，执行删除操作
            this.deleteNotice(row);
          })
          .catch(() => {
            // 用户点击了取消按钮，取消删除操作
          });
    },

    // 删除公告
    deleteNotice(row) {
      // 向后端发送删除请求
      // 请替换以下示例中的请求方法和URL
      request.post(`/notice/delNotice`,{
        title:row.title
      })
          .then((res) => {
            if (res.code === '0') {
              this.$message({
                type: 'success',
                message: '删除成功',
              });
              // 删除成功后，刷新公告列表
              this.load();
            } else {
              this.$message.error('删除失败');
            }
          })
          .catch((error) => {
            this.$message.error('删除失败');
            console.error('删除请求失败：', error);
          });
    },


    submitAddForm(dialogName){
      console.log(this.addForm.title)
      request.post("notice/addNotice",{
        title: this.addForm.title,
        msg: this.addForm.msg,

      }).then(res =>{
        if(res.code === '0'){
          this.addForm.title = "";
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
    },
    showProgress() {
      return new Promise((resolve) => {
        this.showProgressbar = true; // 设置为显示生产进度条
        this.progressPercentage = 0; // 重置进度为0

        // 模拟生产进度更新，实际中需要根据您的业务逻辑来更新进度
        const interval = setInterval(() => {
          if (this.progressPercentage < 100) {
            this.progressPercentage += 10; // 每次增加10%
          } else {
            clearInterval(interval); // 达到100%后停止更新
            this.showProgressbar = false;
            resolve(); // 进度条完成后调用resolve
          }
        }, 120); // 更新频率，可以根据需要调整
      });
    },
  }
}
</script>
