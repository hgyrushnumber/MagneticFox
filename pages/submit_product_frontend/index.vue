<script setup lang="ts">
import { useShopStore } from "@/pinia/stores/bindstore"
import axios from "axios"
import { onMounted, reactive, ref } from "vue"
import { useRoute } from "vue-router"

// 定义店铺信息接口类型
interface ShopInfo {
  storeName: string
  userid: number
  apiKey: string
  clientId: string
  isBound?: boolean // 标记是否已绑定
  isDisabled?: boolean // 用于禁用按钮
  isNew?: boolean
}

const formData = reactive({
  sku: "",
  name: "",
  offer_id: "",
  currency_code: "",
  old_price: "",
  price: "",
  vat: "",
  storeName: "",
  apiKey: "",
  clientId: "",
  category3: ""
})

// 从插件获得sku
onMounted(() => {
  const route = useRoute()
  const sku = route.query.sku
  const goodnessOnMounted = route.query.goodname
  const category3 = route.query.category3
  // 如果查询参数中有 sku，将其赋值到 formData.sku 中
  if (sku && goodnessOnMounted && category3) {
    formData.sku = sku as string
    formData.name = goodnessOnMounted as string
    formData.category3 = category3 as string
  }

  // 使用 SKU 进行进一步操作
  console.log("Received SKU from router:", sku, "和", goodnessOnMounted, "和", category3)
})

// 用于控制加载状态
const loading1 = ref(false)
// 响应式数据
// 用于控制错误提示
const error = ref<string | null>(null)
// 用于存储获取到的店铺信息数组
const shops = ref<ShopInfo[]>([])
// const selectedShop = ref<number | string | null>(null) // 选中的店铺ID

