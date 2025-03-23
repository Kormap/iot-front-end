import api from "@/api";

const sensorService = {
    async getSensorsData(userId, sensorType) {
        return api.get(`/api/sensor/users/${userId}/sensor-data`,
            {
                params: {sensorType: sensorType}    // 쿼리파라미터 전달
            });
    },
    async getSensorsThreshold(userId) {
        return api.get(`/api/sensor/users/${userId}/sensor-threshold`);
    },

    async getSensorsWarning(userId) {
        return api.get(`/api/sensor/users/${userId}/sensor-warning`);
    },
};

export default sensorService;