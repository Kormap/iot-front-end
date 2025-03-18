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
        if (error.response) {
            // 서버에서 반환된 에러 응답을 처리
            return Promise.resolve(error.response); // error.response를 반환하여 response처럼 처리 가능
        }
        return Promise.reject(error); // 네트워크 오류 등은 그대로 에러로 처리
    }
);

export default api;