// 查询店铺信息的函数
async function viewShopInfo() {
  loading1.value = true // 开始加载
  error.value = null // 清空错误信息

  try {
    const response = await axios.get("/api/selectUserStore", {
      withCredentials: true // 允许携带 Cookie
    })

    if (response.data.code === 0) {
      shops.value = response.data.data || [] // 赋值返回的店铺信息
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

onMounted(() => {
  viewShopInfo() // 页面加载时查询店铺信息
  console.log("Loaded shops:", shops.value)
})

const submittedData = ref({
  code: "",
  message: ""
})

const isPriceInvalid = ref(false)
const isSubmitting = ref(false) // 是否正在提交
const loading = ref(false)
const isSubmitting1 = ref(false)

async function submitForm() {
  isSubmitting.value = true // 开始提交，按钮禁用
  // 价格验证逻辑
  if (Number.parseFloat(formData.old_price) < Number.parseFloat(formData.price)) {
    isPriceInvalid.value = true
    return
  }

  // 获取当前绑定的店铺
  const shopStore = useShopStore()
  const currentShop = shopStore.currentBoundShop

  try {
    formData.vat = "0"
    formData.currency_code = "RU"
    formData.offer_id = ""
    formData.old_price = ""
    formData.price = ""

    // formData.old_price = "9999999999"

    if (currentShop) {
      formData.storeName = currentShop.storeName
      formData.apiKey = currentShop.apiKey
      formData.clientId = currentShop.clientId
    }

    loading.value = true

    // 替换成你实际的后端API地址
    const response = await axios.post("/api/addGoodsBysku", formData, {
      withCredentials: true // 允许携带 cookie
    })

    submittedData.value = { code: String(response.data.code), message: response.data.message } // 显示提交的返回数据
    console.log(`response.data${response.data}`)
    console.log(`response.data${response.data.code}`)
    console.log(`submittedData.code:${submittedData.value.code}`)
  } catch (error) {
    console.error("Error:", error)
    submittedData.value = { code: "1", message: "提交失败" }
  } finally {
    loading.value = false
    isSubmitting.value = false // 完成提交，按钮恢复可用
  }
}

// 处理店铺选择变化的事件
function handleStoreChange(row: any) {
  // 找到选中的店铺信息
  const selectedStore = shops.value.find(store => store.storeName === row.storeName)
  if (selectedStore) {
    // 更新 formData 中的 apiKey 和 clientId
    formData.apiKey = selectedStore.apiKey
    formData.clientId = selectedStore.clientId
  }
}

// 处理"解决未成功上货问题"按钮点击
async function handleAddProblem(row: any) {
  isSubmitting1.value = true
  const selectedStore = shops.value.find(store => store.storeName === row.storeName)
  if (selectedStore) {
    // 打印店铺信息和 offer_id
    console.log("店铺信息:", selectedStore)
    console.log("商品货号 (offer_id):", row.offer_id)

    // 你可以根据这里的值进一步处理解决未成功上货问题的逻辑
    // 比如：调用API或者进行其他操作
    try {
      // 向后端发送消息
      const response = await axios.post(
        "/api/getGoodInfoByOfferId",
        {
          storeName: selectedStore.storeName,
          apiKey: selectedStore.apiKey,
          clientId: selectedStore.clientId,
          offerId: row.offer_id,
          old_price: row.old_price,
          price: row.price
        },
        {
          withCredentials: true // 确保携带cookie（如果需要）
        }
      )

      if (response.data.code === 0) {
        // 处理成功的情况
        console.log("问题已解决，后端响应:", response.data.message)
        // 你可以根据返回的结果进行一些后续操作，如弹出成功提示
      } else {
        // 处理失败的情况
        console.error("解决问题失败:", response.data.message)
      }
    } catch (error) {
      // 捕获错误并处理
      console.error("请求失败:", error)
    }
  }
}
// 更新 old_price 的方法
// const updateOldPrice = (row: any) => {
//   // 更新 formData.old_price 为 formData.price + 10
//   if (row.price && !isNaN(row.price)) {
//     formData.old_price = String(parseFloat(row.price) + 10)
//   }
// }
</script>

<template>
  <div>
    <p>当前操作商品的SKU: {{ formData.sku }}</p>
    <!-- 按钮：点击提交商品 -->
    <!--    <el-button type="success" @click="submitForm" :loading="loading">提交商品信息</el-button> -->

    <!-- 错误提示 -->
    <p v-if="isPriceInvalid" class="error-message">
      折扣前价格不能小于您的价格，请重新输入。
    </p>

    <!-- 商品信息表格 -->
    <div v-if="formData">
      <h2>商品信息表单</h2>
      <el-table :data="[formData]" border style="width: 100%">
        <el-table-column prop="sku" label="SKU">
          <template #default="{ row }">
            <el-input v-model="row.sku" placeholder="请输入SKU" required />
          </template>
        </el-table-column>

        <el-table-column prop="name" label="商品名称">
          <template #default="{ row }">
            <el-input v-model="row.name" placeholder="请输入商品名称" required />
          </template>
        </el-table-column>
        <el-table-column prop="category3" label="三级类目">
          <template #default="{ row }">
            <el-input v-model="row.category3" placeholder="请输入三级类目" required />
          </template>
        </el-table-column>
        <!--        <el-table-column prop="offer_id" label="货号"> -->
        <!--          <template #default="{ row }"> -->
        <!--            <el-input v-model="row.offer_id" placeholder="请输入货号" required /> -->
        <!--          </template> -->
        <!--        </el-table-column> -->

        <!--        <el-table-column prop="old_price" label="折扣前价格"> -->
        <!--          <template #default="{ row }"> -->
        <!--            <el-input v-model="row.old_price" type="number" placeholder="请输入折扣前价格" required /> -->
        <!--          </template> -->
        <!--        </el-table-column> -->

        <!--        <el-table-column prop="price" label="您的价格"> -->
        <!--          <template #default="{ row }"> -->
        <!--            <el-input v-model="row.price" type="number" placeholder="请输入您的价格" required /> -->
        <!--          </template> -->
        <!--        </el-table-column> -->

        <el-table-column label="您的店铺">
          <template #default="{ row }">
            <!-- 使用 el-select 来替代 el-input -->
            <el-select v-model="row.storeName" placeholder="请选择您的店铺" required @change="handleStoreChange(row)">
              <!-- 遍历店铺列表 -->
              <el-option v-for="store in shops" :key="store.apiKey" :label="store.storeName" :value="store.storeName" />
            </el-select>
          </template>
        </el-table-column>

        <!-- 操作列：提交按钮 -->
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="submitForm" :disabled="isPriceInvalid || isSubmitting">
              提交
            </el-button>
          </template>
        </el-table-column>

        <!-- 提交结果列 -->
        <el-table-column label="提交结果">
          <template #default="{ row }">
            <div v-if="submittedData.code === '0'" class="submitted-data">
              <h2>提交商品成功</h2>
            </div>
            <div v-else-if="submittedData.code === '1'" class="submitted-data">
              <h2>提交商品失败</h2>
            </div>
            <div v-else class="submitted-data">
              <h2>未提交商品</h2>
            </div>
          </template>
        </el-table-column>
        <!-- 操作列：解决未成功上货问题按钮 -->
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleAddProblem(row)">
              解决未成功上货问题
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.el-table {
  margin-top: 20px;
}

.el-table-column {
  width: 200px;
}

.el-table-column .cell {
  text-align: left;
}

.error-message {
  color: red;
  font-weight: bold;
}

.submitted-data h2 {
  margin-top: 20px;
}
</style>
