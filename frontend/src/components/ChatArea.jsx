import MessageList from './MessageList'
import ChatInput from './ChatInput'
import Nav from './Nav'
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setMessages } from '../redux/messageSlice'
import getMessages from '../features/getMessages'

const ChatArea = () => {
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
        <Nav />
        {isEmptyChat ? (
          <section className="flex min-h-0 flex-1 flex-col items-center justify-center">
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
