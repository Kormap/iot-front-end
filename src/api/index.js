import axios from "axios";

const api = axios.create({
    headers: {
        "Content-Type": "application/json",
    },
    baseURL: process.env.VUE_APP_API_BASE_URL,
    // timeout: 5000, // 요청 타임아웃 (선택)
});

// 요청 인터셉터 (선택)
api.interceptors.request.use(
    (config) => {
        // 예: 토큰이 있다면 헤더에 추가
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터 (선택)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API 요청 중 오류 발생:", error);
        return Promise.reject(error);
    }
);

export default api;
