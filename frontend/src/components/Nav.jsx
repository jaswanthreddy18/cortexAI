import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, Moon, MoreHorizontal, Share2, Sun, Trash2 } from "lucide-react";
import CortexLogo from "./CortexLogo";
import { deleteConversation } from "../features/deleteConversation";
import { removeConversation, setSelectedConversation } from "../redux/conversationSlice";
import { setMessages } from "../redux/messageSlice";

const Nav = () => {
    const [shareStatus, setShareStatus] = useState("");
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const dark = localStorage.getItem("cortex-theme") === "dark";
        document.documentElement.dataset.theme = dark ? "dark" : "light";
        return dark;
    });
    const optionsRef = useRef(null);
    const dispatch = useDispatch();
    const selectedConversation = useSelector(
        (state) => state.conversation.selectedConversation
    );
    const messages = useSelector((state) => state.message?.messages) ?? [];
    const messageCount = messages.length;

    const title = selectedConversation?.title || "New conversation";

    const toggleTheme = () => {
        const nextIsDark = !isDarkMode;
        setIsDarkMode(nextIsDark);
        localStorage.setItem("cortex-theme", nextIsDark ? "dark" : "light");
        document.documentElement.dataset.theme = nextIsDark ? "dark" : "light";
    };

    useEffect(() => {
        const closeOnOutsideClick = (event) => {
            if (!optionsRef.current?.contains(event.target)) setIsOptionsOpen(false);
        };
        const closeOnEscape = (event) => {
            if (event.key === "Escape") {
                setIsOptionsOpen(false);
                setShowDeleteConfirm(false);
            }
        };
        document.addEventListener("mousedown", closeOnOutsideClick);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("mousedown", closeOnOutsideClick);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, []);

    if (!selectedConversation || !selectedConversation?._id) return null;

    const handleShare = async () => {
        setIsOptionsOpen(false);
        const transcript = messages
            .map((message) => {
                const speaker = message.role === "user" ? "You" : "CortexAI";
                const content = String(message.content ?? "").trim();
                const attachments = [
                    ...(message.images ?? []).map((image) => typeof image === "string" ? image : image?.url).filter(Boolean),
                    message.pdfAttachment?.url,
                    message.pptAttachment?.url,
                ].filter(Boolean);
                return `${speaker}: ${content}${attachments.length ? `\n${attachments.join("\n")}` : ""}`;
            })
            .filter(Boolean)
            .join("\n\n");
        const text = `${title}\n\n${transcript || "No messages in this conversation yet."}`;

        try {
            if (navigator.share) {
                await navigator.share({ title: `${title} — CortexAI`, text });
                setShareStatus("Shared");
            } else {
                await navigator.clipboard.writeText(text);
                setShareStatus("Conversation copied");
            }
        } catch (error) {
            if (error.name === "AbortError") return;
            try {
                await navigator.clipboard.writeText(text);
                setShareStatus("Conversation copied");
            } catch {
                setShareStatus("Could not share conversation");
            }
        }
        window.setTimeout(() => setShareStatus(""), 2500);
    };

    const handleDelete = async () => {
        const result = await deleteConversation(selectedConversation._id);
        setShowDeleteConfirm(false);
        if (!result) {
            setShareStatus("Could not delete conversation");
            window.setTimeout(() => setShareStatus(""), 2500);
            return;
        }

        dispatch(removeConversation(selectedConversation._id));
        dispatch(setSelectedConversation(null));
        dispatch(setMessages([]));
    };

    return (
        <>
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#eceaf3] bg-white/85 px-5 backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-3">
                <CortexLogo size={34} className="shrink-0" />

                <div className="flex min-w-0 items-center gap-2">
                    <h1
                        className="truncate text-sm font-semibold text-[#28253c] max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg"
                        title={title}
                    >
                        {title}
                    </h1>
                    <span className="shrink-0 rounded-full border border-[#e9e7f2]/[0.10] bg-violet-500/[0.05] px-2 py-0.5 text-xs font-medium text-[#79768d]">
                        {messageCount} {messageCount === 1 ? "message" : "messages"}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                {shareStatus && <span role="status" className="text-xs text-[#77748a]">{shareStatus}</span>}
                <div className="relative" ref={optionsRef}>
                    <button
                        type="button"
                        title="Options"
                        aria-label="Conversation options"
                        aria-expanded={isOptionsOpen}
                        aria-haspopup="menu"
                        onClick={() => setIsOptionsOpen((open) => !open)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-[#77748a] transition-colors hover:bg-slate-100 hover:text-[#37344d]"
                    >
                        <MoreHorizontal size={16} />
                    </button>
                    {isOptionsOpen && (
                        <div role="menu" className="absolute right-0 top-10 z-30 w-48 rounded-xl border border-[#e9e6f3] bg-white p-1.5 shadow-xl shadow-slate-900/10">
                            <button
                                type="button"
                                role="menuitem"
                                onClick={toggleTheme}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-[#37344d] hover:bg-[#f5f3ff]"
                            >
                                {isDarkMode ? <Sun size={15} className="text-[#7770c3]" /> : <Moon size={15} className="text-[#7770c3]" />}
                                {isDarkMode ? "Day mode" : "Night mode"}
                            </button>
                            <div className="my-1 border-t border-[#efedf5]" />
                            <button
                                type="button"
                                role="menuitem"
                                onClick={handleShare}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-[#37344d] hover:bg-[#f5f3ff]"
                            >
                                {shareStatus ? <Check size={15} className="text-emerald-600" /> : <Share2 size={15} className="text-[#7770c3]" />}
                                Share conversation
                            </button>
                            <div className="my-1 border-t border-[#efedf5]" />
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    setIsOptionsOpen(false);
                                    setShowDeleteConfirm(true);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
                            >
                                <Trash2 size={15} /> Delete conversation
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
        {showDeleteConfirm && (
            <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-[2px]"
                onMouseDown={(event) => {
                    if (event.target === event.currentTarget) setShowDeleteConfirm(false);
                }}
            >
                <section
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-conversation-title"
                    className="w-full max-w-md rounded-2xl border border-[#e9e6f3] bg-white p-6 shadow-2xl shadow-slate-900/20"
                >
                    <div className="flex items-start gap-4">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600">
                            <Trash2 size={19} />
                        </span>
                        <div>
                            <h2 id="delete-conversation-title" className="text-base font-semibold text-[#28253c]">Delete conversation?</h2>
                            <p className="mt-2 text-sm leading-6 text-[#77748a]">
                                “{title}” and all its messages will be permanently deleted. This can’t be undone.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="rounded-xl border border-[#e5e2ee] px-4 py-2.5 text-sm font-medium text-[#55516e] transition hover:bg-[#f7f6fb]"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
                        >
                            Delete conversation
                        </button>
                    </div>
                </section>
            </div>
        )}
        </>
    );
};

export default Nav;
