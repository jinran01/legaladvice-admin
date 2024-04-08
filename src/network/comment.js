import {request} from "@/network/request";

export function getCommentList(data) {
    return request({
        url:"/admin/comments",
        params:data
    })
}

//通过评论
export function reviewComments(data) {
    return request({
        url:"/admin/comments/review",
        method:"PUT",
        data
    })
}

//删除评论
export function deleteComments(data) {
    return request({
        url:"/admin/comments",
        method:"DELETE",
        data
    })
}