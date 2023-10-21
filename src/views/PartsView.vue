<template>
  <div>
    <div class="container">
    <el-input v-model="params.keyword"   :style="{ width: '50%' }" placeholder="输入零件名"></el-input>
    <el-button type="warning" class="action-button" @click="search()">查询</el-button>
    <el-button type="action" class="action-button" @click="openStockOrderDialog">备货单生成</el-button>

      <!-- 生产进度条 -->
      <el-progress v-if="showProgressbar" :percentage="progressPercentage" />

    </div>
    <el-dialog
        :visible.sync="stockOrderVisible"
        title="备货单"
        :width="'80%'"
    >
      <el-button type="action" class="action-button" @click="downloadStockOrderExcel">下载备货单</el-button>
      <el-table
          :data="stockOrderList"
          height="300"
          border
          style="width: 100%"
      >

        <!-- 在这里添加显示备货单的表格列 -->
        <el-table-column prop="name" label="零件名"></el-table-column>
        <el-table-column prop="id" label="编码"></el-table-column>
        <el-table-column prop="num" label="库存"></el-table-column>
        <el-table-column prop="min"  label="计划所需总零件数量"></el-table-column>
        <el-table-column prop="purchaseQuantity" label="需要进货的数量">

        <template slot-scope="scope">
          <span style="color: #ff0000;">{{ scope.row.purchaseQuantity }}</span>
        </template>
        </el-table-column>
        <el-table-column prop="partsDate" label="最晚入库时间">
          <template slot-scope="scope">
            <span v-if="scope.row.halfDate">{{ scope.row.halfDate }}</span>
            <span v-else>{{ scope.row.partsDate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="standard" label="规格"></el-table-column>
        <!-- 其他需要显示的列 -->
      </el-table>
    </el-dialog>











    <el-table
        :data="tableData"
        height="1000"
        border
        style="width: 100%"
        class="parts-table"
    >
      <el-table-column prop="name" label="零件名" width="180"></el-table-column>
      <el-table-column prop="num" label="库存" width="180">
        <template slot-scope="scope">
    <span :style="{ color: scope.row.num < scope.row.min ? 'red' : 'black' }">
      {{ scope.row.num }}
    </span>
        </template>
      </el-table-column>
      <el-table-column prop="standard" label="规格"></el-table-column>
      <el-table-column prop="id" label="编码"></el-table-column>
      <el-table-column prop="group" label="仓库"></el-table-column>
      <el-table-column prop="preWarn" label="备件数"></el-table-column>
      <el-table-column prop="confirm" label="等待交付确认"></el-table-column>
      <el-table-column prop="min"  label="当前所需零件数量">
        <template slot-scope="scope">
    <span :style="{ color: scope.row.num < scope.row.min ? 'red' : 'blue' }">
      {{ scope.row.min }}
    </span>
        </template>
      </el-table-column>
      <el-table-column prop="note" label="备注"></el-table-column>
      <el-table-column v-if="user.group === '零件仓库' || user.group === '管理员'|| user.group === '半成品仓库' " label="操作" width="200">
        <template slot-scope="scope">
          <el-popover placement="top" width="160" v-model="scope.row.addVisible">
            <el-input v-model="scope.row.addInput" placeholder="请输入内容"></el-input>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancel(scope.row, 'add')">取消</el-button>
              <el-button type="primary" size="mini" @click="submit(scope.row, 'add')">确定</el-button>
            </div>
            <el-button slot="reference">入库</el-button>
          </el-popover>
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
import XLSX from 'xlsx';

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
      const user = localStorage.getItem("user");
      const group =JSON.parse(user).group;
      console.log(group)
      let url = null
      if (group === "零件仓库") {
        url = "/parts/getParts"
      }else if (group === "半成品仓库"){
        url = "/parts/getHalfProduct"
      }else{
        url = "/parts/getAllParts"
      }
      request.get(url, {
        params: this.params
      }).then(res => {
        if (res.code === '0') {
          this.showProgress().then(() => {
            // 根据用户group过滤零件数据
            if (group === "零件仓库" || group === "半成品仓库") {
              this.tableData = res.data.list.filter(item => item.group === group);
            } else {
              this.tableData = res.data.list;
            }
            this.total = res.data.total; // 更新总条数
          });
        }
      });
    },
    cancel(row, popoverName) {
      row.addInput = "";
      row.redInput = "";
      row[`${popoverName}Visible`] = false;
    },

    submit(row, popoverName) {
      const input = popoverName === 'add' ? row.addInput : row.redInput;
      if (input < 1){
        this.$message.error("请输入正整数");
        return
      }
      if (popoverName === "red" && input>row.num){
        this.$message.error("出库超出库存数");
        return
      }

      request.post("parts/count", {

        confirm: popoverName === 'add' ? input : -input, // 如果是入库操作，则传入正数，如果是出库操作，则传入负数
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
    //备货单生成
    openStockOrderDialog() {
      // 发起GET请求获取符合条件的零件列表
      request.get("parts/getBuyList").then((res) => {
        if (res.code === "0") {
          // 计算进货量并添加到列表项中
          this.stockOrderList = res.data.map((item) => ({
            ...item,
            purchaseQuantity: item.min - item.num, // 进货量为当前所需零件数量与数量的差
          }));
        } else {
          this.$message.error(res.msg);
        }
      });

      // 打开备货单弹窗
      this.stockOrderVisible = true;
    },
    downloadStockOrderExcel() {
      console.log('Download button clicked');
      // 调用导出 Excel 的方法并传递备货单数据
      this.exportToExcel(this.stockOrderList);
    },

    exportToExcel(stockOrderList) {
      const worksheet = XLSX.utils.json_to_sheet(stockOrderList);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '备货单');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openmosix-officiated.spreadsheet.sheet' });

      const url = window.URL.createObjectURL(blob);

      // 创建一个下载链接并模拟点击
      const a = document.createElement('a');
      a.href = url;
      a.download = '备货单.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    },



    search(){
      request.get("parts/searchParts",{
        params:this.params
      }).then(res => {
        if (res.code === '0') {
          this.group=this.params.group
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