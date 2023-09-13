<template>
  <div>
    <div class="container">
    <el-input v-model="params.keyword" placeholder="输入产品名进行搜索" :style="{ width: '25%' }"></el-input>
    <el-button type="warning" class="action-button" @click="search()">查询</el-button>


      <el-button type="primary" @click="showProgress">显示生产进度</el-button>

      <!-- 生产进度条 -->
      <el-progress v-if="showProgressbar" :percentage="progressPercentage" />
    </div>
      <el-dialog :visible.sync="progressUpdateVisible" title="生产进度更新" :width="'50%'" >
      <el-form :model="progressUpdateForm" ref="progressUpdateForm" label-width="100px" >
        <el-form-item label="产品名称">
          <el-input v-model="progressUpdateForm.productName" :style="{ width: '50%' }"></el-input>
        </el-form-item>
        <el-form-item label="已生产数量">
          <el-input v-model.number="progressUpdateForm.produced" :style="{ width: '50%' }"></el-input>
        </el-form-item>

      </el-form>
      <div slot="footer">
        <el-button @click="cancelProgressUpdate">取消</el-button>
        <el-button type="primary" @click="submitProgressUpdate">保存</el-button>
      </div>
    </el-dialog>
    <el-table
        :data="filteredTableData"
        height="750"
        border
        style="width: 100%"
    >
      <el-table-column prop="productName" label="产品名称" :width="180"></el-table-column>
      <el-table-column prop="planNum" label="生产目标" :width="180"></el-table-column>
      <el-table-column prop="produced" label="已生产" :width="180"></el-table-column>
      <el-table-column label="操作" :width="180">
        <template slot-scope="scope">
          <el-button type="warning" class="action-button"@click="progressUpdateDialog(scope.row)">生产进度更新</el-button>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="生产进度" :width="180">
        <template slot-scope="scope">
          <el-progress :percentage="producePercent(scope.row)"></el-progress>
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
    filteredTableData() {
      const filteredData = [];
      const seenProductNames = new Set();

      // 遍历原始的 tableData
      this.tableData.forEach((row) => {
        if (!seenProductNames.has(row.productName)) {
          seenProductNames.add(row.productName);
          filteredData.push(row);
        }
      });

      return filteredData;
    },
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
      request.get("tech",{//get获取
        params: this.params
      }).then(res=> {//使用get方法请求/amdin
        if (res.code === '0'){
          this.tableData = res.data.list.filter(item => item.planNum !== 0);
          this.total =res.data.total//更新总条数
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
    progressUpdateDialog(row) {
      this.progressUpdateForm.productName = row.productName; // 将产品名称设置为对话框表单字段
      this.progressUpdateForm.produced = 0; // 清空已生产数量
      this.progressUpdateVisible = true; // 打开对话框
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










// 显示生产进度条
    showProgress() {
      this.showProgressbar = true; // 设置为显示生产进度条
      this.progressPercentage = 0; // 重置进度为0

      // 模拟生产进度更新，实际中需要根据您的业务逻辑来更新进度
      const interval = setInterval(() => {
        if (this.progressPercentage < 100) {
          this.progressPercentage += 10; // 每次增加10%
        } else {
          clearInterval(interval); // 达到100%后停止更新
        }
      }, 1000); // 更新频率，可以根据需要调整
    },

    producePercent(row){

      // let percent = row.planNum/row.produced*100
      // let planNum =row.planNum
      // let produced = row.produced
      //
      // console.log("percent"+percent)
      // console.log(planNum)
      // console.log(produced)
      // console.log(row)
      return row.produced/row.planNum*100
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