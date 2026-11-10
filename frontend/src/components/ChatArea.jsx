import MessageList from './MessageList'
import ChatInput from './ChatInput'
import Nav from './Nav'
import { useEffect, useRef } from 'react'
import { PanelLeftOpen } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { setMessages } from '../redux/messageSlice'
import getMessages from '../features/getMessages'

const ChatArea = ({ onOpenSidebar }) => {
   const selectedConversation = useSelector(
        (state) => state.conversation.selectedConversation
    );
    const selectedConversationId = selectedConversation?._id;
    const messages = useSelector((state) => state.message.messages);
    const isEmptyChat = !selectedConversationId || messages.length === 0;
    const messagesRef = useRef(messages);
    const dispatch = useDispatch();
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    let isCurrentConversation = true;
    const pendingLocalMessages = messagesRef.current.filter((message) =>
      message._id?.startsWith('local-') && message.conversationId === selectedConversationId
    );
    dispatch(setMessages(pendingLocalMessages));

    if (!selectedConversationId) return undefined;

    const loadMessages = async () => {
      const data = await getMessages(selectedConversationId);
      if (!isCurrentConversation) return;

      const serverMessages = data?.message || [];
      const currentLocalMessages = messagesRef.current.filter((message) =>
        message._id?.startsWith('local-') && message.conversationId === selectedConversationId
      );
      const mergedMessages = [...serverMessages];

      const localMessages = new Map(
        [...pendingLocalMessages, ...currentLocalMessages].map((message) => [message._id, message])
      );
      localMessages.forEach((localMessage) => {
        const alreadySaved = serverMessages.some((serverMessage) =>
          serverMessage.role === localMessage.role && serverMessage.content === localMessage.content
        );
        if (!alreadySaved) mergedMessages.push(localMessage);
      });

      dispatch(setMessages(mergedMessages));
    };

    loadMessages();
    return () => {
      isCurrentConversation = false;
    };
  }, [dispatch, selectedConversationId]);
  return (
    <main className="chat-main relative flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <Nav onOpenSidebar={onOpenSidebar} />
        {isEmptyChat ? (
          <section className="flex min-h-0 flex-1 flex-col items-center justify-center">
            <button type="button" onClick={onOpenSidebar} aria-label="Open sidebar" title="Open sidebar" className="mobile-sidebar-trigger absolute left-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-xl border border-[#eceaf3] bg-white/90 text-[#655be8] shadow-sm backdrop-blur">
              <PanelLeftOpen size={19} />
            </button>
            <MessageList />
            <ChatInput />
          </section>
        ) : (
          <>
            <MessageList />
            <ChatInput />
          </>
        )}
    </main>
  )
}

export default ChatArea
