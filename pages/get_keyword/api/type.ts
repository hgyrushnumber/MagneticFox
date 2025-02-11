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
  productnumber: string
  category3: string
  weight: string
  cost: string
  sale: string
  logistics: boolean
  userid: string
  rate: string
  commissions: any
  profit: any
  shipping_cost: any
  storeName: any
  oldprice: any
  newprice: any
  createTime: any
  newProfit: any
  rfbs: string
  rfbsStandard: string
  rfbsEconomic: string
  keywordNumber: string
  keywords: any
}

export interface RequestData {
  category3: string
  weight: number
  cost: number
  sale: number
}

export interface RequestDataWeight {
  productnumber: any
  storeName: any
}

export interface RequestDataSubmitProduct {
  productnumber: any
  storeName: any
  sale: any
  cost: any
}
export interface GetKeywordRequestData {
  productname: any
  keywordNumber: any
}
