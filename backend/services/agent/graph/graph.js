import { StateGraph } from "@langchain/langgraph";
import { agentState } from "./state.js";
import { router } from "./router.js";
import { pdfAgent } from "../agents/pdf.agant.js";
import { codingAgent } from "../agents/coding.agant.js";
import { pptAgent } from "../agents/ppt.agant.js";
import { visionAgent } from "../agents/vision.agant.js";
import { chatAgent } from "../agents/chat.agent.js";
import { searchAgent } from "../agents/search.agant.js";

const workflow = new StateGraph(agentState)
workflow.addNode("router", router)
workflow.addNode("chat", chatAgent)
workflow.addNode("search", searchAgent)
workflow.addNode("pdf", pdfAgent)
workflow.addNode("coding", codingAgent)
workflow.addNode("ppt", pptAgent)
workflow.addNode("vision", visionAgent)

workflow.addEdge("__start__", "router")
workflow.addConditionalEdges("router", (state) => {
    switch (state.agent) {
        case "chat":
            return "chat"
        case "search":
            return "search"
        case "pdf":
            return "pdf"
        case "coding":
            return "coding"
        case "ppt":
            return "ppt"
        case "vision":
            return "vision"
        default:
            return "chat"
    }
}, {
    chat: "chat",
    search: "search",
    pdf: "pdf",
    coding: "coding",
    ppt: "ppt",
    vision: "vision"
})

workflow.addEdge("search", "chat");
workflow.addEdge("chat", "__end__");
workflow.addEdge("coding", "__end__");
workflow.addEdge("ppt", "__end__");
workflow.addEdge("pdf", "__end__");
workflow.addEdge("vision", "__end__");

export const graph = workflow.compile()

