import axios from "axios";

const HORDE_API = "https://aihorde.net/api/v2";
const ANONYMOUS_API_KEY = "0000000000";
const POLL_INTERVAL_MS = 3_000;
const MAX_WAIT_MS = 100_000;

const hordeHeaders = {
    apikey: ANONYMOUS_API_KEY,
    "Client-Agent": "CortexAI:1.0:open-source",
    "Content-Type": "application/json",
};

const wait = (ms, signal) => new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason ?? new Error("Request stopped"));
    const cleanup = () => signal?.removeEventListener("abort", onAbort);
    const timer = setTimeout(() => {
        cleanup();
        resolve();
    }, ms);
    const onAbort = () => {
        clearTimeout(timer);
        cleanup();
        reject(signal.reason ?? new Error("Request stopped"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
});

const getGeneratedImage = async (jobId, signal) => {
    const startedAt = Date.now();
    while (Date.now() - startedAt < MAX_WAIT_MS) {
        await wait(POLL_INTERVAL_MS, signal);
        const { data: progress } = await axios.get(`${HORDE_API}/generate/check/${jobId}`, {
            headers: hordeHeaders,
            signal,
            timeout: 15_000,
        });

        if (progress.faulted) throw new Error("The free image service could not process this prompt. Please try again.");
        if (!progress.done) continue;

        const { data: result } = await axios.get(`${HORDE_API}/generate/status/${jobId}`, {
            headers: hordeHeaders,
            signal,
            timeout: 20_000,
        });
        const imageUrl = result.generations?.[0]?.img;
        if (!imageUrl) throw new Error("The free image service finished without returning an image.");
        if (imageUrl.startsWith("data:")) {
            const [, mimeType = "image/png", encoded = ""] = imageUrl.match(/^data:([^;,]+);base64,(.*)$/s) ?? [];
            if (!encoded) throw new Error("The free image service returned an invalid image.");
            return { data: encoded, mimeType };
        }

        const imageResponse = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            signal,
            timeout: 20_000,
        });
        return {
            data: Buffer.from(imageResponse.data).toString("base64"),
            mimeType: imageResponse.headers["content-type"]?.split(";")[0] || "image/png",
        };
    }

    throw new Error("The free image queue is busy and took too long. Please try again later.");
};

export const visionAgent = async (state, config) => {
    const prompt = String(state.prompt ?? "").trim();
    if (!prompt) throw new Error("Describe the image you want me to create.");

    const { data: job } = await axios.post(
        `${HORDE_API}/generate/async`,
        {
            prompt,
            models: ["stable_diffusion"],
            params: { width: 512, height: 512, steps: 20, n: 1 },
        },
        {
            headers: hordeHeaders,
            signal: config?.signal,
            timeout: 20_000,
        },
    );

    if (!job?.id) throw new Error("The free image service did not accept this request. Please try again.");
    const generatedImage = await getGeneratedImage(job.id, config?.signal);

    const mimeType = generatedImage.mimeType || "image/png";
    const extension = mimeType.split("/")[1]?.replace("jpeg", "jpg") || "png";
    const safeName = prompt
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 48) || "cortexai-image";

    return {
        ...state,
        aiResponse: "Here’s the image I created from your prompt.",
        images: [{
            data: generatedImage.data,
            mimeType,
            title: prompt,
            alt: prompt,
            fileName: `${safeName}.${extension}`,
        }],
    };
};
