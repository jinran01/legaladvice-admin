import {request} from "@/network/request";

//获取分类
export function getCategories(data) {
  return request({
    url:"/admin/categories/search",
    params:data
  })
}

//获取分类列表
export function getCategoryList(data) {
  return request({
    url:"/admin/categories",
    params:data
  })
}
//分类新增或者更新
export function addOrUpdateCategory(data) {
  return request({
    url:"/admin/categories",
    method:"POST",
    data
  })
}
//删除分类
export function deleteCategory(data) {
  return request({
    url:'/admin/categories',
    method:'DELETE',
    data
  })
}
