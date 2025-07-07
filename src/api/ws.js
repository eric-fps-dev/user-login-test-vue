import axios from "axios";
import config from "./config";

const api = axios.create({
    baseURL: config.MAINTENANCE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

export const getOnlineUsers = () => 
    api.get('/ws/online');