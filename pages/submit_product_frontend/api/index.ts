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
export function deleteTableDataApi(id: string) {
  return request({
    url: `table/${id}`,
    method: "delete"
  })
}

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
    url: "TableGetAllProductFrontEnd",
    method: "get",
    params
  })
}
