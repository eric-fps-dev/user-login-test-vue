import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

const WHITELIST_URLS = [
    '/auth/verify-credentials',
    '/auth/send-sms-code',
    '/auth/verify-sms-code-login'    
];


api.interceptors.request.use(
    (config) => {
        const isWhitelisted = WHITELIST_URLS.some(url => config.url.includes(url));
        if (isWhitelisted) {
            console.log(`Request to auth whitelist: ${config.url}`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


export const verifyCredentials = (username, password) => 
    api.post('/auth/verify-credentials', { username, password });

export const sendSMSCode = (username, country_code, phone_number, auth_token) =>
    api.post('/sms/send-sms-code', { username, country_code, phone_number, auth_token });

export const loginWithCode = (username, country_code, phone_number, verification_code, ip_address, device_id) =>
    api.post('/auth/verify-sms-code-login', {
        username,
        country_code,
        phone_number,
        verification_code,
        ip_address,
        device_id });

export const refresh = () => {
    return api.post('/auth/refresh')
}

export const logout = () => {
    return api.post('/auth/logout');
}

export const getCurrentUser = () => {
    return api.get('/users/me');
}

