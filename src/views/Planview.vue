<template>
  <div>
    <el-table
        :data="tableData"
        border
        style="width: 100%">
      <el-table-column prop="productName" label="产品名"></el-table-column>
      <el-table-column label="所需零件">
        <template slot-scope="scope">
          <el-tag v-for="part in scope.row.parts" :key="part.name" type="success">{{ part.name }} ({{ part.quantity }})</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="semifinishedProduct" label="半成品"></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "TecView",
  data() {
    return {
      tableData: [
        {
          productName: "产品A",
          parts: [
            { name: "零件X", quantity: 10 },
            { name: "零件Y", quantity: 5 }
          ],
          semifinishedProduct: "半成品A"
        },
        {
          productName: "产品B",
          parts: [
            { name: "零件Z", quantity: 8 },
            { name: "零件W", quantity: 3 }
          ],
          semifinishedProduct: "半成品B"
        }
        // 可以根据需要继续添加更多产品信息
      ]
    };
  }
};
</script>

<style>
/* 可以根据需要添加样式 */
</style>
