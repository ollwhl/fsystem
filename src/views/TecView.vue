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
    <!--
       +-----------------------------------+
       |                                   |
       |        这里顺序很j8重要别tm动!!       |
       |                                   |
       +-----------------------------------+
    -->
    <el-table :data="tableData" :span-method="objectSpanMethod" border style="width: 100%">
      <el-table-column label="产品名称" prop="productName"></el-table-column>
      <el-table-column label="产品规格" prop="productStandard"></el-table-column>
      <el-table-column label="零件名" prop="partsName"></el-table-column>
      <el-table-column label="所需数量" prop="num"></el-table-column>
      <el-table-column label="所在仓库" prop="partsGroup"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button @click="editPart(scope.row)" type="text">修改</el-button>
          <el-button @click="deletePart(scope.row)" type="text">删除</el-button>
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
      margeArray: [],
      tableData: [],
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
      params: {
        keyword: "",
        pageSize: "10",
        pageNum: "1",

      },
      id: "",
      productId: "",
      partsList: [],
      total: 0,
      //biaoge

      //添加的新东西和需要返给后台的数据
      addForm: {
        date: "",
        newproductName: "",
      },
      successMsg: "",
      dialogAddFormVisible: false,
      formLabelWidth: '120px',

    }
  },
  created() {//页面创建时调用的方法
    this.load()
  },

  methods: {
    // +-----------------------------------+
    // |                                   |
    // |          千万别tm动这块!!!          |
    // |          可以调用但别动内容          |
    // |                                   |
    // +-----------------------------------+
    load() {
      request.get("tech", {//get获取
        params: this.params
      }).then(res => {//使用get方法请求/amdin
        if (res.code === '0') {
          this.tableData = res.data.list
          //开始 调用方法计算需要合并的数据
          for (let i = 0; i < Object.keys(this.tableData[0]).length; i++) {
            // 首先添加一个存放合并行数据的变量
            this.margeArray.push({Arr: [], Position: 0,})
            // 得到下标对应的key值
            const element = Object.keys(this.tableData[0])[i];
            // 调用合并，
            this.rowspan(this.tableData, this.margeArray[i].Arr, this.margeArray[i].Position, element);
            this.total = res.data.total//更新总条数
          }
        }
      })
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
    // +-----------------------------------+
    // |                                   |
    // |          也别tm动这块!!!            |
    // |                                   |
    // +-----------------------------------+
    rowspan(tableData, spanArr, position, spanName) {
      tableData.forEach((item, index) => {
        if (index === 0) {
          spanArr.push(1);
          position = 0;
        } else {
          if (tableData[index][spanName] === tableData[index - 1][spanName]) {
            spanArr[position] += 1;
            spanArr.push(0);
          } else {
            spanArr.push(1);
            position = index;
          }
        }
      });
    },
    // +-----------------------------------+
    // |                                   |
    // |          这块也tm别动!!!            |
    // |                                   |
    // +-----------------------------------+
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      // 计算一共有几列数据
      let arraynum = Object.keys(this.tableData[0]).length
      for (let i = 0; i < 2; i++) {
        if (columnIndex == i) {
          const _row = this.margeArray[i].Arr[rowIndex];
          const _col = _row > 0 ? 1 : 0;
          return {
            rowspan: _row,
            colspan: _col,
          };
        }
      }
    },
  }
}
</script>

