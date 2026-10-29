import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  FileText,
  Check,
  Copy,
  Download,
  Image as ImageIcon,
  Presentation,
  X,
} from 'lucide-react';

const KEYWORDS = {
  java: 'abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while var record sealed permits true false null',
  javascript: 'async await break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield true false null undefined',
  typescript: 'abstract any as asserts async await boolean break case catch class const constructor continue declare default do else enum export extends finally for from function get if implements import in infer instanceof interface is keyof let module namespace never new number object package private protected public readonly require return set static string super switch symbol this throw try type typeof undefined unique unknown var void while yield true false null',
  python: 'and as assert async await break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return True try while with yield',
  c: 'auto break case char const continue default do double else enum extern float for goto if inline int long register restrict return short signed sizeof static struct switch typedef union unsigned void volatile while',
  cpp: 'alignas alignof asm auto bool break case catch char class const constexpr continue decltype default delete do double else enum explicit export extern false float for friend goto if inline int long namespace new noexcept nullptr operator private protected public register return short signed sizeof static struct switch template this thread_local throw true try typedef typename union unsigned using virtual void volatile while',
  json: 'true false null',
  bash: 'case do done elif else esac fi for function if in select then time until while',
};

const highlightCode = (code, language = '') => {
  const aliases = { js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', py: 'python', 'c++': 'cpp', sh: 'bash', shell: 'bash' };
  const normalizedLanguage = aliases[language.toLowerCase()] ?? language.toLowerCase();
  const keywords = KEYWORDS[normalizedLanguage] ?? `${KEYWORDS.javascript} ${KEYWORDS.java}`;
  const escapedKeywords = keywords.split(/\s+/).map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const tokenPattern = new RegExp(
    `\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*|#[^\\n]*|"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|\\x60(?:\\\\.|[^\\x60\\\\])*\\x60|\\b\\d+(?:\\.\\d+)?\\b|\\b(?:${escapedKeywords})\\b|\\b[A-Z][A-Za-z0-9_]*\\b|\\b[A-Za-z_$][\\w$]*(?=\\s*\\()|\\{|\\}|\\(|\\)|\\[|\\]|\\.|,|;|:|\\+|-|\\*|/|%|=|<|>|!|&|\\||\\?|~|\\^`,
    'g'
  );

  const tokens = [];
  let lastIndex = 0;
  for (const match of code.matchAll(tokenPattern)) {
    if (match.index > lastIndex) tokens.push({ text: code.slice(lastIndex, match.index), type: 'plain' });
    const text = match[0];
    let type = 'operator';
    if (/^(\/\/|\/\*|#)/.test(text)) type = 'comment';
    else if (/^["'`]/.test(text)) type = 'string';
    else if (/^\d/.test(text)) type = 'number';
    else if (new RegExp(`^(?:${escapedKeywords})$`).test(text)) type = 'keyword';
    else if (/^[A-Z]/.test(text)) type = 'type';
    else if (/^[A-Za-z_$]/.test(text)) type = 'function';
    tokens.push({ text, type });
    lastIndex = match.index + text.length;
  }
  if (lastIndex < code.length) tokens.push({ text: code.slice(lastIndex), type: 'plain' });

  const colors = {
    comment: 'text-[#8b889b] italic',
    string: 'text-emerald-700',
    number: 'text-violet-600',
    keyword: 'text-[#8178f5]',
    type: 'text-[#655be8]',
    function: 'text-sky-700',
    operator: 'text-pink-700',
    plain: 'text-[#28253c]',
  };

  return tokens.map((token, index) => (
    <span key={index} className={colors[token.type]}>{token.text}</span>
  ));
};

const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error('Could not copy code:', error);
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-[#e9e7f2]/10 bg-[#f4f3f9] shadow-[0_14px_40px_rgba(0,0,0,0.25)]">
      <div className="flex h-10 items-center justify-between border-b border-[#e9e7f2]/[0.08] bg-[#f6f5fb] px-3.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-[#77748a]">
          {language || 'Code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Code copied' : 'Copy code'}
          title={copied ? 'Copied' : 'Copy code'}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-[#56536b] transition hover:bg-violet-500/[0.08] hover:text-[#28253c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#655be8]"
        >
          {copied ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[12px] leading-5">
        <code className="font-mono">{highlightCode(code, language)}</code>
      </pre>
    </div>
  );
};

const splitTableRow = (line) => {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((cell) => cell.trim());
};

const renderInlineMarkdown = (text) => {
  const parts = text.split(/(\[[^\]]+\]\(https?:\/\/[^)\s]+\)|<https?:\/\/[^>\s]+>|https?:\/\/[^\s<>()]+|\*\*.+?\*\*|__.+?__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g);
  return parts.map((part, index) => {
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className="rounded bg-violet-500/[0.08] px-1.5 py-0.5 font-mono text-[0.9em] text-[#655be8]">{part.slice(1, -1)}</code>;
    }
    const markdownLink = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    if (markdownLink) {
      return (
        <a key={index} href={markdownLink[2]} target="_blank" rel="noopener noreferrer" className="break-all text-violet-600 underline decoration-violet-400/40 underline-offset-2 hover:text-violet-600">
          {markdownLink[1]}
        </a>
      );
    }
    const autoLink = part.match(/^<((?:https?):\/\/[^>\s]+)>$/);
    if (autoLink) {
      return (
        <a key={index} href={autoLink[1]} target="_blank" rel="noopener noreferrer" className="break-all text-violet-600 underline decoration-violet-400/40 underline-offset-2 hover:text-violet-600">
          {autoLink[1]}
        </a>
      );
    }
    if (/^https?:\/\//i.test(part)) {
      const trailingPunctuation = part.match(/[.,!?;:]+$/)?.[0] ?? '';
      const href = trailingPunctuation ? part.slice(0, -trailingPunctuation.length) : part;
      return (
        <span key={index}>
          <a href={href} target="_blank" rel="noopener noreferrer" className="break-all text-violet-600 underline decoration-violet-400/40 underline-offset-2 hover:text-violet-600">
            {href}
          </a>
          {trailingPunctuation}
        </span>
      );
    }
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

const getImageSource = (image) => {
  if (typeof image === 'string') return image;
  if (!image || typeof image !== 'object') return null;

  const source = image.url ?? image.src ?? image.data ?? image.base64;
  if (typeof source !== 'string' || !source) return null;
  if (/^(https?:|data:|blob:)/i.test(source)) return source;

  return `data:${image.mimeType ?? 'image/jpeg'};base64,${source}`;
};

const MessageImageGrid = ({ images, onOpenImage }) => {
  const [visibleImages, setVisibleImages] = useState(images);

  if (!visibleImages.length) return null;

  const hideImage = (failedImage) => {
    setVisibleImages((currentImages) => currentImages.filter((image) => image.src !== failedImage.src));
  };

  return (
    <div className="mt-3 grid max-w-full grid-cols-1 gap-2 sm:grid-cols-2">
      {visibleImages.map(({ image, src }, imageIndex) => {
        const alt = typeof image === 'object' && (image.alt || image.title)
          ? image.alt ?? image.title
          : `Message attachment ${imageIndex + 1}`;

        return (
          <button
            key={src}
            type="button"
            onClick={() => onOpenImage({ src, alt, fileName: image?.fileName || `cortexai-image-${imageIndex + 1}.png` })}
            aria-label={`Expand image ${imageIndex + 1}`}
            className="cursor-pointer rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#655be8]"
          >
            <img
              src={src}
              alt={alt}
              loading="lazy"
              onError={() => hideImage({ src })}
              className="max-h-80 max-w-full rounded-lg border border-[#e9e7f2]/10 object-contain"
            />
          </button>
        );
      })}
    </div>
  );
};

const isTableSeparator = (line) => {
  const cells = splitTableRow(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
};

const renderMarkdownTable = (lines, key) => {
  const headers = splitTableRow(lines[0]);
  const rows = lines.slice(2).map(splitTableRow);

  return (
    <div key={key} className="my-3 max-w-full overflow-x-auto rounded-xl border border-[#e9e7f2]/10 bg-[#f6f5fb] px-3 sm:px-4">
      <table className="w-full min-w-[420px] border-collapse text-left text-[13px] leading-6">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="border-b border-[#e7e4f1] px-3 py-2.5 font-semibold text-[#28253c]">
                {renderInlineMarkdown(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-[#e9e7f2] last:border-b-0">
              {headers.map((_, cellIndex) => (
                <td key={cellIndex} className="px-3 py-2.5 align-top text-[#28253c]">
                  {renderInlineMarkdown(row[cellIndex] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const MarkdownResponse = ({ content }) => {
  const readableContent = content.replace(/\bTL;DR\b/gi, 'In short');
  const lines = readableContent.split('\n');
  const blocks = [];
  let textLines = [];

  const flushText = () => {
    const text = textLines.join('\n').trim();
    if (text) {
      blocks.push(
        <p key={`text-${blocks.length}`} className="my-0 whitespace-pre-wrap">
          {renderInlineMarkdown(text)}
        </p>
      );
      textLines = [];
    }
  };

  for (let index = 0; index < lines.length; index += 1) {
    if (index + 1 < lines.length && lines[index].includes('|') && isTableSeparator(lines[index + 1])) {
      flushText();
      const tableLines = [lines[index]];
      index += 2;
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        tableLines.push(lines[index]);
        index += 1;
      }
      index -= 1;
      blocks.push(renderMarkdownTable(tableLines, `table-${blocks.length}`));
    } else if (/^\s*```/.test(lines[index])) {
      flushText();
      const language = lines[index].trim().replace(/^```/, '').trim().split(/\s+/)[0] ?? '';
      const codeLines = [];
      index += 1;
      while (index < lines.length && !/^\s*```/.test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }
      blocks.push(<CodeBlock key={`code-${blocks.length}`} code={codeLines.join('\n')} language={language} />);
    } else if (/^#{1,6}\s/.test(lines[index])) {
      flushText();
      const match = lines[index].match(/^(#{1,6})\s+(.*)$/);
      const level = match[1].length;
      const Heading = `h${level}`;
      const headingSize = level <= 2 ? 'text-lg font-semibold' : 'text-base font-semibold';
      blocks.push(
        <Heading key={`heading-${blocks.length}`} className={`mb-0 mt-1 leading-tight ${headingSize} text-[#28253c]`}>
          {renderInlineMarkdown(match[2])}
        </Heading>
      );
    } else if (/^\s*>/.test(lines[index])) {
      flushText();
      const quoteLines = [];
      while (index < lines.length && /^\s*>/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^\s*>\s?/, ''));
        index += 1;
      }
      index -= 1;
      const quoteText = quoteLines.filter((line) => line.trim()).join('\n');
      if (quoteText) {
        blocks.push(
          <blockquote key={`quote-${blocks.length}`} className="my-1 border-l-2 border-[#655be8]/70 pl-3 text-[#56536b]">
            {renderInlineMarkdown(quoteText)}
          </blockquote>
        );
      }
    } else if (/^\s*[-*+]\s+/.test(lines[index])) {
      flushText();
      const items = [];
      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*+]\s+/, ''));
        index += 1;
      }
      index -= 1;
      blocks.push(
        <ul key={`list-${blocks.length}`} className="my-2 list-disc space-y-1 pl-5">
          {items.map((item, itemIndex) => <li key={itemIndex}>{renderInlineMarkdown(item)}</li>)}
        </ul>
      );
    } else if (/^\s*\d+[.)]\s+/.test(lines[index])) {
      flushText();
      const items = [];
      while (index < lines.length && /^\s*\d+[.)]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+[.)]\s+/, ''));
        index += 1;
      }
      index -= 1;
      blocks.push(
        <ol key={`ordered-list-${blocks.length}`} className="my-2 list-decimal space-y-1 pl-5">
          {items.map((item, itemIndex) => <li key={itemIndex}>{renderInlineMarkdown(item)}</li>)}
        </ol>
      );
    } else if (/^\s*(---|\*\*\*|___)\s*$/.test(lines[index])) {
      flushText();
      blocks.push(<hr key={`rule-${blocks.length}`} className="my-3 border-[#e9e7f2]" />);
    } else {
      textLines.push(lines[index]);
    }
  }

  flushText();
  return <>{blocks}</>;
};

const AnimatedResponse = ({ content, animate }) => {
  const [visibleLength, setVisibleLength] = useState(
    animate ? 0 : content.length
  );

  useEffect(() => {
    if (!animate) {
      setVisibleLength(content.length);
      return undefined;
    }

    setVisibleLength(0);
    const step = Math.max(1, Math.ceil(content.length / 120));
    const interval = window.setInterval(() => {
      setVisibleLength((length) => {
        const nextLength = Math.min(length + step, content.length);
        if (nextLength >= content.length) window.clearInterval(interval);
        return nextLength;
      });
    }, 18);

    return () => window.clearInterval(interval);
  }, [content, animate]);

  return (
    <>
      <MarkdownResponse content={content.slice(0, visibleLength)} />
      {animate && visibleLength < content.length && (
        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[#655be8] align-middle" />
      )}
    </>
  );
};

const MessageList = () => {
  const messagesEndRef = useRef(null);
  const [expandedImage, setExpandedImage] = useState(null);

  const selectedConversation = useSelector(
    (state) => state.conversation.selectedConversation
  );
  const rawMessages = useSelector((state) => state.message?.messages);
  const isSending = useSelector((state) => state.message?.isSending);
  const userData = useSelector((state) => state.user?.userData);
  const user = userData?.user ?? userData;
  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Normalize and ensure chronological order
  const messages = useMemo(() => {
    if (!Array.isArray(rawMessages)) return [];
    if (
      rawMessages.length > 1 &&
      rawMessages[0]?.createdAt &&
      rawMessages[rawMessages.length - 1]?.createdAt
    ) {
      return [...rawMessages].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    }
    return rawMessages;
  }, [rawMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [messages]);

  useEffect(() => {
    if (!expandedImage) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setExpandedImage(null);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [expandedImage]);

  const isBlankState =
    !selectedConversation ||
    !selectedConversation?._id ||
    messages.length === 0;

  if (isBlankState) {
    return (
      <div className="flex flex-none flex-col items-center justify-center p-6 text-center select-none">
        <div aria-hidden="true" className="mb-6 h-[68px] w-[68px] rounded-full border border-white/80 bg-[radial-gradient(circle_at_32%_28%,#fff_0%,#e7e3ff_32%,#aaa2f4_65%,#c4e7fb_100%)] shadow-[0_10px_35px_rgba(129,117,237,0.28)]" />
        <div className="mb-2 flex flex-col items-center gap-1">
          <h2 className="text-2xl font-semibold tracking-tight text-[#28253c] sm:text-3xl">
            {greeting}, {firstName}
          </h2>
          <p className="text-2xl font-semibold tracking-tight text-[#28253c] sm:text-3xl">
            How can I <span className="bg-gradient-to-r from-[#665ce8] to-[#9a91f5] bg-clip-text text-transparent">assist you today?</span>
          </p>
        </div>
        <p className="max-w-md text-sm text-[#77748a]">
          Ask CortexAI anything, or choose an agent to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-8 px-4 py-8 sm:px-8">
      {messages.map((msg, index) => {
        const isUser = msg.role === 'user' || msg.type === 'user';
        const images = (Array.isArray(msg.images) ? msg.images : msg.images ? [msg.images] : [])
          .map((image) => ({ image, src: getImageSource(image) }))
          .filter(({ src }) => src);
        const pdfAttachment = msg.pdfAttachment;
        const pptAttachment = msg.pptAttachment;
        const formattedTime = msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : null;

        return (
          <div
            key={msg._id || index}
            className={`mx-auto flex w-full max-w-[960px] gap-3 ${
              isUser ? 'justify-end items-end' : 'justify-start items-start'
            }`}
          >
            {/* Message Bubble + Meta */}
            <div
              className={`flex w-full max-w-[90%] flex-col sm:max-w-[82%] ${
                isUser ? 'items-end' : 'items-start'
              }`}
            >
              {/* Message Content */}
              <div
                className={`px-4 py-3 text-[15px] leading-7 whitespace-pre-wrap break-words ${
                  isUser
                    ? 'rounded-2xl border border-[#554bd0] bg-[#635be0] text-white shadow-[0_6px_22px_rgba(99,91,224,0.2)]'
                    : 'w-full px-0 text-[#28253c]'
                }`}
              >
                <AnimatedResponse
                  content={msg.content ?? ''}
                  animate={msg._id?.startsWith('local-assistant-')}
                />
                {pdfAttachment?.data && (
                  <a
                    href={`data:${pdfAttachment.mimeType || 'application/pdf'};base64,${pdfAttachment.data}`}
                    download={pdfAttachment.fileName || 'cortexai-document.pdf'}
                    className="mt-3 flex min-w-56 max-w-full items-center gap-3 rounded-xl border border-[#e9e7f2]/10 bg-[#ffffff] px-3 py-2.5 text-left transition hover:border-[#e9e7f2]/25 hover:bg-[#f1eff9]"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-500/[0.07] text-[#655be8]">
                      <FileText size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[#28253c]">
                        {pdfAttachment.fileName || 'Download PDF'}
                      </span>
                      <span className="block text-xs text-[#77748a]">PDF document</span>
                    </span>
                    <Download size={16} className="shrink-0 text-[#77748a]" />
                  </a>
                )}
                {pptAttachment?.data && (
                  <a
                    href={`data:${pptAttachment.mimeType || 'application/vnd.openxmlformats-officedocument.presentationml.presentation'};base64,${pptAttachment.data}`}
                    download={pptAttachment.fileName || 'cortexai-presentation.pptx'}
                    className="mt-3 flex min-w-56 max-w-full items-center gap-3 rounded-xl border border-[#e9e7f2]/10 bg-[#ffffff] px-3 py-2.5 text-left transition hover:border-[#e9e7f2]/25 hover:bg-[#f1eff9]"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-500/[0.07] text-[#655be8]">
                      <Presentation size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[#28253c]">
                        {pptAttachment.fileName || 'Download presentation'}
                      </span>
                      <span className="block text-xs text-[#77748a]">PowerPoint presentation</span>
                    </span>
                    <Download size={16} className="shrink-0 text-[#77748a]" />
                  </a>
                )}
                {images.length > 0 && (
                  <>
                    <MessageImageGrid images={images} onOpenImage={setExpandedImage} />
                    <div className="mt-2 flex flex-col gap-2">
                      {images.map(({ image, src }, imageIndex) => {
                        const fileName = typeof image === 'object' && image.fileName
                          ? image.fileName
                          : `cortexai-image-${imageIndex + 1}.png`;
                        return (
                          <a
                            key={`image-file-${src}`}
                            href={src}
                            download={fileName}
                            className="flex min-w-56 max-w-full items-center gap-3 rounded-xl border border-[#e9e7f2]/10 bg-[#ffffff] px-3 py-2.5 transition hover:border-[#e9e7f2]/25 hover:bg-[#f1eff9]"
                          >
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-500/[0.07] text-[#655be8]">
                              <ImageIcon size={18} />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#28253c]">{fileName}</span>
                            <Download size={16} className="shrink-0 text-[#77748a]" />
                          </a>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Timestamp */}
              {formattedTime && (
                <span className="text-[10px] text-[#8b889b] mt-1 px-1">
                  {formattedTime}
                </span>
              )}
            </div>

          </div>
        );
      })}
      {isSending && (
        <div className="mx-auto flex w-full max-w-[960px] items-start" role="status" aria-label="CortexAI is responding">
          <div className="flex items-center gap-1.5 px-1 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#655be8] [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#655be8] [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#655be8]" />
            </div>
        </div>
      )}
      <div ref={messagesEndRef} />
      {expandedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f7f8fc]/90 p-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setExpandedImage(null)}
        >
          <div className="fixed right-5 top-5 flex gap-2">
            <a
              href={expandedImage.src}
              download={expandedImage.fileName}
              aria-label="Download image"
              title="Download image"
              onClick={(event) => event.stopPropagation()}
              className="grid h-10 w-10 place-items-center rounded-full border border-[#e9e7f2]/15 bg-[#f4f3f9]/80 text-[#28253c] transition hover:bg-[#f1eff9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#655be8]"
            >
              <Download size={19} />
            </a>
            <button
              type="button"
              onClick={() => setExpandedImage(null)}
              aria-label="Close image preview"
              title="Close"
              className="grid h-10 w-10 place-items-center rounded-full border border-[#e9e7f2]/15 bg-[#f4f3f9]/80 text-[#28253c] transition hover:bg-[#f1eff9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#655be8]"
            >
              <X size={20} />
            </button>
          </div>
          <img
            src={expandedImage.src}
            alt={expandedImage.alt}
            className="max-h-[80vh] max-w-[80vw] rounded-2xl border border-[#e9e7f2]/15 object-contain shadow-2xl shadow-black/50"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default MessageList;
