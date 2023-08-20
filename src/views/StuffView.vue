<template>
    <div class="admin-view">
        <div class="action-bar">
            <el-input v-model="params.keyword" placeholder="请输入内容"></el-input>
            <el-button type="warning" class="action-button" @click="search()">查询</el-button>
            <el-button type="primary" class="action-button">新增</el-button>
        </div>

        <el-table :data="tableData":style="{ width: '100%' }" height="1000">
            <el-table-column prop="name" label="姓名" width="120"></el-table-column>
            <el-table-column prop="phone" label="电话" width="300"></el-table-column>
            <el-table-column prop="note" label="附录" ></el-table-column>
            <el-table-column label="操作" width="200">
                <div class="action-buttons">
                    <el-button type="primary">编辑</el-button>
                    <el-button type="danger">显示密码</el-button>
                </div>
            </el-table-column>
        </el-table>
    </div>
</template>

<style>
    .admin-view {
        padding: 20px;
    }

    .action-bar {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
    }

    .action-button {
        margin-left: 10px;
    }

    .action-buttons {
        display: flex;
        justify-content: space-between;
    }
</style>

<script>
    import request from "@/utils/request";

    export default {
        name: "AdminView",
        data() {
            return {
                params:{
                    keyword:"",
                },
                tableData: []
            }
        },
        created() {//页面创建时调用的方法
            this.load()
        },

        methods:{
            load(){
                const adminUrl="/admin"
                request.get(adminUrl).then(res=> {//使用get方法请求/amdin
                    console.log(adminUrl)
                    if (res.code === '0'){
                        this.tableData =res.data
                    }
                })
            },
            search(){
                request.get("/admin/search",{
                    params: this.params
                }).then(res => {
                    if (res.code === '0') {
                        this.tableData = res.data
                    }else{

                    }
                })
            }
        }
    }
</script>