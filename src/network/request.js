import axios from 'axios';
import router from "@/router";
import {ElMessage} from 'element-plus'

export function request(config) {
    const instance = axios.create(
        {
            baseURL: "/api",
            timeout: 5000
        }
    );
    //请求拦截
    instance.interceptors.request.use(config => {
        // 直接放行
        return config;
    }, err => {
        console.log(err)
    })
    //相应拦截
    instance.interceptors.response.use(res => {
        switch (res.data.code) {
            case 40001:
                ElMessage.error(res.data.message)
                router.push({path: "/login"});
                break;
            case 50000:
                ElMessage.error(res.data.message)
                break;
        }
        return res.data;
    }, error => {
        // return ElMessage.error(error)
        return error
    })
    return instance(config)
}
