import { defineStore } from "pinia"

interface ShopInfo {
  storeName: string
  userid: number
  apiKey: string
  clientId: string
  isBound?: boolean
  isDisabled?: boolean
  isNew?: boolean
}

export const useShopStore = defineStore("shop", {
  state: () => ({
    shops: [] as ShopInfo[],
    currentBoundShop: null as ShopInfo | null
  }),
  actions: {
    // 保存到 localStorage
    saveToLocalStorage() {
      localStorage.setItem("shops", JSON.stringify(this.shops))
      localStorage.setItem("currentBoundShop", JSON.stringify(this.currentBoundShop))
    },

    // 从 localStorage 加载
    loadFromLocalStorage() {
      const shops = localStorage.getItem("shops")
      const currentBoundShop = localStorage.getItem("currentBoundShop")

      if (shops) {
        this.shops = JSON.parse(shops) as ShopInfo[]
      }

      if (currentBoundShop) {
        this.currentBoundShop = JSON.parse(currentBoundShop) as ShopInfo | null
      }
    },
    bindShop(shop: ShopInfo) {
      // 如果已经绑定了店铺，先将其解绑
      if (this.currentBoundShop) {
        this.currentBoundShop.isBound = false
        this.currentBoundShop.isDisabled = false
      }

      // 设置当前绑定的店铺
      this.currentBoundShop = shop
      shop.isBound = true
      shop.isDisabled = true

      // 遍历所有店铺，禁用其他未绑定的店铺
      this.shops.forEach((s) => {
        if (s !== shop) {
          s.isBound = false
          s.isDisabled = false // 启用其他店铺的绑定按钮
        }
      })
      this.saveToLocalStorage() // 保存到 localStorage
    },

    setShops(shops: ShopInfo[]) {
      this.shops = shops
      this.saveToLocalStorage() // 保存到 localStorage
    },

    resetShops() {
      this.shops = []
      this.currentBoundShop = null // 清空已绑定的店铺
      this.saveToLocalStorage() // 保存到 localStorage
    }
  }
  // persist: true,  // 可选: 如果使用 pinia-plugin-persistedstate 插件，可以直接配置 `persist: true`
})
