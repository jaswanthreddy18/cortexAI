import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmModels.js";
import { createPptxBuffer } from "../utils/pptxDocument.js";

const PRESENTATION_SYSTEM_PROMPT = `You are CortexAI Presentation, a presentation designer.

Create a clear, useful slide deck for the user's audience and purpose. Return only valid JSON, with no Markdown fences or commentary, in this exact shape:
{"title":"Presentation title","slides":[{"title":"Slide heading","bullets":["Short point","Short point"]}]}

Create 7 slides: a title slide, five content slides, and a conclusion slide. Keep each slide focused on one idea and use 2 to 4 concise bullets per slide. Make the bullets readable on a widescreen slide. Use plain language and a logical story. Do not invent statistics, citations, or sources. If the user asks for citations, include only sources you are confident are real and identify uncertainty instead of fabricating details.`;

const parsePresentation = (content) => {
    const text = typeof content === "string"
        ? content
        : Array.isArray(content)
            ? content.map((part) => part.text ?? "").join("")
            : String(content ?? "");
    const jsonText = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const start = jsonText.indexOf("{");
    const end = jsonText.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("The presentation model did not return valid slide data");

    const parsed = JSON.parse(jsonText.slice(start, end + 1));
    const slides = Array.isArray(parsed.slides)
        ? parsed.slides.slice(0, 12).map((slide) => ({
            title: String(slide.title ?? "").trim(),
            bullets: Array.isArray(slide.bullets)
                ? slide.bullets.map((bullet) => String(bullet).trim()).filter(Boolean).slice(0, 6)
                : [],
        })).filter((slide) => slide.title)
        : [];

    if (!slides.length) throw new Error("The presentation model returned no slides");
    return {
        title: String(parsed.title ?? slides[0].title).trim(),
        slides,
    };
};

const makeFileName = (title) => {
    const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .split("-")
        .slice(0, 8)
        .join("-");
    return `${slug || "cortexai-presentation"}.pptx`;
};

export const pptAgent = async (state, config) => {
    const model = await getModel("ppt");
    const result = await model.invoke([
        new SystemMessage(PRESENTATION_SYSTEM_PROMPT),
        new HumanMessage(state.prompt),
    ], { signal: config?.signal });

    const presentation = parsePresentation(result.content);
    const fileName = makeFileName(presentation.title);
    const pptxBuffer = createPptxBuffer(presentation.slides);

    return {
        ...state,
        aiResponse: `I created **${fileName}** with ${presentation.slides.length} slides. Download the presentation below.`,
        pptAttachment: {
            fileName,
            mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            data: pptxBuffer.toString("base64"),
        },
    };
};
