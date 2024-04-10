import {request} from "@/network/request";

//获取文章列表
export function getArticles(data){
    return request({
        url:"/admin/articles",
        params:data
    })
}
//通过Id获取文章列表
export function getArticleById(id){
    return request({
        url:`/admin/articles/${id}`,
    })
}

//保存或更新文章
export function addOrUpdateArticle(data){
    return request({
        url:"/admin/articles",
        method:"POST",
        data
    })
}
//文章置顶
export function articleIsTop(data){
    return request({
        url:"/admin/articles/top",
        method:"PUT",
        data
    })
}
//文章恢复或逻辑删除
export function reviewOrRemove(data){
    return request({
        url:"/admin/articles",
        method:"PUT",
        data
    })
}
//文章物理删除
export function deleteArticle(data){
    return request({
        url:"/admin/articles",
        method:"DELETE",
        data
    })
}
//上传文章中的图片
export function uploadPhoto(data){
    return request({
        url:"https://spring-boot-blog-api.oss-cn-hangzhou.aliyuncs.com/",
        method:"POST",
        data
    })
}