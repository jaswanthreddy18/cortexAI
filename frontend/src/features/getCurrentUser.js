import api from "../../utils/axios"


const getCurrentUser = async () => {
    try {
        const { data } = await api.get("/api/me");
        return data
    } catch (error) {
        console.log("Backend error:", error.response?.data);
        console.log("Status:", error.response?.status);
    }
}
export default getCurrentUser;