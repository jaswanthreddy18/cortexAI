import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../utils/axios";
import { createConversation } from "../features/createConversation";
import { getConversation } from "../features/getConversation";
import { addConversation, setConversations, setSelectedConversation } from "../redux/conversationSlice";
import { setUserData } from "../redux/userSlice";
import {
  Coins,
  MessageSquare,
  LogOut,
  PanelLeftIcon,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import CortexLogo from "./CortexLogo";

const navigation = [
  { label: "New chat", icon: Plus, active: true },
];

function SideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(270);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [conversationSearch, setConversationSearch] = useState("");
  const resizeStart = useRef({ x: 0, width: 270 });
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const conversations = useSelector((state) => state.conversation.conversations);
  const user = userData?.user ?? userData;
  const name = user?.name ?? "Your profile";
  const email = user?.email ?? "";
  const initial = name.charAt(0).toUpperCase();
  const recentConversations = Array.isArray(conversations)
    ? conversations.filter(Boolean)
    : [];
  const filteredConversations = recentConversations.filter((conversation) =>
    (conversation.title || "New chat").toLowerCase().includes(conversationSearch.trim().toLowerCase())
  );
  console.log(conversations);
  useEffect(() => {
    if (!user) {
      dispatch(setConversations([]));
      return;
    }

    const loadConversations = async () => {
      const data = await getConversation();
      const loadedConversations = data?.conversations ?? [];
      dispatch(setConversations(loadedConversations));
      setSelectedChatId(null);
      dispatch(setSelectedConversation(null));
    };

    loadConversations();
  }, [dispatch, user]);

  useEffect(() => {
    if (selectedChatId && !recentConversations.some((conversation) => conversation?._id === selectedChatId)) {
      setSelectedChatId(null);
    }
  }, [recentConversations, selectedChatId]);

  useEffect(() => {
    if (!isResizing) return undefined;

    const handleMouseMove = (event) => {
      const nextWidth = resizeStart.current.width + event.clientX - resizeStart.current.x;
      setSidebarWidth(Math.min(420, Math.max(200, nextWidth)));
    };

    const stopResizing = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  const handleSelectConversation = (conversation) => {
    setSelectedChatId(conversation._id);
    dispatch(setSelectedConversation(conversation));
  };

  const handleCreateConversation = async () => {
    if (!user || creating) return;

    setCreating(true);
    const data = await createConversation();

    if (data?.conversation) {
      dispatch(addConversation(data.conversation));
      setSelectedChatId(data.conversation._id);
    }

    setCreating(false);
  };

  const handleLogout = async () => {
    try {
      await api.get("/api/auth/logout");
      dispatch(setUserData(null));
      dispatch(setConversations([]));
      dispatch(setSelectedConversation(null));
      setShowLogoutConfirm(false);
    } catch (error) {
      console.error("Logout failed:", error.response?.data ?? error.message);
    }
  };

  const startSidebarResize = (event) => {
    event.preventDefault();
    resizeStart.current = { x: event.clientX, width: sidebarWidth };
    setIsResizing(true);
  };

  return (
    <>
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col
          bg-[#ffffff] text-[#37344d] border-r border-[#eceaf3] shadow-[8px_0_28px_rgba(74,62,140,0.04)]
          ${isResizing ? "transition-none select-none" : "transition-[width] duration-200 ease-out"}
          ${collapsed ? "w-[84px]" : ""}
        `}
        style={collapsed ? undefined : { width: sidebarWidth }}
      >
        <div className={`flex h-16 items-center border-b border-[#eceaf3] ${collapsed ? "justify-center gap-1 px-1" : "px-4"}`}>
          <div className={`flex min-w-0 items-center gap-2.5 overflow-hidden ${collapsed ? "flex-none" : "flex-1"}`}>
            <button
              type="button"
              onClick={() => collapsed && setCollapsed(false)}
              disabled={!collapsed}
              aria-label={collapsed ? "Expand sidebar" : undefined}
              className="relative shrink-0 disabled:cursor-default"
            >
              <CortexLogo size={38} />
            </button>
            {!collapsed && (
              <div className="min-w-0 leading-none">
                <span className="block truncate text-[15px] font-bold tracking-tight text-[#28253c]">
                  Cortex<span className="text-[#655be8]">AI</span>
                </span>
                <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.18em] text-[#8b889b]">
                  Intelligence
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[#8b889b] transition-colors hover:bg-slate-100 hover:text-[#28253c]"
          >
            <PanelLeftIcon size={17} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {navigation.map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              type="button"
              onClick={handleCreateConversation}
              disabled={!user || creating}
              title={collapsed ? label : undefined}
              className={`
              flex h-10 items-center gap-3 rounded-xl px-3 text-left text-sm transition-colors
              ${active
                  ? "bg-violet-50 font-medium text-[#28253c] ring-1 ring-inset ring-white/[0.08] hover:bg-[#eeebff] hover:text-[#635be0]"
                  : "text-[#77748a] hover:bg-slate-100 hover:text-[#28253c]"}
              ${collapsed ? "justify-center px-0" : ""}
              ${!user || creating ? "cursor-not-allowed opacity-40" : ""}
            `}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          ))}
        </nav>

        {!collapsed && <div className="flex-1 overflow-y-auto px-3 pb-3">
          <label className="relative mb-4 block">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9793a8]" />
            <input
              value={conversationSearch}
              onChange={(event) => setConversationSearch(event.target.value)}
              placeholder="Search conversations"
              aria-label="Search conversations"
              className="h-10 w-full rounded-xl border border-[#e9e7f2] bg-[#fbfaff] pl-9 pr-3 text-xs text-[#37344d] outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 placeholder:text-[#a09daf]"
            />
          </label>
          <p className="px-3 pb-2 pt-1 text-[11px] font-medium uppercase tracking-wider text-[#8b889b]">
            History
          </p>
          {filteredConversations.length > 0 ? (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => {
                const isSelected = selectedChatId === conversation._id;
                return (
                  <button
                    key={conversation._id}
                    type="button"
                    onClick={() => handleSelectConversation(conversation)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${isSelected
                        ? "bg-[#f6f5fb] text-[#28253c] font-medium ring-1 ring-inset ring-violet-200/10"
                        : "text-[#77748a] hover:bg-slate-100 hover:text-[#28253c]"
                      }`}
                  >
                    <MessageSquare size={15} className={`shrink-0 ${isSelected ? "text-[#655be8]" : "text-[#8b889b]"}`} />
                    <span className="truncate">{conversation.title || "New chat"}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="px-3 py-2 text-sm text-[#8b889b]">
              {conversationSearch ? "No matching conversations" : "No conversations yet"}
            </p>
          )}
        </div>}

        {collapsed && (
          <div className="flex flex-1 flex-col items-center gap-1 px-3 pt-2">
            {recentConversations.map((conversation) => {
              const isSelected = selectedChatId === conversation._id;
              return (
                <button
                  key={conversation._id}
                  type="button"
                  onClick={() => handleSelectConversation(conversation)}
                  title={conversation.title || "New chat"}
                  aria-label={conversation.title || "New chat"}
                  className={`grid h-10 w-10 place-items-center rounded-xl transition-colors ${isSelected
                      ? "bg-[#f6f5fb] text-[#655be8]"
                      : "text-[#8b889b] hover:bg-slate-100 hover:text-[#28253c]"
                    }`}
                >
                  <MessageSquare size={18} />
                </button>
              );
            })}
          </div>
        )}

        <div className="p-3 pt-0">
          <div className="mx-1 mb-4 border-t border-[#efedf5]" />
          {user ? (
            collapsed ? (
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCollapsed(false)}
                  title={`${name}${email ? `\n${email}` : ""}`}
                  aria-label="Expand profile"
                  className="relative grid h-10 w-10 place-items-center rounded-xl bg-slate-50 p-1 transition-all hover:bg-violet-500/[0.08] hover:ring-2 hover:ring-violet-200/20"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={name}
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
                    />
                  ) : (
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f6f5fb] text-xs font-semibold text-[#655be8]">
                      {initial}
                    </span>
                  )}
                  <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full border border-[#ffffff] bg-[#655be8]" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  title="Log out"
                  aria-label="Log out"
                  className="grid h-8 w-8 place-items-center rounded-lg text-[#8b889b] transition-colors hover:bg-slate-100 hover:text-rose-400"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-[#eceaf3] bg-white p-2 transition-colors hover:bg-[#fbfaff] hover:border-[#e4e0f0]">
                <div className="flex items-center gap-2">
                  <div className="relative shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={name}
                      className="h-7 w-7 rounded-full object-cover ring-1 ring-white/15"
                      />
                    ) : (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f6f5fb] text-[11px] font-bold text-[#655be8] shadow-sm ring-1 ring-violet-200/20">
                        {initial}
                      </span>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[#ffffff] bg-[#655be8]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-[#37344d] leading-tight" title={name}>
                      {name}
                    </p>
                    {email && (
                      <p className="mt-0.5 truncate text-[10px] text-[#77748a] leading-none" title={email}>
                        {email}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(true)}
                    title="Log out"
                    aria-label="Log out"
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-[#77748a] transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    <LogOut size={13} />
                  </button>
                </div>

                <div className="mt-1.5 flex items-center justify-between border-t border-[#efedf5] pt-1.5">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#56536b]">
                    <Coins size={12} className="shrink-0 text-[#77748a]" />
                    <span>Free plan</span>
                  </span>
                  <span className="rounded border border-[#e9e7f2]/10 bg-violet-500/[0.06] px-1.5 py-0.5 text-[9px] font-medium text-[#655be8]">
                    Active
                  </span>
                </div>
              </div>
            )
          ) : (
            <button
              type="button"
              title={collapsed ? "Sign up" : undefined}
              className={`mt-2 flex h-10 w-full items-center gap-3 rounded-xl bg-[#f6f5fb] px-3 text-sm font-medium text-[#28253c] transition-colors hover:bg-[#e9e7f3] ${collapsed ? "justify-center px-0" : ""}`}
            >
              <UserRound size={18} className="shrink-0" />
              {!collapsed && <span>Sign up</span>}
            </button>
          )}
        </div>

        {!collapsed && (
          <div
            role="separator"
            aria-orientation="vertical"
            onMouseDown={startSidebarResize}
            className="group absolute -right-1.5 top-0 z-50 hidden h-full w-3 cursor-col-resize lg:block"
          >
            <div
              className={`h-full w-0.5 mx-auto transition-colors ${isResizing ? "bg-[#655be8]" : "bg-transparent group-hover:bg-violet-500/25"
                }`}
            />
          </div>
        )}
      </aside>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#e9e7f2]/10 bg-[#ffffff] p-6 shadow-2xl shadow-black/50">
            <h2 className="text-base font-semibold text-[#28253c]">Log out of CortexAI?</h2>
            <p className="mt-2 text-sm leading-6 text-[#77748a]">
              You will need to sign in again to access your conversations.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#56536b] transition-colors hover:bg-slate-100 hover:text-[#28253c]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-[#28253c] transition-colors hover:bg-rose-400"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SideBar;
