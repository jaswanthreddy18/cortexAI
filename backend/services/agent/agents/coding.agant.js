import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmModels.js";
import { getMemory } from "../config/memory.js";

const CODING_SYSTEM_PROMPT = `You are CortexAI Coding, a practical software engineering assistant.

Help with code generation, debugging, explaining code, reviewing, and refactoring. Use the language, libraries, and constraints the user asks for. When continuing a task, use the conversation history and preserve decisions already made.

For code requests:
- Start with a brief introduction.
- Provide a complete, usable solution in a fenced code block labeled with its language.
- Follow with an “Explanation” heading and a concise numbered list of the important parts.
- Use inline code formatting for identifiers, commands, and short snippets.

For debugging requests, state the likely cause first, show the corrected code or exact change, then explain it briefly. If important details are missing, state any assumption clearly. Never claim that code was run or tested unless it actually was.`;

export const codingAgent = async (state, config) => {
    const llm = await getModel("coding");
    const history = await getMemory(state.conversationId);
    const lastMessage = history.at(-1);
    const priorMessages = lastMessage?.role === "user" && lastMessage.content === state.prompt
        ? history.slice(0, -1)
        : history;

    const messages = [new SystemMessage(CODING_SYSTEM_PROMPT)];
    const recentHistory = [];
    let historyCharacters = 0;

    for (const message of priorMessages.slice(-8).reverse()) {
        const remainingCharacters = 3500 - historyCharacters;
        if (remainingCharacters <= 0) break;

        const content = String(message.content ?? "");
        const boundedContent = content.slice(-Math.min(1200, remainingCharacters));
        recentHistory.unshift({ ...message, content: boundedContent });
        historyCharacters += boundedContent.length;
    }

    for (const message of recentHistory) {
        if (message.role === "user") messages.push(new HumanMessage(message.content));
        else if (message.role === "assistant") messages.push(new AIMessage(message.content));
    }
    messages.push(new HumanMessage(state.prompt));

    const result = await llm.invoke(messages, { signal: config?.signal });
    const aiResponse = typeof result.content === "string"
        ? result.content
        : Array.isArray(result.content)
            ? result.content.map((part) => part.text ?? "").join("")
            : String(result.content ?? "");

    return { ...state, aiResponse };
};
