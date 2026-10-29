import express from 'express';
import { createConversation, getConversation, updateConversation, deleteConversation, saveMessage, getMessage } from '../controllers/chat.controller.js';

const router = express.Router();

router.get("/create-conversation", createConversation);
router.get("/get-conversations", getConversation);
router.post("/update-conversation", updateConversation);
router.post("/delete-conversation", deleteConversation);
router.post("/save-message", saveMessage);
router.get("/get-messages/:conversationId", getMessage);

export default router;
