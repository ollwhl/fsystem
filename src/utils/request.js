import axios from 'axios'
const request = axios.create({
    baseURL:'http://192.168.0.139:8081',
    timeout: 5000
})

request.interceptors.request.use(config => {
    config.headers['Content-Type'] = 'application/json;charset=utf-8';

    return config;
},error => {
    return Promise.reject(error)
});

request.interceptors.response.use(
    response => {
        let res = response.data;
        if(typeof res === 'string'){
            res=res?JSON.parse(res):res
        }
        return res;
    },
    error =>{
        console.log('error'+error)//for debug
        return Promise.reject(error)
    }
)
export default request
