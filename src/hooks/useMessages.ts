import { useState, useEffect } from 'react';
import { chatSocket } from '../services/chat.service';
import { useLazyGetConversationMessagesQuery } from '~/api/chatApi';

export const useMessages = (conversationId: string | null) => {
  const [trigger] = useLazyGetConversationMessagesQuery();
  const [messages, setMessages] = useState<any[]>([]);

  const loadMessages = async () => {
    if (messages.length < 1) {
      try {
        const result = await trigger().unwrap();
        if (result?.data) {
          setMessages(result.data.messages);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    loadMessages();
    // Subscribe to new messages
    const unsubscribe = chatSocket.subscribeToMessages((message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
      setMessages([]);
    };
  }, [conversationId]);

  return messages;
};
