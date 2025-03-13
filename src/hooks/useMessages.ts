import { useState, useEffect, useCallback } from 'react';
import { chatSocket } from '../services/chat.service';
import { useLazyGetConversationMessagesQuery } from '~/api/chatApi';

export const useMessages = (conversationId: string | null) => {
  const [trigger] = useLazyGetConversationMessagesQuery();
  const [messages, setMessages] = useState<any[]>([]);

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    
    try {
      const result = await trigger(conversationId).unwrap();
      if (result?.data) {
        setMessages(result.data.messages);
      }
    } catch (e) {
      console.error(e);
    }
  }, [conversationId, trigger]);

  useEffect(() => {
    setMessages([]); // Reset messages when conversation changes
    
    if (!conversationId) {
      return;
    }
    
    loadMessages();
    
    // Subscribe to new messages
    const unsubscribe = chatSocket.subscribeToMessages((message) => {
      // alert(JSON.stringify(message));
      // if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
      // }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [conversationId, loadMessages]);

  return messages;
};