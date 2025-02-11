<script setup lang="ts">
// 初始化商品信息表单数据

import type { FormInstance, FormRules } from "element-plus"

import type { CreateOrUpdateTableRequestData, RequestData, RequestDataWeight, TableData } from "./api/type.ts"
import { usePagination } from "@@/composables/usePagination.ts"
import { Refresh, RefreshRight, Search } from "@element-plus/icons-vue"
import axios from "axios"
import { cloneDeep } from "lodash-es"
import { createTableDataApi, getTableDataApi, updateTableDataApi } from "./api"

defineOptions({
  // 命名当前组件
  name: "CalculateValue"
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

// #region 增
const DEFAULT_FORM_DATA: CreateOrUpdateTableRequestData = {
  id: undefined,
  username: "",
  password: ""
}
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = ref<CreateOrUpdateTableRequestData>(cloneDeep(DEFAULT_FORM_DATA))
const formRules: FormRules<CreateOrUpdateTableRequestData> = {
  username: [{ required: true, trigger: "blur", message: "请输入用户名" }],
  password: [{ required: true, trigger: "blur", message: "请输入密码" }]
}
function handleCreateOrUpdate() {
  formRef.value?.validate((valid) => {
    if (!valid) {
      ElMessage.error("表单校验不通过")
      return
    }
    loading.value = true
    const api = formData.value.id === undefined ? createTableDataApi : updateTableDataApi
    api(formData.value).then(() => {
      ElMessage.success("操作成功")
      dialogVisible.value = false
      getTableData()
    }).finally(() => {
      loading.value = false
    })
  })
}
function resetForm() {
  formRef.value?.clearValidate()
  formData.value = cloneDeep(DEFAULT_FORM_DATA)
}
// #endregion


// 这里让他点击后自动完成解决上货未成功上货问题
async function generateTable(row: TableData) {
  const requestData: RequestDataWeight = {
    productnumber: row.productnumber, // 假设 row 中包含 productnumber 字段
    storeName: row.storeName
  }
  console.log(requestData)
  const jsonData = JSON.stringify(requestData)
  console.log(jsonData)
  loading.value = true // 开始加载
  axios.post("/api/dealSubmitProblemOfCalculate", jsonData, {
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then((response) => {
      console.log(response.data)
      // console.log("后端响应:", response.data)
      // 处理成功逻辑
    })
    .catch((error) => {
      // row.weight = 0
      console.error("在获得商品重量时候出现错误:", error)
      // 显示错误消息
    })
    .finally(() => {
      loading.value = false // 停止加载
    })
}
// #endregion

// #region 查
const tableData = ref<TableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  username: ""
})
function getTableData() {
  loading.value = true
  getTableDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    username: searchData.username || undefined
  }).then((response: any) => {
    const { data } = response
    console.log(`data${data}`)
    console.log("换行")
    console.log(data.length)
    console.log(data.list)
    paginationData.total = data.length
    console.log(`数组的长度是${paginationData.total}`)
    tableData.value = data
  }).catch(() => {
    tableData.value = []
  }).finally(() => {
    loading.value = false
  })
}
function handleSearch() {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
function resetSearch() {
  searchFormRef.value?.resetFields()
  handleSearch()
}
// #endregion

// 监听分页参数的变化
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="sku" label="sku">
          <el-input v-model="searchData.username" placeholder="请输入" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            查询
          </el-button>
          <el-button :icon="Refresh" @click="resetSearch">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <!--        <div> -->
        <!--          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true"> -->
        <!--            新增商品 -->
        <!--          </el-button> -->
        <!--          <el-button type="danger" :icon="Delete"> -->
        <!--            批量删除 -->
        <!--          </el-button> -->
        <!--        </div> -->
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="getTableData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData">
          <el-table-column type="selection" width="50" align="center" />
          <!--          <el-table-column prop="sku" label="sku" align="center" /> -->
          <el-table-column prop="productname" label="商品名" align="center" />
          <el-table-column prop="productnumber" label="货号" align="center" />
          <el-table-column prop="category3" label="三级类目" align="center" />
          <el-table-column prop="storeName" label="店铺" align="center" />
          <el-table-column prop="weight" label="重量(kg)" align="center">
            <template #default="{ row }">
              <el-input v-model="row.weight" type="name" placeholder="请输入您重量" required />
            </template>
          </el-table-column>
          <el-table-column prop="cost" label="成本(卢布)" align="center">
            <template #default="{ row }">
              <el-input v-model="row.cost" type="number" placeholder="请输入您的成本" required />
            </template>
          </el-table-column>
          <el-table-column prop="sale" label="售价(卢布)" align="center">
            <template #default="{ row }">
              <el-input v-model="row.sale" type="number" placeholder="请输入您的售价" required />
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="scope">
              <el-button type="danger" text bg size="small" @click="generateTable(scope.row)">
                生成表格
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="计算结果" align="center">
            <template #default="{ row }">
              <div v-if="row.profit">
                <h3>取货点计算结果</h3>
                <el-row :gutter="10">
                  <el-col :span="12">
                    <p><strong>RFBs 快递:</strong> {{ parseFloat(row.profit.rFBS_express_pick_up_point).toFixed(2) }} CNY</p>
                  </el-col>
                  <el-col :span="12">
                    <p><strong>FBP 快递:</strong> {{ row.profit.FBP_express_pick_up_point.toFixed(2) }} CNY</p>
                  </el-col>
                </el-row>
                <el-row :gutter="10">
                  <el-col :span="12">
                    <p><strong>RFBs 标准:</strong> {{ row.profit.rFBS_standard_pick_up_point.toFixed(2) }} CNY</p>
                  </el-col>
                  <el-col :span="12">
                    <p><strong>FBP 标准:</strong> {{ row.profit.FBP_standard_pick_up_point.toFixed(2) }} CNY</p>
                  </el-col>
                </el-row>
                <el-row :gutter="10">
                  <el-col :span="12">
                    <p><strong>RFBs 经济:</strong> {{ row.profit.rFBS_economy_pick_up_point.toFixed(2) }} CNY</p>
                  </el-col>
                  <el-col :span="12">
                    <p><strong>FBP 经济:</strong> {{ row.profit.FBP_economy_pick_up_point.toFixed(2) }} CNY</p>
                  </el-col>
                </el-row>
              </div>
              <div v-else>
                <p>请点击计算按钮，获取取货点计算结果。</p>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :current-page="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 新增/修改 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formData.id === undefined ? '新增用户' : '修改用户'"
      width="30%"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="username" label="用户名">
          <el-input v-model="formData.username" placeholder="请输入" />
        </el-form-item>
        <el-form-item v-if="formData.id === undefined" prop="password" label="密码">
          <el-input v-model="formData.password" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="loading" @click="handleCreateOrUpdate">
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
