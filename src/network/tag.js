import {request} from "@/network/request";

export function getTags(data) {
  return request({
    url:'/admin/tags/search',
    params:data
  })
}
//获取标签
export function getTagList(data) {
  return request({
    url:'/admin/tags',
    params:data
  })
}
//新增或者更新标签
export function addOrUpdateTag(data) {
  return request({
    url:'/admin/tags',
    method:'POST',
    data
  })
}
//删除标签
export function deleteTag(data) {
  return request({
    url:'/admin/tags',
    method:'DELETE',
    data
  })
}
