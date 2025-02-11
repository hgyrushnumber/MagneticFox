export interface CreateOrUpdateTableRequestData {
  id?: string
  username: string
  password?: string
}

export interface TableRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  /** 查询参数：用户名 */
  username?: string
}

export interface TableData {
  sku: string
  productname: string
  category3: string
  weight: string
  cost: string
  sale: string
  logistics: boolean
  userid: string
}


export interface ShopInfo {
  storeName: string
  userid: number
  apiKey: string
  clientId: string
  isBound?: boolean // 标记是否已绑定
  isDisabled?: boolean // 用于禁用按钮
  isNew?: boolean
}
