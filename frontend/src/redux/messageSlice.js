import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
    name: "message",
    initialState: {
        messages: [],
        isSending: false,
    },
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        setIsSending: (state, action) => {
            state.isSending = action.payload;
        },
    }
})
export const { setMessages, addMessage, setIsSending } = messageSlice.actions;
export default messageSlice.reducer; 
