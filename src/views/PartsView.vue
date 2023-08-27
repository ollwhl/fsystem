<template>
  <div>
    <el-input v-model="params.keyword" placeholder="请输入姓名或电话号码"></el-input>
    <el-button type="warning" class="action-button" @click="search()">查询</el-button>

    <el-table
        :data="tableData"
        height="250"
        border
        style="width: 100%"
    >
      <el-table-column prop="name" label="零件名" width="180"></el-table-column>
      <el-table-column prop="num" label="数量" width="180"></el-table-column>
      <el-table-column prop="standard" label="规格"></el-table-column>
      <el-table-column prop="countNum" label="交付确认">
        <template slot-scope="scope">

        </template>
      </el-table-column>
      <el-table-column prop="min"  label="警戒值"></el-table-column>
      <el-table-column prop="note" label="备注"></el-table-column>
      <el-table-column label="操作" width="200">
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
          :page-size="pageSize"
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
      confirmNum:"" //交付确认
    }
  },
  created() {//页面创建时调用的方法
    this.load()
    this.loadMinValue()
  },
  methods:{
    load(){
    request.get("parts/part",{
      params:this.params
    }).then(res=>{
      if(res.code==='0'){
        this.tableData=res.data.list
        this.total=res.data.total
      }
    })
    },
    cancel(row, popoverName) {
      row.addInput = "";
      row.redInput = "";
      row[`${popoverName}Visible`] = false;
    },

    submit(row, popoverName) {
      const input = popoverName === 'add' ? row.addInput : row.redInput;

      request.post("parts/part", {
        countNum: popoverName === 'add' ? input : -input, // 如果是入库操作，则传入正数，如果是出库操作，则传入负数
        id: row.id // 零件的ID，用于标识要操作的零件
      }).then(res => {
        if (res.code === '0') {
          this.$message.success("操作成功"); // 在操作成功时显示成功消息
          row[`${popoverName}Visible`] = false; // 关闭弹出框
          // 如果需要，你可能需要重新加载数据以更新表格
          // this.load();
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
    search(){
      request.get("parts/part/search",{
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
    loadMinValue(){
      request.get("/min").then(
          res=> {
            if (res.code === '0') {
              this.min = res.data.min;
            }
            this.load()
          });
    },
    loadConfirmNum(){
      request.post("parts/count").then(
          res=> {
            if (res.code === 0) {
              this.confirmNum = res.data.confirmNum;
            } else {
              this.$message.error(res.msg);

            }
            this.load()
          });
    }

  }



}
</script>