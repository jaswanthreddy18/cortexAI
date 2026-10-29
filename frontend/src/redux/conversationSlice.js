import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
    name: "conversation",
    initialState: {
        conversations: [null],
        selectedConversation: null,
    },
    reducers: {
        setConversations: (state, action) => {
            state.conversations = action.payload;
        },
        addConversation: (state, action) => {
            state.conversations.unshift(action.payload);
            state.selectedConversation = action.payload;
        },
        updateConversationTitle: (state, action) => {
            const { id, title } = action.payload;
            state.conversations = state.conversations.map((conversation) =>
                conversation?._id === id ? { ...conversation, title } : conversation
            );
        },
        removeConversation: (state, action) => {
            const id = action.payload;
            state.conversations = state.conversations.filter((conversation) => conversation?._id !== id);
            if (state.selectedConversation?._id === id) state.selectedConversation = null;
        },
        setSelectedConversation: (state, action) => {
            state.selectedConversation = action.payload;
        }
    }
})
export const { setConversations, addConversation, updateConversationTitle, removeConversation, setSelectedConversation } = conversationSlice.actions;
export default conversationSlice.reducer; 
