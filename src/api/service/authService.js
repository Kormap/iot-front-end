import api from "@/api";


const authService = {
    async fetchTest(data) {
        return api.get("/api/auth/".concat(data)); // API 호출
    },

    // TODO : API console.log 삭제(확인용)
    async verifyEmailSend(data) {
        console.log(data);
        return api.post("api/auth/users/verify-email/send", data); // API 호출
    },
    async verifyEmail(data) {
        console.log(data);
        return api.post("/api/auth/users/verify-email", data); // API 호출
    },
    async signUp(data) {
        console.log(data);
        return api.post("/api/auth/signup", data); // API 호출
    }
};

export default authService;