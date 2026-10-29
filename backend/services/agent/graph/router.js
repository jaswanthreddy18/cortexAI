import { getModel } from "../config/llmModels.js"

export const router = async (state, config) => {
    const agentNames = {
        chat: "chat",
        coding: "coding",
        pdf: "pdf",
        presentation: "ppt",
        ppt: "ppt",
        search: "search",
        vision: "vision",
    };
    const selectedAgent = agentNames[String(state.agent ?? "").toLowerCase()];
    if (selectedAgent && selectedAgent !== "auto") {
        return {
            ...state,
            agent: selectedAgent
        }
    }
    const llm = await getModel("router");
    const prompt = `You are an agent router.

Available agents:

- chat
- search
- coding
- pdf
- ppt
- vision

Rules:

chat:
General conversation,
explanations,
learning,
questions.

search:
Current events,
latest information,
news,
recent developments,
internet lookup.

coding:
Generate code,
debug code,
build projects,
architecture,
API design.

pdf:
Create or explain PDFs, summarize documents,
or answer questions about supplied PDF text.

ppt:
Create PowerPoint slide decks,
or help with supplied presentation content.

vision:
Generate image,
create image

Return ONLY one word:

chat
search
coding
pdf
ppt
vision

User Query:
${state.prompt}
`
const res = await llm.invoke(prompt, { signal: config?.signal });
return {
    ...state,
    agent: res.content.trim().toLowerCase()
}

}
