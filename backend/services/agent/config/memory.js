import { getMessages } from "../utils/getMessages.js";
import redis from "../../../shared/redis/redis.js"
export const getMemory = async (conversationId) => {
    try {
        const key = `messages-${conversationId}`;
        const cached = await redis.get(key);
        if(cached){
            return JSON.parse(cached);
        }
        const messages = await getMessages(conversationId)
        await redis.set(key, JSON.stringify(messages), "EX", 24 * 60 * 60);
        return messages;
    } catch (error) {
        console.log("Memory error:",error);
        throw error;
    }   
}

export const addMessage = async (conversationId, role, content) => {
    try {
        const key = `messages-${conversationId}`;
        const rawmessages = await redis.get(key);
        const messages = rawmessages? JSON.parse(rawmessages) : []
        messages.push({role, content});
        if(messages.length>20){
            messages.shift();
        }
        await redis.set(key, JSON.stringify(messages), "EX", 24 * 60 * 60);
    } catch (error) {
        console.log("Memory error:",error);
        throw error;
    }
}