<script setup lang="ts">
import type { ShopInfo } from "@/pages/add_store/api/type.ts"
import { useShopStore } from "@/pinia/stores/bindstore.ts" // 引入 Pinia store
import { CirclePlus, RefreshRight } from "@element-plus/icons-vue"
import axios from "axios"
import { ElMessage } from "element-plus"
import { ref } from "vue"

// const shopStore = useShopStore() // 获取 store

// 定义店铺信息接口类型

// 用于存储获取到的店铺信息数组
const shops = ref<ShopInfo[]>([])

// 用于控制加载状态
const loading = ref(false)

// 用于控制错误提示
const error = ref<string | null>(null)

// 点击按钮时执行的方法
async function viewShopInfo() {
  loading.value = true // 开始加载
  error.value = null // 清空错误信息

  try {
    // 发起请求
    const response = await axios.get("/api/selectUserStore", {
      withCredentials: true // 允许携带 Cookie
    })

    if (response.data.code === 0) {
      shops.value = response.data.data || [] // 直接赋值为返回的店铺信息数组
    } else {
      throw new Error(response.data.message || "数据获取失败")
    }
  } catch (err) {
    console.error("获取店铺信息失败：", err)
    error.value = "获取店铺信息失败，请稍后再试。"
    shops.value = []
  } finally {
    loading.value = false // 请求结束
  }
}

// 添加一个空的店铺记录
function addEmptyRecord() {
  const emptyRecord: ShopInfo = {
    storeName: "",
    userid: 0,
    apiKey: "",
    clientId: "",
    isDisabled: false, // 默认按钮不禁用
    isNew: true // 标记为新增记录
  }
  shops.value.push(emptyRecord)
}

// 删除记录
async function deleteRecord(index: number) {
  const store = shops.value[index]

  try {
    // 向后端发送 DELETE 请求
    const response = await axios.post(
      `/api/deleteStore`,
      { storeName: store.storeName },
      {
        withCredentials: true // 如果需要携带 cookie
      }
    )

    if (response.data.code === 0) {
      // 删除成功，从本地数组中删除
      shops.value.splice(index, 1)
      ElMessage.success("店铺记录删除成功")
    } else {
      throw new Error(response.data.message || "店铺记录删除失败")
    }
  } catch (err) {
    console.error("删除店铺记录失败：", err)
    ElMessage.error("删除店铺记录失败，请稍后再试")
  }
}

// 提交记录
// const submitRecord = (record: ShopInfo) => {
//   console.log("提交记录:", record)
//   // 禁用提交按钮
//   record.isDisabled = true
//   // 在这里可以进行记录提交操作
// }
// 提交记录
async function submitRecord(record: ShopInfo) {
  try {
    let response
    if (record.isNew) {
      // 新增记录操作，向后端发送POST请求，假设接口为 /api/addShopRecord，根据实际调整
      response = await axios.post("/api/addStore", record, {
        withCredentials: true
      })
      if (response.data.code === 0) {
        console.log("记录新增成功:", record)
        // 弹出提示框告知新增成功（示例，需根据实际使用的UI组件库调整）
        // ElMessage.success('店铺记录新增成功');
        ElMessage.success("店铺记录新增成功")
        // 将记录标记为已存在，下次提交就是修改操作了
        record.isNew = false
      } else {
        throw new Error(response.data.message || "店铺记录新增失败")
      }
    } else {
      // 修改记录操作，向后端发送PUT请求，假设接口为 /api/updateShopRecord，根据实际调整
      response = await axios.post("/api/updateShopRecord", record, {
        withCredentials: true
      })
      if (response.data.code === 0) {
        console.log("记录修改成功:", record)
        // 弹出提示框告知修改成功（示例，需根据实际使用的UI组件库调整）
        ElMessage.success("店铺记录修改成功")
      } else {
        throw new Error(response.data.message || "店铺记录修改失败")
      }
    }
    // 无论新增还是修改成功，保持提交按钮为禁用状态（防止重复操作）
    record.isDisabled = true
  } catch (err) {
    console.error("店铺记录提交失败：", err)
    // 弹出提示框告知提交失败（示例，需根据实际使用的UI组件库调整）
    // ElMessage.error('店铺记录提交失败，请稍后再试');
    error.value = "店铺记录提交失败，请稍后再试。"
    // 如果提交失败，重新启用提交按钮，方便用户再次尝试提交
    record.isDisabled = false
  }
}

