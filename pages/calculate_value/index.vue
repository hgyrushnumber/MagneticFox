<script setup lang="ts">
// 初始化商品信息表单数据

import type { FormInstance } from "element-plus"

import type {
  RequestData,
  RequestDataSubmitProduct,
  RequestDataWeight,
  TableData
} from "./api/type.ts"
import { usePagination } from "@@/composables/usePagination.ts"
import { Delete, Refresh, RefreshRight, Search } from "@element-plus/icons-vue"
import axios from "axios"
import { getTableDataApi } from "./api"

defineOptions({
  // 命名当前组件
  name: "CalculateValue"
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

// #region 增
// 全局声明
const currentRate = ref<string>("0.0") // 响应式的汇率
// 选中的商品项
const selectedGoods = ref<TableData[]>([])
// #endregion

// #region 处理删除
async function handleDelete(row: TableData) {
  const requestData: RequestDataWeight = {
    productnumber: row.productnumber, // 假设 row 中包含 productnumber 字段
    storeName: row.storeName
  }
  console.log(requestData)
  const jsonData = JSON.stringify(requestData)
  console.log(jsonData)
  loading.value = true // 开始加载
  axios.post("/api/deleteCalculateProduct", jsonData, {
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then((response) => {
      if (response.data.data === 1) {
        ElMessage.success("删除成功")
      } else {
        ElMessage.warning("删除失败")
      }
    })
    .catch((error) => {
      // row.weight = 0
      console.error("在删除商品时出现错误:", error)
      // 显示错误消息
    })
}

// #处理计算
async function handleCalculate(row: TableData) {
  // dialogVisible.value = true
  // formData.value = cloneDeep(row)
  const weightfloat = Number.parseFloat(row.weight)
  const costfloat = Number.parseFloat(row.cost)
  const salefloat = Number.parseFloat(row.sale)
  const requestData: RequestData = {
    category3: row.category3 || "", // 假设 row 中包含 category3 字段
    weight: weightfloat || 0, // 假设 row 中包含 weight 字段
    cost: costfloat || 0, // 假设 row 中包含 cost 字段
    sale: salefloat || 0 // 假设 row 中包含 sale 字段
  }
  console.log(requestData)
  const jsonData = JSON.stringify(requestData)
  console.log(jsonData)
  loading.value = true // 开始加载
  // 用来存储当前的汇率

  axios.post("/calculate/commissions/", jsonData, {
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then((response) => {
      row.rate = response.data.rate
      currentRate.value = row.rate
      row.commissions = response.data.commissions
      row.shipping_cost = response.data.shipping_cost
      row.profit = response.data.profit
      console.log(row.profit)
      console.log(row.profit.rFBS_express_pick_up_point)
      console.log(response.data.profit)
      console.log("后端响应:", response.data)
      const dataToSend = {
        productnumber: row.productnumber, // 添加 productnumber
        profit: response.data.profit, // 添加 profit
        rate: response.data.rate.value, // 这里的
        cost: costfloat || 0, // 假设 row 中包含 cost 字段
        sale: salefloat || 0 // 假设 row 中包含 sale 字段
      }
      console.log("下面是dataToSend")
      console.log(dataToSend)
      axios.post("/api/getProfit", dataToSend, {
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then((newResponse) => {
          console.log(newResponse)
          row.rate = newResponse.data.data.rate
          currentRate.value = newResponse.data.data.rate
          row.rfbs = newResponse.data.data.RFBs
          row.rfbsEconomic = newResponse.data.data.RFBsEconomic
          row.rfbsStandard = newResponse.data.data.RFBsStandard
          console.log(newResponse.data.data.rate)
          console.log("rate成功发送到后端:", row.rate)
          console.log(`当前的rate${currentRate.value}`)
          // 处理成功的逻辑
        })
        .catch((error) => {
          console.error("利润失败发送到后端:", error)
        })
      // 处理成功逻辑
    })
    .catch((error) => {
      row.profit = null
      console.error("发送数据时出错:", error)
      // 显示错误消息
    })
    .finally(() => {
      loading.value = false // 停止加载
    })
}

// 获得商品重量
async function getGoodsWeight(row: TableData) {
  const requestData: RequestDataWeight = {
    productnumber: row.productnumber, // 假设 row 中包含 productnumber 字段
    storeName: row.storeName
  }
  console.log(requestData)
  const jsonData = JSON.stringify(requestData)
  console.log(jsonData)
  loading.value = true // 开始加载
  axios.post("/api/getGoodInfoWeight", jsonData, {
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then((response) => {
      row.weight = response.data.data
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

// 这里让他点击后自动完成解决上货未成功上货问题
async function handleConfirm(row: TableData) {
  const requestDataSubmitProduct: RequestDataSubmitProduct = {
    productnumber: row.productnumber, // 假设 row 中包含 productnumber 字段
    storeName: row.storeName,
    sale: row.sale,
    cost: row.cost
  }
  console.log(requestDataSubmitProduct)
  const jsonData = JSON.stringify(requestDataSubmitProduct)
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
// 批量删除商品
async function deleteGoodList() {
  // 确保有选中的商品
  if (selectedGoods.value.length === 0) {
    // eslint-disable-next-line no-alert
    alert("请先选择要删除的商品")
    return
  }
  try {
    // 准备删除的商品 ID 列表
    const productNumbersToDelete = selectedGoods.value.map(item => item.productnumber)

    // 向后端发送删除请求
    const response = await axios.post("/api/deleteGoods", { ids: productNumbersToDelete })
    console.log(response)
    if (response.data.code === 0) {
      // // 模拟删除操作（比如从商品列表中删除）
      // selectedGoods.value.forEach((item) => {
      //   const index = goodsList.value.findIndex(good => good.id === item.id)
      //   if (index !== -1) {
      //     goodsList.value.splice(index, 1) // 从商品列表中删除
      //   }
      // })
      //
      // // 清空选中的商品
      // selectedGoods.value = []
      // eslint-disable-next-line no-alert
      alert("批量删除成功")
    } else {
      // eslint-disable-next-line no-alert
      alert("删除失败，服务器返回错误")
    }
  } catch (error) {
    console.error("删除失败", error)
    // eslint-disable-next-line no-alert
    alert("删除操作失败")
  } finally {
    loading.value = false // 加载完成
  }
}
function handleSelectionChange(selectedItems: TableData[]) {
  // 将选中的商品赋值给 selectedGoods
  selectedGoods.value = selectedItems
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
        <el-form-item>
          <p><strong>当前汇率:</strong> {{ currentRate }}</p>
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
          <el-button type="primary" :icon="RefreshRight" @click="getTableData">
            刷新页面
          </el-button>
          <el-button type="danger" :icon="Delete" @click="deleteGoodList">
            批量删除
          </el-button>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData"  @selection-change="handleSelectionChange">
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
          <el-table-column prop="cost" label="成本(人民币)" align="center">
            <template #default="{ row }">
              <el-input v-model="row.cost" type="number" placeholder="请输入您的成本" required />
            </template>
          </el-table-column>
          <el-table-column prop="sale" label="售价(人民币)" align="center">
            <template #default="{ row }">
              <el-input v-model="row.sale" type="number" placeholder="请输入您的售价" required />
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="添加时间" align="center" />
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="getGoodsWeight(scope.row)">
                获得商品重量
              </el-button>
              <el-button type="primary" text bg size="small" @click="handleConfirm(scope.row)">
                上传商品
              </el-button>
              <el-button type="primary" text bg size="small" @click="handleCalculate(scope.row)">
                计算
              </el-button>
              <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
          <!--          <el-table-column label="计算结果" align="center" > -->
          <!--            <template #default="{ row }"> -->
          <!--              {{row.newProfit}} -->
          <!--            </template> -->
          <!--          </el-table-column> -->
          <el-table-column label="计算结果" align="center">
            <template #default="{ row }">
              <div>
                <!--              <div v-if="row.profit"> -->
                <!--                <h3>取货点计算结果</h3> -->
                <el-row :gutter="10">
                  <el-col :span="12">
                    <p><strong>汇率:</strong> {{ row.rate }}</p>
                  </el-col>
                </el-row>
                <el-row :gutter="10">
                  <el-col :span="12" v-model="row.RFBs">
                    <p><strong>CEL 快速:</strong> {{ row.rfbs }} ￥</p>
                  </el-col>
                </el-row>
                <el-row :gutter="10">
                  <el-col :span="12">
                    <p><strong>CEL 标准:</strong> {{ row.rfbsStandard }} ￥</p>
                  </el-col>
                </el-row>
                <el-row :gutter="10">
                  <el-col :span="12">
                    <p><strong>CEL 经济:</strong> {{ row.rfbsEconomic }} ￥</p>
                  </el-col>
                </el-row>
              </div>
              <!--              <div v-else> -->
              <!--                <p>请点击计算按钮，获取取货点计算结果。</p> -->
              <!--              </div> -->
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
