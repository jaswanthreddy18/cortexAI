import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmModels.js";
import { getMemory } from "../config/memory.js";
import { createPdfBuffer } from "../utils/pdfDocument.js";

const PDF_SYSTEM_PROMPT = `You are CortexAI PDF, an assistant for understanding PDF documents.

Use the supplied PDF text as the source of truth for document-specific questions. Never invent facts, quotations, page numbers, or sections. If the answer is not present in the supplied text, say that clearly and ask what the user would like to check next.

Help the user summarize, ask questions, extract facts, explain difficult passages, compare sections, and find action items or dates.

When page markers such as [Page 4] are present, cite the relevant page in the answer. Keep quotations short. For summaries, use a brief overview followed by useful headings or bullets. For simple questions, answer directly without unnecessary sections. Use plain language and preserve important names, numbers, dates, and qualifications.

If no PDF text is supplied, explain that no document text reached the agent and ask the user to attach the PDF or paste its text. Do not pretend to have read a file.`;

const getDocumentText = (state) => {
    const value = state.pdfText ?? state.documentText ?? "";
    return typeof value === "string" ? value.trim() : "";
};

const isPdfCreationRequest = (prompt) =>
    /\b(?:create|generate|make|prepare|write|produce|give\s+me)\b.{0,80}\b(?:pdf|document|report)\b/i.test(prompt)
    || /\b(?:pdf|document|report)\b.{0,80}\b(?:about|on|covering|regarding)\b/i.test(prompt);

const makePdfFileName = (content) => {
    const title = content.match(/^\s*#\s+(.+)$/m)?.[1]
        ?? content.split("\n").find((line) => line.trim())
        ?? "CortexAI document";
    const slug = title
        .replace(/^#+\s*/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .split("-")
        .slice(0, 8)
        .join("-");
    return `${slug || "cortexai-document"}.pdf`;
};

export const pdfAgent = async (state, config) => {
    const pdfText = getDocumentText(state);
    if (!pdfText) {
        if (isPdfCreationRequest(state.prompt ?? "")) {
            const model = await getModel("pdf");
            const result = await model.invoke([
                new SystemMessage(`You are CortexAI PDF, a writer that creates clear, accurate PDF-ready documents.

Write a complete, self-contained educational document in Markdown for the user's requested topic. Begin with one # title, then use concise section headings, short paragraphs, and useful bullet lists. Include an introduction and conclusion. Explain technical terms in plain language. Do not include a fabricated bibliography, citations, statistics, or claims of current data. Keep the document focused and appropriate for a short PDF (about 500 to 800 words). Return only the document content, without a preamble.`),
                new HumanMessage(state.prompt),
            ], { signal: config?.signal });
            const documentContent = typeof result.content === "string"
                ? result.content
                : Array.isArray(result.content)
                    ? result.content.map((part) => part.text ?? "").join("")
                    : String(result.content ?? "");
            if (!documentContent.trim()) {
                throw new Error("The PDF writer returned an empty document");
            }

            const fileName = makePdfFileName(documentContent);
            const pdfBuffer = createPdfBuffer(documentContent);
            return {
                ...state,
                aiResponse: `I created **${fileName}** for you. Download it below.`,
                pdfAttachment: {
                    fileName,
                    mimeType: "application/pdf",
                    data: pdfBuffer.toString("base64"),
                },
            };
        }

        return {
            ...state,
            aiResponse: "To answer questions about a PDF, attach the document text or paste the relevant section. You can also ask me to create a PDF by naming a topic.",
        };
    }

    const model = await getModel("pdf");
    const history = await getMemory(state.conversationId);
    const lastMessage = history.at(-1);
    const priorMessages = lastMessage?.role === "user" && lastMessage.content === state.prompt
        ? history.slice(0, -1)
        : history;

    const messages = [new SystemMessage(PDF_SYSTEM_PROMPT)];
    let historyCharacters = 0;
    const recentHistory = [];

    for (const message of priorMessages.slice(-6).reverse()) {
        const remainingCharacters = 1800 - historyCharacters;
        if (remainingCharacters <= 0) break;

        const content = String(message.content ?? "").slice(-Math.min(700, remainingCharacters));
        recentHistory.unshift({ ...message, content });
        historyCharacters += content.length;
    }

    for (const message of recentHistory) {
        if (message.role === "user") messages.push(new HumanMessage(message.content));
        else if (message.role === "assistant") messages.push(new AIMessage(message.content));
    }

    const documentName = String(state.pdfName ?? state.documentName ?? "Attached PDF").trim();
    messages.push(new HumanMessage(
        `PDF document: ${documentName}\n\nPDF text:\n${pdfText.slice(0, 24000)}\n\nUser request:\n${state.prompt}`
    ));

    const result = await model.invoke(messages, { signal: config?.signal });
    const aiResponse = typeof result.content === "string"
        ? result.content
        : Array.isArray(result.content)
            ? result.content.map((part) => part.text ?? "").join("")
            : String(result.content ?? "");

    return { ...state, aiResponse };
};
