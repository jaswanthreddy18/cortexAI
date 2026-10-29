import api from "../../utils/axios";

export const deleteConversation = async (id) => {
  try {
    const { data } = await api.post("/api/chat/delete-conversation", { id });
    return data;
  } catch (error) {
    console.error("Could not delete conversation:", error.response?.data ?? error.message);
    return null;
  }
};
