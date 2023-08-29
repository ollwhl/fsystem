<template>
  <div>
    <el-input
        v-model="params.productName"
        placeholder="输入产品名进行搜索合成表"
        :style="{ width: '25%' }"
        style="margin-bottom: 10px"
    ></el-input>
    <el-button type="warning" class="action-button" @click="search()">查询</el-button>
    <el-button type="primary" class="action-button" @click="openAddDialog">新增</el-button>

    <el-dialog
        title="增加产品"
        :visible.sync="dialogAddFormVisible"
        width="30%"
        @close="resetAddForm"
    >
      <el-form :model="addForm" ref="addForm" label-width="100px">
        <el-form-item label="产品名">
          <el-input v-model="addForm.newproductName" placeholder="请输入产品名"></el-input>
        </el-form-item>
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 10px;">

        </div>

        <el-form-item label="零件或半成品">
          <el-cascader
              v-model="selectedParts"
              :options="partTypeOptions"
              placeholder="请选择零件或半成品"
              @change="handlePartTypeChange"
              clearable
              multiple
          ></el-cascader>
        </el-form-item>

        <el-form-item v-if="selectedParts.length > 0" label="所需零件名和数量">
          <el-row v-for="(part, index) in selectedParts" :key="index" type="flex" align="middle">
            <el-col :span="12">
              <el-select v-model="part.partsId" placeholder="请选择零件名" style="width: 90%">
                <el-option
                    v-for="option in partTypeOptions[0].children"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="10" offset="2">
              <el-input-number v-model="part.quantity" :min="1" placeholder="请输入数量" style="width: 80%"></el-input-number>
            </el-col>
            <el-col :span="1">
              <el-button @click="removePart(index)" type="text" icon="el-icon-delete"></el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddForm('dialogAddFormVisible')">确认</el-button>
      </div>
    </el-dialog>
    <el-table :data="tableData" :span-method="objectSpanMethod" border style="width: 100%">
      <el-table-column prop="productName" :formatter="formatProduct" label="产品名"></el-table-column>
      <el-table-column prop="note" label="产品描述"></el-table-column>
      <el-table-column prop="productStandard" label="产品标准"></el-table-column>
      <el-table-column label="所需零件">
        <template slot-scope="scope">
          <el-tag v-for="part in scope.row.parts" :key="part.name" type="success">{{ part.name }} ({{ part.quantity }})</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="partName" label="零件名"></el-table-column>
      <el-table-column prop="partStandard" label="零件标准"></el-table-column>
      <el-table-column prop="num" label="数量"></el-table-column>
      <el-table-column prop="group" label="所在仓库"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button @click="deleteProduct(scope.row)" type="danger" size="small">删除</el-button>
          <el-button @click="editProduct(scope.row)" type="danger" size="small">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import request from "@/utils/request";

export default {
  name: "TecView",
  data() {
    return {
      partTypeOptions: [
        {
          value: "零件",
          label: "零件",
          children: [],
        },
        {
          value: "半成品",
          label: "半成品",
          children: [],
        },
      ],
      budgetList: [],
      spanArr: [],
      position: 0,
      selectedParts: [],
      params:{
        keyword:"",
        pageSize:"10",
        pageNum:"1",

      },
      id :"",
      productId:"",
      partsList: [],
      tableData: [],
      total: 0,
 //biaoge

      //添加的新东西和需要返给后台的数据
      addForm:{
     date:"",
        newproductName:"",
      },
      successMsg:"",
      dialogAddFormVisible: false,
      formLabelWidth: '120px',

    }
  },
  created() {//页面创建时调用的方法
    this.load()
    this.loadParts()
    this.loadPartTypeOptions()
  },

  methods: {
    load() {
      request.get("tech", {//get获取
        params: this.params
      }).then(res => {//使用get方法请求/amdin
        if (res.code === '0') {
          this.tableData = res.data.list//更新表格
          this.total = res.data.total//更新总条数
        }
      })
    },
    loadparts() {
      request.get("parts").then(
          res => {
            if (res.code === '0') {
              this.partList = res.data;
            }
          }
      )
    },

      handleSizeChange(pageSize) {
        this.params.pageSize = pageSize
        this.load()
      },
      handleCurrentChange(pageNum) {
        this.params.pageNum = pageNum
        this.load()
      },

      search() {
        request.get("tech/search", {
          params: this.params
        }).then(res => {
          if (res.code === '0') {
            this.tableData = res.data.list//从返回的数据更新到当前页面
            this.total = res.data.total//更新所有返回数据的总条数
          } else {

          }
        })
      },

      add(dialogName) {
        this.form = {}
        this[`${dialogName}Visible`] = true
        this.successMsg = "添加成功"
      },//多个表格调用同一个方法更改数据${}连接字符串
      openAddDialog() {
        this.dialogAddFormVisible = true;
        this.selectedParts = []; // 重置已选零件或半成品
      },
      resetAddForm() {
        this.addForm.productName = "";
        this.addForm.partsName = "";
      },



      edit(obj) {
        this.addForm = obj
        this.dialogAddFormVisible = true
        this.successMsg = "修改成功"
      },

      submitAddForm(dialogName) {//提交表单调用该方法
        request.post("tech/add", {
          productName: this.addForm.newproductName, // Use entered product name
          partsName: this.addForm.partsName,     // Use entered parts name
        }).then(res => {
          if (res.code === '0') {
            this[`${dialogName}Visible`] = false
            this.$message({
              message: this.successMsg,
              type: 'success'
            });
          } else {
            this.$message({
              message: res.msg,
              type: 'error'
            });
          }
          this.load()
        })
      },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      for (let i = 0; i < 4; i++) {
        if (columnIndex === i) {
          const _row = this.spanArr[i][rowIndex];
          const _col = _row > 0 ? 1 : 0;
          return {
            rowspan: _row,
            colspan: _col,
          };
        }
      }
    },
  },
  // 计算属性
  computed: {
    // 格式化产品名的方法
    formatProduct() {
      return (row, column, cellValue) => {
        return `${row.productName} (${row.productStandard})`;
      };
    },
  },
  }
</script>

