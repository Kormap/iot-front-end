import api from "@/api";


const authService = {
    async fetchTest(data) {
        return api.get("/api/auth/".concat(data)); // API 호출
    }
};

export default authService;