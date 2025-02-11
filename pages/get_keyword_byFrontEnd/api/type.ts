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
  productname: string
  time: any
  keywords: any
  keywordNumber: any
}

export interface RequestData {
  category3: string
  weight: number
  cost: number
  sale: number
}

export interface GetKeywordRequestData {
  productname: any
  keywordNumber: any
}
