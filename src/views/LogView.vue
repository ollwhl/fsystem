<template>
  <div class="notice-view">
    <div class="action-bar">
      <el-input v-model="params.keyword" placeholder="请输入姓名或操作" :style="{ width: '25%' }"></el-input>
      <el-button type="warning" class="action-button" @click="search()">查询</el-button>
    </div>
    <!-- 生产进度条 -->
    <el-progress v-if="showProgressbar" :percentage="progressPercentage" />

    <el-table :data="tableData":style="{ width: '100%' }" height="700">
      <el-table-column prop="userName" label="姓名" width="120"></el-table-column>
      <el-table-column prop="logMsg" label="操作信息" width="300"></el-table-column>
      <el-table-column prop="time" label="操作时间" width="300"></el-table-column>
      <el-table-column prop="ip" label="ip地址" width="300"></el-table-column>
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
  name: "logView",
  data() {
    return {
      params:{
        keyword:"",
        pageNum: 1,
        pageSize: 10,
      },

      tableData: [],
      total: 0,
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
      const noticeUrl="log"
      request.get(noticeUrl,{
        params: this.params
      }).then(res=> {
        if (res.code === '0'){
          this.tableData =res.data.list
          this.total =res.data.total
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
      request.get("log/searchLog",{
        params: this.params
      }).then(res => {
        if (res.code === '0') {
          this.tableData = res.data.list
          this.total =res.data.total
        }else{

        }
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
