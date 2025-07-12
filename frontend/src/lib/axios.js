import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://ee8f3ea755bb.ngrok-free.app/api",
    withCredentials: true,
    // headers:{
    //     "Content-Type": "application/json",
    // }
})

export default axiosInstance;