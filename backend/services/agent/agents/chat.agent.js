import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmModels.js"
import { getMemory } from "../config/memory.js";

export const chatAgent = async (state, config) => {
    if (state.aiResponse) return state;

    const llm = await getModel("chat");
    const history = await getMemory(state.conversationId);
    const searchResults = Array.isArray(state.searchResults)
        ? state.searchResults
        : state.searchResults?.results ?? [];
    const conciseSearchResults = searchResults.slice(0, 3).map((result) => ({
        title: result.title,
        url: result.url,
        content: String(result.content ?? "").slice(0, 700),
    }));
    const searchContext = conciseSearchResults.length
        ? `\nUse these search results to answer accurately:\n${JSON.stringify(conciseSearchResults)}`
        : "";
    const systemPrompt = `
You are CortexAI, a helpful assistant. Make every response easy to understand.
${searchContext}
- Do not mention internal tools.

Formatting rules:
- Start with a direct answer. Use a short heading only when it improves clarity.
- Prefer plain language. Explain technical terms the first time you use them.
- Use numbered steps for instructions and bullets for related points.
- Use tables only when comparing items or presenting structured facts.
- Format code in fenced blocks with the language name, such as \`\`\`java.
- For programming answers, add a short introduction, a language-labeled code block, and an “Explanation” section with concise numbered steps. Use inline code formatting for identifiers.
- Keep paragraphs short and remove unnecessary repetition.
- Use “In short” instead of “TL;DR”.
- Do not include empty headings, empty quotes, or decorative Markdown.
`;
    const messages = [
        new SystemMessage(systemPrompt)
    ]

    const lastMessage = history.at(-1);
    const previousMessages = lastMessage?.role === "user" && lastMessage.content === state.prompt
        ? history.slice(0, -1)
        : history;
    const recentHistory = [];
    let historyCharacters = 0;
    const maxHistoryCharacters = 3500;

    for (const msg of previousMessages.slice(-8).reverse()) {
        const remainingCharacters = maxHistoryCharacters - historyCharacters;
        if (remainingCharacters <= 0) break;

        const content = String(msg.content ?? "");
        const boundedContent = content.slice(-Math.min(1200, remainingCharacters));
        recentHistory.unshift({ ...msg, content: boundedContent });
        historyCharacters += boundedContent.length;
    }

    recentHistory.forEach((msg) => {
        if(msg.role==="user")
            messages.push(new HumanMessage(msg.content))
        else
            messages.push(new AIMessage(msg.content))
    })
    messages.push(new HumanMessage(state.prompt))
    const res = await llm.invoke(messages, { signal: config?.signal });
    return {
        ...state, 
        aiResponse: res.content
    }
}
