import api from "@/api";


const userService = {
    async getUserProfile(id) {
        return api.get(`/api/users/${id}/profile`); // API 호출
    },

    async updateProfile(request) {
        return api.patch(`/api/users/me`, request); // API 호출
    },

    async deleteCurrentUser(id) {
        return api.post(`/api/users/${id}/remove`); // API 호출
    },
};

export default userService;