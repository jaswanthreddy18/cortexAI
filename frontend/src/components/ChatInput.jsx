import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  Check,
  Code2,
  Eye,
  FileText,
  Mic,
  MessageSquare,
  Presentation,
  Plus,
  Search,
  Square,
  Sparkles,
} from 'lucide-react';
import sendMessage from '../features/sendMessage';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setIsSending as setMessageSending } from '../redux/messageSlice';
import { createConversation } from '../features/createConversation';
import { addConversation, setSelectedConversation, updateConversationTitle } from '../redux/conversationSlice';

const AGENTS = [
  { id: 'auto', name: 'Auto', description: 'Choose the best agent', icon: Sparkles, color: '#655be8' },
  { id: 'chat', name: 'Chat', description: 'General conversations', icon: MessageSquare, color: '#655be8' },
  { id: 'coding', name: 'Coding', description: 'Code, debug, and explain', icon: Code2, color: '#635be0' },
  { id: 'pdf', name: 'PDF', description: 'Read and work with PDFs', icon: FileText, color: '#635be0' },
  { id: 'ppt', name: 'Presentation', description: 'Create presentations', icon: Presentation, color: '#635be0' },
  { id: 'search', name: 'Search', description: 'Find information online', icon: Search, color: '#635be0' },
  { id: 'vision', name: 'Vision', description: 'Create images from prompts', icon: Eye, color: '#655be8' },
];

const makeFallbackTitle = (prompt) => {
  const topic = prompt
    .replace(/^(?:please\s+)?(?:can|could|would)\s+you\s+/i, '')
    .replace(/^(?:please\s+)?(?:give|show|write|create|make|explain|tell)\s+(?:me\s+)?/i, '')
    .replace(/[?!.,]+$/, '')
    .trim();
  const title = (topic || prompt).split(/\s+/).slice(0, 6).join(' ');
  return title.charAt(0).toUpperCase() + title.slice(1);
};

