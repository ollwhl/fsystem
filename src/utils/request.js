import axios from 'axios'
const request = axios.create({
    baseURL:'http://localhost:8081/api',
    timeout: 5000
})

request.interceptors.request.use(config => {
    config.headers['Content-Type'] = 'application/json;charset=utf-8';
    const user = localStorage.getItem("user");
    if(user){
        config.headers['token'] = JSON.parse(user).token
    }
    // if (config.method === 'get') {
    //     if (user) {
    //         config.params['token'] = JSON.parse(user).token;
    //     }
    // }
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
