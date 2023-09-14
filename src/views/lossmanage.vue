<template>
  <div>
    <div class="container">

      <!-- 生产进度条 -->
      <el-progress v-if="showProgressbar" :percentage="progressPercentage" />

    </div>



    <el-table
        :data="tableData"
        height="1000"
        border
        style="width: 100%"
        class="parts-table"
    >
      <el-table-column prop="name" label="零件名" width="180"></el-table-column>
      <el-table-column prop="id" label="编码"></el-table-column>
      <el-table-column prop="standard" label="规格"></el-table-column>
      <el-table-column prop="num" label="数量" width="180"></el-table-column>
      <el-table-column prop="group" label="仓库"></el-table-column>
      <el-table-column prop="lost" label="损耗"></el-table-column>
      <el-table-column prop="min"  label="当前所需零件数量"></el-table-column>
      <el-table-column prop="note" label="备注"></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="action" @click="clearLoss(scope.row)">清空损耗</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="block">
      <span class="demonstration"></span>
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


<script>
import request from "@/utils/request";
export default {
  name:"PartsView",
  data(){
    return {
      params:{
        group:"",
        keyword:"",
        pageNum:1,
        pageSize:10,
      },
      total: 0,
      successMsg:"",
      addVisible: false,
      id:"",
      stockOrderVisible: false, // 控制备货单弹窗显示状态
      stockOrderList: [],// 用于存储符合条件的零件列表
      countNum:"",//出入库
      min:"",
      addInput:"",
      redInput:"",
      tableData: [],
      confirmNum:"", //交付确认
      user:localStorage.getItem("user")?JSON.parse(localStorage.getItem("user")):{},

      showProgressbar: false, // 是否显示生产进度条
      progressPercentage: 0, // 生产进度百分比

    }
  },
  created() {//页面创建时调用的方法
    this.load()
  },
  methods:{
      load(){
        request.get("parts/getPartsByLost",{//get获取
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
    cancel(row, popoverName) {
      row.addInput = "";
      row.redInput = "";
      row[`${popoverName}Visible`] = false;
    },


    handleSizeChange(pageSize){
      this.params.pageSize = pageSize
      this.load()
    },
    handleCurrentChange(pageNum){
      this.params.pageNum = pageNum
      this.load()
    },
    clearLoss(row) {
      // 重置前端数据
      row.lost = 0; // 将其设置为0以清空损耗值

      // 准备要发送到服务器的数据
      const dataToSend = {
        name: row.name,

      };

      // 发送更新请求到后端API
      request
          .post('parts/delLost', dataToSend) //
          .then(response => {
            if (response.code === '0') {

              this.$message.success('成功清空损耗值');
            } else {

              this.$message.error('清空损耗值失败');
            }
          })
          .catch(error => {
            // 处理HTTP请求错误
            console.error('更新损耗值失败:', error);
            this.$message.error('更新损耗值失败');
          });
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


<style scoped>
/* 自定义 CSS 样式规则 */
.parts-table {
  width: 100%; /* 设置表格容器的宽度为100% */
}
.container {
  margin-bottom: 20px; /* 在底部添加20像素的外边距，根据需要调整间距大小 */
}
</style>