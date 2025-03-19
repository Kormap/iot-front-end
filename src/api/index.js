import axios from "axios";

const api = axios.create({
    headers: {
        "Content-Type": "application/json",
    },
    baseURL: process.env.VUE_APP_API_BASE_URL,
    withCredentials: true, // 쿠키 포함 송신
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
        return Promise.reject(error); // 네트워크 오류 등은 그대로 에러로 처리
    }
);

export default api;
