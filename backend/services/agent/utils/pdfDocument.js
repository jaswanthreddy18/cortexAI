const normalizeForPdf = (value) => String(value ?? "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[•●]/g, "*")
    .replace(/₂/g, "2")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, "");

const escapePdfText = (value) => normalizeForPdf(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const wrapLine = (text, maxCharacters) => {
    const words = text.split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";

    for (const word of words) {
        if (line && `${line} ${word}`.length > maxCharacters) {
            lines.push(line);
            line = word;
        } else {
            line = line ? `${line} ${word}` : word;
        }
    }

    if (line) lines.push(line);
    return lines.length ? lines : [""];
};

const markdownToPdfLines = (markdown) => {
    const output = [];

    for (const rawLine of String(markdown ?? "").replace(/\r/g, "").split("\n")) {
        let text = rawLine.trim();
        if (!text) {
            output.push({ text: "", size: 5, bold: false, gap: true });
            continue;
        }

        let size = 10;
        let bold = false;
        const heading = text.match(/^(#{1,3})\s+(.*)$/);
        if (heading) {
            size = heading[1].length === 1 ? 18 : heading[1].length === 2 ? 14 : 12;
            bold = true;
            text = heading[2];
        } else if (/^[-*]\s+/.test(text)) {
            text = `*  ${text.replace(/^[-*]\s+/, "")}`;
        }

        text = text
            .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, "$1")
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/__(.*?)__/g, "$1")
            .replace(/`([^`]+)`/g, "$1")
            .replace(/[*_]/g, "");

        const maxCharacters = size >= 18 ? 54 : size >= 14 ? 72 : 94;
        for (const wrapped of wrapLine(normalizeForPdf(text), maxCharacters)) {
            output.push({ text: wrapped, size, bold, gap: false });
        }
    }

    return output;
};

const makePageContent = (lines, pageNumber, totalPages) => {
    let y = 738;
    const commands = [];

    for (const line of lines) {
        if (line.gap) {
            y -= 7;
            continue;
        }
        const font = line.bold ? "F2" : "F1";
        commands.push(`BT /${font} ${line.size} Tf 1 0 0 1 54 ${y} Tm (${escapePdfText(line.text)}) Tj ET`);
        y -= line.size >= 18 ? 27 : line.size >= 14 ? 22 : 15;
    }

    commands.push(`BT /F1 8 Tf 1 0 0 1 54 30 Tm (Page ${pageNumber} of ${totalPages}) Tj ET`);
    return commands.join("\n");
};

export const createPdfBuffer = (markdown) => {
    const allLines = markdownToPdfLines(markdown);
    const pages = [];
    let currentPage = [];
    let remainingHeight = 650;

    for (const line of allLines) {
        const lineHeight = line.gap ? 7 : line.size >= 18 ? 27 : line.size >= 14 ? 22 : 15;
        if (currentPage.length && remainingHeight < lineHeight) {
            pages.push(currentPage);
            currentPage = [];
            remainingHeight = 650;
        }
        currentPage.push(line);
        remainingHeight -= lineHeight;
    }
    if (currentPage.length || pages.length === 0) pages.push(currentPage);

    const objects = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    ];
    const pageObjectIds = [];

    pages.forEach((pageLines, index) => {
        const pageId = objects.length + 1;
        const contentId = pageId + 1;
        pageObjectIds.push(pageId);
        const content = makePageContent(pageLines, index + 1, pages.length);
        objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`);
        objects.push(`<< /Length ${Buffer.byteLength(content, "ascii")} >>\nstream\n${content}\nendstream`);
    });

    objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;

    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((object, index) => {
        offsets.push(Buffer.byteLength(pdf, "ascii"));
        pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });

    const xrefOffset = Buffer.byteLength(pdf, "ascii");
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const offset of offsets.slice(1)) {
        pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return Buffer.from(pdf, "ascii");
};
