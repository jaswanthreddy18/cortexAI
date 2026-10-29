import { configureStore } from '@reduxjs/toolkit'
import userReducer from "./userSlice.js"
import conversationReducer from "./conversationSlice.js"
import messageReducer from "./messageSlice.js"

const store = configureStore({
    reducer: {
        user: userReducer,
        conversation: conversationReducer,
        message: messageReducer,
    }
})


export default store;