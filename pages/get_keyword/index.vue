<script setup lang="ts">
// 初始化商品信息表单数据

import type { FormInstance } from "element-plus"

import type {
  GetKeywordRequestData,
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

// 全局声明
const currentRate = ref<string>("0.0") // 响应式的汇率

// 选中的商品项
const selectedGoods = ref<TableData[]>([])

// 获得关键词
async function getKeyword(row: TableData) {
  const productname = row.productname
  const top_n = row.keywordNumber
  const requestData: GetKeywordRequestData = {
    productname: productname || "", // 假设 row 中包含 category3 字段
    keywordNumber: top_n || "" // 假设 row 中包含 weight 字段
  }
  console.log(requestData)
  const jsonData = JSON.stringify(requestData)
  console.log(jsonData)
  loading.value = true // 开始加载
  // 用来存储当前的汇率

  axios.post("/keyword/getBestKeyword", jsonData, {
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then((response) => {
      console.log(response)
      console.log("后端响应:", response)
      row.keywords = response.data
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

async function copyText(text: string): Promise<void> {
  // 开始加载
  // loading.value = true

  try {
    // 使用 Clipboard API 来复制文本
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      ElMessage.success("复制成功")
    } else {
      // 如果浏览器不支持 Clipboard API，使用备用方案
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      ElMessage.success("复制成功")
    }
  } catch (error: any) {
    console.error("复制失败", error)
    ElMessage.error("复制操作失败")
  } finally {
    // 结束加载
    loading.value = false
  }
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
        <el-table :data="tableData" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <!--          <el-table-column prop="sku" label="sku" align="center" /> -->
          <el-table-column prop="productname" label="商品名" align="center" />
          <el-table-column prop="productnumber" label="货号" align="center" />
          <el-table-column prop="storeName" label="店铺" align="center" />
          <el-table-column prop="createTime" label="添加时间" align="center" />
          <el-table-column prop="keywordNumber" label="关键词数量" align="center">
            <template #default="{ row }">
              <el-input v-model="row.keywordNumber" type="text" placeholder="所需关键词数量(最多5)" required />
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="getKeyword(scope.row)">
                获得商品关键词
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="商品关键词" align="center">
            <template #default="{ row }">
              {{ row.keywords }}
              <el-button
                size="small"
                @click="copyText(row.keywords)"
                type="text"
                icon="el-icon-copy"
                style="color: #f31c29"
              >
                复制
              </el-button>
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
