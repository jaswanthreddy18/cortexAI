import api from "../../utils/axios";
async function sendMessage(payload, signal) {
    try {
        const {data} = await api.post(`/api/agent/chat`, payload, { signal });
        return data
    } catch (error) {
        if (error.code === 'ERR_CANCELED') return null;
        console.error(error);
        return {
            error: error.response?.data?.message
                ?? error.response?.data?.error?.message
                ?? error.message
                ?? 'The request failed.',
        };
    }
}

export default sendMessage
