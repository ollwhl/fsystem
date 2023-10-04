<template>
  <div>
    <div class="container">
    <el-input v-model="params.keyword"   :style="{ width: '50%' }" placeholder="输入产品名"></el-input>
    <el-button type="warning" class="action-button" @click="search()">查询</el-button>

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
      <el-table-column prop="name" label="产品名" width="180"></el-table-column>
      <el-table-column prop="num" label="数量" width="180"></el-table-column>
      <el-table-column prop="standard" label="规格"></el-table-column>
      <el-table-column prop="productConfirm"  label="待入库数量">
<!--        <template slot-scope="scope">-->
<!--          <span :style="{ color: 'red' }">{{ scope.row.planNum }}</span>-->
<!--        </template>-->
      </el-table-column>
      <el-table-column prop="note" label="备注"></el-table-column>
      <el-table-column
          v-if ="user.group === '管理员' || user.group === '总成仓库'"
          label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="primary" @click="confirmReceipt(scope.row)">确认收货</el-button>
          <el-popover placement="top" width="160" v-model="scope.row.redVisible">
            <el-input v-model="scope.row.redInput" placeholder="请输入内容"></el-input>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancel(scope.row, 'red')">取消</el-button>
              <el-button type="primary" size="mini" @click="submit(scope.row, 'red')">确定</el-button>
            </div>
            <el-button slot="reference">出库</el-button>
          </el-popover>
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
      countNum:"",//出入库
      min:"",
      addInput:"",
      redInput:"",
      tableData: [],

      user:localStorage.getItem("user")?JSON.parse(localStorage.getItem("user")):{},

        showProgressbar: false, // 是否显示生产进度条
        progressPercentage: 0, // 生产进度百分比

    }
  },

  created() {//页面创建时调用的方法
    this.load()
  },
  methods:{
    load() {
      const productUrl = "parts/getProduct?keyword=" + this.params.keyword + "&pageNum=" + this.params.pageNum + "&pageSize=" + this.params.pageSize ;
      request.get(productUrl).then((res) => {
          if (res.code === '0'){
              this.showProgress().then(()=> {
                  this.tableData = res.data.list
                  this.total =res.data.total//更新总条数
              })
          }
      });
    },

    cancel(row, popoverName) {
      row.addInput = "";
      row.redInput = "";
      row[`${popoverName}Visible`] = false;
    },
//出库操作
    submit(row, popoverName) {
      request.post("/factory/reduce ", { //

        num: row.redInput, // 如果是入库操作，则传入正数，如果是出库操作，则传入负数
        name: row.name, // 零件的name，用于标识要操作的零件

      }).then(res => {
        if (res.code === '0') {
          this.$message.success("操作成功"); // 在操作成功时显示成功消息
          row[`${popoverName}Visible`] = false; // 关闭弹出框
          // 如果需要，你可能需要重新加载数据以更新表格
          this.load();
        } else {
          this.$message.error(res.msg); // 在操作失败时显示错误消息，错误消息的内容从响应中获取
        }
      });
    },
    handleSizeChange(pageSize){
      this.params.pageSize = pageSize
      this.load()
    },
    handleCurrentChange(pageNum){
      this.params.pageNum = pageNum
      this.load()
    },
    // 确认收货
    confirmReceipt(row) {
      // 获取未收货的数量
      const unreceived = row.unreceived;

      if (unreceived <= 0) {
        this.$message.error("没有未收货的数量可确认。");
        return;
      }

      // 假设零件 ID 存储在 row.id 中，您需要根据您的数据结构进行修改
      const partsName = row.name;

      // 向后端发送请求以确认收货
      request.post("/factory/confirmProduct", {
        name: row.name
      }).then((res) => {
        if (res.code === '0') {
          this.$message.success("确认收货成功。");
          this.load(); // 更新页面数据
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    search(){
      request.get("parts/searchProduct",{
        params:this.params
      }).then(res => {
        if (res.code === '0') {
          this.tableData = res.data.list
          this.total = res.data.total
        } else {
          this.$message({
            message: this.res.msg,
            type: 'error'
          });
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


<style scoped>
/* 自定义 CSS 样式规则 */
.parts-table {
  width: 100%; /* 设置表格容器的宽度为100% */
}
.container {
  margin-bottom: 20px; /* 在底部添加20像素的外边距，根据需要调整间距大小 */
}
</style>