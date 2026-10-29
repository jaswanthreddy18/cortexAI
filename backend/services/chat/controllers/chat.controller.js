import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const createConversation = async (req, res) => {
    try {
        const userId = req.get("x-user-id");
        // console.log(userId);
        const conversation = await Conversation.create({
            userId: userId
        });
        return res.json({ conversation });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: `create conversation error ${error}` });
    }
}

export const getConversation = async (req, res) => {
    try {
        const userId = req.get("x-user-id");
        // console.log(userId);
        const conversations = await Conversation.find({
            userId: userId
        }).sort({ updatedAt: -1 });
        return res.json({ conversations });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: `get conversation error ${error}` });
    }
}

export const updateConversation = async (req, res) => {
    try {
        const { id, title } = req.body;

        const conversation = await Conversation.findByIdAndUpdate(id, {
            title
        }, { new: true });
        return res.json({ conversation });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: `update conversation error ${error}` });
    }
}
export const deleteConversation = async (req, res) => {
    try {
        const { id } = req.body;
        const userId = req.get("x-user-id");
        const conversation = await Conversation.findOneAndDelete({ _id: id, userId });
        if (!conversation) return res.status(404).json({ message: "Conversation not found" });

        await Message.deleteMany({ conversationId: conversation._id });
        return res.json({ message: "Conversation deleted successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: `delete conversation error ${error}` });
    }
}

export const saveMessage = async (req, res) => {
    try {
        const { conversationId, role, content, images, pdfAttachment, pptAttachment } = req.body;
        // console.log(conversationId, role, content);
        const message = await Message.create({
            conversationId: conversationId,
            role: role,
            content: content,
            images,
            pdfAttachment,
            pptAttachment,
        });
        return res.json({ message });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: `save message error ${error}` });
    }
}

export const getMessage = async (req, res) => {
    try {

        const message = await Message.find({ conversationId: req.params.conversationId }).sort({ createdAt: 1 });
        return res.json({ message });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: `get message error ${error}` });
    }
}

