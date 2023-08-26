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
      <el-table-column prop="note" label="备注"></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-popover
            placement="top"
            width="160"
            v-model="addVisible">
            @show="onPopoverShow"
            <el-input v-model="addInput" placeholder="请输入内容"></el-input>
          <div style="text-align: right; margin: 0">
            <el-button size="mini" type="text" @click="addVisible = false">取消</el-button>
            <el-button type="primary" size="mini" @click="submitAdd()">确定</el-button>
          </div>
          <el-button slot="reference">入库</el-button>
        </el-popover>
          <el-popover
              placement="top"
              width="160"
              v-model="redVisible">
              @show="onPopoverShow"
            <el-input v-model="redInput" placeholder="请输入内容"></el-input>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="redVisible = false">取消</el-button>
              <el-button type="primary" size="mini" @click="submitRed()">确定</el-button>
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
      addInput:"",
      redInput:"",
      tableData: []

    }
  },
  created() {//页面创建时调用的方法
    this.load()
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
    onPopoverShow(){
      this.redInput=``
      this.addInput=``
    },
    submit(popoverName){//修改数据post，查询数据get
      this.addInput=``
      this.redInput=``
      request.post("parts/part",{
        addInput: this.addInput,//如果addInput为空 redInput为有 则判断为增加
        redInput: this.redInput,
        id: this.id
      }).then(res=>{
        if(res.code === '0'){
        this.$message="success"
          this[`${popoverName}Visible`] = false
        }else{
          this.$message=res.msg
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

    }
  }


}
</script>