import {defineStore} from "pinia";

export const useUserInfoStore = defineStore('user', {
    state: () => ({
        testName: "원래이름",
        orgName: "원래이름",
        password: null
    }),
    getters: {
        clientName: state => state.testName.concat("님"),
    },
    actions: {
        changeName() {
            this.testName = "변경된이름";
            console.log(this.orgName);
        }
    }
})