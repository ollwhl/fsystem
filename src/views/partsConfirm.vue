<template>
  <div>
    <div class="container">
      <el-input v-model="params.keyword" placeholder="输入产品名进行搜索" :style="{ width: '25%' }"></el-input>
      <el-button type="warning" class="action-button" @click="search()">查询</el-button>
    </div>
    <!-- 生产进度条 -->
    <el-progress v-if="showProgressbar" :percentage="progressPercentage" />

    <el-table
        :data="absoluteUnreceived"
        height="750"
        border
        style="width: 100%"
        :span-method="handleSpanMethod"
    >

      <el-table-column prop="name" label="零件名"></el-table-column>
      <el-table-column prop="num"  label="零件库存"></el-table-column>

      <el-table-column prop="confirm" label="未收货"></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">

          <div class="button-container">
            <el-button type="primary" @click="confirmReceipt(scope.row)">确认收货</el-button>

          </div>


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
  computed: {
    absoluteUnreceived() {
      // 使用 map 方法创建一个新数组，其中包含 'confirm' 属性的绝对值
      return this.tableData.map(row => ({
        ...row,
        confirm: Math.abs(row.confirm)
      }));
    }
  },
  data(){
    return {

      params:{
        group:"",
        keyword:"",
        pageNum:1,
        pageSize:10,
      },

      successMsg:"",
      id:"",
      tableData: [],

      showProgressbar: false, // 是否显示生产进度条
      progressPercentage: 0, // 生产进度百分比

      lossDialogVisible: false, // 损耗确认弹窗显示状态
      lossQuantity: "0", // 损耗数量

      //progress update
      progressUpdateVisible: false,
      progressUpdateForm: {
        productName: '',
        produced: 0,
      }

    }
  },
  created() {//页面创建时调用的方法
    this.load()
  },
  methods:{
    load(){
      request.get("factory",{//get获取
        params: this.params
      }).then(res=> {//使用get方法请求/amdin
        if (res.code === '0'){
          this.showProgress().then(()=> {
            this.tableData = res.data.list
            this.total =res.data.total//更新总条数
          })
        }
      })
    },
    //page set
    handleSizeChange(pageSize){
      this.params.pageSize = pageSize
      this.load()
    },

    handleCurrentChange(pageNum){
      this.params.pageNum = pageNum
      this.load()
    },



    submit(row, popoverName) {

    },


    //progress update
    progressUpdateDialog() {
      this.progressUpdateForm.productName = ''; // 清空输入框
      this.progressUpdateForm.produced = 0; // 清空输入框
      this.progressUpdateVisible = true; // 打开弹窗
    },
    cancelProgressUpdate() {
      this.progressUpdateVisible = false; // 取消弹窗
    },
    submitProgressUpdate() {
      const productName = this.progressUpdateForm.productName;
      const produced = this.progressUpdateForm.produced;

      // 检查是否有有效的产品名称和已生产数量
      if (!productName || !produced) {
        this.$message.error("请输入有效的产品名称和已生产数量");
        return;
      }
      request.post("factory/dailyCheck", {
        name: productName,
        produced: produced,
      }).then(res => {
        if (res.code === '0') {
          this.$message.success("更新成功"); // 在操作成功时显示成功消息
          this.progressUpdateVisible = false; // 关闭弹窗
          this.load(); // 更新页面数据
        } else {
          this.$message.error(res.msg); // 在操作失败时显示错误消息，错误消息的内容从响应中获取
        }
      });
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
      request.post("/factory/confirmParts", {
        name: row.name,
      }).then((res) => {
        if (res.code === '0') {
          this.$message.success("确认收货成功。");
          this.load(); // 更新页面数据
        } else {
          this.$message.error(res.msg);
        }
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



    search(){
      request.get("tech/search",{
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
        this.load()//后台更新数据后重新显示
      })
    },

  }



}
</script>
<style>
.button-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 5px; /* 添加上下间距 */
}
.container {
  margin-bottom: 20px; /* 在底部添加20像素的外边距，根据需要调整间距大小 */
}

</style>