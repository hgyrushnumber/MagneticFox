import type * as Table from "./type"
import { request } from "@/http/axios"

/** 增 */
export function createTableDataApi(data: Table.CreateOrUpdateTableRequestData) {
  return request({
    url: "",
    method: "post",
    data
  })
}

/** 删 */
// export function deleteTableDataApi(productnumber: string) {
//   return request({
//     url: `${productnumber}`,
//     method: "post"
//   })
// }

/** 改 */
export function updateTableDataApi(data: Table.CreateOrUpdateTableRequestData) {
  return request({
    url: "table",
    method: "put",
    data
  })
}

/** 查 */
export function getTableDataApi(params: Table.TableRequestData) {
  return request({
    url: "getAllKeywordInfo",
    method: "get",
    params,
    withCredentials: true // 添加此行，携带 cookie
  })
}
