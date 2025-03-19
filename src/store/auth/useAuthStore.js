import {defineStore} from "pinia";
import authService from "@/api/service/authService";
import router from "@/router";

export const useUserInfoStore = defineStore('userInfo', {
    state: () => ({
        id: null,
        email: null,
        name: null,
        phoneNumber: null,
    }),
    getters: {
        clientName: state => {
            if (state.name !== null && state.name !== undefined) {
                return state.name.concat("님")
            }
            return "사용자님";
        }
    },
    actions: {
        // TEST 용
        changeName() {
            this.name = "변경된이름";
            console.log(this.name);
        },
        // 로그인 로직
        async login(formData) {
            try {
                const response = await authService.login(formData);
                // const metaData = response.data.metaData;
                const data = response.data.data;
                // API 응답 데이터를 상태에 저장
                this.id = data.id;
                this.email = data.email;
                this.name = data.name;
                this.phoneNumber = data.phoneNumber;

                // 로그인 정보를 localStorage에 저장
                localStorage.setItem("userInfo", JSON.stringify({
                    id: data.id,
                    email: data.email,
                    name: data.name,
                    phoneNumber: data.phoneNumber,
                }));

                await router.push("/monitor");
            } catch (error) {
                if (error.response) {
                    const metaData = error.response.data.metaData;
                    alert(metaData.message);
                } else {
                    console.error("로그인 실패:", error.message);
                }
            }
        },

        // 새로고침 시 localStorage에서 데이터 복원
        async restoreUserInfo() {
            const userInfo = localStorage.getItem("userInfo");
            if (userInfo) {
                const parsedUserInfo = JSON.parse(userInfo);
                this.id = parsedUserInfo.id;
                this.email = parsedUserInfo.email;
                this.name = parsedUserInfo.name;
                this.phoneNumber = parsedUserInfo.phoneNumber;
            }
        },

        // 로그아웃 로직
        async logout() {
            try {
                await authService.logout();
                this.id = null;
                this.email = null;
                this.name = null;
                this.phoneNumber = null;

                // localStorage에서 정보 제거
                localStorage.removeItem("userInfo");

            }catch (error) {
                if (error.response) {
                    const metaData = error.response.data.metaData;
                    alert(metaData.message);
                } else {
                    console.error(error.message);
                }
            }
            await router.push("/login");
        }
    }
})