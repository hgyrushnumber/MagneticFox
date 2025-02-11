<script lang="ts" setup>
import type { CreateOrUpdateTableRequestData, TableData } from "@@/apis/table/type"
import type { FormInstance, FormRules } from "element-plus"
import { createTableDataApi, deleteTableDataApi, getTableDataApi, updateTableDataApi } from "@@/apis/table"
import { usePagination } from "@@/composables/usePagination"
import { CirclePlus, Delete, Refresh, RefreshRight, Search } from "@element-plus/icons-vue"
import axios from "axios"
import { cloneDeep } from "lodash-es"

defineOptions({
  // 命名当前组件
  name: "ManagerUser"
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

// #region 删
function handleDelete(row: TableData) {
  ElMessageBox.confirm(`正在删除用户：${row.username}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteTableDataApi(row.id).then(() => {
      ElMessage.success("删除成功")
      getTableData()
    })
  })
}
// #endregion

// #region 改
function handleUpdate(row: TableData) {
  dialogVisible.value = true
  formData.value = cloneDeep(row)
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
    // console.log(`tableData.value是${tableData.value[0].role}`)
    // console.log(`tableData.value是${tableData.value[0].statue}`)
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
async function handleActivate(row: TableData) {
  try {
    let response
    // 判断当前状态是禁用还是已激活
    if (row.statue === "0") {
      console.log("当前状态: 已禁用，发送激活请求")

      // 发送激活请求到后端
      response = await axios.post("/api/ActivateUserStatue", {
        username: row.username // 传递用户名
      }, {
        withCredentials: true, // 如果需要携带 Cookie
        headers: {
          "Content-Type": "application/json" // 确保请求头是 application/json
        }
      })

      // 如果请求成功，处理后续操作
      if (response.data.code === 0) {
        console.log("用户已激活", response.data)
        // eslint-disable-next-line no-alert
        alert("用户已激活")
        // 更新本地状态为已激活
        row.statue = "1" // 设置状态为已激活
      }
    } else {
      console.log("当前状态: 已激活，无法重新激活")
      // eslint-disable-next-line no-alert
      alert("用户已激活，请勿重复操作")
      // 在这里可以选择禁用操作，或者不进行任何操作
    }
  } catch (error) {
    console.error("请求失败:", error)
  }
}
async function handleStop(row: TableData) {
  try {
    let response
    // 判断当前状态是禁用还是已激活
    if (row.statue === "1") {
      console.log("当前状态: 已激活，发送禁用请求")

      // 发送激活请求到后端
      response = await axios.post("/api/StopUserStatue", {
        username: row.username // 传递用户名
      }, {
        withCredentials: true, // 如果需要携带 Cookie
        headers: {
          "Content-Type": "application/json" // 确保请求头是 application/json
        }
      })

      // 如果请求成功，处理后续操作
      if (response.data.code === 1) {
        console.log("用户已禁用", response.data)
        // eslint-disable-next-line no-alert
        alert("用户已禁用")
        // 更新本地状态为已激活
        row.statue = "0" // 设置状态为已激活
      }
    } else {
      console.log("当前状态: 已激活，无法重新激活")
      // eslint-disable-next-line no-alert
      alert("用户已禁用，请勿重复操作")
      // 在这里可以选择禁用操作，或者不进行任何操作
    }
  } catch (error) {
    console.error("请求失败:", error)
  }
}

// 监听分页参数的变化
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="username" label="用户名">
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
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">
            新增用户
          </el-button>
          <el-button type="danger" :icon="Delete">
            批量删除
          </el-button>
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="getTableData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="username" label="用户名" align="center" />
          <el-table-column prop="role" label="角色" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.role === 'admin'" type="primary" effect="plain" disable-transitions>
                admin
              </el-tag>
              <el-tag v-else type="warning" effect="plain" disable-transitions>
                {{ scope.row.role }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" align="center" />
          <el-table-column prop="status" label="状态" align="center">
            <template #default="scope">
              <el-tag
                v-if="scope.row.statue === '1'" type="success" effect="plain" disable-transitions
              >
                已激活
              </el-tag>
              <el-tag
                v-else type="danger" effect="plain" disable-transitions
              >
                已禁用
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" align="center" />
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="handleUpdate(scope.row)">
                修改
              </el-button>
              <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">
                删除
              </el-button>
              <el-button type="danger" text bg size="small" @click="handleActivate(scope.row)">
                激活用户
              </el-button>
              <el-button type="danger" text bg size="small" @click="handleStop(scope.row)">
                禁用用户
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