const ChatInput = () => {
  const [message, setMessage] = useState('');
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('chat');
  const [agentOverride, setAgentOverride] = useState('Chat');
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState('');
  const composerRef = useRef(null);
  const requestControllerRef = useRef(null);
  const submitInProgressRef = useRef(false);
  const speechRecognitionRef = useRef(null);
  const activeAgent = AGENTS.find(({ id }) => id === selectedAgent);
  const selectedConversation = useSelector(
        (state) => state.conversation.selectedConversation
    );
  const dispatch = useDispatch();
  const handleChange = (event) => {
    setMessage(event.target.value);
  };
  const toggleRecording = () => {
    if (isRecording) {
      speechRecognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError('Voice input is not supported in this browser. Try Chrome.');
      return;
    }

    setMicError('');
    const recognition = new SpeechRecognition();
    recognition.lang = navigator.language || 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      const spokenText = Array.from(event.results)
        .slice(event.resultIndex)
        .filter((result) => result.isFinal)
        .map((result) => result[0].transcript.trim())
        .filter(Boolean)
        .join(' ');

      if (spokenText) {
        setMessage((current) => [current.trim(), spokenText].filter(Boolean).join(' '));
      }
    };
    recognition.onerror = (event) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setMicError(event.error === 'not-allowed'
          ? 'Allow microphone access to use voice input.'
          : 'Voice input stopped. Please try again.');
      }
      setIsRecording(false);
    };
    recognition.onend = () => {
      setIsRecording(false);
      if (speechRecognitionRef.current === recognition) speechRecognitionRef.current = null;
    };
    speechRecognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      speechRecognitionRef.current = null;
      setIsRecording(false);
      setMicError('Could not start voice input. Please try again.');
    }
  };
  const handleSelectAgent = (agentName) => {
    const agent = AGENTS.find(({ name }) => name === agentName);
    if (!agent) return;

    setSelectedAgent(agent.id);
    setAgentOverride(agent.name);
    setIsAgentMenuOpen(false);
  };
  const handleSubmit = async () => {
    const prompt = message.trim();
    if (!prompt || isSending || submitInProgressRef.current) return;

    submitInProgressRef.current = true;
    let controller = null;
    try {
      let conversation = selectedConversation;
      let isNewConversation = false;
      if (!conversation?._id) {
        const data = await createConversation();
        conversation = data?.conversation;
        if (!conversation?._id) return;
        isNewConversation = true;
      }
      const shouldGenerateTitle = conversation.title === 'New Chat';

      const payload = {
        prompt,
        conversationId: conversation._id,
        generateTitle: shouldGenerateTitle,
        ...(agentOverride ? { agent: agentOverride.toLowerCase() } : {}),
      };
      dispatch(addMessage({
        _id: `local-user-${Date.now()}`,
        conversationId: conversation._id,
        role: 'user',
        content: prompt,
        createdAt: new Date().toISOString(),
      }));
      if (isNewConversation) {
        dispatch(addConversation(conversation));
        dispatch(setSelectedConversation(conversation));
      }
      setMessage('');
      setIsSending(true);
      dispatch(setMessageSending(true));
      controller = new AbortController();
      requestControllerRef.current = controller;

      const data = await sendMessage(payload, controller.signal);
      // A stopped request may finish on the server later. Never let its result
      // update this chat after another request has started.
      if (controller.signal.aborted || requestControllerRef.current !== controller) return;
      const responseText = data?.answer
        ?? data?.message
        ?? (data?.error ? `I couldn't complete that request: ${data.error}` : null);
      if (shouldGenerateTitle) {
        const title = data?.title || makeFallbackTitle(prompt);
        const updatedConversation = { ...conversation, title };
        dispatch(setSelectedConversation(updatedConversation));
        dispatch(updateConversationTitle({ id: conversation._id, title }));
      }
      if (responseText || data?.images?.length) {
        dispatch(addMessage({
          _id: `local-assistant-${Date.now()}`,
          conversationId: conversation._id,
          role: 'assistant',
          content: responseText ?? '',
          images: data.images ?? [],
          pdfAttachment: data.pdfAttachment,
          pptAttachment: data.pptAttachment,
          createdAt: new Date().toISOString(),
        }));
      }
    } finally {
      // An older, aborted submit must not clear the sending state of a newer one.
      if (!controller || requestControllerRef.current === controller) {
        requestControllerRef.current = null;
        submitInProgressRef.current = false;
        setIsSending(false);
        dispatch(setMessageSending(false));
      }
    }
  }

  const handleStop = () => {
    const controller = requestControllerRef.current;
    if (!controller) return;

    // Release the composer immediately so the user can submit a new prompt.
    requestControllerRef.current = null;
    submitInProgressRef.current = false;
    setIsSending(false);
    dispatch(setMessageSending(false));
    controller.abort();
  };


  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!composerRef.current?.contains(event.target)) setIsAgentMenuOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  useEffect(() => () => speechRecognitionRef.current?.stop(), []);

  return (
    <div className="w-full px-4 pb-6 pt-3 sm:px-8" style={{ paddingBottom: '24px' }}>
      <div
        ref={composerRef}
        className="chat-composer mx-auto w-full px-3 py-2 sm:px-4 sm:py-2.5"
        style={{
          position: 'relative',
          maxWidth: '920px',
          borderRadius: '18px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(250, 249, 255, 0.98))',
          border: '1px solid rgba(125, 113, 210, 0.16)',
          boxShadow: '0 22px 60px -34px rgba(115, 105, 210, 0.22), inset 0 1px rgba(255,255,255,0.9)',
        }}
      >
          <textarea
            aria-label="Message"
            value={message}
            onChange={handleChange}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Message CortexAI"
            rows={2}
            className="block max-h-40 min-h-12 w-full border-0 bg-transparent px-1 py-1 text-[15px] leading-6 text-[#28253c] outline-none ring-0 placeholder:text-[17px] placeholder:font-light placeholder:text-[#8b889b] focus:border-0 focus:outline-none focus:ring-0"
            style={{ resize: 'none', padding: '10px 12px 4px' }}
          />
          {(isRecording || micError) && (
            <div className={`px-3 pb-2 text-xs ${micError ? 'text-rose-600' : 'text-[#655be8]'}`} role={micError ? 'alert' : 'status'}>
              {micError || (
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="flex h-3 items-center gap-0.5">
                    {[0, 1, 2, 3, 4].map((bar) => (
                      <span
                        key={bar}
                        className="w-0.5 rounded-full bg-current animate-pulse"
                        style={{ height: `${6 + (bar % 3) * 3}px`, animationDelay: `${bar * 100}ms` }}
                      />
                    ))}
                  </span>
                  Listening… speak now, then press the microphone to stop.
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pb-0.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsAgentMenuOpen((open) => !open)}
                aria-label="Choose an agent"
                aria-expanded={isAgentMenuOpen}
                aria-haspopup="menu"
                title="Choose an agent"
                className="grid h-8 w-8 place-items-center rounded-full text-[#77748a] transition-colors hover:bg-violet-500/[0.08] hover:text-[#28253c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#655be8]"
              >
                <Plus size={18} className={isAgentMenuOpen ? 'rotate-45 transition-transform' : 'transition-transform'} />
              </button>
              {selectedAgent !== 'chat' && activeAgent && (
                <span
                  aria-label={`${activeAgent.name} agent selected`}
                  title={`${activeAgent.name} agent`}
                  className="grid h-7 w-7 place-items-center rounded-full bg-violet-500/[0.08]"
                  style={{ color: activeAgent.color }}
                >
                  <activeAgent.icon size={15} strokeWidth={2} />
                </span>
              )}
              {isAgentMenuOpen && (
                <div
                  role="menu"
                  aria-label="Choose an agent"
                  className="absolute left-0 z-20 w-[260px] max-w-[min(260px,calc(100vw-40px))] rounded-2xl p-1 shadow-2xl shadow-black/40"
                  style={{
                    bottom: 'calc(100% + 12px)',
                    background: '#ffffff',
                    border: '1px solid rgba(121, 111, 180, 0.18)',
                  }}
                >
                  {AGENTS.map(({ id, name, icon: Icon, color }) => (
                    <button
                      key={id}
                      type="button"
                      role="menuitemradio"
                      aria-checked={selectedAgent === id}
                      onClick={() => handleSelectAgent(name)}
                      className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-left transition-colors hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none"
                    >
                      <span
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-violet-500/[0.06]"
                        style={{ color }}
                      >
                        <Icon size={15} strokeWidth={2} />
                      </span>
                      <span className="min-w-0 truncate text-xs font-medium text-[#28253c]">{name}</span>
                      {selectedAgent === id && <Check size={14} className="shrink-0 text-[#655be8]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={isRecording ? 'Stop voice input' : 'Start voice input'}
                title={isRecording ? 'Stop voice input' : 'Start voice input'}
                aria-pressed={isRecording}
                onClick={toggleRecording}
                className={`relative grid h-8 w-8 place-items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#655be8] ${isRecording ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' : 'text-[#77748a] hover:bg-violet-500/[0.08] hover:text-[#28253c]'}`}
              >
                {isRecording && <span aria-hidden="true" className="absolute inset-0 rounded-full bg-rose-300/50 animate-ping" />}
                {isRecording ? <Square size={13} fill="currentColor" /> : <Mic size={16} />}
              </button>
              {isSending ? (
                <button
                  type="button"
                  aria-label="Stop generating response"
                  title="Stop response"
                  onClick={handleStop}
                  className="grid h-8 w-8 place-items-center rounded-full bg-rose-500 text-white shadow-[0_0_18px_rgba(244,63,94,0.28)] transition-colors hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  <Square size={13} fill="currentColor" />
                </button>
              ) : (
                <button
                  type="button"
                  aria-label="Send message"
                  title="Send message"
                  onClick={handleSubmit}
                  disabled={!message.trim()}
                  className="grid h-8 w-8 place-items-center rounded-full bg-[#655be8] text-white shadow-[0_0_20px_rgba(101,91,232,0.18)] transition-colors hover:bg-[#8178f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#655be8] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowUp size={16} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
      </div>
    </div>
  );
};

export default ChatInput;
