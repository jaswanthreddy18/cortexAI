import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";
import redis from "../../../shared/redis/redis.js";
import { getModel } from "../config/llmModels.js";

export const agent = async(req, res) => {
    const abortController = new AbortController();
    res.on("close", () => {
        if (!res.writableEnded) {
            abortController.abort(new Error("Client stopped the request"));
        }
    });

    try { 
        const {prompt, conversationId, agent, generateTitle, pdfText, pdfName} = req.body;
        await redis.del(`messages-${conversationId}`);
        const r = await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
            conversationId: conversationId,
            role: "user",
            content: prompt
        });
        const graphRun = graph.invoke({
            prompt,
            conversationId,
            agent,
            pdfText,
            pdfName,
        }, { signal: abortController.signal });
        const titleRun = generateTitle
            ? (async () => {
                const model = await getModel("chat");
                const titleResult = await model.invoke([
                    {
                        role: "system",
                        content: "Write a concise, human-readable title describing the main topic of this conversation. Use 3 to 6 words. Return only the title, with no quotes or explanation.",
                    },
                    { role: "human", content: prompt },
                ], { signal: abortController.signal });
                const titleText = typeof titleResult.content === "string"
                    ? titleResult.content
                    : titleResult.content.map((part) => part.text ?? "").join("");
                const title = titleText.replace(/^['"#\s]+|['"#\s]+$/g, "").split(/\s+/).slice(0, 6).join(" ");
                if (title) {
                    await axios.post(`${process.env.CHAT_SERVICE}/update-conversation`, {
                        id: conversationId,
                        title,
                    }, { signal: abortController.signal });
                }
                return title;
            })().catch((error) => {
                console.error("Could not generate conversation title:", error.message);
                return null;
            })
            : Promise.resolve(null);
        const titleResult = titleRun;
        const [result, title] = await Promise.all([
            graphRun,
            titleResult,
        ]);
        if (abortController.signal.aborted || res.destroyed) return;

        const response = result.aiResponse;
        if (typeof response !== "string" || !response.trim()) {
            throw new Error("The selected agent returned an empty response");
        }
        await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
            conversationId: conversationId,
            role: "assistant",
            content: response,
            images: result.images,
            pdfAttachment: result.pdfAttachment,
            pptAttachment: result.pptAttachment,
        }, { signal: abortController.signal });
        if (abortController.signal.aborted || res.destroyed) return;
        await addMessage(conversationId, "user", prompt);
        await addMessage(conversationId, "assistant", response);
        return res.status(200).json({
            answer: result.aiResponse,
            images: result.images,
            pdfAttachment: result.pdfAttachment,
            pptAttachment: result.pptAttachment,
            title,
        });
    } catch (error) {
        if (abortController.signal.aborted || res.destroyed) return;
        const status = error.response?.status ?? 500;
        const message = error.response?.data?.error?.message
            ?? error.response?.data?.message
            ?? error.message;
        console.error("Agent request failed:", message);
        return res.status(status).json({ message });
    }
}       