// 在组件中初始化时调用 `loadFromLocalStorage` 方法
const shopStore = useShopStore()
shopStore.loadFromLocalStorage()
// 绑定当前操作
function bindCurrentRecord(record: ShopInfo) {
  shopStore.bindShop(record) // 使用 store 中的方法绑定店铺
}

// 获取当前路由实例
// const router = useRouter()
//
// // 使用 onMounted 注册路由守卫
// onMounted(() => {
//   // 使用 router.beforeEach 设置路由守卫
//   router.beforeEach((to, from, next) => {
//     if (to.path === "/bindOzon/addStore") {
//       // 如果是目标路由，执行数据加载
//       viewShopInfo().then(() => {
//         next() // 数据加载完成后继续路由跳转
//       }).catch(() => {
//         next() // 即使加载失败也继续跳转
//       })
//     } else {
//       next() // 其他路由直接继续
//     }
//   })
// })
</script>

<template>
  <div class="toolbar-wrapper">
    <div>
      <el-button type="primary" :icon="CirclePlus" @click="addEmptyRecord">
        新增商铺
      </el-button>
      <!--      <el-button type="danger" :icon="Delete"> -->
      <!--        批量删除 -->
      <!--      </el-button> -->
    </div>
    <div>
      <el-tooltip content="刷新当前页">
        <el-button type="primary" :icon="RefreshRight" circle @click="viewShopInfo" />
      </el-tooltip>
    </div>
  </div>
  <div>
    <!-- 按钮：点击加载店铺信息 -->
    <!--    <el-button type="success" @click="viewShopInfo" :loading="loading"> -->
    <!--      点击这里查看您的店铺 -->
    <!--    </el-button> -->

    <!-- 错误提示 -->
    <p v-if="error" class="error-message">
      {{ error }}
    </p>

    <!-- 显示店铺信息 -->
    <div v-if="shops.length > 0">
      <h2>店铺信息列表</h2>
      <el-table :data="shops" border style="width: 100%">
        <el-table-column prop="storeName" label="店铺名">
          <template #default="{ row }">
            <el-input v-model="row.storeName" placeholder="请输入店铺名" :disabled="!row.isNew" />
          </template>
        </el-table-column>
        <el-table-column prop="clientId" label="clientId">
          <template #default="{ row }">
            <el-input v-model="row.clientId" placeholder="请输入Client ID" />
          </template>
        </el-table-column>
        <el-table-column prop="apiKey" label="apiKey">
          <template #default="{ row }">
            <el-input v-model="row.apiKey" placeholder="请输入API Key" />
          </template>
        </el-table-column>

        <!-- 操作列：删除、提交、绑定 -->
        <el-table-column label="操作">
          <template #default="{ row, $index }">
            <!-- 删除按钮 -->
            <el-button size="small" type="danger" @click="deleteRecord($index)">
              删除
            </el-button>
            <!-- 提交按钮 -->
            <el-button size="small" type="primary" @click="submitRecord(row)" :disabled="row.isDisabled">
              确认提交
            </el-button>
            <!-- 绑定按钮 -->
            <el-button
              size="small"
              :type="row.isBound ? 'success' : 'default'"
              @click="bindCurrentRecord(row)"
              :disabled="row.isDisabled"
              :class="{ 'unbound-button': !row.isBound }"
            >
              {{ row.isBound ? "已绑定" : "绑定当前店铺" }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else-if="!loading">
      <p>暂无店铺信息。</p>
    </div>

    <!-- 添加记录按钮 -->
    <!--    <el-button type="primary" @click="addEmptyRecord"> -->
    <!--      添加一条记录 -->
    <!--    </el-button> -->

    <!-- 暂无数据提示 -->
  </div>
</template>

<style scoped lang="scss">
/* 添加一些样式以改善显示效果 */
.error-message {
  color: red;
  margin-top: 10px;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin-bottom: 20px;
}
.unbound-button {
  // 可以设置未绑定状态下按钮的一些样式，比如背景色、边框等
  background-color: #f0f0f0;
  border: 1px solid #ccc;
}
</style>
